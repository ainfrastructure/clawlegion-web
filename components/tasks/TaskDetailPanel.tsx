'use client'

import { useState, useEffect } from 'react'
import {
  X, Clock, User, Calendar, Tag, GitBranch, CheckCircle2,
  AlertCircle, PlayCircle, Pause, ChevronDown, ChevronRight,
  ExternalLink, Activity
} from 'lucide-react'
import { getStatusConfig, normalizeStatus, type TaskStatusKey } from './config/status'

interface Task {
  id: string
  title: string
  description?: string
  priority: string
  status: string
  createdBy: string
  createdAt: string
  assignedTo?: string
  assignee?: string
  assignedAt?: string
  approvedAt?: string
  completedAt?: string
  updatedAt?: string
  tags?: string[]
  progress?: number
  confidence?: number
  tested?: boolean
  parentId?: string
  dependencies?: { taskId: string; type: string }[]
  estimatedMinutes?: number
}

interface TaskDetailPanelProps {
  taskId: string
  isOpen: boolean
  onClose: () => void
}

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  P0: { label: 'P0', color: 'text-red-400', bg: 'bg-red-500/20' },
  P1: { label: 'P1', color: 'text-orange-400', bg: 'bg-orange-500/20' },
  P2: { label: 'P2', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  P3: { label: 'P3', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  urgent: { label: 'Urgent', color: 'text-red-400', bg: 'bg-red-500/20' },
  high: { label: 'High', color: 'text-orange-400', bg: 'bg-orange-500/20' },
  normal: { label: 'Normal', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  low: { label: 'Low', color: 'text-slate-400', bg: 'bg-slate-500/20' },
}

const STATUS_COLOR_MAP: Record<string, string> = {
  slate: 'text-slate-400',
  blue: 'text-blue-400',
  indigo: 'text-indigo-400',
  violet: 'text-violet-400',
  amber: 'text-amber-400',
  cyan: 'text-cyan-400',
  green: 'text-green-400',
  red: 'text-red-400',
}

export function TaskDetailPanel({ taskId, isOpen, onClose }: TaskDetailPanelProps) {
  const [task, setTask] = useState<Task | null>(null)
  const [subtasks, setSubtasks] = useState<Task[]>([])
  const [parentTask, setParentTask] = useState<Task | null>(null)
  const [verifications, setVerifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showSubtasks, setShowSubtasks] = useState(true)
  const [showVerifications, setShowVerifications] = useState(true)

  useEffect(() => {
    if (!isOpen || !taskId) return

    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch all tasks
        const queueRes = await fetch('/api/tasks/queue')
        const queueData = await queueRes.json()
        const allTasks = queueData.tasks || []

        // Find the task
        const foundTask = allTasks.find((t: Task) => t.id === taskId)
        setTask(foundTask || null)

        // Find subtasks
        const foundSubtasks = allTasks.filter((t: Task) => t.parentId === taskId)
        setSubtasks(foundSubtasks)

        // Find parent task
        if (foundTask?.parentId) {
          const parent = allTasks.find((t: Task) => t.id === foundTask.parentId)
          setParentTask(parent || null)
        }

        // Fetch verifications if available
        try {
          const verifyRes = await fetch(`/api/verifier/verify/history/${taskId}`)
          if (verifyRes.ok) {
            const verifyData = await verifyRes.json()
            setVerifications(verifyData.verifications || [])
          }
        } catch { /* Verification service might not be available */ }

      } catch (err) {
        console.error('Failed to load task details:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [taskId, isOpen])

  if (!isOpen) return null

  const priority = task ? (priorityConfig[task.priority] || priorityConfig.P2) : priorityConfig.P2
  const statusCfg = task ? getStatusConfig(task.status) : getStatusConfig('backlog')
  const StatusIcon = statusCfg.icon
  const statusColor = STATUS_COLOR_MAP[statusCfg.color] || 'text-slate-400'

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Panel */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-slate-900 border-l border-white/[0.06] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-slate-800">
          <h2 className="font-semibold text-white">Task Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading...</div>
          ) : !task ? (
            <div className="text-center py-12 text-slate-500">Task not found</div>
          ) : (
            <>
              {/* Title & Status */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${priority.bg} ${priority.color}`}>
                    {priority.label}
                  </span>
                  <span className={`flex items-center gap-1 text-xs ${statusColor}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusCfg.label}
                  </span>
                  {task.confidence !== undefined && (
                    <span className="text-xs text-slate-500">
                      {task.confidence}% confident
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white">{task.title}</h3>
              </div>

              {/* Parent Task */}
              {parentTask && (
                <div className="glass-2 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">Part of:</div>
                  <div className="text-sm text-blue-400">{parentTask.title}</div>
                </div>
              )}

              {/* Description */}
              {task.description && (
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">Description</h4>
                  <p className="text-sm text-slate-300 glass-2 rounded-lg p-4">
                    {task.description}
                  </p>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                    <User className="w-3 h-3" /> Created by
                  </div>
                  <div className="text-sm text-slate-300">{task.createdBy}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Created
                  </div>
                  <div className="text-sm text-slate-300">
                    {new Date(task.createdAt).toLocaleString()}
                  </div>
                </div>
                {(task.assignee || task.assignedTo) && (
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Assigned to</div>
                    <div className="text-sm text-slate-300">{task.assignee || task.assignedTo}</div>
                  </div>
                )}
                {task.estimatedMinutes && (
                  <div>
                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Estimate
                    </div>
                    <div className="text-sm text-slate-300">{task.estimatedMinutes} min</div>
                  </div>
                )}
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div>
                  <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Tags
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress */}
              {task.progress !== undefined && task.progress > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Progress</span>
                    <span>{task.progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Subtasks */}
              {subtasks.length > 0 && (
                <div>
                  <button 
                    onClick={() => setShowSubtasks(!showSubtasks)}
                    className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2 hover:text-white"
                  >
                    {showSubtasks ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <GitBranch className="w-4 h-4" />
                    Subtasks ({subtasks.length})
                  </button>
                  {showSubtasks && (
                    <div className="space-y-2 ml-6">
                      {subtasks.map((st) => {
                        const stCfg = getStatusConfig(st.status)
                        const StIcon = stCfg.icon
                        const stColor = STATUS_COLOR_MAP[stCfg.color] || 'text-slate-400'
                        return (
                          <div key={st.id} className="flex items-center gap-2 text-sm">
                            <StIcon className={`w-4 h-4 ${stColor}`} />
                            <span className={st.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-300'}>
                              {st.title}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Dependencies */}
              {task.dependencies && task.dependencies.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Dependencies
                  </h4>
                  <div className="space-y-1 text-sm text-slate-300">
                    {task.dependencies.map((dep, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs text-orange-400">{dep.type}</span>
                        <span className="font-mono text-xs text-slate-500">{dep.taskId}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verifications */}
              {verifications.length > 0 && (
                <div>
                  <button 
                    onClick={() => setShowVerifications(!showVerifications)}
                    className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2 hover:text-white"
                  >
                    {showVerifications ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <Activity className="w-4 h-4" />
                    Verification History ({verifications.length})
                  </button>
                  {showVerifications && (
                    <div className="space-y-2">
                      {verifications.map((v, i) => (
                        <div key={i} className={`p-3 rounded-lg text-sm ${v.verified ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                          <div className="flex items-center gap-2">
                            {v.verified ? (
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-400" />
                            )}
                            <span className={v.verified ? 'text-green-400' : 'text-red-400'}>
                              {v.verified ? 'Verified' : 'Failed'}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(v.verifiedAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="mt-1 text-slate-400 text-xs">{v.claim}</div>
                          <div className="mt-1 text-slate-500 text-xs">Result: {v.actualResult}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Timeline */}
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Activity Timeline
                </h4>
                <div className="relative border-l-2 border-white/[0.06] ml-2 pl-4 space-y-4">
                  <div className="relative">
                    <div className="absolute -left-[22px] w-3 h-3 rounded-full bg-slate-600" />
                    <div className="text-xs text-slate-500">{new Date(task.createdAt).toLocaleString()}</div>
                    <div className="text-sm text-slate-300">Created by {task.createdBy}</div>
                  </div>
                  {task.assignedAt && (
                    <div className="relative">
                      <div className="absolute -left-[22px] w-3 h-3 rounded-full bg-blue-500" />
                      <div className="text-xs text-slate-500">{new Date(task.assignedAt).toLocaleString()}</div>
                      <div className="text-sm text-slate-300">Assigned to {task.assignee || task.assignedTo}</div>
                    </div>
                  )}
                  {task.completedAt && (
                    <div className="relative">
                      <div className="absolute -left-[22px] w-3 h-3 rounded-full bg-green-500" />
                      <div className="text-xs text-slate-500">{new Date(task.completedAt).toLocaleString()}</div>
                      <div className="text-sm text-slate-300">Completed</div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.06] bg-slate-800">
          <div className="text-xs text-slate-500 font-mono">{taskId}</div>
        </div>
      </div>
    </div>
  )
}

export default TaskDetailPanel
