'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export interface StatCardProps {
  title?: string
  label?: string  // Alias for title
  value: string | number
  icon?: ReactNode
  color?: 'orange' | 'green' | 'red' | 'blue' | 'purple' | 'slate' | 'amber' | 'yellow'
  trend?: {
    value: number
    label?: string
  }
  className?: string
}

const colorMap = {
  orange: 'bg-orange-500/10 text-orange-400',
  green: 'bg-green-500/10 text-green-400',
  red: 'bg-red-500/10 text-red-400',
  blue: 'bg-blue-500/10 text-blue-400',
  purple: 'bg-purple-500/10 text-purple-400',
  slate: 'bg-slate-500/10 text-slate-400',
  amber: 'bg-amber-500/10 text-amber-400',
  yellow: 'bg-yellow-500/10 text-yellow-400',
}

export function StatCard({ title, label, value, icon, color = 'purple', trend, className }: StatCardProps) {
  const displayTitle = title || label || ''
  
  const getTrendIcon = () => {
    if (!trend) return null
    if (trend.value > 0) return <TrendingUp className="w-4 h-4" />
    if (trend.value < 0) return <TrendingDown className="w-4 h-4" />
    return <Minus className="w-4 h-4" />
  }
  
  const getTrendColor = () => {
    if (!trend) return ''
    if (trend.value > 0) return 'text-green-400'
    if (trend.value < 0) return 'text-red-400'
    return 'text-slate-400'
  }
  
  return (
    <div className={cn(
      'glass-2 rounded-xl p-4',
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{displayTitle}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        {icon && (
          <div className={cn('p-2 rounded-lg', colorMap[color])}>
            {icon}
          </div>
        )}
      </div>
      
      {trend && (
        <div className={cn('flex items-center gap-1 mt-3 text-sm', getTrendColor())}>
          {getTrendIcon()}
          <span>{Math.abs(trend.value)}%</span>
          {trend.label && (
            <span className="text-slate-500">{trend.label}</span>
          )}
        </div>
      )}
    </div>
  )
}

export default StatCard
