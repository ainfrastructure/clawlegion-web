import type {
  FlowPreset,
  FlowConfiguration,
  AgentConfig,
  AgentRole,
  AgentMetadata,
  ResourceLevelMetadata,
  RalphLoopSettings,
  Checkpoint,
  PipelineStep
} from '@/components/flow-config/types'
import { ALL_AGENTS } from '@/components/chat-v2/agentConfig'

// Map hex colors from agentConfig to Tailwind color names used by flow-config
const hexToColorName: Record<string, AgentMetadata['color']> = {
  '#DC2626': 'red',
  '#22C55E': 'emerald',
  '#3B82F6': 'blue',
  '#F59E0B': 'amber',
  '#8B5CF6': 'purple',
  '#06B6D4': 'cyan',
  '#EC4899': 'pink',
  '#F97316': 'amber',   // Orange → closest Tailwind match
  '#D946EF': 'purple',  // Fuchsia → closest Tailwind match
  '#14B8A6': 'emerald', // Teal → closest Tailwind match
}

// Map agentConfig tiers to flow-config tiers
const tierMap: Record<string, AgentMetadata['tier']> = {
  council: 'council',
  army: 'worker',
}

// Agents enabled by default in flow presets
const defaultEnabledAgents = new Set(['athena', 'vulcan', 'vex'])

/**
 * Agent metadata for UI display — derived from canonical agentConfig
 */
export const AGENT_METADATA: Record<AgentRole, AgentMetadata> = Object.fromEntries(
  ALL_AGENTS
    .map(a => [
      a.id as AgentRole,
      {
        name: a.name,
        emoji: a.emoji,
        color: hexToColorName[a.color] ?? 'blue',
        description: a.description,
        defaultEnabled: defaultEnabledAgents.has(a.id),
        tier: a.id === 'caesar' ? 'orchestrator' as AgentMetadata['tier'] : tierMap[a.tier] ?? 'worker',
      } satisfies AgentMetadata,
    ])
) as Record<AgentRole, AgentMetadata>

/**
 * Resource level options for dropdowns
 */
export const RESOURCE_LEVELS: ResourceLevelMetadata[] = [
  { value: 'high', label: 'High', description: 'Maximum resources, fastest execution' },
  { value: 'medium', label: 'Medium', description: 'Balanced performance' },
  { value: 'low', label: 'Low', description: 'Minimal resources, cost-effective' },
  { value: 'local', label: 'Local', description: 'Run on local machine only' },
]

/**
 * Default checkpoints
 */
export const DEFAULT_CHECKPOINTS: Checkpoint[] = [
  { percentage: 25, enabled: true },
  { percentage: 50, enabled: true },
  { percentage: 75, enabled: true },
]

/**
 * System presets - these cannot be deleted or modified
 */
