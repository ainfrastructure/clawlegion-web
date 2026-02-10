'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { PageContainer } from '@/components/layout'
import { MetricCard } from '@/components/ui/MetricCard'
import { useMobile } from '@/hooks/useMobile'
import { useSidebar } from '@/components/layout/SidebarContext'
import Link from 'next/link'
import {
  Cpu,
  CheckCircle2,
  Users,
  ListTodo,
  ArrowRight,
  Bot,
  Shield,
  ShieldAlert,
  ShieldX,
  Star,
  Zap,
} from 'lucide-react'
import type { DashboardMetrics } from '@/types/common'

// Lazy load heavy components to reduce initial bundle size
const AgentCardWithActivity = dynamic(
  () => import('@/components/agents').then(mod => ({ default: mod.AgentCardWithActivity })),
  {
    loading: () => (
      <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-slate-700 rounded mb-2"></div>
        <div className="h-3 bg-slate-700 rounded w-3/4"></div>
      </div>
    ),
    ssr: false,
  }
)

const MobileAgentScroller = dynamic(
  () => import('@/components/dashboard').then(mod => ({ default: mod.MobileAgentScroller })),
  {
    loading: () => <div className="text-center py-4 text-slate-400">Loading agents...</div>,
    ssr: false,
  }
)

// Helper functions
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  if (days > 0) return `Up ${days}d ${hours}h`
  const mins = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `Up ${hours}h ${mins}m`
  return `Up ${mins}m`
}

