'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getStatusColor, formatDate } from '@/lib/utils'
import { useEffect, useState, useRef, useMemo } from 'react'
import { getSocket } from '@/lib/socket'
import TaskProgressBar from '@/components/analytics/TaskProgressBar'
import TaskTimeline from '@/components/analytics/TaskTimeline'
import MetricsCard from '@/components/analytics/MetricsCard'
import TaskQueue from '@/components/analytics/TaskQueue'
import { LogViewer } from '@/components/logs'
import {
  Play,
  Square,
  Pause,
  RotateCcw,
  Clock,
  ArrowLeft,
  BookOpen,
  Building2,
  Package
} from 'lucide-react'

import type { Session, Log, SessionAnalytics, LogLevel } from './types'
import {
  CollapsibleGoal,
  CollapsibleWorkflow,
  LiveDuration,
  ETADisplay,
  GitHubIssuesSection,
  ApprovalsSection,
  CommitsSection
} from './components'

export default function SessionDetail() {
  const params = useParams()
  const queryClient = useQueryClient()
  const [realtimeLogs, setRealtimeLogs] = useState<Log[]>([])
  const [logFilter, setLogFilter] = useState<LogLevel>('ALL')
  const [logSearch, setLogSearch] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)
  const logsContainerRef = useRef<HTMLDivElement>(null)

  const sessionId = params.id as string

  const { data: session, isLoading } = useQuery<Session>({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      const response = await api.get(`/sessions/${sessionId}`)
      return response.data
    },
    refetchInterval: 5000,
  })

  const { data: logsData } = useQuery<{ logs: Log[] }>({
    queryKey: ['logs', sessionId],
    queryFn: async () => {
      const response = await api.get(`/logs?sessionId=${sessionId}&limit=200`)
      return response.data
    },
    refetchInterval: 5000,
  })

  const { data: analytics } = useQuery<SessionAnalytics>({
    queryKey: ['analytics', sessionId],
    queryFn: async () => {
      const response = await api.get(`/analytics/session/${sessionId}`)
      return response.data
    },
    enabled: !!session,
    refetchInterval: 5000,
  })

  const startMutation = useMutation({
    mutationFn: () => api.post(`/process/${sessionId}/start`).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['session', sessionId] }),
  })

  const stopMutation = useMutation({
    mutationFn: () => api.post(`/process/${sessionId}/stop`).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['session', sessionId] }),
  })

  const restartMutation = useMutation({
    mutationFn: () => api.post(`/process/${sessionId}/restart`).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['session', sessionId] }),
  })

  const pauseMutation = useMutation({
    mutationFn: () => api.post(`/process/${sessionId}/pause`).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['session', sessionId] }),
  })

  const resumeMutation = useMutation({
    mutationFn: () => api.post(`/process/${sessionId}/resume`).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['session', sessionId] }),
  })

  // WebSocket connection for real-time logs
  useEffect(() => {
    const socket = getSocket()
    socket.connect()
    socket.emit('join-session', { sessionId })

    const handlers = {
      log: (data: Log) => {
        if (data.sessionId === sessionId) {
          setRealtimeLogs(prev => [...prev, data].slice(-100))
        }
      },
      'session:status': (data: { sessionId: string }) => {
        if (data.sessionId === sessionId) {
          queryClient.invalidateQueries({ queryKey: ['session', sessionId] })
        }
      },
      'task:progress': (data: { sessionId: string }) => {
        if (data.sessionId === sessionId) {
          queryClient.invalidateQueries({ queryKey: ['analytics', sessionId] })
          queryClient.invalidateQueries({ queryKey: ['session', sessionId] })
        }
      },
      'session:continuing': (data: { sessionId: string }) => {
        if (data.sessionId === sessionId) {
          queryClient.invalidateQueries({ queryKey: ['session', sessionId] })
          queryClient.invalidateQueries({ queryKey: ['analytics', sessionId] })
        }
      },
      'session:stalled': (data: { sessionId: string }) => {
        if (data.sessionId === sessionId) queryClient.invalidateQueries({ queryKey: ['session', sessionId] })
      },
      'session:paused': (data: { sessionId: string }) => {
        if (data.sessionId === sessionId) queryClient.invalidateQueries({ queryKey: ['session', sessionId] })
      },
      'session:resumed': (data: { sessionId: string }) => {
        if (data.sessionId === sessionId) queryClient.invalidateQueries({ queryKey: ['session', sessionId] })
      },
    }

    Object.entries(handlers).forEach(([event, handler]) => socket.on(event, handler))

    return () => {
      socket.emit('leave-session', { sessionId })
      Object.keys(handlers).forEach(event => socket.off(event))
    }
  }, [sessionId, queryClient])

  // Auto-scroll effect
  useEffect(() => {
    if (autoScroll && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight
    }
  }, [realtimeLogs, autoScroll])

  // Combined and filtered logs
  const allLogs = useMemo(() => {
    const logMap = new Map<string, Log>()
    ;(session?.logs || []).forEach(l => logMap.set(l.id, l))
    ;(logsData?.logs || []).forEach(l => logMap.set(l.id, l))
    realtimeLogs.forEach(l => logMap.set(l.id, l))
    
    return Array.from(logMap.values())
      .filter(log => {
        if (logFilter !== 'ALL' && log.level !== logFilter) return false
        if (logSearch && !log.message.toLowerCase().includes(logSearch.toLowerCase())) return false
        return true
      })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }, [session?.logs, logsData?.logs, realtimeLogs, logFilter, logSearch])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-slate-400">Loading session...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-slate-400">Session not found</div>
      </div>
    )
  }

  const isRunning = session.status === 'RUNNING'
  const canStart = ['PENDING', 'FAILED', 'STOPPED', 'PAUSED'].includes(session.status)
  const canStop = session.status === 'RUNNING'
  const canPause = session.status === 'RUNNING'
  const canResume = session.status === 'PAUSED'
  const isGatewayTask = !!session.config?.assignee

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Session Header */}
        <div className="mb-6">
          <Link href="/sessions" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm mb-2 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Back to Sessions
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{session.name}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(session.status)} text-white`}>
                  {session.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-slate-400">
                <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{session.repository.name}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /><LiveDuration startedAt={session.startedAt} completedAt={session.completedAt} /></span>
                {analytics?.taskStats && isRunning && <ETADisplay taskStats={analytics.taskStats} startedAt={session.startedAt} />}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {canStart && <button onClick={() => startMutation.mutate()} disabled={startMutation.isPending} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"><Play className="w-4 h-4" />{startMutation.isPending ? 'Starting...' : 'Start'}</button>}
              {canPause && <button onClick={() => pauseMutation.mutate()} disabled={pauseMutation.isPending} className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center gap-2"><Pause className="w-4 h-4" />{pauseMutation.isPending ? 'Pausing...' : 'Pause'}</button>}
              {canResume && <button onClick={() => resumeMutation.mutate()} disabled={resumeMutation.isPending} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"><Play className="w-4 h-4" />{resumeMutation.isPending ? 'Resuming...' : 'Resume'}</button>}
              {canStop && <button onClick={() => stopMutation.mutate()} disabled={stopMutation.isPending} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"><Square className="w-4 h-4" />{stopMutation.isPending ? 'Stopping...' : 'Stop'}</button>}
              {!isRunning && session.status !== 'PENDING' && <button onClick={() => restartMutation.mutate()} disabled={restartMutation.isPending} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2"><RotateCcw className="w-4 h-4" />{restartMutation.isPending ? 'Restarting...' : 'Restart'}</button>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-200 dark:border-white/[0.06] p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div><h3 className="text-sm font-medium text-gray-500 dark:text-slate-400">Status</h3><span className={`mt-2 inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(session.status)} text-white`}>{session.status}</span></div>
              <div><h3 className="text-sm font-medium text-gray-500 dark:text-slate-400">Created</h3><p className="mt-2 text-sm text-gray-900 dark:text-slate-100">{formatDate(session.createdAt)}</p></div>
              {session.startedAt && <div><h3 className="text-sm font-medium text-gray-500 dark:text-slate-400">Started</h3><p className="mt-2 text-sm text-gray-900 dark:text-slate-100">{formatDate(session.startedAt)}</p></div>}
              {session.completedAt && <div><h3 className="text-sm font-medium text-gray-500 dark:text-slate-400">Completed</h3><p className="mt-2 text-sm text-gray-900 dark:text-slate-100">{formatDate(session.completedAt)}</p></div>}
              {session.processId && <div><h3 className="text-sm font-medium text-gray-500 dark:text-slate-400">Process ID</h3><p className="mt-2 text-sm text-gray-900 dark:text-slate-100 font-mono">{session.processId}</p></div>}
            </div>
            {session.goal && <CollapsibleGoal goal={session.goal} />}
          </div>

          {/* Task Queue - Only for local Ralph sessions */}
          {!isGatewayTask && <TaskQueue sessionId={sessionId} />}

          {/* Gateway Task Info */}
          {isGatewayTask && (
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg"><Building2 className="w-5 h-5 text-amber-500" /></div>
                <div><h3 className="font-semibold text-amber-200">Gateway Task</h3><p className="text-sm text-amber-300/70">Executed by <span className="font-mono text-amber-300">{session.config?.assignee}</span> via Clawdbot gateway</p></div>
              </div>
            </div>
          )}

          {/* Metrics Cards */}
          {isGatewayTask ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricsCard title="Log Entries" value={allLogs.length} color="blue" />
              <MetricsCard title="Info" value={allLogs.filter(l => l.level === 'INFO').length} color="green" />
              <MetricsCard title="Warnings" value={allLogs.filter(l => l.level === 'WARN').length} color="yellow" />
              <MetricsCard title="Errors" value={allLogs.filter(l => l.level === 'ERROR').length} color="red" />
            </div>
          ) : analytics?.taskStats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <MetricsCard title="Total Tasks" value={analytics.taskStats.total || 0} color="blue" />
              <MetricsCard title="Completed" value={analytics.taskStats.completed || 0} subtitle={`${Math.round(analytics.taskStats.successRate || 0)}% success rate`} color="green" />
              <MetricsCard title="Running" value={analytics.taskStats.running || 0} color="blue" />
              <MetricsCard title="Failed" value={analytics.taskStats.failed || 0} color="red" />
              {session.backlogCount !== undefined && <MetricsCard title="Backlog" value={session.backlogCount} subtitle={session.backlogCount > 0 ? "remaining" : "empty"} color="gray" icon={<Package className="w-6 h-6" />} />}
            </div>
          )}

          {/* Task Progress Bar - Only for local Ralph sessions */}
          {!isGatewayTask && analytics?.taskStats && analytics.taskStats.total > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-200 dark:border-white/[0.06] p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Task Progress</h2>
              <TaskProgressBar completed={analytics.taskStats.completed || 0} failed={analytics.taskStats.failed || 0} running={analytics.taskStats.running || 0} pending={analytics.taskStats.pending || 0} total={analytics.taskStats.total || 0} />
            </div>
          )}

          <CommitsSection executions={session.executions} githubUrl={session.repository.githubUrl} />

          {/* Task Timeline - Only for local Ralph sessions */}
          {!isGatewayTask && analytics?.timeline && analytics.timeline.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-200 dark:border-white/[0.06] p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-6">Task Timeline</h2>
              <TaskTimeline timeline={analytics.timeline} />
            </div>
          )}

          <LogViewer sessionId={sessionId} logs={allLogs} executions={session.executions} isRunning={isRunning} githubUrl={session.repository.githubUrl} />

          {!isGatewayTask && <CollapsibleWorkflow sessionId={sessionId} />}

          <ApprovalsSection sessionId={sessionId} />
          <GitHubIssuesSection sessionId={sessionId} />
        </div>
      </div>
    </div>
  )
}
