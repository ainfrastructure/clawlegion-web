/**
 * SwissNav — Horizontal tab/navigation component
 *
 * Swiss Design principles:
 * - Underline indicator (geometric, not pill-shaped)
 * - Equal spacing between items
 * - Clean typography hierarchy
 * - High contrast active state
 */
'use client'

import { ReactNode } from 'react'
import { clsx } from 'clsx'

export interface SwissNavItem {
  /** Unique key */
  id: string
  /** Display label */
  label: string
  /** Optional icon */
  icon?: ReactNode
  /** Optional count badge */
  count?: number
  /** Disabled state */
  disabled?: boolean
}

export interface SwissNavProps {
  /** Navigation items */
  items: SwissNavItem[]
  /** Currently active item ID */
  activeId: string
  /** Change handler */
  onChange: (id: string) => void
  /** Size variant */
  size?: 'sm' | 'md'
  /** Full width (items stretch) */
  fullWidth?: boolean
  /** Custom className */
  className?: string
}

export function SwissNav({
  items,
  activeId,
  onChange,
  size = 'md',
  fullWidth = false,
  className,
}: SwissNavProps) {
  return (
    <nav
      className={clsx(
        'flex border-b border-[var(--swiss-border)]',
        fullWidth && 'w-full',
        className
      )}
    >
      {items.map((item) => {
        const isActive = item.id === activeId

        return (
          <button
            key={item.id}
            onClick={() => !item.disabled && onChange(item.id)}
            disabled={item.disabled}
            className={clsx(
              'relative flex items-center gap-swiss-2 font-medium',
              'transition-colors duration-swiss ease-swiss',
              'border-b-2 -mb-px',
              fullWidth && 'flex-1 justify-center',
              // Size
              size === 'sm'
                ? 'px-swiss-3 py-swiss-2 text-swiss-sm'
                : 'px-swiss-4 py-swiss-3 text-swiss-sm',
              // States
              isActive
                ? 'border-b-[var(--swiss-accent)] text-[var(--swiss-text-primary)]'
                : 'border-b-transparent text-[var(--swiss-text-tertiary)] hover:text-[var(--swiss-text-secondary)] hover:border-b-[var(--swiss-border)]',
              // Disabled
              item.disabled && 'opacity-40 cursor-not-allowed'
            )}
          >
            {item.icon && (
              <span className="flex-shrink-0 [&>svg]:w-4 [&>svg]:h-4">{item.icon}</span>
            )}
            <span>{item.label}</span>
            {item.count !== undefined && (
              <span
                className={clsx(
                  'swiss-mono text-swiss-xs px-1.5 py-0.5 rounded-swiss-sm',
                  isActive
                    ? 'bg-[var(--swiss-accent-muted)] text-[var(--swiss-accent)]'
                    : 'bg-[var(--swiss-surface-raised)] text-[var(--swiss-text-muted)]'
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
