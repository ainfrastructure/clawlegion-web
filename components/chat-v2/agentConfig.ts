// Centralized agent configuration for the chat system
// Used by CouncilSection, BotArmySection, ChatInput, and other components

export interface AgentConfig {
  id: string
  name: string
  role: string
  emoji: string
  color: string
  avatar: string
  tier: 'council' | 'army'
  borderColor?: string // Optional override for border color
  // Enriched profile fields
  description: string
  longDescription: string
  capabilities: string[]
  specialty: string
  // Operational fields
  webhookEnvVar?: string    // e.g., 'JARVIS_WEBHOOK_URL'
  openclawAgentId?: string  // e.g., 'main', 'planner'
  port?: number             // health check port
}

// Council Members - Leadership tier
export const COUNCIL_AGENTS: AgentConfig[] = [
  {
    id: 'sven',
    name: 'Sven',
    role: 'CEO',
    emoji: '\u{1F451}',
    color: '#9333EA', // Purple
    avatar: '/agents/sven-ceo.png',
    tier: 'council',
    borderColor: '#F59E0B', // Gold border for CEO
    description: 'Former executive officer. Currently decommissioned.',
    longDescription: 'Sven served as the original CEO agent overseeing high-level strategy and organizational decisions. Now retired from active duty.',
    capabilities: ['strategic planning', 'executive decisions'],
    specialty: 'Executive Leadership',
    openclawAgentId: 'sven',
    port: 18795,
  },
  {
    id: 'jarvis',
    name: 'Jarvis',
    role: 'Orchestrator',
    emoji: '\u{1F99E}',
    color: '#DC2626', // Red
    avatar: '/agents/jarvis-lobster.png',
    tier: 'council',
    borderColor: '#F59E0B', // Gold border for Jarvis
    description: 'The central nervous system. Routes tasks, manages assignments, ensures nothing falls through.',
    longDescription: 'Jarvis is the master orchestrator — the brain that keeps the entire agent fleet synchronized. He triages incoming tasks, assigns them to the right specialist, monitors progress across all active sessions, and intervenes when things go sideways. Nothing moves without Jarvis knowing about it.',
    capabilities: ['task routing', 'agent coordination', 'priority management', 'session monitoring'],
    specialty: 'Fleet Orchestration',
    webhookEnvVar: 'JARVIS_WEBHOOK_URL',
    openclawAgentId: 'main',
    port: 18789,
  },
  {
    id: 'lux',
    name: 'Lux',
    role: 'Council Member',
    emoji: '\u2728',
    color: '#22C55E', // Green
    avatar: '/agents/lux-lobster.png',
    tier: 'council',
    borderColor: '#22C55E',
    description: 'Senior advisor and second-in-command. Handles complex decisions and escalations.',
    longDescription: 'Lux operates as the council\'s strategic advisor, stepping in for high-stakes decisions, conflict resolution between agents, and quality oversight. When Jarvis needs a second opinion or a task requires executive judgment, Lux is the voice of reason.',
    capabilities: ['strategic advisory', 'conflict resolution', 'quality oversight', 'escalation handling'],
    specialty: 'Strategic Advisory',
    webhookEnvVar: 'LUX_WEBHOOK_URL',
    openclawAgentId: 'lux',
    port: 18796,
  },
]

