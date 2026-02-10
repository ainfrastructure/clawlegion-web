'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import {
  COUNCIL_AGENTS,
  ARMY_AGENTS,
  ALL_AGENTS,
  resolveAgentId,
  getAgentById,
  type AgentConfig,
} from './agentConfig'

export type BotMember = Pick<AgentConfig, 'id' | 'name' | 'role' | 'emoji' | 'color' | 'avatar'>

// Derive from canonical agentConfig
function toBotMember(agent: AgentConfig): BotMember {
  return { id: agent.id, name: agent.name, role: agent.role, emoji: agent.emoji, color: agent.color, avatar: agent.avatar }
}

export const COUNCIL_MEMBERS: BotMember[] = COUNCIL_AGENTS.map(toBotMember)
export const BOT_ARMY: BotMember[] = ARMY_AGENTS.map(toBotMember)
export const ALL_BOTS: BotMember[] = ALL_AGENTS.map(toBotMember)

// Get bot by ID (handles aliases, OpenClaw IDs, and case-insensitivity)
export function getBotById(id: string): BotMember | undefined {
  if (!id) return undefined
  const canonicalId = resolveAgentId(id)
  if (canonicalId) {
    const agent = getAgentById(canonicalId)
    if (agent) return toBotMember(agent)
  }
  // Fallback: case-insensitive name match
  const agent = ALL_AGENTS.find(a => a.name.toLowerCase() === id.toLowerCase())
  return agent ? toBotMember(agent) : undefined
}

interface BotAvatarProps {
  bot: BotMember
  size?: 'sm' | 'md' | 'lg'
  isHovered?: boolean
  onClick?: () => void
  isSelected?: boolean
}

export function BotAvatar({ bot, size = 'md', isHovered, onClick, isSelected }: BotAvatarProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative rounded-full overflow-hidden',
        'border-2 transition-all duration-200',
        'hover:scale-110 hover:shadow-lg',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900',
        sizeClasses[size],
        isSelected && 'ring-2 ring-offset-2 ring-offset-slate-900'
      )}
      style={{
        borderColor: bot.color,
        boxShadow: isHovered || isSelected ? `0 0 12px ${bot.color}40, 0 0 0 2px ${bot.color}30` : 'none',
      }}
      title={`${bot.name} - ${bot.role}`}
    >
      <Image
        src={bot.avatar}
        alt={bot.name}
        fill
        className="object-cover"
      />
    </button>
  )
}

interface CouncilSectionProps {
  onMention?: (botName: string) => void
  selectedBotId?: string | null
}

export function CouncilSection({ onMention, selectedBotId }: CouncilSectionProps) {
  const [hoveredBot, setHoveredBot] = useState<string | null>(null)

  return (
    <div className="relative flex flex-col items-center py-4 px-4 bg-gradient-to-b from-slate-800/80 to-slate-900/50 border-b border-white/[0.06]">
      {/* Council Label */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
          ⚔️ The Council
        </span>
      </div>

      {/* Council Members - Larger, prominent */}
      <div className="flex items-center gap-6">
        {COUNCIL_MEMBERS.map((bot) => (
          <div
            key={bot.id}
            className="relative group flex flex-col items-center"
            onMouseEnter={() => setHoveredBot(bot.id)}
            onMouseLeave={() => setHoveredBot(null)}
          >
            <BotAvatar
              bot={bot}
              size="lg"
              isHovered={hoveredBot === bot.id}
              isSelected={selectedBotId === bot.id}
              onClick={() => onMention?.(`@${bot.name.toLowerCase()}`)}
            />

            {/* Name label below avatar */}
            <div className="mt-2 text-center">
              <div className="text-xs font-medium text-slate-200">{bot.name}</div>
              <div className="text-[10px] text-slate-500">{bot.role}</div>
            </div>

            {/* Online indicator */}
            <span
              className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-800"
              style={{ backgroundColor: '#22C55E' }}
            />

            {/* Hover tooltip with more info */}
            <div
              className={cn(
                'absolute -bottom-16 left-1/2 -translate-x-1/2',
                'px-3 py-2 rounded-lg bg-slate-800 border border-slate-600',

                'text-xs text-white whitespace-nowrap',
                'transition-all duration-200 z-50 shadow-xl',
                hoveredBot === bot.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
              )}
            >
              <div className="font-semibold">{bot.emoji} Click to chat</div>
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 border-l border-t border-slate-600 rotate-45" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface BotArmySectionProps {
  onMention?: (botName: string) => void
  selectedBotId?: string | null
}

export function BotArmySection({ onMention, selectedBotId }: BotArmySectionProps) {
  const [hoveredBot, setHoveredBot] = useState<string | null>(null)

  return (
    <div className="relative flex items-center justify-center gap-2 py-2 px-4 bg-slate-900/50 border-b border-slate-800">
      {/* Army Label */}
      <span className="absolute left-4 text-[10px] text-slate-600 font-medium uppercase tracking-wider">
        🤖 Bot Army
      </span>

      {/* Bot Stickers - Smaller row */}
      <div className="flex items-center gap-3">
        {BOT_ARMY.map((bot) => (
          <div
            key={bot.id}
            className="relative group"
            onMouseEnter={() => setHoveredBot(bot.id)}
            onMouseLeave={() => setHoveredBot(null)}
          >
            <BotAvatar
              bot={bot}
              size="md"
              isHovered={hoveredBot === bot.id}
              isSelected={selectedBotId === bot.id}
              onClick={() => onMention?.(`@${bot.name.toLowerCase()}`)}
            />

            {/* Tooltip */}
            <div
              className={cn(
                'absolute -bottom-14 left-1/2 -translate-x-1/2',
                'px-2 py-1 rounded-md bg-slate-800 border border-white/[0.06]',
                'text-xs text-white whitespace-nowrap',
                'transition-all duration-200 z-50',
                hoveredBot === bot.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'
              )}
            >
              <div className="font-medium">{bot.emoji} {bot.name}</div>
              <div className="text-slate-400 text-[10px]">{bot.role}</div>
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 border-l border-t border-white/[0.06] rotate-45" />
            </div>

            {/* Online indicator */}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900"
              style={{ backgroundColor: '#22C55E' }}
            />
          </div>
        ))}
      </div>

      {/* Click hint */}
      <span className="absolute right-4 text-[10px] text-slate-600">
        Click to chat →
      </span>
    </div>
  )
}

// Legacy component for backwards compatibility
interface BotArmyStickersProps {
  onMention?: (botName: string) => void
  selectedBotId?: string | null
}

export function BotArmyStickers({ onMention, selectedBotId }: BotArmyStickersProps) {
  return (
    <div>
      <CouncilSection onMention={onMention} selectedBotId={selectedBotId} />
      <BotArmySection onMention={onMention} selectedBotId={selectedBotId} />
    </div>
  )
}
