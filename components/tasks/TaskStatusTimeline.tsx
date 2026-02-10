'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, Clock, User, ExternalLink } from 'lucide-react'
import { STATUS_ORDER as CANONICAL_STATUS_ORDER, STATUS_CONFIG, getWorkflowForDomain, type WorkflowStep } from './config/status'
import { AgentAvatar } from '@/components/agents'
import { COUNCIL_AGENTS, ARMY_AGENTS } from '@/components/chat-v2/agentConfig'

// Build agent color lookup
const ALL_AGENTS_LIST = [...COUNCIL_AGENTS, ...ARMY_AGENTS]
const AGENT_COLOR_MAP: Record<string, string> = {}
ALL_AGENTS_LIST.forEach(a => { AGENT_COLOR_MAP[a.id] = a.color })

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
  domain?: string
  sessionId?: string | null
}

const DEFAULT_STATUS_ORDER = CANONICAL_STATUS_ORDER.map(key => ({
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
  const activity = activities.find(
    a => a.eventType === 'status_change' && a.details?.toValue === status
  )
  if (activity?.actor && activity.actor !== 'system') return activity.actor
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
  return config?.agent || null
}

function getPhaseDuration(
  statusKey: string,
  statusIndex: number,
  activities: TaskActivity[],
  currentStatus: string,
  workflowSteps: WorkflowStep[]
): string | null {
  const enteredTs = getStatusTimestamp(statusKey, activities)
  if (!enteredTs) return null

  const normalizedCurrent = currentStatus === 'in_progress' ? 'building' : currentStatus
  const currentIdx = workflowSteps.findIndex(s => s.key === normalizedCurrent)

  if (statusIndex === currentIdx) {
    return formatDuration(Date.now() - new Date(enteredTs).getTime())
  }

  if (statusIndex < currentIdx) {
    const nextStatus = workflowSteps[statusIndex + 1]
    if (nextStatus) {
      const nextTs = getStatusTimestamp(nextStatus.key, activities)
      if (nextTs) {
        return formatDuration(new Date(nextTs).getTime() - new Date(enteredTs).getTime())
      }
    }
  }
  return null
}

function getPhaseActivities(status: string, activities: TaskActivity[]): TaskActivity[] {
  // Get activities that happened during this phase
  const enteredTs = getStatusTimestamp(status, activities)
  if (!enteredTs) return []

  const enteredTime = new Date(enteredTs).getTime()
  // Find when the next phase started
  const statusChanges = activities
    .filter(a => a.eventType === 'status_change' && a.details?.toValue)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  const entryIdx = statusChanges.findIndex(a => a.details?.toValue === status)
  const nextChange = entryIdx >= 0 ? statusChanges[entryIdx + 1] : null
  const exitTime = nextChange ? new Date(nextChange.timestamp).getTime() : Date.now()

  return activities.filter(a => {
    const t = new Date(a.timestamp).getTime()
    return t >= enteredTime && t <= exitTime && a.eventType !== 'status_change'
  }).slice(0, 3) // Max 3 activities in popover
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

function formatEventBrief(activity: TaskActivity): string {
  switch (activity.eventType) {
    case 'task_created': return 'Task created'
    case 'assigned': return `Assigned to ${activity.details?.toValue || 'agent'}`
    case 'handoff': return `Handoff to ${activity.details?.toValue || 'agent'}`
    case 'task_submitted': return 'Submitted for verification'
    case 'verification_passed': return 'Verification passed'
    case 'verification_failed': return 'Verification failed'
    case 'agent_completed': return 'Agent completed work'
    case 'agent_failed': return 'Agent failed'
    case 'comment': return 'Comment added'
    default: return activity.eventType.replace(/_/g, ' ')
  }
}

export function TaskStatusTimeline({
  currentStatus,
  activities,
  onStatusClick,
  domain,
  sessionId,
}: TaskStatusTimelineProps) {
  const [hoveredPhase, setHoveredPhase] = useState<string | null>(null)
  const workflowSteps = domain ? getWorkflowForDomain(domain) : DEFAULT_STATUS_ORDER
  const normalizedStatus = currentStatus === 'in_progress' ? 'building' : currentStatus
  const currentIndex = workflowSteps.findIndex(s => s.key === normalizedStatus)
  const isCancelled = currentStatus === 'cancelled'

  return (
    <div className="py-4">
      {/* Phase cards strip */}
      <div className="flex items-stretch gap-1 relative bg-blue-950/20 border border-blue-500/[0.08] rounded-2xl p-2">
        {workflowSteps.map((status, index) => {
          const isDoneStatus = normalizedStatus === 'done' || normalizedStatus === 'completed'
          const isComplete = (index < currentIndex || (isDoneStatus && index === currentIndex)) && !isCancelled
          const isCurrent = index === currentIndex && !isDoneStatus && !isCancelled
          const isPending = index > currentIndex || isCancelled
          const agent = getPhaseAgent(status.key, activities)
          const agentColor = agent ? AGENT_COLOR_MAP[agent] : null
          const duration = getPhaseDuration(status.key, index, activities, currentStatus, workflowSteps)
          const isHovered = hoveredPhase === status.key
          const phaseActivities = isHovered && (isComplete || isCurrent) ? getPhaseActivities(status.key, activities) : []

          return (
            <div key={status.key} className="flex items-stretch flex-1 min-w-0 relative">
              {/* Phase card */}
              <div
                onMouseEnter={() => (isComplete || isCurrent) && setHoveredPhase(status.key)}
                onMouseLeave={() => setHoveredPhase(null)}
                className={`
                  flex-1 min-w-0 rounded-xl p-2.5 flex flex-col items-center gap-1.5
                  transition-all duration-300 group relative
                  ${isComplete ? 'bg-emerald-500/[0.08] border border-emerald-500/[0.15] hover:bg-emerald-500/[0.12]' : ''}
                  ${isCurrent && !agentColor ? 'bg-blue-500/[0.12] border border-blue-500/[0.2] shadow-[0_0_20px_-4px_rgb(59_130_246/0.3)] animate-glow-pulse' : ''}
                  ${isCurrent && agentColor ? 'border animate-glow-pulse' : ''}
                  ${isPending ? 'bg-white/[0.02] border border-transparent opacity-40' : ''}
                `}
                style={isCurrent && agentColor ? {
                  backgroundColor: `${agentColor}18`,
                  borderColor: `${agentColor}40`,
                  boxShadow: `0 0 20px -4px ${agentColor}50`,
                } : undefined}
              >
                {/* Status indicator + agent */}
                <div className="flex items-center gap-1.5">
                  {isCurrent && (
                    <div
                      className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
                      style={{ backgroundColor: agentColor || '#60a5fa' }}
                    />
                  )}
                  {isPending && (
                    <Circle size={12} className="text-blue-300/30 flex-shrink-0" />
                  )}
                  {agent && (isComplete || isCurrent) ? (
                    <AgentAvatar agentId={agent} size="xs" />
                  ) : isComplete && !agent ? (
                    <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
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
                  <span
                    className={`
                      text-[10px] font-mono leading-none
                      ${isComplete ? 'text-emerald-400/60' : ''}
                      ${isCurrent && !agentColor ? 'text-blue-300' : ''}
                    `}
                    style={isCurrent && agentColor ? { color: agentColor, opacity: 0.8 } : undefined}
                  >
                    {duration}
                  </span>
                )}
              </div>

              {/* Hover popover */}
              {isHovered && (isComplete || isCurrent) && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-56 bg-[#0c1a30] border border-blue-500/20 rounded-xl shadow-[0_8px_32px_-8px_rgb(0_0_0/0.8)] p-3 pointer-events-none">
                  {/* Arrow */}
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0c1a30] border-l border-t border-blue-500/20 rotate-45" />

                  {/* Agent info */}
                  {agent && (
                    <div className="flex items-center gap-2 mb-2">
                      <AgentAvatar agentId={agent} size="sm" />
                      <div>
                        <p className="text-xs font-semibold text-white capitalize">{agent}</p>
                        <p className="text-[10px] text-slate-500">{status.label} phase</p>
                      </div>
                    </div>
                  )}

                  {/* Duration */}
                  {duration && (
                    <div className="flex items-center gap-1.5 mb-2 text-[10px]">
                      <Clock size={10} className="text-slate-400" />
                      <span className="text-slate-400">Duration:</span>
                      <span className="text-white font-mono">{duration}</span>
                    </div>
                  )}

                  {/* Key activities */}
                  {phaseActivities.length > 0 && (
                    <div className="border-t border-white/[0.06] pt-2 mt-2 space-y-1">
                      {phaseActivities.map((a) => (
                        <p key={a.id} className="text-[10px] text-slate-400 truncate">
                          {formatEventBrief(a)}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Session link for current phase */}
                  {isCurrent && sessionId && (
                    <div className="border-t border-white/[0.06] pt-2 mt-2">
                      <a
                        href={`/sessions/${sessionId}`}
                        className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 pointer-events-auto transition-colors"
                      >
                        View live logs <ExternalLink size={8} />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Connecting line */}
              {index < workflowSteps.length - 1 && (
                <div className="flex items-center w-2 flex-shrink-0">
                  <div
                    className={`
                      h-px w-full
                      ${isComplete ? 'bg-emerald-500/30' : ''}
                      ${isCurrent && !agentColor ? 'bg-blue-500/30' : ''}
                      ${isPending ? 'bg-blue-500/[0.06]' : ''}
                    `}
                    style={isCurrent && agentColor ? { backgroundColor: `${agentColor}50` } : undefined}
                  />
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
