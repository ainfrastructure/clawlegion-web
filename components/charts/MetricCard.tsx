"use client";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  sparkline?: number[];
  color?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel = "vs last period",
  icon,
  trend,
  sparkline,
  color = "#3B82F6",
}: MetricCardProps) {
  const getTrendColor = () => {
    if (!trend && change !== undefined) {
      return change > 0 ? "text-green-400" : change < 0 ? "text-red-400" : "text-gray-400";
    }
    switch (trend) {
      case "up": return "text-green-400";
      case "down": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  const getTrendIcon = () => {
    const effectiveTrend = trend || (change && change > 0 ? "up" : change && change < 0 ? "down" : "neutral");
    switch (effectiveTrend) {
      case "up": return "↑";
      case "down": return "↓";
      default: return "→";
    }
  };

  // Generate sparkline path
  const sparklinePath = sparkline?.length
    ? (() => {
        const max = Math.max(...sparkline);
        const min = Math.min(...sparkline);
        const range = max - min || 1;
        const width = 100;
        const height = 30;
        
        const points = sparkline.map((v, i) => ({
          x: (i / (sparkline.length - 1 || 1)) * width,
          y: height - ((v - min) / range) * height,
        }));
        
        return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
      })()
    : null;

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {icon && <span className="text-gray-400">{icon}</span>}
            <h4 className="text-sm text-gray-400">{title}</h4>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-white">{value}</span>
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-1 text-sm ${getTrendColor()}`}>
              <span>{getTrendIcon()}</span>
              <span>{Math.abs(change)}%</span>
              <span className="text-gray-500 text-xs ml-1">{changeLabel}</span>
            </div>
          )}
        </div>

        {sparkline && sparklinePath && (
          <div className="w-20 h-8">
            <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
              <path
                d={sparklinePath}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

export default MetricCard;
