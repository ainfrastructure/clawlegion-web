'use client'

import { CheckCircle2, Circle, Clock, User } from 'lucide-react'
import { STATUS_ORDER as CANONICAL_STATUS_ORDER, STATUS_CONFIG } from './config/status'
import { AgentAvatar } from '@/components/agents'

interface TaskActivity {
  id: string
  eventType: string
  actor?: string
  details: {
    fromValue?: string
    toValue?: string
  } | null
  timestamp: string
}

interface TaskStatusTimelineProps {
  currentStatus: string
  activities: TaskActivity[]
  onStatusClick?: (status: string) => void
}

const STATUS_ORDER = CANONICAL_STATUS_ORDER.map(key => ({
  key,
  label: STATUS_CONFIG[key].label,
  color: STATUS_CONFIG[key].color,
  agent: STATUS_CONFIG[key].agent,
}))

function getStatusTimestamp(status: string, activities: TaskActivity[]): string | null {
  const activity = activities.find(
    a => a.eventType === 'status_change' && a.details?.toValue === status
  )
  if (!activity && (status === 'backlog' || status === 'todo')) {
    const created = activities.find(a => a.eventType === 'task_created')
    if (created) return created.timestamp
  }
  return activity?.timestamp || null
}

function getPhaseAgent(status: string, activities: TaskActivity[]): string | null {
  // Find the status_change activity where this status was entered
  const activity = activities.find(
    a => a.eventType === 'status_change' && a.details?.toValue === status
  )
  if (activity?.actor && activity.actor !== 'system') return activity.actor
  // Fallback to canonical agent from config
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
  return config?.agent || null
}

function getPhaseDuration(
  statusKey: string,
  statusIndex: number,
  activities: TaskActivity[],
  currentStatus: string
): string | null {
  const enteredTs = getStatusTimestamp(statusKey, activities)
  if (!enteredTs) return null

  // Normalize currentStatus for comparison
  const normalizedCurrent = currentStatus === 'in_progress' ? 'building' : currentStatus
  const currentIdx = STATUS_ORDER.findIndex(s => s.key === normalizedCurrent)

  // If this is the current phase, show elapsed time
  if (statusIndex === currentIdx) {
    return formatDuration(Date.now() - new Date(enteredTs).getTime())
  }

  // If this phase is completed, find when the next phase started
  if (statusIndex < currentIdx) {
    const nextStatus = STATUS_ORDER[statusIndex + 1]
    if (nextStatus) {
      const nextTs = getStatusTimestamp(nextStatus.key, activities)
      if (nextTs) {
        return formatDuration(new Date(nextTs).getTime() - new Date(enteredTs).getTime())
      }
    }
  }
  return null
}

function formatDuration(ms: number): string {
  if (ms < 0) ms = 0
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainMin = minutes % 60
  if (remainMin === 0) return `${hours}h`
  return `${hours}h ${remainMin}m`
}

export function TaskStatusTimeline({
  currentStatus,
  activities,
  onStatusClick
}: TaskStatusTimelineProps) {
  const normalizedStatus = currentStatus === 'in_progress' ? 'building' : currentStatus
  const currentIndex = STATUS_ORDER.findIndex(s => s.key === normalizedStatus)
  const isCancelled = currentStatus === 'cancelled'

  return (
    <div className="py-4">
      {/* Phase cards strip */}
      <div className="flex items-stretch gap-1 relative bg-blue-950/20 border border-blue-500/[0.08] rounded-2xl p-2">
        {STATUS_ORDER.map((status, index) => {
          const isComplete = index < currentIndex && !isCancelled
          const isCurrent = index === currentIndex && !isCancelled
          const isPending = index > currentIndex || isCancelled
          const agent = getPhaseAgent(status.key, activities)
          const duration = getPhaseDuration(status.key, index, activities, currentStatus)

          return (
            <div key={status.key} className="flex items-stretch flex-1 min-w-0">
              {/* Phase card */}
              <button
                onClick={() => onStatusClick?.(status.key)}
                className={`
                  flex-1 min-w-0 rounded-xl p-2.5 flex flex-col items-center gap-1.5
                  transition-all duration-300 cursor-pointer group relative
                  ${isComplete ? 'bg-emerald-500/[0.08] border border-emerald-500/[0.15] hover:bg-emerald-500/[0.12]' : ''}
                  ${isCurrent ? 'bg-blue-500/[0.12] border border-blue-500/[0.2] shadow-[0_0_20px_-4px_rgb(59_130_246/0.3)] animate-glow-pulse' : ''}
                  ${isPending ? 'bg-white/[0.02] border border-transparent opacity-40' : ''}
                `}
              >
                {/* Status indicator + agent */}
                <div className="flex items-center gap-1.5">
                  {isComplete && (
                    <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                  )}
                  {isCurrent && (
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
                  )}
                  {isPending && (
                    <Circle size={12} className="text-blue-300/30 flex-shrink-0" />
                  )}
                  {agent && (isComplete || isCurrent) ? (
                    <AgentAvatar agentId={agent} size="xs" />
                  ) : isPending ? (
                    <div className="w-5 h-5 rounded-full bg-blue-500/[0.08] flex items-center justify-center">
                      <User size={10} className="text-blue-300/30" />
                    </div>
                  ) : null}
                </div>

                {/* Label */}
                <span className={`
                  text-[11px] font-medium text-center leading-tight truncate w-full
                  ${isComplete ? 'text-emerald-300/80' : ''}
                  ${isCurrent ? 'text-white' : ''}
                  ${isPending ? 'text-blue-300/30' : ''}
                `}>
                  {status.label}
                </span>

                {/* Duration */}
                {duration && (isComplete || isCurrent) && (
                  <span className={`
                    text-[10px] font-mono leading-none
                    ${isComplete ? 'text-emerald-400/60' : ''}
                    ${isCurrent ? 'text-blue-300' : ''}
                  `}>
                    {duration}
                  </span>
                )}
              </button>

              {/* Connecting line */}
              {index < STATUS_ORDER.length - 1 && (
                <div className="flex items-center w-2 flex-shrink-0">
                  <div className={`
                    h-px w-full
                    ${isComplete ? 'bg-emerald-500/30' : ''}
                    ${isCurrent ? 'bg-blue-500/30' : ''}
                    ${isPending ? 'bg-blue-500/[0.06]' : ''}
                  `} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Cancelled/Blocked banner */}
      {isCancelled && (
        <div className="mt-4 px-4 py-2 bg-red-950/30 border border-red-500/20 rounded-lg text-center">
          <span className="text-red-400 text-sm font-medium">Task Cancelled</span>
        </div>
      )}
      {currentStatus === 'blocked' && (
        <div className="mt-4 px-4 py-2 bg-red-950/30 border border-red-500/30 rounded-lg text-center">
          <span className="text-red-400 text-sm font-medium">Task Blocked — Needs Human Review</span>
        </div>
      )}
    </div>
  )
}

export default TaskStatusTimeline
