'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useState, useEffect } from 'react'
import { PageContainer } from '@/components/layout'
import { AgentCard, type AgentData, type AgentStatus } from '@/components/agents'
import { MobileAgentScroller, type MobileAgentData } from '@/components/dashboard'
import { useMobile } from '@/hooks/useMobile'
import Link from 'next/link'
import { 
  Activity, 
  Cpu, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Zap,
  HeartPulse,
  Users,
  ListTodo,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Bot
} from 'lucide-react'

// ============================================
// REDESIGNED DASHBOARD - Command Center Style
// Mobile-responsive with breakpoints
// ============================================

export default function DashboardPage() {
  const [time, setTime] = useState<Date | null>(null)
  const isMobile = useMobile()

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
  const { data: healthData } = useQuery<{ agents: { id: string; reachable: boolean; latencyMs?: number }[] }>({
    queryKey: ['agents-health'],
    queryFn: () => fetch('/api/agents/health').then(r => r.json()),
    refetchInterval: 30000,
  })
  
  // Defensive: ensure agents is always an array
  const rawAgents = Array.isArray(agentsData) ? agentsData : (agentsData?.agents ?? agentsData?.data ?? [])
  
  // Merge agents with health data to derive correct status (like Fleet page does)
  const agents = rawAgents.map((agent: any) => {
    const health = healthData?.agents?.find(h => h.id === agent.id || h.id === agent.name?.toLowerCase())
    
    // Derive status from health check: reachable = online, else use raw status or offline
    let derivedStatus = agent.status || 'offline'
    if (health?.reachable) {
      derivedStatus = agent.currentTask || agent.currentTaskId ? 'busy' : 'online'
    } else if (health && !health.reachable) {
      // Health check ran but agent not reachable
      derivedStatus = agent.status === 'rate_limited' ? 'rate_limited' : 'offline'
    }
    
    return {
      ...agent,
      status: derivedStatus,
      reachable: health?.reachable,
      latencyMs: health?.latencyMs,
    }
  })

  const { data: boardData } = useQuery({
    queryKey: ['board'],
    queryFn: () => api.get('/tasks/board').then(r => r.data),
    refetchInterval: 10000,
  })

  const { data: activityData } = useQuery({
    queryKey: ['activity'],
    queryFn: () => api.get('/activity').then(r => r.data),
    refetchInterval: 5000,
  })

  const { data: tasksData } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get('/task-tracking/tasks').then(r => r.data),
    refetchInterval: 10000,
  })

  const activeAgents = agents.filter((a: any) => a.status === 'online' || a.status === 'busy').length
  const totalTasks = boardData?.stats?.total ?? 0
  const completedTasks = boardData?.stats?.completed ?? 0
  const inProgress = boardData?.stats?.inProgress ?? 0
  const activities = activityData?.activities ?? []
  const tasks = tasksData?.tasks ?? tasksData ?? []

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
        activities={activities}
        tasks={tasks}
      />
    )
  }

  // Desktop view (existing)
  return (
    <PageContainer>
      {/* Header with live stats */}
      <div className="mb-6 sm:mb-8">
        {/* Header - stacks on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Command Center</h1>
            <p className="text-sm sm:text-base text-slate-400">
              {time?.toLocaleTimeString() ?? '--:--:--'} UTC • <span className="text-green-400">Online</span>
            </p>
          </div>
          {/* Buttons - full width on mobile, row on larger */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Link href="/command" data-testid="btn-quick-actions" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm sm:text-base">
              <Zap size={18} /> Quick Actions
            </Link>
            <Link href="/health" data-testid="btn-health" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm sm:text-base">
              <HeartPulse size={18} /> Health
            </Link>
          </div>
        </div>

        {/* Key Metrics Bar - 1 col mobile, 2 col tablet, 4 col desktop */}
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
          <MetricCard 
            icon={<Activity className="text-amber-400" />}
            label="Activity Rate"
            value={`${activities.length}`}
            subtext="events last hour"
            color="amber"
          />
        </div>
      </div>

      {/* Main Grid - stacks on mobile, 3 col on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Agent Status Panel - full width on mobile, 2 cols on desktop */}
        <div className="lg:col-span-2 glass-2 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
              <Cpu className="text-blue-400" /> Agent Fleet
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
              {agents.slice(0, 6).map((agent: any) => {
                const agentData: AgentData = {
                  id: agent.id,
                  name: agent.name,
                  emoji: agent.emoji,
                  avatar: agent.avatar,
                  role: agent.role || agent.type,
                  title: agent.title,
                  description: agent.description,
                  color: agent.color,
                  status: (agent.status as AgentStatus) || 'offline',
                  currentTask: agent.currentTask || agent.currentTaskId,
                  healthEndpoint: agent.healthEndpoint,
                }
                return <AgentCard key={agent.id} agent={agentData} variant="compact" />
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

      {/* Activity Stream */}
      <div className="mt-4 sm:mt-6 glass-2 rounded-xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
            <Activity className="text-green-400" /> Live Activity
          </h2>
          <span className="text-xs sm:text-sm text-slate-400">Auto-refreshing</span>
        </div>
        
        <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
          {activities.length === 0 ? (
            <div className="text-slate-400 text-center py-4">No recent activity</div>
          ) : (
            activities.slice(0, 10).map((activity: any, i: number) => (
              <ActivityRow key={activity.id ?? i} activity={activity} />
            ))
          )}
        </div>
      </div>
    </PageContainer>
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
  activities: any[]
  tasks: any[]
}

function MobileDashboardView({
  time,
  agents,
  agentsLoading,
  activeAgents,
  completedTasks,
  inProgress,
  activities,
  tasks,
}: MobileDashboardViewProps) {
  const [agentsExpanded, setAgentsExpanded] = useState(true)
  const [tasksExpanded, setTasksExpanded] = useState(true)
  const [activityExpanded, setActivityExpanded] = useState(true)

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

  // Filter in-progress tasks
  const inProgressTasks = tasks.filter((t: any) => 
    t.status === 'in_progress' || t.status === 'in-progress'
  ).slice(0, 5)

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
          </div>
          <span className="text-xs text-slate-500">
            {time?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) ?? '--:--'}
          </span>
        </div>
      </div>

      {/* Agents Section (Collapsible) */}
      <MobileSection
        title="Agents"
        icon={<Bot size={16} className="text-blue-400" />}
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
        {inProgressTasks.length === 0 ? (
          <div className="text-slate-400 text-center py-4 text-sm">No tasks in progress</div>
        ) : (
          <div className="space-y-2">
            {inProgressTasks.map((task: any) => (
              <MobileTaskRow key={task.id} task={task} />
            ))}
          </div>
        )}
      </MobileSection>

      {/* Activity Section (Collapsible) */}
      <MobileSection
        title="Recent Activity"
        icon={<Activity size={16} className="text-green-400" />}
        count={activities.length}
        expanded={activityExpanded}
        onToggle={() => setActivityExpanded(!activityExpanded)}
        seeAllHref="/activity"
      >
        {activities.length === 0 ? (
          <div className="text-slate-400 text-center py-4 text-sm">No recent activity</div>
        ) : (
          <div className="space-y-2">
            {activities.slice(0, 5).map((activity: any, i: number) => (
              <MobileActivityRow key={activity.id ?? i} activity={activity} />
            ))}
          </div>
        )}
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
              className="text-xs text-blue-400 hover:text-blue-300"
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
// Mobile Task Row
// ============================================

function MobileTaskRow({ task }: { task: any }) {
  const priorityColors: Record<string, string> = {
    P0: 'bg-red-500',
    P1: 'bg-orange-500',
    P2: 'bg-yellow-500',
    P3: 'bg-slate-500',
  }

  return (
    <div className="bg-slate-900/50 rounded-lg p-3 flex items-start gap-3">
      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${priorityColors[task.priority] ?? 'bg-slate-500'}`} />
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white font-medium truncate">{task.title}</div>
        <div className="flex items-center gap-2 mt-1">
          {task.assignee && (
            <span className="text-xs text-slate-400">{task.assignee}</span>
          )}
          <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
            {task.status?.replace(/_/g, ' ')}
          </span>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Mobile Activity Row
// ============================================

function MobileActivityRow({ activity }: { activity: any }) {
  const actionIcons: Record<string, React.ReactNode> = {
    task_started: <Play size={12} className="text-blue-400" />,
    task_completed: <CheckCircle2 size={12} className="text-green-400" />,
    task_failed: <AlertTriangle size={12} className="text-red-400" />,
    rate_limited: <Pause size={12} className="text-amber-400" />,
  }
  
  const time = new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  
  return (
    <div className="flex items-center gap-2 py-2 px-2 rounded bg-slate-900/30">
      <span className="flex-shrink-0">{actionIcons[activity.action] ?? <Activity size={12} className="text-slate-400" />}</span>
      <span className="text-xs text-slate-300 flex-1 min-w-0 truncate">
        <span className="text-white font-medium">{activity.agent?.name ?? 'System'}</span>
        {' '}{activity.action?.replace(/_/g, ' ')}
      </span>
      <span className="text-xs text-slate-500 flex-shrink-0">{time}</span>
    </div>
  )
}

// ============================================
// Sub-components (Desktop)
// ============================================

function MetricCard({ icon, label, value, subtext, color }: { 
  icon: React.ReactNode
  label: string
  value: string | number
  subtext: string
  color: string 
}) {
  return (
    <div data-testid={`metric-${label.toLowerCase().replace(/\s+/g, '-')}`} className="glass-2 rounded-xl p-3 sm:p-4">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">{icon}</div>
        <div className="min-w-0">
          <div className="text-xl sm:text-2xl font-bold text-white">{value}</div>
          <div className="text-xs sm:text-sm text-slate-400 truncate">{label}</div>
          <div className="text-xs text-slate-500 truncate">{subtext}</div>
        </div>
      </div>
    </div>
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

function ActivityRow({ activity }: { activity: any }) {
  const actionIcons: Record<string, React.ReactNode> = {
    task_started: <Play size={14} className="text-blue-400" />,
    task_completed: <CheckCircle2 size={14} className="text-green-400" />,
    task_failed: <AlertTriangle size={14} className="text-red-400" />,
    rate_limited: <Pause size={14} className="text-amber-400" />,
  }
  
  const time = new Date(activity.createdAt).toLocaleTimeString()
  
  return (
    <div className="flex items-center gap-2 sm:gap-3 py-2 px-2 sm:px-3 rounded bg-slate-900/30">
      <span className="flex-shrink-0">{actionIcons[activity.action] ?? <Activity size={14} className="text-slate-400" />}</span>
      <span className="text-xs sm:text-sm text-slate-300 flex-1 min-w-0 truncate">
        <span className="text-white font-medium">{activity.agent?.name ?? 'System'}</span>
        {' '}{activity.action?.replace(/_/g, ' ')}
      </span>
      <span className="text-xs text-slate-500 flex-shrink-0">{time}</span>
    </div>
  )
}
