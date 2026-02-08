"use client";

import { useState } from "react";

interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
  title?: string;
  height?: number;
  horizontal?: boolean;
  showValues?: boolean;
  maxValue?: number;
}

export function BarChart({
  data,
  title,
  height = 200,
  horizontal = false,
  showValues = true,
  maxValue,
}: BarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const max = maxValue || Math.max(...data.map((d) => d.value), 1);

  const defaultColors = [
    "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
    "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1",
  ];

  if (!data.length) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-800 rounded-lg border border-gray-700"
        style={{ height }}
      >
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      )}

      <div
        className={`flex ${horizontal ? "flex-col gap-3" : "items-end gap-2 justify-around"}`}
        style={{ height: title ? height - 60 : height - 32 }}
      >
        {data.map((item, index) => {
          const percentage = (item.value / max) * 100;
          const color = item.color || defaultColors[index % defaultColors.length];
          const isHovered = hoveredIndex === index;

          return horizontal ? (
            <div
              key={index}
              className="flex items-center gap-3"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="w-20 text-sm text-gray-400 truncate text-right">
                {item.label}
              </div>
              <div className="flex-1 bg-gray-700 rounded-full h-6 relative overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: color,
                    opacity: isHovered ? 1 : 0.8,
                  }}
                />
                {showValues && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white font-medium">
                    {item.value}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div
              key={index}
              className="flex flex-col items-center gap-1 flex-1"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {showValues && (
                <span className={`text-xs transition-colors ${isHovered ? "text-white" : "text-gray-500"}`}>
                  {item.value}
                </span>
              )}
              <div
                className="w-full max-w-8 rounded-t transition-all duration-300"
                style={{
                  height: `${percentage}%`,
                  backgroundColor: color,
                  opacity: isHovered ? 1 : 0.8,
                  minHeight: "4px",
                }}
              />
              <span className={`text-xs truncate max-w-full transition-colors ${isHovered ? "text-white" : "text-gray-400"}`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BarChart;
