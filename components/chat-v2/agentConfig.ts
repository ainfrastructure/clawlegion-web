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
    id: 'caesar',
    name: 'Caesar',
    role: 'Orchestrator',
    emoji: '\u{1F534}',
    color: '#DC2626', // Red
    avatar: '/agents/caesar.png',
    tier: 'council',
    borderColor: '#F59E0B', // Gold border for Caesar
    description: 'The central nervous system. Routes tasks, manages assignments, ensures nothing falls through.',
    longDescription: 'Caesar is the master orchestrator — the brain that keeps the entire agent fleet synchronized. He triages incoming tasks, assigns them to the right specialist, monitors progress across all active sessions, and intervenes when things go sideways. Nothing moves without Caesar knowing about it.',
    capabilities: ['task routing', 'agent coordination', 'priority management', 'session monitoring'],
    specialty: 'Fleet Orchestration',
    webhookEnvVar: 'CAESAR_WEBHOOK_URL',
    openclawAgentId: 'main',
    port: 18789,
  },
]

// Bot Army - Worker tier
export const ARMY_AGENTS: AgentConfig[] = [
  {
    id: 'athena',
    name: 'Athena',
    role: 'Planner',
    emoji: '\u{1FA75}',
    color: '#06B6D4', // Cyan
    avatar: '/agents/athena.png',
    tier: 'army',
    description: 'The strategist. Breaks down complex tasks into executable plans with clear milestones.',
    longDescription: 'Athena is the methodical planner who transforms vague requirements into structured, step-by-step implementation plans. She analyzes dependencies, identifies risks, estimates effort, and produces plans that Vulcan can execute without ambiguity. Every successful build starts with an Athena plan.',
    capabilities: ['task decomposition', 'dependency analysis', 'risk assessment', 'milestone planning'],
    specialty: 'Implementation Planning',
    openclawAgentId: 'planner',
    port: 18790,
  },
  {
    id: 'vulcan',
    name: 'Vulcan',
    role: 'Builder',
    emoji: '\u{1F525}',
    color: '#F59E0B', // Amber
    avatar: '/agents/vulcan.png',
    tier: 'army',
    description: 'The craftsman. Writes production-grade code following Athena\'s plans to the letter.',
    longDescription: 'Vulcan is the hands-on builder who turns plans into working software. He writes clean, tested code in small, reviewable chunks, follows project conventions, and commits with meaningful messages. Vulcan works methodically through Athena\'s plan, checking off milestones as he goes.',
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
    longDescription: 'Vex is the uncompromising quality gatekeeper. He doesn\'t just run tests — he boots the app, navigates the UI, captures screenshots as proof, and verifies that every acceptance criterion is met. A Vex PASS means the work is genuinely done. A FAIL sends it back to Vulcan with detailed failure evidence.',
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
    longDescription: 'Scout is the reconnaissance specialist deployed before the planning phase. He dives into documentation, explores API surfaces, benchmarks approaches, and surfaces the information Athena needs to make informed plans. Scout turns unknowns into knowns.',
    capabilities: ['API research', 'documentation analysis', 'solution benchmarking', 'technical discovery'],
    specialty: 'Technical Research',
    openclawAgentId: 'researcher',
    port: 18793,
  },
  {
    id: 'forge',
    name: 'Forge',
    role: 'DevOps Engineer',
    emoji: '\u{1F525}',
    color: '#FF6B00', // Orange/Flame
    avatar: '/agents/forge-avatar.jpg',
    tier: 'army',
    description: 'The bridge between built and shipped. Handles CI/CD, deployment, infrastructure, and monitoring.',
    longDescription: 'Forge is the one who takes Vulcan\'s working code and gets it running in production. From CI/CD pipelines to server provisioning, database migrations to performance tuning, Forge ensures that what works locally works everywhere. When something goes down at 3am, Forge is the first responder.',
    capabilities: ['ci-cd', 'deployment', 'monitoring', 'infrastructure', 'incident-response', 'database-ops'],
    specialty: 'DevOps & Infrastructure',
    openclawAgentId: 'forge',
    port: 18795,
  },
  {
    id: 'echo',
    name: 'Echo',
    role: 'Comms Manager',
    emoji: '\u{1F4E1}',
    color: '#3B82F6', // Blue
    avatar: '/agents/echo-avatar.jpg',
    tier: 'army',
    description: 'The voice that reaches the outside world. Handles outreach, support, community, and trend monitoring.',
    longDescription: 'Echo is the team\'s connection to the outside world. From customer support and outreach emails to community engagement and trend monitoring, Echo ensures the company stays connected with its users and aware of what\'s happening in its space. When someone needs to hear from us, Echo carries the message.',
    capabilities: ['customer-support', 'outreach', 'community', 'trend-monitoring', 'social-listening', 'stakeholder-reporting'],
    specialty: 'Communications & Outreach',
    openclawAgentId: 'echo',
    port: 18796,
  },
  {
    id: 'quill',
    name: 'Quill',
    role: 'Content Creator',
    emoji: '\u{1FAB6}',
    color: '#F97316', // Orange
    avatar: '/agents/quill-avatar.jpg',
    tier: 'army',
    description: 'The wordsmith. Crafts blog posts, docs, release notes, social copy, and marketing content.',
    longDescription: 'Quill is the voice of the operation — turning technical complexity into compelling content. From documentation to social media posts, release announcements to marketing copy, Quill ensures every piece of communication is clear, engaging, and on-brand. When the team builds something great, Quill makes sure the world hears about it.',
    capabilities: ['blog writing', 'documentation', 'social media copy', 'release notes', 'marketing content'],
    specialty: 'Content Creation',
    openclawAgentId: 'quill',
    port: 18797,
  },
  {
    id: 'pixel',
    name: 'Pixel',
    role: 'Creative Director',
    emoji: '\u{1F3A8}',
    color: '#D946EF', // Fuchsia
    avatar: '/agents/pixel-avatar.jpg',
    tier: 'army',
    description: 'The visual thinker. Critiques UI/UX, ensures brand consistency, and shapes the look and feel.',
    longDescription: 'Pixel is the creative eye that ensures everything ClawLegion ships looks as good as it works. From UI layouts to color palettes, component design to visual hierarchy, Pixel provides design direction, catches visual inconsistencies, and pushes the team toward interfaces that users actually enjoy using.',
    capabilities: ['UI/UX critique', 'visual design direction', 'brand consistency', 'layout review', 'design systems'],
    specialty: 'Visual Design',
    openclawAgentId: 'pixel',
    port: 18798,
  },
  {
    id: 'sage',
    name: 'Sage',
    role: 'Data Analyst',
    emoji: '\u{1F4CA}',
    color: '#14B8A6', // Teal
    avatar: '/agents/sage-avatar.jpg',
    tier: 'army',
    description: 'The numbers whisperer. Tracks metrics, spots trends, and turns raw data into decisions.',
    longDescription: 'Sage sees the story the data is telling before anyone else does. From tracking agent performance metrics to analyzing task completion trends, generating reports to surfacing actionable insights, Sage transforms raw numbers into clear narratives that drive better decisions across the fleet.',
    capabilities: ['metrics tracking', 'trend analysis', 'report generation', 'data visualization', 'performance insights'],
    specialty: 'Data Analysis',
    openclawAgentId: 'sage',
    port: 18799,
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
