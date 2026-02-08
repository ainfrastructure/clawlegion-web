/**
 * Agent-related types shared across pages
 */

export type AgentStatus = 'online' | 'offline' | 'busy' | 'idle' | 'error' | 'rate_limited'

export interface Agent {
  id: string
  name: string
  emoji?: string
  avatar?: string
  type: string
  role?: string
  title?: string
  description?: string
  color?: string
  status: AgentStatus | string
  currentTaskId?: string
  currentTask?: string
  currentSessionId?: string
  healthEndpoint?: string
  capabilities?: string[]
  stats?: AgentStats
  lastActiveAt?: string
  rateLimitedUntil?: string
  createdAt: string
}

export interface AgentStats {
  tasksCompleted: number
  totalDuration: number
  avgDuration: number
  failureRate: number
}

export interface HealthResult {
  id: string
  reachable: boolean
  latencyMs?: number
  error?: string
}

export interface HealthData {
  agents: HealthResult[]
  summary: {
    total: number
    reachable: number
    unreachable: number
    noEndpoint: number
  }
}
