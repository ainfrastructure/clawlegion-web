'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { 
  Bell, CheckCircle, AlertTriangle, Info,
  Trash2, CheckCheck, Filter, RefreshCw,
  Zap, Users, Clock, XCircle
} from 'lucide-react'

interface TaskEvent {
  id: string
  type: string
  taskId: string
  taskTitle: string
  agentId?: string
  timestamp: string
  metadata?: Record<string, unknown>
}

interface EventsData {
  events: TaskEvent[]
  total: number
  lastUpdated: string
}

function getEventIcon(type: string) {
  switch (type) {
    case 'task_completed':
      return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
    case 'task_failed':
      return <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
    case 'task_assigned':
      return <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
    case 'task_created':
      return <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
    case 'task_started':
      return <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
    default:
      return <Info className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
  }
}

function getEventColor(type: string) {
  switch (type) {
    case 'task_completed':
      return 'border-green-500/30 bg-green-500/5'
    case 'task_failed':
      return 'border-red-500/30 bg-red-500/5'
    case 'task_assigned':
      return 'border-blue-500/30 bg-blue-500/5'
    case 'task_created':
      return 'border-purple-500/30 bg-purple-500/5'
    default:
      return 'border-white/[0.06] bg-slate-800/50'
  }
}

function formatEventType(type: string) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function timeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
  
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<string>('all')
  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery<EventsData>({
    queryKey: ['task-events', filter],
    queryFn: async () => {
      const url = filter === 'all' 
        ? '/api/tasks/events?limit=50'
        : `/api/tasks/events?type=${filter}&limit=50`
      const res = await fetch(url)
      return res.json()
    },
    refetchInterval: 10000,
  })

  const events = data?.events || []
  const eventTypes = ['all', 'task_created', 'task_assigned', 'task_started', 'task_completed', 'task_failed']

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6">
      {/* Header - stacks on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
            Notifications
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-1">Task events and system notifications</p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors text-sm sm:text-base w-full sm:w-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters - horizontal scroll on mobile */}
      <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        {eventTypes.map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex-shrink-0 ${
              filter === type
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {type === 'all' ? 'All Events' : formatEventType(type)}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-2 sm:space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-slate-900 rounded-lg p-3 sm:p-4 border border-slate-800 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-800 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-800 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-slate-800 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))
        ) : events.length === 0 ? (
          <div className="bg-slate-900 rounded-lg p-8 sm:p-12 border border-slate-800 text-center">
            <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-slate-400">No events yet</h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">Events will appear here as tasks are processed</p>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className={`rounded-lg p-3 sm:p-4 border transition-colors ${getEventColor(event.type)}`}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                    <h3 className="font-medium text-sm sm:text-base truncate">{event.taskTitle}</h3>
                    <span className="text-xs sm:text-sm text-slate-500 flex-shrink-0">
                      {timeAgo(event.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs sm:text-sm px-2 py-0.5 bg-slate-800 rounded text-slate-400">
                      {formatEventType(event.type)}
                    </span>
                    {event.agentId && (
                      <span className="text-xs sm:text-sm text-slate-500">
                        by {event.agentId}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {data && (
        <p className="text-center text-slate-500 text-xs sm:text-sm mt-4 sm:mt-6">
          Showing {events.length} of {data.total} events • Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
        </p>
      )}
    </div>
  )
}
