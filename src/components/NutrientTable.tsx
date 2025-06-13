import React from "react";

type Nutrient = {
  value: number;
  unit: string;
};

type Props = {
  data: Record<string, Nutrient>;
  scale: number;
};

const NutrientTable: React.FC<Props> = ({ data, scale }) => {
  return (
    <ul className="space-y-3">
      {Object.entries(data).map(([key, nutrient]) => {
        const finalValue = nutrient.value * scale;
        return (
          <li
            key={key}
            className="flex justify-between items-baseline p-2 rounded-lg hover:bg-gray-50"
          >
            <span className="font-medium text-gray-700 capitalize">
              {key.replace("_", " ")}
            </span>
            <span className="font-bold text-gray-900">
              {finalValue.toFixed(1)} {nutrient.unit}
            </span>
          </li>
        );
      })}
    </ul>
  );
};

export default NutrientTable;
