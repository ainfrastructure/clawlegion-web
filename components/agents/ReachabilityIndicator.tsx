'use client'

import { Wifi, WifiOff, Loader2, AlertCircle } from 'lucide-react'

interface ReachabilityIndicatorProps {
  reachable: boolean | null // null = checking
  latencyMs?: number
  error?: string
  size?: 'sm' | 'md' | 'lg'
  showLatency?: boolean
  className?: string
}

export function ReachabilityIndicator({
  reachable,
  latencyMs,
  error,
  size = 'md',
  showLatency = true,
  className = '',
}: ReachabilityIndicatorProps) {
  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-xs sm:text-sm gap-1.5',
    lg: 'text-sm gap-2',
  }
  
  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  }
  
  // Loading state
  if (reachable === null) {
    return (
      <span className={`inline-flex items-center text-slate-400 ${sizeClasses[size]} ${className}`}>
        <Loader2 size={iconSizes[size]} className="animate-spin" />
        <span>Checking...</span>
      </span>
    )
  }
  
  // Reachable
  if (reachable) {
    return (
      <span className={`inline-flex items-center text-green-400 ${sizeClasses[size]} ${className}`}>
        <Wifi size={iconSizes[size]} />
        <span>Reachable</span>
        {showLatency && latencyMs !== undefined && (
          <span className="text-slate-500 ml-1">({latencyMs}ms)</span>
        )}
      </span>
    )
  }
  
  // Not reachable
  return (
    <span className={`inline-flex items-center text-red-400 ${sizeClasses[size]} ${className}`} title={error}>
      <WifiOff size={iconSizes[size]} />
      <span>Unreachable</span>
      {error && (
        <AlertCircle size={iconSizes[size] - 2} className="text-red-500" />
      )}
    </span>
  )
}

// Compact version - just icon
export function ReachabilityDot({
  reachable,
  size = 'md',
}: {
  reachable: boolean | null
  size?: 'sm' | 'md' | 'lg'
}) {
  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  }
  
  if (reachable === null) {
    return (
      <span title="Checking...">
        <Loader2 size={iconSizes[size]} className="text-slate-400 animate-spin" />
      </span>
    )
  }
  
  if (reachable) {
    return (
      <span title="Reachable">
        <Wifi size={iconSizes[size]} className="text-green-400" />
      </span>
    )
  }
  
  return (
    <span title="Unreachable">
      <WifiOff size={iconSizes[size]} className="text-red-400" />
    </span>
  )
}