export const DEFAULT_PRESETS: FlowPreset[] = [
  {
    id: 'quick-fix',
    name: 'Quick Fix',
    description: 'Fast iteration for small bugs and hotfixes',
    isSystem: true,
    agents: [
      { role: 'scout', enabled: false, resourceLevel: 'low' },
      { role: 'athena', enabled: false, resourceLevel: 'low' },
      { role: 'vulcan', enabled: true, resourceLevel: 'medium' },
      { role: 'vex', enabled: true, resourceLevel: 'low' },
    ],
    loopSettings: {
      timeBudgetHours: 1,
      maxIterations: 5,
      failThreshold: 2,
      checkpoints: [
        { percentage: 25, enabled: false },
        { percentage: 50, enabled: true },
        { percentage: 75, enabled: false },
      ],
      expansionApprovalThreshold: 50,
      roiThreshold: 30,
    },
  },
  {
    id: 'standard',
    name: 'Standard',
    description: 'Balanced approach for typical features',
    isSystem: true,
    agents: [
      { role: 'scout', enabled: false, resourceLevel: 'medium' },
      { role: 'athena', enabled: true, resourceLevel: 'medium' },
      { role: 'vulcan', enabled: true, resourceLevel: 'medium' },
      { role: 'vex', enabled: true, resourceLevel: 'medium' },
    ],
    loopSettings: {
      timeBudgetHours: 4,
      maxIterations: 20,
      failThreshold: 3,
      checkpoints: [
        { percentage: 25, enabled: true },
        { percentage: 50, enabled: true },
        { percentage: 75, enabled: true },
      ],
      expansionApprovalThreshold: 60,
      roiThreshold: 40,
    },
  },
  {
    id: 'deep-work',
    name: 'Deep Work',
    description: 'Thorough analysis for complex features',
    isSystem: true,
    agents: [
      { role: 'scout', enabled: true, resourceLevel: 'high' },
      { role: 'athena', enabled: true, resourceLevel: 'high' },
      { role: 'vulcan', enabled: true, resourceLevel: 'high' },
      { role: 'vex', enabled: true, resourceLevel: 'high' },
    ],
    loopSettings: {
      timeBudgetHours: 8,
      maxIterations: 50,
      failThreshold: 5,
      checkpoints: [
        { percentage: 25, enabled: true },
        { percentage: 50, enabled: true },
        { percentage: 75, enabled: true },
      ],
      expansionApprovalThreshold: 70,
      roiThreshold: 50,
    },
  },
  {
    id: 'research-only',
    name: 'Research Only',
    description: 'Investigation and analysis without implementation',
    isSystem: true,
    agents: [
      { role: 'scout', enabled: true, resourceLevel: 'high' },
      { role: 'athena', enabled: true, resourceLevel: 'medium' },
      { role: 'vulcan', enabled: false, resourceLevel: 'low' },
      { role: 'vex', enabled: false, resourceLevel: 'low' },
    ],
    loopSettings: {
      timeBudgetHours: 2,
      maxIterations: 10,
      failThreshold: 3,
      checkpoints: [
        { percentage: 25, enabled: false },
        { percentage: 50, enabled: true },
        { percentage: 75, enabled: false },
      ],
      expansionApprovalThreshold: 40,
      roiThreshold: 20,
    },
  },
  {
    id: 'content-pipeline',
    name: 'Content Pipeline',
    description: 'Research, write, design, and distribute content end-to-end',
    isSystem: true,
    agents: [
      { role: 'scout', enabled: true, resourceLevel: 'medium' },
      { role: 'quill', enabled: true, resourceLevel: 'high' },
      { role: 'pixel', enabled: true, resourceLevel: 'medium' },
      { role: 'mercury', enabled: true, resourceLevel: 'medium' },
    ],
    loopSettings: {
      timeBudgetHours: 4,
      maxIterations: 15,
      failThreshold: 3,
      checkpoints: [
        { percentage: 25, enabled: true },
        { percentage: 50, enabled: true },
        { percentage: 75, enabled: true },
      ],
      expansionApprovalThreshold: 60,
      roiThreshold: 40,
    },
  },
  {
    id: 'brand-launch',
    name: 'Brand Launch',
    description: 'Data-driven brand campaign with creative assets',
    isSystem: true,
    agents: [
      { role: 'sage', enabled: true, resourceLevel: 'high' },
      { role: 'quill', enabled: true, resourceLevel: 'high' },
      { role: 'pixel', enabled: true, resourceLevel: 'high' },
      { role: 'mercury', enabled: true, resourceLevel: 'medium' },
    ],
    loopSettings: {
      timeBudgetHours: 6,
      maxIterations: 25,
      failThreshold: 4,
      checkpoints: [
        { percentage: 25, enabled: true },
        { percentage: 50, enabled: true },
        { percentage: 75, enabled: true },
      ],
      expansionApprovalThreshold: 70,
      roiThreshold: 50,
    },
  },
  {
    id: 'growth-analytics',
    name: 'Growth & Analytics',
    description: 'Outreach, measure performance, and generate reports',
    isSystem: true,
    agents: [
      { role: 'mercury', enabled: true, resourceLevel: 'medium' },
      { role: 'sage', enabled: true, resourceLevel: 'high' },
      { role: 'quill', enabled: true, resourceLevel: 'medium' },
    ],
    loopSettings: {
      timeBudgetHours: 3,
      maxIterations: 15,
      failThreshold: 3,
      checkpoints: [
        { percentage: 25, enabled: false },
        { percentage: 50, enabled: true },
        { percentage: 75, enabled: true },
      ],
      expansionApprovalThreshold: 50,
      roiThreshold: 35,
    },
  },
  {
    id: 'full-stack-deploy',
    name: 'Full Stack Deploy',
    description: 'End-to-end development with deployment and verification',
    isSystem: true,
    agents: [
      { role: 'scout', enabled: true, resourceLevel: 'medium' },
      { role: 'athena', enabled: true, resourceLevel: 'high' },
      { role: 'vulcan', enabled: true, resourceLevel: 'high' },
      { role: 'vex', enabled: true, resourceLevel: 'high' },
      { role: 'forge', enabled: true, resourceLevel: 'medium' },
    ],
    loopSettings: {
      timeBudgetHours: 8,
      maxIterations: 40,
      failThreshold: 5,
      checkpoints: [
        { percentage: 25, enabled: true },
        { percentage: 50, enabled: true },
        { percentage: 75, enabled: true },
      ],
      expansionApprovalThreshold: 70,
      roiThreshold: 50,
    },
  },
]

