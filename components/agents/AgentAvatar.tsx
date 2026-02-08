'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Bot } from 'lucide-react'

// Agent avatar mapping - paths relative to public folder
const agentAvatars: Record<string, string> = {
  jarvis: '/agents/jarvis-lobster.png',
  lux: '/agents/lux-lobster.png',
  archie: '/agents/archie-planner.png',
  mason: '/agents/mason-builder.png',
  vex: '/agents/vex-verifier.png',
  scout: '/agents/scout-researcher.png',
}

// Agent display names
const agentNames: Record<string, string> = {
  jarvis: 'Jarvis',
  lux: 'Lux',
  archie: 'Archie',
  mason: 'Mason',
  vex: 'Vex',
  scout: 'Scout',
}

// Agent colors for fallback
const agentColors: Record<string, string> = {
  jarvis: 'bg-blue-600',
  lux: 'bg-pink-600',
  archie: 'bg-purple-600',
  mason: 'bg-amber-600',
  vex: 'bg-green-600',
  scout: 'bg-cyan-600',
}

const sizeClasses = {
  xs: 'w-5 h-5 text-[10px]',
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
  xl: 'w-12 h-12 text-lg',
}

const sizePx = {
  xs: 20,
  sm: 24,
  md: 32,
  lg: 40,
  xl: 48,
}

const iconSizes = {
  xs: 10,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
}

export interface AgentAvatarProps {
  /** Agent ID (e.g., 'jarvis', 'lux', 'mason') */
  agentId: string
  /** Size of the avatar */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Show agent name alongside avatar */
  showName?: boolean
  /** Additional CSS classes */
  className?: string
  /** Name container additional CSS classes */
  nameClassName?: string
}

function getInitials(name: string): string {
  return name.charAt(0).toUpperCase()
}

function normalizeAgentId(agentId: string): string {
  return agentId.toLowerCase().trim()
}

export function AgentAvatar({ 
  agentId, 
  size = 'md', 
  showName = false, 
  className,
  nameClassName 
}: AgentAvatarProps) {
  const normalizedId = normalizeAgentId(agentId)
  const avatarSrc = agentAvatars[normalizedId]
  const displayName = agentNames[normalizedId] || agentId
  const bgColor = agentColors[normalizedId] || 'bg-slate-600'
  const dimension = sizePx[size]
  
  const avatarElement = avatarSrc ? (
    <Image
      src={avatarSrc}
      alt={displayName}
      width={dimension}
      height={dimension}
      className={cn(
        'rounded-full object-cover flex-shrink-0',
        sizeClasses[size],
        className
      )}
      unoptimized
    />
  ) : (
    // Fallback: initials or bot icon
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-medium text-white flex-shrink-0',
        sizeClasses[size],
        bgColor,
        className
      )}
      title={displayName}
    >
      {normalizedId && agentNames[normalizedId] ? (
        getInitials(displayName)
      ) : (
        <Bot size={iconSizes[size]} />
      )}
    </div>
  )
  
  if (!showName) {
    return avatarElement
  }
  
  return (
    <div className="flex items-center gap-2">
      {avatarElement}
      <span className={cn('font-medium', nameClassName)}>{displayName}</span>
    </div>
  )
}

// Export the avatar mapping for use elsewhere
export { agentAvatars, agentNames, agentColors }

export default AgentAvatar
