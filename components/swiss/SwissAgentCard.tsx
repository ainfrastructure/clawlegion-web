/**
 * SwissAgentCard — Agent grid item component
 *
 * Swiss Design principles:
 * - Clean card layout with agent identity
 * - Status dot for quick visual scanning
 * - Role and description in readable hierarchy
 * - 44px minimum touch target
 */
'use client'

import { ReactNode } from 'react'
import { clsx } from 'clsx'
import Link from 'next/link'

export type SwissAgentStatus = 'online' | 'busy' | 'offline'

export interface SwissAgentCardProps {
  /** Agent name */
  name: string
  /** Agent emoji or avatar */
  emoji?: string
  /** Avatar image URL */
  avatar?: string
  /** Role title */
  role: string
  /** Plain English description (2-3 sentences) */
  description?: string
  /** Agent status */
  status: SwissAgentStatus
  /** Current task link (when busy) */
  currentTaskTitle?: string
  /** Current task ID for linking */
  currentTaskId?: string
  /** Agent accent color */
  color?: string
  /** Custom className */
  className?: string
}

const statusConfig: Record<SwissAgentStatus, { dot: string; label: string }> = {
  online: {
    dot: 'bg-swiss-success',
    label: 'Online',
  },
  busy: {
    dot: 'bg-swiss-warning',
    label: 'Busy',
  },
  offline: {
    dot: 'bg-[var(--swiss-text-muted)]',
    label: 'Offline',
  },
}

export function SwissAgentCard({
  name,
  emoji,
  avatar,
  role,
  description,
  status,
  currentTaskTitle,
  currentTaskId,
  color,
  className,
}: SwissAgentCardProps) {
  const { dot, label: statusLabel } = statusConfig[status]

  return (
    <div
      className={clsx(
        'bg-[var(--swiss-surface)] border border-[var(--swiss-border)]',
        'rounded-swiss-md p-swiss-4',
        'transition-all duration-swiss ease-swiss',
        'hover:border-[var(--swiss-border-hover,var(--swiss-border))]',
        className
      )}
    >
      {/* Header: avatar + name + status */}
      <div className="flex items-start gap-swiss-3">
        {/* Avatar */}
        <div
          className={clsx(
            'flex-shrink-0 w-10 h-10 rounded-swiss-sm',
            'flex items-center justify-center text-lg',
            'bg-[var(--swiss-surface-raised)]'
          )}
          style={color ? { borderLeft: `3px solid ${color}` } : undefined}
        >
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt={name} className="w-full h-full rounded-swiss-sm object-cover" />
          ) : (
            <span>{emoji ?? '🤖'}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-swiss-2">
            <h3 className="text-swiss-base font-semibold text-[var(--swiss-text-primary)] truncate">
              {name}
            </h3>
            <div className="flex items-center gap-swiss-1 flex-shrink-0">
              <div className={clsx('w-2 h-2 rounded-full', dot)} />
              <span className="text-swiss-xs text-[var(--swiss-text-muted)]">{statusLabel}</span>
            </div>
          </div>
          <p className="text-swiss-sm text-[var(--swiss-text-tertiary)]">{role}</p>
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className="text-swiss-sm text-[var(--swiss-text-secondary)] mt-swiss-3 line-clamp-2">
          {description}
        </p>
      )}

      {/* Current task link (when busy) */}
      {status === 'busy' && currentTaskTitle && (
        <div className="mt-swiss-3 pt-swiss-3 border-t border-[var(--swiss-border-subtle)]">
          <p className="text-swiss-xs text-[var(--swiss-text-muted)] mb-swiss-1">Working on:</p>
          {currentTaskId ? (
            <Link
              href={`/tasks?taskId=${currentTaskId}`}
              className="text-swiss-sm text-[var(--swiss-accent)] hover:underline truncate block"
            >
              {currentTaskTitle}
            </Link>
          ) : (
            <p className="text-swiss-sm text-[var(--swiss-text-secondary)] truncate">
              {currentTaskTitle}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
