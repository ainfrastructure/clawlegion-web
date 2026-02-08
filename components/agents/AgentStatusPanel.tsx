'use client'

import { useState } from 'react'
import { usePollingInterval } from '@/hooks/usePollingInterval'
import { Bot, Activity, Clock, CheckCircle, Circle, Loader2 } from 'lucide-react'

interface Agent {
  id: string
  name: string
  emoji: string
  role: 'lead' | 'secondary' | 'worker'
  status: 'online' | 'busy' | 'idle' | 'offline'
  lastSeen: string
  currentTask?: string
  tasksCompleted: number
  avgResponseTime: number
  activityHistory?: number[]  // Recent activity counts
}

// Simple sparkline component
function Sparkline({ data, color = '#60a5fa', height = 24, width = 60 }: { 
  data: number[], color?: string, height?: number, width?: number 
}) {
  if (!data || data.length < 2) {
    // Generate fake data for demo
    data = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10) + 1)
  }
  
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  }).join(' ')
  
  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        opacity="0.8"
      />
      {/* Gradient fill */}
      <defs>
        <linearGradient id={`sparkline-gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill={`url(#sparkline-gradient-${color.replace('#', '')})`}
        stroke="none"
        points={`0,${height} ${points} ${width},${height}`}
      />
    </svg>
  )
}

interface AgentStatusPanelProps {
  compact?: boolean
}

export function AgentStatusPanel({ compact = false }: AgentStatusPanelProps) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [summary, setSummary] = useState({ total: 0, online: 0, busy: 0, idle: 0, offline: 0 })
  const [loading, setLoading] = useState(true)

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/agents?includeOffline=true')
      if (res.ok) {
        const data = await res.json()
        const rawList = data.agents || []
        // Normalize backend fields to match component's Agent interface
        const agentList: Agent[] = rawList.map((a: any) => ({
          id: a.id,
          name: a.name,
          emoji: a.emoji || '🤖',
          role: a.role || a.type || 'worker',
          status: a.status || 'offline',
          lastSeen: a.lastActiveAt || a.lastSeen || new Date().toISOString(),
          currentTask: a.currentTask || a.currentTaskId,
          tasksCompleted: a.stats?.tasksCompleted ?? a.tasksCompleted ?? 0,
          avgResponseTime: a.stats?.avgDuration ? a.stats.avgDuration / 1000 : (a.avgResponseTime ?? 0),
          activityHistory: a.activityHistory,
        }))
        setAgents(agentList)
        const online = agentList.filter(a => a.status === 'online').length
        const busy = agentList.filter(a => a.status === 'busy').length
        const idle = agentList.filter(a => a.status === 'idle').length
        const offline = agentList.filter(a => a.status === 'offline').length
        setSummary({ total: agentList.length, online, busy, idle, offline })
      }
    } catch (err) {
      console.error('Failed to fetch agents:', err)
    }
    setLoading(false)
  }

  usePollingInterval(fetchAgents, 5000)

  const statusColors = {
    online: 'bg-green-500',
    busy: 'bg-yellow-500',
    idle: 'bg-blue-500',
    offline: 'bg-red-500'
  }

  const roleLabels = {
    lead: '👑 Lead',
    secondary: '⭐ Secondary',
    worker: '🔧 Worker'
  }

  const formatLastSeen = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    )
  }

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-2 bg-slate-800/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-300">{summary.total} agents</span>
        </div>
        <div className="flex gap-2">
          {summary.online > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <Circle className="w-2 h-2 fill-green-500 text-green-500" />
              {summary.online}
            </span>
          )}
          {summary.busy > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <Circle className="w-2 h-2 fill-yellow-500 text-yellow-500" />
              {summary.busy}
            </span>
          )}
          {summary.offline > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <Circle className="w-2 h-2 fill-red-500 text-red-500" />
              {summary.offline}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Summary Bar */}
      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-slate-400" />
          <span className="font-medium">Agent Fleet</span>
        </div>
        <div className="flex gap-3 text-sm">
          <span className="text-green-400">{summary.online} online</span>
          <span className="text-yellow-400">{summary.busy} busy</span>
          <span className="text-red-400">{summary.offline} offline</span>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {agents.map(agent => (
          <div 
            key={agent.id}
            className="p-3 glass-2 rounded-lg hover:border-slate-600 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{agent.emoji}</span>
                <div>
                  <div className="font-medium">{agent.name}</div>
                  <div className="text-xs text-slate-400">{roleLabels[agent.role]}</div>
                </div>
              </div>
              <span className={`w-3 h-3 rounded-full ${statusColors[agent.status]}`} 
                    title={agent.status} />
            </div>

            {agent.currentTask && (
              <div className="mb-2 p-2 bg-slate-700/50 rounded text-xs">
                <div className="text-slate-400 mb-1">Working on:</div>
                <div className="text-slate-200 truncate">{agent.currentTask}</div>
              </div>
            )}

            {/* Activity Sparkline */}
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">Activity (24h)</span>
              <Sparkline 
                data={agent.activityHistory || []} 
                color={agent.status === 'online' ? '#4ade80' : agent.status === 'busy' ? '#fbbf24' : '#64748b'}
                width={80}
                height={20}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {agent.tasksCompleted} tasks
              </div>
              <div className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {agent.avgResponseTime}s avg
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatLastSeen(agent.lastSeen)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AgentStatusPanel
