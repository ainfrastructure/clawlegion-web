'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { AgentAvatar } from '@/components/agents'
import { formatTimeAgo } from '@/components/common/TimeAgo'
import { Loader2 } from 'lucide-react'
import {
  PlayCircle, ArrowRight, User, Bot, Settings, Star, FileText,
  Send, Shield, ShieldX, Ban, CheckCircle2, AlertTriangle, Rocket,
  GitBranch, FileCode, Zap, MessageSquare, XCircle, Clock,
} from 'lucide-react'

type TaskActivity = {
  id: string
  taskId?: string
  eventType: string
  actor: string
  actorType?: string
  details: Record<string, unknown> | null
  timestamp: string
}

type TimelineEntry = {
  id: string
  type: 'assignment' | 'routing' | 'activity' | 'submission' | 'verification' | 'subwork'
  timestamp: string
  agent?: string
  data: Record<string, unknown>
}

type UnifiedEvent = {
  id: string
  timestamp: string
  agent: string
  agentType: string
  icon: React.ReactNode
  description: string
  source: 'activity' | 'handoff'
  extra?: React.ReactNode
}

type TimelineTabProps = {
  taskId: string
  activities: TaskActivity[] | undefined
  isLoadingActivities: boolean
}

function getActivityIcon(eventType: string) {
  switch (eventType) {
    case 'task_created': return <PlayCircle className="text-emerald-400" size={14} />
    case 'status_change': return <ArrowRight className="text-blue-400" size={14} />
    case 'priority_change': return <Star className="text-amber-400" size={14} />
    case 'specs_updated': return <FileText className="text-slate-300" size={14} />
    case 'assigned': return <User className="text-amber-400" size={14} />
    case 'unassigned': return <XCircle className="text-slate-400" size={14} />
    case 'handoff': return <GitBranch className="text-violet-400" size={14} />
    case 'task_submitted':
    case 'submitted_for_verification': return <Send className="text-purple-400" size={14} />
    case 'verification_passed':
    case 'task_verified': return <Shield className="text-emerald-400" size={14} />
    case 'verification_failed': return <ShieldX className="text-red-400" size={14} />
    case 'task_blocked': return <Ban className="text-red-400" size={14} />
    case 'agent_completed': return <CheckCircle2 className="text-emerald-400" size={14} />
    case 'agent_failed': return <AlertTriangle className="text-red-400" size={14} />
    case 'manual_dispatch': return <Rocket className="text-cyan-400" size={14} />
    case 'routing_dispatched': return <GitBranch className="text-violet-400" size={14} />
    case 'routing_failed': return <AlertTriangle className="text-red-400" size={14} />
    case 'subwork_spawned': return <FileCode className="text-cyan-400" size={14} />
    case 'subwork_completed': return <Zap className="text-emerald-400" size={14} />
    case 'subwork_failed': return <AlertTriangle className="text-amber-400" size={14} />
    case 'comment': return <MessageSquare className="text-blue-400" size={14} />
    default: return <Settings className="text-slate-400" size={14} />
  }
}

function getHandoffIcon(type: string, data: Record<string, unknown>) {
  switch (type) {
    case 'assignment': return <ArrowRight className="text-blue-400" size={14} />
    case 'routing': return <GitBranch className="text-violet-400" size={14} />
    case 'submission': return <Send className="text-amber-400" size={14} />
    case 'verification': {
      const verdict = data.verdict as string
      if (verdict === 'VERIFIED') return <CheckCircle2 className="text-emerald-400" size={14} />
      if (verdict === 'REJECTED') return <XCircle className="text-red-400" size={14} />
      return <Shield className="text-yellow-400" size={14} />
    }
    case 'subwork': return <FileCode className="text-cyan-400" size={14} />
    default: return <Clock className="text-slate-400" size={14} />
  }
}

function formatActivityDescription(eventType: string, details: Record<string, unknown> | null): string {
  switch (eventType) {
    case 'task_created': return 'created the task'
    case 'status_change': return `changed status from "${details?.fromValue || details?.fromStatus}" to "${details?.toValue || details?.toStatus}"`
    case 'priority_change': return `changed priority from ${details?.fromValue} to ${details?.toValue}`
    case 'specs_updated': return 'updated specifications'
    case 'assigned': return `assigned to ${details?.toValue || details?.targetAgent || 'someone'}`
    case 'unassigned': return `unassigned from ${details?.fromValue || 'someone'}`
    case 'handoff': return `handed off to ${details?.toValue || details?.targetAgent || 'another agent'}`
    case 'task_submitted': return `submitted for verification (confidence: ${details?.confidence || '?'}/10)`
    case 'submitted_for_verification': return 'submitted for verification'
    case 'verification_passed': return `verification passed (score: ${details?.score || '?'}/10)`
    case 'verification_failed': return `verification failed — ${details?.verdict || 'needs work'}`
    case 'task_verified': return `verified the task (${details?.toValue || details?.verdict || 'passed'})`
    case 'task_blocked': return `task blocked — ${details?.reason || 'missing prerequisite'}`
    case 'agent_completed': return `completed work${details?.filesChanged ? ` (${(details.filesChanged as string[]).length} files)` : ''}`
    case 'agent_failed': return `failed — ${details?.notes || details?.error || 'unknown error'}`
    case 'manual_dispatch': return `manually dispatched to ${details?.targetAgent || 'agent'}`
    case 'routing_dispatched': return `auto-routed to ${details?.targetAgent || details?.assignedAgent || 'agent'}`
    case 'routing_failed': return `routing failed — ${details?.error || 'could not reach agent'}`
    case 'subwork_spawned': return `spawned sub-work: ${details?.label || 'subtask'}`
    case 'subwork_completed': return `sub-work completed: ${details?.label || 'subtask'}`
    case 'subwork_failed': return `sub-work failed: ${details?.label || 'subtask'}`
    case 'comment': return 'added a comment'
    default: return eventType.replace(/_/g, ' ')
  }
}

