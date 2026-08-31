/**
 * SwissAgentCard — Agent info card
 *
 * Specs:
 *   Emoji/avatar, name, role description
 *   Online/busy/offline status dot
 *   Current task link
 *   Surface bg, 24px padding, 12px radius
 */
'use client'

import { clsx } from 'clsx'
import { SwissStatusDot, type SwissStatusDotColor } from './SwissStatusDot'

export type SwissAgentStatus = 'online' | 'busy' | 'offline'

export interface SwissAgentCardProps {
  /** Agent name */
  name: string
  /** Emoji or avatar character */
  avatar: string
  /** Role description */
  role: string
  /** Agent status */
  status: SwissAgentStatus
  /** Currently assigned task (optional link) */
  currentTask?: {
    id: string
    title: string
    onClick?: () => void
  }
  /** Click handler for the card */
  onClick?: () => void
  /** Custom className */
  className?: string
}

const statusToColor: Record<SwissAgentStatus, SwissStatusDotColor> = {
  online: 'green',
  busy: 'yellow',
  offline: 'red',
}

const statusLabel: Record<SwissAgentStatus, string> = {
  online: 'Online',
  busy: 'Busy',
  offline: 'Offline',
}

export function SwissAgentCard({
  name,
  avatar,
  role,
  status,
  currentTask,
  onClick,
  className,
}: SwissAgentCardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-swiss-surface border border-swiss-border',
        'p-swiss-lg rounded-swiss',
        onClick && 'cursor-pointer hover:bg-swiss-elevated transition-colors duration-150',
        className
      )}
    >
      {/* Header: avatar + name + status */}
      <div className="flex items-center gap-swiss-sm">
        {/* Avatar */}
        <span className="text-xl flex-shrink-0" role="img" aria-label={`${name} avatar`}>
          {avatar}
        </span>

        {/* Name + role */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-swiss-sm">
            <span className="text-swiss-body font-medium text-swiss-text-primary truncate font-swiss">
              {name}
            </span>
            <SwissStatusDot color={statusToColor[status]} label={`${name} is ${statusLabel[status]}`} />
          </div>
          <p className="text-swiss-caption text-swiss-text-tertiary truncate font-swiss mt-0.5">
            {role}
          </p>
        </div>
      </div>

      {/* Current task */}
      {currentTask && (
        <div className="mt-swiss-md pt-swiss-sm border-t border-swiss-border">
          <span className="swiss-label block mb-1">Current Task</span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              currentTask.onClick?.()
            }}
            className={clsx(
              'text-swiss-caption text-swiss-accent hover:underline truncate block text-left w-full font-swiss',
              !currentTask.onClick && 'pointer-events-none'
            )}
          >
            <span className="font-swiss-mono text-swiss-text-tertiary mr-1">{currentTask.id}</span>
            {currentTask.title}
          </button>
        </div>
      )}
    </div>
  )
}
