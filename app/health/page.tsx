'use client'

import { useQuery } from '@tanstack/react-query'
import {
  Activity, CheckCircle, AlertTriangle, XCircle,
  Server, Database, Users, Cpu, HardDrive,
  RefreshCw, Clock, HeartPulse, Gauge, ListTodo,
  Zap, BarChart3
} from 'lucide-react'
import { useState } from 'react'

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

function StatusIcon({ status, size = 'md' }: { status: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
  switch (status) {
    case 'healthy':
      return <CheckCircle className={`${sizeClass} text-green-400`} />
    case 'degraded':
      return <AlertTriangle className={`${sizeClass} text-yellow-400`} />
    case 'unhealthy':
    case 'down':
      return <XCircle className={`${sizeClass} text-red-400`} />
    default:
      return <Activity className={`${sizeClass} text-gray-400`} />
  }
}

function getIconForCheck(name: string) {
  switch (name) {
    case 'api_server': return Server
    case 'database': return Database
    case 'agents': return Users
    case 'memory': return HardDrive
    case 'cpu': return Cpu
    case 'event_loop': return Gauge
    case 'task_queue': return ListTodo
    default: return Activity
  }
}

function statusColor(status: string) {
  switch (status) {
    case 'healthy': return 'text-green-400'
    case 'degraded': return 'text-yellow-400'
    case 'unhealthy':
    case 'down': return 'text-red-400'
    default: return 'text-slate-400'
  }
}

function statusBg(status: string) {
  switch (status) {
    case 'healthy': return 'bg-green-500/10 border-green-500/20'
    case 'degraded': return 'bg-yellow-500/10 border-yellow-500/20'
    case 'unhealthy':
    case 'down': return 'bg-red-500/10 border-red-500/20'
    default: return 'bg-slate-500/10 border-slate-500/20'
  }
}

export default function HealthPage() {
  const [autoRefresh, setAutoRefresh] = useState(true)

  const { data: apiHealth, isLoading: apiLoading, refetch: refetchApi } = useQuery<any>({
    queryKey: ['api-health'],
    queryFn: async () => {
      const res = await fetch('/api/health/status')
      if (!res.ok) throw new Error('API health check failed')
      return res.json()
    },
    refetchInterval: autoRefresh ? 10000 : false,
  })

  const { data: dashHealth, isLoading: dashLoading, refetch: refetchDash } = useQuery<any>({
    queryKey: ['dashboard-health'],
    queryFn: async () => {
      const res = await fetch('/api/health/dashboard')
      if (!res.ok) throw new Error('Dashboard health check failed')
      return res.json()
    },
    refetchInterval: autoRefresh ? 10000 : false,
  })

  const refreshAll = () => {
    refetchApi()
    refetchDash()
  }

  const overallStatus = apiHealth?.status === 'healthy' && dashHealth?.status === 'healthy'
    ? 'healthy'
    : apiHealth?.status === 'unhealthy' || dashHealth?.status === 'down'
      ? 'unhealthy'
      : 'degraded'

  const checks = apiHealth?.checks || []
  const memCheck = checks.find((c: any) => c.name === 'memory')
  const cpuCheck = checks.find((c: any) => c.name === 'cpu')
  const elCheck = checks.find((c: any) => c.name === 'event_loop')
  const tqCheck = checks.find((c: any) => c.name === 'task_queue')
  const processInfo = apiHealth?.process

  const services = dashHealth?.services || []

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <HeartPulse className="w-7 h-7 sm:w-8 sm:h-8 text-green-400" />
            System Health
          </h1>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">Real-time system monitoring and diagnostics</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded bg-slate-800 border-white/[0.06]"
            />
            Auto-refresh
          </label>
          <button
            onClick={refreshAll}
            className="px-3 py-2 glass-2 hover:bg-white/[0.08] rounded-lg font-medium flex items-center gap-2 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Overall Status Banner */}
      <div className={`mb-6 p-4 sm:p-6 rounded-xl glass-2 border ${statusBg(overallStatus)}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <StatusIcon status={overallStatus} size="lg" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold capitalize">
                System {overallStatus}
              </h2>
              <p className="text-sm text-slate-400">
                {apiHealth?.summary?.healthy || 0} of {apiHealth?.summary?.total || 0} checks passing
              </p>
            </div>
          </div>
          <div className="text-sm text-slate-400">
            <p className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Uptime: {apiHealth?.uptime ? formatUptime(apiHealth.uptime) : '--'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Last check: {apiHealth?.timestamp ? new Date(apiHealth.timestamp).toLocaleTimeString() : '--'}
            </p>
          </div>
        </div>
      </div>

      {/* Health Checks Grid */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          Health Checks
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {apiLoading ? (
            Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="glass-2 rounded-xl p-4 animate-pulse">
                <div className="h-5 bg-slate-800 rounded w-3/4 mb-3" />
                <div className="h-4 bg-slate-800 rounded w-1/2" />
              </div>
            ))
          ) : (
            checks.map((check: any) => {
              const Icon = getIconForCheck(check.name)
              return (
                <div key={check.name} className={`glass-2 rounded-xl p-4 border ${statusBg(check.status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-sm capitalize">{check.name.replace(/_/g, ' ')}</span>
                    </div>
                    <StatusIcon status={check.status} size="sm" />
                  </div>
                  {check.latencyMs !== undefined && (
                    <p className="text-xs text-slate-500">
                      Latency: <span className="text-slate-300 font-mono">{check.latencyMs}ms</span>
                    </p>
                  )}
                  {check.error && (
                    <p className="text-xs text-red-400 mt-1 truncate">{check.error}</p>
                  )}
                </div>
              )
            })
          )}
        </div>
      </section>

      {/* Two-column layout: System Resources + Task Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* System Resources */}
        <section className="glass-2 rounded-xl p-4 sm:p-5">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            System Resources
          </h2>
          <div className="space-y-4">
            {/* Memory */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-slate-400">Heap Memory</span>
                <span className="text-sm font-mono text-white">
                  {memCheck?.details?.heapUsedMB ?? '--'}MB / {memCheck?.details?.heapTotalMB ?? '--'}MB
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${
                    (memCheck?.details?.heapPercent ?? 0) > 90 ? 'bg-red-500' :
                    (memCheck?.details?.heapPercent ?? 0) > 75 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${memCheck?.details?.heapPercent ?? 0}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-slate-500">{memCheck?.details?.heapPercent ?? 0}% used</span>
                <span className="text-xs text-slate-500">RSS: {memCheck?.details?.rssMB ?? '--'}MB</span>
              </div>
            </div>

            {/* CPU */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-slate-400">CPU Usage</span>
                <span className={`text-sm font-mono ${statusColor(cpuCheck?.status ?? 'healthy')}`}>
                  {cpuCheck?.details?.cpuPercent ?? '--'}%
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${
                    (cpuCheck?.details?.cpuPercent ?? 0) > 90 ? 'bg-red-500' :
                    (cpuCheck?.details?.cpuPercent ?? 0) > 70 ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(cpuCheck?.details?.cpuPercent ?? 0, 100)}%` }}
                />
              </div>
            </div>

            {/* Event Loop */}
            {elCheck && (
              <div className="flex items-center justify-between py-2 border-t border-white/[0.06]">
                <div>
                  <span className="text-sm text-slate-400">Event Loop Delay</span>
                  <p className="text-xs text-slate-500 mt-0.5">p99 latency for event processing</p>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-mono font-semibold ${statusColor(elCheck.status)}`}>
                    {elCheck.details?.p99Ms ?? '--'}ms
                  </span>
                  <p className="text-xs text-slate-500">mean: {elCheck.details?.meanMs ?? '--'}ms</p>
                </div>
              </div>
            )}

            {/* OS Load Averages */}
            {processInfo?.loadAvg && (
              <div className="flex items-center justify-between py-2 border-t border-white/[0.06]">
                <span className="text-sm text-slate-400">Load Average</span>
                <div className="flex gap-3">
                  {processInfo.loadAvg.map((load: number, i: number) => (
                    <div key={i} className="text-center">
                      <span className="text-sm font-mono text-white">{load.toFixed(2)}</span>
                      <p className="text-xs text-slate-500">{['1m', '5m', '15m'][i]}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* System Memory */}
            {processInfo && (
              <div className="flex items-center justify-between py-2 border-t border-white/[0.06]">
                <span className="text-sm text-slate-400">System Memory</span>
                <span className="text-sm font-mono text-white">
                  {processInfo.freeMemoryMB ? `${Math.round(processInfo.totalMemoryMB - processInfo.freeMemoryMB)}MB` : '--'} / {processInfo.totalMemoryMB ?? '--'}MB
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Task Queue */}
        <section className="glass-2 rounded-xl p-4 sm:p-5">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-amber-400" />
            Task Queue
          </h2>
          {tqCheck ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-amber-400">{tqCheck.details?.queued ?? 0}</p>
                  <p className="text-xs text-slate-400 mt-1">Queue Depth</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-400">{tqCheck.details?.inProgress ?? 0}</p>
                  <p className="text-xs text-slate-400 mt-1">In Progress</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-400">{tqCheck.details?.completedLastHour ?? 0}</p>
                  <p className="text-xs text-slate-400 mt-1">Completed / hr</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-red-400">{tqCheck.details?.failedLastHour ?? 0}</p>
                  <p className="text-xs text-slate-400 mt-1">Failed / hr</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-t border-white/[0.06]">
                <span className="text-sm text-slate-400">Throughput</span>
                <span className="text-sm font-mono text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  {tqCheck.details?.throughputPerHour ?? 0} tasks/hr
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Queue Status</span>
                <span className={`text-sm font-medium capitalize ${statusColor(tqCheck.status)}`}>
                  {tqCheck.status}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-slate-400 text-center py-8 text-sm">
              {apiLoading ? 'Loading...' : 'No task queue data available'}
            </div>
          )}
        </section>
      </div>

      {/* Service Latency */}
      <section className="glass-2 rounded-xl p-4 sm:p-5">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          Service Latency
        </h2>
        {dashLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-slate-800 rounded w-1/4 mb-2" />
                <div className="h-6 bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        ) : services.length > 0 ? (
          <div className="space-y-3">
            {services.map((svc: any) => {
              const maxLatency = Math.max(...services.map((s: any) => s.latencyMs || 0), 1)
              const pct = ((svc.latencyMs || 0) / maxLatency) * 100
              const barColor = svc.status === 'healthy' ? 'bg-green-500'
                : svc.status === 'degraded' ? 'bg-yellow-500'
                : 'bg-red-500'

              return (
                <div key={svc.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <StatusIcon status={svc.status} size="sm" />
                      <span className="text-sm font-medium capitalize">{svc.name.replace(/-/g, ' ')}</span>
                    </div>
                    <span className="text-sm font-mono text-slate-300">
                      {svc.latencyMs != null ? `${svc.latencyMs}ms` : '--'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${barColor}`}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-slate-400 text-center py-6 text-sm">No service data available</div>
        )}

        {/* Process Info Footer */}
        {(processInfo || dashHealth?.process) && (
          <div className="mt-4 pt-4 border-t border-white/[0.06] flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
            {processInfo && (
              <>
                <span>API PID: {processInfo.pid}</span>
                <span>Node {processInfo.nodeVersion}</span>
                <span>{processInfo.platform}/{processInfo.arch}</span>
              </>
            )}
            {dashHealth?.process && (
              <>
                <span>Web PID: {dashHealth.process.pid}</span>
                <span>Web uptime: {formatUptime(dashHealth.process.uptime)}</span>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
