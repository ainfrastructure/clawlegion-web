'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { X, Loader2, Zap } from 'lucide-react'
import { priorityOptions } from './config'
import type { CreateTaskModalProps } from './types'

export function NewTaskModal({ isOpen, onClose, onTaskCreated, repositories }: CreateTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [repositoryId, setRepositoryId] = useState('')
  const [priority, setPriority] = useState('P2')
  const [createLinearIssue, setCreateLinearIssue] = useState(true)
  const [startImmediately, setStartImmediately] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasLinearApiKey = typeof window !== 'undefined' && !!localStorage.getItem('linearApiKey')

  const createTaskMutation = useMutation({
    mutationFn: async () => {
      const apiKey = localStorage.getItem('linearApiKey')
      const headers: Record<string, string> = {}
      if (apiKey) {
        headers['x-linear-api-key'] = apiKey
      }

      const response = await api.post('/task-tracking/tasks', {
        title,
        description,
        repositoryId,
        priority,
        createLinearIssue: createLinearIssue && !!apiKey,
      }, { headers })

      return response.data
    },
    onSuccess: async (data) => {
      // If "Start Immediately" is on, trigger the sprint engine pipeline
      if (startImmediately && data?.task?.id) {
        try {
          await api.post(`/task-tracking/tasks/${data.task.id}/start-pipeline`)
        } catch (err) {
          console.warn('Failed to start pipeline immediately:', err)
        }
      }
      // Reset form
      setTitle('')
      setDescription('')
      setRepositoryId('')
      setPriority('P2')
      setCreateLinearIssue(true)
      setStartImmediately(false)
      setError(null)
      onTaskCreated()
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || err.message || 'Failed to create task')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    if (!description.trim()) {
      setError('Description is required')
      return
    }

    if (!repositoryId) {
      setError('Please select a repository')
      return
    }

    createTaskMutation.mutate()
  }

  if (!isOpen) return null

  const selectedRepo = repositories.find((r) => r.id === repositoryId)
  const repoHasLinearProject = selectedRepo?.linearProject != null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/[0.06]">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
              Create Task from Idea
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                What do you want to build?
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add user profile editing with avatar upload"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what needs to be built, any requirements or constraints..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Repository */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Repository
              </label>
              <select
                value={repositoryId}
                onChange={(e) => setRepositoryId(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a repository</option>
                {repositories.map((repo) => (
                  <option key={repo.id} value={repo.id}>
                    {repo.name} {repo.linearProject ? '(Linear connected)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {priorityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {/* Start Immediately Toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={startImmediately}
                    onChange={(e) => setStartImmediately(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-300 dark:bg-slate-700 rounded-full peer-checked:bg-amber-600 transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <Zap className={`w-4 h-4 ${startImmediately ? 'text-amber-500' : 'text-gray-400 dark:text-slate-500'} transition-colors`} />
                  <span className="text-sm text-gray-700 dark:text-slate-300">
                    ⚡ Start Immediately
                  </span>
                </div>
              </label>
              {startImmediately && (
                <p className="text-xs text-amber-600 dark:text-amber-400/70 ml-[52px] -mt-1">
                  Pipeline will start automatically after creation (research → plan → build → verify)
                </p>
              )}

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createLinearIssue}
                  onChange={(e) => setCreateLinearIssue(e.target.checked)}
                  disabled={!hasLinearApiKey || !repoHasLinearProject}
                  className="w-5 h-5 rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="text-sm text-gray-700 dark:text-slate-300">
                  Create Linear issue
                  {!hasLinearApiKey && (
                    <span className="text-gray-400 dark:text-slate-500 ml-1">(API key not configured)</span>
                  )}
                  {hasLinearApiKey && !repoHasLinearProject && repositoryId && (
                    <span className="text-gray-400 dark:text-slate-500 ml-1">(No Linear project mapped)</span>
                  )}
                </span>
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createTaskMutation.isPending}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${
                  startImmediately
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {createTaskMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {startImmediately ? 'Creating & Starting...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {startImmediately && <Zap className="w-4 h-4" />}
                    {startImmediately ? 'Create & Start' : 'Create Task'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
