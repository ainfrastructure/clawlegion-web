'use client'

import { useState } from 'react'
import { 
  Clock, 
  RotateCcw, 
  TimerReset, 
  PlayCircle,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  AlertTriangle
} from 'lucide-react'
import { WatchdogStatusBadge, WatchdogStatus } from './WatchdogStatusBadge'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

interface TaskHealth {
  taskId: string
  shortId?: string
  title: string
  status: string
  watchdogStatus: WatchdogStatus
  lastHeartbeat: string | null
  startedAt: string | null
  timeSinceStart: number | null
  timeUntilDeadline: number | null
  missedHeartbeats: number
  retryCount: number
  maxRetries: number
  assignee?: string
}

interface TaskHealthTableProps {
  tasks: TaskHealth[]
  isLoading?: boolean
}

function formatDuration(ms: number | null): string {
  if (ms === null) return '-'
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never'
  const diff = Date.now() - new Date(dateStr).getTime()
  return formatDuration(diff) + ' ago'
}

export function TaskHealthTable({ tasks, isLoading }: TaskHealthTableProps) {
  const [sortField, setSortField] = useState<'status' | 'time'>('status')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const resetMutation = useMutation({
    mutationFn: (taskId: string) => api.post(`/watchdog/reset/${taskId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watchdog'] })
  })

  const extendMutation = useMutation({
    mutationFn: ({ taskId, minutes }: { taskId: string; minutes: number }) => 
      api.post(`/watchdog/extend/${taskId}`, { durationMs: minutes * 60 * 1000 }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watchdog'] })
  })

  const retryMutation = useMutation({
    mutationFn: (taskId: string) => api.post(`/watchdog/retry/${taskId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watchdog'] })
  })

  // Sort tasks
  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortField === 'status') {
      const statusOrder: Record<WatchdogStatus, number> = { failed: 0, stale: 1, warning: 2, healthy: 3 }
      const diff = statusOrder[a.watchdogStatus] - statusOrder[b.watchdogStatus]
      return sortDir === 'asc' ? diff : -diff
    } else {
      const aTime = a.timeSinceStart ?? 0
      const bTime = b.timeSinceStart ?? 0
      return sortDir === 'asc' ? aTime - bTime : bTime - aTime
    }
  })

  const toggleSort = (field: 'status' | 'time') => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const SortIcon = ({ field }: { field: 'status' | 'time' }) => {
    if (sortField !== field) return null
    return sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
  }

  if (isLoading) {
    return (
      <div className="glass-2 rounded-xl p-8 text-center">
        <div className="text-slate-400 animate-pulse">Loading task health data...</div>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="glass-2 rounded-xl p-8 text-center">
        <Clock size={32} className="mx-auto text-slate-600 mb-3" />
        <div className="text-slate-400">No active tasks to monitor</div>
        <div className="text-sm text-slate-500 mt-1">Tasks in progress will appear here</div>
      </div>
    )
  }

  return (
    <div className="glass-2 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-white/[0.06]">
        <h3 className="font-semibold text-white">Task Health Monitor</h3>
        <p className="text-sm text-slate-400">In-progress tasks with health status</p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900/50">
            <tr className="text-left text-slate-400 text-sm">
              <th className="px-4 py-3 font-medium">Task</th>
              <th 
                className="px-4 py-3 font-medium cursor-pointer hover:text-white"
                onClick={() => toggleSort('status')}
              >
                <span className="flex items-center gap-1">
                  Health <SortIcon field="status" />
                </span>
              </th>
              <th className="px-4 py-3 font-medium">Last Heartbeat</th>
              <th 
                className="px-4 py-3 font-medium cursor-pointer hover:text-white"
                onClick={() => toggleSort('time')}
              >
                <span className="flex items-center gap-1">
                  Running <SortIcon field="time" />
                </span>
              </th>
              <th className="px-4 py-3 font-medium">Retries</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {sortedTasks.map((task) => (
              <tr 
                key={task.taskId}
                className={`transition-colors ${
                  task.watchdogStatus === 'failed' ? 'bg-red-500/5' :
                  task.watchdogStatus === 'stale' ? 'bg-orange-500/5' :
                  task.watchdogStatus === 'warning' ? 'bg-yellow-500/5' :
                  'hover:bg-slate-800/50'
                }`}
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-white truncate max-w-[200px]" title={task.title}>
                    {task.title}
                  </div>
                  <div className="text-xs text-slate-500">{task.shortId || task.taskId.slice(0, 8)}</div>
                </td>
                <td className="px-4 py-3">
                  <WatchdogStatusBadge status={task.watchdogStatus} pulse={task.watchdogStatus !== 'healthy'} />
                </td>
                <td className="px-4 py-3 text-sm text-slate-400">
                  {formatTimeAgo(task.lastHeartbeat)}
                  {task.missedHeartbeats > 0 && (
                    <span className="ml-2 text-xs text-yellow-400">
                      ({task.missedHeartbeats} missed)
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-slate-400">
                  {formatDuration(task.timeSinceStart)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={task.retryCount >= task.maxRetries ? 'text-red-400' : 'text-slate-400'}>
                    {task.retryCount}/{task.maxRetries}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => resetMutation.mutate(task.taskId)}
                      disabled={resetMutation.isPending}
                      className="p-1.5 hover:bg-slate-700 rounded transition-colors"
                      title="Reset watchdog timer"
                    >
                      <RotateCcw size={14} className="text-slate-400 hover:text-white" />
                    </button>
                    <button
                      onClick={() => extendMutation.mutate({ taskId: task.taskId, minutes: 15 })}
                      disabled={extendMutation.isPending}
                      className="p-1.5 hover:bg-slate-700 rounded transition-colors"
                      title="Extend deadline +15min"
                    >
                      <TimerReset size={14} className="text-slate-400 hover:text-white" />
                    </button>
                    {task.watchdogStatus === 'failed' && task.retryCount < task.maxRetries && (
                      <button
                        onClick={() => retryMutation.mutate(task.taskId)}
                        disabled={retryMutation.isPending}
                        className="p-1.5 hover:bg-slate-700 rounded transition-colors"
                        title="Force retry"
                      >
                        <PlayCircle size={14} className="text-green-400 hover:text-green-300" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-white/[0.06]">
        {sortedTasks.map((task) => (
          <div 
            key={task.taskId}
            className={`p-4 ${
              task.watchdogStatus === 'failed' ? 'bg-red-500/5' :
              task.watchdogStatus === 'stale' ? 'bg-orange-500/5' :
              task.watchdogStatus === 'warning' ? 'bg-yellow-500/5' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="min-w-0">
                <div className="font-medium text-white truncate" title={task.title}>
                  {task.title}
                </div>
                <div className="text-xs text-slate-500">{task.shortId || task.taskId.slice(0, 8)}</div>
              </div>
              <WatchdogStatusBadge status={task.watchdogStatus} size="sm" />
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div>
                <span className="text-slate-500">Last heartbeat:</span>
                <span className="ml-1 text-slate-300">{formatTimeAgo(task.lastHeartbeat)}</span>
              </div>
              <div>
                <span className="text-slate-500">Running:</span>
                <span className="ml-1 text-slate-300">{formatDuration(task.timeSinceStart)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Retries: {task.retryCount}/{task.maxRetries}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => resetMutation.mutate(task.taskId)}
                  className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded"
                >
                  Reset
                </button>
                <button
                  onClick={() => extendMutation.mutate({ taskId: task.taskId, minutes: 15 })}
                  className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded"
                >
                  +15min
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TaskHealthTable
