'use client'

import {
  GitCommit,
  ArrowRight,
  User,
  Bot,
  Settings,
  CheckCircle2,
  XCircle,
  PlayCircle,
  MessageSquare,
  Send,
  Shield,
  ShieldAlert,
  ShieldX,
  AlertTriangle,
  Zap,
  GitBranch,
  FileCode,
  Ban,
  Rocket,
  Star,
  FileText,
} from 'lucide-react'
import { AgentAvatar } from '@/components/agents'
import { getStatusConfig } from './config'
import { formatTimeAgo } from '@/components/common/TimeAgo'

interface TaskActivity {
  id: string
  taskId: string
  eventType: string
  actor: string
  actorType: string
  details: {
    fromValue?: string
    toValue?: string
    [key: string]: any
  } | null
  timestamp: string
}

interface TaskActivityLogProps {
  activities: TaskActivity[]
  isLoading?: boolean
}

// Critical events that should show expanded details by default
const CRITICAL_EVENTS = new Set([
  'verification_failed',
  'agent_failed',
  'task_blocked',
  'routing_failed',
  'subwork_failed',
])

function getDateGroupLabel(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const activityDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (activityDate.getTime() === today.getTime()) return 'Today'
  if (activityDate.getTime() === yesterday.getTime()) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getEventIcon(eventType: string) {
  switch (eventType) {
    case 'task_created':
      return <PlayCircle className="text-emerald-400" size={14} />
    case 'status_change':
      return <ArrowRight className="text-blue-400" size={14} />
    case 'priority_change':
      return <Star className="text-amber-400" size={14} />
    case 'specs_updated':
      return <FileText className="text-slate-300" size={14} />
    case 'assigned':
      return <User className="text-amber-400" size={14} />
    case 'unassigned':
      return <XCircle className="text-slate-400" size={14} />
    case 'handoff':
      return <GitCommit className="text-violet-400" size={14} />
    case 'task_submitted':
    case 'submitted_for_verification':
      return <Send className="text-purple-400" size={14} />
    case 'verification_passed':
    case 'task_verified':
      return <Shield className="text-emerald-400" size={14} />
    case 'verification_failed':
      return <ShieldX className="text-red-400" size={14} />
    case 'task_blocked':
      return <Ban className="text-red-400" size={14} />
    case 'agent_completed':
      return <CheckCircle2 className="text-emerald-400" size={14} />
    case 'agent_failed':
      return <AlertTriangle className="text-red-400" size={14} />
    case 'manual_dispatch':
      return <Rocket className="text-cyan-400" size={14} />
    case 'routing_dispatched':
      return <GitBranch className="text-violet-400" size={14} />
    case 'routing_failed':
      return <ShieldAlert className="text-red-400" size={14} />
    case 'subwork_spawned':
      return <FileCode className="text-cyan-400" size={14} />
    case 'subwork_completed':
      return <Zap className="text-emerald-400" size={14} />
    case 'subwork_failed':
      return <AlertTriangle className="text-amber-400" size={14} />
    case 'comment':
      return <MessageSquare className="text-blue-400" size={14} />
    default:
      return <Settings className="text-slate-400" size={14} />
  }
}

function getActorIcon(actorType: string) {
  switch (actorType) {
    case 'human':
      return <User className="text-blue-400" size={12} />
    case 'agent':
      return <Bot className="text-purple-400" size={12} />
    default:
      return <Settings className="text-slate-400" size={12} />
  }
}

function formatEventDescription(activity: TaskActivity): string {
  const { eventType, details } = activity

  switch (eventType) {
    case 'task_created':
      return 'created the task'
    case 'status_change':
      return `changed status from "${details?.fromValue || details?.fromStatus}" to "${details?.toValue || details?.toStatus}"`
    case 'priority_change':
      return `changed priority from ${details?.fromValue} to ${details?.toValue}`
    case 'specs_updated':
      return 'updated specifications'
    case 'assigned':
      return `assigned to ${details?.toValue || details?.targetAgent || 'someone'}`
    case 'unassigned':
      return `unassigned from ${details?.fromValue || 'someone'}`
    case 'handoff':
      return `handed off to ${details?.toValue || details?.targetAgent || 'another agent'}`
    case 'task_submitted':
      return `submitted for verification (confidence: ${details?.confidence || '?'}/10)`
    case 'submitted_for_verification':
      return 'submitted for verification'
    case 'verification_passed':
      return `verification passed (score: ${details?.score || '?'}/10)`
    case 'verification_failed':
      return `verification failed — ${details?.verdict || 'needs work'}`
    case 'task_verified':
      return `verified the task (${details?.toValue || details?.verdict || 'passed'})`
    case 'task_blocked':
      return `task blocked — ${details?.reason || 'missing prerequisite'}`
    case 'agent_completed':
      return `completed work${details?.filesChanged ? ` (${(details.filesChanged as string[]).length} files)` : ''}`
    case 'agent_failed':
      return `failed — ${details?.notes || details?.error || 'unknown error'}`
    case 'manual_dispatch':
      return `manually dispatched to ${details?.targetAgent || 'agent'} — ${details?.reason || ''}`
    case 'routing_dispatched':
      return `auto-routed to ${details?.targetAgent || details?.assignedAgent || 'agent'}`
    case 'routing_failed':
      return `routing failed — ${details?.error || 'could not reach agent'}`
    case 'subwork_spawned':
      return `spawned sub-work: ${details?.label || 'subtask'}`
    case 'subwork_completed':
      return `sub-work completed: ${details?.label || 'subtask'}`
    case 'subwork_failed':
      return `sub-work failed: ${details?.label || 'subtask'}`
    case 'comment':
      return 'added a comment'
    default:
      return eventType.replace(/_/g, ' ')
  }
}

function StatusBadge({ status }: { status: string }) {
  const config = getStatusConfig(status)
  const StatusIcon = config.icon
  const colorMap: Record<string, string> = {
    slate: 'bg-slate-500/20 text-slate-300',
    blue: 'bg-blue-500/20 text-blue-300',
    indigo: 'bg-indigo-500/20 text-indigo-300',
    violet: 'bg-violet-500/20 text-violet-300',
    amber: 'bg-amber-500/20 text-amber-300',
    cyan: 'bg-cyan-500/20 text-cyan-300',
    green: 'bg-green-500/20 text-green-300',
    red: 'bg-red-500/20 text-red-300',
  }
  const classes = colorMap[config.color] || colorMap.slate
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${classes}`}>
      <StatusIcon className="w-2.5 h-2.5" />
      {config.label}
    </span>
  )
}

export function TaskActivityLog({ activities, isLoading }: TaskActivityLogProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-blue-950/20 border border-blue-500/[0.06] rounded-lg p-3">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 bg-white/[0.06] rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/[0.06] rounded w-3/4" />
                <div className="h-3 bg-white/[0.06] rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Settings className="mx-auto mb-2" size={24} />
        <p className="text-sm">No activity recorded yet</p>
      </div>
    )
  }

  // Group activities by date
  const groups: { label: string; items: TaskActivity[] }[] = []
  let currentGroup: { label: string; items: TaskActivity[] } | null = null

  for (const activity of activities) {
    const label = getDateGroupLabel(activity.timestamp)
    if (!currentGroup || currentGroup.label !== label) {
      currentGroup = { label, items: [] }
      groups.push(currentGroup)
    }
    currentGroup.items.push(activity)
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.label}>
          {/* Date separator */}
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{group.label}</span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          <div className="space-y-1.5">
            {group.items.map((activity) => {
              const isCritical = CRITICAL_EVENTS.has(activity.eventType)

              return (
                <div
                  key={activity.id}
                  className={`rounded-lg p-3 transition-colors ${
                    isCritical
                      ? 'bg-red-950/20 border border-red-500/[0.15]'
                      : 'bg-blue-950/20 border border-blue-500/[0.06] hover:border-blue-500/[0.12]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Event Icon */}
                    <div className="mt-0.5 p-1.5 bg-white/[0.06] rounded-full flex-shrink-0">
                      {getEventIcon(activity.eventType)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm flex-wrap">
                        <span className="flex items-center gap-1.5 flex-shrink-0">
                          {activity.actorType === 'agent' ? (
                            <AgentAvatar agentId={activity.actor} size="sm" />
                          ) : (
                            getActorIcon(activity.actorType)
                          )}
                          <span className="font-medium text-white">{activity.actor}</span>
                        </span>
                        <span className="text-slate-400">
                          {formatEventDescription(activity)}
                        </span>
                      </div>

                      {/* Status change: inline badges */}
                      {activity.eventType === 'status_change' && activity.details && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <StatusBadge status={activity.details.fromValue || ''} />
                          <ArrowRight size={10} className="text-slate-500" />
                          <StatusBadge status={activity.details.toValue || ''} />
                        </div>
                      )}

                      {/* Critical event expanded details */}
                      {isCritical && activity.details && (
                        <div className="mt-2 text-xs text-red-300/80 bg-red-500/5 rounded px-2.5 py-1.5">
                          {activity.details.verdict && <span>Verdict: {activity.details.verdict}</span>}
                          {activity.details.notes && <span>{activity.details.notes}</span>}
                          {activity.details.error && <span>{activity.details.error}</span>}
                          {activity.details.reason && <span>{activity.details.reason}</span>}
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className="text-[10px] text-slate-500 mt-1">
                        {formatTimeAgo(new Date(activity.timestamp))}
                        <span className="mx-1">&middot;</span>
                        {new Date(activity.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default TaskActivityLog
