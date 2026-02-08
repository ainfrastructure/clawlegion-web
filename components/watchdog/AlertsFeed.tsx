'use client'

import { useState } from 'react'
import { 
  AlertTriangle, 
  Clock, 
  XCircle, 
  Check, 
  Bell,
  ChevronRight,
  RotateCcw
} from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

interface WatchdogAlert {
  id: string
  taskId: string
  shortId?: string
  alertType: 'warning' | 'stale' | 'failed' | 'retry_exhausted'
  message: string
  acknowledged: boolean
  createdAt: string
}

interface AlertsFeedProps {
  alerts: WatchdogAlert[]
  isLoading?: boolean
  onViewTask?: (taskId: string) => void
}

const alertConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  warning: {
    icon: <AlertTriangle size={16} />,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20'
  },
  stale: {
    icon: <Clock size={16} />,
    color: 'text-orange-400',
    bg: 'bg-orange-500/20'
  },
  failed: {
    icon: <XCircle size={16} />,
    color: 'text-red-400',
    bg: 'bg-red-500/20'
  },
  retry_exhausted: {
    icon: <RotateCcw size={16} />,
    color: 'text-red-400',
    bg: 'bg-red-500/20'
  }
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return `${seconds}s ago`
}

export function AlertsFeed({ alerts, isLoading, onViewTask }: AlertsFeedProps) {
  const [showAcknowledged, setShowAcknowledged] = useState(false)
  const queryClient = useQueryClient()

  const acknowledgeMutation = useMutation({
    mutationFn: (alertId: string) => api.post(`/watchdog/alerts/${alertId}/ack`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watchdog', 'alerts'] })
  })

  const filteredAlerts = showAcknowledged 
    ? alerts 
    : alerts.filter(a => !a.acknowledged)

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length

  return (
    <div className="glass-2 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-slate-400" />
            <h3 className="font-semibold text-white">Alerts</h3>
            {unacknowledgedCount > 0 && (
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
                {unacknowledgedCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowAcknowledged(!showAcknowledged)}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            {showAcknowledged ? 'Hide acknowledged' : 'Show all'}
          </button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 animate-pulse">
            Loading alerts...
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-8 text-center">
            <Bell size={32} className="mx-auto text-slate-600 mb-3" />
            <div className="text-slate-400">No alerts</div>
            <div className="text-sm text-slate-500 mt-1">
              {showAcknowledged ? 'No watchdog alerts recorded' : 'All alerts acknowledged'}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {filteredAlerts.map((alert) => {
              const config = alertConfig[alert.alertType] || alertConfig.warning
              return (
                <div 
                  key={alert.id}
                  className={`p-4 transition-colors ${alert.acknowledged ? 'opacity-60' : 'hover:bg-slate-800/50'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${config.bg}`}>
                      <span className={config.color}>{config.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`text-xs font-medium uppercase ${config.color}`}>
                          {alert.alertType.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatTimeAgo(alert.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 mb-2">{alert.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          Task: {alert.shortId || alert.taskId.slice(0, 8)}
                        </span>
                        <div className="flex items-center gap-2">
                          {onViewTask && (
                            <button
                              onClick={() => onViewTask(alert.taskId)}
                              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                              View <ChevronRight size={12} />
                            </button>
                          )}
                          {!alert.acknowledged && (
                            <button
                              onClick={() => acknowledgeMutation.mutate(alert.id)}
                              disabled={acknowledgeMutation.isPending}
                              className="p-1 hover:bg-slate-700 rounded transition-colors"
                              title="Acknowledge alert"
                            >
                              <Check size={14} className="text-green-400" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default AlertsFeed
