'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2, Clock, Activity, Users, Zap, HeartPulse } from 'lucide-react'
import { MobileAgentScroller, type MobileAgentData } from './MobileAgentScroller'
import { PageContainer } from '@/components/layout'
import type { AgentStatus } from '@/components/agents/StatusBadge'

interface Task {
  id: string
  title: string
  status: string
  priority?: string
  assignee?: string
}

interface MobileDashboardViewProps {
  time: Date | null
  agents: any[]
  agentsLoading?: boolean
  activeAgents: number
  completedTasks: number
  inProgress: number
  activities: any[]
  tasks: any[]
}

function MobileStatusBar({ activeAgents, completedTasks, inProgress }: { 
  activeAgents: number
  completedTasks: number
  inProgress: number
}) {
  return (
    <div className="flex items-center justify-around glass-2 rounded-xl p-4 mb-4">
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1">
          <Users className="text-blue-400" size={16} />
          <span className="text-white font-semibold">{activeAgents}</span>
        </div>
        <span className="text-xs text-slate-400">Active</span>
      </div>
      <div className="w-px h-8 bg-slate-700" />
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1">
          <CheckCircle2 className="text-green-400" size={16} />
          <span className="text-white font-semibold">{completedTasks}</span>
        </div>
        <span className="text-xs text-slate-400">Done</span>
      </div>
      <div className="w-px h-8 bg-slate-700" />
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1">
          <Clock className="text-amber-400" size={16} />
          <span className="text-white font-semibold">{inProgress}</span>
        </div>
        <span className="text-xs text-slate-400">In Progress</span>
      </div>
    </div>
  )
}

function MobileTaskList({ tasks }: { tasks: any[] }) {
  const priorityColors: Record<string, string> = {
    P0: 'text-red-400',
    P1: 'text-amber-400',
    P2: 'text-blue-400',
    P3: 'text-slate-400',
  }

  // Filter to in-progress tasks
  const inProgressTasks = tasks.filter((t: any) => 
    t.status === 'in_progress' || t.status === 'in-progress' || t.status === 'active'
  )

  if (inProgressTasks.length === 0) {
    return (
      <div className="text-center text-slate-400 py-4 text-sm">
        No tasks in progress
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {inProgressTasks.slice(0, 5).map((task: any) => (
        <Link
          key={task.id}
          href={`/tasks/${task.id}`}
          className="block bg-slate-900/50 rounded-lg p-3 border border-white/[0.06] active:border-slate-600 transition-colors"
        >
          <div className="flex items-start gap-2">
            <Activity size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white truncate">{task.title}</div>
              <div className="flex items-center gap-2 mt-1">
                {task.priority && (
                  <span className={`text-xs ${priorityColors[task.priority] ?? 'text-slate-400'}`}>
                    {task.priority}
                  </span>
                )}
                {task.assignee && (
                  <span className="text-xs text-slate-500 truncate">
                    {task.assignee}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

function SectionHeader({ title, href, icon }: { title: string; href: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-base font-semibold text-white flex items-center gap-2">
        {icon} {title}
      </h2>
      <Link href={href} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
        See All <ArrowRight size={14} />
      </Link>
    </div>
  )
}

export function MobileDashboardView({ 
  time,
  agents, 
  agentsLoading,
  activeAgents,
  completedTasks,
  inProgress,
  activities,
  tasks,
}: MobileDashboardViewProps) {
  // Transform agents to MobileAgentData format
  const mobileAgents: MobileAgentData[] = agents.map((agent: any) => ({
    id: agent.id,
    name: agent.name,
    emoji: agent.emoji,
    avatar: agent.avatar,
    status: (agent.status as AgentStatus) || 'offline',
    currentTask: agent.currentTask || agent.currentTaskId,
    color: agent.color,
  }))

  return (
    <PageContainer>
      {/* Compact Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
            <p className="text-xs text-slate-400">
              {time?.toLocaleTimeString() ?? '--:--:--'} • <span className="text-green-400">Online</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Link 
              href="/command" 
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              aria-label="Quick Actions"
            >
              <Zap size={18} />
            </Link>
            <Link
              href="/health"
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              aria-label="Health"
            >
              <HeartPulse size={18} />
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Status Bar */}
        <MobileStatusBar 
          activeAgents={activeAgents} 
          completedTasks={completedTasks} 
          inProgress={inProgress} 
        />

        {/* Agent Scroller Section */}
        <section>
          <SectionHeader 
            title="Agents" 
            href="/agents" 
            icon={<Users className="text-blue-400" size={18} />} 
          />
          <MobileAgentScroller agents={mobileAgents} isLoading={agentsLoading} />
        </section>

        {/* In-Progress Tasks Section */}
        <section className="glass-2 rounded-xl p-4">
          <SectionHeader
            title="In Progress" 
            href="/tasks" 
            icon={<Activity className="text-amber-400" size={18} />} 
          />
          <MobileTaskList tasks={tasks} />
        </section>

        {/* Recent Activity */}
        <section className="glass-2 rounded-xl p-4">
          <SectionHeader
            title="Activity" 
            href="/activity" 
            icon={<Activity className="text-green-400" size={18} />} 
          />
          {activities.length === 0 ? (
            <div className="text-center text-slate-400 py-4 text-sm">
              No recent activity
            </div>
          ) : (
            <div className="space-y-2">
              {activities.slice(0, 3).map((activity: any, i: number) => (
                <div 
                  key={activity.id ?? i}
                  className="flex items-center gap-2 p-2 bg-slate-900/30 rounded-lg text-sm"
                >
                  <span className="text-white font-medium truncate">
                    {activity.agent?.name ?? 'System'}
                  </span>
                  <span className="text-slate-400 truncate flex-1">
                    {activity.action?.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageContainer>
  )
}
