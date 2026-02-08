'use client'

import { formatTimeAgo } from '@/components/common/TimeAgo'
import {
  CheckCircle,
  Rocket,
  XCircle, 
  ClipboardList, 
  Sparkles, 
  Zap,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Bot,
  FileText,
  GitMerge,
  Star,
  BarChart3,
  Inbox
} from 'lucide-react'
import { ReactNode } from 'react'
import { AgentAvatar } from '@/components/agents'

interface Activity {
  id: string
  type: string
  message: string
  sessionId?: string
  sessionName?: string
  taskId?: string
  agentName?: string
  timestamp: string
}

interface ActivityFeedProps {
  activities: Activity[]
  isLoading?: boolean
}

const ACTIVITY_CONFIG: Record<string, { icon: ReactNode; color: string }> = {
  task_completed: { icon: <CheckCircle className="w-4 h-4" />, color: 'text-emerald-400' },
  task_started: { icon: <Rocket className="w-4 h-4" />, color: 'text-blue-400' },
  task_failed: { icon: <XCircle className="w-4 h-4" />, color: 'text-red-400' },
  session_created: { icon: <ClipboardList className="w-4 h-4" />, color: 'text-purple-400' },
  session_completed: { icon: <Sparkles className="w-4 h-4" />, color: 'text-emerald-400' },
  session_failed: { icon: <Zap className="w-4 h-4" />, color: 'text-red-400' },
  approval_pending: { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-yellow-400' },
  approval_approved: { icon: <ThumbsUp className="w-4 h-4" />, color: 'text-emerald-400' },
  approval_rejected: { icon: <ThumbsDown className="w-4 h-4" />, color: 'text-red-400' },
  agent_rate_limited: { icon: <Clock className="w-4 h-4" />, color: 'text-orange-400' },
  agent_registered: { icon: <Bot className="w-4 h-4" />, color: 'text-blue-400' },
  commit_pushed: { icon: <FileText className="w-4 h-4" />, color: 'text-cyan-400' },
  pr_created: { icon: <GitMerge className="w-4 h-4" />, color: 'text-purple-400' },
  pr_merged: { icon: <Star className="w-4 h-4" />, color: 'text-emerald-400' },
}

export function ActivityFeed({ activities, isLoading }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="bg-slate-800 dark:bg-slate-800 bg-white rounded-xl border border-white/[0.06] dark:border-white/[0.06] border-slate-200 p-4 animate-pulse">
        <div className="h-6 w-28 bg-slate-700 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 bg-slate-700 rounded-full" />
              <div className="flex-1">
                <div className="h-4 w-3/4 bg-slate-700 rounded mb-1" />
                <div className="h-3 w-1/2 bg-slate-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 dark:bg-slate-800 bg-white rounded-xl border border-white/[0.06] dark:border-white/[0.06] border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200 dark:text-slate-200 text-slate-800 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> Activity Feed
        </h3>
        <span className="text-xs text-slate-400">Live</span>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Inbox className="w-10 h-10 mx-auto mb-2 text-slate-500" />
          <p className="text-sm text-slate-400">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-1 max-h-[320px] overflow-y-auto custom-scrollbar">
          {activities.map((activity, idx) => {
            const config = ACTIVITY_CONFIG[activity.type] || { icon: <ClipboardList className="w-4 h-4" />, color: 'text-slate-400' }

            return (
              <div
                key={activity.id || idx}
                className="flex items-start gap-3 py-2 px-2 rounded-lg hover:bg-slate-700/30 transition-colors"
              >
                <div className={`flex-shrink-0 ${config.color}`}>{config.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 dark:text-slate-200 text-slate-700 leading-tight">
                    {activity.message}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {activity.agentName && (
                      <div className="flex items-center gap-1">
                        <AgentAvatar agentId={activity.agentName} size="xs" />
                        <span className="text-xs text-purple-400">{activity.agentName}</span>
                      </div>
                    )}
                    <span className="text-xs text-slate-500">
                      {formatTimeAgo(new Date(activity.timestamp))}
                    </span>
                    {activity.sessionName && (
                      <span className="text-xs text-slate-500">
                        · {activity.sessionName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
