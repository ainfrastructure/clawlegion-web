/**
 * SwissStatusBadge — Minimal status indicator
 *
 * Swiss Design principles:
 * - Geometric, no rounded-full pills (use rounded-swiss-sm)
 * - Limited color palette — semantic only
 * - Clear, readable at small sizes
 * - Optional leading dot for status
 */
'use client'

import { clsx } from 'clsx'

export type SwissStatusBadgeType =
  | 'active'
  | 'success'
  | 'warning'
  | 'error'
  | 'neutral'
  | 'info'

export type SwissStatusBadgeSize = 'xs' | 'sm' | 'md'

export interface SwissStatusBadgeProps {
  /** Badge text */
  label: string
  /** Status type */
  type?: SwissStatusBadgeType
  /** Show leading dot */
  dot?: boolean
  /** Size */
  size?: SwissStatusBadgeSize
  /** Custom className */
  className?: string
}

const typeStyles: Record<SwissStatusBadgeType, { bg: string; text: string; dot: string }> = {
  active: {
    bg: 'bg-[var(--swiss-accent-muted)]',
    text: 'text-[var(--swiss-accent)]',
    dot: 'bg-[var(--swiss-accent)]',
  },
  success: {
    bg: 'bg-swiss-success/10',
    text: 'text-swiss-success',
    dot: 'bg-swiss-success',
  },
  warning: {
    bg: 'bg-swiss-warning/10',
    text: 'text-swiss-warning',
    dot: 'bg-swiss-warning',
  },
  error: {
    bg: 'bg-swiss-error/10',
    text: 'text-swiss-error',
    dot: 'bg-swiss-error',
  },
  neutral: {
    bg: 'bg-[var(--swiss-surface-raised)]',
    text: 'text-[var(--swiss-text-tertiary)]',
    dot: 'bg-[var(--swiss-text-muted)]',
  },
  info: {
    bg: 'bg-[var(--swiss-accent-muted)]',
    text: 'text-[var(--swiss-accent)]',
    dot: 'bg-[var(--swiss-accent)]',
  },
}

const sizeStyles: Record<SwissStatusBadgeSize, string> = {
  xs: 'text-[10px] px-1.5 py-0.5',
  sm: 'text-swiss-xs px-swiss-2 py-0.5',
  md: 'text-swiss-sm px-swiss-3 py-swiss-1',
}

export function SwissStatusBadge({
  label,
  type = 'neutral',
  dot = false,
  size = 'sm',
  className,
}: SwissStatusBadgeProps) {
  const styles = typeStyles[type]

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-medium rounded-swiss-sm whitespace-nowrap',
        styles.bg,
        styles.text,
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', styles.dot)} />
      )}
      {label}
    </span>
  )
}
