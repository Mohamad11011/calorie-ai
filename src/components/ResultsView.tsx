import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getKeyNutrients, getPortionReference } from "@/utils/NutrientHelper";
import { Camera, Loader2 } from "lucide-react";
import NutrientTable from "./NutrientTable";


const ResultsView = ({ result, loading, previewUrl, handleReset }: any) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
        <p className="mt-4 text-2xl text-gray-700 font-semibold">
          Analyzing your food...
        </p>
        <p className="text-gray-500">AI magic in progress!</p>
      </div>
    );
  }

  const item = result[0];
  if (!item) return null;

  const keyNutrients = getKeyNutrients(item.dataPer100g);
  const totalCalories = item.estimated_grams
    ? ((item.dataPer100g.calories.value * item.estimated_grams) / 100).toFixed(
        0
      )
    : item.dataPer100g.calories.value.toFixed(0);

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-4xl font-bold text-gray-800">Your Analysis</h2>
        <button
          onClick={handleReset}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
        >
          Analyze Another
        </button>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left Panel: Image */}
        <div className="lg:col-span-2">
          <img
            src={previewUrl}
            alt="Food preview"
            className="rounded-3xl shadow-xl w-full h-auto object-cover"
          />
        </div>

        {/* Right Panel: The Unified Report Card */}
        <div className="lg:col-span-3 bg-white/95 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-xl">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Camera className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 capitalize">
              {item.name}
            </h3>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-1.5 mb-6">
            <div
              className="bg-blue-600 h-1.5 rounded-full"
              style={{ width: `${(item.confidence || 0) * 100}%` }}
            ></div>
          </div>

          {/* HERO METRIC: Total Calories */}
          <div>
            <p className="text-lg text-gray-600">Calories for this portion</p>
            <p className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 my-1">
              {totalCalories}
            </p>
            {item.estimated_grams && (
              <p className="text-gray-500 font-medium">
                {`Based on estimated weight of ${item.estimated_grams.toFixed(
                  0
                )}g (${getPortionReference(item.estimated_grams)})`}
              </p>
            )}
          </div>

          <hr className="my-6" />

          {/* KEY MACROS */}
          <div className="grid grid-cols-3 gap-4 text-center mb-8">
            {keyNutrients
              .filter((k) => k[0] !== "calories")
              .map(([key, nutrientValue]) => {
                const nutrient = nutrientValue as any;
                const scaledValue = item.estimated_grams
                  ? (nutrient.value * item.estimated_grams) / 100
                  : nutrient.value;
                return (
                  <div key={key}>
                    <p className="text-sm text-gray-500 font-semibold capitalize">
                      {key}
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {scaledValue.toFixed(1)}
                      <span className="text-lg text-gray-600">g</span>
                    </p>
                  </div>
                );
              })}
          </div>

          {/* DETAILED NUTRITION with TABS */}
          <Tabs defaultValue="portion" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-100 rounded-xl p-1">
              <TabsTrigger value="portion" className="rounded-lg font-semibold">
                This Portion
              </TabsTrigger>
              <TabsTrigger
                value="reference"
                className="rounded-lg font-semibold"
              >
                Per 100g
              </TabsTrigger>
            </TabsList>
            <TabsContent value="portion">
              <NutrientTable
                data={item.dataPer100g}
                scale={item.estimated_grams ? item.estimated_grams / 100 : 1}
              />
            </TabsContent>
            <TabsContent value="reference">
              <NutrientTable data={item.dataPer100g} scale={1} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;
