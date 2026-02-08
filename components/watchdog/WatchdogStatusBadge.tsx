'use client'

import { CheckCircle, AlertTriangle, Clock, XCircle } from 'lucide-react'

export type WatchdogStatus = 'healthy' | 'warning' | 'stale' | 'failed'

interface WatchdogStatusBadgeProps {
  status: WatchdogStatus
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
}

const statusConfig: Record<WatchdogStatus, {
  icon: React.ReactNode
  color: string
  bg: string
  label: string
}> = {
  healthy: {
    icon: <CheckCircle className="w-3 h-3" />,
    color: 'text-green-400',
    bg: 'bg-green-500/20 border-green-500/30',
    label: 'Healthy'
  },
  warning: {
    icon: <AlertTriangle className="w-3 h-3" />,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20 border-yellow-500/30',
    label: 'Warning'
  },
  stale: {
    icon: <Clock className="w-3 h-3" />,
    color: 'text-orange-400',
    bg: 'bg-orange-500/20 border-orange-500/30',
    label: 'Stale'
  },
  failed: {
    icon: <XCircle className="w-3 h-3" />,
    color: 'text-red-400',
    bg: 'bg-red-500/20 border-red-500/30',
    label: 'Failed'
  }
}

const sizeStyles = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm'
}

export function WatchdogStatusBadge({
  status,
  showLabel = true,
  size = 'md',
  pulse = false
}: WatchdogStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.healthy // Fallback to healthy if invalid status

  return (
    <span className={`
      inline-flex items-center gap-1.5 rounded-full border font-medium
      ${config.bg} ${config.color} ${sizeStyles[size]}
      ${pulse && (status === 'warning' || status === 'stale') ? 'animate-pulse' : ''}
    `}>
      {config.icon}
      {showLabel && config.label}
    </span>
  )
}

// Compact dot version for use in task cards
export function WatchdogStatusDot({ 
  status, 
  size = 'md' 
}: { 
  status: WatchdogStatus
  size?: 'sm' | 'md' | 'lg'
}) {
  const colors: Record<WatchdogStatus, string> = {
    healthy: 'bg-green-500',
    warning: 'bg-yellow-500',
    stale: 'bg-orange-500',
    failed: 'bg-red-500'
  }

  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3'
  }

  const pulseClass = (status === 'warning' || status === 'stale') ? 'animate-pulse' : ''
  const colorClass = colors[status] || colors.healthy // Fallback to healthy if invalid status

  return (
    <span 
      className={`rounded-full ${colorClass} ${sizes[size]} ${pulseClass}`}
      title={`Watchdog: ${status || 'unknown'}`}
    />
  )
}

export default WatchdogStatusBadge
