import type { OpenClawAgent } from '@/hooks/useAgentConfig'

// Agent definitions with OpenClaw ports
export const AGENTS = [
  { id: 'caesar', name: 'Caesar', port: 18789, role: 'Orchestrator' },
  { id: 'athena', name: 'Athena', port: 18790, role: 'Planner' },
  { id: 'vulcan', name: 'Vulcan', port: 18791, role: 'Builder' },
  { id: 'janus', name: 'Janus', port: 18792, role: 'Verifier' },
  { id: 'minerva', name: 'Minerva', port: 18793, role: 'Researcher' },
  { id: 'mercury', name: 'Mercury', port: 18795, role: 'Messenger' },
  { id: 'apollo', name: 'Apollo', port: 18798, role: 'Creative Director' },
  { id: 'cicero', name: 'Cicero', port: 18797, role: 'Content Creator' },
  { id: 'oracle', name: 'Oracle', port: 18799, role: 'Data Analyst' },
  { id: 'cato', name: 'Cato', port: 18800, role: 'DevOps Engineer' },
] as const;

export type AgentId = typeof AGENTS[number]['id'];

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

// Default agent colors by role - map both friendly names AND role-based IDs
const AGENT_COLORS: Record<string, string> = {
  // Friendly names
  caesar: '#DC2626',    // Crimson - Orchestrator
  athena: '#06B6D4',    // Teal - Planner
  vulcan: '#EA580C',    // Amber - Builder
  janus: '#D946EF',     // Blue/Gold - Verifier
  minerva: '#10B981',   // Emerald - Researcher
  mercury: '#C0C0C0',   // Silver - Messenger
  apollo: '#EAB308',    // Golden - Creative Director
  cicero: '#7C3AED',    // Purple - Content Creator
  oracle: '#4338CA',    // Indigo - Data Analyst
  cato: '#8B5E3C',      // Stone Gray - DevOps
  // Role-based IDs from OpenClaw config
  main: '#DC2626',      // Red - Orchestrator (caesar)
  planner: '#06B6D4',   // Teal - Planner (athena)
  builder: '#EA580C',   // Amber - Builder (vulcan)
  verifier: '#D946EF',  // Blue - Verifier (janus)
  researcher: '#10B981', // Emerald - Researcher (minerva)
}

// Agent avatars - map both friendly names AND role-based IDs from API
const AGENT_AVATARS: Record<string, string> = {
  // Friendly names
  caesar: '/agents/caesar.png',
  athena: '/agents/athena.png',
  vulcan: '/agents/vulcan.png',
  janus: '/agents/janus.png',
  minerva: '/agents/minerva.png',
  mercury: '/agents/mercury.png',
  apollo: '/agents/apollo.png',
  cicero: '/agents/cicero.png',
  oracle: '/agents/oracle.png',
  cato: '/agents/cato.png',
  // Role-based IDs from OpenClaw config
  main: '/agents/caesar.png',
  planner: '/agents/athena.png',
  builder: '/agents/vulcan.png',
  verifier: '/agents/janus.png',
  researcher: '/agents/minerva.png',
}

// Agent emojis - map both friendly names AND role-based IDs
const AGENT_EMOJIS: Record<string, string> = {
  // Friendly names
  caesar: '🔴',
  athena: '🩵',
  vulcan: '🔥',
  janus: '🌗',
  minerva: '💚',
  mercury: '⚡️',
  apollo: '☀️',
  cicero: '🟣',
  oracle: '🔮',
  cato: '🗿',
  // Role-based IDs from OpenClaw config
  main: '🔴',
  planner: '🩵',
  builder: '🔥',
  verifier: '🌗',
  researcher: '💚',
}

// Default avatar URL (fallback)
const DEFAULT_AVATAR = '/avatars/default-agent.png'

// Normalize avatar URL - handle raw config values like "avatar.png" or "/Users/..."
function normalizeAvatarUrl(avatar: string | undefined, agentId: string): string {
  if (!avatar) {
    return AGENT_AVATARS[agentId] || DEFAULT_AVATAR
  }
  
  // Valid web paths - use as-is
  if (avatar.startsWith('/agents/') || avatar.startsWith('/avatars/') || avatar.startsWith('http')) {
    return avatar
  }
  
  // Invalid paths (just filename, absolute filesystem path, etc.) - use fallback
  return AGENT_AVATARS[agentId] || DEFAULT_AVATAR
}

// Transform OpenClawAgent to AgentDisplay
function toAgentDisplay(agent: OpenClawAgent): AgentDisplay {
  // Use name.toLowerCase() as the canonical ID for lookups (API returns database UUIDs)
  const friendlyId = (agent.name || agent.id || '').toLowerCase()
  const agentDef = AGENTS.find(a => a.id === friendlyId || a.name.toLowerCase() === friendlyId)
  const role = agentDef?.role || agent.title || 'Agent'
  
  return {
    id: agent.id, // Keep original ID for API calls
    name: agent.identity?.name || agent.name || agent.id || 'Unknown',
    emoji: agent.identity?.emoji || AGENT_EMOJIS[friendlyId] || AGENT_EMOJIS[agent.id] || '🤖',
    avatar: normalizeAvatarUrl(agent.avatar || agent.identity?.avatar, friendlyId),
    role,
    color: AGENT_COLORS[friendlyId] || AGENT_COLORS[agent.id] || '#6B7280',
  }
}

