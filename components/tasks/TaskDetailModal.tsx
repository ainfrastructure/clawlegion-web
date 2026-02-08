'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import {
  X, Bell, CheckCircle, Play, Clock, AlertCircle, User,
  FileText, Target, ListChecks, Tag, Calendar, ExternalLink,
  Loader2, Send, ChevronDown, ChevronRight, Activity, GitBranch,
  Shield, Gauge, RotateCcw, Timer, Link2, Trash2, MessageCircle
} from 'lucide-react'
import { TaskActivityLog } from './TaskActivityLog'
import { TaskStatusTimeline } from './TaskStatusTimeline'
import { TaskHandoffTimeline } from './TaskHandoffTimeline'
import { AgentAvatar } from '@/components/agents'
import { WatchdogStatusBadge } from '@/components/watchdog'
import { useTaskHealth } from '@/hooks/useWatchdog'
import { getPriorityConfig, getStatusConfig } from './config'
import { STATUS_CONFIG, STATUS_ORDER } from './config/status'
import type { Task, TaskDetailModalProps } from './types'

// Available agents for ping
const AVAILABLE_AGENTS = [
  { id: 'jarvis', name: 'Jarvis', description: 'Main orchestrator' },
  { id: 'lux', name: 'Lux', description: 'Secondary agent' },
] as const

// --- Pure helper functions ---

type LifecycleStep = {
  agent: string | null
  phase: string
  phaseLabel: string
  duration: string | null
  outcome: 'complete' | 'current' | 'pending'
}

function computeLifecycleSteps(
  task: Partial<Task> | undefined,
  activities: Array<{ id: string; eventType: string; actor?: string; details: Record<string, unknown> | null; timestamp: string }> | undefined
): LifecycleStep[] {
  if (!task || !activities) return []

  const statusChanges = activities
    .filter(a => a.eventType === 'status_change' && a.details?.toValue)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  const currentStatus = task.status === 'in_progress' ? 'building' : (task.status || 'backlog')
  const currentIdx = STATUS_ORDER.findIndex(s => s === currentStatus)

  return STATUS_ORDER.map((statusKey, i) => {
    const config = STATUS_CONFIG[statusKey]
    const enteredActivity = statusChanges.find(a => a.details?.toValue === statusKey)
    const nextActivity = statusChanges.find(a => a.details?.toValue === STATUS_ORDER[i + 1])

    let agent: string | null = null
    if (enteredActivity?.actor && enteredActivity.actor !== 'system') {
      agent = enteredActivity.actor
    } else {
      agent = config?.agent || null
    }

    // Special case: backlog/todo — use createdBy
    if ((statusKey === 'backlog' || statusKey === 'todo') && task.createdBy) {
      agent = task.createdBy
    }

    let duration: string | null = null
    const enteredTs = enteredActivity?.timestamp || (
      (statusKey === 'backlog' || statusKey === 'todo')
        ? activities.find(a => a.eventType === 'task_created')?.timestamp
        : null
    )

    if (enteredTs) {
      if (i === currentIdx) {
        duration = formatDuration(Date.now() - new Date(enteredTs).getTime())
      } else if (i < currentIdx && nextActivity?.timestamp) {
        duration = formatDuration(new Date(nextActivity.timestamp).getTime() - new Date(enteredTs).getTime())
      }
    }

    let outcome: LifecycleStep['outcome'] = 'pending'
    if (i < currentIdx) outcome = 'complete'
    else if (i === currentIdx) outcome = 'current'

    return {
      agent,
      phase: statusKey,
      phaseLabel: config?.label || statusKey,
      duration,
      outcome,
    }
  }).filter(step => step.outcome !== 'pending' || step.phase === STATUS_ORDER[currentIdx + 1])
}

