'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { X, Plus, Trash2, Loader2 } from 'lucide-react'

interface SubtaskInput {
  title: string
  priority: string
}

interface DecomposeModalProps {
  parentId: string
  parentTitle: string
  parentPriority?: string
  isOpen: boolean
  onClose: () => void
}

export function DecomposeModal({
  parentId,
  parentTitle,
  parentPriority = 'P2',
  isOpen,
  onClose,
}: DecomposeModalProps) {
  const queryClient = useQueryClient()
  const [rows, setRows] = useState<SubtaskInput[]>([
    { title: '', priority: parentPriority },
    { title: '', priority: parentPriority },
    { title: '', priority: parentPriority },
  ])

  const createSubtasksMutation = useMutation({
    mutationFn: async (subtasks: SubtaskInput[]) => {
      const results = []
      for (const subtask of subtasks) {
        const response = await api.post(`/task-tracking/tasks/${parentId}/subtasks`, {
          title: subtask.title,
          priority: subtask.priority,
        })
        results.push(response.data)
      }
      return results
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-detail', parentId] })
      queryClient.invalidateQueries({ queryKey: ['task-tracking-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['trackedTasks'] })
      queryClient.invalidateQueries({ queryKey: ['task-graph'] })
      onClose()
      setRows([
        { title: '', priority: parentPriority },
        { title: '', priority: parentPriority },
        { title: '', priority: parentPriority },
      ])
    },
  })

  const updateRow = (index: number, field: keyof SubtaskInput, value: string) => {
    setRows(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row))
  }

  const addRow = () => {
    setRows(prev => [...prev, { title: '', priority: parentPriority }])
  }

  const removeRow = (index: number) => {
    if (rows.length > 1) {
      setRows(prev => prev.filter((_, i) => i !== index))
    }
  }

  const validRows = rows.filter(r => r.title.trim())

  const handleSubmit = () => {
    if (validRows.length > 0) {
      createSubtasksMutation.mutate(validRows)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-[#0a1628]/95 backdrop-blur-xl border border-blue-500/[0.12] rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-blue-500/[0.1] bg-gradient-to-r from-indigo-600/[0.08] via-blue-500/[0.04] to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Decompose Task</h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  Break &quot;{parentTitle}&quot; into subtasks
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-blue-300/60" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto space-y-2">
            {rows.map((row, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-xs text-slate-500 w-5 text-right flex-shrink-0">
                  {index + 1}.
                </span>
                <input
                  type="text"
                  value={row.title}
                  onChange={(e) => updateRow(index, 'title', e.target.value)}
                  placeholder="Subtask title..."
                  className="flex-1 bg-slate-900/50 border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (index === rows.length - 1) {
                        addRow()
                      }
                      // Focus next input
                      setTimeout(() => {
                        const inputs = document.querySelectorAll<HTMLInputElement>('[data-decompose-input]')
                        inputs[index + 1]?.focus()
                      }, 50)
                    }
                  }}
                  data-decompose-input
                  autoFocus={index === 0}
                />
                <select
                  value={row.priority}
                  onChange={(e) => updateRow(index, 'priority', e.target.value)}
                  className="bg-slate-900/50 border border-white/[0.06] rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 w-16"
                >
                  <option value="P0">P0</option>
                  <option value="P1">P1</option>
                  <option value="P2">P2</option>
                  <option value="P3">P3</option>
                </select>
                <button
                  onClick={() => removeRow(index)}
                  className="p-1.5 text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
                  disabled={rows.length <= 1}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <button
              onClick={addRow}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors mt-2 px-6"
            >
              <Plus className="w-3.5 h-3.5" />
              Add another row
            </button>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-blue-500/[0.1] flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {validRows.length} subtask{validRows.length !== 1 ? 's' : ''} to create
            </span>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] text-blue-200/80 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={validRows.length === 0 || createSubtasksMutation.isPending}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                {createSubtasksMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                Create {validRows.length} Subtask{validRows.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>

          {createSubtasksMutation.isError && (
            <div className="px-6 pb-4 text-sm text-red-400">
              Failed to create subtasks. Please try again.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DecomposeModal
