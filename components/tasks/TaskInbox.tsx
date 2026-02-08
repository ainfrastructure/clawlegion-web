'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import {
  ExternalLink,
  MoreVertical,
  CheckCircle,
  Circle,
  Clock,
  ChevronDown,
  ChevronUp,
  Trash2
} from 'lucide-react'

interface Task {
  id: string
  shortId: string | null
  title: string
  description: string
  repositoryId: string
  priority: string
  status: string
  linearIssueId: string | null
  linearUrl: string | null
  createdBy: string | null
  createdAt: string
  updatedAt: string
  specs: string | null
  approach: string | null
  successCriteria: string | null
  attachments: Array<{ type: string; name: string; url: string }> | null
  approvedAt: string | null
  approvedBy: string | null
  sessionId: string | null
  repository?: {
    id: string
    name: string
    fullName: string
  }
}

interface Repository {
  id: string
  name: string
  fullName: string
  linearProject: {
    linearId: string
    name: string
  } | null
}

interface TaskInboxProps {
  tasks: Task[]
  repositories: Repository[]
  onRefresh: () => void
}

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  P0: { label: 'P0 - Critical', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
  P1: { label: 'P1 - High', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  P2: { label: 'P2 - Medium', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  P3: { label: 'P3 - Low', color: 'text-gray-600 dark:text-slate-400', bg: 'bg-gray-100 dark:bg-slate-700' },
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  backlog: { label: 'Backlog', icon: Circle, color: 'text-purple-500' },
  todo: { label: 'Todo', icon: Circle, color: 'text-blue-500' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'text-yellow-500' },
  done: { label: 'Done', icon: CheckCircle, color: 'text-green-500' },
}

export function TaskInbox({ tasks, repositories, onRefresh }: TaskInboxProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Update task status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      const apiKey = localStorage.getItem('linearApiKey')
      const headers: Record<string, string> = {}
      if (apiKey) {
        headers['x-linear-api-key'] = apiKey
      }
      const response = await api.patch(`/task-tracking/tasks/${taskId}/status`, { status }, { headers })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await api.delete(`/task-tracking/tasks/${taskId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  // Approve task mutation
  const approveTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await api.post(`/task-tracking/tasks/${taskId}/approve`, { approvedBy: 'dashboard' })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  // Execute task mutation
  const executeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await api.post(`/task-tracking/tasks/${taskId}/execute`)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      alert(`Session created: ${data.session.name}`)
    },
  })

  const toggleExpanded = (taskId: string) => {
    setExpandedTasks((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  const handleStatusChange = (taskId: string, status: string) => {
    updateStatusMutation.mutate({ taskId, status })
    setOpenMenu(null)
  }

  const handleDelete = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate(taskId)
    }
    setOpenMenu(null)
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">No tasks found</h3>
        <p className="text-gray-500 dark:text-slate-400">
          Create a new task to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const isExpanded = expandedTasks.has(task.id)
        const priority = priorityConfig[task.priority] || priorityConfig.P2
        const status = statusConfig[task.status] || statusConfig.todo
        const StatusIcon = status.icon

        return (
          <div
            key={task.id}
            className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden"
          >
            {/* Task Header */}
            <div className="p-4">
              <div className="flex items-start gap-4">
                {/* Status Icon */}
                <button
                  onClick={() => handleStatusChange(
                    task.id,
                    task.status === 'done' ? 'todo' : task.status === 'in_progress' ? 'done' : 'in_progress'
                  )}
                  className={`mt-1 ${status.color} hover:opacity-80 transition-opacity`}
                  title={`Status: ${status.label}`}
                >
                  <StatusIcon className="w-5 h-5" />
                </button>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {task.shortId && (
                          <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded">
                            {task.shortId}
                          </span>
                        )}
                        {task.linearIssueId && (
                          <span className="text-xs font-mono font-semibold text-gray-600 dark:text-slate-400">
                            {task.linearIssueId}
                          </span>
                        )}
                        <h3 className="text-base font-medium text-gray-900 dark:text-slate-100 truncate">
                          {task.title}
                        </h3>
                        {task.approvedAt && (
                          <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded">
                            ✓ Approved
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm flex-wrap">
                        {task.repository && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs">
                            {task.repository.name}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-xs ${priority.bg} ${priority.color}`}>
                          {task.priority}
                        </span>
                        <span className="text-gray-500 dark:text-slate-400">
                          {status.label}
                        </span>
                        {task.linearUrl && (
                          <a
                            href={task.linearUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Linear <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleExpanded(task.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                      
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === task.id ? null : task.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {openMenu === task.id && (
                          <div className="absolute right-0 top-8 z-10 bg-white dark:bg-slate-700 rounded-lg shadow-lg border border-gray-200 dark:border-slate-600 py-1 min-w-[160px]">
                            <button
                              onClick={() => handleStatusChange(task.id, 'backlog')}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-600"
                            >
                              Move to Backlog
                            </button>
                            <button
                              onClick={() => handleStatusChange(task.id, 'todo')}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-600"
                            >
                              Move to Todo
                            </button>
                            <button
                              onClick={() => handleStatusChange(task.id, 'in_progress')}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-600"
                            >
                              Mark In Progress
                            </button>
                            <button
                              onClick={() => handleStatusChange(task.id, 'done')}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-600"
                            >
                              Mark as Done
                            </button>
                            <hr className="my-1 border-gray-200 dark:border-slate-600" />
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="px-4 pb-4 pl-14 space-y-4">
                {/* Description */}
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Description</h4>
                  <p className="text-sm text-gray-600 dark:text-slate-400 whitespace-pre-wrap">
                    {task.description || 'No description provided.'}
                  </p>
                </div>

                {/* Specs */}
                {task.specs && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">📋 Specs / Requirements</h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400 whitespace-pre-wrap">{task.specs}</p>
                  </div>
                )}

                {/* Approach */}
                {task.approach && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">🛠️ Approach</h4>
                    <p className="text-sm text-green-600 dark:text-green-400 whitespace-pre-wrap">{task.approach}</p>
                  </div>
                )}

                {/* Success Criteria */}
                {task.successCriteria && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                    <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">✅ Success Criteria</h4>
                    <p className="text-sm text-purple-600 dark:text-purple-400 whitespace-pre-wrap">{task.successCriteria}</p>
                  </div>
                )}

                {/* Attachments */}
                {task.attachments && task.attachments.length > 0 && (
                  <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">📎 Attachments</h4>
                    <div className="flex flex-wrap gap-2">
                      {task.attachments.map((att, idx) => (
                        <span key={idx} className="text-xs bg-gray-200 dark:bg-slate-600 px-2 py-1 rounded">
                          {att.name} ({att.type})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {task.status === 'todo' && !task.approvedAt && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => approveTaskMutation.mutate(task.id)}
                      disabled={approveTaskMutation.isPending}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm font-medium"
                    >
                      ✓ Approve Task
                    </button>
                  </div>
                )}

                {task.approvedAt && !task.sessionId && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => executeTaskMutation.mutate(task.id)}
                      disabled={executeTaskMutation.isPending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                    >
                      🚀 Execute (Create Session)
                    </button>
                  </div>
                )}

                {task.sessionId && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
                    <span className="text-sm text-yellow-700 dark:text-yellow-300">
                      🔄 Session: <a href={`/sessions/${task.sessionId}`} className="underline">{task.sessionId}</a>
                    </span>
                  </div>
                )}
                
                {/* Metadata */}
                <div className="border-t border-gray-200 dark:border-slate-600 pt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500 dark:text-slate-400">Created</span>
                    <p className="text-gray-700 dark:text-slate-300">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400">Updated</span>
                    <p className="text-gray-700 dark:text-slate-300">
                      {new Date(task.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400">Source</span>
                    <p className="text-gray-700 dark:text-slate-300 capitalize">
                      {task.createdBy || 'Unknown'}
                    </p>
                  </div>
                  {task.approvedAt && (
                    <div>
                      <span className="text-gray-500 dark:text-slate-400">Approved</span>
                      <p className="text-gray-700 dark:text-slate-300">
                        {new Date(task.approvedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
