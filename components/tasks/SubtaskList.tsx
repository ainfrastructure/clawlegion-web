'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import {
  Plus, CheckCircle, Circle, Clock, Loader2, AlertCircle,
  ArrowUp, ArrowRight, ArrowDown, ChevronRight,
} from 'lucide-react'

interface SubtaskSummary {
  id: string
  title: string
  shortId?: string | null
  status: string
  priority: string
  assignee?: string | null
}

interface SubtaskListProps {
  parentId: string
  subtasks: SubtaskSummary[]
  onSubtaskClick?: (subtaskId: string) => void
}

const statusIcons: Record<string, React.ReactNode> = {
  backlog: <Circle className="w-3.5 h-3.5 text-slate-500" />,
  todo: <Circle className="w-3.5 h-3.5 text-blue-400" />,
  in_progress: <Clock className="w-3.5 h-3.5 text-amber-400" />,
  building: <Clock className="w-3.5 h-3.5 text-amber-400" />,
  verifying: <AlertCircle className="w-3.5 h-3.5 text-purple-400" />,
  done: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />,
  completed: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />,
}

const priorityIcons: Record<string, { icon: React.ReactNode; color: string }> = {
  P0: { icon: <ArrowUp className="w-3 h-3" />, color: 'text-red-400' },
  P1: { icon: <ArrowUp className="w-3 h-3" />, color: 'text-orange-400' },
  P2: { icon: <ArrowRight className="w-3 h-3" />, color: 'text-amber-400' },
  P3: { icon: <ArrowDown className="w-3 h-3" />, color: 'text-blue-400' },
}

export function SubtaskList({ parentId, subtasks, onSubtaskClick }: SubtaskListProps) {
  const queryClient = useQueryClient()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState('P2')

  const doneCount = subtasks.filter(s => s.status === 'done' || s.status === 'completed').length
  const total = subtasks.length
  const progressPct = total > 0 ? Math.round((doneCount / total) * 100) : 0

  const createSubtaskMutation = useMutation({
    mutationFn: async ({ title, priority }: { title: string; priority: string }) => {
      const response = await api.post(`/task-tracking/tasks/${parentId}/subtasks`, {
        title,
        priority,
      })
      return response.data
    },
    onSuccess: () => {
      setNewTitle('')
      setNewPriority('P2')
      setShowAddForm(false)
      queryClient.invalidateQueries({ queryKey: ['task-detail', parentId] })
      queryClient.invalidateQueries({ queryKey: ['task-tracking-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['trackedTasks'] })
    },
  })

  const statusToggleMutation = useMutation({
    mutationFn: async ({ subtaskId, newStatus }: { subtaskId: string; newStatus: string }) => {
      const response = await api.patch(`/task-tracking/tasks/${subtaskId}/status`, {
        status: newStatus,
        actor: 'dashboard',
        actorType: 'human',
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-detail', parentId] })
      queryClient.invalidateQueries({ queryKey: ['task-tracking-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['trackedTasks'] })
    },
  })

  return (
    <div className="bg-blue-950/30 border border-blue-500/[0.08] rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-blue-300/60 uppercase tracking-wider flex items-center gap-2">
          <ChevronRight className="w-3.5 h-3.5" />
          Subtasks ({doneCount}/{total} done)
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="mb-3">
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Subtask rows */}
      <div className="space-y-1">
        {subtasks.map((subtask) => {
          const isDone = subtask.status === 'done' || subtask.status === 'completed'
          const prio = priorityIcons[subtask.priority] || priorityIcons.P2
          return (
            <div
              key={subtask.id}
              className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-white/[0.04] transition-colors group"
            >
              {/* Status toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  statusToggleMutation.mutate({
                    subtaskId: subtask.id,
                    newStatus: isDone ? 'todo' : 'done',
                  })
                }}
                className="flex-shrink-0"
                title={isDone ? 'Mark as todo' : 'Mark as done'}
              >
                {statusIcons[subtask.status] || <Circle className="w-3.5 h-3.5 text-slate-500" />}
              </button>

              {/* Title */}
              <span
                className={`flex-1 text-sm cursor-pointer transition-colors ${
                  isDone
                    ? 'text-slate-500 line-through'
                    : 'text-slate-300 hover:text-white'
                }`}
                onClick={() => onSubtaskClick?.(subtask.id)}
              >
                {subtask.title}
              </span>

              {/* Priority indicator */}
              <span className={`flex-shrink-0 ${prio.color}`} title={subtask.priority}>
                {prio.icon}
              </span>

              {/* Assignee */}
              {subtask.assignee && (
                <span className="text-[10px] text-slate-500 flex-shrink-0">
                  @{subtask.assignee}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Empty state */}
      {total === 0 && !showAddForm && (
        <p className="text-sm text-slate-500 text-center py-2">No subtasks yet</p>
      )}

      {/* Inline add form */}
      {showAddForm && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Subtask title..."
            className="flex-1 bg-slate-900/50 border border-white/[0.06] rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newTitle.trim()) {
                createSubtaskMutation.mutate({ title: newTitle.trim(), priority: newPriority })
              }
              if (e.key === 'Escape') setShowAddForm(false)
            }}
            autoFocus
          />
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
            className="bg-slate-900/50 border border-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
          >
            <option value="P0">P0</option>
            <option value="P1">P1</option>
            <option value="P2">P2</option>
            <option value="P3">P3</option>
          </select>
          <button
            onClick={() => {
              if (newTitle.trim()) {
                createSubtaskMutation.mutate({ title: newTitle.trim(), priority: newPriority })
              }
            }}
            disabled={!newTitle.trim() || createSubtaskMutation.isPending}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-lg text-xs font-medium transition-colors"
          >
            {createSubtaskMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              'Add'
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default SubtaskList
