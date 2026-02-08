'use client'

import { Activity, Play, CheckCircle2, AlertTriangle, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ActivityItem {
  id?: string | number
  action?: string
  createdAt: string
  agent?: {
    name?: string
  }
}

export interface ActivityRowProps {
  /** Activity data */
  activity: ActivityItem
  /** Additional CSS classes */
  className?: string
  /** Compact mode for mobile */
  compact?: boolean
}

const actionIcons: Record<string, React.ReactNode> = {
  task_started: <Play size={14} className="text-blue-400" />,
  task_completed: <CheckCircle2 size={14} className="text-green-400" />,
  task_failed: <AlertTriangle size={14} className="text-red-400" />,
  rate_limited: <Pause size={14} className="text-amber-400" />,
}

/**
 * Row component for displaying activity feed items.
 */
export function ActivityRow({ activity, className, compact = false }: ActivityRowProps) {
  const time = new Date(activity.createdAt).toLocaleTimeString()
  const icon = actionIcons[activity.action ?? ''] ?? <Activity size={14} className="text-slate-400" />
  
  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 py-1.5 px-2 rounded bg-slate-900/30", className)}>
        <span className="flex-shrink-0">{icon}</span>
        <span className="text-xs text-slate-300 flex-1 min-w-0 truncate">
          <span className="text-white font-medium">{activity.agent?.name ?? 'System'}</span>
        </span>
        <span className="text-[10px] text-slate-500 flex-shrink-0">{time}</span>
      </div>
    )
  }
  
  return (
    <div className={cn("flex items-center gap-2 sm:gap-3 py-2 px-2 sm:px-3 rounded bg-slate-900/30", className)}>
      <span className="flex-shrink-0">{icon}</span>
      <span className="text-xs sm:text-sm text-slate-300 flex-1 min-w-0 truncate">
        <span className="text-white font-medium">{activity.agent?.name ?? 'System'}</span>
        {' '}{activity.action?.replace(/_/g, ' ')}
      </span>
      <span className="text-xs text-slate-500 flex-shrink-0">{time}</span>
    </div>
  )
}
