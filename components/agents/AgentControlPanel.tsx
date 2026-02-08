'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Activity, Play, Pause, RefreshCw, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react'

interface AgentStatus {
  id: string
  name: string
  emoji: string
  status: 'active' | 'idle' | 'paused' | 'error'
  currentTask?: string
  tasksCompleted: number
  lastActivity: string
}

export function AgentControlPanel() {
  const [agents, setAgents] = useState<AgentStatus[]>([
    {
      id: 'socialchefai',
      name: 'SocialChefAI',
      emoji: '🍳',
      status: 'active',
      currentTask: 'Backend API development',
      tasksCompleted: 31,
      lastActivity: new Date().toISOString()
    },
    {
      id: 'souschef',
      name: 'SousChef',
      emoji: '🥄',
      status: 'active',
      currentTask: 'UI Component Library',
      tasksCompleted: 62,
      lastActivity: new Date().toISOString()
    }
  ])
  
  const [loading, setLoading] = useState(false)

  // Poll for updates
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch('/api/tasks/stats')
        if (res.ok) {
          const data = await res.json()
          setAgents(prev => prev.map(agent => ({
            ...agent,
            tasksCompleted: data.byAssignee?.[agent.id] || agent.tasksCompleted
          })))
        }
      } catch (err) {
        console.error('Failed to fetch agent stats:', err)
      }
    }
    
    fetchAgents()
    const interval = setInterval(fetchAgents, 10000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'idle': return 'bg-yellow-500'
      case 'paused': return 'bg-slate-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-slate-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Activity className="w-4 h-4 text-green-400" />
      case 'idle': return <Pause className="w-4 h-4 text-yellow-400" />
      case 'paused': return <Pause className="w-4 h-4 text-slate-400" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />
      default: return null
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    return `${Math.floor(mins / 60)}h ago`
  }

  return (
    <div className="glass-2 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          <h2 className="font-semibold text-white">Agent Control Panel</h2>
          <span className="text-xs text-slate-500">Live</span>
        </div>
        <button 
          onClick={() => setLoading(true)}
          className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className={cn('w-4 h-4 text-slate-400', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Agent List */}
      <div className="divide-y divide-white/[0.06]">
        {agents.map(agent => (
          <div key={agent.id} className="p-4 hover:bg-slate-800/30 transition-colors">
            <div className="flex items-start justify-between">
              {/* Agent Info */}
              <div className="flex items-start gap-3">
                <div className="relative">
                  <span className="text-2xl">{agent.emoji}</span>
                  <div className={cn(
                    'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-800',
                    getStatusColor(agent.status)
                  )} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{agent.name}</span>
                    {getStatusIcon(agent.status)}
                  </div>
                  {agent.currentTask && (
                    <p className="text-sm text-slate-400 mt-0.5">
                      Working on: {agent.currentTask}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {agent.tasksCompleted} tasks
                    </span>
                    <span>Active {formatTimeAgo(agent.lastActivity)}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-1">
                <button 
                  className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                  title="Send message"
                >
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                </button>
                <button 
                  className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                  title={agent.status === 'paused' ? 'Resume' : 'Pause'}
                >
                  {agent.status === 'paused' ? (
                    <Play className="w-4 h-4 text-green-400" />
                  ) : (
                    <Pause className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AgentControlPanel
