'use client'

import Image from 'next/image'
import { Bot, MoreVertical, Pause, Settings, CheckCircle2, Clock } from 'lucide-react'
import { StatusBadge, StatusDot, type AgentStatus } from '@/components/ui/StatusBadge'
import { ReachabilityIndicator, ReachabilityDot } from './ReachabilityIndicator'

export interface AgentData {
  id: string
  name: string
  emoji?: string
  avatar?: string
  role?: string
  title?: string
  description?: string
  color?: string
  status: AgentStatus
  currentTask?: string
  healthEndpoint?: string
  reachable?: boolean | null
  latencyMs?: number
  capabilities?: string[]
  stats?: {
    tasksCompleted?: number
    avgResponseTime?: number
    failureRate?: number
  }
}

interface AgentCardProps {
  agent: AgentData
  variant?: 'full' | 'compact' | 'mini'
  showStats?: boolean
  showHealth?: boolean
  showActions?: boolean
  className?: string
  onPause?: () => void
  onConfigure?: () => void
  onClick?: () => void
}

const colorMap: Record<string, { bg: string; border: string; text: string; accent: string }> = {
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', accent: 'bg-blue-500' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', accent: 'bg-purple-500' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', accent: 'bg-amber-500' },
  green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', accent: 'bg-green-500' },
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', accent: 'bg-cyan-500' },
  pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400', accent: 'bg-pink-500' },
  red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', accent: 'bg-red-500' },
  slate: { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400', accent: 'bg-slate-500' },
}

function AgentAvatar({ agent, size = 'md' }: { agent: AgentData; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { container: 'w-8 h-8', emoji: 'text-lg', img: 32 },
    md: { container: 'w-10 h-10', emoji: 'text-2xl', img: 40 },
    lg: { container: 'w-14 h-14', emoji: 'text-3xl', img: 56 },
  }
  
  const s = sizes[size]
  
  if (agent.avatar) {
    return (
      <div className={`${s.container} rounded-full overflow-hidden bg-slate-800 flex-shrink-0`}>
        <Image
          src={agent.avatar}
          alt={agent.name}
          width={s.img}
          height={s.img}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }
  
  if (agent.emoji) {
    return (
      <div className={`${s.container} rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0`}>
        <span className={s.emoji}>{agent.emoji}</span>
      </div>
    )
  }
  
  return (
    <div className={`${s.container} rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0`}>
      <Bot className="text-slate-400" size={s.img * 0.6} />
    </div>
  )
}

// Full variant - detailed card with all info
function FullCard({ agent, showStats, showHealth, showActions, onPause, onConfigure }: AgentCardProps) {
  const colors = colorMap[agent.color ?? 'slate'] ?? colorMap.slate
  
  return (
    <div className={`${colors.bg} rounded-xl border ${colors.border} p-4 sm:p-5`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <AgentAvatar agent={agent} size="lg" />
          <div>
            <div className="font-semibold text-white text-lg">{agent.name}</div>
            <div className={`text-sm ${colors.text}`}>{agent.title || agent.role}</div>
          </div>
        </div>
        <StatusBadge status={agent.status} size="sm" />
      </div>
      
      {/* Description */}
      {agent.description && (
        <p className="text-sm text-slate-400 mb-3">{agent.description}</p>
      )}
      
      {/* Current Task */}
      {agent.currentTask && (
        <div className="text-xs sm:text-sm text-slate-400 mb-3 p-2 bg-slate-800/50 rounded">
          <span className="text-slate-500">Working on:</span>{' '}
          <span className="text-blue-400 font-mono">{agent.currentTask}</span>
        </div>
      )}
      
      {/* Stats */}
      {showStats && agent.stats && (
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/[0.06] mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-green-400" />
            <span className="text-xs text-slate-500">Completed:</span>
            <span className="text-sm font-medium text-white">{agent.stats.tasksCompleted ?? 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-blue-400" />
            <span className="text-xs text-slate-500">Avg:</span>
            <span className="text-sm font-medium text-white">
              {agent.stats.avgResponseTime ? `${Math.round(agent.stats.avgResponseTime)}s` : '-'}
            </span>
          </div>
        </div>
      )}
      
      {/* Health */}
      {showHealth && agent.healthEndpoint && (
        <div className="pt-3 border-t border-white/[0.06] mb-3">
          <ReachabilityIndicator
            reachable={agent.reachable ?? null}
            latencyMs={agent.latencyMs}
            size="sm"
          />
        </div>
      )}
      
      {/* Actions */}
      {showActions && (
        <div className="flex gap-2 pt-3 border-t border-white/[0.06]">
          <button
            onClick={onPause}
            className="flex-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 transition-colors flex items-center justify-center gap-1"
          >
            <Pause size={12} /> Pause
          </button>
          <button
            onClick={onConfigure}
            className="flex-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 transition-colors flex items-center justify-center gap-1"
          >
            <Settings size={12} /> Config
          </button>
        </div>
      )}
    </div>
  )
}

// Compact variant - medium-sized card for lists
function CompactCard({ agent, showHealth, onClick }: AgentCardProps) {
  // Use agent hex color for border, or fall back to generic
  const agentHexColor = agent.color && agent.color.startsWith('#') ? agent.color : undefined
  
  return (
    <div 
      className={`bg-slate-900/50 rounded-xl border p-4 transition-colors ${onClick ? 'cursor-pointer hover:bg-slate-800/50' : ''}`}
      style={{
        borderColor: agentHexColor ? `${agentHexColor}40` : 'rgba(255,255,255,0.06)',
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3 min-w-0">
          <AgentAvatar agent={agent} size="md" />
          <div className="min-w-0">
            <div className="font-semibold text-white text-sm sm:text-base truncate">{agent.name}</div>
            <div className="text-xs sm:text-sm truncate" style={{ color: agentHexColor || '#94a3b8' }}>{agent.title || agent.role}</div>
          </div>
        </div>
        <StatusBadge status={agent.status} size="sm" />
      </div>
      
      {agent.currentTask && (
        <div className="text-xs text-slate-400 mb-2 truncate">
          Working on: <span className="text-blue-400 font-mono">{agent.currentTask}</span>
        </div>
      )}
      
      {showHealth && agent.healthEndpoint && (
        <div className="pt-2 border-t border-white/[0.06]">
          <ReachabilityIndicator
            reachable={agent.reachable ?? null}
            latencyMs={agent.latencyMs}
            size="sm"
            showLatency={false}
          />
        </div>
      )}
    </div>
  )
}

// Mini variant - small row for sidebars/lists
function MiniCard({ agent, showHealth }: AgentCardProps) {
  return (
    <div className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-800/50 transition-colors">
      <AgentAvatar agent={agent} size="sm" />
      <span className="text-sm text-white font-medium flex-1 truncate">{agent.name}</span>
      {showHealth && agent.healthEndpoint && (
        <ReachabilityDot reachable={agent.reachable ?? null} size="sm" />
      )}
      <StatusDot status={agent.status} size="sm" />
    </div>
  )
}

export function AgentCard(props: AgentCardProps) {
  const { variant = 'compact' } = props
  
  switch (variant) {
    case 'full':
      return <FullCard {...props} />
    case 'mini':
      return <MiniCard {...props} />
    case 'compact':
    default:
      return <CompactCard {...props} />
  }
}
