'use client'

import { X, Loader2, Archive, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useCompleteSprint } from '@/hooks/useSprints'
import type { Sprint } from '@/types'

interface SprintCompletionModalProps {
  sprint: Sprint
  isOpen: boolean
  onClose: () => void
}

export function SprintCompletionModal({ sprint, isOpen, onClose }: SprintCompletionModalProps) {
  const completeSprint = useCompleteSprint()

  if (!isOpen) return null

  const doneTasks = sprint.tasks?.filter((t) => t.status === 'done').length ?? sprint.completedCount
  const incompleteTasks = (sprint.tasks?.length ?? sprint.taskCount) - doneTasks

  const handleComplete = async () => {
    try {
      await completeSprint.mutateAsync(sprint.id)
      onClose()
    } catch {
      // error available via completeSprint.error
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 glass-2 rounded-2xl border border-white/[0.08] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-lg font-semibold text-white">Complete Sprint</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/[0.08] rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <p className="text-slate-300 text-sm">
            Completing <strong className="text-white">{sprint.name}</strong> will:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
              <Archive className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-300">Archive {doneTasks} done task{doneTasks !== 1 ? 's' : ''}</p>
                <p className="text-xs text-green-400/70 mt-0.5">Kept in database but hidden from the board</p>
              </div>
            </div>

            {incompleteTasks > 0 && (
              <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <ArrowLeft className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-300">Return {incompleteTasks} incomplete task{incompleteTasks !== 1 ? 's' : ''} to backlog</p>
                  <p className="text-xs text-amber-400/70 mt-0.5">Unassigned from sprint, available for future sprints</p>
                </div>
              </div>
            )}

            {incompleteTasks === 0 && (
              <div className="flex items-start gap-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-purple-300">All tasks completed!</p>
                  <p className="text-xs text-purple-400/70 mt-0.5">Great sprint — everything got done</p>
                </div>
              </div>
            )}
          </div>

          {completeSprint.isError && (
            <p className="text-sm text-red-400">
              {(completeSprint.error as Error)?.message || 'Failed to complete sprint'}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleComplete}
              disabled={completeSprint.isPending}
              className="px-5 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg flex items-center gap-2 transition-colors"
            >
              {completeSprint.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Complete Sprint
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
