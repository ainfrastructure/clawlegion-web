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
  healthy: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/20' },
  degraded: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  unhealthy: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
}

export default function HealthPage() {
  const [data, setData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)

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
    }
  }, [])

  useEffect(() => {
    fetchHealth()
    const interval = setInterval(fetchHealth, 15000)
    return () => clearInterval(interval)
  }, [fetchHealth])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-bold text-white">System Health</h1>
        </div>
        <button
          onClick={() => { setLoading(true); fetchHealth() }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {data && (
        <>
          {/* Overall Status */}
          <div className={`rounded-lg p-4 mb-6 ${
            data.status === 'healthy' ? 'bg-green-500/10 border border-green-500/30' :
            data.status === 'degraded' ? 'bg-yellow-500/10 border border-yellow-500/30' :
            'bg-red-500/10 border border-red-500/30'
          }`}>
            <div className="flex items-center gap-2">
              {data.status === 'healthy' ? <CheckCircle2 className="w-5 h-5 text-green-400" /> :
               data.status === 'degraded' ? <AlertTriangle className="w-5 h-5 text-yellow-400" /> :
               <XCircle className="w-5 h-5 text-red-400" />}
              <span className="text-lg font-semibold text-white capitalize">{data.status}</span>
              <span className="text-sm text-slate-400 ml-auto">
                {data.summary.healthy}/{data.summary.total} services healthy · avg {data.summary.avgLatencyMs}ms
              </span>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-3">
            {data.services.map((service) => {
              const config = statusConfig[service.status] || statusConfig.unhealthy
              const Icon = config.icon
              return (
                <div key={service.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded ${config.bg}`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <span className="text-white font-medium">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    {service.latencyMs !== undefined && (
                      <span className="text-slate-400">{service.latencyMs}ms</span>
                    )}
                    {service.error && (
                      <span className="text-red-400">{service.error}</span>
                    )}
                    <span className={`capitalize ${config.color}`}>{service.status}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {loading && !data && (
        <div className="flex items-center justify-center h-40 text-slate-400">
          Loading health status...
        </div>
      )}
    </div>
  )
}
