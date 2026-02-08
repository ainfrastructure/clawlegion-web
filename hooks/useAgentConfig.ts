'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

// Types matching the API response
export interface AgentIdentity {
  name: string
  emoji?: string
  avatar?: string
}

export interface AgentHeartbeat {
  every?: string
  activeHours?: {
    start: string
    end: string
    timezone: string
  }
}

export interface OpenClawAgent {
  id: string
  name: string
  workspace: string
  heartbeat?: AgentHeartbeat
  identity?: AgentIdentity
  subagents?: {
    allowAgents?: string[]
  }
  model?: string
  thinking?: {
    type: string
    budget_tokens?: number
  }
  // Additional fields from API
  title?: string
  avatar?: string
  color?: string
  description?: string
  status?: 'online' | 'offline' | 'busy' | 'away'
}

export interface AgentDefaults {
  workspace?: string
  thinkingDefault?: string
  heartbeat?: AgentHeartbeat
  maxConcurrent?: number
  models?: Record<string, { alias?: string }>
  subagents?: {
    maxConcurrent?: number
  }
}

export interface ModelOption {
  id: string
  name: string
  tier: string
}

export interface ThinkingLevel {
  id: string
  name: string
  budgetTokens: number
}

export interface AgentConfigResponse {
  agent: OpenClawAgent
  defaults: AgentDefaults
  models: ModelOption[]
  thinkingLevels: ThinkingLevel[]
}

export interface AgentListResponse {
  agents: OpenClawAgent[]
  defaults: AgentDefaults
  configPath: string
}

export interface SoulResponse {
  content: string
  path: string
  lastModified: string
  agentName: string
  summary: string
}

export interface AgentsmdResponse {
  content: string
  path: string
  lastModified: string
  agentName: string
  summary: string
}

// ============================================
// Hooks
// ============================================

/**
 * Fetch list of all agents from openclaw.json
 */
export function useAgentList() {
  return useQuery<AgentListResponse>({
    queryKey: ['agent-config'],
    queryFn: async () => {
      const res = await api.get('/agent-config')
      return res.data
    },
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Fetch a specific agent's config
 */
export function useAgentConfig(agentId: string | null) {
  return useQuery<AgentConfigResponse>({
    queryKey: ['agent-config', agentId],
    queryFn: async () => {
      if (!agentId) throw new Error('Agent ID required')
      const res = await api.get(`/agent-config/${agentId}`)
      return res.data
    },
    enabled: !!agentId,
    staleTime: 30000,
    retry: false,
  })
}

/**
 * Fetch an agent's SOUL.md content
 */
export function useSoul(agentId: string | null) {
  return useQuery<SoulResponse>({
    queryKey: ['soul', agentId],
    queryFn: async () => {
      if (!agentId) throw new Error('Agent ID required')
      const res = await api.get(`/soul/${agentId}`)
      return res.data
    },
    enabled: !!agentId,
    staleTime: 60000, // 1 minute
    retry: false,
  })
}

/**
 * Update an agent's config
 */
export function useUpdateAgentConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      agentId,
      updates,
    }: {
      agentId: string
      updates: Partial<OpenClawAgent>
    }) => {
      const res = await api.put(`/agent-config/${agentId}`, updates)
      return res.data
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['agent-config'] })
      queryClient.invalidateQueries({ queryKey: ['agent-config', variables.agentId] })
    },
  })
}

/**
 * Update an agent's SOUL.md
 */
export function useUpdateSoul() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      agentId,
      content,
    }: {
      agentId: string
      content: string
    }) => {
      const res = await api.put(`/soul/${agentId}`, { content })
      return res.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['soul', variables.agentId] })
    },
  })
}

/**
 * Fetch an agent's AGENTS.md content
 */
export function useAgentsmd(agentId: string | null) {
  return useQuery<AgentsmdResponse>({
    queryKey: ['agentsmd', agentId],
    queryFn: async () => {
      if (!agentId) throw new Error('Agent ID required')
      const res = await api.get(`/agentsmd/${agentId}`)
      return res.data
    },
    enabled: !!agentId,
    staleTime: 60000, // 1 minute
    retry: false,
  })
}

/**
 * Update an agent's AGENTS.md
 */
export function useUpdateAgentsmd() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      agentId,
      content,
    }: {
      agentId: string
      content: string
    }) => {
      const res = await api.put(`/agentsmd/${agentId}`, { content })
      return res.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agentsmd', variables.agentId] })
    },
  })
}

/**
 * Restart the OpenClaw gateway
 */
export function useRestartGateway() {
  return useMutation({
    mutationFn: async () => {
      const res = await api.post('/gateways/openclaw/restart')
      return res.data
    },
  })
}

/**
 * Get gateway status
 */
export function useGatewayStatus() {
  return useQuery({
    queryKey: ['gateway-status'],
    queryFn: async () => {
      const res = await api.get('/gateways/openclaw/status')
      return res.data
    },
    refetchInterval: 10000, // Poll every 10 seconds
  })
}
