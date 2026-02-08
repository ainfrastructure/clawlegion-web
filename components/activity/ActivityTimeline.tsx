'use client'

import { useState, useEffect } from 'react'
import { 
  Activity, CheckCircle, AlertCircle, User, MessageSquare,
  Zap, Clock, GitCommit, Play, Pause
} from 'lucide-react'
import { AgentAvatar } from '@/components/agents'

interface ActivityEvent {
  id: string
  type: 'task_completed' | 'task_started' | 'task_failed' | 'message' | 'agent_online' | 'agent_offline' | 'deployment'
  title: string
  description?: string
  agent?: string
  timestamp: string
  metadata?: Record<string, any>
}

export function ActivityTimeline() {
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    // Simulate activity events (in real app, fetch from API or SSE)
    const mockEvents: ActivityEvent[] = [
      {
        id: '1',
        type: 'task_completed',
        title: 'Task completed',
        description: 'Add heartbeat auto-check',
        agent: 'SocialChefAI',
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        type: 'message',
        title: 'New message in bot-collab',
        description: '@SousChef - Research top dashboards',
        agent: 'SocialChefAI',
        timestamp: new Date(Date.now() - 60000).toISOString()
      },
      {
        id: '3',
        type: 'agent_online',
        title: 'Agent came online',
        agent: 'SousChef',
        timestamp: new Date(Date.now() - 120000).toISOString()
      },
      {
        id: '4',
        type: 'task_started',
        title: 'Task started',
        description: 'Research Linear dashboard',
        agent: 'SousChef',
        timestamp: new Date(Date.now() - 180000).toISOString()
      }
    ]

    setEvents(mockEvents)
    setLoading(false)

    // Poll for new events
    if (!isPaused) {
      const interval = setInterval(() => {
        // Fetch new events
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [isPaused])

  const typeIcons: Record<string, React.ReactNode> = {
    task_completed: <CheckCircle className="w-4 h-4 text-green-400" />,
    task_started: <Play className="w-4 h-4 text-blue-400" />,
    task_failed: <AlertCircle className="w-4 h-4 text-red-400" />,
    message: <MessageSquare className="w-4 h-4 text-purple-400" />,
    agent_online: <User className="w-4 h-4 text-green-400" />,
    agent_offline: <User className="w-4 h-4 text-slate-400" />,
    deployment: <GitCommit className="w-4 h-4 text-orange-400" />
  }

  const typeColors: Record<string, string> = {
    task_completed: 'border-green-500/30',
    task_started: 'border-blue-500/30',
    task_failed: 'border-red-500/30',
    message: 'border-purple-500/30',
    agent_online: 'border-green-500/30',
    agent_offline: 'border-slate-500/30',
    deployment: 'border-orange-500/30'
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    
    if (diffMin < 1) return 'Just now'
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return `${diffHr}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="glass-2 rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-slate-400" />
          <h3 className="font-semibold">Activity Timeline</h3>
          {!isPaused && (
            <span className="flex items-center gap-1 text-xs text-green-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Live
            </span>
          )}
        </div>
        <button 
          onClick={() => setIsPaused(!isPaused)}
          className="p-2 hover:bg-slate-700 rounded-lg"
          title={isPaused ? 'Resume' : 'Pause'}
        >
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </button>
      </div>

      {/* Timeline */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {events.map((event, index) => (
          <div key={event.id} className="flex gap-3">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className={`p-1.5 rounded-lg border ${typeColors[event.type]} bg-slate-800`}>
                {typeIcons[event.type]}
              </div>
              {index < events.length - 1 && (
                <div className="w-px h-full bg-slate-700 mt-2" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm">{event.title}</p>
                  {event.description && (
                    <p className="text-sm text-slate-400 mt-0.5">{event.description}</p>
                  )}
                  {event.agent && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <AgentAvatar agentId={event.agent} size="xs" />
                      {event.agent}
                    </p>
                  )}
                </div>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(event.timestamp)}
                </span>
              </div>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="text-center text-slate-500 py-8">
            No recent activity
          </div>
        )}
      </div>
    </div>
  )
}

export default ActivityTimeline
