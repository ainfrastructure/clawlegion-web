'use client'

import { CheckCircle, XCircle, Clock, AlertCircle, Loader2, Pause, AlertTriangle } from 'lucide-react'

export type Status =
  | 'success' | 'error' | 'warning' | 'info'
  | 'pending' | 'running' | 'paused'
  | 'online' | 'offline' | 'busy' | 'idle'
  | 'rate_limited'
  | 'healthy' | 'stale' | 'failed'

// Agent-specific status alias
export type AgentStatus = 'online' | 'busy' | 'idle' | 'offline' | 'rate_limited'

// Watchdog-specific status alias
export type WatchdogStatus = 'healthy' | 'warning' | 'stale' | 'failed'

interface StatusBadgeProps {
  status: Status
  label?: string
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
  className?: string
}

const statusConfig: Record<Status, {
  icon: React.ReactNode
  color: string
  bg: string
  label: string
}> = {
  success: {
    icon: <CheckCircle className="w-3 h-3" />,
    color: 'text-green-400',
    bg: 'bg-green-500/20 border-green-500/30',
    label: 'Success'
  },
  error: {
    icon: <XCircle className="w-3 h-3" />,
    color: 'text-red-400',
    bg: 'bg-red-500/20 border-red-500/30',
    label: 'Error'
  },
  warning: {
    icon: <AlertCircle className="w-3 h-3" />,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20 border-yellow-500/30',
    label: 'Warning'
  },
  info: {
    icon: <AlertCircle className="w-3 h-3" />,
    color: 'text-blue-400',
    bg: 'bg-blue-500/20 border-blue-500/30',
    label: 'Info'
  },
  pending: {
    icon: <Clock className="w-3 h-3" />,
    color: 'text-slate-400',
    bg: 'bg-slate-500/20 border-slate-500/30',
    label: 'Pending'
  },
  running: {
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
    color: 'text-blue-400',
    bg: 'bg-blue-500/20 border-blue-500/30',
    label: 'Running'
  },
  paused: {
    icon: <Pause className="w-3 h-3" />,
    color: 'text-orange-400',
    bg: 'bg-orange-500/20 border-orange-500/30',
    label: 'Paused'
  },
  online: {
    icon: <div className="w-2 h-2 rounded-full bg-green-400" />,
    color: 'text-green-400',
    bg: 'bg-green-500/20 border-green-500/30',
    label: 'Online'
  },
  offline: {
    icon: <div className="w-2 h-2 rounded-full bg-slate-500" />,
    color: 'text-slate-400',
    bg: 'bg-slate-500/20 border-slate-500/30',
    label: 'Offline'
  },
  busy: {
    icon: <div className="w-2 h-2 rounded-full bg-yellow-400" />,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20 border-yellow-500/30',
    label: 'Busy'
  },
  idle: {
    icon: <div className="w-2 h-2 rounded-full bg-blue-400" />,
    color: 'text-blue-400',
    bg: 'bg-blue-500/20 border-blue-500/30',
    label: 'Idle'
  },
  rate_limited: {
    icon: <AlertTriangle className="w-3 h-3" />,
    color: 'text-orange-400',
    bg: 'bg-orange-500/20 border-orange-500/30',
    label: 'Rate Limited'
  },
  healthy: {
    icon: <CheckCircle className="w-3 h-3" />,
    color: 'text-green-400',
    bg: 'bg-green-500/20 border-green-500/30',
    label: 'Healthy'
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
  },
}

const sizeStyles = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm'
}

export function StatusBadge({
  status,
  label,
  showIcon = true,
  size = 'md',
  pulse = false,
  className = '',
}: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.offline
  const displayLabel = label || config.label

  return (
    <span className={`
      inline-flex items-center gap-1.5 rounded-full border font-medium
      ${config.bg} ${config.color} ${sizeStyles[size]}
      ${pulse ? 'animate-pulse' : ''} ${className}
    `}>
      {showIcon && config.icon}
      {displayLabel}
    </span>
  )
}

// Simple dot indicator
export function StatusDot({
  status,
  size = 'md',
  pulse = false,
}: {
  status: string
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
}) {
  const colors: Record<string, string> = {
    online: 'bg-green-500',
    offline: 'bg-slate-500',
    busy: 'bg-yellow-500',
    idle: 'bg-blue-500',
    rate_limited: 'bg-orange-500',
    healthy: 'bg-green-500',
    warning: 'bg-yellow-500',
    stale: 'bg-orange-500',
    failed: 'bg-red-500',
  }

  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  }

  return (
    <span
      className={`rounded-full ${colors[status] ?? 'bg-slate-500'} ${sizes[size]} ${pulse ? 'animate-pulse' : ''}`}
      title={status}
    />
  )
}

// Backward-compatible aliases for watchdog usage
export const WatchdogStatusBadge = StatusBadge
export const WatchdogStatusDot = StatusDot

export default StatusBadge
