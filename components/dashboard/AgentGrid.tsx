'use client'

import Link from 'next/link'
import { Bot, Target, Cog, FlaskConical, Lock, Rocket, AlertTriangle, ClipboardList } from 'lucide-react'
import { ReactNode } from 'react'

interface Agent {
  id: string
  name: string
  type: string
  status: string
  currentTaskId?: string
  rateLimitedUntil?: string
}

interface AgentGridProps {
  agents: Agent[]
  isLoading?: boolean
}

const STATUS_CONFIG: Record<string, { dot: string; label: string; bg: string }> = {
  idle: { dot: 'bg-emerald-500', label: 'Idle', bg: 'bg-emerald-500/10' },
  busy: { dot: 'bg-yellow-500 animate-pulse', label: 'Busy', bg: 'bg-yellow-500/10' },
  rate_limited: { dot: 'bg-red-500', label: 'Rate Limited', bg: 'bg-red-500/10' },
  offline: { dot: 'bg-slate-500', label: 'Offline', bg: 'bg-slate-500/10' },
}

const TYPE_ICONS: Record<string, ReactNode> = {
  orchestrator: <Target className="w-3.5 h-3.5" />,
  worker: <Cog className="w-3.5 h-3.5" />,
  tester: <FlaskConical className="w-3.5 h-3.5" />,
  security: <Lock className="w-3.5 h-3.5" />,
  devops: <Rocket className="w-3.5 h-3.5" />,
}

export function AgentGrid({ agents: agentsProp, isLoading }: AgentGridProps) {
  // Defensive: ensure agents is always an array
  const agents = Array.isArray(agentsProp) ? agentsProp : []
  
  // Group agents by status for better visibility
  const grouped = {
    busy: agents.filter(a => a.status === 'busy'),
    rateLimited: agents.filter(a => a.status === 'rate_limited'),
    idle: agents.filter(a => a.status === 'idle'),
    offline: agents.filter(a => a.status === 'offline'),
  }

  const displayAgents = [...grouped.busy, ...grouped.rateLimited, ...grouped.idle, ...grouped.offline].slice(0, 8)

  if (isLoading) {
    return (
      <div className="bg-slate-800 dark:bg-slate-800 bg-white rounded-xl border border-white/[0.06] dark:border-white/[0.06] border-slate-200 p-4 animate-pulse">
        <div className="h-6 w-24 bg-slate-700 rounded mb-4" />
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-slate-700 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 dark:bg-slate-800 bg-white rounded-xl border border-white/[0.06] dark:border-white/[0.06] border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200 dark:text-slate-200 text-slate-800 flex items-center gap-2">
          <Bot className="w-4 h-4" /> Agents
        </h3>
        <Link
          href="/agents"
          className="text-xs text-slate-400 hover:text-blue-400 transition-colors"
        >
          Manage →
        </Link>
      </div>

      {displayAgents.length === 0 ? (
        <div className="text-center py-6">
          <Bot className="w-8 h-8 mx-auto mb-2 text-slate-500" />
          <p className="text-sm text-slate-400">No agents registered</p>
          <Link
            href="/agents"
            className="inline-block mt-2 text-xs text-blue-400 hover:text-blue-300"
          >
            Add agent →
          </Link>
        </div>
      ) : (
        <>
          {/* Summary badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {grouped.busy.length > 0 && (
              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                {grouped.busy.length} busy
              </span>
            )}
            {grouped.rateLimited.length > 0 && (
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full animate-pulse flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {grouped.rateLimited.length} rate limited
              </span>
            )}
            {grouped.idle.length > 0 && (
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                {grouped.idle.length} idle
              </span>
            )}
          </div>

          {/* Agent cards */}
          <div className="grid grid-cols-2 gap-2">
            {displayAgents.map(agent => {
              const config = STATUS_CONFIG[agent.status] || STATUS_CONFIG.offline
              const icon = TYPE_ICONS[agent.type] || <Cog className="w-3.5 h-3.5" />

              return (
                <div
                  key={agent.id}
                  className={`${config.bg} rounded-lg p-2.5 ${agent.status === 'rate_limited' ? 'ring-1 ring-red-500/50' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${config.dot} flex-shrink-0`} />
                    <span className="text-xs">{icon}</span>
                    <span className="text-sm font-medium text-slate-200 dark:text-slate-200 text-slate-700 truncate">
                      {agent.name}
                    </span>
                  </div>
                  {agent.currentTaskId && (
                    <div className="mt-1 text-xs text-slate-400 truncate pl-4 flex items-center gap-1">
                      <ClipboardList className="w-3 h-3" /> {agent.currentTaskId}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {agents.length > 8 && (
            <Link
              href="/agents"
              className="block mt-2 text-center text-xs text-slate-400 hover:text-blue-400"
            >
              +{agents.length - 8} more agents
            </Link>
          )}
        </>
      )}
    </div>
  )
}
