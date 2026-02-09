'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { PageContainer } from '@/components/layout'
import { AgentProfilePanel, type AgentData, type AgentStatus } from '@/components/agents'
import { FleetAgentCard } from '@/components/agents/FleetAgentCard'
import { getAgentByName } from '@/components/chat-v2/agentConfig'
import {
  Bot,
  Play,
  RefreshCw,
  CheckCircle2,
  Activity,
  AlertTriangle,
  Loader2,
  Wifi,
  WifiOff,
  Plus,
  Square
} from 'lucide-react'
import { ExportButton } from '@/components/ExportButton'
import { AddAgentModal } from '@/components/agents/AddAgentModal'

// ============================================
// AGENT FLEET PAGE - Updated with AgentCard
// ============================================

import type { Agent, HealthResult, HealthData } from '@/types'

// Alias for backwards compatibility
type ApiAgent = Agent

export default function AgentFleetPage() {
  // State for profile panel
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [selectedAgentStatus, setSelectedAgentStatus] = useState<AgentStatus>('offline')
  const [showAddAgent, setShowAddAgent] = useState(false)

  // Fetch agents (full objects including emoji, avatar, stats, etc.)
  const { 
    data: agentsData, 
    isLoading: agentsLoading,
    refetch: refetchAgents 
  } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.get('/agents?includeOffline=true').then(r => r.data),
    refetchInterval: 10000, // Refresh every 10 seconds
  })

  // Fetch health data
  const { 
    data: healthData,
    isLoading: healthLoading,
    refetch: refetchHealth 
  } = useQuery<HealthData>({
    queryKey: ['agents-health'],
    queryFn: () => fetch('/api/agents/health').then(r => r.json()),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  // Fetch activity
  const { data: activityData } = useQuery({
    queryKey: ['activity'],
    queryFn: () => api.get('/activity').then(r => r.data),
    refetchInterval: 5000,
  })

  const rawAgents: ApiAgent[] = agentsData?.agents ?? agentsData ?? []
  const activities = activityData?.activities ?? []

  // Merge agents with health data
  // Status is derived from gateway reachability, not DB
  const agents: AgentData[] = rawAgents.map(agent => {
    const health = healthData?.agents?.find(h => h.id === agent.id || h.id === agent.name?.toLowerCase())
    
    // Derive status from health check: reachable = online, else offline
    // If agent has a current task, mark as busy
    let derivedStatus: AgentStatus = 'offline'
    if (health?.reachable) {
      derivedStatus = agent.currentTaskId ? 'busy' : 'online'
    } else if (agent.status === 'rate_limited') {
      derivedStatus = 'rate_limited' // Preserve rate limited status
    }
    
    return {
      id: agent.id,
      name: agent.name,
      emoji: agent.emoji,
      avatar: agent.avatar,
      role: agent.role || agent.type,
      title: agent.title,
      description: agent.description,
      color: agent.color,
      status: derivedStatus,
      currentTask: agent.currentTask || agent.currentTaskId,
      healthEndpoint: agent.healthEndpoint,
      reachable: health?.reachable,
      latencyMs: health?.latencyMs,
      capabilities: agent.capabilities,
      stats: agent.stats ? {
        tasksCompleted: agent.stats.tasksCompleted,
        avgResponseTime: agent.stats.avgDuration ? agent.stats.avgDuration / 1000 : undefined,
        failureRate: agent.stats.failureRate,
      } : undefined,
    }
  })

  // Filter out Sven (decommissioned)
  const visibleAgents = agents.filter(a => a.id !== 'sven')

  // Stats
  const totalAgents = visibleAgents.length
  const activeAgents = visibleAgents.filter(a => a.status === 'online' || a.status === 'busy').length
  const rateLimited = visibleAgents.filter(a => a.status === 'rate_limited').length
  const totalCompleted = visibleAgents.reduce((sum, a) => sum + (a.stats?.tasksCompleted ?? 0), 0)
  const reachableCount = healthData?.summary?.reachable ?? 0
  const unreachableCount = healthData?.summary?.unreachable ?? 0

  const emergencyStop = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/agents/emergency-stop', { method: 'POST' })
      return res.json()
    },
    onSuccess: () => {
      refetchAgents()
      refetchHealth()
    },
  })

  const handleRefresh = () => {
    refetchAgents()
    refetchHealth()
  }

  return (
    <PageContainer>
      {/* Header Stats */}
      <div className="mb-6 sm:mb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
              <Bot className="text-blue-400" size={28} /> Agent Fleet
            </h1>
            <p className="text-sm sm:text-base text-slate-400">Monitor and control your AI agents</p>
          </div>
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex gap-2">
              <button
                data-testid="btn-add-agent"
                onClick={() => setShowAddAgent(true)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium"
              >
                <Plus size={16} /> Add Agent
              </button>
              <ExportButton
                data={visibleAgents.map(a => ({
                  id: a.id,
                  name: a.name,
                  role: a.role,
                  status: a.status,
                  currentTask: a.currentTask,
                  reachable: a.reachable,
                  latencyMs: a.latencyMs,
                  tasksCompleted: a.stats?.tasksCompleted ?? 0,
                  avgResponseTime: a.stats?.avgResponseTime ?? 0,
                })) as unknown as Record<string, unknown>[]}
                filename="agents"
                columns={['id', 'name', 'role', 'status', 'currentTask', 'reachable', 'latencyMs', 'tasksCompleted', 'avgResponseTime']}
              />
              <button
                data-testid="btn-resume-all"
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <Play size={16} /> Resume All
              </button>
              <button
                data-testid="btn-emergency-stop"
                onClick={() => emergencyStop.mutate()}
                disabled={emergencyStop.isPending}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium"
              >
                <Square size={16} /> Emergency Stop
              </button>
              <button 
                data-testid="btn-refresh"
                onClick={handleRefresh}
                className="p-2 sm:px-4 sm:py-2 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <RefreshCw size={16} /><span className="hidden sm:inline"> Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats - responsive grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <StatCard icon={<Bot size={20} />} label="Total Agents" value={totalAgents} color="blue" />
          <StatCard icon={<Activity size={20} />} label="Active Now" value={activeAgents} color="green" />
          <StatCard icon={<AlertTriangle size={20} />} label="Rate Limited" value={rateLimited} color="red" />
          <StatCard icon={<CheckCircle2 size={20} />} label="Completed" value={totalCompleted} color="purple" />
          <StatCard icon={<Wifi size={20} />} label="Reachable" value={reachableCount} color="green" />
          <StatCard icon={<WifiOff size={20} />} label="Unreachable" value={unreachableCount} color="red" />
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Agent Cards */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Fleet Status</h2>
          
          {agentsLoading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="animate-spin mr-2" size={20} />
              Loading agents...
            </div>
          ) : visibleAgents.length === 0 ? (
            <div className="glass-2 rounded-xl p-6 sm:p-8 text-center">
              <Bot className="mx-auto mb-4 text-slate-500" size={40} />
              <p className="text-slate-400">No agents registered yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleAgents.map((agent) => (
                <FleetAgentCard
                  key={agent.id}
                  agent={agent}
                  onClick={() => {
                    const enriched = getAgentByName(agent.name)
                    setSelectedAgentId(enriched?.id || agent.id)
                    setSelectedAgentStatus(agent.status)
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="glass-2 rounded-xl p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <Activity className="text-green-400" size={20} /> Live Activity
          </h2>
          
          <div className="space-y-2 max-h-[400px] sm:max-h-[600px] overflow-y-auto">
            {activities.length === 0 ? (
              <div className="text-slate-400 text-center py-4">No recent activity</div>
            ) : (
              activities.slice(0, 20).map((activity: any, i: number) => (
                <ActivityItem key={activity.id ?? i} activity={activity} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Agent Profile Panel */}
      {selectedAgentId && (
        <AgentProfilePanel
          agentId={selectedAgentId}
          agentStatus={selectedAgentStatus}
          onClose={() => setSelectedAgentId(null)}
        />
      )}

      {/* Add Agent Modal */}
      <AddAgentModal
        open={showAddAgent}
        onClose={() => setShowAddAgent(false)}
        onCreated={() => {
          refetchAgents()
          refetchHealth()
        }}
      />
    </PageContainer>
  )
}

// ============================================
// Components
// ============================================

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    red: 'text-red-400',
    purple: 'text-purple-400',
  }
  
  return (
    <div data-testid={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`} className="glass-2 rounded-xl p-3 sm:p-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={colors[color] || 'text-slate-400'}>{icon}</div>
        <div className="min-w-0">
          <div className="text-xl sm:text-2xl font-bold text-white">{value}</div>
          <div className="text-xs sm:text-sm text-slate-400 truncate">{label}</div>
        </div>
      </div>
    </div>
  )
}

function ActivityItem({ activity }: { activity: any }) {
  const icons: Record<string, React.ReactNode> = {
    task_started: <Play size={14} className="text-blue-400" />,
    task_completed: <CheckCircle2 size={14} className="text-green-400" />,
    task_failed: <AlertTriangle size={14} className="text-red-400" />,
    rate_limited: <AlertTriangle size={14} className="text-amber-400" />,
  }
  
  return (
    <div className="flex items-center gap-2 sm:gap-3 py-2 px-2 sm:px-3 rounded bg-slate-900/30 hover:bg-slate-900/50">
      <span className="flex-shrink-0">{icons[activity.action] ?? <Activity size={14} className="text-slate-400" />}</span>
      <div className="flex-1 min-w-0 truncate">
        <span className="text-xs sm:text-sm text-white font-medium">{activity.agent?.name ?? 'System'}</span>
        <span className="text-xs sm:text-sm text-slate-400"> {activity.action?.replace(/_/g, ' ')}</span>
      </div>
      <span className="text-xs text-slate-500 flex-shrink-0">
        {new Date(activity.timestamp ?? activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  )
}
