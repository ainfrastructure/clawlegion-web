'use client'

import Image from 'next/image'
import { Bot } from 'lucide-react'
import { StatusDot, type AgentStatus } from '../agents/StatusBadge'

// Status can come as various strings from API - we normalize it
type StatusInput = AgentStatus | 'active' | string

export interface MobileAgentData {
  id: string
  name: string
  emoji?: string
  avatar?: string
  status: StatusInput
  currentTask?: string
  color?: string
}

// Normalize API status to our AgentStatus type
function normalizeStatus(status: StatusInput): AgentStatus {
  if (status === 'active') return 'online'
  if (['online', 'busy', 'idle', 'offline', 'rate_limited'].includes(status)) {
    return status as AgentStatus
  }
  return 'offline' // default fallback
}

interface MobileAgentScrollerProps {
  agents: MobileAgentData[]
  isLoading?: boolean
  className?: string
}

const colorMap: Record<string, string> = {
  blue: 'border-blue-500/50',
  purple: 'border-purple-500/50',
  amber: 'border-amber-500/50',
  green: 'border-green-500/50',
  cyan: 'border-cyan-500/50',
  pink: 'border-pink-500/50',
  red: 'border-red-500/50',
  slate: 'border-slate-500/50',
}

function MobileAgentAvatar({ agent }: { agent: MobileAgentData }) {
  if (agent.avatar) {
    return (
      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 flex-shrink-0 ring-2 ring-slate-700">
        <Image
          src={agent.avatar}
          alt={agent.name}
          width={48}
          height={48}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }
  
  if (agent.emoji) {
    return (
      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 ring-2 ring-slate-700">
        <span className="text-2xl">{agent.emoji}</span>
      </div>
    )
  }
  
  return (
    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 ring-2 ring-slate-700">
      <Bot className="text-slate-400" size={24} />
    </div>
  )
}

function MobileAgentCard({ agent }: { agent: MobileAgentData }) {
  const borderColor = colorMap[agent.color ?? 'slate'] ?? colorMap.slate
  const normalizedStatus = normalizeStatus(agent.status)
  
  return (
    <div 
      className={`snap-start flex-shrink-0 w-32 bg-slate-800/80 rounded-xl border ${borderColor} p-3 flex flex-col items-center`}
    >
      <div className="relative mb-2">
        <MobileAgentAvatar agent={agent} />
        <div className="absolute -bottom-1 -right-1">
          <StatusDot status={normalizedStatus} size="md" />
        </div>
      </div>
      
      <div className="text-sm font-medium text-white text-center truncate w-full">
        {agent.name}
      </div>
      
      {agent.currentTask ? (
        <div className="text-xs text-blue-400 text-center truncate w-full mt-1">
          {agent.currentTask.length > 15 
            ? agent.currentTask.slice(0, 15) + '...' 
            : agent.currentTask}
        </div>
      ) : (
        <div className="text-xs text-slate-500 text-center mt-1 capitalize">
          {normalizedStatus === 'online' ? 'Ready' : normalizedStatus.replace(/_/g, ' ')}
        </div>
      )}
    </div>
  )
}

function LoadingCard() {
  return (
    <div className="snap-start flex-shrink-0 w-32 glass-2 rounded-xl p-3 flex flex-col items-center animate-pulse">
      <div className="w-12 h-12 rounded-full bg-slate-700 mb-2" />
      <div className="w-16 h-4 bg-slate-700 rounded mb-1" />
      <div className="w-12 h-3 bg-slate-700 rounded" />
    </div>
  )
}

export function MobileAgentScroller({ agents, isLoading, className = '' }: MobileAgentScrollerProps) {
  if (isLoading) {
    return (
      <div className={`overflow-x-auto snap-x snap-mandatory -mx-4 px-4 scrollbar-hide ${className}`}>
        <div className="flex gap-3 pb-2">
          {[1, 2, 3, 4].map(i => (
            <LoadingCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (agents.length === 0) {
    return (
      <div className={`text-center text-slate-400 py-4 ${className}`}>
        No agents registered
      </div>
    )
  }

  return (
    <div className={`overflow-x-auto snap-x snap-mandatory -mx-4 px-4 scrollbar-hide ${className}`}>
      <div className="flex gap-3 pb-2">
        {agents.map(agent => (
          <MobileAgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  )
}
