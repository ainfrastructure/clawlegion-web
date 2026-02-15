'use client'

import {
  Play, Loader2, CheckCircle, Clock, Hammer, Rocket,
} from 'lucide-react'

type TaskDetailFooterProps = {
  taskId: string
  taskStatus?: string
  // Start task (move to "todo")
  onStartTask: () => void
  isStarting: boolean
  // Start pipeline (sprint engine)
  onStartPipeline?: () => void
  isStartingPipeline?: boolean
  // Execute
  canExecute: boolean
  onExecute: () => void
  isExecuting: boolean
  // Close
  onClose: () => void
}

export function TaskDetailFooter({
  taskId,
  taskStatus,
  onStartTask,
  isStarting,
  onStartPipeline,
  isStartingPipeline,
  canExecute,
  onExecute,
  isExecuting,
  onClose,
}: TaskDetailFooterProps) {
  const status = taskStatus || 'backlog'

  const isBacklog = status === 'backlog'
  const isTodo = status === 'todo'
  const isStartable = isBacklog || isTodo || status === 'queued'
  const isInProgress = status === 'in_progress' || status === 'assigned' || status === 'building' || status === 'researching' || status === 'planning' || status === 'verifying'
  const isDone = status === 'done' || status === 'completed'

  return (
    <div className="px-4 sm:px-6 py-4 border-t border-blue-500/[0.1] flex-shrink-0 bg-gradient-to-r from-blue-600/[0.06] via-transparent to-transparent">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Start Task — only for backlog tasks */}
          {isBacklog && (
            <button
              onClick={onStartTask}
              disabled={isStarting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium disabled:opacity-50 transition-colors shadow-glow-blue"
            >
              {isStarting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Start Task
            </button>
          )}

          {/* Start Pipeline — for tasks that can be started through sprint engine */}
          {isStartable && onStartPipeline && (
            <button
              onClick={onStartPipeline}
              disabled={isStartingPipeline}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium disabled:opacity-50 transition-all shadow-[0_0_12px_rgba(245,158,11,0.2)]"
            >
              {isStartingPipeline ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Rocket className="w-4 h-4" />
              )}
              ▶️ Start Pipeline
            </button>
          )}

          {/* In-progress status indicator */}
          {isInProgress && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-sm font-medium">
              <Hammer className="w-4 h-4 animate-pulse" />
              In Progress
            </div>
          )}

          {/* Done status indicator */}
          {isDone && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Completed
            </div>
          )}

          {/* Todo status indicator (after starting) */}
          {isTodo && !onStartPipeline && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-sm font-medium">
              <Clock className="w-4 h-4" />
              Queued
            </div>
          )}

          {/* Execute Task — only when approved and no session */}
          {canExecute && (
            <button
              onClick={onExecute}
              disabled={isExecuting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {isExecuting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Execute Task
            </button>
          )}

          <a
            href="/tasks"
            className="px-4 py-2 bg-white/[0.04] border border-white/[0.06] text-blue-300/70 hover:text-white hover:bg-white/[0.08] rounded-lg text-sm transition-colors"
          >
            View Tasks
          </a>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] text-blue-200/80 rounded-lg text-sm transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}
