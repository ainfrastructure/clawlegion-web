'use client'

import { Activity, Pause, Play, AlertTriangle, Wifi, WifiOff, Zap } from 'lucide-react'

export type AgentStatus = 'online' | 'busy' | 'idle' | 'offline' | 'rate_limited'

interface StatusBadgeProps {
  status: AgentStatus
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const statusConfig: Record<AgentStatus, {
  bg: string
  text: string
  dot: string
  label: string
  icon: React.ReactNode
}> = {
  online: {
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    dot: 'bg-green-400',
    label: 'Online',
    icon: <Play size={12} />,
  },
  busy: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
    label: 'Busy',
    icon: <Zap size={12} />,
  },
  idle: {
    bg: 'bg-slate-500/20',
    text: 'text-slate-400',
    dot: 'bg-slate-400',
    label: 'Idle',
    icon: <Pause size={12} />,
  },
  offline: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    dot: 'bg-red-400',
    label: 'Offline',
    icon: <WifiOff size={12} />,
  },
  rate_limited: {
    bg: 'bg-orange-500/20',
    text: 'text-orange-400',
    dot: 'bg-orange-400',
    label: 'Rate Limited',
    icon: <AlertTriangle size={12} />,
  },
}

export function StatusBadge({ status, size = 'md', showLabel = true, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.offline
  
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs gap-1',
    md: 'px-2 py-1 text-xs sm:text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  }
  
  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  }
  
  return (
    <span
      className={`inline-flex items-center rounded-full ${config.bg} ${config.text} ${sizeClasses[size]} ${className}`}
    >
      <span className={`${dotSizes[size]} ${config.dot} rounded-full animate-pulse`} />
      {showLabel && <span className="capitalize">{config.label}</span>}
    </span>
  )
}

// Minimal dot-only indicator for compact views
export function StatusDot({ status, size = 'md' }: { status: AgentStatus; size?: 'sm' | 'md' | 'lg' }) {
  const config = statusConfig[status] ?? statusConfig.offline
  
  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  }
  
  return (
    <span
      className={`inline-block ${dotSizes[size]} ${config.dot} rounded-full animate-pulse`}
      title={config.label}
    />
  )
}
