'use client'

import { Shield, RefreshCw } from 'lucide-react'
import { AlertsFeed } from '@/components/watchdog'
import { useWatchdogHealth, useWatchdogAlerts, useWatchdogStatus, useWatchdogActions } from '@/hooks/useWatchdog'

export default function WatchdogPage() {
  const { data: statusData } = useWatchdogStatus()
  const { data: healthData, isLoading: healthLoading } = useWatchdogHealth()
  const { data: alertsData, isLoading: alertsLoading } = useWatchdogAlerts()
  const { triggerScan } = useWatchdogActions()

  const summary = healthData?.summary

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">Watchdog</h1>
          {statusData && (
            <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
              statusData.running ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {statusData.running ? 'Running' : 'Stopped'}
            </span>
          )}
        </div>
        <button
          onClick={() => triggerScan.mutate()}
          disabled={triggerScan.isPending}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${triggerScan.isPending ? 'animate-spin' : ''}`} />
          Scan Now
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Healthy', value: summary.healthy, color: 'text-green-400' },
            { label: 'Warning', value: summary.warning, color: 'text-yellow-400' },
            { label: 'Stale', value: summary.stale, color: 'text-orange-400' },
            { label: 'Failed', value: summary.failed, color: 'text-red-400' },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-slate-900 border border-slate-800 p-3 text-center">
              <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
              <div className="text-xs text-slate-400 mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Alerts Feed */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white mb-3">Recent Alerts</h2>
        <AlertsFeed 
          alerts={alertsData?.alerts || []} 
          isLoading={alertsLoading}
        />
      </div>

      {/* Task Health Table */}
      {healthData?.tasks && healthData.tasks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Monitored Tasks</h2>
          <div className="space-y-2">
            {healthData.tasks.map((task) => (
              <div key={task.taskId} className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div>
                  <span className="text-white text-sm font-medium">{task.title}</span>
                  {task.shortId && <span className="text-slate-500 text-xs ml-2">#{task.shortId}</span>}
                  {task.assignee && <span className="text-slate-400 text-xs ml-2">→ {task.assignee}</span>}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  task.watchdogStatus === 'healthy' ? 'bg-green-500/20 text-green-400' :
                  task.watchdogStatus === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                  task.watchdogStatus === 'stale' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {task.watchdogStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {healthLoading && (
        <div className="flex items-center justify-center h-40 text-slate-400">
          Loading watchdog data...
        </div>
      )}
    </div>
  )
}
