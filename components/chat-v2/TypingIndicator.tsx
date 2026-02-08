'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { getAgentById, type AgentConfig } from './agentConfig'

export interface TypingIndicatorProps {
  /** Bot ID or name that is typing */
  botId?: string
  /** Custom bot info (if not in standard list) */
  customBot?: {
    name: string
    avatar?: string
    color?: string
  }
  /** Compact mode - just dots, no text */
  compact?: boolean
}

export function TypingIndicator({ botId, customBot, compact = false }: TypingIndicatorProps) {
  // Get bot info from agentConfig
  const agent = botId ? getAgentById(botId) : null
  const displayName = agent?.name || customBot?.name || 'Someone'
  const avatarSrc = agent?.avatar || customBot?.avatar
  const color = agent?.color || customBot?.color || '#DC2626'

  if (compact) {
    return (
      <div className="flex items-center gap-1 px-2">
        {avatarSrc && (
          <div
            className="w-4 h-4 rounded-full overflow-hidden border animate-pulse"
            style={{ borderColor: color }}
          >
            <Image
              src={avatarSrc}
              alt={displayName}
              width={16}
              height={16}
              className="object-cover"
            />
          </div>
        )}
        <TypingDots color={color} size="sm" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-800/30">
      {/* Avatar with pulse animation */}
      {avatarSrc && (
        <div
          className="relative w-7 h-7 rounded-full overflow-hidden border-2"
          style={{ 
            borderColor: color,
            boxShadow: `0 0 10px ${color}40`,
          }}
        >
          <Image
            src={avatarSrc}
            alt={displayName}
            fill
            className="object-cover animate-pulse"
          />
        </div>
      )}

      {/* Typing text */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-400">
          <span className="font-medium" style={{ color }}>
            {displayName}
          </span>
          {' is typing'}
        </span>
        <TypingDots color={color} />
      </div>
    </div>
  )
}

interface TypingDotsProps {
  color?: string
  size?: 'sm' | 'md'
}

export function TypingDots({ color = '#DC2626', size = 'md' }: TypingDotsProps) {
  const dotSize = size === 'sm' ? 'w-1 h-1' : 'w-1.5 h-1.5'

  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            'rounded-full animate-bounce',
            dotSize
          )}
          style={{
            backgroundColor: color,
            animationDelay: `${i * 150}ms`,
            animationDuration: '600ms',
          }}
        />
      ))}
    </div>
  )
}

interface MultipleTypingIndicatorProps {
  /** Array of bot IDs that are typing */
  botIds: string[]
}

export function MultipleTypingIndicator({ botIds }: MultipleTypingIndicatorProps) {
  if (botIds.length === 0) return null

  const agents = botIds.map(id => getAgentById(id)).filter(Boolean) as AgentConfig[]

  if (agents.length === 0) return null

  // Show stacked avatars for multiple bots
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-800/30">
      {/* Stacked avatars */}
      <div className="flex -space-x-2">
        {agents.slice(0, 3).map((agent, i) => (
          <div
            key={agent.id}
            className="relative w-7 h-7 rounded-full overflow-hidden border-2"
            style={{
              borderColor: agent.color,
              zIndex: 3 - i,
              boxShadow: `0 0 10px ${agent.color}40`,
            }}
          >
            <Image
              src={agent.avatar}
              alt={agent.name}
              fill
              className="object-cover animate-pulse"
            />
          </div>
        ))}
      </div>

      {/* Text */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-400">
          {agents.length === 1 ? (
            <>
              <span className="font-medium" style={{ color: agents[0].color }}>
                {agents[0].name}
              </span>
              {' is typing'}
            </>
          ) : agents.length === 2 ? (
            <>
              <span className="font-medium" style={{ color: agents[0].color }}>
                {agents[0].name}
              </span>
              {' and '}
              <span className="font-medium" style={{ color: agents[1].color }}>
                {agents[1].name}
              </span>
              {' are typing'}
            </>
          ) : (
            <>
              <span className="font-medium">{agents.length} bots</span>
              {' are typing'}
            </>
          )}
        </span>
        <TypingDots />
      </div>
    </div>
  )
}
