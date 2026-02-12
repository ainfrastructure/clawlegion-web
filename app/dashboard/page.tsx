'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useState, useEffect } from 'react'
import { PageContainer } from '@/components/layout'
import { AgentCard, AgentCardWithActivity, type AgentData, type AgentStatus } from '@/components/agents'
import { getAgentByName } from '@/components/chat-v2/agentConfig'
import { MetricCard } from '@/components/ui/MetricCard'
import { MobileAgentScroller, type MobileAgentData } from '@/components/dashboard'
import { useMobile } from '@/hooks/useMobile'
import { useSidebar } from '@/components/layout/SidebarContext'
import Link from 'next/link'
import {
  Cpu,
  CheckCircle2,
  Users,
  ListTodo,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Bot,
  Shield,
  ShieldAlert,
  ShieldX,
  Star,
  Zap,
} from 'lucide-react'
import type { DashboardMetrics } from '@/types/common'

// ============================================
// REDESIGNED DASHBOARD - Command Center Style
// Mobile-responsive with breakpoints
// ============================================

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  if (days > 0) return `Up ${days}d ${hours}h`
  const mins = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `Up ${hours}h ${mins}m`
  return `Up ${mins}m`
}

// ============================================
// Easy Mode Dashboard
// ============================================

function EasyModeDashboard() {
  const { data: boardData } = useQuery({
    queryKey: ['board'],
    queryFn: () => api.get('/tasks/board').then(r => r.data),
    refetchInterval: 10000,
  })

  const { data: metrics } = useQuery<DashboardMetrics>({
    queryKey: ['metrics', 'dashboard'],
    queryFn: async () => {
      const res = await api.get('/metrics/dashboard')
      return res.data
    },
    refetchInterval: 30000,
  })

  // Get active and recent tasks from board data
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
            <Link href="/tasks" className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {activeTasks.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No active tasks right now</p>
              <Link href="/tasks" className="text-red-400 hover:text-red-300 text-sm mt-2 inline-block">
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

export default function DashboardPage() {
  const [time, setTime] = useState<Date | null>(null)
  const isMobile = useMobile()
  const { uiMode } = useSidebar()

  // Real-time clock - only run on client to avoid hydration mismatch
  useEffect(() => {
    setTime(new Date()) // Set initial time on mount
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch data
  const { data: agentsData, isLoading: agentsLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.get('/agents?includeOffline=true').then(r => r.data),
    refetchInterval: 5000,
  })

  // Fetch health data to derive actual online/offline status
  const { data: healthData } = useQuery<{ agents: { id: string; reachable: boolean; latencyMs?: number; busy?: boolean; activeTask?: string }[] }>({
    queryKey: ['agents-health'],
    queryFn: () => fetch('/api/agents/health').then(r => r.json()),
    refetchInterval: 30000,
  })

  // Defensive: ensure agents is always an array
  const rawAgents = Array.isArray(agentsData) ? agentsData : (agentsData?.agents ?? agentsData?.data ?? [])

  // Merge agents with health data to derive correct status (like Fleet page does)
  const agents = rawAgents.map((agent: any) => {
    const health = healthData?.agents?.find(h => h.id === agent.id || h.id === agent.name?.toLowerCase())

    // All agents are ephemeral sub-agents of Caesar — online if Caesar is online
    let derivedStatus = agent.status || 'online'
    
    if (agent.currentTask || agent.currentTaskId || health?.busy) {
      derivedStatus = 'busy'
    } else if (agent.status === 'rate_limited') {
      derivedStatus = 'rate_limited'
    } else {
      derivedStatus = 'online'
    }

    return {
      ...agent,
      status: derivedStatus,
      reachable: true,
      latencyMs: health?.latencyMs,
      busy: health?.busy,
      activeTask: health?.activeTask,
    }
  })

  // Sort: core agents first (Caesar, Minerva, Athena, Vulcan, Janus), then others alphabetically
  const CORE_ORDER = ['caesar', 'minerva', 'athena', 'vulcan', 'janus']
  agents.sort((a: any, b: any) => {
    const aIdx = CORE_ORDER.indexOf(a.id?.toLowerCase() || a.name?.toLowerCase())
    const bIdx = CORE_ORDER.indexOf(b.id?.toLowerCase() || b.name?.toLowerCase())
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx
    if (aIdx !== -1) return -1
    if (bIdx !== -1) return 1
    return (a.name || '').localeCompare(b.name || '')
  })

  const { data: boardData } = useQuery({
    queryKey: ['board'],
    queryFn: () => api.get('/tasks/board').then(r => r.data),
    refetchInterval: 10000,
  })

  // System health status
  const { data: systemHealth } = useQuery<{
    status: string
    uptime?: number
    error?: string
  }>({
    queryKey: ['system-health-status'],
    queryFn: () => fetch('/api/health/status').then(r => r.json()),
    refetchInterval: 30000,
  })

  const activeAgents = agents.filter((a: any) => a.status === 'online' || a.status === 'busy').length
  const totalTasks = boardData?.stats?.total ?? 0
  const completedTasks = boardData?.stats?.completed ?? 0
  const inProgress = boardData?.stats?.inProgress ?? 0

  const systemStatus = systemHealth?.status ?? 'unknown'
  const systemUptime = systemHealth?.uptime ?? 0

  // Easy mode view
  if (uiMode === 'easy') {
    return <EasyModeDashboard />
  }

  // Mobile view
  if (isMobile) {
    return (
      <MobileDashboardView
        time={time}
        agents={agents}
        agentsLoading={agentsLoading}
        activeAgents={activeAgents}
        completedTasks={completedTasks}
        inProgress={inProgress}
        systemStatus={systemStatus}
      />
    )
  }

  // Desktop view
  return (
    <PageContainer>
      {/* Header with live stats */}
      <div className="mb-6 sm:mb-8">
        {/* Header - stacks on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Command Center</h1>
            <p className="text-sm sm:text-base text-slate-400">
              {time?.toLocaleTimeString() ?? '--:--:--'} UTC • <SystemStatusInline status={systemStatus} />
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Link href="/agents/org" data-testid="btn-quick-actions" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm sm:text-base">
              <Bot size={18} /> Quick Actions
            </Link>
          </div>
        </div>

        {/* Key Metrics Bar - 1 col mobile, 2 col tablet, 4 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard
            icon={<Users className="text-red-400" />}
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

      {/* Main Grid - stacks on mobile, 3 col on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Agent Status Panel - full width on mobile, 2 cols on desktop */}
        <div className="lg:col-span-2 glass-2 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
              <Cpu className="text-red-400" /> Agent Fleet
            </h2>
            <Link href="/agents" className="text-sm text-slate-400 hover:text-white flex items-center gap-1">
              Manage <ArrowRight size={14} />
            </Link>
          </div>

          {agentsLoading ? (
            <div className="text-slate-400">Loading agents...</div>
          ) : agents.length === 0 ? (
            <div className="text-slate-400">No agents registered</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {agents.map((agent: any) => {
                // Enrich from agentConfig for colors/avatars/emojis
                const config = getAgentByName(agent.name)
                const agentData: AgentData = {
                  id: agent.id,
                  name: agent.name,
                  emoji: config?.emoji || agent.emoji,
                  avatar: config?.avatar || agent.avatar,
                  role: config?.role || agent.role || agent.type,
                  title: config?.role || agent.title,
                  description: config?.description || agent.description,
                  color: config?.color || agent.color,
                  status: (agent.status as AgentStatus) || 'offline',
                  currentTask: agent.currentTask || agent.currentTaskId,
                  healthEndpoint: agent.healthEndpoint,
                }
                return <AgentCardWithActivity key={agent.id} agent={agentData} variant="compact" />
              })}
            </div>
          )}
        </div>

        {/* Quick Task Queue */}
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

// ============================================
// System Status Components
// ============================================

function SystemStatusCard({ status, uptime }: { status: string; uptime: number }) {
  const config: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    healthy: {
      icon: <Shield className="text-green-400" />,
      color: 'green',
      label: 'Healthy',
    },
    degraded: {
      icon: <ShieldAlert className="text-yellow-400" />,
      color: 'amber',
      label: 'Degraded',
    },
    unhealthy: {
      icon: <ShieldX className="text-red-400" />,
      color: 'red',
      label: 'Unhealthy',
    },
    unknown: {
      icon: <Shield className="text-slate-400" />,
      color: 'slate',
      label: 'Unknown',
    },
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

// ============================================
// Mobile Dashboard View
// ============================================

interface MobileDashboardViewProps {
  time: Date | null
  agents: any[]
  agentsLoading: boolean
  activeAgents: number
  completedTasks: number
  inProgress: number
  systemStatus: string
}

function MobileDashboardView({
  time,
  agents,
  agentsLoading,
  activeAgents,
  completedTasks,
  inProgress,
  systemStatus,
}: MobileDashboardViewProps) {
  const [agentsExpanded, setAgentsExpanded] = useState(true)
  const [tasksExpanded, setTasksExpanded] = useState(true)

  // Transform agents for mobile scroller
  const mobileAgents: MobileAgentData[] = agents.map((a: any) => ({
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
      {/* Status Bar */}
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
            <span className="text-slate-600">·</span>
            <SystemStatusInline status={systemStatus} />
          </div>
          <span className="text-xs text-slate-500">
            {time?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) ?? '--:--'}
          </span>
        </div>
      </div>

      {/* Agents Section (Collapsible) */}
      <MobileSection
        title="Agents"
        icon={<Bot size={16} className="text-red-400" />}
        count={agents.length}
        expanded={agentsExpanded}
        onToggle={() => setAgentsExpanded(!agentsExpanded)}
        seeAllHref="/agents"
      >
        <MobileAgentScroller agents={mobileAgents} isLoading={agentsLoading} />
      </MobileSection>

      {/* Tasks Section (Collapsible) */}
      <MobileSection
        title="In Progress"
        icon={<ListTodo size={16} className="text-purple-400" />}
        count={inProgress}
        expanded={tasksExpanded}
        onToggle={() => setTasksExpanded(!tasksExpanded)}
        seeAllHref="/tasks"
      >
        <div className="text-slate-400 text-center py-4 text-sm">
          {inProgress > 0 ? `${inProgress} tasks in progress` : 'No tasks in progress'}
        </div>
      </MobileSection>

    </PageContainer>
  )
}

// ============================================
// Mobile Section Component (Collapsible)
// ============================================

interface MobileSectionProps {
  title: string
  icon: React.ReactNode
  count?: number
  expanded: boolean
  onToggle: () => void
  seeAllHref?: string
  children: React.ReactNode
}

function MobileSection({ title, icon, count, expanded, onToggle, seeAllHref, children }: MobileSectionProps) {
  return (
    <div className="glass-2 rounded-xl mb-4 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-white">{title}</span>
          {count !== undefined && (
            <span className="text-xs text-slate-400">({count})</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {seeAllHref && expanded && (
            <Link
              href={seeAllHref}
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-red-400 hover:text-red-300"
            >
              See All →
            </Link>
          )}
          {expanded ? (
            <ChevronUp size={16} className="text-slate-400" />
          ) : (
            <ChevronDown size={16} className="text-slate-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3">
          {children}
        </div>
      )}
    </div>
  )
}

// ============================================
// Sub-components (Desktop)
// ============================================

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
