'use client'

import Link from 'next/link'
import { Rocket, Inbox, Plus } from 'lucide-react'

interface Session {
  id: string
  name: string
  status: string
  repository: {
    name: string
  }
  progress?: number
  taskStats?: {
    completed: number
    total: number
  }
}

interface ActiveSessionsProps {
  sessions: Session[]
  isLoading?: boolean
}

const STATUS_CONFIG: Record<string, { color: string; bgColor: string; dot: string; label: string }> = {
  RUNNING: { color: 'text-blue-400', bgColor: 'bg-blue-500/10', dot: 'bg-blue-500 animate-pulse', label: 'Running' },
  PENDING: { color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', dot: 'bg-yellow-500', label: 'Pending' },
  PAUSED: { color: 'text-orange-400', bgColor: 'bg-orange-500/10', dot: 'bg-orange-500', label: 'Paused' },
  COMPLETED: { color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', dot: 'bg-emerald-500', label: 'Done' },
  FAILED: { color: 'text-red-400', bgColor: 'bg-red-500/10', dot: 'bg-red-500', label: 'Failed' },
  STOPPED: { color: 'text-slate-400', bgColor: 'bg-slate-500/10', dot: 'bg-slate-500', label: 'Stopped' },
}

export function ActiveSessions({ sessions, isLoading }: ActiveSessionsProps) {
  // Show active/recent sessions (running, pending, paused first)
  const sortedSessions = [...sessions].sort((a, b) => {
    const priority: Record<string, number> = { RUNNING: 0, PENDING: 1, PAUSED: 2, FAILED: 3, COMPLETED: 4, STOPPED: 5 }
    return (priority[a.status] ?? 99) - (priority[b.status] ?? 99)
  }).slice(0, 6)

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/[0.06] p-4 animate-pulse">
        <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/[0.06] p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Rocket className="w-4 h-4 text-blue-500" />
          Active Sessions
        </h3>
        <Link
          href="/sessions"
          className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          View all →
        </Link>
      </div>

      {sortedSessions.length === 0 ? (
        <div className="text-center py-8">
          <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No sessions yet</p>
          <Link
            href="/sessions/new"
            className="inline-block mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
          >
            <span className="flex items-center gap-1">
              <Plus className="w-4 h-4" />
              Create Session
            </span>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedSessions.map(session => {
            const config = STATUS_CONFIG[session.status] || STATUS_CONFIG.STOPPED
            const progress = session.taskStats
              ? session.taskStats.total > 0
                ? Math.round((session.taskStats.completed / session.taskStats.total) * 100)
                : 0
              : session.progress || 0

            return (
              <Link
                key={session.id}
                href={`/sessions/${session.id}`}
                className={`block ${config.bgColor} rounded-lg p-3 hover:ring-1 hover:ring-slate-300 dark:hover:ring-slate-600 transition-all`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-2 h-2 rounded-full ${config.dot} flex-shrink-0`} />
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                      {session.name}
                    </span>
                  </div>
                  <span className={`text-xs font-medium ${config.color} flex-shrink-0`}>
                    {config.label}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">{session.repository.name}</span>
                  {session.taskStats && (
                    <span className="text-slate-500 dark:text-slate-400">
                      {session.taskStats.completed}/{session.taskStats.total} tasks
                    </span>
                  )}
                </div>
                {session.status === 'RUNNING' && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="text-right text-xs text-blue-500 dark:text-blue-400 mt-1">{progress}%</div>
                  </div>
                )}
              </Link>
            )
          })}
          <Link
            href="/sessions/new"
            className="flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-slate-300 dark:border-white/[0.06] hover:border-slate-400 dark:hover:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">New Session</span>
          </Link>
        </div>
      )}
    </div>
  )
}
