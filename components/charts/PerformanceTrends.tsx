"use client";

import { useState, useMemo } from "react";

interface DataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

interface TrendSeries {
  name: string;
  data: DataPoint[];
  color: string;
}

interface PerformanceTrendsProps {
  series: TrendSeries[];
  title?: string;
  height?: number;
  showLegend?: boolean;
  timeRange?: "1h" | "6h" | "24h" | "7d" | "30d";
  onTimeRangeChange?: (range: string) => void;
}

export function PerformanceTrends({
  series,
  title = "Performance Trends",
  height = 300,
  showLegend = true,
  timeRange = "24h",
  onTimeRangeChange,
}: PerformanceTrendsProps) {
  const [selectedRange, setSelectedRange] = useState(timeRange);
  const [hoveredPoint, setHoveredPoint] = useState<{
    series: string;
    point: DataPoint;
    x: number;
    y: number;
  } | null>(null);

  const timeRanges = [
    { value: "1h", label: "1H" },
    { value: "6h", label: "6H" },
    { value: "24h", label: "24H" },
    { value: "7d", label: "7D" },
    { value: "30d", label: "30D" },
  ];

  const { minValue, maxValue, chartPoints } = useMemo(() => {
    if (!series.length || !series[0]?.data?.length) {
      return { minValue: 0, maxValue: 100, chartPoints: [] };
    }

    const allValues = series.flatMap((s) => s.data.map((d) => d.value));
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const padding = (max - min) * 0.1 || 10;

    const chartWidth = 100;
    const points = series.map((s) => {
      const pathPoints = s.data.map((d, i) => {
        const x = (i / (s.data.length - 1 || 1)) * chartWidth;
        const y = 100 - ((d.value - (min - padding)) / ((max + padding) - (min - padding))) * 100;
        return { x, y, data: d };
      });
      return { ...s, pathPoints };
    });

    return {
      minValue: min - padding,
      maxValue: max + padding,
      chartPoints: points,
    };
  }, [series]);

  const handleRangeChange = (range: string) => {
    setSelectedRange(range as typeof selectedRange);
    onTimeRangeChange?.(range);
  };

  if (!series.length) {
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
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className="flex gap-1">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => handleRangeChange(range.value)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                selectedRange === range.value
                  ? "bg-red-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative" style={{ height: height - 80 }}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="rgba(75, 85, 99, 0.3)"
              strokeWidth="0.3"
            />
          ))}

          {/* Area fills */}
          {chartPoints.map((s) => (
            <path
              key={`area-${s.name}`}
              d={`M ${s.pathPoints[0]?.x || 0} ${s.pathPoints[0]?.y || 100} ${s.pathPoints
                .map((p) => `L ${p.x} ${p.y}`)
                .join(" ")} L ${s.pathPoints[s.pathPoints.length - 1]?.x || 100} 100 L ${
                s.pathPoints[0]?.x || 0
              } 100 Z`}
              fill={s.color}
              fillOpacity="0.1"
            />
          ))}

          {/* Lines */}
          {chartPoints.map((s) => (
            <path
              key={`line-${s.name}`}
              d={`M ${s.pathPoints.map((p) => `${p.x} ${p.y}`).join(" L ")}`}
              fill="none"
              stroke={s.color}
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Interactive points */}
          {chartPoints.map((s) =>
            s.pathPoints.map((p, i) => (
              <circle
                key={`point-${s.name}-${i}`}
                cx={p.x}
                cy={p.y}
                r="1.5"
                fill={s.color}
                className="cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                  if (rect) {
                    setHoveredPoint({
                      series: s.name,
                      point: p.data,
                      x: (p.x / 100) * rect.width,
                      y: (p.y / 100) * rect.height,
                    });
                  }
                }}
              />
            ))
          )}
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-gray-500 -ml-12">
          <span>{Math.round(maxValue)}</span>
          <span>{Math.round((maxValue + minValue) / 2)}</span>
          <span>{Math.round(minValue)}</span>
        </div>

        {/* Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm pointer-events-none z-10 shadow-lg"
            style={{
              left: Math.min(hoveredPoint.x, (height - 80) - 100),
              top: Math.max(0, hoveredPoint.y - 40),
            }}
          >
            <div className="text-gray-400 text-xs">{hoveredPoint.series}</div>
            <div className="text-white font-medium">{hoveredPoint.point.value}</div>
            {hoveredPoint.point.label && (
              <div className="text-gray-500 text-xs">{hoveredPoint.point.label}</div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-gray-700">
          {series.map((s) => (
            <div key={s.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-sm text-gray-300">{s.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PerformanceTrends;
