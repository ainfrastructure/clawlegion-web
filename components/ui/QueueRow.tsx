'use client'

import { cn } from '@/lib/utils'

export interface QueueRowProps {
  /** Label text */
  label: string
  /** Count to display */
  count: number
  /** Color theme for the badge */
  color: 'slate' | 'blue' | 'amber' | 'green' | 'red' | 'purple'
  /** Additional CSS classes */
  className?: string
}

const colorClasses: Record<string, string> = {
  slate: 'bg-slate-600',
  blue: 'bg-blue-600',
  amber: 'bg-amber-600',
  green: 'bg-green-600',
  red: 'bg-red-600',
  purple: 'bg-purple-600',
}

/**
 * Row component for displaying queue/status counts.
 */
export function QueueRow({ label, count, color, className }: QueueRowProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <span className="text-sm sm:text-base text-slate-300">{label}</span>
      <span className={cn(
        "px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium",
        colorClasses[color]
      )}>
        {count}
      </span>
    </div>
  )
}
