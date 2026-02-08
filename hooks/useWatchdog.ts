import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

// Types
export interface WatchdogHealthSummary {
  total: number
  healthy: number
  warning: number
  stale: number
  failed: number
}

export interface TaskHealth {
  taskId: string
  shortId?: string
  title: string
  status: string
  watchdogStatus: 'healthy' | 'warning' | 'stale' | 'failed'
  lastHeartbeat: string | null
  startedAt: string | null
  timeSinceStart: number | null
  timeUntilDeadline: number | null
  missedHeartbeats: number
  retryCount: number
  maxRetries: number
  assignee?: string
}

export interface WatchdogAlert {
  id: string
  taskId: string
  shortId?: string
  alertType: 'warning' | 'stale' | 'failed' | 'retry_exhausted'
  message: string
  acknowledged: boolean
  createdAt: string
}

export interface WatchdogStatus {
  running: boolean
  enabled: boolean
  pollIntervalMs: number
  lastScan?: string
  tasksMonitored: number
}

export interface WatchdogConfig {
  id: string
  name: string
  type: 'priority' | 'task_type' | 'global'
  warningThresholdMs: number
  staleThresholdMs: number
  failureThresholdMs: number
  heartbeatIntervalMs: number
  missedHeartbeats: number
  maxRetries: number
  retryDelayMs: number
  alertOnWarning: boolean
  alertOnStale: boolean
  alertOnFailure: boolean
}

// Hooks

/**
 * Hook for watchdog service status
 */
export function useWatchdogStatus() {
  return useQuery({
    queryKey: ['watchdog', 'status'],
    queryFn: () => api.get('/watchdog/status').then(r => r.data as WatchdogStatus),
    refetchInterval: 10000,
  })
}

/**
 * Hook for overall health data (summary + task details)
 */
export function useWatchdogHealth() {
  return useQuery({
    queryKey: ['watchdog', 'health'],
    queryFn: () => api.get('/watchdog/health').then(r => r.data as {
      summary: WatchdogHealthSummary
      lastScan: string
      tasks: TaskHealth[]
    }),
    refetchInterval: 5000,
  })
}

/**
 * Hook for watchdog alerts
 */
export function useWatchdogAlerts(limit: number = 50) {
  return useQuery({
    queryKey: ['watchdog', 'alerts', limit],
    queryFn: () => api.get('/watchdog/alerts', { params: { limit } }).then(r => r.data as {
      alerts: WatchdogAlert[]
    }),
    refetchInterval: 10000,
  })
}

/**
 * Hook for individual task health
 */
export function useTaskHealth(taskId: string) {
  return useQuery({
    queryKey: ['watchdog', 'task', taskId],
    queryFn: () => api.get(`/watchdog/health/${taskId}`).then(r => r.data as TaskHealth),
    enabled: !!taskId,
  })
}

/**
 * Hook for watchdog configurations
 */
export function useWatchdogConfig() {
  return useQuery({
    queryKey: ['watchdog', 'config'],
    queryFn: () => api.get('/watchdog/config').then(r => r.data as {
      configs: WatchdogConfig[]
    }),
  })
}

/**
 * Mutation hooks for watchdog actions
 */
export function useWatchdogActions() {
  const queryClient = useQueryClient()

  const resetTask = useMutation({
    mutationFn: (taskId: string) => api.post(`/watchdog/reset/${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchdog'] })
    }
  })

  const extendDeadline = useMutation({
    mutationFn: ({ taskId, durationMs }: { taskId: string; durationMs: number }) => 
      api.post(`/watchdog/extend/${taskId}`, { durationMs }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchdog'] })
    }
  })

  const retryTask = useMutation({
    mutationFn: (taskId: string) => api.post(`/watchdog/retry/${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchdog'] })
    }
  })

  const acknowledgeAlert = useMutation({
    mutationFn: (alertId: string) => api.post(`/watchdog/alerts/${alertId}/ack`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchdog', 'alerts'] })
    }
  })

  const triggerScan = useMutation({
    mutationFn: () => api.post('/watchdog/scan'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchdog'] })
    }
  })

  return {
    resetTask,
    extendDeadline,
    retryTask,
    acknowledgeAlert,
    triggerScan,
  }
}
