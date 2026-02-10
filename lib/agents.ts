import type { OpenClawAgent } from '@/hooks/useAgentConfig'
import {
  ALL_AGENTS,
  COUNCIL_AGENTS,
  ARMY_AGENTS,
  resolveAgentId,
  type AgentConfig,
} from '@/components/chat-v2/agentConfig'

// Agent definitions derived from canonical agentConfig
export const AGENTS = ALL_AGENTS.map(a => ({
  id: a.id,
  name: a.name,
  port: a.port!,
  role: a.role,
})) as readonly { id: string; name: string; port: number; role: string }[]

export type AgentId = typeof AGENTS[number]['id']

export interface AgentPresence {
  id: string
  name: string
  role: string
  status: "online" | "busy" | "away" | "offline"
  port: number
  lastChecked: string
}

export interface AgentDisplay {
  id: string
  name: string
  emoji: string
  avatar: string
  role: string
  color: string
  borderColor?: string
  status?: 'online' | 'busy' | 'away' | 'offline'
}

// Derived color/avatar/emoji maps — include both agent IDs and openclawAgentIds
const AGENT_COLORS: Record<string, string> = {}
const AGENT_AVATARS: Record<string, string> = {}
const AGENT_EMOJIS: Record<string, string> = {}

for (const agent of ALL_AGENTS) {
  AGENT_COLORS[agent.id] = agent.color
  AGENT_AVATARS[agent.id] = agent.avatar
  AGENT_EMOJIS[agent.id] = agent.emoji
  if (agent.openclawAgentId) {
    AGENT_COLORS[agent.openclawAgentId] = agent.color
    AGENT_AVATARS[agent.openclawAgentId] = agent.avatar
    AGENT_EMOJIS[agent.openclawAgentId] = agent.emoji
  }
}

const DEFAULT_AVATAR = '/avatars/default-agent.png'

// Normalize avatar URL - handle raw config values like "avatar.png" or "/Users/..."
function normalizeAvatarUrl(avatar: string | undefined, agentId: string): string {
  if (!avatar) {
    return AGENT_AVATARS[agentId] || DEFAULT_AVATAR
  }
  if (avatar.startsWith('/agents/') || avatar.startsWith('/avatars/') || avatar.startsWith('http')) {
    return avatar
  }
  return AGENT_AVATARS[agentId] || DEFAULT_AVATAR
}

// Normalize agent ID to friendly name via agentConfig aliases
function normalizeAgentId(id: string): string {
  return resolveAgentId(id) ?? id
}

// Transform OpenClawAgent to AgentDisplay
function toAgentDisplay(agent: OpenClawAgent): AgentDisplay {
  const friendlyId = (agent.name || agent.id || '').toLowerCase()
  const agentDef = AGENTS.find(a => a.id === friendlyId || a.name.toLowerCase() === friendlyId)
  const role = agentDef?.role || agent.title || 'Agent'

  return {
    id: agent.id,
    name: agent.identity?.name || agent.name || agent.id || 'Unknown',
    emoji: agent.identity?.emoji || AGENT_EMOJIS[friendlyId] || AGENT_EMOJIS[agent.id] || '🤖',
    avatar: normalizeAvatarUrl(agent.avatar || agent.identity?.avatar, friendlyId),
    role,
    color: AGENT_COLORS[friendlyId] || AGENT_COLORS[agent.id] || '#6B7280',
  }
}

// Council agent IDs derived from agentConfig
const COUNCIL_AGENT_IDS = [
  ...COUNCIL_AGENTS.map(a => a.id),
  ...COUNCIL_AGENTS.filter(a => a.openclawAgentId).map(a => a.openclawAgentId!),
]
const COUNCIL_DISPLAY_ORDER = COUNCIL_AGENTS.map(a => a.id)

export function getCouncilMembers(agents: OpenClawAgent[]): AgentDisplay[] {
  const apiCouncil = agents
    .filter(a => {
      if (!a.name && !a.id) return false
      const name = (a.name || a.id || '').toLowerCase()
      return COUNCIL_AGENT_IDS.includes(a.id) ||
        COUNCIL_AGENT_IDS.includes(normalizeAgentId(a.id)) ||
        COUNCIL_AGENT_IDS.includes(name)
    })
    .map(a => ({ ...toAgentDisplay(a), id: (a.name || a.id || '').toLowerCase() }))

  const result: AgentDisplay[] = []
  for (const memberId of COUNCIL_DISPLAY_ORDER) {
    const fromApi = apiCouncil.find(m => m.id === memberId)
    const fallback = FALLBACK_COUNCIL.find(m => m.id === memberId)
    result.push(fromApi || fallback!)
  }

  return result
}

export function getBotArmy(agents: OpenClawAgent[]): AgentDisplay[] {
  const apiAgents = agents
    .filter(a => a.name || a.id)
    .map(a => ({
      ...toAgentDisplay(a),
      id: (a.name || a.id || '').toLowerCase()
    }))

  const result: AgentDisplay[] = []
  const seenIds = new Set<string>()

  for (const agent of apiAgents) {
    if (!seenIds.has(agent.id)) {
      result.push(agent)
      seenIds.add(agent.id)
    }
  }

  for (const fallback of FALLBACK_BOT_ARMY) {
    if (!seenIds.has(fallback.id)) {
      result.push(fallback)
      seenIds.add(fallback.id)
    }
  }

  const orderMap = FALLBACK_BOT_ARMY.reduce((acc, a, i) => ({ ...acc, [a.id]: i }), {} as Record<string, number>)
  return result.sort((a, b) => (orderMap[a.id] ?? 99) - (orderMap[b.id] ?? 99))
}

// Fallback data derived from agentConfig
function toFallbackDisplay(agent: AgentConfig): AgentDisplay {
  return {
    id: agent.id,
    name: agent.name,
    emoji: agent.emoji,
    avatar: agent.avatar,
    role: agent.role,
    color: agent.color,
    borderColor: agent.borderColor,
    status: 'online',
  }
}

export const FALLBACK_COUNCIL: AgentDisplay[] = COUNCIL_AGENTS.map(toFallbackDisplay)

export const FALLBACK_BOT_ARMY: AgentDisplay[] = [
  ...COUNCIL_AGENTS.map(toFallbackDisplay),
  ...ARMY_AGENTS.map(toFallbackDisplay),
]

export async function checkAgentHealth(port: number, timeoutMs: number = 2000): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`http://localhost:${port}/health`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeout);
    return response.ok;
  } catch {
    clearTimeout(timeout);

    const controller2 = new AbortController();
    const timeout2 = setTimeout(() => controller2.abort(), timeoutMs);

    try {
      const response = await fetch(`http://localhost:${port}/`, {
        signal: controller2.signal,
        method: 'HEAD'
      });
      clearTimeout(timeout2);
      return response.status < 500;
    } catch {
      clearTimeout(timeout2);
      return false;
    }
  }
}
