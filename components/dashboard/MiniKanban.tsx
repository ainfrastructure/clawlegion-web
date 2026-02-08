'use client'

import Link from 'next/link'
import { ClipboardList } from 'lucide-react'

interface KanbanColumn {
  backlog: number
  todo: number
  inProgress: number
  completed: number
}

interface MiniKanbanProps {
  columns: KanbanColumn
  totalPoints: number
  completedPoints: number
  isLoading?: boolean
}

export function MiniKanban({ columns, totalPoints, completedPoints, isLoading }: MiniKanbanProps) {
  const total = columns.backlog + columns.todo + columns.inProgress + columns.completed

  if (isLoading) {
    return (
      <div className="bg-slate-800 dark:bg-slate-800 bg-white rounded-xl border border-white/[0.06] dark:border-white/[0.06] border-slate-200 p-4 animate-pulse">
        <div className="h-6 w-32 bg-slate-700 rounded mb-4" />
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-slate-700 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <Link href="/tasks" className="block group">
      <div className="bg-slate-800 dark:bg-slate-800 bg-white rounded-xl border border-white/[0.06] dark:border-white/[0.06] border-slate-200 p-4 hover:border-slate-600 dark:hover:border-slate-600 hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-200 dark:text-slate-200 text-slate-800 flex items-center gap-2">
            <ClipboardList className="w-4 h-4" /> Task Board
            <span className="text-xs font-normal text-slate-400 group-hover:text-blue-400 transition-colors">
              View all tasks →
            </span>
          </h3>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">{total} tasks</span>
            <span className="text-emerald-400 font-medium">
              {completedPoints}/{totalPoints} pts
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <ColumnCard
            label="Backlog"
            count={columns.backlog}
            color="bg-slate-600"
            bgColor="bg-slate-700/50"
          />
          <ColumnCard
            label="Todo"
            count={columns.todo}
            color="bg-blue-500"
            bgColor="bg-blue-500/10"
          />
          <ColumnCard
            label="In Progress"
            count={columns.inProgress}
            color="bg-yellow-500"
            bgColor="bg-yellow-500/10"
            pulse={columns.inProgress > 0}
          />
          <ColumnCard
            label="Done"
            count={columns.completed}
            color="bg-emerald-500"
            bgColor="bg-emerald-500/10"
          />
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-slate-500 transition-all duration-500"
              style={{ width: `${total > 0 ? (columns.backlog / total) * 100 : 0}%` }}
            />
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${total > 0 ? (columns.todo / total) * 100 : 0}%` }}
            />
            <div
              className="h-full bg-yellow-500 transition-all duration-500"
              style={{ width: `${total > 0 ? (columns.inProgress / total) * 100 : 0}%` }}
            />
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${total > 0 ? (columns.completed / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}

function ColumnCard({
  label,
  count,
  color,
  bgColor,
  pulse,
}: {
  label: string
  count: number
  color: string
  bgColor: string
  pulse?: boolean
}) {
  return (
    <div className={`${bgColor} rounded-lg p-3 text-center ${pulse ? 'ring-1 ring-yellow-500/50' : ''}`}>
      <div className={`text-2xl font-bold text-slate-100 dark:text-slate-100 text-slate-800 ${pulse ? 'animate-pulse' : ''}`}>
        {count}
      </div>
      <div className="flex items-center justify-center gap-1.5 mt-1">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
    </div>
  )
}
