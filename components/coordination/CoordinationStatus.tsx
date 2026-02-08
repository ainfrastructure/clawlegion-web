'use client'

import { useState, useCallback } from 'react'
import {
  Users, MessageSquare, GitBranch, CheckCircle, Clock,
  AlertCircle, Activity, Zap, ArrowRight
} from 'lucide-react'
import { usePollingInterval } from '@/hooks/usePollingInterval'

interface CoordinationState {
  activeHandoff: {
    owner: string
    task: string
    status: string
    started?: string
  } | null
  recentMessages: {
    id: string
    author: string
    content: string
    timestamp: string
  }[]
  agentStatus: {
    id: string
    name: string
    status: 'online' | 'busy' | 'idle' | 'offline'
    currentTask?: string
  }[]
  taskQueueSize: number
}

export function CoordinationStatus() {
  const [state, setState] = useState<CoordinationState>({
    activeHandoff: null,
    recentMessages: [],
    agentStatus: [],
    taskQueueSize: 0
  })
  const [loading, setLoading] = useState(true)

  const fetchState = useCallback(async () => {
    try {
      const [messagesRes, agentsRes, tasksRes] = await Promise.all([
        fetch('/api/coordination/room-messages?roomId=bot-collab').catch(() => null),
        fetch('/api/agents/status').catch(() => null),
        fetch('/api/tasks/queue').catch(() => null)
      ])

      const messages = messagesRes?.ok ? await messagesRes.json() : { messages: [] }
      const agents = agentsRes?.ok ? await agentsRes.json() : { agents: [] }
      const tasks = tasksRes?.ok ? await tasksRes.json() : { summary: { queued: 0 } }

      setState({
        activeHandoff: null,
        recentMessages: (messages.messages || []).slice(-5).reverse(),
        agentStatus: agents.agents || [],
        taskQueueSize: tasks.summary?.queued || 0
      })
    } catch (err) {
      console.error('Failed to fetch coordination state:', err)
    }
    setLoading(false)
  }, [])

  usePollingInterval(fetchState, 5000)

  const statusColors = {
    online: 'bg-green-500',
    busy: 'bg-yellow-500',
    idle: 'bg-blue-500',
    offline: 'bg-slate-500'
  }

  if (loading) {
    return (
      <div className="glass-2 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-700 rounded w-1/3" />
          <div className="h-20 bg-slate-700 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="glass-2 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <GitBranch className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold">Coordination Status</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Active Handoff */}
        {state.activeHandoff && (
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-400">Active Handoff</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{state.activeHandoff.owner}</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <span className="text-slate-300">{state.activeHandoff.task}</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              {state.activeHandoff.status}
            </div>
          </div>
        )}

        {/* Agent Pills */}
        <div>
          <div className="text-xs text-slate-500 mb-2">Agents</div>
          <div className="flex flex-wrap gap-2">
            {state.agentStatus.map(agent => (
              <div 
                key={agent.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-full"
              >
                <span className={`w-2 h-2 rounded-full ${statusColors[agent.status]}`} />
                <span className="text-sm">{agent.name}</span>
                {agent.currentTask && (
                  <span className="text-xs text-slate-500 max-w-[100px] truncate">
                    {agent.currentTask}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Task Queue Summary */}
        <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm">Task Queue</span>
          </div>
          <span className="font-mono font-bold">{state.taskQueueSize}</span>
        </div>

        {/* Recent Messages */}
        {state.recentMessages.length > 0 && (
          <div>
            <div className="text-xs text-slate-500 mb-2">Recent Activity</div>
            <div className="space-y-2">
              {state.recentMessages.slice(0, 3).map(msg => (
                <div key={msg.id} className="flex items-start gap-2 text-sm">
                  <MessageSquare className="w-3 h-3 mt-1 text-slate-500" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-slate-300">{msg.author}:</span>
                    <span className="text-slate-400 ml-1 truncate block">
                      {msg.content.slice(0, 60)}...
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CoordinationStatus
