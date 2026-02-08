'use client';

import { useEffect, useState } from 'react';

interface Bottleneck {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  taskId?: string;
  taskName?: string;
  impact: string;
  recommendation: string;
}

interface PredictionData {
  estimatedCompletion: string | null;
  confidence: number;
  remainingTasks: number;
  bottlenecks: Bottleneck[];
  recommendations: string[];
}

export function ProgressPrediction({ sessionId }: { sessionId: string }) {
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrediction = () => {
      fetch(`/api/analytics/session/${sessionId}/predictions`)
        .then((res) => res.json())
        .then((data) => {
          setPrediction(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Failed to load prediction:', error);
          setLoading(false);
        });
    };

    fetchPrediction();
    const interval = setInterval(fetchPrediction, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, [sessionId]);

  if (loading) {
    return <div>Loading predictions...</div>;
  }

  if (!prediction) {
    return <div>No prediction data available</div>;
  }

  const severityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-4">
      {/* ETA */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Estimated Completion</h3>
        {prediction.estimatedCompletion ? (
          <div>
            <div className="text-2xl font-bold">
              {new Date(prediction.estimatedCompletion).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Confidence: {prediction.confidence}%
            </div>
            <div className="text-sm text-gray-500">
              {prediction.remainingTasks} tasks remaining
            </div>
          </div>
        ) : (
          <div className="text-gray-500">
            Insufficient data to predict completion
          </div>
        )}
      </div>

      {/* Bottlenecks */}
      {prediction.bottlenecks.length > 0 && (
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Bottlenecks</h3>
          <div className="space-y-2">
            {prediction.bottlenecks.slice(0, 5).map((bottleneck, index) => (
              <div
                key={index}
                className="p-3 rounded border-l-4 border-red-500 bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          severityColors[bottleneck.severity]
                        }`}
                      >
                        {bottleneck.severity.toUpperCase()}
                      </span>
                      <span className="font-medium">{bottleneck.type}</span>
                    </div>
                    {bottleneck.taskName && (
                      <div className="text-sm mt-1">{bottleneck.taskName}</div>
                    )}
                    <div className="text-sm text-gray-600 mt-1">
                      {bottleneck.impact}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400 mt-1 flex items-start gap-1">
                      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      {bottleneck.recommendation}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {prediction.recommendations.length > 0 && (
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
          <ul className="space-y-2">
            {prediction.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span className="text-sm">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
