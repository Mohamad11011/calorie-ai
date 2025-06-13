// src/utils/getCaloriesFromUSDA.ts

const IMPORTANT_NUTRIENTS = [
  "Energy",
  "Protein",
  "Total lipid (fat)",
  "Carbohydrate, by difference",
  "Cholesterol",
  "Sodium, Na",
  "Total Sugars",
  "Fiber, total dietary",
];

// Map USDA nutrient names to simpler keys for usage/display
export const NUTRIENT_KEY_MAP: Record<string, string> = {
  Energy: "calories",
  Protein: "protein",
  "Total lipid (fat)": "fat",
  "Carbohydrate, by difference": "carbohydrate",
  Cholesterol: "cholesterol",
  "Sodium, Na": "sodium",
  "Total Sugars": "sugar",
  "Fiber, total dietary": "fiber",
};

export async function getCaloriesFromUSDA(
  foodName: string
): Promise<Record<string, { value: number; unit: string }> | null> {
  const apiKey = "QMVjnFYg4n9qRFH2NrlpsvIds3xYYblyS0abldSS";
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(
    foodName.replace("_", " ")
  )}&api_key=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const food = data.foods?.[0];

    // console.log(
    //   "USDA API response for",
    //   foodName.replace("_", " "),
    //   ":",
    //   JSON.stringify(data, null, 2)
    // );

    if (!food || !food.foodNutrients) return null;

    const rawNutrients: Record<string, { value: number; unit: string }> = {};

    for (const n of food.foodNutrients) {
      if (IMPORTANT_NUTRIENTS.includes(n.nutrientName)) {
        rawNutrients[n.nutrientName] = {
          value: n.value,
          unit: n.unitName,
        };
      }
    }

    if (!Object.keys(rawNutrients).length) return null;

    // Apply key mapping before returning
    const mappedNutrients: Record<string, { value: number; unit: string }> = {};
    for (const [key, val] of Object.entries(rawNutrients)) {
      const mappedKey = NUTRIENT_KEY_MAP[key] ?? key.toLowerCase();
      mappedNutrients[mappedKey] = val;
    }

    return mappedNutrients;
  } catch {
    return null;
  }
}
