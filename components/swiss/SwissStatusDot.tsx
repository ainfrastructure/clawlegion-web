/**
 * SwissStatusDot — 8px color-coded status circle
 *
 * Colors:
 *   green  = online / done
 *   yellow = busy / in-progress
 *   red    = error / offline
 *   blue   = planning / researching
 */
'use client'

import { clsx } from 'clsx'

export type SwissStatusDotColor = 'green' | 'yellow' | 'red' | 'blue'

export interface SwissStatusDotProps {
  /** Status color */
  color: SwissStatusDotColor
  /** Optional label for accessibility */
  label?: string
  /** Pulsing animation for active states */
  pulse?: boolean
  /** Custom className */
  className?: string
}

const colorMap: Record<SwissStatusDotColor, string> = {
  green: 'bg-swiss-success',
  yellow: 'bg-swiss-warning',
  red: 'bg-swiss-error',
  blue: 'bg-swiss-accent',
}

export function SwissStatusDot({
  color,
  label,
  pulse = false,
  className,
}: SwissStatusDotProps) {
  return (
    <span
      className={clsx(
        'inline-block w-2 h-2 rounded-full flex-shrink-0',
        colorMap[color],
        pulse && 'animate-pulse',
        className
      )}
      role="status"
      aria-label={label ?? `Status: ${color}`}
    />
  )
}
