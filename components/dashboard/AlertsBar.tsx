'use client'

import Link from 'next/link'
import { Bell, CheckCircle, AlertTriangle, Bug, XCircle, Sparkles } from 'lucide-react'

interface Approval {
  id: string
  title: string
  type: string
  sessionName: string
}

interface Issue {
  id: string
  title: string
  sessionName: string
}

interface AlertsBarProps {
  pendingApprovals: Approval[]
  openIssues: Issue[]
  failedSessions: number
  isLoading?: boolean
}

export function AlertsBar({ pendingApprovals, openIssues, failedSessions, isLoading }: AlertsBarProps) {
  const hasAlerts = pendingApprovals.length > 0 || openIssues.length > 0 || failedSessions > 0

  if (isLoading) {
    return (
      <div className="bg-slate-800 dark:bg-slate-800 bg-white rounded-xl border border-white/[0.06] dark:border-white/[0.06] border-slate-200 p-4 animate-pulse">
        <div className="h-6 w-40 bg-slate-700 rounded mb-4" />
        <div className="flex gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-1 h-20 bg-slate-700 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-xl border p-4 ${
      hasAlerts
        ? 'bg-slate-800/50 dark:bg-slate-800/50 bg-amber-50 border-yellow-600/50 dark:border-yellow-600/50 border-yellow-300'
        : 'bg-slate-800 dark:bg-slate-800 bg-white border-white/[0.06] dark:border-white/[0.06] border-slate-200'
    }`}>
      <h3 className="text-sm font-semibold text-slate-200 dark:text-slate-200 text-slate-800 flex items-center gap-2 mb-4">
        {hasAlerts ? <Bell className="w-4 h-4" /> : <CheckCircle className="w-4 h-4 text-emerald-400" />} Alerts & Actions
        {!hasAlerts && (
          <span className="text-xs font-normal text-emerald-400">All clear!</span>
        )}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pending Approvals */}
        <Link href="/approvals" className="block group">
          <div className={`rounded-lg p-4 transition-all ${
            pendingApprovals.length > 0
              ? 'bg-yellow-500/10 hover:bg-yellow-500/20 ring-1 ring-yellow-500/30'
              : 'bg-slate-700/30 hover:bg-slate-700/50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <span className={`text-2xl font-bold ${
                pendingApprovals.length > 0 ? 'text-yellow-400' : 'text-slate-500'
              }`}>
                {pendingApprovals.length}
              </span>
            </div>
            <div className="text-sm font-medium text-slate-200 dark:text-slate-200 text-slate-700">
              Pending Approvals
            </div>
            {pendingApprovals.length > 0 && (
              <div className="mt-2 text-xs text-slate-400 truncate">
                {pendingApprovals[0].title}
              </div>
            )}
            <div className="mt-2 text-xs text-slate-500 group-hover:text-blue-400 transition-colors">
              {pendingApprovals.length > 0 ? 'Review now →' : 'View all →'}
            </div>
          </div>
        </Link>

        {/* Open Issues */}
        <Link href="/issues" className="block group">
          <div className={`rounded-lg p-4 transition-all ${
            openIssues.length > 0
              ? 'bg-orange-500/10 hover:bg-orange-500/20 ring-1 ring-orange-500/30'
              : 'bg-slate-700/30 hover:bg-slate-700/50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <Bug className="w-5 h-5 text-orange-400" />
              <span className={`text-2xl font-bold ${
                openIssues.length > 0 ? 'text-orange-400' : 'text-slate-500'
              }`}>
                {openIssues.length}
              </span>
            </div>
            <div className="text-sm font-medium text-slate-200 dark:text-slate-200 text-slate-700">
              Open Issues
            </div>
            {openIssues.length > 0 && (
              <div className="mt-2 text-xs text-slate-400 truncate">
                {openIssues[0].title}
              </div>
            )}
            <div className="mt-2 text-xs text-slate-500 group-hover:text-blue-400 transition-colors">
              {openIssues.length > 0 ? 'View issues →' : 'All resolved →'}
            </div>
          </div>
        </Link>

        {/* Failed Sessions */}
        <Link href="/sessions?status=FAILED" className="block group">
          <div className={`rounded-lg p-4 transition-all ${
            failedSessions > 0
              ? 'bg-red-500/10 hover:bg-red-500/20 ring-1 ring-red-500/30'
              : 'bg-slate-700/30 hover:bg-slate-700/50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-5 h-5 text-red-400" />
              <span className={`text-2xl font-bold ${
                failedSessions > 0 ? 'text-red-400' : 'text-slate-500'
              }`}>
                {failedSessions}
              </span>
            </div>
            <div className="text-sm font-medium text-slate-200 dark:text-slate-200 text-slate-700">
              Failed Sessions
            </div>
            <div className="mt-2 text-xs text-slate-500 group-hover:text-blue-400 transition-colors flex items-center gap-1">
              {failedSessions > 0 ? 'Investigate →' : <><span>None</span><Sparkles className="w-3 h-3 text-emerald-400" /></>}
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
