/**
 * SwissTaskCard — Task in list format
 *
 * Specs:
 *   Left color border for status
 *   Task ID, title, agent name, priority badge, status dot
 *   Surface bg, subtle border
 */
'use client'

import { clsx } from 'clsx'
import { SwissStatusDot, type SwissStatusDotColor } from './SwissStatusDot'

export type SwissTaskPriority = 'P0' | 'P1' | 'P2' | 'P3'
export type SwissTaskStatus = 'done' | 'in_progress' | 'error' | 'planning' | 'todo'

export interface SwissTaskCardProps {
  /** Task ID (e.g. "TSK-042") */
  taskId: string
  /** Task title */
  title: string
  /** Assigned agent name */
  agent?: string
  /** Priority level */
  priority?: SwissTaskPriority
  /** Task status */
  status: SwissTaskStatus
  /** Click handler */
  onClick?: () => void
  /** Custom className */
  className?: string
}

const statusToColor: Record<SwissTaskStatus, SwissStatusDotColor> = {
  done: 'green',
  in_progress: 'yellow',
  error: 'red',
  planning: 'blue',
  todo: 'yellow',
}

const statusToBorderColor: Record<SwissTaskStatus, string> = {
  done: 'border-l-swiss-success',
  in_progress: 'border-l-swiss-warning',
  error: 'border-l-swiss-error',
  planning: 'border-l-swiss-accent',
  todo: 'border-l-swiss-border',
}

const priorityStyles: Record<SwissTaskPriority, string> = {
  P0: 'bg-swiss-error/15 text-swiss-error',
  P1: 'bg-swiss-warning/15 text-swiss-warning',
  P2: 'bg-swiss-accent/15 text-swiss-accent',
  P3: 'bg-swiss-elevated text-swiss-text-tertiary',
}

export function SwissTaskCard({
  taskId,
  title,
  agent,
  priority,
  status,
  onClick,
  className,
}: SwissTaskCardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-swiss-surface border border-swiss-border rounded-swiss',
        'border-l-[3px]',
        statusToBorderColor[status],
        'p-swiss-md',
        'flex items-center gap-swiss-md',
        onClick && 'cursor-pointer hover:bg-swiss-elevated transition-colors duration-150',
        className
      )}
    >
      {/* Status dot */}
      <SwissStatusDot color={statusToColor[status]} />

      {/* Task ID */}
      <span className="font-swiss-mono text-swiss-mono text-swiss-text-tertiary flex-shrink-0 tabular-nums">
        {taskId}
      </span>

      {/* Title */}
      <span className="text-swiss-body text-swiss-text-primary truncate flex-1 font-swiss">
        {title}
      </span>

      {/* Agent name */}
      {agent && (
        <span className="text-swiss-caption text-swiss-text-secondary flex-shrink-0 font-swiss">
          {agent}
        </span>
      )}

      {/* Priority badge */}
      {priority && (
        <span
          className={clsx(
            'px-2 py-0.5 rounded text-[11px] font-medium flex-shrink-0',
            priorityStyles[priority]
          )}
        >
          {priority}
        </span>
      )}
    </div>
  )
}
