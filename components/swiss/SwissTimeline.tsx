/**
 * SwissTimeline — Vertical timeline component
 *
 * Swiss Design principles:
 * - Clean vertical line, geometric indicators
 * - Flush left alignment (asymmetrical typography)
 * - Systematic spacing between items
 * - High contrast status indicators
 */
'use client'

import { ReactNode } from 'react'
import { clsx } from 'clsx'

export type SwissTimelineStatus = 'completed' | 'active' | 'pending' | 'error'

export interface SwissTimelineItem {
  /** Unique identifier */
  id: string
  /** Item title */
  title: string
  /** Optional description */
  description?: string
  /** Timestamp text */
  timestamp?: string
  /** Item status */
  status: SwissTimelineStatus
  /** Optional icon override */
  icon?: ReactNode
  /** Optional metadata (right-aligned) */
  meta?: ReactNode
}

export interface SwissTimelineProps {
  items: SwissTimelineItem[]
  className?: string
  /** Size variant */
  size?: 'sm' | 'md'
}

const statusDotStyles: Record<SwissTimelineStatus, string> = {
  completed: 'bg-swiss-success',
  active: 'bg-swiss-accent ring-2 ring-swiss-accent/30',
  pending: 'bg-[var(--swiss-border)] dark:bg-swiss-600',
  error: 'bg-swiss-error',
}

const statusLineStyles: Record<SwissTimelineStatus, string> = {
  completed: 'bg-swiss-success/40',
  active: 'bg-swiss-accent/40',
  pending: 'bg-[var(--swiss-border-subtle)]',
  error: 'bg-swiss-error/40',
}

export function SwissTimeline({ items, className, size = 'md' }: SwissTimelineProps) {
  if (items.length === 0) return null

  return (
    <div className={clsx('relative', className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={item.id} className="relative flex gap-swiss-4">
            {/* Left: dot + line */}
            <div className="flex flex-col items-center flex-shrink-0">
              {/* Dot */}
              {item.icon ? (
                <div
                  className={clsx(
                    'flex items-center justify-center rounded-full',
                    size === 'sm' ? 'w-5 h-5' : 'w-6 h-6',
                    item.status === 'active'
                      ? 'text-swiss-accent bg-swiss-accent/10'
                      : item.status === 'completed'
                      ? 'text-swiss-success bg-swiss-success/10'
                      : item.status === 'error'
                      ? 'text-swiss-error bg-swiss-error/10'
                      : 'text-[var(--swiss-text-muted)] bg-[var(--swiss-surface-raised)]'
                  )}
                >
                  {item.icon}
                </div>
              ) : (
                <div
                  className={clsx(
                    'rounded-full flex-shrink-0',
                    size === 'sm' ? 'w-2 h-2 mt-1.5' : 'w-2.5 h-2.5 mt-1.5',
                    statusDotStyles[item.status]
                  )}
                />
              )}

              {/* Connecting line */}
              {!isLast && (
                <div
                  className={clsx(
                    'w-px flex-1 min-h-[16px] my-swiss-1',
                    statusLineStyles[item.status]
                  )}
                />
              )}
            </div>

            {/* Right: content */}
            <div
              className={clsx(
                'flex-1 min-w-0',
                !isLast && (size === 'sm' ? 'pb-swiss-3' : 'pb-swiss-4')
              )}
            >
              <div className="flex items-start justify-between gap-swiss-2">
                <div className="min-w-0 flex-1">
                  <p
                    className={clsx(
                      'font-medium truncate',
                      size === 'sm' ? 'text-swiss-sm' : 'text-swiss-base',
                      item.status === 'pending'
                        ? 'text-[var(--swiss-text-muted)]'
                        : 'text-[var(--swiss-text-primary)]'
                    )}
                  >
                    {item.title}
                  </p>
                  {item.description && (
                    <p
                      className={clsx(
                        'mt-swiss-1 text-[var(--swiss-text-tertiary)]',
                        size === 'sm' ? 'text-swiss-xs' : 'text-swiss-sm'
                      )}
                    >
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-swiss-2 flex-shrink-0">
                  {item.timestamp && (
                    <span className="swiss-mono text-swiss-xs text-[var(--swiss-text-muted)]">
                      {item.timestamp}
                    </span>
                  )}
                  {item.meta}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
