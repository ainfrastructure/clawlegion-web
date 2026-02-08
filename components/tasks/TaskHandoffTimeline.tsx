'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { AgentAvatar } from '@/components/agents'
import {
  ArrowRight, CheckCircle2, XCircle, Clock, GitBranch,
  FileCode, Send, Shield, Loader2
} from 'lucide-react'

interface TimelineEntry {
  id: string
  type: 'assignment' | 'routing' | 'activity' | 'submission' | 'verification' | 'subwork'
  timestamp: string
  agent?: string
  data: Record<string, unknown>
}

function getEntryIcon(entry: TimelineEntry) {
  switch (entry.type) {
    case 'assignment':
      return <ArrowRight className="w-4 h-4 text-blue-400" />
    case 'routing':
      return <GitBranch className="w-4 h-4 text-violet-400" />
    case 'submission':
      return <Send className="w-4 h-4 text-amber-400" />
    case 'verification': {
      const verdict = entry.data.verdict as string
      if (verdict === 'VERIFIED') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      if (verdict === 'REJECTED') return <XCircle className="w-4 h-4 text-red-400" />
      return <Shield className="w-4 h-4 text-yellow-400" />
    }
    case 'subwork':
      return <FileCode className="w-4 h-4 text-cyan-400" />
    default:
      return <Clock className="w-4 h-4 text-slate-400" />
  }
}

function getEntryLabel(entry: TimelineEntry): string {
  switch (entry.type) {
    case 'assignment':
      return `Assigned to ${entry.agent}`
    case 'routing':
      return `${entry.data.fromStatus} → ${entry.data.toStatus}`
    case 'submission':
      return `Submitted (confidence: ${entry.data.confidence}/10)`
    case 'verification':
      return `Verdict: ${entry.data.verdict} (score: ${entry.data.score}/10)`
    case 'subwork':
      return `${entry.data.label} (${entry.data.status})`
    case 'activity':
      return (entry.data.details as Record<string, unknown>)?.message as string || entry.data.eventType as string
    default:
      return entry.type
  }
}

function getLeftBorderColor(entry: TimelineEntry): string {
  switch (entry.type) {
    case 'assignment': return 'border-l-blue-500'
    case 'routing': return 'border-l-violet-500'
    case 'submission': return 'border-l-amber-500'
    case 'verification': {
      const verdict = entry.data.verdict as string
      if (verdict === 'VERIFIED') return 'border-l-emerald-500'
      if (verdict === 'REJECTED') return 'border-l-red-500'
      return 'border-l-yellow-500'
    }
    case 'subwork': return 'border-l-cyan-500'
    default: return 'border-l-white/[0.06]'
  }
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getDuration(start: string, end?: string): string {
  const ms = (end ? new Date(end).getTime() : Date.now()) - new Date(start).getTime()
  if (ms < 60000) return `${Math.round(ms / 1000)}s`
  if (ms < 3600000) return `${Math.round(ms / 60000)}m`
  return `${(ms / 3600000).toFixed(1)}h`
}

function getDurationPercent(start: string, end: string, maxMs: number): number {
  const ms = new Date(end).getTime() - new Date(start).getTime()
  return Math.min(100, Math.max(5, (ms / maxMs) * 100))
}

export function TaskHandoffTimeline({ taskId }: { taskId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['task-timeline', taskId],
    queryFn: async () => {
      const res = await api.get(`/routing/events/${taskId}/timeline`)
      return res.data.timeline as TimelineEntry[]
    },
    enabled: !!taskId,
    staleTime: 15000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    )
  }

  const timeline = data || []

  if (timeline.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500 text-sm">
        No handoff events yet
      </div>
    )
  }

  // Compute max duration for bar scaling
  const maxDurationMs = Math.max(
    ...timeline
      .filter(e => e.type === 'assignment' && e.data.completedAt)
      .map(e => new Date(e.data.completedAt as string).getTime() - new Date(e.timestamp).getTime()),
    1
  )

  return (
    <div className="space-y-2">
      {timeline.map((entry) => {
        const verdict = entry.type === 'verification' ? String(entry.data.verdict ?? '') : ''
        const completedAt = entry.data.completedAt as string | undefined
        const filesChanged = entry.data.filesChanged as string[] | undefined
        const confidenceAccuracy = entry.data.confidenceAccuracy as string | undefined

        return (
          <div
            key={entry.id}
            className={`bg-blue-950/20 border border-blue-500/[0.06] rounded-lg p-3 border-l-2 ${getLeftBorderColor(entry)}`}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="mt-0.5 p-1.5 bg-white/[0.06] rounded-full flex-shrink-0">
                {getEntryIcon(entry)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {entry.agent && entry.agent !== 'system' && (
                    <AgentAvatar agentId={entry.agent} size="md" />
                  )}
                  <span className="text-sm text-white font-medium">
                    {getEntryLabel(entry)}
                  </span>
                </div>

                {/* Verification verdict badge */}
                {entry.type === 'verification' && (
                  <VerdictBadge verdict={verdict} />
                )}

                {/* Duration bar for assignments */}
                {entry.type === 'assignment' && completedAt && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500/50 rounded-full"
                        style={{
                          width: `${getDurationPercent(entry.timestamp, completedAt, maxDurationMs)}%`
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                      {getDuration(entry.timestamp, completedAt)}
                    </span>
                  </div>
                )}

                {/* Subwork file count */}
                {entry.type === 'subwork' && filesChanged && filesChanged.length > 0 && (
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                    <FileCode className="w-3 h-3" />
                    {filesChanged.length} files changed
                  </div>
                )}

                {/* Meta row */}
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[10px] text-slate-500">{formatTimestamp(entry.timestamp)}</span>
                  {entry.type === 'verification' && confidenceAccuracy && (
                    <span className={`text-[10px] ${
                      confidenceAccuracy === 'accurate' ? 'text-emerald-400' :
                      confidenceAccuracy === 'overconfident' ? 'text-amber-400' : 'text-blue-400'
                    }`}>
                      {confidenceAccuracy}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const colorClass = verdict === 'VERIFIED'
    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
    : verdict === 'REJECTED'
      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
      : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'

  return (
    <div className="mt-1.5">
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${colorClass}`}>
        {verdict === 'VERIFIED' && <CheckCircle2 className="w-3 h-3" />}
        {verdict === 'REJECTED' && <XCircle className="w-3 h-3" />}
        {verdict}
      </span>
    </div>
  )
}

export default TaskHandoffTimeline
