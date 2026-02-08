'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import {
  CheckSquare,
  Square,
  Trash2,
  UserPlus,
  ArrowUp,
  CheckCircle2,
  X,
  MoreHorizontal
} from 'lucide-react'

interface Task {
  id: string
  title: string
  status: string
  priority: string
}

interface BulkActionsProps {
  tasks: Task[]
  selectedIds: Set<string>
  onSelectAll: () => void
  onClearSelection: () => void
  onToggleSelect: (id: string) => void
}

export function BulkActions({ tasks, selectedIds, onSelectAll, onClearSelection, onToggleSelect }: BulkActionsProps) {
  const queryClient = useQueryClient()
  const [showActions, setShowActions] = useState(false)

  const bulkComplete = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id =>
        api.patch(`/task-tracking/tasks/${id}`, { status: 'done' })
      ))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-queue'] })
      onClearSelection()
    },
  })

  const bulkDelete = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => api.delete(`/task-tracking/tasks/${id}`)))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-queue'] })
      onClearSelection()
    },
  })

  const bulkPriority = useMutation({
    mutationFn: async ({ ids, priority }: { ids: string[]; priority: string }) => {
      await Promise.all(ids.map(id => api.patch(`/task-tracking/tasks/${id}`, { priority })))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-queue'] })
    },
  })

  const selectedCount = selectedIds.size
  const allSelected = selectedCount === tasks.length && tasks.length > 0

  if (selectedCount === 0) {
    return (
      <button
        onClick={onSelectAll}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
      >
        <Square size={16} />
        <span>Select</span>
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg border border-white/[0.06]">
      {/* Select All / Clear */}
      <button
        onClick={allSelected ? onClearSelection : onSelectAll}
        className="flex items-center gap-2 px-2 py-1 text-sm text-slate-300 hover:text-white"
      >
        {allSelected ? <CheckSquare size={16} className="text-blue-400" /> : <Square size={16} />}
      </button>

      <div className="text-sm text-slate-300">
        <span className="font-medium text-white">{selectedCount}</span> selected
      </div>

      <div className="w-px h-6 bg-white/[0.06] mx-2" />

      {/* Bulk Actions */}
      <button
        onClick={() => bulkComplete.mutate(Array.from(selectedIds))}
        disabled={bulkComplete.isPending}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded-lg disabled:opacity-50"
      >
        <CheckCircle2 size={14} />
        <span>Complete</span>
      </button>

      <button
        onClick={() => bulkPriority.mutate({ ids: Array.from(selectedIds), priority: 'high' })}
        disabled={bulkPriority.isPending}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 rounded-lg disabled:opacity-50"
      >
        <ArrowUp size={14} />
        <span>High Priority</span>
      </button>

      <button
        onClick={() => {
          if (confirm(`Delete ${selectedCount} tasks?`)) {
            bulkDelete.mutate(Array.from(selectedIds))
          }
        }}
        disabled={bulkDelete.isPending}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg disabled:opacity-50"
      >
        <Trash2 size={14} />
        <span>Delete</span>
      </button>

      <div className="w-px h-6 bg-white/[0.06] mx-2" />

      {/* Clear Selection */}
      <button
        onClick={onClearSelection}
        className="p-1.5 text-slate-400 hover:text-white rounded"
      >
        <X size={16} />
      </button>
    </div>
  )
}

// Hook for managing bulk selection
export function useBulkSelection() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectAll = (ids: string[]) => {
    setSelectedIds(new Set(ids))
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
  }

  // Shift+click range selection
  const selectRange = (ids: string[], clickedId: string, lastSelectedId: string | null) => {
    if (!lastSelectedId) {
      toggleSelect(clickedId)
      return
    }
    
    const startIdx = ids.indexOf(lastSelectedId)
    const endIdx = ids.indexOf(clickedId)
    
    if (startIdx === -1 || endIdx === -1) {
      toggleSelect(clickedId)
      return
    }
    
    const [from, to] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx]
    const rangeIds = ids.slice(from, to + 1)
    
    setSelectedIds(prev => {
      const next = new Set(prev)
      rangeIds.forEach(id => next.add(id))
      return next
    })
  }

  return {
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    selectRange,
    isSelected: (id: string) => selectedIds.has(id),
  }
}

export default BulkActions
