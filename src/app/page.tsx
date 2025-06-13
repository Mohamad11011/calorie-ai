"use client";
import { useState } from "react";
import {
  Upload,
  Camera,
  Zap,
  Target,
  Scale,
  TrendingUp,
  Loader2,
  Flame,
  Droplets,
  Dumbbell,
  Candy,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ResultsView from "@/components/ResultsView";
import UploadView from "@/components/UploadView";

interface FoodItem {
  name: string;
  calories: number | null;
  confidence?: number;
  total_calories?: number | null;
  estimated_grams?: number | null;
  dataPer100g?: any;
  nutrition?: any;
}

function getPortionReference(grams: number): string {
  if (grams <= 30) return "About 2 tablespoons";
  if (grams <= 60) return "About 1/4 cup";
  if (grams <= 120) return "About 1/2 cup";
  if (grams <= 240) return "About 1 cup";
  if (grams <= 480) return "About 2 cups";
  return "More than 2 cups";
}

const Index = () => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [result, setResult] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [reference, setReference] = useState<string>("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult([]);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!image) return;

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("image", image);
      formData.append("reference", reference);

      const response = await fetch("/api/estimate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }

      const data = await response.json();
      setResult(
        (data.result || []).map((item: any) => ({
          name: item.label || item.name,
          confidence: item.confidence ?? null,
          estimated_grams: item.estimated_grams ?? null,
          dataPer100g: item.dataPer100g ?? null,
          total_calories: item.total_calories ?? null,
          nutrition: item.nutrition ?? null,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getNutrientIcon = (key: string) => {
    switch (key.toLowerCase()) {
      case "calories":
        return <Flame className="w-5 h-5 text-orange-500" />;
      case "fat":
        return <Droplets className="w-5 h-5 text-yellow-500" />;
      case "protein":
        return <Dumbbell className="w-5 h-5 text-red-500" />;
      case "sugar":
        return <Candy className="w-5 h-5 text-pink-500" />;
      default:
        return <TrendingUp className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNutrientColor = (key: string) => {
    switch (key.toLowerCase()) {
      case "calories":
        return "from-orange-100 to-red-100 border-orange-200";
      case "fat":
        return "from-yellow-100 to-amber-100 border-yellow-200";
      case "protein":
        return "from-red-100 to-pink-100 border-red-200";
      case "sugar":
        return "from-pink-100 to-purple-100 border-pink-200";
      default:
        return "from-gray-100 to-slate-100 border-gray-200";
    }
  };

  const getKeyNutrients = (data: any) => {
    const keyNutrients = ["calories", "fat", "protein", "sugar"];
    return Object.entries(data).filter(([key]) =>
      keyNutrients.includes(key.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-40 left-40 w-60 h-60 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Conditionally render views */}
        {result.length === 0 && !loading ? (
          <UploadView
            handleImageChange={handleImageChange}
            previewUrl={previewUrl}
            handleUpload={handleUpload}
            image={image}
            error={error}
          />
        ) : (
          <ResultsView
            result={result}
            loading={loading}
            previewUrl={previewUrl}
            // Add a function to reset the state and go back to the upload view
            handleReset={() => {
              setResult([]);
              setImage(null);
              setPreviewUrl("");
              setError("");
            }}
            getNutrientIcon={getNutrientIcon}
            getNutrientColor={getNutrientColor}
            getKeyNutrients={getKeyNutrients}
            getPortionReference={getPortionReference}
          />
        )}
      </div>

      {/* Hero Section */}
      {/* <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-2xl opacity-25 group-hover:opacity-40 transition duration-500 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white p-5 rounded-full shadow-2xl transform group-hover:scale-110 transition duration-300">
                  <Zap className="w-10 h-10" />
                </div>
              </div>
            </div>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-8 animate-fade-in">
              Calorie AI
            </h1>
            <p
              className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              Transform any food photo into detailed nutritional insights with
              our advanced AI analysis
            </p>
          </div>
        </div>
      </div> */}

      {/* <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
   
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <div
              className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 hover:shadow-3xl transition-all duration-500 animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="space-y-8">
               
                <div className="relative">
                  <label className="group block cursor-pointer">
                    <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-gray-300 hover:border-purple-400 transition-all duration-300 bg-gradient-to-br from-gray-50 to-white group-hover:from-purple-50 group-hover:to-blue-50">
                      {!previewUrl ? (
                        <div className="h-80 flex flex-col items-center justify-center p-8 text-center">
                          <div className="relative mb-6">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full blur-lg opacity-20 group-hover:opacity-30 transition duration-300"></div>
                            <div className="relative bg-gradient-to-r from-purple-500 to-blue-500 text-white p-6 rounded-full transform group-hover:scale-110 transition duration-300">
                              <Upload className="w-12 h-12" />
                            </div>
                          </div>
                          <h3 className="text-2xl font-semibold text-gray-800 mb-3 group-hover:text-purple-700 transition duration-300">
                            Drop your food image here
                          </h3>
                          <p className="text-gray-600 mb-6 max-w-sm group-hover:text-gray-700 transition duration-300">
                            Or click to browse and select a delicious photo from
                            your device
                          </p>
                          <div className="flex flex-wrap gap-2 justify-center text-xs text-gray-500">
                            <span className="bg-gray-100 px-3 py-1 rounded-full">
                              JPG
                            </span>
                            <span className="bg-gray-100 px-3 py-1 rounded-full">
                              PNG
                            </span>
                            <span className="bg-gray-100 px-3 py-1 rounded-full">
                              WEBP
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="relative h-80">
                          <img
                            src={previewUrl}
                            alt="Food preview"
                            className="w-full h-full object-cover rounded-3xl transition-transform duration-300 group-hover:scale-105"
                          />

                          {loading && (
                            <div className="absolute inset-0 bg-black/60 rounded-3xl flex items-center justify-center">
                              <div className="absolute inset-0 overflow-hidden rounded-3xl">
                                <div
                                  className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80 animate-pulse"
                                  style={{ top: "15%", animationDelay: "0s" }}
                                ></div>
                                <div
                                  className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-60 animate-pulse"
                                  style={{ top: "35%", animationDelay: "0.7s" }}
                                ></div>
                                <div
                                  className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80 animate-pulse"
                                  style={{ top: "55%", animationDelay: "1.4s" }}
                                ></div>
                                <div
                                  className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent opacity-60 animate-pulse"
                                  style={{ top: "75%", animationDelay: "2.1s" }}
                                ></div>
                              </div>

                              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/50 max-w-sm mx-4">
                                <div className="flex items-center space-x-4 mb-4">
                                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                                  <div>
                                    <p className="text-xl font-bold text-gray-900">
                                      Analyzing Food
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      AI magic in progress...
                                    </p>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                      Identifying ingredients
                                    </span>
                                    <span className="text-green-600 font-medium">
                                      ✓
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                      Calculating portions
                                    </span>
                                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">
                                      Nutrition analysis
                                    </span>
                                    <span className="text-gray-400">⏳</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>

          
                {image && !loading && (
                  <div className="flex justify-center animate-fade-in">
                    <button
                      onClick={handleUpload}
                      className="group relative bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 text-white font-bold py-4 px-12 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                    >
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="w-6 h-6" />
                        <span className="text-lg">Analyze Food</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </div>
                )}

              
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 rounded-xl p-6 animate-fade-in">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <p className="text-red-800 font-medium text-lg">
                        {error}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

     
            <div
              className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100 animate-fade-in"
              style={{ animationDelay: "0.6s" }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <Camera className="w-7 h-7 text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-900">
                  Photography Tips
                </h3>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center space-x-2 text-lg">
                    <Target className="w-5 h-5 text-green-600" />
                    <span>Best Results</span>
                  </h4>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Well-lit, clear food image</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Include plate/utensils for scale</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Minimize shadows & glare</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center space-x-2 text-lg">
                    <Scale className="w-5 h-5 text-purple-600" />
                    <span>Size Reference</span>
                  </h4>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex justify-between">
                      <span>1 cup</span>
                      <span className="text-purple-600 font-medium">
                        Baseball
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span>1/2 cup</span>
                      <span className="text-purple-600 font-medium">
                        Tennis ball
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span>1/4 cup</span>
                      <span className="text-purple-600 font-medium">
                        Large egg
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:sticky lg:top-8 space-y-6">
            {result.length > 0 && (
              <div className="animate-fade-in">
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
                    Analysis Complete
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Here's what our AI discovered
                  </p>
                </div>

                {(() => {
                  const item = result[0];
                  return (
                    <div className="space-y-6">
                  
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 border border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center space-x-4 mb-6">
                          <div className="bg-blue-500 p-3 rounded-xl shadow-lg">
                            <Camera className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-blue-900">
                            Food Identification
                          </h3>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-3xl font-bold text-blue-800 mb-3">
                              {item.name}
                            </p>
                            <div className="flex items-center space-x-3">
                              <div className="flex-1 bg-blue-200 rounded-full h-3">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 shadow-sm"
                                  style={{
                                    width:
                                      item.confidence !== undefined &&
                                      item.confidence !== null
                                        ? `${item.confidence * 100}%`
                                        : "0%",
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-bold text-blue-700 min-w-fit">
                                {item.confidence !== undefined &&
                                item.confidence !== null
                                  ? `${(item.confidence * 100).toFixed(1)}%`
                                  : "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

             
                      <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 border border-emerald-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center space-x-4 mb-6">
                          <div className="bg-emerald-500 p-3 rounded-xl shadow-lg">
                            <Scale className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-emerald-900">
                            Portion Analysis
                          </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="text-center">
                            <p className="text-sm text-emerald-700 mb-2 font-medium">
                              Estimated Weight
                            </p>
                            <p className="text-4xl font-bold text-emerald-800">
                              {item.estimated_grams
                                ? `${item.estimated_grams.toFixed(0)}`
                                : "N/A"}
                            </p>
                            <p className="text-emerald-600 font-medium">
                              grams
                            </p>
                            <p className="text-sm text-emerald-600 mt-1">
                              {item.estimated_grams
                                ? `≈ ${(item.estimated_grams / 28.35).toFixed(
                                    1
                                  )} oz`
                                : ""}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-emerald-700 mb-2 font-medium">
                              Visual Reference
                            </p>
                            <div className="bg-emerald-100 rounded-xl p-4">
                              <p className="text-lg font-bold text-emerald-800">
                                {item.estimated_grams
                                  ? getPortionReference(item.estimated_grams)
                                  : "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                     
                      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center space-x-4 mb-6">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl shadow-lg">
                            <TrendingUp className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            Nutritional Breakdown
                          </h3>
                        </div>

                        {item.dataPer100g ? (
                          <Tabs defaultValue="portion" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 rounded-xl p-1">
                              <TabsTrigger
                                value="portion"
                                className="rounded-lg font-semibold"
                              >
                                This Portion
                              </TabsTrigger>
                              <TabsTrigger
                                value="reference"
                                className="rounded-lg font-semibold"
                              >
                                Per 100g
                              </TabsTrigger>
                            </TabsList>

                            <TabsContent value="portion" className="space-y-4">
                              {item.estimated_grams ? (
                                <div className="grid grid-cols-2 gap-4">
                                  {getKeyNutrients(item.dataPer100g).map(
                                    ([key, nutrientValue]) => {
                                      const nutrient = nutrientValue as {
                                        value: number;
                                        unit: string;
                                      };
                                      const scaledValue =
                                        (nutrient.value *
                                          item.estimated_grams!) /
                                        100;
                                      const displayName =
                                        key.toLowerCase() === "energy"
                                          ? "Calories"
                                          : key;
                                      return (
                                        <div
                                          key={key}
                                          className={`bg-gradient-to-br ${getNutrientColor(
                                            key
                                          )} rounded-2xl p-6 border-2 transform hover:scale-105 transition-all duration-300 shadow-lg`}
                                        >
                                          <div className="flex items-center space-x-3 mb-3">
                                            {getNutrientIcon(key)}
                                            <p className="text-sm font-bold text-gray-700 capitalize">
                                              {displayName}
                                            </p>
                                          </div>
                                          <p className="text-3xl font-bold text-gray-900">
                                            {scaledValue.toFixed(
                                              key.toLowerCase() === "energy"
                                                ? 0
                                                : 1
                                            )}
                                          </p>
                                          <p className="text-sm text-gray-600 font-medium">
                                            {key.toLowerCase() === "energy"
                                              ? "kcal"
                                              : nutrient.unit.toLowerCase()}
                                          </p>
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              ) : (
                                <div className="text-center py-8">
                                  <p className="text-xl font-bold text-gray-600">
                                    Portion data unavailable
                                  </p>
                                  <p className="text-gray-500 mt-2">
                                    Need weight estimation for portion
                                    calculation
                                  </p>
                                </div>
                              )}
                            </TabsContent>

                            <TabsContent
                              value="reference"
                              className="space-y-4"
                            >
                              <div className="grid grid-cols-2 gap-4">
                                {getKeyNutrients(item.dataPer100g).map(
                                  ([key, nutrientValue]) => {
                                    const nutrient = nutrientValue as {
                                      value: number;
                                      unit: string;
                                    };
                                    const displayName =
                                      key.toLowerCase() === "energy"
                                        ? "Calories"
                                        : key;
                                    return (
                                      <div
                                        key={key}
                                        className={`bg-gradient-to-br ${getNutrientColor(
                                          key
                                        )} rounded-2xl p-6 border-2 transform hover:scale-105 transition-all duration-300 shadow-lg`}
                                      >
                                        <div className="flex items-center space-x-3 mb-3">
                                          {getNutrientIcon(key)}
                                          <p className="text-sm font-bold text-gray-700 capitalize">
                                            {displayName}
                                          </p>
                                        </div>
                                        <p className="text-3xl font-bold text-gray-900">
                                          {key.toLowerCase() === "energy"
                                            ? nutrient.value.toFixed(0)
                                            : nutrient.value}
                                        </p>
                                        <p className="text-sm text-gray-600 font-medium">
                                          {key.toLowerCase() === "energy"
                                            ? "kcal"
                                            : nutrient.unit.toLowerCase()}
                                        </p>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                              <div className="bg-gray-50 rounded-xl p-4 mt-4">
                                <p className="text-sm text-gray-600 text-center font-medium">
                                  Reference values per 100g of{" "}
                                  {item.name.toLowerCase()}
                                </p>
                              </div>
                            </TabsContent>
                          </Tabs>
                        ) : (
                          <div className="text-center py-12">
                            <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                              <TrendingUp className="w-12 h-12 text-gray-400" />
                            </div>
                            <p className="text-2xl font-bold text-gray-600 mb-2">
                              Nutritional data unavailable
                            </p>
                            <p className="text-gray-500">
                              Try analyzing a different food item
                            </p>
                          </div>
                        )}
                      </div>

                  
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-2xl p-6">
                        <div className="flex items-start space-x-3">
                          <div className="bg-amber-400 p-2 rounded-lg flex-shrink-0">
                            <Target className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-amber-800 mb-2">
                              Important Notice
                            </h4>
                            <p className="text-sm text-amber-700 leading-relaxed">
                              These AI-generated estimates are for informational
                              purposes only. For precise nutritional
                              information, especially for dietary restrictions
                              or medical needs, please consult with a qualified
                              nutritionist or refer to official food databases.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Index;
