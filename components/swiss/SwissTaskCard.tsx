/**
 * SwissTaskCard — Task list item component
 *
 * Swiss Design principles:
 * - Clean horizontal layout, no decorative elements
 * - Status dot for quick scanning
 * - Priority badge with semantic color
 * - Asymmetrical typography: title prominent, metadata subdued
 * - 44px minimum touch target for mobile
 */
'use client'

import { clsx } from 'clsx'
import { SwissStatusBadge, type SwissStatusBadgeType } from './SwissStatusBadge'

export interface SwissTaskCardProps {
  /** Task ID (short form) */
  taskId?: string
  /** Task title */
  title: string
  /** Task status */
  status: string
  /** Human-readable status label */
  statusLabel?: string
  /** Priority level */
  priority?: string
  /** Assigned agent name */
  assignee?: string
  /** Created date string */
  createdAt?: string
  /** Click handler */
  onClick?: () => void
  /** Custom className */
  className?: string
}

const statusToBadgeType: Record<string, SwissStatusBadgeType> = {
  in_progress: 'active',
  building: 'active',
  researching: 'active',
  planning: 'active',
  verifying: 'info',
  done: 'success',
  completed: 'success',
  failed: 'error',
  backlog: 'neutral',
  todo: 'neutral',
  queued: 'neutral',
  assigned: 'warning',
}

const statusToLabel: Record<string, string> = {
  in_progress: 'In Progress',
  building: 'Building',
  researching: 'Researching',
  planning: 'Planning',
  verifying: 'Verifying',
  done: 'Done',
  completed: 'Done',
  failed: 'Failed',
  backlog: 'Backlog',
  todo: 'To Do',
  queued: 'Queued',
  assigned: 'Assigned',
}

const priorityStyles: Record<string, string> = {
  P0: 'text-swiss-error',
  P1: 'text-swiss-warning',
  P2: 'text-[var(--swiss-text-secondary)]',
  P3: 'text-[var(--swiss-text-muted)]',
  high: 'text-swiss-error',
  medium: 'text-swiss-warning',
  low: 'text-[var(--swiss-text-muted)]',
}

export function SwissTaskCard({
  taskId,
  title,
  status,
  statusLabel,
  priority,
  assignee,
  createdAt,
  onClick,
  className,
}: SwissTaskCardProps) {
  const badgeType = statusToBadgeType[status] ?? 'neutral'
  const label = statusLabel ?? statusToLabel[status] ?? status

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'w-full text-left flex items-center gap-swiss-3',
        'px-swiss-4 py-swiss-3',
        'bg-[var(--swiss-surface)] border border-[var(--swiss-border)]',
        'rounded-swiss-md',
        'transition-all duration-swiss ease-swiss',
        'hover:border-[var(--swiss-accent)] hover:shadow-swiss-sm',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--swiss-accent)]',
        'min-h-[44px]',
        className
      )}
    >
      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-swiss-2">
          {taskId && (
            <span className="swiss-mono text-swiss-xs text-[var(--swiss-text-muted)] flex-shrink-0">
              {taskId}
            </span>
          )}
          <p className="text-swiss-sm font-medium text-[var(--swiss-text-primary)] truncate">
            {title}
          </p>
        </div>
        {(assignee || createdAt) && (
          <div className="flex items-center gap-swiss-2 mt-swiss-1">
            {assignee && (
              <span className="text-swiss-xs text-[var(--swiss-text-tertiary)]">
                {assignee}
              </span>
            )}
            {assignee && createdAt && (
              <span className="text-swiss-xs text-[var(--swiss-text-muted)]">·</span>
            )}
            {createdAt && (
              <span className="swiss-mono text-swiss-xs text-[var(--swiss-text-muted)]">
                {createdAt}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right side: priority + status */}
      <div className="flex items-center gap-swiss-3 flex-shrink-0">
        {priority && (
          <span className={clsx(
            'swiss-mono text-swiss-xs font-medium',
            priorityStyles[priority] ?? 'text-[var(--swiss-text-muted)]'
          )}>
            {priority}
          </span>
        )}
        <SwissStatusBadge label={label} type={badgeType} dot size="sm" />
      </div>
    </button>
  )
}