// Council members are Caesar only (Lux dropped)
// Map both friendly names AND role-based IDs (main = caesar)
const COUNCIL_AGENT_IDS = ['caesar', 'main']
const COUNCIL_DISPLAY_ORDER = ['caesar']

// Normalize agent ID to friendly name
function normalizeAgentId(id: string): string {
  const idMap: Record<string, string> = {
    main: 'caesar',
    planner: 'athena',
    builder: 'vulcan',
    verifier: 'janus',
    researcher: 'minerva',
  }
  return idMap[id] || id
}

export function getCouncilMembers(agents: OpenClawAgent[]): AgentDisplay[] {
  // Find council members from API data
  // Match by id, normalized id, OR name (since API returns database UUIDs, not friendly IDs)
  const apiCouncil = agents
    .filter(a => {
      if (!a.name && !a.id) return false
      const name = (a.name || a.id || '').toLowerCase()
      return COUNCIL_AGENT_IDS.includes(a.id) ||
        COUNCIL_AGENT_IDS.includes(normalizeAgentId(a.id)) ||
        COUNCIL_AGENT_IDS.includes(name)
    })
    .map(a => ({ ...toAgentDisplay(a), id: (a.name || a.id || '').toLowerCase() }))
  
  // Always include all council members - use fallback for missing ones
  const result: AgentDisplay[] = []
  for (const memberId of COUNCIL_DISPLAY_ORDER) {
    const fromApi = apiCouncil.find(m => m.id === memberId)
    const fallback = FALLBACK_COUNCIL.find(m => m.id === memberId)
    result.push(fromApi || fallback!)
  }
  
  return result
}

// Bot army includes all agents
export function getBotArmy(agents: OpenClawAgent[]): AgentDisplay[] {
  // Transform API agents - use name.toLowerCase() as the canonical ID
  const apiAgents = agents
    .filter(a => a.name || a.id)
    .map(a => ({
      ...toAgentDisplay(a),
      id: (a.name || a.id || '').toLowerCase()
    }))
  
  // Merge with fallback to ensure all expected agents are present
  const result: AgentDisplay[] = []
  const seenIds = new Set<string>()
  
  // Add all API agents first
  for (const agent of apiAgents) {
    if (!seenIds.has(agent.id)) {
      result.push(agent)
      seenIds.add(agent.id)
    }
  }
  
  // Add any missing fallback agents (like Lux)
  for (const fallback of FALLBACK_BOT_ARMY) {
    if (!seenIds.has(fallback.id)) {
      result.push(fallback)
      seenIds.add(fallback.id)
    }
  }
  
  // Sort by the expected order
  const orderMap = FALLBACK_BOT_ARMY.reduce((acc, a, i) => ({ ...acc, [a.id]: i }), {} as Record<string, number>)
  return result.sort((a, b) => (orderMap[a.id] ?? 99) - (orderMap[b.id] ?? 99))
}

// Fallback data when API is unavailable - Council is Caesar and Lux
export const FALLBACK_COUNCIL: AgentDisplay[] = [
  { id: 'caesar', name: 'Caesar', emoji: '🔴', avatar: '/agents/caesar.png', role: 'Orchestrator', color: '#DC2626', status: 'online' },
]

export const FALLBACK_BOT_ARMY: AgentDisplay[] = [
  ...FALLBACK_COUNCIL,
  { id: 'athena', name: 'Athena', emoji: '🩵', avatar: '/agents/athena.png', role: 'Planner', color: '#06B6D4', status: 'online' },
  { id: 'vulcan', name: 'Vulcan', emoji: '🔥', avatar: '/agents/vulcan.png', role: 'Builder', color: '#EA580C', status: 'online' },
  { id: 'janus', name: 'Janus', emoji: '🌗', avatar: '/agents/janus.png', role: 'Verifier', color: '#D946EF', status: 'online' },
  { id: 'minerva', name: 'Minerva', emoji: '💚', avatar: '/agents/minerva.png', role: 'Researcher', color: '#10B981', status: 'online' },
  { id: 'mercury', name: 'Mercury', emoji: '⚡️', avatar: '/agents/mercury.png', role: 'Messenger', color: '#C0C0C0', status: 'online' },
  { id: 'apollo', name: 'Apollo', emoji: '☀️', avatar: '/agents/apollo.png', role: 'Creative Director', color: '#EAB308', status: 'online' },
  { id: 'cicero', name: 'Cicero', emoji: '🟣', avatar: '/agents/cicero.png', role: 'Content Creator', color: '#7C3AED', status: 'online' },
  { id: 'oracle', name: 'Oracle', emoji: '🔮', avatar: '/agents/oracle.png', role: 'Data Analyst', color: '#4338CA', status: 'online' },
  { id: 'cato', name: 'Cato', emoji: '🗿', avatar: '/agents/cato.png', role: 'DevOps Engineer', color: '#8B5E3C', status: 'online' },
]

export async function checkAgentHealth(port: number, timeoutMs: number = 2000): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    // Try health endpoint first
    const response = await fetch(`http://localhost:${port}/health`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeout);
    return response.ok;
  } catch {
    clearTimeout(timeout);
    
    // Fallback: try root endpoint
    const controller2 = new AbortController();
    const timeout2 = setTimeout(() => controller2.abort(), timeoutMs);
    
    try {
      const response = await fetch(`http://localhost:${port}/`, {
        signal: controller2.signal,
        method: 'HEAD'
      });
      clearTimeout(timeout2);
      return response.status < 500; // Any non-server-error response means it's alive
    } catch {
      clearTimeout(timeout2);
      return false;
    }
  }
}
