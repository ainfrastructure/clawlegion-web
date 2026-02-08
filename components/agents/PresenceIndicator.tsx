'use client'

import { useState, useCallback } from 'react'
import { Circle, Brain, ChefHat, Utensils, Clock } from 'lucide-react'
import { usePollingInterval } from '@/hooks/usePollingInterval'

interface AgentPresence {
  id: string
  name: string
  status: 'online' | 'busy' | 'away' | 'offline'
  lastSeen: string
  currentRoom?: string
}

interface PresenceIndicatorProps {
  compact?: boolean
  showRooms?: boolean
  className?: string
}

const agentIcons: Record<string, React.ReactNode> = {
  SocialChefAI: <ChefHat className="w-4 h-4" />,
  SousChef: <Utensils className="w-4 h-4" />,
}

const agentEmoji: Record<string, string> = {
  SocialChefAI: '🍳',
  SousChef: '🥄',
}

const statusColors: Record<string, string> = {
  online: 'bg-green-500',
  busy: 'bg-yellow-500',
  away: 'bg-slate-400',
  offline: 'bg-slate-600',
}

const statusLabels: Record<string, string> = {
  online: 'Online',
  busy: 'Busy',
  away: 'Away',
  offline: 'Offline',
}

function formatLastSeen(timestamp: string): string {
  if (timestamp === 'unknown') return 'Never'
  
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  
  return date.toLocaleDateString()
}

export function PresenceIndicator({ compact = false, showRooms = true, className = '' }: PresenceIndicatorProps) {
  const [agents, setAgents] = useState<AgentPresence[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPresence = useCallback(async () => {
    try {
      const res = await fetch('/api/presence')
      if (!res.ok) throw new Error('Failed to fetch presence')
      const data = await res.json()
      setAgents(data.agents || [])
      setError(null)
    } catch (err) {
      setError('Could not load presence')
    } finally {
      setLoading(false)
    }
  }, [])

  usePollingInterval(fetchPresence, 15000)

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-slate-500 text-xs ${className}`}>
        <div className="animate-pulse w-2 h-2 rounded-full bg-slate-600" />
        Loading agents...
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-red-400 text-xs ${className}`}>
        {error}
      </div>
    )
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {agents.map((agent) => (
          <div 
            key={agent.id} 
            className="flex items-center gap-1 text-xs"
            title={`${agent.name}: ${statusLabels[agent.status]} - ${formatLastSeen(agent.lastSeen)}`}
          >
            <span>{agentEmoji[agent.name] || '🤖'}</span>
            <span className={`w-2 h-2 rounded-full ${statusColors[agent.status]}`} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wide">
        <Brain className="w-3 h-3 text-purple-400" />
        Agents
      </div>
      
      {agents.map((agent) => (
        <div 
          key={agent.id}
          className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="text-lg">{agentEmoji[agent.name] || '🤖'}</span>
              <span 
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${statusColors[agent.status]}`}
              />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-200">
                {agent.name.replace('AI', '')}
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {formatLastSeen(agent.lastSeen)}
              </div>
            </div>
          </div>
          
          {showRooms && agent.currentRoom && (
            <div className="text-[10px] text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded">
              #{agent.currentRoom}
            </div>
          )}
        </div>
      ))}
      
      <div className="text-[10px] text-slate-600 pt-1">
        Online = active in last 5 min
      </div>
    </div>
  )
}

export function PresenceDots({ className = '' }: { className?: string }) {
  const [agents, setAgents] = useState<AgentPresence[]>([])

  const fetchPresence = useCallback(async () => {
    try {
      const res = await fetch('/api/presence')
      if (res.ok) {
        const data = await res.json()
        setAgents(data.agents || [])
      }
    } catch {}
  }, [])

  usePollingInterval(fetchPresence, 15000)

  const onlineCount = agents.filter(a => a.status === 'online').length

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className={`w-2 h-2 rounded-full ${onlineCount > 0 ? 'bg-green-500' : 'bg-slate-500'}`} />
      <span className="text-xs text-slate-400">
        {onlineCount}/{agents.length}
      </span>
    </div>
  )
}
