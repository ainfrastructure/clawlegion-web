'use client'

import { useState } from 'react'
import { usePollingInterval } from '@/hooks/usePollingInterval'
import { cn } from '@/lib/utils'
import { Activity, Filter, CheckCircle2, PlayCircle, GitCommit, AlertCircle, Clock } from 'lucide-react'
import { AgentAvatar } from '@/components/agents'
import { formatTimeAgo } from '@/components/common/TimeAgo'

type ActivityType = 'task-completed' | 'task-started' | 'commit' | 'error' | 'message'

interface ActivityItem {
  id: string
  type: ActivityType
  agent: string
  agentEmoji: string
  title: string
  description?: string
  timestamp: string
}

const AGENT_EMOJIS: Record<string, string> = {
  jarvis: '🦞',
  lux: '✨',
  archie: '🏛️',
  mason: '🔨',
  vex: '🧪',
  scout: '🔭',
  ralph: '🔄',
  sven: '👑',
}

export function ActivityStream() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [filter, setFilter] = useState<ActivityType | 'all'>('all')
  const [agentFilter, setAgentFilter] = useState<string | 'all'>('all')
  const [loading, setLoading] = useState(true)

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/tasks/queue')
      if (res.ok) {
        const data = await res.json()
        const tasks = data.tasks || []

        // Convert tasks to activities
        const taskActivities: ActivityItem[] = tasks
          .filter((t: any) => t.completedAt || t.assignedAt)
          .map((t: any) => ({
            id: t.id,
            type: t.status === 'completed' ? 'task-completed' : 'task-started',
            agent: t.assignee || t.assignedTo || t.createdBy || 'unknown',
            agentEmoji: AGENT_EMOJIS[t.assignee] || AGENT_EMOJIS[t.assignedTo] || AGENT_EMOJIS[t.createdBy] || '🤖',
            title: t.status === 'completed' ? 'Completed task' : 'Started task',
            description: t.title,
            timestamp: t.completedAt || t.assignedAt
          }))
          .sort((a: ActivityItem, b: ActivityItem) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
          .slice(0, 50)

        setActivities(taskActivities)
      }
    } catch (err) {
      console.error('Failed to fetch activities:', err)
    } finally {
      setLoading(false)
    }
  }

  usePollingInterval(fetchActivities, 10000)

  const getIcon = (type: ActivityType) => {
    switch (type) {
      case 'task-completed': return <CheckCircle2 className="w-4 h-4 text-green-400" />
      case 'task-started': return <PlayCircle className="w-4 h-4 text-blue-400" />
      case 'commit': return <GitCommit className="w-4 h-4 text-purple-400" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />
      default: return <Activity className="w-4 h-4 text-slate-400" />
    }
  }

  const filteredActivities = activities.filter(a => {
    if (filter !== 'all' && a.type !== filter) return false
    if (agentFilter !== 'all' && a.agent.toLowerCase() !== agentFilter.toLowerCase()) return false
    return true
  })

  return (
    <div className="glass-2 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <h2 className="font-semibold text-white">Activity Stream</h2>
          </div>
          <span className="text-xs text-slate-500">{filteredActivities.length} items</span>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-2 py-1 text-xs bg-slate-700 rounded border border-slate-600 text-slate-300"
          >
            <option value="all">All Types</option>
            <option value="task-completed">Completed</option>
            <option value="task-started">Started</option>
          </select>
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="px-2 py-1 text-xs bg-slate-700 rounded border border-slate-600 text-slate-300"
          >
            <option value="all">All Agents</option>
            <option value="socialchefai">🍳 Chef</option>
            <option value="souschef">🥄 Sous</option>
          </select>
        </div>
      </div>

      {/* Activity List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-white/[0.06]">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading activities...</div>
        ) : filteredActivities.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No activities found</div>
        ) : (
          filteredActivities.map(activity => (
            <div key={activity.id} className="px-4 py-3 hover:bg-slate-800/30 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <AgentAvatar agentId={activity.agent} size="xs" />
                    <span className="text-sm text-purple-400">{activity.agent}</span>
                    <span className="text-sm font-medium text-white">{activity.title}</span>
                  </div>
                  {activity.description && (
                    <p className="text-sm text-slate-400 truncate mt-0.5">
                      {activity.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(new Date(activity.timestamp))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ActivityStream