function formatHandoffDescription(type: string, data: Record<string, unknown>, agent?: string): string {
  switch (type) {
    case 'assignment': return `Assigned to ${agent || 'agent'}`
    case 'routing': return `${data.fromStatus} → ${data.toStatus}`
    case 'submission': return `Submitted (confidence: ${data.confidence}/10)`
    case 'verification': return `Verdict: ${data.verdict} (score: ${data.score}/10)`
    case 'subwork': return `${data.label} (${data.status})`
    default: return type
  }
}

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

export function TimelineTab({ taskId, activities, isLoadingActivities }: TimelineTabProps) {
  const { data: handoffData, isLoading: isLoadingHandoffs } = useQuery({
    queryKey: ['task-timeline', taskId],
    queryFn: async () => {
      const res = await api.get(`/routing/events/${taskId}/timeline`)
      return res.data.timeline as TimelineEntry[]
    },
    enabled: !!taskId,
    staleTime: 15000,
  })

  const isLoading = isLoadingActivities || isLoadingHandoffs

  // Merge and deduplicate into unified events
  const unifiedEvents = useMemo(() => {
    const events: UnifiedEvent[] = []
    const seen = new Set<string>()

    // Add activities
    if (activities) {
      for (const a of activities) {
        // Create dedup key from type + timestamp (within 2s window)
        const ts = Math.floor(new Date(a.timestamp).getTime() / 2000)
        const dedupKey = `${a.eventType}-${ts}-${a.actor}`
        if (seen.has(dedupKey)) continue
        seen.add(dedupKey)

        events.push({
          id: `act-${a.id}`,
          timestamp: a.timestamp,
          agent: a.actor,
          agentType: a.actorType || 'system',
          icon: getActivityIcon(a.eventType),
          description: formatActivityDescription(a.eventType, a.details),
          source: 'activity',
        })
      }
    }

    // Add handoff entries (skip if already represented by an activity)
    if (handoffData) {
      for (const h of handoffData) {
        const ts = Math.floor(new Date(h.timestamp).getTime() / 2000)
        // Map handoff types to activity event types for dedup
        const eventTypeMap: Record<string, string> = {
          assignment: 'assigned',
          routing: 'routing_dispatched',
          submission: 'task_submitted',
          verification: 'verification_passed',
        }
        const mappedType = eventTypeMap[h.type] || h.type
        const dedupKey = `${mappedType}-${ts}-${h.agent || 'system'}`
        if (seen.has(dedupKey)) continue
        seen.add(dedupKey)

        events.push({
          id: `hoff-${h.id}`,
          timestamp: h.timestamp,
          agent: h.agent || 'system',
          agentType: h.agent && h.agent !== 'system' ? 'agent' : 'system',
          icon: getHandoffIcon(h.type, h.data),
          description: formatHandoffDescription(h.type, h.data, h.agent),
          source: 'handoff',
        })
      }
    }

    // Sort by timestamp descending (newest first)
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    return events
  }, [activities, handoffData])

  // Group by date
  const groups = useMemo(() => {
    const result: { label: string; events: UnifiedEvent[] }[] = []
    let current: { label: string; events: UnifiedEvent[] } | null = null

    for (const event of unifiedEvents) {
      const label = getDateGroupLabel(event.timestamp)
      if (!current || current.label !== label) {
        current = { label, events: [] }
        result.push(current)
      }
      current.events.push(event)
    }
    return result
  }, [unifiedEvents])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      </div>
    )
  }

  if (unifiedEvents.length === 0) {
    return (
      <div className="text-center py-12">
        <Settings className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-sm text-slate-500">No timeline events yet</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {groups.map((group) => (
        <div key={group.label}>
          {/* Date separator */}
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{group.label}</span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          <div className="space-y-1.5">
            {group.events.map((event) => (
              <div
                key={event.id}
                className="bg-blue-950/20 border border-blue-500/[0.06] hover:border-blue-500/[0.12] rounded-lg p-3 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="mt-0.5 p-1.5 bg-white/[0.06] rounded-full flex-shrink-0">
                    {event.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                      <span className="flex items-center gap-1.5 flex-shrink-0">
                        {event.agentType === 'agent' ? (
                          <AgentAvatar agentId={event.agent} size="sm" />
                        ) : event.agentType === 'human' ? (
                          <User className="text-blue-400" size={12} />
                        ) : (
                          <Bot className="text-slate-400" size={12} />
                        )}
                        <span className="font-medium text-white">{event.agent}</span>
                      </span>
                      <span className="text-slate-400">{event.description}</span>
                    </div>

                    {event.extra}

                    {/* Timestamp */}
                    <div className="text-[10px] text-slate-500 mt-1">
                      {formatTimeAgo(new Date(event.timestamp))}
                      <span className="mx-1">&middot;</span>
                      {new Date(event.timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
