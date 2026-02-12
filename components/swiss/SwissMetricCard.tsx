/**
 * SwissMetricCard — Large number display for dashboard KPIs
 *
 * Specs:
 *   Large number + label + optional subtext/trend indicator
 *   Uses swiss-mono for the value (tabular numerics)
 *   Surface bg, 24px padding, 12px radius
 */
'use client'

import { ReactNode } from 'react'
import { clsx } from 'clsx'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'

export type SwissMetricTrend = 'up' | 'down' | 'neutral'

export interface SwissMetricCardProps {
  /** Metric label (e.g. "Tasks Completed") */
  label: string
  /** Primary metric value (the big number) */
  value: string | number
  /** Optional icon to the left of label */
  icon?: ReactNode
  /** Trend direction */
  trend?: SwissMetricTrend
  /** Trend label (e.g. "+12% vs last week") */
  trendLabel?: string
  /** Secondary descriptive text below value */
  subtext?: string
  /** Custom className */
  className?: string
}

const trendColors: Record<SwissMetricTrend, string> = {
  up: 'text-swiss-success',
  down: 'text-swiss-error',
  neutral: 'text-swiss-text-tertiary',
}

function TrendIcon({ direction }: { direction: SwissMetricTrend }) {
  switch (direction) {
    case 'up': return <ArrowUp size={12} />
    case 'down': return <ArrowDown size={12} />
    case 'neutral': return <Minus size={12} />
  }
}

export function SwissMetricCard({
  label,
  value,
  icon,
  trend,
  trendLabel,
  subtext,
  className,
}: SwissMetricCardProps) {
  return (
    <div
      className={clsx(
        'bg-swiss-surface border border-swiss-border',
        'p-swiss-lg rounded-swiss',
        className
      )}
    >
      {/* Label */}
      <div className="flex items-center gap-swiss-sm mb-swiss-sm">
        {icon && (
          <span className="text-swiss-text-tertiary flex-shrink-0 [&>svg]:w-4 [&>svg]:h-4">
            {icon}
          </span>
        )}
        <span className="swiss-label truncate">{label}</span>
      </div>

      {/* Big number */}
      <div className="font-swiss-mono text-[32px] font-semibold leading-tight text-swiss-text-primary tabular-nums">
        {value}
      </div>

      {/* Trend + subtext */}
      {(trend || subtext) && (
        <div className="flex items-center gap-swiss-sm mt-swiss-sm">
          {trend && (
            <span className={clsx('flex items-center gap-1 text-swiss-caption font-medium', trendColors[trend])}>
              <TrendIcon direction={trend} />
              {trendLabel}
            </span>
          )}
          {subtext && (
            <span className="text-swiss-caption text-swiss-text-tertiary truncate">
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
