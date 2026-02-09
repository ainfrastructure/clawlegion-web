'use client'

import { useState } from 'react'
import { X, CheckCircle, Trash2, ChevronRight } from 'lucide-react'
import { WatchdogStatusBadge, type WatchdogStatus } from '@/components/watchdog'
import { TaskCompactMetadata } from './TaskCompactMetadata'
import { getPriorityConfig, getStatusConfig } from './config'
import type { Task } from './types'

type TaskDetailHeaderProps = {
  task: Partial<Task> | undefined
  isLoading: boolean
  isInProgress: boolean
  taskHealth: { watchdogStatus: WatchdogStatus } | undefined
  onDelete: () => void
  isDeleting: boolean
  onClose: () => void
}

export function TaskDetailHeader({
  task,
  isLoading,
  isInProgress,
  taskHealth,
  onDelete,
  isDeleting,
  onClose,
}: TaskDetailHeaderProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const priority = getPriorityConfig(task?.priority || 'P2')
  const status = getStatusConfig(task?.status || 'backlog')
  const StatusIcon = status.icon

  return (
    <div className="px-4 sm:px-6 py-4 border-b border-blue-500/[0.1] flex-shrink-0 bg-gradient-to-r from-blue-600/[0.08] via-blue-500/[0.04] to-transparent">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Parent breadcrumb if this is a subtask */}
          {task?.parent && (
            <div className="flex items-center gap-1.5 mb-1.5 text-xs text-slate-400">
              <span className="font-mono text-purple-400/60 bg-purple-500/10 px-1.5 py-0.5 rounded">
                {task.parent.shortId || task.parent.id.slice(0, 8)}
              </span>
              <span className="truncate max-w-[200px]">{task.parent.title}</span>
              <ChevronRight className="w-3 h-3 text-slate-500 flex-shrink-0" />
              <span className="text-blue-300">subtask</span>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {task?.shortId && (
              <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/20 px-2 py-1 rounded-lg">
                {task.shortId}
              </span>
            )}
            <span className={`text-xs px-2 py-1 rounded-lg ${priority.bg} ${priority.color}`}>
              {priority.label}
            </span>
            <span className={`text-xs flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.06] border border-white/[0.06] ${status.color}`}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
            {task?.approvedAt && (
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Approved
              </span>
            )}
            {isInProgress && taskHealth && (
              <WatchdogStatusBadge
                status={taskHealth.watchdogStatus}
                size="sm"
                pulse={taskHealth.watchdogStatus !== 'healthy'}
              />
            )}
          </div>
          {isLoading ? (
            <div className="h-7 bg-white/[0.06] rounded animate-pulse w-3/4" />
          ) : (
            <h2 className="text-lg sm:text-xl font-bold text-white line-clamp-2">{task?.title}</h2>
          )}

          {/* Compact metadata row */}
          <div className="mt-2">
            <TaskCompactMetadata task={task} />
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 bg-white/[0.04] hover:bg-red-500/20 border border-white/[0.06] hover:border-red-500/30 rounded-lg transition-colors"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4 text-blue-300/40 hover:text-red-400" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  onDelete()
                  setShowDeleteConfirm(false)
                }}
                disabled={isDeleting}
                className="px-3 py-1.5 text-xs font-medium bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2 py-1.5 text-xs text-blue-300/60 hover:text-blue-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
          <button
            onClick={onClose}
            className="p-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-blue-300/60" />
          </button>
        </div>
      </div>
    </div>
  )
}
