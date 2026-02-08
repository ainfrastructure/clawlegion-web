'use client'

import { formatDate, formatDuration } from '@/lib/utils'

interface Task {
  id: string
  taskId: string
  taskName: string
  status: string
  startedAt: string
  completedAt?: string
  duration?: number
  commitSha?: string
  hasError?: boolean
}

interface Props {
  timeline: Task[]
}

export default function TaskTimeline({ timeline }: Props) {
  if (timeline.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No task executions yet</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'RUNNING':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SUCCESS':
        return (
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'FAILED':
        return (
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      case 'RUNNING':
        return (
          <svg className="w-5 h-5 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  return (
    <div className="space-y-4">
      {timeline.map((task, index) => (
        <div
          key={task.id}
          className={`relative border-l-4 pl-6 pb-4 ${
            index === timeline.length - 1 ? '' : 'border-gray-300'
          }`}
        >
          {/* Timeline dot */}
          <div className="absolute left-0 top-0 -ml-2.5 flex items-center justify-center w-5 h-5 rounded-full bg-white border-2 border-gray-300">
            {index === timeline.length - 1 && task.status === 'RUNNING' ? (
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            ) : (
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            )}
          </div>

          {/* Task card */}
          <div className={`border-2 rounded-lg p-4 ${getStatusColor(task.status)}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(task.status)}
                  <span className="font-mono text-xs px-2 py-1 bg-white rounded">
                    {task.taskId}
                  </span>
                  <span className="font-semibold">{task.taskName}</span>
                </div>

                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Started:</span>
                    <span>{formatDate(task.startedAt)}</span>
                  </div>
                  {task.completedAt && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Completed:</span>
                      <span>{formatDate(task.completedAt)}</span>
                    </div>
                  )}
                  {task.duration && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-semibold">
                        {formatDuration(task.duration / 1000)}
                      </span>
                    </div>
                  )}
                  {task.commitSha && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Commit:</span>
                      <code className="font-mono text-xs bg-white px-2 py-1 rounded">
                        {task.commitSha.substring(0, 8)}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
