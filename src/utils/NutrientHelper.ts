export const getNutrientColor = (key: string) => {
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

export const getKeyNutrients = (data: any) => {
  const keyNutrients = ["calories", "fat", "protein", "sugar"];
  return Object.entries(data).filter(([key]) =>
    keyNutrients.includes(key.toLowerCase())
  );
};

export function getPortionReference(grams: number): string {
    if (grams <= 30) return "About 2 tablespoons";
    if (grams <= 60) return "About 1/4 cup";
    if (grams <= 120) return "About 1/2 cup";
    if (grams <= 240) return "About 1 cup";
    if (grams <= 480) return "About 2 cups";
    return "More than 2 cups";
  }