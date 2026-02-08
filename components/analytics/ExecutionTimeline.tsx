'use client';

import { useEffect, useState } from 'react';

interface TimelineTask {
  taskId: string;
  taskName: string;
  startedAt: string;
  completedAt: string | null;
  status: string;
  duration: number | null;
}

export function ExecutionTimeline({ sessionId }: { sessionId: string }) {
  const [tasks, setTasks] = useState<TimelineTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/analytics/session/${sessionId}/timeline`)
      .then((res) => res.json())
      .then((data) => {
        setTasks(data.tasks || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load timeline:', error);
        setLoading(false);
      });
  }, [sessionId]);

  if (loading) {
    return <div>Loading timeline...</div>;
  }

  const statusColors: Record<string, string> = {
    SUCCESS: 'bg-green-500',
    FAILED: 'bg-red-500',
    RUNNING: 'bg-blue-500',
    PENDING: 'bg-gray-300',
  };

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Execution Timeline</h3>

      <div className="space-y-3">
        {tasks.map((task, index) => (
          <div key={task.taskId} className="flex items-center gap-3">
            <div className="w-24 text-sm text-gray-500 shrink-0">
              {new Date(task.startedAt).toLocaleTimeString()}
            </div>

            <div
              className={`w-2 h-2 rounded-full ${
                statusColors[task.status] || 'bg-gray-400'
              }`}
            />

            <div className="flex-1">
              <div className="text-sm font-medium">{task.taskName}</div>
              <div className="text-xs text-gray-500">
                {task.duration
                  ? `${Math.round(task.duration / 60)}min`
                  : task.status === 'RUNNING'
                  ? 'In progress...'
                  : 'Pending'}
              </div>
            </div>

            <div
              className={`px-2 py-1 text-xs rounded ${
                task.status === 'SUCCESS'
                  ? 'bg-green-100 text-green-800'
                  : task.status === 'FAILED'
                  ? 'bg-red-100 text-red-800'
                  : task.status === 'RUNNING'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {task.status}
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No tasks executed yet
        </div>
      )}
    </div>
  );
}
