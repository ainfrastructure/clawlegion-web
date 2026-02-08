'use client'

import Link from 'next/link'
import { AlertTriangle, Bug } from 'lucide-react'
import { ReactNode } from 'react'

interface StatsBarProps {
  sessions: number
  activeSessions: number
  tasks: {
    completed: number
    total: number
  }
  agents: {
    active: number
    total: number
    busy: number
    rateLimited: number
  }
  pendingApprovals: number
  openIssues: number
}

export function StatsBar({
  sessions,
  activeSessions,
  tasks,
  agents,
  pendingApprovals,
  openIssues,
}: StatsBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 md:gap-6 px-4 py-3 bg-slate-800/50 dark:bg-slate-800/50 bg-white/50 rounded-lg border border-white/[0.06] dark:border-white/[0.06] border-slate-200">
      <StatItem
        label="Sessions"
        value={sessions}
        active={activeSessions}
        activeLabel="active"
        color="text-blue-400"
      />
      <Divider />
      <StatItem
        label="Tasks"
        value={`${tasks.completed}/${tasks.total}`}
        progress={(tasks.total > 0 ? (tasks.completed / tasks.total) * 100 : 0).toFixed(0) + '%'}
        color="text-emerald-400"
      />
      <Divider />
      <Link href="/agents" className="hover:opacity-80 transition-opacity">
        <StatItem
          label="Agents"
          value={agents.active}
          sublabel={agents.rateLimited > 0 ? `${agents.busy} busy · ${agents.rateLimited} limited` : `${agents.busy} busy`}
          color={agents.rateLimited > 0 ? 'text-red-400' : 'text-teal-400'}
          alert={agents.rateLimited > 0}
          alertIcon={<AlertTriangle className="w-3 h-3 inline" />}
        />
      </Link>
      <Divider />
      <Link href="/approvals" className="hover:opacity-80 transition-opacity">
        <StatItem
          label="Approvals"
          value={pendingApprovals}
          color={pendingApprovals > 0 ? 'text-yellow-400' : 'text-slate-400'}
          alert={pendingApprovals > 0}
          alertIcon={<AlertTriangle className="w-3 h-3 inline" />}
        />
      </Link>
      <Divider />
      <Link href="/issues" className="hover:opacity-80 transition-opacity">
        <StatItem
          label="Issues"
          value={openIssues}
          color={openIssues > 0 ? 'text-orange-400' : 'text-slate-400'}
          alert={openIssues > 0}
          alertIcon={<Bug className="w-3 h-3 inline" />}
        />
      </Link>
    </div>
  )
}

function StatItem({
  label,
  value,
  active,
  activeLabel,
  progress,
  sublabel,
  color,
  alert,
  alertIcon,
}: {
  label: string
  value: string | number
  active?: number
  activeLabel?: string
  progress?: string
  sublabel?: string
  color: string
  alert?: boolean
  alertIcon?: ReactNode
}) {
  return (
    <div className={`flex items-center gap-2 ${alert ? 'animate-pulse' : ''}`}>
      <span className="text-xs font-medium text-slate-400 dark:text-slate-400 text-slate-500 uppercase tracking-wide">
        {label}:
      </span>
      <span className={`text-lg font-bold ${color} flex items-center gap-1`}>
        {alert && alertIcon && <span className="mr-0.5">{alertIcon}</span>}
        {value}
      </span>
      {active !== undefined && (
        <span className="text-xs text-slate-500">
          ({active} {activeLabel})
        </span>
      )}
      {progress && (
        <span className="text-xs text-slate-500">({progress})</span>
      )}
      {sublabel && (
        <span className="text-xs text-slate-500">{sublabel}</span>
      )}
    </div>
  )
}

function Divider() {
  return <div className="w-px h-6 bg-slate-700 dark:bg-slate-700 bg-slate-300" />
}
