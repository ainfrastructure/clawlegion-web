/**
 * SwissCard — Primary container component
 *
 * Swiss Design principles:
 * - Clean borders, no glow effects
 * - 4px border radius (geometric, not rounded)
 * - Systematic spacing (8px grid)
 * - High contrast, purposeful borders
 */
'use client'

import { ReactNode, forwardRef } from 'react'
import { clsx } from 'clsx'

export type SwissCardVariant = 'default' | 'outlined' | 'filled' | 'ghost'
export type SwissCardSize = 'sm' | 'md' | 'lg'

export interface SwissCardProps {
  children: ReactNode
  variant?: SwissCardVariant
  size?: SwissCardSize
  className?: string
  /** Optional header content */
  header?: ReactNode
  /** Optional footer content */
  footer?: ReactNode
  /** Makes the card clickable with hover state */
  interactive?: boolean
  /** Click handler (only used when interactive) */
  onClick?: () => void
  /** Accent left border color */
  accent?: 'blue' | 'green' | 'amber' | 'red' | 'none'
  /** HTML element to render as */
  as?: 'div' | 'article' | 'section'
}

const variantStyles: Record<SwissCardVariant, string> = {
  default: 'bg-[var(--swiss-surface)] border border-[var(--swiss-border)]',
  outlined: 'bg-transparent border border-[var(--swiss-border)]',
  filled: 'bg-[var(--swiss-surface-raised)] border border-transparent',
  ghost: 'bg-transparent border border-transparent',
}

const sizeStyles: Record<SwissCardSize, string> = {
  sm: 'p-swiss-3',     // 12px
  md: 'p-swiss-4',     // 16px
  lg: 'p-swiss-6',     // 24px
}

const accentStyles: Record<string, string> = {
  blue: 'border-l-2 border-l-swiss-accent',
  green: 'border-l-2 border-l-swiss-success',
  amber: 'border-l-2 border-l-swiss-warning',
  red: 'border-l-2 border-l-swiss-error',
  none: '',
}

export const SwissCard = forwardRef<HTMLDivElement, SwissCardProps>(
  function SwissCard(
    {
      children,
      variant = 'default',
      size = 'md',
      className,
      header,
      footer,
      interactive = false,
      onClick,
      accent = 'none',
      as: Element = 'div',
    },
    ref
  ) {
    return (
      <Element
        ref={ref}
        onClick={interactive ? onClick : undefined}
        className={clsx(
          // Base
          'rounded-swiss-md transition-all duration-swiss ease-swiss',
          // Variant
          variantStyles[variant],
          // Size (only padding on main body if no header/footer)
          !header && !footer && sizeStyles[size],
          // Interactive
          interactive && 'cursor-pointer hover:border-[var(--swiss-accent)] hover:shadow-swiss-md',
          // Accent
          accentStyles[accent],
          className
        )}
      >
        {header && (
          <div
            className={clsx(
              'border-b border-[var(--swiss-border-subtle)]',
              size === 'sm' ? 'px-swiss-3 py-swiss-2' : size === 'lg' ? 'px-swiss-6 py-swiss-4' : 'px-swiss-4 py-swiss-3'
            )}
          >
            {header}
          </div>
        )}
        <div className={header || footer ? sizeStyles[size] : undefined}>
          {children}
        </div>
        {footer && (
          <div
            className={clsx(
              'border-t border-[var(--swiss-border-subtle)]',
              size === 'sm' ? 'px-swiss-3 py-swiss-2' : size === 'lg' ? 'px-swiss-6 py-swiss-4' : 'px-swiss-4 py-swiss-3'
            )}
          >
            {footer}
          </div>
        )}
      </Element>
    )
  }
)
