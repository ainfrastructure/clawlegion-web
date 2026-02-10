import type { OpenClawAgent } from '@/hooks/useAgentConfig'

// Agent definitions with OpenClaw ports
export const AGENTS = [
  { id: 'caesar', name: 'Caesar', port: 18789, role: 'Orchestrator' },
  { id: 'lux', name: 'Lux', port: 18796, role: 'Council Member' },
  { id: 'athena', name: 'Athena', port: 18790, role: 'Planner' },
  { id: 'vulcan', name: 'Vulcan', port: 18791, role: 'Builder' },
  { id: 'vex', name: 'Vex', port: 18792, role: 'Verifier' },
  { id: 'scout', name: 'Scout', port: 18793, role: 'Researcher' },
  { id: 'ralph', name: 'Ralph', port: 18794, role: 'Loop Orchestrator' },
  { id: 'quill', name: 'Quill', port: 18797, role: 'Content Creator' },
  { id: 'pixel', name: 'Pixel', port: 18798, role: 'Creative Director' },
  { id: 'sage', name: 'Sage', port: 18799, role: 'Data Analyst' },
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
  caesar: '#DC2626',    // Red - Orchestrator
  lux: '#A855F7',       // Purple - Council Member
  athena: '#06B6D4',    // Cyan - Planner
  vulcan: '#F59E0B',    // Amber - Builder
  vex: '#10B981',       // Emerald - Verifier
  scout: '#06B6D4',     // Cyan - Researcher
  ralph: '#EC4899',     // Pink - Loop Orchestrator
  quill: '#F97316',     // Orange - Content Creator
  pixel: '#D946EF',     // Fuchsia - Creative Director
  sage: '#14B8A6',      // Teal - Data Analyst
  // Role-based IDs from OpenClaw config
  main: '#DC2626',      // Red - Orchestrator (caesar)
  planner: '#06B6D4',   // Cyan - Planner (athena)
  builder: '#F59E0B',   // Amber - Builder (vulcan)
  verifier: '#10B981',  // Emerald - Verifier (Vex)
  researcher: '#06B6D4', // Cyan - Researcher (Scout)
}

// Agent avatars - map both friendly names AND role-based IDs from API
const AGENT_AVATARS: Record<string, string> = {
  // Friendly names
  caesar: '/agents/caesar.png',
  athena: '/agents/athena.png',
  vulcan: '/agents/vulcan.png',
  vex: '/agents/vex.jpg',
  scout: '/agents/scout.jpg',
  ralph: '/agents/ralph.jpg',
  lux: '/agents/lux-lobster.png',
  quill: '/agents/quill-writer.svg',
  pixel: '/agents/pixel-designer.svg',
  sage: '/agents/sage-analyst.svg',
  // Role-based IDs from OpenClaw config
  main: '/agents/caesar.png',
  planner: '/agents/athena.png',
  builder: '/agents/vulcan.png',
  verifier: '/agents/vex.jpg',
  researcher: '/agents/scout.jpg',
}

// Agent emojis - map both friendly names AND role-based IDs
const AGENT_EMOJIS: Record<string, string> = {
  // Friendly names
  caesar: '🔴',
  athena: '🩵',
  vulcan: '🔥',
  vex: '🧪',
  scout: '🔭',
  ralph: '🔄',
  lux: '✨',
  quill: '🪶',
  pixel: '🎨',
  sage: '📊',
  // Role-based IDs from OpenClaw config
  main: '🔴',
  planner: '🩵',
  builder: '🔥',
  verifier: '🧪',
  researcher: '🔭',
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

// Council members are Caesar and Lux
// Map both friendly names AND role-based IDs (main = caesar)
const COUNCIL_AGENT_IDS = ['caesar', 'lux', 'main']
const COUNCIL_DISPLAY_ORDER = ['caesar', 'lux']

// Normalize agent ID to friendly name
function normalizeAgentId(id: string): string {
  const idMap: Record<string, string> = {
    main: 'caesar',
    planner: 'athena',
    builder: 'vulcan',
    verifier: 'vex',
    researcher: 'scout',
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
  { id: 'lux', name: 'Lux', emoji: '✨', avatar: '/agents/lux-lobster.png', role: 'Council Member', color: '#A855F7', status: 'online' },
]

export const FALLBACK_BOT_ARMY: AgentDisplay[] = [
  ...FALLBACK_COUNCIL,
  { id: 'athena', name: 'Athena', emoji: '🩵', avatar: '/agents/athena.png', role: 'Planner', color: '#06B6D4', status: 'online' },
  { id: 'vulcan', name: 'Vulcan', emoji: '🔥', avatar: '/agents/vulcan.png', role: 'Builder', color: '#F59E0B', status: 'online' },
  { id: 'vex', name: 'Vex', emoji: '🧪', avatar: '/agents/vex.jpg', role: 'Verifier', color: '#10B981', status: 'online' },
  { id: 'scout', name: 'Scout', emoji: '🔭', avatar: '/agents/scout.jpg', role: 'Researcher', color: '#06B6D4', status: 'online' },
  { id: 'ralph', name: 'Ralph', emoji: '🔄', avatar: '/agents/ralph.jpg', role: 'Loop Orchestrator', color: '#EC4899', status: 'online' },
  { id: 'quill', name: 'Quill', emoji: '🪶', avatar: '/agents/quill-writer.svg', role: 'Content Creator', color: '#F97316', status: 'online' },
  { id: 'pixel', name: 'Pixel', emoji: '🎨', avatar: '/agents/pixel-designer.svg', role: 'Creative Director', color: '#D946EF', status: 'online' },
  { id: 'sage', name: 'Sage', emoji: '📊', avatar: '/agents/sage-analyst.svg', role: 'Data Analyst', color: '#14B8A6', status: 'online' },
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
