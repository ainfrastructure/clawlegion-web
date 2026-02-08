'use client'
import { TaskDetailPanel } from './TaskDetailPanel'
import { getStatusConfig, normalizeStatus } from './config/status'

import { useState } from 'react'
import { usePollingInterval } from '@/hooks/usePollingInterval'
import {
  ListTodo, Clock, User, AlertCircle, CheckCircle,
  Circle, Loader2, ChevronRight, Plus, Filter
} from 'lucide-react'

interface Task {
  id: string
  title: string
  description?: string
  priority: string
  status: string
  assignedTo?: string
  assignee?: string
  createdBy: string
  createdAt: string
  confidence?: number
  tested?: boolean
  progress?: number
}

interface TaskQueuePanelProps {
  compact?: boolean
  maxItems?: number
}

export function TaskQueuePanel({ compact = false, maxItems = 10 }: TaskQueuePanelProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [summary, setSummary] = useState({ queued: 0, assigned: 0, inProgress: 0, completed: 0, failed: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks/queue')
      if (res.ok) {
        const data = await res.json()
        setTasks(data.tasks || [])
        setSummary(data.summary || { queued: 0, assigned: 0, inProgress: 0, completed: 0, failed: 0 })
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
    }
    setLoading(false)
  }

  usePollingInterval(fetchTasks, 3000)

  const priorityColors: Record<string, string> = {
    urgent: 'text-red-400 bg-red-400/10',
    high: 'text-orange-400 bg-orange-400/10',
    normal: 'text-blue-400 bg-blue-400/10',
    low: 'text-slate-400 bg-slate-400/10'
  }

  const statusIcons: Record<string, React.ReactNode> = {
    backlog: <Circle className="w-3 h-3 text-slate-400" />,
    todo: <Circle className="w-3 h-3 text-blue-400" />,
    researching: <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />,
    planning: <Loader2 className="w-3 h-3 text-violet-400 animate-spin" />,
    building: <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />,
    verifying: <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />,
    done: <CheckCircle className="w-3 h-3 text-green-400" />,
  }

  const getStatusIcon = (status: string) => {
    const normalized = normalizeStatus(status)
    return statusIcons[normalized] || statusIcons.backlog
  }

  const filteredTasks = tasks.filter(t => {
    const normalized = normalizeStatus(t.status)
    if (filter === 'all') return true
    if (filter === 'active') return ['todo', 'researching', 'planning', 'building', 'verifying'].includes(normalized)
    if (filter === 'completed') return normalized === 'done'
    return normalized === filter
  }).slice(0, maxItems)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    )
  }

  if (compact) {
    return (
      <div className="glass-2 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-slate-400" />
            <span className="font-medium text-sm">Task Queue</span>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="text-yellow-400">{summary.inProgress} active</span>
            <span className="text-slate-400">{summary.queued} queued</span>
          </div>
        </div>
        {filteredTasks.slice(0, 3).map(task => (
          <div key={task.id} className="flex items-center gap-2 py-1 text-sm">
            {getStatusIcon(task.status)}
            <span className="truncate flex-1">{task.title}</span>
            {task.confidence && (
              <span className="text-xs text-slate-500">{task.confidence}%</span>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-white/[0.06] shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.06] glass-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <ListTodo className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Task Queue</h3>
            <span className="text-xs text-slate-500">{tasks.length} total tasks</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter tabs */}
          <div className="flex bg-slate-900/50 rounded-lg p-0.5">
            {['all', 'active', 'completed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  filter === f 
                    ? 'bg-slate-700 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button className="p-2 hover:bg-slate-700 rounded-lg">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 px-4 py-2 border-b border-white/[0.06]/50 text-xs">
        <span className="text-slate-400">{summary.queued} queued</span>
        <span className="text-blue-400">{summary.assigned} assigned</span>
        <span className="text-yellow-400">{summary.inProgress} in progress</span>
        <span className="text-green-400">{summary.completed} done</span>
        {summary.failed > 0 && <span className="text-red-400">{summary.failed} failed</span>}
      </div>

      {/* Task list */}
      <div className="divide-y divide-white/[0.06]">
        {filteredTasks.length === 0 ? (
          <div className="px-4 py-8 text-center text-slate-500">
            No tasks in queue
          </div>
        ) : (
          filteredTasks.map((task, index) => (
            <div 
              key={task.id}
              onClick={() => setSelectedTaskId(task.id)}
              className="group flex items-center gap-4 px-4 py-3.5 hover:bg-slate-700/40 transition-all duration-200 cursor-pointer border-l-2 border-transparent hover:border-blue-500"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${
                normalizeStatus(task.status) === 'building' ? 'bg-yellow-500/10' :
                normalizeStatus(task.status) === 'done' ? 'bg-green-500/10' :
                'bg-slate-700/50 group-hover:bg-slate-700'
              }`}>
                {getStatusIcon(task.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate text-white group-hover:text-blue-400 transition-colors">{task.title}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                  {task.tested && (
                    <span className="px-1.5 py-0.5 text-[10px] bg-green-500/10 text-green-400 rounded">✓ tested</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  {(task.assignee || task.assignedTo) && (
                    <span className="flex items-center gap-1 text-blue-400/70">
                      <User className="w-3 h-3" />
                      @{task.assignee || task.assignedTo}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(task.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              {/* Confidence indicator */}
              {task.confidence !== undefined && (
                <div className="flex items-center gap-1">
                  <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        task.confidence >= 80 ? 'bg-green-500' :
                        task.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${task.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 w-8">{task.confidence}%</span>
                </div>
              )}
              {task.tested && (
                <span title="Tested">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>
          ))
        )}
      </div>

      {/* Task Detail Panel */}
      <TaskDetailPanel
        taskId={selectedTaskId || ''}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
      />
    </div>
  )
}

export default TaskQueuePanel
