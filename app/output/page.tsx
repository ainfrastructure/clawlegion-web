'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { MetricCard } from '@/components/ui/MetricCard'
import {
  CheckCircle2,
  Star,
  Clock,
  LayoutGrid,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import type { DashboardMetrics } from '@/types/common'

function formatHours(hours: number): string {
  if (hours >= 1000) return `${(hours / 1000).toFixed(1)}k`
  return hours.toString()
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`
  return `$${amount}`
}

function TrendIndicator({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return null
  const change = ((current - previous) / previous) * 100
  const isPositive = change >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
      {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {Math.abs(change).toFixed(0)}%
    </span>
  )
}

function WeeklyChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1)

  return (
    <div className="flex items-end gap-1 h-20">
      {data.map((value, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-amber-500/30 rounded-t transition-all hover:bg-amber-500/50"
            style={{ height: `${(value / max) * 100}%`, minHeight: value > 0 ? '4px' : '0' }}
          />
          <span className="text-[10px] text-slate-600">{value}</span>
        </div>
      ))}
    </div>
  )
}

function QualityBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300 font-medium">{value}%</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

function WorkspaceBreakdown({ byType }: { byType: Record<string, number> }) {
  const typeLabels: Record<string, { label: string; emoji: string }> = {
    code: { label: 'Code', emoji: '💻' },
    research: { label: 'Research', emoji: '🔬' },
    content: { label: 'Content', emoji: '✍️' },
    operations: { label: 'Operations', emoji: '⚙️' },
    custom: { label: 'Custom', emoji: '🧩' },
  }

  const entries = Object.entries(byType).filter(([, count]) => count > 0)
  if (entries.length === 0) return null

  return (
    <div className="space-y-2">
      {entries.map(([type, count]) => {
        const info = typeLabels[type] || { label: type, emoji: '📦' }
        return (
          <div key={type} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>{info.emoji}</span>
              <span className="text-sm text-slate-300">{info.label}</span>
            </div>
            <span className="text-sm font-medium text-slate-200">{count}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function OutputPage() {
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ['metrics', 'dashboard'],
    queryFn: async () => {
      const res = await api.get('/metrics/dashboard')
      return res.data
    },
    refetchInterval: 30000,
  })

  if (isLoading || !metrics) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Output</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-slate-800 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Output</h1>
        <p className="text-sm text-slate-400 mt-1">Track what got done, how good it is, and value delivered</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<CheckCircle2 className="w-8 h-8 text-green-400" />}
          label="Tasks Completed"
          value={metrics.volume.completedTasks}
          subtext={
            metrics.volume.tasksCompletedThisWeek > 0
              ? `${metrics.volume.tasksCompletedThisWeek} this week`
              : undefined
          }
        />
        <MetricCard
          icon={<Star className="w-8 h-8 text-amber-400" />}
          label="Avg Quality Score"
          value={metrics.quality.avgDeliverableScore != null ? `${metrics.quality.avgDeliverableScore}/100` : 'N/A'}
          subtext={`${metrics.quality.avgVerificationPassRate}% pass rate`}
        />
        <MetricCard
          icon={<Clock className="w-8 h-8 text-blue-400" />}
          label="Hours Saved"
          value={formatHours(metrics.roi.estimatedHoursSaved)}
          subtext={`${formatCurrency(metrics.roi.estimatedValueSaved)} value`}
        />
        <MetricCard
          icon={<LayoutGrid className="w-8 h-8 text-purple-400" />}
          label="Active Workspaces"
          value={metrics.workspaces.total}
          subtext={`${Object.keys(metrics.workspaces.byType).length} types`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Throughput */}
        <div className="glass-2 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-medium text-slate-200">Weekly Throughput</h3>
            </div>
            <TrendIndicator
              current={metrics.volume.tasksCompletedThisWeek}
              previous={metrics.volume.tasksCompletedLastWeek}
            />
          </div>
          <WeeklyChart data={metrics.volume.weeklyThroughput} />
          <div className="flex justify-between mt-2 text-[10px] text-slate-600">
            <span>8 weeks ago</span>
            <span>This week</span>
          </div>
        </div>

        {/* Quality Metrics */}
        <div className="glass-2 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-medium text-slate-200">Quality Metrics</h3>
          </div>
          <div className="space-y-4">
            <QualityBar
              label="Verification Pass Rate"
              value={metrics.quality.avgVerificationPassRate}
              color="bg-green-500"
            />
            <QualityBar
              label="Agent Utilization"
              value={metrics.efficiency.agentUtilizationRate}
              color="bg-blue-500"
            />
            <QualityBar
              label="Rework Rate"
              value={metrics.quality.reworkRate}
              color="bg-red-500"
            />
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] text-xs text-slate-500">
            {metrics.quality.totalVerifications} total verifications &middot;{' '}
            {metrics.efficiency.activeAgents}/{metrics.efficiency.totalAgents} agents active
            {metrics.efficiency.avgTimeToCompleteHours != null && (
              <> &middot; ~{metrics.efficiency.avgTimeToCompleteHours}h avg completion</>
            )}
          </div>
        </div>
      </div>

      {/* Workspace Breakdown */}
      {Object.keys(metrics.workspaces.byType).length > 0 && (
        <div className="glass-2 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <LayoutGrid className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-medium text-slate-200">Workspaces by Domain</h3>
          </div>
          <WorkspaceBreakdown byType={metrics.workspaces.byType} />
        </div>
      )}

      {/* ROI Summary */}
      <div className="glass-2 rounded-xl p-5">
        <h3 className="text-sm font-medium text-slate-200 mb-3">ROI Estimate</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{metrics.roi.tasksCompleted}</div>
            <div className="text-xs text-slate-500">Tasks Done</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{formatHours(metrics.roi.estimatedHoursSaved)}</div>
            <div className="text-xs text-slate-500">Hours Saved</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-400">${metrics.roi.hourlyRate}/hr</div>
            <div className="text-xs text-slate-500">Rate Used</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">{formatCurrency(metrics.roi.estimatedValueSaved)}</div>
            <div className="text-xs text-slate-500">Value Saved</div>
          </div>
        </div>
      </div>
    </div>
  )
}
