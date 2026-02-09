// Agent Flow Customization & Resource Allocation Types

// Agent role types - expanded agent pool
export type AgentRole = 'scout' | 'archie' | 'mason' | 'vex' | 'jarvis' | 'lux' | 'ralph' | 'quill' | 'pixel' | 'sage'

// Resource allocation levels
export type ResourceLevel = 'high' | 'medium' | 'low' | 'local'

// Agent configuration
export interface AgentConfig {
  role: AgentRole
  enabled: boolean
  resourceLevel: ResourceLevel
}

// Flow preset identifiers (system presets)
export type FlowPresetId = 'quick-fix' | 'standard' | 'deep-work' | 'research-only' | 'custom'

// ClawLegion loop checkpoint
export interface Checkpoint {
  percentage: 25 | 50 | 75
  enabled: boolean
}

// ClawLegion loop settings
export interface RalphLoopSettings {
  timeBudgetHours: number           // 0.5 - 24 hours
  maxIterations: number             // 1 - 100
  failThreshold: number             // Circuit breaker: fails before stop (1-10)
  checkpoints: Checkpoint[]         // Progress checkpoints
  expansionApprovalThreshold: number // ROI threshold for expansion approval (0-100%)
  roiThreshold: number              // Minimum ROI to continue (0-100%)
}

// Pipeline step — an agent instance in a custom flow (variable-length pipeline)
export interface PipelineStep {
  id: string                        // Unique instance key (e.g. crypto.randomUUID())
  role: AgentRole
  enabled: boolean
  resourceLevel: ResourceLevel
  order: number                     // Position in pipeline (0-based)
}

// Complete flow configuration
export interface FlowConfiguration {
  agents: AgentConfig[]
  steps?: PipelineStep[]            // New variable-length pipeline (used by Flow Builder)
  loopSettings: RalphLoopSettings
  presetId?: string                 // Which preset was used as base
}

// Flow preset definition
export interface FlowPreset {
  id: FlowPresetId | string
  name: string
  description: string
  isSystem: boolean  // true = default preset, false = user-created
  agents: AgentConfig[]
  loopSettings: RalphLoopSettings
}

// Props for the main FlowConfigPanel component
export interface FlowConfigPanelProps {
  config: FlowConfiguration
  onChange: (config: FlowConfiguration) => void
  onLaunch?: () => void
  onSaveTemplate?: (name: string, description: string) => void
  isWizardMode?: boolean            // Hides launch button in wizard
}

// Agent tier classification
export type AgentTier = 'worker' | 'council' | 'orchestrator'

// Agent metadata for UI display
export interface AgentMetadata {
  name: string
  emoji: string
  color: 'blue' | 'purple' | 'amber' | 'green' | 'red' | 'emerald' | 'pink' | 'cyan'
  description: string
  defaultEnabled: boolean
  tier: AgentTier
}

// Resource level metadata for UI display
export interface ResourceLevelMetadata {
  value: ResourceLevel
  label: string
  description: string
}

// Props for sub-components
export interface AgentCardProps {
  config: AgentConfig
  metadata: AgentMetadata
  onChange: (config: AgentConfig) => void
}

export interface PresetSelectorProps {
  presets: FlowPreset[]
  selectedId?: string
  onChange: (preset: FlowPreset) => void
  isCustomized?: boolean
}

export interface AgentFlowBuilderProps {
  agents: AgentConfig[]
  onChange: (agents: AgentConfig[]) => void
}

export interface RalphLoopSettingsProps {
  settings: RalphLoopSettings
  onChange: (settings: RalphLoopSettings) => void
}

export interface TimeBudgetSliderProps {
  value: number
  onChange: (value: number) => void
}

export interface CheckpointTogglesProps {
  checkpoints: Checkpoint[]
  onChange: (checkpoints: Checkpoint[]) => void
}

export interface ThresholdInputsProps {
  failThreshold: number
  expansionApprovalThreshold: number
  roiThreshold: number
  maxIterations: number
  onChange: (values: {
    failThreshold?: number
    expansionApprovalThreshold?: number
    roiThreshold?: number
    maxIterations?: number
  }) => void
}

export interface LaunchControlsProps {
  onPreview: () => void
  onSaveTemplate: () => void
  onLaunch: () => void
  isWizardMode?: boolean
  isDirty?: boolean
}

export interface ConfigPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  config: FlowConfiguration
}

export interface SaveTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string, description: string) => void
}

export interface FlowPreviewProps {
  agents: AgentConfig[]
}
