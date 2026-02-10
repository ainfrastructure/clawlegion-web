'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { PageContainer } from '@/components/layout'
import { AgentProfilePanel, type AgentData, type AgentStatus } from '@/components/agents'
import { OrgAgentCard } from '@/components/agents/OrgAgentCard'
import { AgentDetailModal } from '@/components/agents/AgentDetailModal'
import { AddAgentModal } from '@/components/agents/AddAgentModal'
import { DEFAULT_PRESETS, AGENT_METADATA } from '@/lib/flow-presets'
import type { FlowPreset } from '@/components/flow-config/types'
import { getAgentByName, getAgentById, ALL_AGENTS } from '@/components/chat-v2/agentConfig'
import {
  Users,
  GitBranch,
  RefreshCw,
  Loader2,
  ArrowRight,
  Bot,
  Lock,
  Plus,
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
const LEADERSHIP_NAMES = ['caesar', 'lux']

export default function AgentOrgPage() {
  const [selectedAgent, setSelectedAgent] = useState<AgentData | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [configAgentId, setConfigAgentId] = useState<string | null>(null)
  const [showAddAgent, setShowAddAgent] = useState(false)

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
              Team structure and flow presets
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button
              data-testid="btn-add-agent"
              onClick={() => setShowAddAgent(true)}
              className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium"
            >
              <Plus size={16} /> Add Agent
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 glass-2 rounded-lg text-sm text-white hover:bg-slate-700/50 transition-colors"
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
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
                <div className="flex flex-wrap justify-center gap-5">
                  {leadershipAgents.map((agent) => (
                    <div key={agent.id} className="w-full max-w-lg">
                      <OrgAgentCard
                        agent={agent}
                        variant="featured"
                        onClick={() => handleAgentClick(agent)}
                      />
                    </div>
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

      {/* Flow Presets */}
      <div className="glass-2 rounded-xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
              <GitBranch className="text-green-400" size={20} /> Flow Presets
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Pre-configured agent pipelines for common workflows
            </p>
          </div>
          <Link
            href="/flows"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
          >
            Open Flow Builder <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {DEFAULT_PRESETS.map((preset) => {
            const enabledAgents = preset.agents.filter(a => a.enabled)
            const primaryAgent = enabledAgents[0]
            const primaryColor = primaryAgent ? getAgentById(primaryAgent.role)?.color : undefined

            return (
              <Link
                key={preset.id}
                href={`/flows?preset=${preset.id}`}
                className="group relative rounded-xl cursor-pointer transition-all duration-200 overflow-hidden"
              >
                {/* Gradient border from primary agent color */}
                {primaryColor && (
                  <div
                    className="absolute -inset-px rounded-xl opacity-30 group-hover:opacity-50 transition-opacity"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}40, transparent 60%)`,
                    }}
                  />
                )}

                <div className="relative rounded-xl p-4 glass-2 group-hover:border-white/[0.1] transition-colors h-full">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      {/* Title */}
                      <div className="flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-slate-600 flex-shrink-0" />
                        <p className="text-sm font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                          {preset.name}
                        </p>
                      </div>
                      {/* Description */}
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-1">
                        {preset.description}
                      </p>
                      {/* Stacked avatars + count */}
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {enabledAgents.slice(0, 5).map((agent, i) => {
                            const agentData = getAgentById(agent.role)
                            const avatarSrc = agentData?.avatar
                            const agentColor = agentData?.color || '#64748b'
                            const meta = AGENT_METADATA[agent.role as keyof typeof AGENT_METADATA]
                            return (
                              <div
                                key={agent.role}
                                className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-offset-1 ring-offset-slate-900 relative"
                                style={{
                                  ['--tw-ring-color' as string]: agentColor,
                                  zIndex: 5 - i,
                                }}
                                title={meta?.name || agent.role}
                              >
                                {avatarSrc ? (
                                  <Image
                                    src={avatarSrc}
                                    alt={meta?.name || agent.role}
                                    width={24}
                                    height={24}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                    <Bot className="w-3 h-3 text-slate-500" />
                                  </div>
                                )}
                              </div>
                            )
                          })}
                          {enabledAgents.length > 5 && (
                            <span className="text-[10px] text-slate-500 ml-1.5">+{enabledAgents.length - 5}</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-600">
                          {enabledAgents.length} agents
                        </span>
                      </div>
                      {/* Mini flow preview dots */}
                      <div className="flex items-center gap-0.5 mt-2">
                        {enabledAgents.slice(0, 6).map((agent, i) => {
                          const agentColor = getAgentById(agent.role)?.color || '#64748b'
                          return (
                            <div key={agent.role} className="flex items-center">
                              <div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: agentColor }}
                              />
                              {i < Math.min(enabledAgents.length, 6) - 1 && (
                                <div className="w-3 h-px bg-slate-700" />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-slate-600 group-hover:text-cyan-400 transition-colors mt-0.5 flex-shrink-0" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
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
