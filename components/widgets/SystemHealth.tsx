'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Activity, Server, Database, Wifi, 
  CheckCircle2, AlertTriangle, XCircle, RefreshCw 
} from 'lucide-react'

interface ServiceStatus {
  name: string
  status: 'healthy' | 'degraded' | 'down'
  latency?: number
  lastCheck?: string
  message?: string
}

interface SystemHealthProps {
  services?: ServiceStatus[]
  onRefresh?: () => void
  autoRefresh?: boolean
  refreshInterval?: number
  className?: string
}

const statusConfig = {
  healthy: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Healthy' },
  degraded: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Degraded' },
  down: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Down' },
}

const defaultServices: ServiceStatus[] = [
  { name: 'API Server', status: 'healthy', latency: 45 },
  { name: 'Database', status: 'healthy', latency: 12 },
  { name: 'WebSocket', status: 'healthy', latency: 8 },
  { name: 'Agent Service', status: 'healthy', latency: 23 },
]

export function SystemHealth({
  services = defaultServices,
  onRefresh,
  autoRefresh = true,
  refreshInterval = 30000,
  className = ''
}: SystemHealthProps) {
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    onRefresh?.()
    await new Promise(r => setTimeout(r, 500))
    setLastRefresh(new Date())
    setRefreshing(false)
  }, [onRefresh])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      handleRefresh()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, handleRefresh])

  const overallStatus = services.some(s => s.status === 'down') 
    ? 'down' 
    : services.some(s => s.status === 'degraded')
    ? 'degraded'
    : 'healthy'

  const overallConfig = statusConfig[overallStatus]
  const OverallIcon = overallConfig.icon

  return (
    <div className={`bg-slate-800/50 rounded-lg ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${overallConfig.bg}`}>
            <OverallIcon className={`w-5 h-5 ${overallConfig.color}`} />
          </div>
          <div>
            <h3 className="font-semibold">System Health</h3>
            <p className={`text-xs ${overallConfig.color}`}>{overallConfig.label}</p>
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh status"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="divide-y divide-white/[0.06]">
        {services.map((service, i) => {
          const config = statusConfig[service.status]
          const Icon = config.icon
          
          return (
            <div
              key={service.name}
              className="flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${config.color}`} />
                <div>
                  <div className="font-medium text-sm">{service.name}</div>
                  {service.message && (
                    <div className="text-xs text-slate-500">{service.message}</div>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                {service.latency !== undefined && (
                  <div className="text-sm text-slate-400">{service.latency}ms</div>
                )}
                <div className={`text-xs ${config.color}`}>{config.label}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="px-4 py-2 border-t border-white/[0.06] text-[10px] text-slate-500 text-center">
        Last checked: {lastRefresh.toLocaleTimeString()}
      </div>
    </div>
  )
}
