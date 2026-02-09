'use client'

import Image from 'next/image'
import { Bot, Wifi, WifiOff } from 'lucide-react'
import { StatusDot, type AgentStatus } from '@/components/ui/StatusBadge'
import { getAgentById, getAgentByName, type AgentConfig as EnrichedAgent } from '@/components/chat-v2/agentConfig'

type FleetAgentData = {
  id: string
  name: string
  emoji?: string
  avatar?: string
  role?: string
  color?: string
  status: AgentStatus
  currentTask?: string
  healthEndpoint?: string
  reachable?: boolean | null
  latencyMs?: number
}

interface FleetAgentCardProps {
  agent: FleetAgentData
  onClick?: () => void
}

export function FleetAgentCard({ agent, onClick }: FleetAgentCardProps) {
  const enriched = getAgentById(agent.id) || getAgentByName(agent.name)
  const avatarSrc = agent.avatar || enriched?.avatar
  const agentColor = agent.color || enriched?.color || '#71717a'
  const description = enriched?.description || agent.role || ''
  const capabilities = enriched?.capabilities || []
  const role = enriched?.role || agent.role || 'Agent'

  return (
    <div
      className="glass-2 rounded-2xl p-5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {/* Avatar + Status */}
      <div className="flex flex-col items-center mb-4">
        <div className="relative">
          {/* Glow ring */}
          <div
            className="absolute -inset-1.5 rounded-full opacity-30 group-hover:opacity-50 transition-opacity blur-sm"
            style={{ backgroundColor: agentColor }}
          />
          {/* Avatar */}
          <div
            className="relative w-[120px] h-[120px] rounded-full overflow-hidden ring-2 ring-offset-2 ring-offset-slate-900"
            style={{ ['--tw-ring-color' as string]: agentColor }}
          >
            {avatarSrc ? (
              <Image
                src={avatarSrc}
                alt={agent.name}
                width={120}
                height={120}
                className="w-full h-full object-cover"
              />
            ) : agent.emoji ? (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center text-5xl">
                {agent.emoji}
              </div>
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                <Bot size={48} className="text-slate-500" />
              </div>
            )}
          </div>
          {/* Status dot overlay */}
          <div className="absolute bottom-1 right-1 p-0.5 rounded-full bg-slate-900">
            <StatusDot status={agent.status} size="md" />
          </div>
        </div>
      </div>

      {/* Name + Role */}
      <div className="text-center mb-3">
        <h3 className="text-lg font-bold text-white">{agent.name}</h3>
        <p className="text-sm font-medium" style={{ color: agentColor }}>{role}</p>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-400 text-center line-clamp-2 mb-3 min-h-[2.5rem]">
        {description}
      </p>

      {/* Capability pills */}
      {capabilities.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5 mb-3">
          {capabilities.slice(0, 3).map((cap) => (
            <span
              key={cap}
              className="glass-1 text-xs text-slate-300 px-2 py-0.5 rounded-full"
            >
              {cap}
            </span>
          ))}
        </div>
      )}

      {/* Health indicator */}
      {agent.healthEndpoint && (
        <div className="flex items-center justify-center gap-1.5 text-xs pt-2 border-t border-white/[0.06]">
          {agent.reachable === null ? (
            <span className="text-slate-500">Checking...</span>
          ) : agent.reachable ? (
            <>
              <Wifi size={12} className="text-green-400" />
              <span className="text-green-400">Reachable</span>
              {agent.latencyMs !== undefined && (
                <span className="text-slate-500">({agent.latencyMs}ms)</span>
              )}
            </>
          ) : (
            <>
              <WifiOff size={12} className="text-red-400" />
              <span className="text-red-400">Unreachable</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}