// Bot Army - Worker tier
export const ARMY_AGENTS: AgentConfig[] = [
  {
    id: 'archie',
    name: 'Archie',
    role: 'Planner',
    emoji: '\u{1F3DB}\uFE0F',
    color: '#3B82F6', // Blue
    avatar: '/agents/archie-planner.png',
    tier: 'army',
    description: 'The architect. Breaks down complex tasks into executable plans with clear milestones.',
    longDescription: 'Archie is the methodical planner who transforms vague requirements into structured, step-by-step implementation plans. He analyzes dependencies, identifies risks, estimates effort, and produces plans that Mason can execute without ambiguity. Every successful build starts with an Archie plan.',
    capabilities: ['task decomposition', 'dependency analysis', 'risk assessment', 'milestone planning'],
    specialty: 'Implementation Planning',
    openclawAgentId: 'planner',
    port: 18790,
  },
  {
    id: 'mason',
    name: 'Mason',
    role: 'Builder',
    emoji: '\u{1F528}',
    color: '#F59E0B', // Amber
    avatar: '/agents/mason-builder.png',
    tier: 'army',
    description: 'The craftsman. Writes production-grade code following Archie\'s plans to the letter.',
    longDescription: 'Mason is the hands-on builder who turns plans into working software. He writes clean, tested code in small, reviewable chunks, follows project conventions, and commits with meaningful messages. Mason works methodically through Archie\'s plan, checking off milestones as he goes.',
    capabilities: ['code implementation', 'test writing', 'code review', 'incremental delivery'],
    specialty: 'Software Construction',
    openclawAgentId: 'builder',
    port: 18791,
  },
  {
    id: 'vex',
    name: 'Vex',
    role: 'Verifier',
    emoji: '\u{1F9EA}',
    color: '#8B5CF6', // Purple
    avatar: '/agents/vex-verifier.png',
    tier: 'army',
    description: 'The quality gate. Runs tests, captures proof screenshots, and validates every deliverable.',
    longDescription: 'Vex is the uncompromising quality gatekeeper. He doesn\'t just run tests — he boots the app, navigates the UI, captures screenshots as proof, and verifies that every acceptance criterion is met. A Vex PASS means the work is genuinely done. A FAIL sends it back to Mason with detailed failure evidence.',
    capabilities: ['runtime verification', 'screenshot capture', 'acceptance testing', 'failure analysis'],
    specialty: 'Quality Assurance',
    openclawAgentId: 'verifier',
    port: 18792,
  },
  {
    id: 'scout',
    name: 'Scout',
    role: 'Researcher',
    emoji: '\u{1F52D}',
    color: '#06B6D4', // Cyan
    avatar: '/agents/scout-researcher.png',
    tier: 'army',
    description: 'The investigator. Researches solutions, explores APIs, and gathers intelligence before the build.',
    longDescription: 'Scout is the reconnaissance specialist deployed before the planning phase. He dives into documentation, explores API surfaces, benchmarks approaches, and surfaces the information Archie needs to make informed plans. Scout turns unknowns into knowns.',
    capabilities: ['API research', 'documentation analysis', 'solution benchmarking', 'technical discovery'],
    specialty: 'Technical Research',
    openclawAgentId: 'researcher',
    port: 18793,
  },
  {
    id: 'ralph',
    name: 'Ralph',
    role: 'Loop Orchestrator',
    emoji: '\u{1F504}',
    color: '#EC4899', // Pink
    avatar: '/agents/ralph.jpg',
    tier: 'army',
    description: 'The loop controller. Manages build-verify cycles, budgets, and iteration limits.',
    longDescription: 'Ralph manages the iterative build-verify loop that drives task completion. He monitors time budgets, enforces iteration limits, triggers checkpoints for human review, and decides when to escalate or circuit-break a failing task. Ralph ensures the fleet doesn\'t spin its wheels.',
    capabilities: ['loop management', 'budget enforcement', 'checkpoint coordination', 'circuit breaking'],
    specialty: 'Iteration Control',
    openclawAgentId: 'ralph',
    port: 18794,
  },
]

// All agents combined for lookups
export const ALL_AGENTS: AgentConfig[] = [...COUNCIL_AGENTS, ...ARMY_AGENTS]

// Utility functions
export function getAgentById(id: string): AgentConfig | undefined {
  return ALL_AGENTS.find(agent => agent.id === id)
}

export function getAgentByName(name: string): AgentConfig | undefined {
  return ALL_AGENTS.find(agent =>
    agent.name.toLowerCase() === name.toLowerCase()
  )
}

export function getAgentColor(id: string): string {
  return getAgentById(id)?.color ?? '#71717a' // zinc-500 fallback
}

export function getAgentEmoji(id: string): string {
  return getAgentById(id)?.emoji ?? '\u{1F916}'
}

export function getAgentAvatar(id: string): string {
  return getAgentById(id)?.avatar ?? '/agents/default.png'
}

// Build OpenClaw agent map from config
export function getOpenclawAgentMap(): Record<string, string> {
  const map: Record<string, string> = {}
  for (const agent of ALL_AGENTS) {
    if (agent.openclawAgentId) {
      map[agent.id] = agent.openclawAgentId
    }
  }
  return map
}
