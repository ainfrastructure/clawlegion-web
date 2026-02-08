'use client'

import { useQuery } from '@tanstack/react-query'
import { Cpu, HardDrive, Activity, Server, Clock } from 'lucide-react'
import api from '@/lib/api'

interface ServerMetricsData {
  cpu: { usage: number; cores: number; model: string }
  memory: { total: number; used: number; free: number; usagePercent: number }
  uptime: { system: number; process: number }
  platform: { type: string; release: string; hostname: string }
  load: number[]
}

function formatBytes(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024)
  return `${gb.toFixed(1)} GB`
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

export function ServerMetrics() {
  const { data: metrics, isLoading } = useQuery<ServerMetricsData>({
    queryKey: ['server-metrics'],
    queryFn: async () => {
      const res = await api.get('/server-metrics')
      return res.data
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  })

  if (isLoading || !metrics) {
    return <div className="animate-pulse bg-slate-800 rounded-lg h-32" />
  }

  const memoryColor =
    metrics.memory.usagePercent > 80
      ? 'text-red-400'
      : metrics.memory.usagePercent > 60
        ? 'text-yellow-400'
        : 'text-green-400'
  const cpuColor =
    metrics.cpu.usage > 80
      ? 'text-red-400'
      : metrics.cpu.usage > 60
        ? 'text-yellow-400'
        : 'text-green-400'

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-white/[0.06]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-200 flex items-center gap-2">
          <Server className="w-4 h-4" />
          Server Metrics
        </h3>
        <span className="text-xs text-slate-500">{metrics.platform.hostname}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* CPU */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <Cpu className="w-3 h-3" /> CPU
          </div>
          <div className={`text-lg font-semibold ${cpuColor}`}>{metrics.cpu.usage}%</div>
          <div className="text-xs text-slate-500">{metrics.cpu.cores} cores</div>
        </div>

        {/* Memory */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <HardDrive className="w-3 h-3" /> Memory
          </div>
          <div className={`text-lg font-semibold ${memoryColor}`}>
            {metrics.memory.usagePercent}%
          </div>
          <div className="text-xs text-slate-500">
            {formatBytes(metrics.memory.used)} / {formatBytes(metrics.memory.total)}
          </div>
        </div>

        {/* Load */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <Activity className="w-3 h-3" /> Load (1/5/15m)
          </div>
          <div className="text-lg font-semibold text-slate-200">
            {metrics.load[0].toFixed(2)}
          </div>
          <div className="text-xs text-slate-500">
            {metrics.load.map((l) => l.toFixed(2)).join(' / ')}
          </div>
        </div>

        {/* Uptime */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <Clock className="w-3 h-3" /> Uptime
          </div>
          <div className="text-lg font-semibold text-slate-200">
            {formatUptime(metrics.uptime.system)}
          </div>
          <div className="text-xs text-slate-500">
            API: {formatUptime(metrics.uptime.process)}
          </div>
        </div>
      </div>

      {/* Memory bar */}
      <div className="mt-3">
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              metrics.memory.usagePercent > 80
                ? 'bg-red-500'
                : metrics.memory.usagePercent > 60
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
            }`}
            style={{ width: `${metrics.memory.usagePercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default ServerMetrics
