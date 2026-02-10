'use client'

import { useState, useEffect, useCallback } from 'react'
import { Activity, RefreshCw, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

interface ServiceStatus {
  name: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  latencyMs?: number
  error?: string
}

interface HealthData {
  status: string
  timestamp: string
  summary: {
    healthy: number
    degraded: number
    unhealthy: number
    total: number
    avgLatencyMs: number
  }
  services: ServiceStatus[]
}

const statusConfig = {
  healthy: {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20',
    bar: 'bg-emerald-500',
    glow: 'shadow-glow-emerald',
    ring: 'border-emerald-500/60',
    ringGlow: 'shadow-[0_0_40px_-8px_rgb(16_185_129/0.4)]',
    gradient: 'from-emerald-500/20 to-emerald-500/5',
    label: 'Healthy',
    tagline: 'All systems operational',
  },
  degraded: {
    icon: AlertTriangle,
    color: 'text-yellow-400',
    dot: 'bg-yellow-400',
    badge: 'bg-yellow-500/15 text-yellow-400 ring-1 ring-yellow-500/20',
    bar: 'bg-yellow-500',
    glow: '',
    ring: 'border-yellow-500/60',
    ringGlow: 'shadow-[0_0_40px_-8px_rgb(234_179_8/0.4)]',
    gradient: 'from-yellow-500/20 to-yellow-500/5',
    label: 'Degraded',
    tagline: 'Some services experiencing issues',
  },
  unhealthy: {
    icon: XCircle,
    color: 'text-red-400',
    dot: 'bg-red-400',
    badge: 'bg-red-500/15 text-red-400 ring-1 ring-red-500/20',
    bar: 'bg-red-500',
    glow: '',
    ring: 'border-red-500/60',
    ringGlow: 'shadow-[0_0_40px_-8px_rgb(239_68_68/0.4)]',
    gradient: 'from-red-500/20 to-red-500/5',
    label: 'Unhealthy',
    tagline: 'Critical services are down',
  },
}

function formatServiceName(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getLatencyColor(ms: number): string {
  if (ms < 100) return 'bg-emerald-500'
  if (ms < 300) return 'bg-yellow-500'
  return 'bg-red-500'
}

function getLatencyPercent(ms: number): number {
  // Scale: 0-500ms maps to 0-100%, capped at 100%
  return Math.min((ms / 500) * 100, 100)
}

export default function HealthPage() {
  const [data, setData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health-check')
      if (res.ok) {
        setData(await res.json())
      }
    } catch (err) {
      console.error('Failed to fetch health:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchHealth()
    const interval = setInterval(fetchHealth, 15000)
    return () => clearInterval(interval)
  }, [fetchHealth])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchHealth()
  }

  const overallConfig = data
    ? statusConfig[data.status as keyof typeof statusConfig] || statusConfig.unhealthy
    : statusConfig.healthy

  const OverallIcon = overallConfig.icon

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header Row */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <div className="flex items-center gap-3">
            <Activity className="w-7 h-7 text-blue-400" />
            <h1 className="heading-xl">System Health</h1>
          </div>
          {data && (
            <p className="text-label font-mono mt-1.5 ml-10">
              Last checked {new Date(data.timestamp).toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={handleRefresh}
          className="glass-1 flex items-center gap-2 px-4 py-2 rounded-full text-sm text-slate-300 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Loading State */}
      {loading && !data && (
        <div className="glass-2 rounded-2xl p-12 flex flex-col items-center justify-center gap-3 animate-fade-in-up animate-delay-100">
          <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
          <p className="text-slate-400 text-sm">Checking system vitals...</p>
        </div>
      )}

      {data && (
        <>
          {/* Overall Status Hero Card */}
          <div
            className={`glass-3 rounded-2xl p-8 animate-fade-in-up animate-delay-100 ${
              data.status === 'healthy' ? 'shadow-glow-emerald' : ''
            }`}
          >
            <div className="flex flex-col items-center gap-6">
              {/* Animated Status Ring */}
              <div className="relative flex items-center justify-center">
                <div
                  className={`w-[120px] h-[120px] rounded-full border-[3px] ${overallConfig.ring} animate-pulse-slow ${overallConfig.ringGlow}`}
                />
                <div
                  className={`absolute inset-3 rounded-full bg-gradient-to-br ${overallConfig.gradient}`}
                />
                <OverallIcon
                  className={`absolute w-10 h-10 ${overallConfig.color}`}
                />
              </div>

              {/* Status Text */}
              <div className="text-center">
                <h2 className="heading-lg">{overallConfig.label}</h2>
                <p className="text-slate-400 text-sm mt-1">{overallConfig.tagline}</p>
              </div>

              {/* Summary Stats */}
              <div className="flex items-center gap-8 sm:gap-12 pt-2">
                <div className="text-center">
                  <p className="stat-value text-2xl text-white">{data.summary.healthy}</p>
                  <p className="text-label mt-1">Healthy</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="stat-value text-2xl text-white">{data.summary.avgLatencyMs}<span className="text-sm text-slate-400 ml-0.5">ms</span></p>
                  <p className="text-label mt-1">Avg Latency</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="stat-value text-2xl text-white">{data.summary.total}</p>
                  <p className="text-label mt-1">Total Services</p>
                </div>
              </div>
            </div>
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.services.map((service, i) => {
              const config = statusConfig[service.status] || statusConfig.unhealthy
              const delayClasses = [
                'animate-delay-200',
                'animate-delay-300',
                'animate-delay-300',
                'animate-delay-400',
                'animate-delay-400',
                'animate-delay-500',
                'animate-delay-500',
                'animate-delay-500',
              ]

              return (
                <div
                  key={service.name}
                  className={`glass-2 rounded-xl glass-gradient-border p-5 animate-fade-in-up ${delayClasses[i] || 'animate-delay-500'} hover:-translate-y-0.5 transition-all duration-200`}
                >
                  {/* Status Row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${config.dot} ${
                          service.status === 'healthy' ? 'animate-pulse-slow' : ''
                        }`}
                      />
                      <span className="text-white font-medium text-sm">
                        {formatServiceName(service.name)}
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${config.badge}`}
                    >
                      {config.label}
                    </span>
                  </div>

                  {/* Latency Bar */}
                  {service.latencyMs !== undefined && (
                    <div className="mt-3">
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getLatencyColor(service.latencyMs)} transition-all duration-500`}
                          style={{ width: `${getLatencyPercent(service.latencyMs)}%` }}
                        />
                      </div>
                      <p className="stat-value text-lg text-white mt-2">
                        {service.latencyMs}<span className="text-xs text-slate-400 ml-0.5">ms</span>
                      </p>
                    </div>
                  )}

                  {/* Error Text */}
                  {service.error && (
                    <p className="text-xs text-red-400/80 mt-2 truncate">
                      {service.error}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
