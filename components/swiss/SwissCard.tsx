/**
 * SwissCard — Clean card container
 *
 * Specs:
 *   Surface background (#111520)
 *   Subtle border (#1E2436)
 *   24px padding
 *   12px radius
 *   Optional left-border accent color
 */
'use client'

import { ReactNode, forwardRef } from 'react'
import { clsx } from 'clsx'

export type SwissCardAccent = 'blue' | 'green' | 'yellow' | 'red' | 'none'

export interface SwissCardProps {
  children: ReactNode
  /** Optional left-border accent color */
  accent?: SwissCardAccent
  /** Custom className */
  className?: string
  /** Click handler (makes card interactive) */
  onClick?: () => void
  /** HTML element to render as */
  as?: 'div' | 'article' | 'section'
}

const accentStyles: Record<SwissCardAccent, string> = {
  blue: 'border-l-[3px] border-l-swiss-accent',
  green: 'border-l-[3px] border-l-swiss-success',
  yellow: 'border-l-[3px] border-l-swiss-warning',
  red: 'border-l-[3px] border-l-swiss-error',
  none: '',
}

export const SwissCard = forwardRef<HTMLDivElement, SwissCardProps>(
  function SwissCard(
    {
      children,
      accent = 'none',
      className,
      onClick,
      as: Element = 'div',
    },
    ref
  ) {
    return (
      <Element
        ref={ref}
        onClick={onClick}
        className={clsx(
          // Surface + border + padding + radius
          'bg-swiss-surface border border-swiss-border',
          'p-swiss-lg rounded-swiss',
          // Accent
          accentStyles[accent],
          // Interactive
          onClick && 'cursor-pointer hover:bg-swiss-elevated transition-colors duration-150',
          className
        )}
      >
        {children}
      </Element>
    )
  }
)
