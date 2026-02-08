'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePollingInterval } from '@/hooks/usePollingInterval';

interface AgentTask {
  id: string;
  title: string;
  startedAt: string;
}

interface Agent {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'busy' | 'offline';
  currentTask?: AgentTask;
  lastActivity: string;
  messageCount: number;
  tasksCompleted: number;
}

interface AgentControlPanelProps {
  className?: string;
}

export function AgentControlPanel({ className = '' }: AgentControlPanelProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [useSSE, setUseSSE] = useState(true);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch('/api/agents/stream');
      const data = await res.json();
      setAgents(data.agents || []);
      setLastUpdate(data.timestamp);
    } catch (e) {
      console.error('Failed to fetch agents:', e);
    }
  }, []);

  // Polling fallback when SSE is not active
  usePollingInterval(fetchAgents, 5000, !useSSE);

  useEffect(() => {
    if (!useSSE) return;

    // SSE connection
    const eventSource = new EventSource('/api/agents/stream?format=sse');

    eventSource.onopen = () => {
      setConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'close') {
          eventSource.close();
          setConnected(false);
          setUseSSE(false); // Fallback to polling
          return;
        }
        setAgents(data.agents || []);
        setLastUpdate(data.timestamp);
      } catch (e) {
        console.error('SSE parse error:', e);
      }
    };

    eventSource.onerror = () => {
      setConnected(false);
      eventSource.close();
      setUseSSE(false); // Fallback to polling
    };

    return () => {
      eventSource.close();
    };
  }, [useSSE, fetchAgents]);

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'idle': return 'bg-gray-400';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getStatusBgColor = (status: Agent['status']) => {
    switch (status) {
      case 'active': return 'bg-green-50 border-green-200';
      case 'busy': return 'bg-yellow-50 border-yellow-200';
      case 'idle': return 'bg-gray-50 border-gray-200';
      case 'offline': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return seconds + 's ago';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
    return Math.floor(seconds / 86400) + 'd ago';
  };

  return (
    <div className={'bg-white rounded-lg shadow-lg ' + className}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-900">Agent Control Panel</h2>
          <span className={'w-2 h-2 rounded-full ' + (connected ? 'bg-green-500 animate-pulse' : 'bg-gray-400')} />
          <span className="text-xs text-gray-500">
            {connected ? 'Live' : 'Polling'}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          {lastUpdate && 'Updated ' + formatTimeAgo(lastUpdate)}
        </div>
      </div>

      {/* Agent Grid */}
      <div className="p-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No agents detected
          </div>
        ) : (
          agents.map((agent) => (
            <div
              key={agent.id}
              className={'rounded-lg border-2 p-4 transition-all hover:shadow-md ' + getStatusBgColor(agent.status)}
            >
              {/* Agent Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={'w-3 h-3 rounded-full ' + getStatusColor(agent.status)} />
                  <span className="font-medium text-gray-900">{agent.name}</span>
                </div>
                <span className={'text-xs px-2 py-1 rounded-full ' + 
                  (agent.status === 'busy' ? 'bg-yellow-200 text-yellow-800' :
                   agent.status === 'active' ? 'bg-green-200 text-green-800' :
                   agent.status === 'idle' ? 'bg-gray-200 text-gray-600' :
                   'bg-red-200 text-red-800')}>
                  {agent.status}
                </span>
              </div>

              {/* Current Task */}
              {agent.currentTask && (
                <div className="mb-3 p-2 bg-white/50 rounded border border-current/10">
                  <div className="text-xs text-gray-500 mb-1">Current Task</div>
                  <div className="text-sm font-medium text-gray-800 truncate">
                    {agent.currentTask.title}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Started {formatTimeAgo(agent.currentTask.startedAt)}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <span>✓</span>
                  <span>{agent.tasksCompleted} completed</span>
                </div>
                <div className="text-xs text-gray-400">
                  {formatTimeAgo(agent.lastActivity)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-sm">
        <div className="flex gap-4">
          <span className="text-green-600">
            ● {agents.filter(a => a.status === 'active').length} active
          </span>
          <span className="text-yellow-600">
            ● {agents.filter(a => a.status === 'busy').length} busy
          </span>
          <span className="text-gray-500">
            ● {agents.filter(a => a.status === 'idle').length} idle
          </span>
          <span className="text-red-500">
            ● {agents.filter(a => a.status === 'offline').length} offline
          </span>
        </div>
        <div className="text-gray-500">
          {agents.reduce((sum, a) => sum + a.tasksCompleted, 0)} total tasks completed
        </div>
      </div>
    </div>
  );
}

export default AgentControlPanel;
