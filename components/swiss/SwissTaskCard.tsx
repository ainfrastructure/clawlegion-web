/**
 * SwissTaskCard — Clean task display component
 *
 * Swiss Design principles:
 * - Left-aligned, clear hierarchy
 * - Status via geometric badge, not color alone
 * - Minimal decoration
 * - 4px grid spacing
 */
'use client'

import { ReactNode } from 'react'
import { clsx } from 'clsx'
import { SwissStatusBadge, type SwissStatusBadgeType } from './SwissStatusBadge'

export interface SwissTaskCardProps {
  /** Task title */
  title: string
  /** Task status */
  status: string
  /** Priority label */
  priority?: string
  /** Assigned agent/user */
  assignee?: string
  /** Optional score (0-100) */
  score?: number | null
  /** Click handler */
  onClick?: () => void
  /** Custom className */
  className?: string
}

const statusToType: Record<string, SwissStatusBadgeType> = {
  in_progress: 'active',
  building: 'active',
  researching: 'info',
  planning: 'info',
  verifying: 'warning',
  done: 'success',
  completed: 'success',
  failed: 'error',
  blocked: 'error',
  backlog: 'neutral',
  pending: 'neutral',
  open: 'neutral',
}

const statusLabels: Record<string, string> = {
  in_progress: 'In Progress',
  building: 'Building',
  researching: 'Researching',
  planning: 'Planning',
  verifying: 'Verifying',
  done: 'Done',
  completed: 'Done',
  failed: 'Failed',
  blocked: 'Blocked',
  backlog: 'Backlog',
  pending: 'Pending',
  open: 'Open',
}

const priorityColors: Record<string, string> = {
  P0: 'text-[var(--swiss-error)]',
  P1: 'text-[var(--swiss-warning)]',
  P2: 'text-[var(--swiss-text-secondary)]',
  P3: 'text-[var(--swiss-text-tertiary)]',
  urgent: 'text-[var(--swiss-error)]',
  high: 'text-[var(--swiss-warning)]',
  normal: 'text-[var(--swiss-text-secondary)]',
  low: 'text-[var(--swiss-text-tertiary)]',
}

export function SwissTaskCard({
  title,
  status,
  priority,
  assignee,
  score,
  onClick,
  className,
}: SwissTaskCardProps) {
  const badgeType = statusToType[status] ?? 'neutral'
  const label = statusLabels[status] ?? status

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } } : undefined}
      className={clsx(
        'flex items-center justify-between',
        'p-swiss-4 rounded-swiss-md',
        'bg-[var(--swiss-surface)] border border-[var(--swiss-border)]',
        'transition-all duration-swiss ease-swiss',
        onClick && 'cursor-pointer hover:border-[var(--swiss-accent)] focus-visible:outline-2 focus-visible:outline-[var(--swiss-accent)] focus-visible:outline-offset-2',
        className,
      )}
    >
      <div className="flex-1 min-w-0 mr-swiss-4">
        <p className="text-swiss-sm font-medium text-[var(--swiss-text-primary)] truncate">
          {title}
        </p>
        <div className="flex items-center gap-swiss-3 mt-swiss-1">
          {assignee && (
            <span className="text-swiss-xs text-[var(--swiss-text-tertiary)]">
              {assignee}
            </span>
          )}
          {priority && (
            <span className={clsx('text-swiss-xs font-medium', priorityColors[priority] ?? 'text-[var(--swiss-text-muted)]')}>
              {priority}
            </span>
          )}
          {score != null && (
            <span className="text-swiss-xs text-[var(--swiss-text-muted)] tabular-nums">
              {score}/100
            </span>
          )}
        </div>
      </div>
      <SwissStatusBadge label={label} type={badgeType} dot size="sm" />
    </div>
  )
}
