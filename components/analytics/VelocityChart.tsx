'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { ReactNode } from 'react';

interface VelocityData {
  tasksPerHour: number;
  pointsPerHour: number;
  successRate: number;
  avgTaskDuration: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export function VelocityChart({ sessionId }: { sessionId: string }) {
  const [velocity, setVelocity] = useState<VelocityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/analytics/session/${sessionId}/velocity`)
      .then((res) => res.json())
      .then((data) => {
        setVelocity(data.velocity);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load velocity:', error);
        setLoading(false);
      });
  }, [sessionId]);

  if (loading) {
    return <div className="text-gray-500 dark:text-slate-400">Loading velocity data...</div>;
  }

  if (!velocity) {
    return <div className="text-gray-500 dark:text-slate-400">No velocity data available</div>;
  }

  const trendIcons: Record<string, ReactNode> = {
    increasing: <TrendingUp className="w-5 h-5 text-green-500" />,
    decreasing: <TrendingDown className="w-5 h-5 text-red-500" />,
    stable: <ArrowRight className="w-5 h-5 text-gray-500" />,
  };

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Velocity Metrics</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-500">Tasks per Hour</div>
          <div className="text-2xl font-bold">
            {velocity.tasksPerHour.toFixed(2)}
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500">Points per Hour</div>
          <div className="text-2xl font-bold">
            {velocity.pointsPerHour.toFixed(2)}
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500">Success Rate</div>
          <div className="text-2xl font-bold">
            {(velocity.successRate * 100).toFixed(1)}%
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-1">
            Trend {trendIcons[velocity.trend]}
          </div>
          <div className="text-lg font-semibold capitalize text-gray-900 dark:text-slate-100">
            {velocity.trend}
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Average task duration: {Math.round(velocity.avgTaskDuration / 60)} minutes
      </div>
    </div>
  );
}
