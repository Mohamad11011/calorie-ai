import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { spawn } from "child_process";
import foodCalories from "@/utils/foodCalories";
import os from "os";
import { getCaloriesFromUSDA } from "@/utils/getCaloriesFromUSDA";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const reference = formData.get("reference") as string;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // if (!reference) {
    //   return NextResponse.json(
    //     { error: 'Reference object is required. Please select a reference object (coin, credit card, or hand) and try again.' },
    //     { status: 400 }
    //   );
    // }

    // Save the uploaded image temporarily
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const path = join(os.tmpdir(), image.name);
    await writeFile(path, buffer);

    // 1. Detect food type
    const foodProcess = spawn("python", ["src/scripts/estimate.py", path]);
    let foodOutput = "";
    let foodError = "";
    await new Promise((resolve) => {
      foodProcess.stdout.on("data", (data) => {
        foodOutput += data.toString();
      });
      foodProcess.stderr.on("data", (data) => {
        foodError += data.toString();
      });
      foodProcess.on("close", resolve);
    });
    const { predictions } = JSON.parse(foodOutput);
    const topFood = predictions[0]?.label;

    function getDensityFromLabel(label: string) {
      label = label.toLowerCase();

      if (label.includes("egg")) return 0.3;
      if (
        label.includes("steak") ||
        label.includes("meat") ||
        label.includes("chicken")
      )
        return 0.6;
      if (
        label.includes("apple") ||
        label.includes("banana") ||
        label.includes("vegetable")
      )
        return 0.25;
      // Add more as needed

      return 0.3;
    }

    // 2. Segment and estimate portion size
    const density = getDensityFromLabel(topFood);

    const segProcess = spawn("python", [
      "src/scripts/segment_and_estimate.py",
      path,
      "src/models/u2net.pth",
      "--density",
      density.toString(),
    ]);

    let segOutput = "";
    let segError = "";
    await new Promise((resolve) => {
      segProcess.stdout.on("data", (data) => {
        segOutput += data.toString();
      });
      segProcess.stderr.on("data", (data) => {
        segError += data.toString();
      });
      segProcess.on("close", resolve);
    });

    console.log("Raw segOutput:", segOutput);
    console.log("Raw segError:", segError);

    if (!segOutput) {
      throw new Error("No output received from segmentation script");
    }

    try {
      const segResult = JSON.parse(segOutput);

      const estimatedGrams = segResult.estimated_grams;
      let usdaNutrition: any = null;
      // 3. Lookup calories per 100g
      let dataPer100g = foodCalories[topFood?.toLowerCase()] ?? null;
      if (!dataPer100g || dataPer100g === 0) {
        const usdaCalories = await getCaloriesFromUSDA(topFood);
        dataPer100g = usdaCalories ?? 0;
      }

      console.log("grams: ", estimatedGrams);

      const totalCalories =
        dataPer100g && estimatedGrams
          ? (dataPer100g * estimatedGrams) / 100
          : null;

      return NextResponse.json({
        result: [
          {
            name: topFood,
            confidence: predictions[0]?.confidence,
            estimated_grams: estimatedGrams,
            dataPer100g: dataPer100g,
            nutrition: usdaNutrition,
            segmentation: segResult,
          },
        ],
      });
    } catch (parseError) {
      console.error("Failed to parse segOutput:", parseError);
      console.error("segOutput content:", segOutput);
      throw parseError;
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: error?.toString() },
      { status: 500 }
    );
  }
}
