'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import Image from 'next/image'
import api from '@/lib/api'
import { PageContainer } from '@/components/layout'
import { AgentProfilePanel, type AgentData, type AgentStatus } from '@/components/agents'
import { FleetAgentCardWithActivity } from '@/components/agents/FleetAgentCardWithActivity'
import { getAgentByName, ALL_AGENTS } from '@/components/chat-v2/agentConfig'
import { StatusDot } from '@/components/ui/StatusBadge'
import { connectSocket } from '@/lib/socket'
import {
  Bot,
  CheckCircle2,
  Activity,
  Loader2,
  Plus,
  Square,
  Wifi,
  WifiOff,
  Radio
} from 'lucide-react'
import { AddAgentModal } from '@/components/agents/AddAgentModal'

import type { Agent, HealthData } from '@/types'

type ApiAgent = Agent

interface LiveActivityEvent {
  id?: string
  timestamp?: string
  createdAt?: string
  agentName?: string
  agent?: { name?: string }
  action?: string
  type?: string
  summary?: string
  detail?: string
}

export default function AgentFleetPage() {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [selectedAgentStatus, setSelectedAgentStatus] = useState<AgentStatus>('offline')
  const [showAddAgent, setShowAddAgent] = useState(false)
  const [liveActivities, setLiveActivities] = useState<LiveActivityEvent[]>([])
  const [socketConnected, setSocketConnected] = useState(false)

  // Fetch agents
  const {
    data: agentsData,
    isLoading: agentsLoading,
    refetch: refetchAgents
  } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.get('/agents?includeOffline=true').then(r => r.data),
    refetchInterval: 10000,
  })

  // Fetch health data
  const {
    data: healthData,
    refetch: refetchHealth
  } = useQuery<HealthData>({
    queryKey: ['agents-health'],
    queryFn: () => fetch('/api/agents/health').then(r => r.json()),
    refetchInterval: 30000,
  })

  // Socket.io live activity stream
  useEffect(() => {
    const socket = connectSocket()
    setSocketConnected(socket.connected)

    const onConnect = () => setSocketConnected(true)
    const onDisconnect = () => setSocketConnected(false)

    const onActivityEvents = (data: { agentName?: string; events?: LiveActivityEvent[] }) => {
      if (!data.events?.length) return
      const enriched = data.events.map(e => ({
        ...e,
        agentName: e.agentName || data.agentName,
      }))
      setLiveActivities(prev => [...enriched, ...prev].slice(0, 50))
    }

    const onActivityBackfill = (data: { agentName?: string; events?: LiveActivityEvent[] }) => {
      if (!data.events?.length) return
      const enriched = data.events.map(e => ({
        ...e,
        agentName: e.agentName || data.agentName,
      }))
      setLiveActivities(prev => {
        const merged = [...enriched, ...prev]
        // Deduplicate by id if present
        const seen = new Set<string>()
        const unique = merged.filter(e => {
          if (!e.id) return true
          if (seen.has(e.id)) return false
          seen.add(e.id)
          return true
        })
        return unique.slice(0, 50)
      })
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('activity:events', onActivityEvents)
    socket.on('activity:backfill', onActivityBackfill)

    // Subscribe to all agents
    for (const agent of ALL_AGENTS) {
      socket.emit('subscribe:agent', { agentName: agent.id, lastN: 10 })
    }

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('activity:events', onActivityEvents)
      socket.off('activity:backfill', onActivityBackfill)
      for (const agent of ALL_AGENTS) {
        socket.emit('unsubscribe:agent', { agentName: agent.id })
      }
    }
  }, [])

  const rawAgents: ApiAgent[] = agentsData?.agents ?? agentsData ?? []

  // Merge agents with health data
  const agents: AgentData[] = rawAgents.map(agent => {
    const health = healthData?.agents?.find(h => h.id === agent.id || h.id === agent.name?.toLowerCase())

    let derivedStatus: AgentStatus = 'offline'
    if (health?.reachable) {
      derivedStatus = agent.currentTaskId ? 'busy' : 'online'
    }

    return {
      id: agent.id,
      name: agent.name,
      emoji: agent.emoji,
      avatar: agent.avatar,
      role: agent.role || agent.title || agent.type,
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

  // Filter out agents not in canonical config
  const canonicalIds = new Set(ALL_AGENTS.map(a => a.id))
  const knownAgents = agents.filter(a => {
    const friendlyId = a.name?.toLowerCase() || a.id
    return canonicalIds.has(friendlyId) || canonicalIds.has(a.id)
  })

  // Ensure all canonical agents appear
  const seenIds = new Set(knownAgents.map(a => a.name?.toLowerCase() || a.id))
  const missingAgents: AgentData[] = ALL_AGENTS
    .filter(a => !seenIds.has(a.id))
    .map(a => {
      const health = healthData?.agents?.find(h => h.id === a.id)
      return {
        id: a.id,
        name: a.name,
        emoji: a.emoji,
        avatar: a.avatar,
        role: a.role,
        title: a.role,
        description: a.description,
        color: a.color,
        status: (health?.reachable ? 'online' : 'offline') as AgentStatus,
        reachable: health?.reachable,
        latencyMs: health?.latencyMs,
        capabilities: a.capabilities,
      }
    })

  const visibleAgents = [...knownAgents, ...missingAgents]

  // Split Caesar from army agents
  const caesarAgent = visibleAgents.find(a => a.name?.toLowerCase() === 'caesar' || a.id === 'caesar')
  const armyAgents = visibleAgents.filter(a => a.name?.toLowerCase() !== 'caesar' && a.id !== 'caesar')

  // Stats
  const totalAgents = visibleAgents.length
  const activeAgents = visibleAgents.filter(a => a.status === 'online' || a.status === 'busy').length
  const totalCompleted = visibleAgents.reduce((sum, a) => sum + (a.stats?.tasksCompleted ?? 0), 0)

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

  const handleAgentClick = useCallback((agent: AgentData) => {
    const enriched = getAgentByName(agent.name)
    setSelectedAgentId(enriched?.id || agent.id)
    setSelectedAgentStatus(agent.status)
  }, [])

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
              <Bot className="text-blue-400" size={28} /> Agent Fleet
            </h1>
            <p className="text-sm sm:text-base text-slate-400">Monitor and control your AI agents</p>
          </div>
          {/* Buttons — Add Agent + Emergency Stop only */}
          <div className="flex gap-2 sm:gap-3">
            <button
              data-testid="btn-add-agent"
              onClick={() => setShowAddAgent(true)}
              className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium"
            >
              <Plus size={16} /> Add Agent
            </button>
            <button
              data-testid="btn-emergency-stop"
              onClick={() => emergencyStop.mutate()}
              disabled={emergencyStop.isPending}
              className="px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium"
            >
              <Square size={16} /> Emergency Stop
            </button>
          </div>
        </div>

        {/* Quick Stats — 3 cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <StatCard icon={<Bot size={20} />} label="Total Agents" value={totalAgents} color="blue" />
          <StatCard icon={<Activity size={20} />} label="Active Now" value={activeAgents} color="green" />
          <StatCard icon={<CheckCircle2 size={20} />} label="Completed" value={totalCompleted} color="purple" />
        </div>
      </div>

      {/* Caesar Hero Section */}
      {caesarAgent && <CaesarHeroCard agent={caesarAgent} onClick={() => handleAgentClick(caesarAgent)} />}

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
          ) : armyAgents.length === 0 ? (
            <div className="glass-2 rounded-xl p-6 sm:p-8 text-center">
              <Bot className="mx-auto mb-4 text-slate-500" size={40} />
              <p className="text-slate-400">No agents registered yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {armyAgents.map((agent) => (
                <FleetAgentCardWithActivity
                  key={agent.id}
                  agent={agent}
                  onClick={() => handleAgentClick(agent)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Live Activity Feed */}
        <div className="glass-2 rounded-xl p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <Activity className="text-green-400" size={20} /> Live Activity
            {socketConnected && (
              <span className="flex items-center gap-1 ml-auto">
                <Radio size={10} className="text-green-400 animate-pulse" />
                <span className="text-[10px] text-green-400/70 font-medium uppercase">Live</span>
              </span>
            )}
          </h2>

          <div className="space-y-2 max-h-[400px] sm:max-h-[600px] overflow-y-auto">
            {liveActivities.length === 0 ? (
              <div className="text-slate-400 text-center py-8">
                <Activity size={24} className="mx-auto mb-2 text-slate-600" />
                <p className="text-sm">No recent activity</p>
                {!socketConnected && (
                  <p className="text-xs text-slate-500 mt-1">Connecting to live stream...</p>
                )}
              </div>
            ) : (
              liveActivities.map((activity, i) => (
                <LiveActivityItem key={activity.id ?? `live-${i}`} activity={activity} />
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

function CaesarHeroCard({ agent, onClick }: { agent: AgentData; onClick: () => void }) {
  const caesarConfig = getAgentByName('Caesar')
  const avatarSrc = agent.avatar || caesarConfig?.avatar
  const description = caesarConfig?.longDescription || caesarConfig?.description || agent.description || ''
  const capabilities = caesarConfig?.capabilities || agent.capabilities || []
  const specialty = caesarConfig?.specialty || 'Fleet Orchestration'

  return (
    <div className="mb-6 sm:mb-8">
      <div
        className="glass-2 rounded-2xl p-6 sm:p-8 cursor-pointer group hover:-translate-y-0.5 transition-all duration-200"
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick()}
      >
        <div className="flex flex-col items-center">
          {/* Avatar with gold glow */}
          <div className="relative mb-5">
            {/* Outer gold glow */}
            <div className="absolute -inset-3 rounded-full bg-amber-500/20 group-hover:bg-amber-500/30 blur-md transition-all" />
            <div className="absolute -inset-1.5 rounded-full bg-amber-500/10 group-hover:bg-amber-500/20 transition-all" />
            {/* Avatar */}
            <div
              className="relative w-[160px] h-[160px] rounded-full overflow-hidden ring-3 ring-amber-500/60 ring-offset-2 ring-offset-slate-900 group-hover:ring-amber-400/80 transition-all"
            >
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt="Caesar"
                  width={160}
                  height={160}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-6xl">
                  {agent.emoji || '\u{1F99E}'}
                </div>
              )}
            </div>
            {/* Status dot */}
            <div className="absolute bottom-2 right-2 p-0.5 rounded-full bg-slate-900">
              <StatusDot status={agent.status} size="lg" />
            </div>
          </div>

          {/* Name + Role */}
          <h2 className="text-2xl font-bold text-white mb-1">Caesar</h2>
          <p className="text-sm font-semibold text-amber-400 mb-1">Orchestrator</p>
          <p className="text-xs text-slate-500 mb-4">{specialty}</p>

          {/* Description */}
          <p className="text-sm text-slate-400 text-center max-w-xl mb-4 leading-relaxed">
            {description}
          </p>

          {/* Capabilities */}
          {capabilities.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {capabilities.map((cap) => (
                <span
                  key={cap}
                  className="glass-1 text-xs text-amber-300/80 px-3 py-1 rounded-full border border-amber-500/20"
                >
                  {cap}
                </span>
              ))}
            </div>
          )}

          {/* Health indicator */}
          <div className="flex items-center gap-2 text-xs pt-3 border-t border-white/[0.06]">
            {agent.reachable === null || agent.reachable === undefined ? (
              <span className="text-slate-500">Checking health...</span>
            ) : agent.reachable ? (
              <>
                <Wifi size={12} className="text-green-400" />
                <span className="text-green-400">Reachable</span>
                {agent.latencyMs !== undefined && (
                  <span className="text-slate-500">({agent.latencyMs}ms)</span>
                )}
              </>
            ) : (
              <>
                <WifiOff size={12} className="text-red-400" />
                <span className="text-red-400">Unreachable</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function LiveActivityItem({ activity }: { activity: LiveActivityEvent }) {
  const typeIcons: Record<string, React.ReactNode> = {
    tool_call: <span className="text-blue-400 text-xs">{'>'}</span>,
    tool_result: <CheckCircle2 size={12} className="text-green-400" />,
    message: <Activity size={12} className="text-slate-400" />,
    session_start: <Radio size={12} className="text-blue-400" />,
    thinking: <Loader2 size={12} className="text-purple-400" />,
    system: <Bot size={12} className="text-slate-500" />,
    model_change: <Bot size={12} className="text-amber-400" />,
  }

  const actionIcons: Record<string, React.ReactNode> = {
    task_started: <Activity size={12} className="text-blue-400" />,
    task_completed: <CheckCircle2 size={12} className="text-green-400" />,
    task_failed: <Square size={12} className="text-red-400" />,
  }

  const icon = typeIcons[activity.type || ''] || actionIcons[activity.action || ''] || <Activity size={12} className="text-slate-400" />
  const label = activity.summary || activity.action?.replace(/_/g, ' ') || activity.type?.replace(/_/g, ' ') || 'event'
  const agentName = activity.agentName || activity.agent?.name || 'System'
  const ts = activity.timestamp || activity.createdAt

  return (
    <div className="flex items-center gap-2 sm:gap-3 py-2 px-2 sm:px-3 rounded bg-slate-900/30 hover:bg-slate-900/50">
      <span className="flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0 truncate">
        <span className="text-xs sm:text-sm text-white font-medium capitalize">{agentName}</span>
        <span className="text-xs sm:text-sm text-slate-400"> {label}</span>
      </div>
      {ts && (
        <span className="text-xs text-slate-500 flex-shrink-0">
          {new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  )
}