// Optimized Easy Mode Dashboard with reduced API calls
function EasyModeDashboard() {
  // Combine related queries to reduce network requests
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const [boardRes, metricsRes] = await Promise.all([
        api.get('/tasks/board'),
        api.get('/metrics/dashboard').catch(() => ({ data: null })), // Graceful fallback
      ])
      return {
        board: boardRes.data,
        metrics: metricsRes.data,
      }
    },
    refetchInterval: 30000, // Reduced from 10s to 30s for better performance
    staleTime: 15000, // Cache for 15 seconds
  })

  const { board: boardData, metrics } = dashboardData || {}

  const columns = boardData?.columns ?? {}
  const activeTasks: any[] = [
    ...(columns['in_progress'] ?? []),
    ...(columns['building'] ?? []),
    ...(columns['researching'] ?? []),
    ...(columns['planning'] ?? []),
    ...(columns['verifying'] ?? []),
  ].slice(0, 6)

  const recentlyCompleted: any[] = (columns['done'] ?? []).slice(0, 5)

  const completedCount = metrics?.volume.completedTasks ?? boardData?.stats?.completed ?? 0
  const qualityScore = metrics?.quality.avgDeliverableScore
  const hoursSaved = metrics?.roi.estimatedHoursSaved ?? 0

  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-400 mt-1">Here&apos;s what&apos;s happening with your work</p>
        </div>

        {/* Your Output - 3 key metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            icon={<CheckCircle2 className="text-green-400" />}
            label="Tasks Done"
            value={completedCount}
            color="green"
          />
          <MetricCard
            icon={<Star className="text-amber-400" />}
            label="Quality Score"
            value={qualityScore != null ? `${qualityScore}/100` : 'N/A'}
            color="amber"
          />
          <MetricCard
            icon={<Zap className="text-purple-400" />}
            label="Hours Saved"
            value={hoursSaved >= 1000 ? `${(hoursSaved / 1000).toFixed(1)}k` : String(hoursSaved)}
            color="purple"
          />
        </div>

        {/* What's happening - active tasks */}
        <div className="glass-2 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">In Progress</h2>
            <Link href="/tasks" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {activeTasks.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No active tasks right now</p>
              <Link href="/tasks" className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block">
                Create a task to get started
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeTasks.map((task: any) => (
                <EasyTaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>

        {/* Recently Completed */}
        {recentlyCompleted.length > 0 && (
          <div className="glass-2 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4">Recently Completed</h2>
            <div className="space-y-3">
              {recentlyCompleted.map((task: any) => (
                <EasyTaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  )
}

function EasyTaskCard({ task }: { task: any }) {
  const statusColors: Record<string, string> = {
    in_progress: 'bg-amber-500/20 text-amber-400',
    building: 'bg-amber-500/20 text-amber-400',
    researching: 'bg-indigo-500/20 text-indigo-400',
    planning: 'bg-violet-500/20 text-violet-400',
    verifying: 'bg-cyan-500/20 text-cyan-400',
    done: 'bg-green-500/20 text-green-400',
    completed: 'bg-green-500/20 text-green-400',
  }

  const statusLabels: Record<string, string> = {
    in_progress: 'In Progress',
    building: 'Building',
    researching: 'Researching',
    planning: 'Planning',
    verifying: 'Verifying',
    done: 'Done',
    completed: 'Done',
  }

  const badgeClass = statusColors[task.status] ?? 'bg-slate-700 text-slate-300'
  const label = statusLabels[task.status] ?? task.status

  return (
    <Link
      href={`/tasks?taskId=${task.id}`}
      className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] transition-colors"
    >
      <div className="flex-1 min-w-0 mr-3">
        <p className="text-sm font-medium text-slate-200 truncate">{task.title}</p>
        {task.assignedTo && (
          <p className="text-xs text-slate-500 mt-0.5">Assigned to {task.assignedTo}</p>
        )}
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${badgeClass}`}>
        {label}
      </span>
    </Link>
  )
}

export default function OptimizedDashboardPage() {
  const [time, setTime] = useState<Date | null>(null)
  const isMobile = useMobile()
  const { uiMode } = useSidebar()

  // Real-time clock - only run on client to avoid hydration mismatch
  useEffect(() => {
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 60000) // Reduced to 1 minute updates
    return () => clearInterval(timer)
  }, [])

  // Optimized data fetching with reduced polling frequency
  const { data: combinedData, isLoading } = useQuery({
    queryKey: ['dashboard-complete'],
    queryFn: async () => {
      const [agentsRes, healthRes, boardRes, systemRes] = await Promise.all([
        api.get('/agents?includeOffline=true'),
        fetch('/api/agents/health').then(r => r.json()).catch(() => ({ agents: [] })),
        api.get('/tasks/board'),
        fetch('/api/health/status').then(r => r.json()).catch(() => ({ status: 'unknown' })),
      ])
      return {
        agents: Array.isArray(agentsRes.data) ? agentsRes.data : (agentsRes.data?.agents ?? agentsRes.data?.data ?? []),
        health: healthRes,
        board: boardRes.data,
        system: systemRes,
      }
    },
    refetchInterval: 30000, // Reduced from 5-10s to 30s
    staleTime: 15000, // Cache for 15 seconds
  })

  const { agents: rawAgents = [], health: healthData, board: boardData, system: systemHealth } = combinedData || {}

  // Easy mode view
  if (uiMode === 'easy') {
    return <EasyModeDashboard />
  }

  // Merge agents with health data
  const agents = rawAgents.map((agent: any) => {
    const health = healthData?.agents?.find((h: any) => h.id === agent.id || h.id === agent.name?.toLowerCase())
    const isCaesar = agent.id?.toLowerCase() === 'caesar' || agent.name?.toLowerCase() === 'caesar'
    
    let derivedStatus = agent.status || 'offline'
    
    if (isCaesar) {
      const hasActiveTasks = health?.busy || agent.currentTask || agent.currentTaskId
      derivedStatus = hasActiveTasks ? 'busy' : 'online'
    } else if (health?.reachable) {
      derivedStatus = health.busy || agent.currentTask || agent.currentTaskId ? 'busy' : 'online'
    } else if (health && !health.reachable) {
      derivedStatus = agent.status === 'rate_limited' ? 'rate_limited' : 'offline'
    }

    return {
      ...agent,
      status: derivedStatus,
      reachable: isCaesar || health?.reachable,
      latencyMs: health?.latencyMs,
      busy: health?.busy,
      activeTask: health?.activeTask,
    }
  })

  // Sort agents
  const CORE_ORDER = ['caesar', 'minerva', 'athena', 'vulcan', 'janus']
  agents.sort((a: any, b: any) => {
    const aIdx = CORE_ORDER.indexOf(a.id?.toLowerCase() || a.name?.toLowerCase())
    const bIdx = CORE_ORDER.indexOf(b.id?.toLowerCase() || b.name?.toLowerCase())
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx
    if (aIdx !== -1) return -1
    if (bIdx !== -1) return 1
    return (a.name || '').localeCompare(b.name || '')
  })

  const activeAgents = agents.filter((a: any) => a.status === 'online' || a.status === 'busy').length
  const totalTasks = boardData?.stats?.total ?? 0
  const completedTasks = boardData?.stats?.completed ?? 0
  const inProgress = boardData?.stats?.inProgress ?? 0

  const systemStatus = systemHealth?.status ?? 'unknown'
  const systemUptime = systemHealth?.uptime ?? 0

  if (isLoading) {
    return (
      <PageContainer>
        <div className="text-center text-slate-400 py-12">Loading dashboard...</div>
      </PageContainer>
    )
  }

  // Mobile view
  if (isMobile) {
    const mobileAgents = agents.map((a: any) => ({
      id: a.id,
      name: a.name,
      emoji: a.emoji,
      avatar: a.avatar,
      status: a.status || 'offline',
      currentTask: a.currentTask || a.currentTaskId,
      color: a.color,
    }))

    return (
      <PageContainer>
        <div className="bg-slate-800/80 rounded-xl border border-white/[0.06] p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-white font-medium">{activeAgents} Active</span>
              </div>
              <span className="text-slate-600">·</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-green-400" />
                <span className="text-sm text-slate-300">{completedTasks} Done</span>
              </div>
            </div>
            <span className="text-xs text-slate-500">
              {time?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) ?? '--:--'}
            </span>
          </div>
        </div>

        <div className="glass-2 rounded-xl p-4">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Bot size={16} className="text-blue-400" /> Agents ({agents.length})
          </h2>
          <Suspense fallback={<div className="text-center py-4 text-slate-400">Loading agents...</div>}>
            <MobileAgentScroller agents={mobileAgents} isLoading={false} />
          </Suspense>
        </div>
      </PageContainer>
    )
  }

  // Desktop view
  return (
    <PageContainer>
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Command Center</h1>
            <p className="text-sm sm:text-base text-slate-400">
              {time?.toLocaleTimeString() ?? '--:--:--'} UTC • <SystemStatusInline status={systemStatus} />
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Link href="/agents/org" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm sm:text-base">
              <Bot size={18} /> Quick Actions
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard
            icon={<Users className="text-blue-400" />}
            label="Active Agents"
            value={activeAgents}
            subtext={`of ${agents.length} total`}
            color="blue"
          />
          <MetricCard
            icon={<ListTodo className="text-purple-400" />}
            label="Tasks In Progress"
            value={inProgress}
            subtext={`${totalTasks} total`}
            color="purple"
          />
          <MetricCard
            icon={<CheckCircle2 className="text-green-400" />}
            label="Completed Today"
            value={completedTasks}
            subtext={totalTasks > 0 ? `${Math.round(completedTasks/totalTasks*100)}% done` : 'No tasks'}
            color="green"
          />
          <SystemStatusCard status={systemStatus} uptime={systemUptime} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 glass-2 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
              <Cpu className="text-blue-400" /> Agent Fleet
            </h2>
            <Link href="/agents" className="text-sm text-slate-400 hover:text-white flex items-center gap-1">
              Manage <ArrowRight size={14} />
            </Link>
          </div>

          {agents.length === 0 ? (
            <div className="text-slate-400">No agents registered</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Suspense fallback={
                <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-slate-700 rounded mb-2"></div>
                  <div className="h-3 bg-slate-700 rounded w-3/4"></div>
                </div>
              }>
                {agents.map((agent: any) => {
                  const agentData = {
                    id: agent.id,
                    name: agent.name,
                    emoji: agent.emoji,
                    avatar: agent.avatar,
                    role: agent.role || agent.type,
                    title: agent.title,
                    description: agent.description,
                    color: agent.color,
                    status: agent.status || 'offline',
                    currentTask: agent.currentTask || agent.currentTaskId,
                    healthEndpoint: agent.healthEndpoint,
                  }
                  return <AgentCardWithActivity key={agent.id} agent={agentData} variant="compact" />
                })}
              </Suspense>
            </div>
          )}
        </div>

        <div className="glass-2 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
              <ListTodo className="text-purple-400" /> Task Queue
            </h2>
            <Link href="/tasks" className="text-sm text-slate-400 hover:text-white flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            <QueueRow label="Backlog" count={boardData?.stats?.backlog ?? 0} color="slate" />
            <QueueRow label="To Do" count={boardData?.stats?.todo ?? 0} color="blue" />
            <QueueRow label="In Progress" count={boardData?.stats?.inProgress ?? 0} color="amber" />
            <QueueRow label="Completed" count={boardData?.stats?.completed ?? 0} color="green" />
          </div>

          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <div className="text-sm text-slate-400 mb-2">Progress</div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: totalTasks > 0 ? `${(completedTasks/totalTasks)*100}%` : '0%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

// Helper components
function SystemStatusCard({ status, uptime }: { status: string; uptime: number }) {
  const config: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    healthy: { icon: <Shield className="text-green-400" />, color: 'green', label: 'Healthy' },
    degraded: { icon: <ShieldAlert className="text-yellow-400" />, color: 'amber', label: 'Degraded' },
    unhealthy: { icon: <ShieldX className="text-red-400" />, color: 'red', label: 'Unhealthy' },
    unknown: { icon: <Shield className="text-slate-400" />, color: 'slate', label: 'Unknown' },
  }

  const cfg = config[status] ?? config.unknown

  return (
    <MetricCard
      icon={cfg.icon}
      label="System Status"
      value={cfg.label}
      subtext={uptime > 0 ? formatUptime(uptime) : 'Checking...'}
      color={cfg.color}
    />
  )
}

function SystemStatusInline({ status }: { status: string }) {
  const colors: Record<string, string> = {
    healthy: 'text-green-400',
    degraded: 'text-yellow-400',
    unhealthy: 'text-red-400',
  }

  const labels: Record<string, string> = {
    healthy: 'System Healthy',
    degraded: 'System Degraded',
    unhealthy: 'System Unhealthy',
  }

  return (
    <span className={colors[status] ?? 'text-slate-400'}>
      {labels[status] ?? 'Connecting...'}
    </span>
  )
}

function QueueRow({ label, count, color }: { label: string; count: number; color: string }) {
  const colors: Record<string, string> = {
    slate: 'bg-slate-600',
    blue: 'bg-blue-600',
    amber: 'bg-amber-600',
    green: 'bg-green-600',
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm sm:text-base text-slate-300">{label}</span>
      <span className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${colors[color]}`}>{count}</span>
    </div>
  )
}