/**
 * Default flow configuration (Standard preset)
 */
export const DEFAULT_CONFIG: FlowConfiguration = {
  agents: DEFAULT_PRESETS[1].agents.map(a => ({ ...a })), // Clone to avoid mutation
  loopSettings: { ...DEFAULT_PRESETS[1].loopSettings, checkpoints: DEFAULT_PRESETS[1].loopSettings.checkpoints.map(c => ({ ...c })) },
  presetId: 'standard',
}

/**
 * Get a preset by ID
 */
export function getPresetById(id: string, userPresets: FlowPreset[] = []): FlowPreset | undefined {
  return [...DEFAULT_PRESETS, ...userPresets].find(p => p.id === id)
}

/**
 * Check if a configuration matches a preset exactly
 */
export function configMatchesPreset(config: FlowConfiguration, preset: FlowPreset): boolean {
  // Compare agents
  for (let i = 0; i < config.agents.length; i++) {
    const a = config.agents[i]
    const b = preset.agents[i]
    if (a.role !== b.role || a.enabled !== b.enabled || a.resourceLevel !== b.resourceLevel) {
      return false
    }
  }

  // Compare loop settings
  const cs = config.loopSettings
  const ps = preset.loopSettings
  
  if (
    cs.timeBudgetHours !== ps.timeBudgetHours ||
    cs.maxIterations !== ps.maxIterations ||
    cs.failThreshold !== ps.failThreshold ||
    cs.expansionApprovalThreshold !== ps.expansionApprovalThreshold ||
    cs.roiThreshold !== ps.roiThreshold
  ) {
    return false
  }

  // Compare checkpoints
  for (let i = 0; i < cs.checkpoints.length; i++) {
    if (cs.checkpoints[i].enabled !== ps.checkpoints[i].enabled) {
      return false
    }
  }

  return true
}

/**
 * Detect which preset a configuration matches (if any)
 */
export function detectPreset(config: FlowConfiguration, userPresets: FlowPreset[] = []): string | undefined {
  const allPresets = [...DEFAULT_PRESETS, ...userPresets]
  for (const preset of allPresets) {
    if (configMatchesPreset(config, preset)) {
      return preset.id
    }
  }
  return undefined
}

/**
 * Clone a configuration to avoid mutation
 */
export function cloneConfig(config: FlowConfiguration): FlowConfiguration {
  return {
    agents: config.agents.map(a => ({ ...a })),
    loopSettings: {
      ...config.loopSettings,
      checkpoints: config.loopSettings.checkpoints.map(c => ({ ...c })),
    },
    presetId: config.presetId,
  }
}

/**
 * Apply a preset to create a new configuration
 */
export function applyPreset(preset: FlowPreset): FlowConfiguration {
  return {
    agents: preset.agents.map(a => ({ ...a })),
    loopSettings: {
      ...preset.loopSettings,
      checkpoints: preset.loopSettings.checkpoints.map(c => ({ ...c })),
    },
    presetId: preset.id,
  }
}

/**
 * Create default agent configurations
 */
export function createDefaultAgents(): AgentConfig[] {
  return Object.entries(AGENT_METADATA).map(([role, meta]) => ({
    role: role as AgentRole,
    enabled: meta.defaultEnabled,
    resourceLevel: 'medium' as const,
  }))
}

/**
 * Validate a flow configuration
 */
