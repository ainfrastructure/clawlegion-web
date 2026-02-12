/**
 * SwissAgentCard — Agent display card
 *
 * Swiss Design principles:
 * - Clean card layout with emoji/avatar
 * - Status via geometric badge (not color alone)
 * - Flush-left text alignment
 * - No decorative elements
 */
'use client'

import { clsx } from 'clsx'
import { SwissStatusBadge, type SwissStatusBadgeType } from './SwissStatusBadge'
import Link from 'next/link'

export interface SwissAgentCardProps {
  /** Agent emoji */
  emoji?: string
  /** Agent name */
  name: string
  /** Agent role/title */
  role?: string
  /** Agent description */
  description?: string
  /** Agent status */
  status: string
  /** Current task info (when busy) */
  currentTask?: {
    id: string
    title: string
  } | null
  /** Custom className */
  className?: string
}

const statusToType: Record<string, SwissStatusBadgeType> = {
  online: 'success',
  busy: 'active',
  idle: 'neutral',
  offline: 'neutral',
  rate_limited: 'warning',
  error: 'error',
}

const statusLabels: Record<string, string> = {
  online: 'Online',
  busy: 'Busy',
  idle: 'Idle',
  offline: 'Offline',
  rate_limited: 'Rate Limited',
  error: 'Error',
}

export function SwissAgentCard({
  emoji,
  name,
  role,
  description,
  status,
  currentTask,
  className,
}: SwissAgentCardProps) {
  const badgeType = statusToType[status] ?? 'neutral'
  const statusLabel = statusLabels[status] ?? status

  return (
    <div
      className={clsx(
        'p-swiss-4 rounded-swiss-md',
        'bg-[var(--swiss-surface)] border border-[var(--swiss-border)]',
        'transition-all duration-swiss ease-swiss',
        className,
      )}
    >
      {/* Top row: emoji + name + status */}
      <div className="flex items-start justify-between gap-swiss-3">
        <div className="flex items-center gap-swiss-3 min-w-0">
          {emoji && (
            <span className="text-xl flex-shrink-0" aria-hidden="true">
              {emoji}
            </span>
          )}
          <div className="min-w-0">
            <h3 className="text-swiss-sm font-semibold text-[var(--swiss-text-primary)] truncate">
              {name}
            </h3>
            {role && (
              <p className="text-swiss-xs text-[var(--swiss-text-tertiary)]">
                {role}
              </p>
            )}
          </div>
        </div>
        <SwissStatusBadge label={statusLabel} type={badgeType} dot size="sm" />
      </div>

      {/* Description */}
      {description && (
        <p className="text-swiss-xs text-[var(--swiss-text-secondary)] mt-swiss-3 line-clamp-2">
          {description}
        </p>
      )}

      {/* Current task (when busy) */}
      {currentTask && (
        <div className="mt-swiss-3 pt-swiss-3 border-t border-[var(--swiss-border-subtle)]">
          <p className="text-swiss-xs text-[var(--swiss-text-tertiary)]">Working on</p>
          <Link
            href={`/tasks?taskId=${currentTask.id}`}
            className="text-swiss-xs text-[var(--swiss-accent)] hover:underline truncate block mt-swiss-1"
          >
            {currentTask.title}
          </Link>
        </div>
      )}
    </div>
  )
}