function formatDuration(ms: number): string {
  if (ms < 0) ms = 0
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainMin = minutes % 60
  if (remainMin === 0) return `${hours}h`
  return `${hours}h ${remainMin}m`
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

// Lightweight markdown: paragraphs, **bold**, `code`, lists
function FormattedText({ text }: { text: string }) {
  if (!text) return null

  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let currentList: string[] = []
  let key = 0

  function flushList() {
    if (currentList.length > 0) {
      elements.push(
        <ul key={key++} className="list-disc list-inside space-y-0.5 text-slate-300 text-sm">
          {currentList.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      )
      currentList = []
    }
  }

  function renderInline(str: string): React.ReactNode {
    // Split on **bold** and `code`
    const parts = str.split(/(\*\*[^*]+\*\*|`[^`]+`)/)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="px-1 py-0.5 rounded bg-white/[0.06] text-blue-300 text-xs font-mono">{part.slice(1, -1)}</code>
      }
      return part
    })
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      currentList.push(trimmed.slice(2))
    } else {
      flushList()
      if (trimmed === '') {
        elements.push(<div key={key++} className="h-2" />)
      } else {
        elements.push(
          <p key={key++} className="text-slate-300 text-sm leading-relaxed">
            {renderInline(trimmed)}
          </p>
        )
      }
    }
  }
  flushList()

  return <div className="space-y-1.5">{elements}</div>
}

export function TaskDetailModal({ taskId, task: initialTask, isOpen, onClose }: TaskDetailModalProps) {
  const queryClient = useQueryClient()
  const [pingMessage, setPingMessage] = useState('')
  const [showPingInput, setShowPingInput] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<string>(AVAILABLE_AGENTS[0].id)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    specs: false, approach: false, criteria: false,
  })

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Fetch full task details
  const { data: fetchedTask, isLoading } = useQuery({
    queryKey: ['task-detail', taskId],
    queryFn: async () => {
      try {
        const response = await api.get(`/task-tracking/tasks/${taskId}?includeActivities=true`)
        return response.data.task as Task
      } catch {
        return initialTask as Task
      }
    },
    enabled: isOpen && !!taskId,
    staleTime: 30000,
  })

  // Fetch activities
  const { data: activitiesData, isLoading: isLoadingActivities } = useQuery({
    queryKey: ['task-activities', taskId],
    queryFn: async () => {
      const response = await api.get(`/task-tracking/tasks/${taskId}/activities`)
      return response.data.activities
    },
    enabled: isOpen && !!taskId,
    staleTime: 15000,
  })

  const task = fetchedTask || initialTask

  // Watchdog health
  const isInProgress = task?.status === 'in_progress' || task?.status === 'assigned'
  const { data: taskHealth } = useTaskHealth(isInProgress ? taskId : '')

  // Comments/Discussion
  const [commentText, setCommentText] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const { data: commentsData, isLoading: isLoadingComments } = useQuery({
    queryKey: ['task-comments', taskId],
    queryFn: async () => {
      const response = await api.get(`/task-tracking/tasks/${taskId}/comments`)
      return response.data.comments as Array<{
        id: string
        content: string
        author: string
        authorType: string
        mentions: string[]
        timestamp: string
      }>
    },
    enabled: isOpen && !!taskId,
    refetchInterval: 10000, // Poll every 10 seconds for real-time feel
  })

  const postCommentMutation = useMutation({
    mutationFn: async ({ content, author }: { content: string; author: string }) => {
      const response = await api.post(`/task-tracking/tasks/${taskId}/comments`, {
        content,
        author,
        authorType: 'human',
      })
      return response.data
    },
    onSuccess: () => {
      setCommentText('')
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] })
    },
  })

  // Auto-scroll to bottom when new comments arrive
  const scrollToBottom = useCallback(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  useEffect(() => {
    if (commentsData && commentsData.length > 0) {
      // Small delay to let DOM update
      setTimeout(scrollToBottom, 100)
    }
  }, [commentsData?.length, scrollToBottom])

  // Ping mutation — posts to room-messages AND sends webhook via /api/agents/:id/ping
  const pingAgentMutation = useMutation({
    mutationFn: async ({ taskId, message, agent }: { taskId: string; message: string; agent: string }) => {
      const taskTitle = task?.title || 'Unknown task'
      const taskShortId = task?.shortId || taskId.slice(0, 8)
      const taskPriority = task?.priority || 'P2'
      const pingContent = message
        ? `@${agent} 🔔 **Task Ping: ${taskShortId}**\n\n**${taskTitle}** (${taskPriority})\n\n${message}`
        : `@${agent} 🔔 **Task Ping: ${taskShortId}**\n\n**${taskTitle}** (${taskPriority})\n\nPlease review and pick up this task when available.`

      // 1. Post to room-messages (internal dashboard chat)
      const roomResponse = await fetch('/api/coordination/room-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: 'general',
          author: 'Dashboard',
          authorType: 'system',
          content: pingContent,
          page: `/tasks/${taskId}`,
        }),
      })
      if (!roomResponse.ok) {
        const error = await roomResponse.json()
        throw new Error(error.error || 'Failed to ping agent')
      }

      // 2. Send webhook to agent's OpenClaw instance
      const webhookResponse = await api.post(`/agents/${agent}/ping`, {
        taskId,
        message: message || undefined,
        author: 'Sven',
      })

      return { room: await roomResponse.json(), webhook: webhookResponse.data }
    },
    onSuccess: () => {
      setShowPingInput(false)
      setPingMessage('')
      // Refetch comments to show the ping in the discussion
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] })
    },
  })

  // Status change mutation
  const statusMutation = useMutation({
    mutationFn: async ({ status }: { status: string }) => {
      const response = await api.patch(`/task-tracking/tasks/${taskId}/status`, {
        status,
        actor: 'dashboard',
        actorType: 'human',
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackedTasks'] })
      queryClient.invalidateQueries({ queryKey: ['task-tracking-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task-detail', taskId] })
      queryClient.invalidateQueries({ queryKey: ['task-queue'] })
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete(`/task-tracking/tasks/${taskId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackedTasks'] })
      queryClient.invalidateQueries({ queryKey: ['task-tracking-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task-queue'] })
      onClose()
    },
  })

  // Execute mutation
  const executeMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/task-tracking/tasks/${taskId}/execute`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackedTasks'] })
      queryClient.invalidateQueries({ queryKey: ['task-queue'] })
      queryClient.invalidateQueries({ queryKey: ['task-detail', taskId] })
    },
  })

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const priority = getPriorityConfig(task?.priority || 'P2')
  const status = getStatusConfig(task?.status || 'backlog')
  const StatusIcon = status.icon
  const canPingAgent = task?.status !== 'done' && task?.status !== 'completed' && task?.status !== 'in_progress'
  const canExecute = task?.approvedAt && !task?.sessionId
  const lifecycleSteps = computeLifecycleSteps(task, activitiesData)

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-2 sm:inset-4 md:inset-6 lg:inset-8 flex items-center justify-center">
        <div className="relative w-full max-w-6xl max-h-full rounded-2xl overflow-hidden flex flex-col bg-[#0a1628]/95 backdrop-blur-xl border border-blue-500/[0.12] shadow-[0_8px_60px_-12px_rgb(59_130_246/0.25),0_4px_20px_-4px_rgb(0_0_0/0.5)]">

          {/* ─── Header ─── */}
          <div className="px-4 sm:px-6 py-4 border-b border-blue-500/[0.1] flex-shrink-0 bg-gradient-to-r from-blue-600/[0.08] via-blue-500/[0.04] to-transparent">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {task?.shortId && (
                    <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/20 px-2 py-1 rounded-lg">
                      {task.shortId}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-lg ${priority.bg} ${priority.color}`}>
                    {priority.label}
                  </span>
                  <span className={`text-xs flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.06] border border-white/[0.06] ${status.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </span>
                  {task?.approvedAt && (
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Approved
                    </span>
                  )}
                  {isInProgress && taskHealth && (
                    <WatchdogStatusBadge
                      status={taskHealth.watchdogStatus}
                      size="sm"
                      pulse={taskHealth.watchdogStatus !== 'healthy'}
                    />
                  )}
                </div>
                {isLoading ? (
                  <div className="h-7 bg-white/[0.06] rounded animate-pulse w-3/4" />
                ) : (
                  <h2 className="text-lg sm:text-xl font-bold text-white line-clamp-2">{task?.title}</h2>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 bg-white/[0.04] hover:bg-red-500/20 border border-white/[0.06] hover:border-red-500/30 rounded-lg transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4 text-blue-300/40 hover:text-red-400" />
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => deleteMutation.mutate()}
                      disabled={deleteMutation.isPending}
                      className="px-3 py-1.5 text-xs font-medium bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-colors"
                    >
                      {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-2 py-1.5 text-xs text-blue-300/60 hover:text-blue-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="p-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-blue-300/60" />
                </button>
              </div>
            </div>
          </div>

          {/* ─── Content ─── */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#070f1e]/60">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
            ) : (
              <div className="space-y-5">
                {/* Phase Tracker Strip */}
                <TaskStatusTimeline
                  currentStatus={task?.status || 'backlog'}
                  activities={activitiesData || []}
                  onStatusClick={(status) => statusMutation.mutate({ status })}
                />

                {/* Two-Column Body */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                  {/* ─── LEFT COLUMN ─── */}
                  <div className="lg:col-span-3 space-y-4">


                    {/* Description */}
                    <div className="bg-blue-950/30 border border-blue-500/[0.08] rounded-xl p-4">
                      <h3 className="text-xs font-semibold text-blue-300/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5" />
                        Description
                      </h3>
                      <FormattedText text={task?.description || 'No description provided.'} />
                    </div>

                    {/* Collapsible sections: Specs, Approach, Criteria */}
                    {task?.specs && (
                      <CollapsibleSection
                        title="Specifications"
                        icon={<ListChecks className="w-3.5 h-3.5" />}
                        borderColor="border-l-blue-500"
                        isOpen={expandedSections.specs}
                        onToggle={() => toggleSection('specs')}
                      >
                        <FormattedText text={task.specs} />
                      </CollapsibleSection>
                    )}
                    {task?.approach && (
                      <CollapsibleSection
                        title="Approach"
                        icon={<Target className="w-3.5 h-3.5" />}
                        borderColor="border-l-emerald-500"
                        isOpen={expandedSections.approach}
                        onToggle={() => toggleSection('approach')}
                      >
                        <FormattedText text={task.approach} />
                      </CollapsibleSection>
                    )}
                    {task?.successCriteria && (
                      <CollapsibleSection
                        title="Success Criteria"
                        icon={<CheckCircle className="w-3.5 h-3.5" />}
                        borderColor="border-l-purple-500"
                        isOpen={expandedSections.criteria}
                        onToggle={() => toggleSection('criteria')}
                      >
                        <FormattedText text={task.successCriteria} />
                      </CollapsibleSection>
                    )}

                    {/* Metadata — Mission Intel */}
                    <div className="bg-blue-950/30 border border-blue-500/[0.08] rounded-xl p-4">
                      <h3 className="text-xs font-semibold text-blue-300/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5" />
                        Mission Intel
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {/* Assigned To */}
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Assigned To</span>
                          {task?.assignee ? (
                            <div className="flex items-center gap-2 mt-1">
                              <AgentAvatar agentId={task.assignee} size="sm" />
                              <span className="text-sm font-medium text-slate-300">{task.assignee}</span>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500 italic mt-1">Unassigned</p>
                          )}
                        </div>
                        {/* Created By */}
                        {task?.createdBy && (
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Created By</span>
                            <div className="flex items-center gap-2 mt-1">
                              <AgentAvatar agentId={task.createdBy} size="sm" />
                              <span className="text-sm font-medium text-slate-300">{task.createdBy}</span>
                            </div>
                          </div>
                        )}
                        {/* Approved By */}
                        {task?.approvedBy && (
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Approved By</span>
                            <div className="flex items-center gap-2 mt-1">
                              <AgentAvatar agentId={task.approvedBy} size="sm" />
                              <span className="text-sm font-medium text-slate-300">{task.approvedBy}</span>
                            </div>
                          </div>
                        )}
                        {/* Verified By */}
                        {task?.verifiedBy && (
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Verified By</span>
                            <div className="flex items-center gap-2 mt-1">
                              <AgentAvatar agentId={task.verifiedBy} size="sm" />
                              <span className="text-sm font-medium text-slate-300">{task.verifiedBy}</span>
                            </div>
                          </div>
                        )}
                        {/* Timestamps */}
                        <MetaField
                          label="Created"
                          value={task?.createdAt ? getRelativeTime(task.createdAt) : '—'}
                          icon={<Calendar className="w-3 h-3" />}
                        />
                        {task?.updatedAt && (
                          <MetaField
                            label="Updated"
                            value={getRelativeTime(task.updatedAt)}
                            icon={<Clock className="w-3 h-3" />}
                          />
                        )}
                        {task?.approvedAt && (
                          <MetaField
                            label="Approved"
                            value={getRelativeTime(task.approvedAt)}
                            icon={<CheckCircle className="w-3 h-3" />}
                          />
                        )}
                        {task?.verifiedAt && (
                          <MetaField
                            label="Verified"
                            value={getRelativeTime(task.verifiedAt)}
                            icon={<Shield className="w-3 h-3" />}
                          />
                        )}
                        {/* Retry count */}
                        {task?.verificationAttempts !== undefined && task.verificationAttempts > 0 && (
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
                              <RotateCcw className="w-3 h-3" /> Retries
                            </span>
                            <div className="flex items-center gap-1 mt-1.5">
                              {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-2 h-2 rounded-full ${
                                    i < (task.verificationAttempts || 0) ? 'bg-red-400' : 'bg-white/[0.06]'
                                  }`}
                                />
                              ))}
                              <span className="text-xs text-slate-400 ml-1">{task.verificationAttempts}/3</span>
                            </div>
                          </div>
                        )}
                        {/* Repository */}
                        {task?.repository && (
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
                              <GitBranch className="w-3 h-3" /> Repository
                            </span>
                            <p className="text-sm font-medium text-slate-300 mt-1">{task.repository.name}</p>
                          </div>
                        )}
                        {/* Session link */}
                        {task?.sessionId && (
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
                              <Link2 className="w-3 h-3" /> Session
                            </span>
                            <a
                              href={`/sessions/${task.sessionId}`}
                              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1 transition-colors"
                            >
                              View Logs <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Verification details */}
                    {(task?.verificationAttempts !== undefined && task.verificationAttempts > 0) && (
                      <>
                        {task?.lastVerificationNote && (
                          <div className="bg-red-950/20 border border-red-500/[0.15] rounded-xl p-4 border-l-2 border-l-red-500">
                            <div className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-2">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Last Verification Note
                            </div>
                            <p className="text-sm text-red-300">{task.lastVerificationNote}</p>
                          </div>
                        )}
                      </>
                    )}

                    {/* Tags */}
                    {task?.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-slate-500" />
                        {task.tags.map((tag) => (
                          <span key={tag} className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/[0.08] rounded-lg text-xs text-blue-300/70">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ─── RIGHT COLUMN ─── */}
                  <div className="lg:col-span-2 space-y-4">

                    {/* Agent Assignment Card */}
                    {task?.assignee && (
                      <div className="bg-blue-950/40 border border-blue-500/[0.12] rounded-xl p-4 shadow-[0_0_20px_-8px_rgb(59_130_246/0.15)]">
                        <h3 className="text-xs font-semibold text-blue-300/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <User className="w-3.5 h-3.5" />
                          Current Assignee
                        </h3>
                        <div className="flex items-center gap-3">
                          <AgentAvatar agentId={task.assignee} size="lg" />
                          <div>
                            <p className="text-base font-semibold text-white capitalize">{task.assignee}</p>
                            {STATUS_CONFIG[status.key as keyof typeof STATUS_CONFIG]?.agent === task.assignee && (
                              <p className="text-xs text-slate-400">{status.label} phase</p>
                            )}
                            {task.updatedAt && (
                              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                <Timer className="w-3 h-3" />
                                Active {getRelativeTime(task.updatedAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Activity Feed — always visible */}
                    <div className="bg-blue-950/30 border border-blue-500/[0.08] rounded-xl p-4">
                      <h3 className="text-xs font-semibold text-blue-300/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5" />
                        Activity
                        {activitiesData?.length > 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-blue-500/20 text-blue-300 rounded-full">
                            {activitiesData.length}
                          </span>
                        )}
                      </h3>
                      <TaskActivityLog
                        activities={activitiesData || []}
                        isLoading={isLoadingActivities}
                      />
                    </div>

                    {/* Handoff Timeline — always visible, scrollable */}
                    <div className="bg-blue-950/30 border border-blue-500/[0.08] rounded-xl p-4">
                      <h3 className="text-xs font-semibold text-blue-300/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <GitBranch className="w-3.5 h-3.5" />
                        Handoffs
                      </h3>
                      <div className="max-h-[300px] overflow-y-auto">
                        <TaskHandoffTimeline taskId={taskId} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ─── Discussion Thread ─── */}
                <div className="bg-blue-950/30 border border-blue-500/[0.08] rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-blue-500/[0.08] bg-blue-950/40">
                    <h3 className="text-xs font-semibold text-blue-300/60 uppercase tracking-wider flex items-center gap-2">
                      <MessageCircle className="w-3.5 h-3.5" />
                      Discussion
                      {commentsData && commentsData.length > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-blue-500/20 text-blue-300 rounded-full">
                          {commentsData.length}
                        </span>
                      )}
                    </h3>
                  </div>

                  {/* Messages */}
                  <div
                    ref={chatContainerRef}
                    className="max-h-[300px] overflow-y-auto p-4 space-y-3"
                  >
                    {isLoadingComments ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                      </div>
                    ) : commentsData && commentsData.length > 0 ? (
                      commentsData.map((comment) => (
                        <div key={comment.id} className="flex gap-3 group">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                              comment.authorType === 'agent'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : comment.authorType === 'system'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}>
                              {comment.author.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm font-semibold text-white capitalize">
                                {comment.author}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {getRelativeTime(comment.timestamp)}
                              </span>
                              {comment.authorType === 'agent' && (
                                <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/15 text-blue-400 rounded-full uppercase tracking-wider">
                                  agent
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-300 mt-0.5 break-words whitespace-pre-wrap">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <MessageCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">No discussion yet. Start the conversation!</p>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input */}
                  <div className="px-4 py-3 border-t border-blue-500/[0.08] bg-blue-950/40">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-slate-900/50 border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/30"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey && commentText.trim()) {
                            e.preventDefault()
                            postCommentMutation.mutate({ content: commentText.trim(), author: 'Sven' })
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (commentText.trim()) {
                            postCommentMutation.mutate({ content: commentText.trim(), author: 'Sven' })
                          }
                        }}
                        disabled={!commentText.trim() || postCommentMutation.isPending}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-lg flex items-center gap-1.5 text-sm font-medium transition-colors"
                      >
                        {postCommentMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ─── Footer ─── */}
          <div className="px-4 sm:px-6 py-4 border-t border-blue-500/[0.1] flex-shrink-0 bg-gradient-to-r from-blue-600/[0.06] via-transparent to-transparent">
            {showPingInput && (
              <div className="mb-4 space-y-3">
                <div className="flex items-center gap-3">
                  <label className="text-sm text-slate-400 whitespace-nowrap">Ping Agent:</label>
                  <div className="relative">
                    <select
                      value={selectedAgent}
                      onChange={(e) => setSelectedAgent(e.target.value)}
                      className="appearance-none bg-blue-950/40 border border-blue-500/[0.12] rounded-lg px-4 py-2 pr-10 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer"
                    >
                      {AVAILABLE_AGENTS.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name} — {agent.description}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pingMessage}
                    onChange={(e) => setPingMessage(e.target.value)}
                    placeholder="Optional message for the agent..."
                    className="flex-1 bg-blue-950/40 border border-blue-500/[0.12] rounded-lg px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        pingAgentMutation.mutate({ taskId, message: pingMessage, agent: selectedAgent })
                      }
                    }}
                  />
                  <button
                    onClick={() => pingAgentMutation.mutate({ taskId, message: pingMessage, agent: selectedAgent })}
                    disabled={pingAgentMutation.isPending}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2 text-sm font-medium transition-colors"
                  >
                    {pingAgentMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Send
                  </button>
                  <button
                    onClick={() => setShowPingInput(false)}
                    className="px-3 py-2 bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-lg text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {canPingAgent && !showPingInput && (
                  <button
                    onClick={() => setShowPingInput(true)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                  >
                    <Bell className="w-4 h-4" />
                    <span className="hidden sm:inline">Ping Agent</span>
                    <span className="sm:hidden">Ping</span>
                  </button>
                )}
                {canExecute && (
                  <button
                    onClick={() => executeMutation.mutate()}
                    disabled={executeMutation.isPending}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium disabled:opacity-50 transition-colors shadow-glow-blue"
                  >
                    {executeMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    Execute Task
                  </button>
                )}
                <a
                  href="/tasks"
                  className="px-4 py-2 bg-white/[0.04] border border-white/[0.06] text-blue-300/70 hover:text-white hover:bg-white/[0.08] rounded-lg text-sm transition-colors"
                >
                  View Tasks
                </a>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] text-blue-200/80 rounded-lg text-sm transition-colors"
              >
                Close
              </button>
            </div>

            {pingAgentMutation.isSuccess && (
              <div className="mt-3 text-sm text-green-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Agent notified successfully!
              </div>
            )}
            {pingAgentMutation.isError && (
              <div className="mt-3 text-sm text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Failed to ping agent. Please try again.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Helper Components ---

function CollapsibleSection({
  title,
  icon,
  borderColor,
  isOpen,
  onToggle,
  children,
}: {
  title: string
  icon: React.ReactNode
  borderColor: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className={`bg-blue-950/30 border border-blue-500/[0.08] rounded-xl border-l-2 ${borderColor} overflow-hidden`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-blue-500/[0.04] transition-colors"
      >
        <h3 className="text-xs font-semibold text-blue-300/60 uppercase tracking-wider flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 -mt-1">
          {children}
        </div>
      )}
    </div>
  )
}

function MetaField({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div>
      <span className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
        {icon} {label}
      </span>
      <p className="text-sm font-medium text-slate-300 mt-1">{value}</p>
    </div>
  )
}

export default TaskDetailModal
