'use client';

import { useState, useCallback, useMemo } from 'react';
import { AgentAvatar } from '@/components/agents';
import { usePollingInterval } from '@/hooks/usePollingInterval';

type ActivityType = 'task_claim' | 'task_complete' | 'task_fail' | 'error' | 'commit' | 'message';

interface Activity {
  id: string;
  type: ActivityType;
  agent: string;
  title: string;
  description?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface ActivityStreamProps {
  className?: string;
  limit?: number;
}

const activityIcons: Record<ActivityType, string> = {
  task_claim: '📋',
  task_complete: '✅',
  task_fail: '❌',
  error: '🚨',
  commit: '📝',
  message: '💬',
};

const activityColors: Record<ActivityType, string> = {
  task_claim: 'bg-blue-100 text-blue-800 border-blue-200',
  task_complete: 'bg-green-100 text-green-800 border-green-200',
  task_fail: 'bg-red-100 text-red-800 border-red-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  commit: 'bg-purple-100 text-purple-800 border-purple-200',
  message: 'bg-gray-100 text-gray-800 border-gray-200',
};

export function ActivityStream({ className = '', limit = 50 }: ActivityStreamProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ActivityType | 'all'>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');

  const fetchActivities = useCallback(async () => {
    try {
      // Fetch from tasks queue and build activity stream
      const [tasksRes, alertsRes] = await Promise.all([
        fetch('/api/tasks/queue'),
        fetch('/api/alerts?limit=20').catch(() => ({ json: async () => ({ recentAlerts: [] }) })),
      ]);

      const tasksData = await tasksRes.json();
      const alertsData = await (alertsRes as Response).json?.() || { recentAlerts: [] };

      const taskActivities: Activity[] = [];

      // Convert tasks to activities
      for (const task of (tasksData.tasks || []).slice(-limit * 2)) {
        // Task claimed
        if (task.assignedAt) {
          taskActivities.push({
            id: task.id + '-claim',
            type: 'task_claim',
            agent: task.assignee || task.assignedTo || 'unknown',
            title: 'Claimed task',
            description: task.title,
            timestamp: task.assignedAt,
          });
        }

        // Task completed
        if (task.completedAt) {
          taskActivities.push({
            id: task.id + '-complete',
            type: task.status === 'failed' ? 'task_fail' : 'task_complete',
            agent: task.completedBy || task.assignee || task.assignedTo || 'unknown',
            title: task.status === 'failed' ? 'Failed task' : 'Completed task',
            description: task.title,
            timestamp: task.completedAt,
          });
        }
      }

      // Add alerts as activities
      for (const alert of alertsData.recentAlerts || []) {
        taskActivities.push({
          id: alert.id,
          type: 'error',
          agent: 'system',
          title: alert.title,
          description: alert.description,
          timestamp: alert.timestamp,
        });
      }

      // Sort by timestamp descending
      taskActivities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(taskActivities.slice(0, limit));
      setLoading(false);
    } catch (e) {
      console.error('Failed to fetch activities:', e);
      setLoading(false);
    }
  }, [limit]);

  usePollingInterval(fetchActivities, 10000);

  const agents = useMemo(() => {
    const set = new Set(activities.map(a => a.agent));
    return Array.from(set).sort();
  }, [activities]);

  const filteredActivities = useMemo(() => {
    return activities.filter(a => {
      if (filter !== 'all' && a.type !== filter) return false;
      if (agentFilter !== 'all' && a.agent !== agentFilter) return false;
      return true;
    });
  }, [activities, filter, agentFilter]);

  const formatTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
    return Math.floor(seconds / 86400) + 'd ago';
  };

  return (
    <div className={'bg-white rounded-lg shadow-lg ' + className}>
      {/* Header with filters */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-gray-900">Activity Stream</h2>
          <button 
            onClick={fetchActivities}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as ActivityType | 'all')}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">All Types</option>
            <option value="task_claim">Claims</option>
            <option value="task_complete">Completions</option>
            <option value="task_fail">Failures</option>
            <option value="error">Errors</option>
            <option value="commit">Commits</option>
          </select>

          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">All Agents</option>
            {agents.map(agent => (
              <option key={agent} value={agent}>{agent}</option>
            ))}
          </select>

          <span className="text-sm text-gray-500 ml-auto">
            {filteredActivities.length} activities
          </span>
        </div>
      </div>

      {/* Activity List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : filteredActivities.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No activities found</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className="px-6 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <span className="text-lg">{activityIcons[activity.type]}</span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={'text-xs px-1.5 py-0.5 rounded border flex items-center gap-1 ' + activityColors[activity.type]}>
                        <AgentAvatar agentId={activity.agent} size="xs" />
                        {activity.agent}
                      </span>
                      <span className="text-sm text-gray-900 font-medium">
                        {activity.title}
                      </span>
                    </div>
                    {activity.description && (
                      <p className="text-sm text-gray-600 truncate">
                        {activity.description}
                      </p>
                    )}
                  </div>

                  {/* Timestamp */}
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-500">
        <span className="text-green-600">
          ✅ {activities.filter(a => a.type === 'task_complete').length} completed
        </span>
        <span className="text-blue-600">
          📋 {activities.filter(a => a.type === 'task_claim').length} claimed
        </span>
        <span className="text-red-600">
          ❌ {activities.filter(a => a.type === 'task_fail' || a.type === 'error').length} issues
        </span>
      </div>
    </div>
  );
}

export default ActivityStream;
