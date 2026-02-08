'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import { ClipboardList, XCircle, CheckCircle, Package, Bug, Wrench, Clock, AlertTriangle } from 'lucide-react'

interface Task {
  id: string
  name: string
  points: number
  hasDetails: boolean
  status?: 'FAILED'
  failureCategory?: 'TRANSIENT' | 'PERMANENT' | 'INFRASTRUCTURE' | 'TIMEOUT'
  githubIssueUrl?: string
  linearIssueUrl?: string
}

interface TaskQueueData {
  todo: Task[]
  completed: Task[]
  backlog: Task[]
  failed?: Task[]
  stats: {
    todoCount: number
    completedCount: number
    backlogCount: number
    failedCount?: number
    totalPoints: number
    completedPoints: number
    completionPercentage: number
  }
}

interface Props {
  sessionId: string
  onRefresh?: () => void
}

export default function TaskQueue({ sessionId, onRefresh }: Props) {
  const [data, setData] = useState<TaskQueueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState({
    todo: true,
    completed: false,
    failed: true,
    backlog: false,
  })

  const fetchTaskQueue = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get(`/tasks/queue/${sessionId}`)
      setData(response.data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load task queue')
      console.error('Error fetching task queue:', err)
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    fetchTaskQueue()
  }, [fetchTaskQueue])

  const toggleSection = (section: 'todo' | 'completed' | 'failed' | 'backlog') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const getFailureCategoryBadge = (category: string) => {
    const badges = {
      PERMANENT: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', icon: <Bug className="w-3 h-3" />, label: 'Permanent' },
      INFRASTRUCTURE: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-300', icon: <Wrench className="w-3 h-3" />, label: 'Infrastructure' },
      TIMEOUT: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-300', icon: <Clock className="w-3 h-3" />, label: 'Timeout' },
      TRANSIENT: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', icon: <AlertTriangle className="w-3 h-3" />, label: 'Transient' },
    }
    return badges[category as keyof typeof badges] || badges.PERMANENT
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-red-200 dark:border-red-800 p-6">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{error}</span>
        </div>
        <button
          onClick={fetchTaskQueue}
          className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const { todo, completed, backlog, failed = [], stats } = data

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Task Queue</h3>
          <button
            onClick={fetchTaskQueue}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            title="Refresh"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-semibold text-gray-900">
              {stats.completedPoints} / {stats.totalPoints} pts ({stats.completionPercentage}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
              style={{ width: `${stats.completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Task Sections */}
      <div className="divide-y divide-gray-200">
        {/* Todo Section */}
        <div>
          <button
            onClick={() => toggleSection('todo')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-blue-500" />
              <span className="font-medium text-gray-900 dark:text-slate-100">Todo</span>
              <span className="text-sm text-gray-500">({stats.todoCount} tasks)</span>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.todo ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSections.todo && (
            <div className="px-6 pb-4 space-y-2">
              {todo.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No tasks in todo</p>
              ) : (
                todo.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-blue-700 font-mono text-sm font-semibold">[{task.id}]</span>
                      <span className="text-gray-900">{task.name}</span>
                      {!task.hasDetails && (
                        <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-0.5 rounded flex items-center gap-1" title="Missing detailed description">
                          <AlertTriangle className="w-3 h-3" /> No details
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-blue-700">{task.points}pts</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Failed Section */}
        {failed.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('failed')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <XCircle className="w-6 h-6 text-red-500" />
                <span className="font-medium text-gray-900 dark:text-slate-100">Failed</span>
                <span className="text-sm text-red-600">({stats.failedCount || failed.length} tasks)</span>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.failed ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedSections.failed && (
              <div className="px-6 pb-4 space-y-2">
                {failed.map(task => {
                  const badge = task.failureCategory ? getFailureCategoryBadge(task.failureCategory) : null
                  return (
                    <div
                      key={task.id}
                      className="p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-red-700 font-mono text-sm font-semibold">[{task.id}]</span>
                          <span className="text-gray-900">{task.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-red-700">{task.points}pts</span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap mt-2">
                        {badge && (
                          <span className={`text-xs px-2 py-1 rounded ${badge.bg} ${badge.text} flex items-center gap-1`}>
                            <span>{badge.icon}</span>
                            <span>{badge.label}</span>
                          </span>
                        )}

                        {task.githubIssueUrl && (
                          <a
                            href={task.githubIssueUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-2 py-1 rounded bg-gray-800 text-white hover:bg-gray-700 flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                            </svg>
                            <span>View Issue</span>
                          </a>
                        )}

                        {task.linearIssueUrl && (
                          <a
                            href={task.linearIssueUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                            </svg>
                            <span>Linear</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Completed Section */}
        <div>
          <button
            onClick={() => toggleSection('completed')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <span className="font-medium text-gray-900 dark:text-slate-100">Completed</span>
              <span className="text-sm text-gray-500">({stats.completedCount} tasks)</span>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.completed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSections.completed && (
            <div className="px-6 pb-4 space-y-2">
              {completed.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No completed tasks yet</p>
              ) : (
                completed.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg opacity-75"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-green-700 font-mono text-sm font-semibold">[{task.id}]</span>
                      <span className="text-gray-700 line-through">{task.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-green-700">{task.points}pts</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Backlog Section */}
        <div>
          <button
            onClick={() => toggleSection('backlog')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6 text-gray-500" />
              <span className="font-medium text-gray-900 dark:text-slate-100">Backlog</span>
              <span className="text-sm text-gray-500">({stats.backlogCount} tasks)</span>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.backlog ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSections.backlog && (
            <div className="px-6 pb-4">
              {backlog.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No tasks in backlog</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 mb-2">
                    Tasks will be automatically promoted to Todo when the current queue is empty.
                  </p>
                  {backlog.slice(0, 5).map(task => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-gray-600 font-mono text-sm font-semibold">[{task.id}]</span>
                        <span className="text-gray-700">{task.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-600">{task.points}pts</span>
                    </div>
                  ))}
                  {backlog.length > 5 && (
                    <p className="text-xs text-gray-500 text-center pt-2">
                      +{backlog.length - 5} more tasks in backlog
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
