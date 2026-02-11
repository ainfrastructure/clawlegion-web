'use client'

import { useState, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { X, Loader2, Sparkles } from 'lucide-react'
import type { Workspace } from '@/types/common'

interface SimpleTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onTaskCreated?: () => void
}

/**
 * Simple task creation modal for Easy Mode.
 * Minimal form: describe what you want, pick workspace, submit.
 * AI auto-expands the prompt into a full task.
 */
export function SimpleTaskModal({ isOpen, onClose, onTaskCreated }: SimpleTaskModalProps) {
  const queryClient = useQueryClient()
  const [prompt, setPrompt] = useState('')
  const [workspaceId, setWorkspaceId] = useState('')
  const [selectedWorkspaceIds, setSelectedWorkspaceIds] = useState<string[]>([])
  const [priority, setPriority] = useState<'P1' | 'P2' | 'P3'>('P2')
  const [error, setError] = useState<string | null>(null)

  // Fetch workspaces
  const { data: workspaces = [] } = useQuery<Workspace[]>({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const res = await api.get('/workspaces')
      return res.data
    },
    enabled: isOpen,
  })

  const resetForm = useCallback(() => {
    setPrompt('')
    setWorkspaceId('')
    setSelectedWorkspaceIds([])
    setPriority('P2')
    setError(null)
  }, [])

  // Create task: expand prompt via AI then create
  const createMutation = useMutation({
    mutationFn: async () => {
      // Try AI expansion first
      let title = prompt.slice(0, 100)
      let description = prompt
      let specs: string | undefined
      let approach: string | undefined
      let successCriteria: string[] = ['Task completed as described']

      try {
        const expandRes = await api.post('/task-tracking/tasks/expand', {
          prompt: prompt.trim(),
          repositoryId: workspaceId || undefined,
        })
        const expanded = expandRes.data.expanded
        if (expanded) {
          title = expanded.title || title
          description = expanded.description || description
          specs = expanded.specs
          approach = expanded.approach
          successCriteria = expanded.successCriteria || successCriteria
        }
      } catch {
        // AI expansion failed, use raw prompt
      }

      const resolvedRepoIds = selectedWorkspaceIds.length > 0 ? selectedWorkspaceIds : (workspaceId ? [workspaceId] : [])
      const response = await api.post('/task-tracking/tasks', {
        title,
        description,
        repositoryId: workspaceId || resolvedRepoIds[0] || undefined,
        repositoryIds: resolvedRepoIds.length > 0 ? resolvedRepoIds : undefined,
        workspaceId: workspaceId || undefined,
        priority,
        specs,
        approach,
        successCriteria,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      resetForm()
      onTaskCreated?.()
      onClose()
    },
    onError: (err: { response?: { data?: { error?: string } }; message?: string }) => {
      setError(err.response?.data?.error || err.message || 'Failed to create task')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!prompt.trim() || prompt.trim().length < 3) {
      setError('Please describe what you want done (at least 3 characters)')
      return
    }

    if (!workspaceId && selectedWorkspaceIds.length === 0) {
      setError('Please select at least one workspace')
      return
    }

    createMutation.mutate()
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={handleClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
                New Task
              </h2>
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Prompt */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                What do you want done?
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your task in plain language..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-slate-600 bg-slate-700 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
              <p className="mt-1.5 text-xs text-slate-500">
                AI will expand this into a full task with workflow steps
              </p>
            </div>

            {/* Workspace + Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Workspaces
                </label>
                <div className="space-y-1 max-h-28 overflow-y-auto border border-slate-600 rounded-lg p-2 bg-slate-700">
                  {workspaces.map((ws) => {
                    const isChecked = selectedWorkspaceIds.includes(ws.id)
                    return (
                      <label key={ws.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-600/50 rounded px-2 py-1 transition-colors">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              const newIds = selectedWorkspaceIds.filter((id) => id !== ws.id)
                              setSelectedWorkspaceIds(newIds)
                              if (workspaceId === ws.id) {
                                setWorkspaceId(newIds[0] || '')
                              }
                            } else {
                              const newIds = [...selectedWorkspaceIds, ws.id]
                              setSelectedWorkspaceIds(newIds)
                              if (!workspaceId) {
                                setWorkspaceId(ws.id)
                              }
                            }
                          }}
                          className="w-3.5 h-3.5 rounded border-slate-500 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-sm text-slate-100">
                          {ws.icon ? `${ws.icon} ` : ''}{ws.name}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Priority
                </label>
                <div className="flex gap-2">
                  {(['P1', 'P2', 'P3'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        priority === p
                          ? p === 'P1' ? 'bg-orange-500 text-white'
                          : p === 'P2' ? 'bg-amber-500 text-white'
                          : 'bg-blue-500 text-white'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      {p === 'P1' ? 'High' : p === 'P2' ? 'Medium' : 'Low'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 border border-slate-600 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              className="px-5 py-2.5 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Task
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
