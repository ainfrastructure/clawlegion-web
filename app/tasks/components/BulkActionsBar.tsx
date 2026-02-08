'use client'

import {
  CheckCircle2,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Trash2,
  CheckSquare,
  X,
  Flag,
} from 'lucide-react'

interface BulkActionsBarProps {
  selectedCount: number
  onComplete: () => void
  onDelete: () => void
  onPriorityChange: (priority: string) => void
  onClear: () => void
  isCompletePending?: boolean
  isDeletePending?: boolean
}

/**
 * Floating action bar for bulk task operations.
 * Appears when one or more tasks are selected.
 */
export function BulkActionsBar({
  selectedCount,
  onComplete,
  onDelete,
  onPriorityChange,
  onClear,
  isCompletePending = false,
  isDeletePending = false,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-white/[0.06] rounded-xl shadow-2xl px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3 sm:gap-4 max-w-[95vw]">
      <div className="flex items-center gap-2 text-white font-medium text-sm">
        <CheckSquare size={18} className="text-amber-400" />
        <span>{selectedCount} selected</span>
      </div>
      <div className="hidden sm:block h-6 w-px bg-slate-700" />
      <div className="flex items-center gap-2 flex-wrap">
        <button 
          onClick={onComplete}
          className="px-2 sm:px-3 py-1.5 bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded-lg flex items-center gap-1.5 text-xs sm:text-sm transition-colors"
          disabled={isCompletePending}
        >
          <CheckCircle2 size={14} /> <span className="hidden sm:inline">Mark</span> Complete
        </button>
        <div className="relative group">
          <button className="px-2 sm:px-3 py-1.5 bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 rounded-lg flex items-center gap-1.5 text-xs sm:text-sm transition-colors">
            <Flag size={14} /> Priority
          </button>
          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block">
            <div className="bg-slate-800 border border-white/[0.06] rounded-lg shadow-xl overflow-hidden">
              <button onClick={() => onPriorityChange('high')} className="w-full px-4 py-2 text-left hover:bg-slate-700 text-red-400 text-sm flex items-center gap-2">
                <ArrowUp size={14} /> High
              </button>
              <button onClick={() => onPriorityChange('medium')} className="w-full px-4 py-2 text-left hover:bg-slate-700 text-amber-400 text-sm flex items-center gap-2">
                <ArrowRight size={14} /> Medium
              </button>
              <button onClick={() => onPriorityChange('low')} className="w-full px-4 py-2 text-left hover:bg-slate-700 text-blue-400 text-sm flex items-center gap-2">
                <ArrowDown size={14} /> Low
              </button>
            </div>
          </div>
        </div>
        <button 
          onClick={onDelete}
          className="px-2 sm:px-3 py-1.5 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg flex items-center gap-1.5 text-xs sm:text-sm transition-colors"
          disabled={isDeletePending}
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
      <button onClick={onClear} className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors ml-auto">
        <X size={18} className="text-slate-400" />
      </button>
    </div>
  )
}
