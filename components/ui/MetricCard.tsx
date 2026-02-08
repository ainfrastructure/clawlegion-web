'use client'

import { cn } from '@/lib/utils'

export interface MetricCardProps {
  /** Icon element to display */
  icon: React.ReactNode
  /** Label text */
  label: string
  /** Value to display */
  value: string | number
  /** Subtext below the value */
  subtext?: string
  /** Color theme */
  color?: string
  /** Additional CSS classes */
  className?: string
}

/**
 * Metric card for displaying key metrics with icon, value, and subtext.
 */
export function MetricCard({ icon, label, value, subtext, color, className }: MetricCardProps) {
  return (
    <div 
      data-testid={`metric-${label.toLowerCase().replace(/\s+/g, '-')}`} 
      className={cn(
        "glass-2 rounded-xl p-3 sm:p-4",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">{icon}</div>
        <div className="min-w-0">
          <div className="text-xl sm:text-2xl font-bold text-white">{value}</div>
          <div className="text-xs sm:text-sm text-slate-400 truncate">{label}</div>
          {subtext && <div className="text-xs text-slate-500 truncate">{subtext}</div>}
        </div>
      </div>
    </div>
  )
}
