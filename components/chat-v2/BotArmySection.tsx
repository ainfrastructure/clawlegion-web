'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Bot, Loader2 } from 'lucide-react'
import { useAgentList } from '@/hooks/useAgentConfig'
import { getBotArmy, FALLBACK_BOT_ARMY, type AgentDisplay } from '@/lib/agents'

interface ArmyAvatarProps {
  member: AgentDisplay
  isHovered?: boolean
  isSelected?: boolean
  onClick?: () => void
}

function ArmyAvatar({ member, isHovered, isSelected, onClick }: ArmyAvatarProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative w-10 h-10 rounded-full overflow-hidden',
        'border-2 transition-all duration-200 ease-out',
        'hover:scale-110',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900',
        isSelected && 'scale-105'
      )}
      style={{
        borderColor: member.color,
        boxShadow: isHovered || isSelected 
          ? `0 0 12px ${member.color}50, 0 0 0 2px ${member.color}30` 
          : 'none',
      }}
      title={`${member.name} - ${member.role}`}
    >
      <Image
        src={member.avatar}
        alt={member.name}
        fill
        sizes="40px"
        className="object-cover"
      />
      
      {/* Selected indicator */}
      {isSelected && (
        <div 
          className="absolute inset-0 rounded-full border animate-pulse"
          style={{ borderColor: member.color }}
        />
      )}
    </button>
  )
}

interface BotArmySectionProps {
  selectedBotId?: string | null
  onSelect?: (botId: string) => void
}

export function BotArmySection({ selectedBotId, onSelect }: BotArmySectionProps) {
  const [hoveredBot, setHoveredBot] = useState<string | null>(null)
  const { data, isLoading } = useAgentList()
  
  // Transform API data to display format, fallback to static data
  const botArmy = data?.agents 
    ? getBotArmy(data.agents)
    : FALLBACK_BOT_ARMY

  return (
    <div className="relative flex items-center justify-center gap-3 py-3 px-4 bg-slate-900/70 border-b border-slate-800">
      {/* Army Label - Left side */}
      <div className="absolute left-4 flex items-center gap-1.5">
        <Bot className="w-3 h-3 text-slate-600" />
        <span className="text-[10px] text-slate-600 font-medium uppercase tracking-wider">
          Bot Army
        </span>
      </div>

      {/* Loading state */}
      {isLoading && (
        <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
      )}

      {/* Bot Stickers - Smaller row */}
      {!isLoading && (
        <div className="flex items-center gap-4">
          {botArmy.map((member) => (
            <div
              key={member.id}
              className="relative group flex flex-col items-center"
              onMouseEnter={() => setHoveredBot(member.id)}
              onMouseLeave={() => setHoveredBot(null)}
            >
              <ArmyAvatar
                member={member}
                isHovered={hoveredBot === member.id}
                isSelected={selectedBotId === member.id}
                onClick={() => onSelect?.(member.id)}
              />

              {/* Tooltip on hover */}
              <div
                className={cn(
                  'absolute -bottom-16 left-1/2 -translate-x-1/2',
                  'px-2.5 py-1.5 rounded-md',
                  'bg-slate-800/95 backdrop-blur border border-white/[0.06]',
                  'text-xs text-white whitespace-nowrap',
                  'transition-all duration-200 z-50',
                  hoveredBot === member.id 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-1 pointer-events-none'
                )}
              >
                <div className="font-medium flex items-center gap-1">
                  <span>{member.emoji}</span>
                  <span style={{ color: member.color }}>{member.name}</span>
                </div>
                <div className="text-slate-400 text-[10px] text-center">{member.role}</div>
                <div 
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
                  style={{ 
                    backgroundColor: 'rgb(39 39 42 / 0.95)',
                    borderLeft: '1px solid rgb(63 63 70)',
                    borderTop: '1px solid rgb(63 63 70)',
                  }}
                />
              </div>

              {/* Online indicator */}
              <span
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900"
                style={{ backgroundColor: '#22C55E' }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Click hint - Right side */}
      <span className="absolute right-4 text-[10px] text-slate-600">
        Click to chat →
      </span>
    </div>
  )
}
