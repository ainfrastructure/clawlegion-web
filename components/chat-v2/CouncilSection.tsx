'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Crown, Loader2 } from 'lucide-react'
import { useAgentList } from '@/hooks/useAgentConfig'
import { getCouncilMembers, FALLBACK_COUNCIL, type AgentDisplay } from '@/lib/agents'

interface CouncilAvatarProps {
  member: AgentDisplay
  isHovered?: boolean
  isSelected?: boolean
  onClick?: () => void
}

function CouncilAvatar({ member, isHovered, isSelected, onClick }: CouncilAvatarProps) {
  const borderColor = member.borderColor || member.color

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative w-14 h-14 rounded-full overflow-hidden',
        'border-[3px] transition-all duration-300 ease-out',
        'hover:scale-110',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900',
        isSelected && 'scale-105'
      )}
      style={{
        borderColor: borderColor,
        boxShadow: isHovered || isSelected 
          ? `0 0 20px ${borderColor}60, 0 0 40px ${borderColor}30, inset 0 0 15px ${borderColor}20` 
          : `0 0 10px ${borderColor}30`,
      }}
      title={`${member.name} - ${member.role}`}
    >
      <Image
        src={member.avatar}
        alt={member.name}
        fill
        sizes="56px"
        className="object-cover"
      />
      
      {/* Selected ring */}
      {isSelected && (
        <div 
          className="absolute inset-0 rounded-full border-2 animate-pulse"
          style={{ borderColor: borderColor }}
        />
      )}
    </button>
  )
}

interface CouncilSectionProps {
  selectedBotId?: string | null
  onSelect?: (botId: string) => void
}

export function CouncilSection({ selectedBotId, onSelect }: CouncilSectionProps) {
  const [hoveredBot, setHoveredBot] = useState<string | null>(null)
  const { data, isLoading } = useAgentList()
  
  // Transform API data to display format, fallback to static data
  const councilMembers = data?.agents 
    ? getCouncilMembers(data.agents)
    : FALLBACK_COUNCIL

  return (
    <div className="relative flex flex-col items-center py-5 px-4 bg-gradient-to-b from-slate-800/90 via-slate-800/70 to-slate-900/50 border-b border-amber-900/30">
      {/* Decorative top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      
      {/* Council Label */}
      <div className="flex items-center gap-2 mb-4">
        <Crown className="w-4 h-4 text-amber-500" />
        <span className="text-xs font-bold text-amber-500 uppercase tracking-[0.2em]">
          The Council
        </span>
        <Crown className="w-4 h-4 text-amber-500" />
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
        </div>
      )}

      {/* Council Members - Large, premium styling */}
      {!isLoading && (
        <div className="flex items-center gap-8">
          {councilMembers.map((member) => (
            <div
              key={member.id}
              className="relative group flex flex-col items-center"
              onMouseEnter={() => setHoveredBot(member.id)}
              onMouseLeave={() => setHoveredBot(null)}
            >
              <CouncilAvatar
                member={member}
                isHovered={hoveredBot === member.id}
                isSelected={selectedBotId === member.id}
                onClick={() => onSelect?.(member.id)}
              />

              {/* Name label below avatar */}
              <div className="mt-3 text-center">
                <div 
                  className="text-sm font-semibold transition-colors"
                  style={{ color: selectedBotId === member.id ? member.color : '#e4e4e7' }}
                >
                  {member.name}
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                  {member.role}
                </div>
              </div>

              {/* Online indicator */}
              <span
                className="absolute top-0 right-0 w-4 h-4 rounded-full border-2 border-slate-800 animate-pulse"
                style={{ backgroundColor: '#22C55E' }}
              />

              {/* Hover tooltip */}
              <div
                className={cn(
                  'absolute -bottom-20 left-1/2 -translate-x-1/2',
                  'px-3 py-2 rounded-lg',
                  'bg-slate-900/95 backdrop-blur border border-white/[0.06]',
                  'text-xs text-white whitespace-nowrap',
                  'transition-all duration-200 z-50 shadow-xl',
                  hoveredBot === member.id 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-2 pointer-events-none'
                )}
              >
                <div className="font-semibold flex items-center gap-1.5">
                  <span>{member.emoji}</span>
                  <span>Click to chat</span>
                </div>
                <div 
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
                  style={{ 
                    backgroundColor: 'rgb(24 24 27 / 0.95)',
                    borderLeft: '1px solid rgb(63 63 70)',
                    borderTop: '1px solid rgb(63 63 70)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
