'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface BotMember {
  id: string
  name: string
  role: string
  emoji: string
  color: string
  avatar: string
}

// Council - Top tier leadership
export const COUNCIL_MEMBERS: BotMember[] = [
  {
    id: 'caesar',
    name: 'Caesar',
    role: 'Orchestrator',
    emoji: '🔴',
    color: '#DC2626', // Red
    avatar: '/agents/caesar.png',
  },
  {
    id: 'lux',
    name: 'Lux',
    role: 'Council Member',
    emoji: '✨',
    color: '#22C55E', // Green
    avatar: '/agents/lux-lobster.png',
  },
]

// Bot Army - Specialized workers
export const BOT_ARMY: BotMember[] = [
  {
    id: 'athena',
    name: 'Athena',
    role: 'Planner',
    emoji: '🩵',
    color: '#06B6D4', // Cyan
    avatar: '/agents/athena.png',
  },
  {
    id: 'vulcan',
    name: 'Vulcan',
    role: 'Builder',
    emoji: '🔥',
    color: '#F59E0B', // Amber
    avatar: '/agents/vulcan.png',
  },
  {
    id: 'janus',
    name: 'Janus',
    role: 'Verifier',
    emoji: '🧪',
    color: '#8B5CF6', // Purple
    avatar: '/agents/janus.png',
  },
  {
    id: 'scout',
    name: 'Scout',
    role: 'Researcher',
    emoji: '🔭',
    color: '#06B6D4', // Cyan
    avatar: '/agents/scout-researcher.png',
  },
  {
    id: 'ralph',
    name: 'Ralph',
    role: 'Loop Orchestrator',
    emoji: '🔄',
    color: '#EC4899', // Pink
    avatar: '/agents/ralph.jpg',
  },
  {
    id: 'quill',
    name: 'Quill',
    role: 'Content Creator',
    emoji: '🪶',
    color: '#F97316', // Orange
    avatar: '/agents/quill-writer.svg',
  },
  {
    id: 'pixel',
    name: 'Pixel',
    role: 'Creative Director',
    emoji: '🎨',
    color: '#D946EF', // Fuchsia
    avatar: '/agents/pixel-designer.svg',
  },
  {
    id: 'sage',
    name: 'Sage',
    role: 'Data Analyst',
    emoji: '📊',
    color: '#14B8A6', // Teal
    avatar: '/agents/sage-analyst.svg',
  },
]

// All bots combined for lookups
export const ALL_BOTS = [...COUNCIL_MEMBERS, ...BOT_ARMY]

// ID aliases (OpenClaw internal IDs -> display IDs)
const BOT_ID_ALIASES: Record<string, string> = {
  'main': 'caesar',  // OpenClaw uses 'main' for Caesar
}

// Get bot by ID (handles aliases and case-insensitivity)
export function getBotById(id: string): BotMember | undefined {
  if (!id) return undefined
  const lowerId = id.toLowerCase()
  // Check aliases first
  const aliasId = BOT_ID_ALIASES[lowerId]
  if (aliasId) {
    return ALL_BOTS.find(bot => bot.id === aliasId)
  }
  // Case-insensitive lookup by id or name
  return ALL_BOTS.find(bot => 
    bot.id.toLowerCase() === lowerId || 
    bot.name.toLowerCase() === lowerId
  )
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
