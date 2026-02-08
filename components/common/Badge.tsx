'use client'

import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-700 text-slate-300 border border-slate-600/20',
  success: 'bg-green-500/20 text-green-400 border border-emerald-500/20',
  warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20',
  error: 'bg-red-500/20 text-red-400 border border-red-500/20',
  info: 'bg-blue-500/20 text-blue-400 border border-blue-500/20',
  purple: 'bg-purple-500/20 text-purple-400 border border-purple-500/20'
}

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

// Pre-styled badges for common statuses
export function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, BadgeVariant> = {
    completed: 'success',
    'in-progress': 'info',
    queued: 'default',
    assigned: 'purple',
    failed: 'error',
    rejected: 'error',
    healthy: 'success',
    degraded: 'warning',
    unhealthy: 'error'
  }

  return <Badge variant={variants[status] || 'default'}>{status}</Badge>
}

export default Badge