export function validateConfig(config: FlowConfiguration): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check agents — support 1–12 agents (variable-length pipelines)
  const agents = config.steps || config.agents
  if (!agents || agents.length < 1 || agents.length > 12) {
    errors.push('Configuration must include 1–12 agents')
  }

  // Check at least one agent is enabled
  const enabledAgents = agents?.filter(a => a.enabled) || []
  if (enabledAgents.length === 0) {
    errors.push('At least one agent must be enabled')
  }

  // Check loop settings
  const ls = config.loopSettings
  if (ls.timeBudgetHours < 0.5 || ls.timeBudgetHours > 24) {
    errors.push('Time budget must be between 0.5 and 24 hours')
  }
  if (ls.maxIterations < 1 || ls.maxIterations > 100) {
    errors.push('Max iterations must be between 1 and 100')
  }
  if (ls.failThreshold < 1 || ls.failThreshold > 10) {
    errors.push('Fail threshold must be between 1 and 10')
  }
  if (ls.expansionApprovalThreshold < 0 || ls.expansionApprovalThreshold > 100) {
    errors.push('Expansion approval threshold must be between 0 and 100%')
  }
  if (ls.roiThreshold < 0 || ls.roiThreshold > 100) {
    errors.push('ROI threshold must be between 0 and 100%')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Get color classes for an agent
 */
export function getAgentColorClasses(color: AgentMetadata['color']): {
  bg: string
  border: string
  text: string
  bgLight: string
} {
  const colors: Record<AgentMetadata['color'], { bg: string; border: string; text: string; bgLight: string }> = {
    blue: {
      bg: 'bg-blue-600',
      border: 'border-blue-500',
      text: 'text-blue-500',
      bgLight: 'bg-blue-500/10',
    },
    purple: {
      bg: 'bg-purple-600',
      border: 'border-purple-500',
      text: 'text-purple-500',
      bgLight: 'bg-purple-500/10',
    },
    amber: {
      bg: 'bg-amber-600',
      border: 'border-amber-500',
      text: 'text-amber-500',
      bgLight: 'bg-amber-500/10',
    },
    green: {
      bg: 'bg-green-600',
      border: 'border-green-500',
      text: 'text-green-500',
      bgLight: 'bg-green-500/10',
    },
    red: {
      bg: 'bg-red-600',
      border: 'border-red-500',
      text: 'text-red-500',
      bgLight: 'bg-red-500/10',
    },
    emerald: {
      bg: 'bg-emerald-600',
      border: 'border-emerald-500',
      text: 'text-emerald-500',
      bgLight: 'bg-emerald-500/10',
    },
    pink: {
      bg: 'bg-pink-600',
      border: 'border-pink-500',
      text: 'text-pink-500',
      bgLight: 'bg-pink-500/10',
    },
    cyan: {
      bg: 'bg-cyan-600',
      border: 'border-cyan-500',
      text: 'text-cyan-500',
      bgLight: 'bg-cyan-500/10',
    },
  }
  return colors[color]
}

/**
 * Format time budget for display
 */
export function formatTimeBudget(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} min`
  }
  if (hours === Math.floor(hours)) {
    return `${hours} hour${hours > 1 ? 's' : ''}`
  }
  return `${hours} hours`
}

/**
 * Valid agent roles for validation
 */
const VALID_ROLES: AgentRole[] = ['scout', 'athena', 'vulcan', 'vex', 'caesar', 'forge', 'mercury', 'quill', 'pixel', 'sage']

/**
 * Check if a role is a valid agent role
 */
export function isValidAgentRole(role: string): role is AgentRole {
  return VALID_ROLES.includes(role as AgentRole)
}

/**
 * Migrate old 4-agent AgentConfig[] format to PipelineStep[] format.
 * Detects old format by checking for missing `id`/`order` fields.
 */
export function migrateToPipelineSteps(agents: AgentConfig[]): PipelineStep[] {
  return agents.map((agent, index) => ({
    id: crypto.randomUUID(),
    role: agent.role,
    enabled: agent.enabled,
    resourceLevel: agent.resourceLevel,
    order: index,
  }))
}

/**
 * Convert PipelineStep[] back to AgentConfig[] for backward compatibility
 */
export function stepsToAgentConfigs(steps: PipelineStep[]): AgentConfig[] {
  return steps
    .sort((a, b) => a.order - b.order)
    .map(step => ({
      role: step.role,
      enabled: step.enabled,
      resourceLevel: step.resourceLevel,
    }))
}

/**
 * Ensure a FlowConfiguration has the steps field populated
 */
export function ensureSteps(config: FlowConfiguration): FlowConfiguration {
  if (config.steps && config.steps.length > 0) return config
  return {
    ...config,
    steps: migrateToPipelineSteps(config.agents),
  }
}
