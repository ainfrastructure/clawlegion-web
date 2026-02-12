/**
 * SwissTabBar — Horizontal filter tab bar
 *
 * Swiss Design principles:
 * - Underline indicator, not pill-shaped
 * - Clear active state via weight + accent underline
 * - Count badges use geometric styling
 * - Systematic spacing on 8px grid
 */
'use client'

import { clsx } from 'clsx'

export interface SwissTabItem {
  /** Unique key */
  id: string
  /** Display label */
  label: string
  /** Optional count badge */
  count?: number
}

export interface SwissTabBarProps {
  /** Tab items */
  items: SwissTabItem[]
  /** Currently active tab id */
  activeId: string
  /** Tab change handler */
  onChange: (id: string) => void
  /** Custom className */
  className?: string
}

export function SwissTabBar({ items, activeId, onChange, className }: SwissTabBarProps) {
  return (
    <div
      className={clsx(
        'flex items-center gap-swiss-1 border-b border-[var(--swiss-border)]',
        className,
      )}
      role="tablist"
    >
      {items.map((item) => {
        const isActive = item.id === activeId
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.id)}
            className={clsx(
              'relative flex items-center gap-swiss-2',
              'px-swiss-4 py-swiss-3',
              'text-swiss-sm font-medium',
              'transition-colors duration-swiss ease-swiss',
              'focus-visible:outline-2 focus-visible:outline-[var(--swiss-accent)] focus-visible:outline-offset-[-2px]',
              isActive
                ? 'text-[var(--swiss-accent)]'
                : 'text-[var(--swiss-text-tertiary)] hover:text-[var(--swiss-text-primary)]',
            )}
          >
            {item.label}
            {item.count != null && (
              <span
                className={clsx(
                  'text-swiss-xs tabular-nums',
                  'px-swiss-2 py-[1px] rounded-swiss-sm',
                  isActive
                    ? 'bg-[var(--swiss-accent-muted)] text-[var(--swiss-accent)]'
                    : 'bg-[var(--swiss-surface-raised)] text-[var(--swiss-text-muted)]',
                )}
              >
                {item.count}
              </span>
            )}
            {/* Underline indicator */}
            {isActive && (
              <span className="absolute bottom-0 left-swiss-4 right-swiss-4 h-[2px] bg-[var(--swiss-accent)]" />
            )}
          </button>
        )
      })}
    </div>
  )
}
