'use client'

import { useState } from 'react'
import {
  CheckCircle, Circle, Zap, Target,
  ChevronDown, ChevronUp, Loader2,
} from 'lucide-react'
import { useActiveSprint } from '@/hooks/useSprints'

export function SprintProgress() {
  const [expanded, setExpanded] = useState(true)
  const { data: sprint, isLoading } = useActiveSprint()

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-500/30 p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
      </div>
    )
  }

  if (!sprint) {
    return (
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-white/[0.06] p-6 text-center">
        <Target className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <p className="text-slate-400 text-sm">No active sprint</p>
        <p className="text-slate-500 text-xs mt-1">Create and start a sprint to see progress here</p>
      </div>
    )
  }

  const now = new Date()
  const start = new Date(sprint.startDate)
  const end = new Date(sprint.endDate)
  const totalMs = end.getTime() - start.getTime()
  const elapsedMs = now.getTime() - start.getTime()
  const timeProgress = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100))
  const remainingDays = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))

  const tasks = sprint.tasks || []
  const doneTasks = tasks.filter((t) => t.status === 'done')
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress' || t.status === 'building' || t.status === 'verifying')
  const pendingTasks = tasks.filter((t) => t.status === 'todo' || t.status === 'backlog')

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-500/30 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="font-semibold text-white">{sprint.name}</h3>
            <p className="text-xs text-slate-400">{remainingDays}d remaining</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{sprint.completedCount}/{sprint.taskCount}</div>
            <div className="text-xs text-slate-400">tasks done</div>
          </div>
          {expanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </div>

      {/* Time progress bar */}
      <div className="px-4 pb-2">
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-1000"
            style={{ width: `${timeProgress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>{start.toLocaleDateString()}</span>
          <span>{end.toLocaleDateString()}</span>
        </div>
      </div>

      {expanded && (
        <div className="p-4 pt-2 space-y-4">
          {/* Goal */}
          {sprint.goal && (
            <p className="text-sm text-slate-400 italic border-l-2 border-purple-500/30 pl-3">{sprint.goal}</p>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-2 text-center">
              <div className="text-green-400 font-bold">{doneTasks.length}</div>
              <div className="text-xs text-slate-500">Done</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2 text-center">
              <div className="text-amber-400 font-bold">{inProgressTasks.length}</div>
              <div className="text-xs text-slate-500">In Progress</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2 text-center">
              <div className="text-slate-400 font-bold">{pendingTasks.length}</div>
              <div className="text-xs text-slate-500">Pending</div>
            </div>
          </div>

          {/* Task completion progress */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Task progress</span>
              <span>{sprint.progress}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${sprint.progress}%` }}
              />
            </div>
          </div>

          {/* Task list */}
          {tasks.length > 0 && (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-slate-800/50"
                >
                  {task.status === 'done' ? (
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  ) : task.status === 'in_progress' || task.status === 'building' || task.status === 'verifying' ? (
                    <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  )}
                  <span className={`flex-1 text-sm truncate ${task.status === 'done' ? 'text-slate-300 line-through' : 'text-slate-400'}`}>
                    {task.title}
                  </span>
                  {task.assignee && (
                    <span className="text-xs text-slate-500">{task.assignee}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SprintProgress
