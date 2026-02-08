'use client'

import { Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Activity, 
  Settings, 
  Play, 
  Pause, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { PageContainer } from '@/components/layout'
import { 
  HealthOverview, 
  TaskHealthTable, 
  AlertsFeed,
  WatchdogStatusBadge 
} from '@/components/watchdog'
import { 
  useWatchdogHealth, 
  useWatchdogAlerts, 
  useWatchdogStatus,
  useWatchdogActions 
} from '@/hooks/useWatchdog'

export default function WatchdogPage() {
  return (
    <Suspense fallback={
      <PageContainer>
        <div className="text-center text-slate-400 py-12">Loading watchdog...</div>
      </PageContainer>
    }>
      <WatchdogPageContent />
    </Suspense>
  )
}

function WatchdogPageContent() {
  const router = useRouter()
  const { data: healthData, isLoading: healthLoading, refetch: refetchHealth } = useWatchdogHealth()
  const { data: alertsData, isLoading: alertsLoading } = useWatchdogAlerts()
  const { data: statusData } = useWatchdogStatus()
  const { triggerScan } = useWatchdogActions()

  const handleViewTask = (taskId: string) => {
    router.push(`/tasks?taskId=${taskId}`)
  }

  const handleManualScan = () => {
    triggerScan.mutate()
    refetchHealth()
  }

  // Default summary if no data
  const summary = healthData?.summary ?? {
    total: 0,
    healthy: 0,
    warning: 0,
    stale: 0,
    failed: 0
  }

  const tasks = healthData?.tasks ?? []
  const alerts = alertsData?.alerts ?? []

  // Calculate if there are issues
  const hasIssues = summary.warning > 0 || summary.stale > 0 || summary.failed > 0
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged).length

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <Activity className={hasIssues ? 'text-orange-400' : 'text-green-400'} size={28} />
              Task Watchdog
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Monitor task health and detect stuck or failing tasks
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Service Status */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              statusData?.running 
                ? 'bg-green-500/20 border border-green-500/30' 
                : 'bg-slate-700 border border-slate-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${statusData?.running ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`} />
              <span className={`text-sm ${statusData?.running ? 'text-green-400' : 'text-slate-400'}`}>
                {statusData?.running ? 'Monitoring Active' : 'Monitoring Paused'}
              </span>
            </div>

            {/* Manual Scan Button */}
            <button
              onClick={handleManualScan}
              disabled={triggerScan.isPending}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCw size={16} className={triggerScan.isPending ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Scan Now</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Banner */}
        {hasIssues && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle size={24} className="text-orange-400" />
              <div>
                <div className="font-medium text-white">Attention Required</div>
                <div className="text-sm text-slate-400">
                  {summary.failed > 0 && `${summary.failed} failed task${summary.failed > 1 ? 's' : ''}`}
                  {summary.failed > 0 && summary.stale > 0 && ', '}
                  {summary.stale > 0 && `${summary.stale} stale task${summary.stale > 1 ? 's' : ''}`}
                  {(summary.failed > 0 || summary.stale > 0) && summary.warning > 0 && ', '}
                  {summary.warning > 0 && `${summary.warning} warning${summary.warning > 1 ? 's' : ''}`}
                  {unacknowledgedAlerts > 0 && ` • ${unacknowledgedAlerts} unacknowledged alert${unacknowledgedAlerts > 1 ? 's' : ''}`}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Health Overview and Task Table */}
        <div className="lg:col-span-2 space-y-6">
          <HealthOverview 
            summary={summary}
            lastScan={healthData?.lastScan}
            isLoading={healthLoading}
            onRefresh={refetchHealth}
          />
          
          <TaskHealthTable 
            tasks={tasks}
            isLoading={healthLoading}
          />
        </div>

        {/* Right Column - Alerts Feed */}
        <div className="space-y-6">
          <AlertsFeed 
            alerts={alerts}
            isLoading={alertsLoading}
            onViewTask={handleViewTask}
          />

          {/* Monitoring Info Card */}
          <div className="glass-2 rounded-xl p-4">
            <h4 className="font-medium text-white mb-3 flex items-center gap-2">
              <Clock size={16} className="text-slate-400" />
              Monitoring Settings
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Scan interval:</span>
                <span className="text-slate-300">
                  {statusData?.pollIntervalMs 
                    ? `${statusData.pollIntervalMs / 1000}s` 
                    : '30s'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tasks monitored:</span>
                <span className="text-slate-300">{statusData?.tasksMonitored ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className={statusData?.enabled ? 'text-green-400' : 'text-slate-400'}>
                  {statusData?.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          {/* Legend Card */}
          <div className="glass-2 rounded-xl p-4">
            <h4 className="font-medium text-white mb-3">Status Legend</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <WatchdogStatusBadge status="healthy" size="sm" />
                <span className="text-xs text-slate-400">Task running normally</span>
              </div>
              <div className="flex items-center gap-2">
                <WatchdogStatusBadge status="warning" size="sm" />
                <span className="text-xs text-slate-400">Missed heartbeats detected</span>
              </div>
              <div className="flex items-center gap-2">
                <WatchdogStatusBadge status="stale" size="sm" />
                <span className="text-xs text-slate-400">Task may be stuck</span>
              </div>
              <div className="flex items-center gap-2">
                <WatchdogStatusBadge status="failed" size="sm" />
                <span className="text-xs text-slate-400">Auto-failed or timeout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
