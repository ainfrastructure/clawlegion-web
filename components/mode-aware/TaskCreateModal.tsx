'use client'

import { useState, useCallback, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { X, Sparkles } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { useDashboardMode } from '@/hooks/useDashboardMode'
import { EasyModeTaskForm } from './EasyModeTaskForm'
import { EnhancedTaskModal } from '@/components/tasks/EnhancedTaskModal'
import type { PriorityLevel } from '@/components/tasks/config'
import type { Repository } from '@/components/tasks/types'

interface TaskCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onTaskCreated?: () => void
  repositories?: Repository[]
}

/**
 * Mode-aware task creation modal.
 * - Easy Mode: Simple 3-field form (title, description, priority)
 * - Power Mode: Full EnhancedTaskModal with all fields
 */
export function TaskCreateModal({
  isOpen,
  onClose,
  onTaskCreated,
  repositories: externalRepos,
}: TaskCreateModalProps) {
  const { isEasyMode } = useDashboardMode()
  const queryClient = useQueryClient()
  const toast = useToast()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  // Close on Escape key
  useEffect(() => {
    if (!isOpen || !isEasyMode) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    // Prevent background scrolling
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, isEasyMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch repositories if not provided externally
  const { data: repoData } = useQuery({
    queryKey: ['task-tracking-repositories'],
    queryFn: () => api.get('/task-tracking/repositories').then((r) => r.data),
    enabled: isOpen && !externalRepos,
  })

  const repositories: Repository[] = externalRepos ?? repoData?.repositories ?? []

  // Reset error when modal opens
  useEffect(() => {
    if (isOpen) setError(null)
  }, [isOpen])

  // Easy mode: create task with minimal payload
  const createMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; priority: PriorityLevel }) => {
      const payload: Record<string, unknown> = {
        title: data.title,
        priority: data.priority,
      }

      // Only send description if non-empty
      if (data.description) {
        payload.description = data.description
      }

      // Use first available repository as default
      if (repositories.length > 0) {
        payload.repositoryId = repositories[0].id
      }

      const response = await api.post('/task-tracking/tasks', payload)
      return response.data
    },
    onSuccess: (data) => {
      // Invalidate task queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ['task-tracking-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })

      // Show success toast
      toast.success('Task created — agents will start working on it')

      // Close modal
      onClose()
      onTaskCreated?.()

      // Navigate to task in work list
      const taskId = data?.task?.id || data?.id
      if (taskId) {
        router.push(`/tasks?taskId=${taskId}`)
      }
    },
    onError: (err: { response?: { data?: { error?: string } }; message?: string }) => {
      setError(err.response?.data?.error || err.message || 'Failed to create task')
    },
  })

  const handleEasySubmit = useCallback(
    (data: { title: string; description: string; priority: PriorityLevel }) => {
      setError(null)
      createMutation.mutate(data)
    },
    [createMutation]
  )

  const handleClose = useCallback(() => {
    setError(null)
    onClose()
  }, [onClose])

  if (!isOpen) return null

  // Power Mode: delegate to the full EnhancedTaskModal
  if (!isEasyMode) {
    return (
      <EnhancedTaskModal
        isOpen={isOpen}
        onClose={onClose}
        onTaskCreated={() => {
          queryClient.invalidateQueries({ queryKey: ['task-tracking-tasks'] })
          queryClient.invalidateQueries({ queryKey: ['tasks'] })
          onClose()
          onTaskCreated?.()
        }}
        repositories={repositories}
      />
    )
  }

  // Easy Mode: simplified modal
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-lg bg-slate-900 border border-white/[0.06] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="easy-task-modal-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/[0.06] flex-shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2
                id="easy-task-modal-title"
                className="text-xl font-semibold text-white"
              >
                New Task
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body — Easy Mode Form */}
          <EasyModeTaskForm
            onSubmit={handleEasySubmit}
            isPending={createMutation.isPending}
            error={error}
          />
        </div>
      </div>
    </div>
  )
}
