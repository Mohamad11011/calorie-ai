import { Loader2, TrendingUp, Upload } from "lucide-react";
import React from "react";

const UploadView = ({
  handleImageChange,
  previewUrl,
  handleUpload,
  loading,
  image,
  error,
}: any) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      {/* ... Hero Section code (h1, p tags, Zap icon) ... */}

      {/* Simplified Upload Card */}
      <div className="w-full max-w-2xl mt-12 space-y-6">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8">
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
                    Or click to browse and select a delicious photo from your
                    device
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
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
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
              <p className="text-red-800 font-medium text-lg">{error}</p>
            </div>
          </div>
        )}

        {/* Photography Tips - made more subtle */}
        <div className="text-center">
          <button className="text-sm text-gray-600 hover:text-purple-600 transition">
            Need help? See our Photography Tips
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadView;
