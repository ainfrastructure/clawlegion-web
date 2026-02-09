'use client'

import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageContainer } from '@/components/layout'
import { AgentProfilePanel, type AgentData, type AgentStatus } from '@/components/agents'
import { OrgAgentCard } from '@/components/agents/OrgAgentCard'
import { AgentDetailModal } from '@/components/agents/AgentDetailModal'
import { FlowConfigPanel } from '@/components/flow-config/FlowConfigPanel'
import { DEFAULT_CONFIG } from '@/lib/flow-presets'
import type { FlowConfiguration } from '@/components/flow-config/types'
import { getAgentByName, ALL_AGENTS } from '@/components/chat-v2/agentConfig'
import {
  Users,
  GitBranch,
  RefreshCw,
  Loader2,
} from 'lucide-react'

// ============================================
// AGENT ORGANIZATION PAGE - Redesigned
// ============================================

interface ApiAgent {
  id: string
  name: string
  emoji?: string
  avatar?: string
  role: string
  title?: string
  description?: string
  color?: string
  status: string
  currentTask?: string
  healthEndpoint?: string
  capabilities?: string[]
  stats?: {
    tasksCompleted?: number
    avgResponseTime?: number
  }
}

interface HealthData {
  agents: Array<{
    id: string
    reachable: boolean
    latencyMs?: number
  }>
}

async function fetchAgents(): Promise<ApiAgent[]> {
  const res = await fetch('/api/agents?includeOffline=true')
  if (!res.ok) throw new Error('Failed to fetch agents')
  const data = await res.json()
  return data.agents || []
}

async function fetchHealth(): Promise<HealthData> {
  const res = await fetch('/api/agents/health')
  if (!res.ok) throw new Error('Failed to fetch health')
  return res.json()
}

// Leadership agent names (matched by name since DB IDs are CUIDs)
const LEADERSHIP_NAMES = ['jarvis', 'lux']

export default function AgentOrgPage() {
  const [selectedAgent, setSelectedAgent] = useState<AgentData | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [configAgentId, setConfigAgentId] = useState<string | null>(null)
  const [flowConfig, setFlowConfig] = useState<FlowConfiguration>(DEFAULT_CONFIG)

  const {
    data: agents,
    isLoading: agentsLoading,
    error: agentsError,
    refetch: refetchAgents,
  } = useQuery({
    queryKey: ['agents-org'],
    queryFn: fetchAgents,
    refetchInterval: 30000,
  })

  const {
    data: healthData,
    refetch: refetchHealth,
  } = useQuery({
    queryKey: ['agents-health'],
    queryFn: fetchHealth,
    refetchInterval: 30000,
  })

  // Merge agent data with health, filter to canonical roster only
  const canonicalIds = new Set(ALL_AGENTS.map(a => a.id))
  const backendAgents: AgentData[] = (agents || [])
    .filter((agent) => {
      const friendlyId = agent.name?.toLowerCase() || agent.id
      return canonicalIds.has(friendlyId) || canonicalIds.has(agent.id)
    })
    .map((agent) => {
      const health = healthData?.agents?.find((h) => h.id === agent.id || h.id === agent.name?.toLowerCase())
      return {
        ...agent,
        status: agent.status as AgentData['status'],
        reachable: health?.reachable,
        latencyMs: health?.latencyMs,
      }
    })

  // Ensure all canonical agents appear, even if backend doesn't know about them yet
  const seenIds = new Set(backendAgents.map(a => a.name?.toLowerCase() || a.id))
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
        status: (health?.reachable ? 'online' : 'offline') as AgentData['status'],
        reachable: health?.reachable,
        latencyMs: health?.latencyMs,
        capabilities: a.capabilities,
      }
    })

  const allAgents: AgentData[] = [...backendAgents, ...missingAgents]

  // Two-tier split — match by name since DB IDs are CUIDs
  const isLeadership = (a: AgentData) => LEADERSHIP_NAMES.includes(a.name?.toLowerCase() || '')
  const leadershipAgents = allAgents.filter(isLeadership)
  const specialistAgents = allAgents.filter((a) => !isLeadership(a))

  const handleRefresh = () => {
    refetchAgents()
    refetchHealth()
  }

  const handleAgentClick = (agent: AgentData) => {
    setSelectedAgent(agent)
    setShowDetailModal(true)
  }

  const handleOpenConfig = (agentId: string) => {
    setShowDetailModal(false)
    // agentId here is a DB CUID — resolve to display ID via name
    const agent = allAgents.find((a) => a.id === agentId)
    const enriched = agent ? getAgentByName(agent.name) : null
    setConfigAgentId(enriched?.id || agentId)
  }

  const handleFlowConfigChange = useCallback((config: FlowConfiguration) => {
    setFlowConfig(config)
  }, [])

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
              <Users className="text-blue-400" size={28} /> Agent Organization
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-1">
              Team structure and task workflow pipeline
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 glass-2 rounded-lg text-sm text-white hover:bg-slate-700/50 transition-colors"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">The Team</h2>

        {agentsLoading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 className="animate-spin mr-2" size={20} />
            Loading agents...
          </div>
        ) : agentsError ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <p className="text-red-400">Failed to load agents. Please try again.</p>
            <button
              onClick={handleRefresh}
              className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm text-red-300 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : allAgents.length === 0 ? (
          <div className="glass-2 rounded-xl p-8 text-center">
            <Users className="mx-auto mb-4 text-slate-500" size={40} />
            <p className="text-slate-400">No agents registered</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Leadership row — featured variant */}
            {leadershipAgents.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Leadership</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {leadershipAgents.map((agent) => (
                    <OrgAgentCard
                      key={agent.id}
                      agent={agent}
                      variant="featured"
                      onClick={() => handleAgentClick(agent)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Specialists grid */}
            {specialistAgents.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Specialists</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {specialistAgents.map((agent) => (
                    <OrgAgentCard
                      key={agent.id}
                      agent={agent}
                      onClick={() => handleAgentClick(agent)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task Flow Pipeline — configurable */}
      <div className="glass-2 rounded-xl p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
            <GitBranch className="text-green-400" size={20} /> Task Flow Pipeline
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Configure the OpenClaw agent pipeline — toggle agents, set resource levels, and tune loop parameters.
          </p>
        </div>
        <FlowConfigPanel
          config={flowConfig}
          onChange={handleFlowConfigChange}
        />
      </div>

      {/* Agent Detail Modal */}
      <AgentDetailModal
        agent={selectedAgent}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onOpenConfig={handleOpenConfig}
      />

      {/* Agent Profile Panel (config) */}
      {configAgentId && (
        <AgentProfilePanel
          agentId={configAgentId}
          agentStatus={(allAgents.find((a) => a.name.toLowerCase() === configAgentId?.toLowerCase())?.status as AgentStatus) || 'offline'}
          onClose={() => setConfigAgentId(null)}
        />
      )}
    </PageContainer>
  )
}
