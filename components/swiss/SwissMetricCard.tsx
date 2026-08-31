/**
 * SwissMetricCard — Metric/stat display component
 *
 * Swiss Design principles:
 * - Tabular numerics for data alignment
 * - Clear hierarchy: label → value → trend
 * - Minimal decoration, let the numbers speak
 * - 8px grid spacing
 */
'use client'

import { ReactNode } from 'react'
import { clsx } from 'clsx'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'

export interface SwissMetricCardProps {
  /** Metric label (e.g. "Tasks Completed") */
  label: string
  /** Primary metric value */
  value: string | number
  /** Optional icon (left of label) */
  icon?: ReactNode
  /** Trend direction */
  trend?: 'up' | 'down' | 'neutral'
  /** Trend value text (e.g. "+12%") */
  trendValue?: string
  /** Secondary text below value */
  subtitle?: string
  /** Card size */
  size?: 'sm' | 'md' | 'lg'
  /** Custom className */
  className?: string
}

const trendColors = {
  up: 'text-swiss-success',
  down: 'text-swiss-error',
  neutral: 'text-[var(--swiss-text-muted)]',
}

const TrendIcon = ({ direction }: { direction: 'up' | 'down' | 'neutral' }) => {
  const size = 12
  switch (direction) {
    case 'up':
      return <ArrowUp size={size} />
    case 'down':
      return <ArrowDown size={size} />
    case 'neutral':
      return <Minus size={size} />
  }
}

export function SwissMetricCard({
  label,
  value,
  icon,
  trend,
  trendValue,
  subtitle,
  size = 'md',
  className,
}: SwissMetricCardProps) {
  return (
    <div
      className={clsx(
        'bg-[var(--swiss-surface)] border border-[var(--swiss-border)] rounded-swiss-md',
        'transition-all duration-swiss ease-swiss',
        size === 'sm' ? 'p-swiss-3' : size === 'lg' ? 'p-swiss-6' : 'p-swiss-4',
        className
      )}
    >
      {/* Label row */}
      <div className="flex items-center gap-swiss-2 mb-swiss-2">
        {icon && (
          <span className="text-[var(--swiss-text-tertiary)] flex-shrink-0">
            {icon}
          </span>
        )}
        <span className="swiss-label truncate">{label}</span>
      </div>

      {/* Value */}
      <div
        className={clsx(
          'swiss-mono font-semibold text-[var(--swiss-text-primary)]',
          size === 'sm' ? 'text-swiss-xl' : size === 'lg' ? 'text-swiss-3xl' : 'text-swiss-2xl'
        )}
      >
        {value}
      </div>

      {/* Trend + subtitle row */}
      {(trend || subtitle) && (
        <div className="flex items-center gap-swiss-2 mt-swiss-2">
          {trend && (
            <span className={clsx('flex items-center gap-1 text-swiss-xs font-medium', trendColors[trend])}>
              <TrendIcon direction={trend} />
              {trendValue}
            </span>
          )}
          {subtitle && (
            <span className="text-swiss-xs text-[var(--swiss-text-muted)] truncate">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
