/**
 * SwissTabBar — Horizontal underlined tabs with count badges
 *
 * Specs:
 *   Active tab: 2px bottom border accent
 *   Count badges on each tab
 *   Flush-left layout
 */
'use client'

import { clsx } from 'clsx'

export interface SwissTab {
  /** Unique tab ID */
  id: string
  /** Display label */
  label: string
  /** Optional count badge */
  count?: number
}

export interface SwissTabBarProps {
  /** Available tabs */
  tabs: SwissTab[]
  /** Currently active tab ID */
  activeTab: string
  /** Tab change callback */
  onTabChange: (tabId: string) => void
  /** Custom className */
  className?: string
}

export function SwissTabBar({
  tabs,
  activeTab,
  onTabChange,
  className,
}: SwissTabBarProps) {
  return (
    <div
      className={clsx(
        'flex items-center gap-swiss-lg border-b border-swiss-border font-swiss',
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={clsx(
              'relative pb-swiss-sm px-px',
              'text-swiss-body font-medium',
              'transition-colors duration-150',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-swiss-accent',
              isActive
                ? 'text-swiss-text-primary'
                : 'text-swiss-text-tertiary hover:text-swiss-text-secondary'
            )}
          >
            <span className="flex items-center gap-swiss-sm">
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={clsx(
                    'inline-flex items-center justify-center',
                    'min-w-[20px] h-5 px-1.5 rounded-full',
                    'text-[11px] font-medium tabular-nums',
                    isActive
                      ? 'bg-swiss-accent/15 text-swiss-accent'
                      : 'bg-swiss-elevated text-swiss-text-tertiary'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>

            {/* Active indicator: 2px bottom border */}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-swiss-accent rounded-full" />
            )}
          </button>
        )
      })}
    </div>
  )
}
