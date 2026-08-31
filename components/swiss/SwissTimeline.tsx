/**
 * SwissTimeline — Chronological event list grouped by day
 *
 * Specs:
 *   Each entry: timestamp, human-readable message, category icon
 *   Grouped by day
 *   Vertical timeline layout
 */
'use client'

import { ReactNode } from 'react'
import { clsx } from 'clsx'

export interface SwissTimelineEntry {
  /** Unique ID */
  id: string
  /** Timestamp (ISO string or display string) */
  timestamp: string
  /** Human-readable message */
  message: string
  /** Category icon (ReactNode, e.g. a Lucide icon) */
  icon?: ReactNode
  /** Category name for accessibility */
  category?: string
}

export interface SwissTimelineGroup {
  /** Day label (e.g. "Today", "Feb 11, 2026") */
  label: string
  /** Events in this group */
  entries: SwissTimelineEntry[]
}

export interface SwissTimelineProps {
  /** Timeline groups, ordered by date */
  groups: SwissTimelineGroup[]
  /** Custom className */
  className?: string
}

export function SwissTimeline({ groups, className }: SwissTimelineProps) {
  if (groups.length === 0) {
    return null
  }

  return (
    <div className={clsx('font-swiss', className)}>
      {groups.map((group, gi) => (
        <div key={group.label} className={clsx(gi > 0 && 'mt-swiss-lg')}>
          {/* Day header */}
          <h4 className="swiss-label mb-swiss-md">{group.label}</h4>

          {/* Entries */}
          <div className="space-y-px">
            {group.entries.map((entry) => (
              <div
                key={entry.id}
                className={clsx(
                  'flex items-start gap-swiss-sm',
                  'py-swiss-sm px-swiss-md',
                  'rounded-lg hover:bg-swiss-elevated/50 transition-colors duration-150'
                )}
              >
                {/* Icon */}
                {entry.icon ? (
                  <span className="flex-shrink-0 mt-0.5 text-swiss-text-tertiary [&>svg]:w-4 [&>svg]:h-4">
                    {entry.icon}
                  </span>
                ) : (
                  <span className="flex-shrink-0 mt-[7px] w-1.5 h-1.5 rounded-full bg-swiss-border" />
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-swiss-body text-swiss-text-primary">{entry.message}</p>
                </div>

                {/* Timestamp */}
                <span className="flex-shrink-0 font-swiss-mono text-swiss-caption text-swiss-text-tertiary tabular-nums">
                  {entry.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
