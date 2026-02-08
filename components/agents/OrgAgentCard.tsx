'use client'

import Image from 'next/image'
import { Bot } from 'lucide-react'
import { StatusDot, type AgentStatus } from './StatusBadge'
import { getAgentById, getAgentByName } from '@/components/chat-v2/agentConfig'

type OrgAgentData = {
  id: string
  name: string
  emoji?: string
  avatar?: string
  role?: string
  color?: string
  status: AgentStatus
  currentTask?: string
}

interface OrgAgentCardProps {
  agent: OrgAgentData
  onClick?: () => void
  variant?: 'default' | 'featured'
}

export function OrgAgentCard({ agent, onClick, variant = 'default' }: OrgAgentCardProps) {
  const enriched = getAgentById(agent.id) || getAgentByName(agent.name)
  const avatarSrc = agent.avatar || enriched?.avatar
  const agentColor = agent.color || enriched?.color || '#71717a'
  const description = enriched?.description || ''
  const capabilities = enriched?.capabilities || []
  const role = agent.role || enriched?.role || 'Agent'
  const isFeatured = variant === 'featured'

  const avatarSize = isFeatured ? 144 : 112

  return (
    <div
      className="relative group cursor-pointer"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {/* Outer glow on hover */}
      <div
        className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
        style={{ background: `linear-gradient(135deg, ${agentColor}40, transparent 60%)` }}
      />

      {/* Card body */}
      <div className={`relative rounded-2xl overflow-hidden bg-slate-900/80 border border-white/[0.06] group-hover:border-white/[0.12] transition-all duration-300 ${isFeatured ? 'p-6' : 'p-5'}`}>
        {/* Avatar + Status */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative">
            {/* Animated glow ring */}
            <div
              className="absolute -inset-2 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-500 blur-md"
              style={{ backgroundColor: agentColor }}
            />

            {/* Avatar circle */}
            <div
              className="relative rounded-full overflow-hidden ring-2 ring-offset-2 ring-offset-slate-900 group-hover:ring-offset-[3px] transition-all duration-300"
              style={{
                width: avatarSize,
                height: avatarSize,
                ['--tw-ring-color' as string]: agentColor,
              }}
            >
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt={agent.name}
                  width={avatarSize}
                  height={avatarSize}
                  className="w-full h-full object-cover object-center scale-100 group-hover:scale-[1.06] transition-transform duration-700"
                />
              ) : agent.emoji ? (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-5xl">
                  {agent.emoji}
                </div>
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                  <Bot size={isFeatured ? 56 : 44} className="text-slate-600" />
                </div>
              )}
            </div>

            {/* Status dot — bottom-right of circle */}
            <div className="absolute bottom-1 right-1 p-[3px] rounded-full bg-slate-900">
              <StatusDot status={agent.status} size="md" />
            </div>
          </div>
        </div>

        {/* Name + Role */}
        <div className="text-center mb-3">
          <h3 className={`font-bold text-white ${isFeatured ? 'text-xl' : 'text-lg'} leading-tight`}>
            {agent.name}
          </h3>
          <span
            className="text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: agentColor }}
          >
            {role}
          </span>
        </div>

        {/* Description */}
        <p className={`text-slate-400 text-center line-clamp-2 mb-3 min-h-[2.5rem] ${isFeatured ? 'text-sm' : 'text-xs'} leading-relaxed`}>
          {description}
        </p>

        {/* Capability pills */}
        {capabilities.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mb-3">
            {capabilities.slice(0, isFeatured ? 4 : 3).map((cap) => (
              <span
                key={cap}
                className="text-[10px] px-2.5 py-0.5 rounded-full border"
                style={{
                  borderColor: `${agentColor}30`,
                  color: `${agentColor}cc`,
                  backgroundColor: `${agentColor}08`,
                }}
              >
                {cap}
              </span>
            ))}
          </div>
        )}

        {/* Current task indicator */}
        {agent.currentTask && (
          <div className="mt-2 pt-2 border-t border-white/[0.06]">
            <p className="text-[10px] text-slate-500 text-center truncate">
              Working on: <span className="text-slate-400">{agent.currentTask}</span>
            </p>
          </div>
        )}

        {/* Bottom accent line */}
        <div
          className="absolute bottom-0 inset-x-0 h-px opacity-40 group-hover:opacity-70 transition-opacity duration-500"
          style={{ background: `linear-gradient(to right, ${agentColor}, transparent)` }}
        />
      </div>
    </div>
  )
}
