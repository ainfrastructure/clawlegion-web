/**
 * Workflow Payload Validation
 *
 * Validates task payload integrity as data flows through the sprint engine
 * workflow steps (research → plan → build → verify). Ensures required fields
 * are present and correctly typed at each stage of the pipeline.
 *
 * Used by:
 * - Dashboard task detail views (show payload health)
 * - Sprint engine monitoring (detect data corruption)
 * - Regression tests (validate pipeline data flow)
 */

// ============================================================
// TYPES
// ============================================================

/** Workflow step identifiers matching sprint engine WORKFLOWS config */
export type WorkflowStepId =
  | 'research'
  | 'plan'
  | 'build'
  | 'verify'
  | 'synthesize'
  | 'create'
  | 'review'
  | 'execute'
  | 'draft'
  | 'reference'
  | 'spec'

/** Domain types matching sprint engine WORKFLOWS keys */
export type WorkflowDomain = 'dev' | 'code' | 'research' | 'marketing' | 'ops' | 'comms' | 'design'

/** Agent names matching sprint engine AGENT_ROLES */
export type AgentName =
  | 'minerva'
  | 'athena'
  | 'vulcan'
  | 'janus'
  | 'cato'
  | 'mercury'
  | 'cicero'
  | 'apollo'
  | 'oracle'

/** Model aliases matching sprint engine MODEL_MAP */
export type ModelAlias = 'opus' | 'sonnet' | 'qwen'

/** Severity of a validation issue */
export type ValidationSeverity = 'error' | 'warning' | 'info'

/** A single validation issue found in a payload */
export interface PayloadValidationIssue {
  field: string
  message: string
  severity: ValidationSeverity
  /** The value that caused the issue (omitted for missing fields) */
  value?: unknown
}

/** Result of validating a task payload */
export interface PayloadValidationResult {
  valid: boolean
  issues: PayloadValidationIssue[]
  /** Summary counts by severity */
  counts: {
    errors: number
    warnings: number
    info: number
  }
  /** Timestamp of validation */
  validatedAt: string
}

/** Minimal task payload shape for validation (subset of full Task type) */
export interface TaskPayload {
  id?: string
  title?: string
  description?: string
  status?: string
  priority?: string
  domain?: string
  currentWorkflowStep?: string | null
  repositoryId?: string
  repository?: {
    id?: string
    name?: string
    fullName?: string
  }
  repositories?: Array<{
    id?: string
    name?: string
    fullName?: string
  }>
  successCriteria?: string | string[] | null
  assignee?: string | null
  sprintId?: string | null
  attemptCount?: number
  verificationAttempts?: number
  createdAt?: string
  startedAt?: string | null
  [key: string]: unknown
}

/** Workflow step definition matching sprint engine WorkflowStep interface */
export interface WorkflowStepDef {
  id: WorkflowStepId
  agent: AgentName
  model: ModelAlias
  timeoutMin: number
  required: boolean
  onFail?: string
}

// ============================================================
// WORKFLOW DEFINITIONS (mirrors sprint engine WORKFLOWS)
// ============================================================

/** The canonical dev workflow steps (shared by dev and code domains) */
const DEV_STEPS: WorkflowStepDef[] = [
  { id: 'research', agent: 'minerva', model: 'sonnet', timeoutMin: 30, required: false },
  { id: 'plan', agent: 'athena', model: 'sonnet', timeoutMin: 45, required: true },
  { id: 'build', agent: 'vulcan', model: 'opus', timeoutMin: 120, required: true },
  { id: 'verify', agent: 'janus', model: 'sonnet', timeoutMin: 60, required: true, onFail: 'build' },
]

export const WORKFLOW_DEFINITIONS: Record<WorkflowDomain, { steps: WorkflowStepDef[] }> = {
  dev: { steps: DEV_STEPS },
  code: { steps: DEV_STEPS },  // "code" is a common alias for "dev"
  research: {
    steps: [
      { id: 'research', agent: 'minerva', model: 'sonnet', timeoutMin: 60, required: true },
      { id: 'synthesize', agent: 'athena', model: 'sonnet', timeoutMin: 30, required: true },
    ],
  },
  marketing: {
    steps: [
      { id: 'research', agent: 'minerva', model: 'sonnet', timeoutMin: 30, required: true },
      { id: 'create', agent: 'mercury', model: 'sonnet', timeoutMin: 60, required: true },
      { id: 'review', agent: 'janus', model: 'sonnet', timeoutMin: 30, required: true, onFail: 'create' },
    ],
  },
  ops: {
    steps: [
      { id: 'execute', agent: 'cato', model: 'sonnet', timeoutMin: 60, required: true },
      { id: 'verify', agent: 'janus', model: 'sonnet', timeoutMin: 30, required: true },
    ],
  },
  comms: {
    steps: [
      { id: 'research', agent: 'minerva', model: 'sonnet', timeoutMin: 30, required: false },
      { id: 'draft', agent: 'mercury', model: 'sonnet', timeoutMin: 60, required: true },
      { id: 'review', agent: 'janus', model: 'sonnet', timeoutMin: 30, required: true, onFail: 'draft' },
    ],
  },
  design: {
    steps: [
      { id: 'reference', agent: 'minerva', model: 'sonnet', timeoutMin: 30, required: true },
      { id: 'spec', agent: 'athena', model: 'sonnet', timeoutMin: 60, required: true },
    ],
  },
}

// ============================================================
// VALID VALUES
// ============================================================

const VALID_STATUSES = new Set([
  'backlog', 'todo', 'researching', 'planning', 'building',
  'in_progress', 'verifying', 'done', 'queued', 'assigned',
  'completed', 'failed',
])

const VALID_PRIORITIES = new Set(['P0', 'P1', 'P2', 'P3', 'high', 'medium', 'low'])

const VALID_DOMAINS = new Set<string>([...Object.keys(WORKFLOW_DEFINITIONS), 'code'])

const VALID_AGENTS = new Set<string>([
  'minerva', 'athena', 'vulcan', 'janus', 'cato',
  'mercury', 'cicero', 'apollo', 'oracle',
])

const VALID_MODELS = new Set(['opus', 'sonnet', 'qwen'])

// ============================================================
// VALIDATION HELPERS
// ============================================================

function createResult(issues: PayloadValidationIssue[]): PayloadValidationResult {
  const errors = issues.filter(i => i.severity === 'error').length
  const warnings = issues.filter(i => i.severity === 'warning').length
  const info = issues.filter(i => i.severity === 'info').length

  return {
    valid: errors === 0,
    issues,
    counts: { errors, warnings, info },
    validatedAt: new Date().toISOString(),
  }
}

function issue(
  field: string,
  message: string,
  severity: ValidationSeverity,
  value?: unknown
): PayloadValidationIssue {
  const result: PayloadValidationIssue = { field, message, severity }
  if (value !== undefined) {
    result.value = value
  }
  return result
}

// ============================================================
// CORE VALIDATORS
// ============================================================

/**
 * Validate a task payload for structural integrity.
 * Checks required fields, valid enum values, and data types.
 */
export function validateTaskPayload(payload: TaskPayload): PayloadValidationResult {
  const issues: PayloadValidationIssue[] = []

  // Required fields
  if (!payload.id || typeof payload.id !== 'string') {
    issues.push(issue('id', 'Task ID is required and must be a string', 'error', payload.id))
  }

  if (!payload.title || typeof payload.title !== 'string') {
    issues.push(issue('title', 'Task title is required and must be a string', 'error', payload.title))
  } else if (payload.title.length < 3) {
    issues.push(issue('title', 'Task title should be at least 3 characters', 'warning', payload.title))
  }

  if (!payload.status || typeof payload.status !== 'string') {
    issues.push(issue('status', 'Task status is required', 'error', payload.status))
  } else if (!VALID_STATUSES.has(payload.status)) {
    issues.push(issue('status', `Invalid status "${payload.status}"`, 'error', payload.status))
  }

  if (!payload.priority || typeof payload.priority !== 'string') {
    issues.push(issue('priority', 'Task priority is required', 'error', payload.priority))
  } else if (!VALID_PRIORITIES.has(payload.priority)) {
    issues.push(issue('priority', `Invalid priority "${payload.priority}"`, 'error', payload.priority))
  }

  // Optional but validated fields
  if (payload.domain && !VALID_DOMAINS.has(payload.domain)) {
    issues.push(issue('domain', `Unknown domain "${payload.domain}"`, 'warning', payload.domain))
  }

  if (payload.currentWorkflowStep) {
    const step = payload.currentWorkflowStep
    // Step can be "build", "build-done", "build-failed", etc.
    const baseStep = step.replace(/-done$/, '').replace(/-failed$/, '')
    const allSteps = Object.values(WORKFLOW_DEFINITIONS)
      .flatMap(w => w.steps.map(s => s.id))
    const uniqueSteps = new Set(allSteps)
    if (!uniqueSteps.has(baseStep as WorkflowStepId)) {
      issues.push(issue('currentWorkflowStep', `Unknown workflow step "${step}"`, 'warning', step))
    }
  }

  // Repository validation
  if (!payload.repositoryId && !payload.repository && (!payload.repositories || payload.repositories.length === 0)) {
    issues.push(issue('repository', 'Task should have a repository association', 'warning'))
  }

  if (payload.repository) {
    if (!payload.repository.id) {
      issues.push(issue('repository.id', 'Repository ID is missing', 'warning'))
    }
    if (!payload.repository.name) {
      issues.push(issue('repository.name', 'Repository name is missing', 'warning'))
    }
  }

  // Date validation
  if (payload.createdAt && isNaN(Date.parse(payload.createdAt))) {
    issues.push(issue('createdAt', 'Invalid date format', 'error', payload.createdAt))
  }

  if (payload.startedAt && isNaN(Date.parse(payload.startedAt))) {
    issues.push(issue('startedAt', 'Invalid date format', 'error', payload.startedAt))
  }

  // Attempt counts
  if (payload.attemptCount !== undefined && (typeof payload.attemptCount !== 'number' || payload.attemptCount < 0)) {
    issues.push(issue('attemptCount', 'Attempt count must be a non-negative number', 'error', payload.attemptCount))
  }

  if (payload.verificationAttempts !== undefined && (typeof payload.verificationAttempts !== 'number' || payload.verificationAttempts < 0)) {
    issues.push(issue('verificationAttempts', 'Verification attempts must be a non-negative number', 'error', payload.verificationAttempts))
  }

  // Description quality check
  if (!payload.description) {
    issues.push(issue('description', 'Task has no description', 'info'))
  } else if (payload.description.length < 20) {
    issues.push(issue('description', 'Task description is very short (< 20 chars)', 'info', payload.description))
  }

  // Success criteria
  if (!payload.successCriteria) {
    issues.push(issue('successCriteria', 'No success criteria defined', 'info'))
  }

  return createResult(issues)
}

/**
 * Validate a workflow step definition.
 * Checks that agent, model, and timeout are properly configured.
 */
export function validateWorkflowStep(step: Partial<WorkflowStepDef>): PayloadValidationResult {
  const issues: PayloadValidationIssue[] = []

  if (!step.id) {
    issues.push(issue('id', 'Step ID is required', 'error'))
  }

  if (!step.agent) {
    issues.push(issue('agent', 'Agent name is required', 'error'))
  } else if (!VALID_AGENTS.has(step.agent)) {
    issues.push(issue('agent', `Unknown agent "${step.agent}"`, 'error', step.agent))
  }

  if (!step.model) {
    issues.push(issue('model', 'Model alias is required', 'error'))
  } else if (!VALID_MODELS.has(step.model)) {
    issues.push(issue('model', `Unknown model "${step.model}"`, 'warning', step.model))
  }

  if (step.timeoutMin === undefined || step.timeoutMin === null) {
    issues.push(issue('timeoutMin', 'Timeout is required', 'error'))
  } else if (typeof step.timeoutMin !== 'number' || step.timeoutMin <= 0) {
    issues.push(issue('timeoutMin', 'Timeout must be a positive number', 'error', step.timeoutMin))
  } else if (step.timeoutMin > 180) {
    issues.push(issue('timeoutMin', 'Timeout exceeds 3 hours — consider breaking into smaller steps', 'warning', step.timeoutMin))
  }

  if (step.required === undefined) {
    issues.push(issue('required', 'Step "required" flag should be set explicitly', 'info'))
  }

  if (step.onFail) {
    const allSteps = Object.values(WORKFLOW_DEFINITIONS).flatMap(w => w.steps.map(s => s.id))
    if (!allSteps.includes(step.onFail as WorkflowStepId)) {
      issues.push(issue('onFail', `onFail references unknown step "${step.onFail}"`, 'warning', step.onFail))
    }
  }

  return createResult(issues)
}

/**
 * Validate an entire workflow definition (all steps).
 * Checks for structural issues, ordering, and cross-references.
 */
export function validateWorkflow(domain: string, workflow: { steps: Partial<WorkflowStepDef>[] }): PayloadValidationResult {
  const issues: PayloadValidationIssue[] = []

  if (!workflow.steps || workflow.steps.length === 0) {
    issues.push(issue('steps', 'Workflow has no steps', 'error'))
    return createResult(issues)
  }

  // Validate each step
  const stepIds = new Set<string>()
  for (let i = 0; i < workflow.steps.length; i++) {
    const step = workflow.steps[i]
    const stepResult = validateWorkflowStep(step)

    // Prefix step issues with index
    for (const stepIssue of stepResult.issues) {
      issues.push({
        ...stepIssue,
        field: `steps[${i}].${stepIssue.field}`,
      })
    }

    // Check for duplicate step IDs
    if (step.id) {
      if (stepIds.has(step.id)) {
        issues.push(issue(`steps[${i}].id`, `Duplicate step ID "${step.id}"`, 'error', step.id))
      }
      stepIds.add(step.id)
    }
  }

  // Validate onFail references point to earlier steps in the same workflow
  for (let i = 0; i < workflow.steps.length; i++) {
    const step = workflow.steps[i]
    if (step.onFail) {
      const targetIndex = workflow.steps.findIndex(s => s.id === step.onFail)
      if (targetIndex === -1) {
        issues.push(issue(
          `steps[${i}].onFail`,
          `onFail "${step.onFail}" not found in this workflow`,
          'error',
          step.onFail,
        ))
      } else if (targetIndex >= i) {
        issues.push(issue(
          `steps[${i}].onFail`,
          `onFail "${step.onFail}" should reference an earlier step (index ${targetIndex} >= ${i})`,
          'warning',
          step.onFail,
        ))
      }
    }
  }

  // Last step should be required
  const lastStep = workflow.steps[workflow.steps.length - 1]
  if (lastStep.required === false) {
    issues.push(issue(
      `steps[${workflow.steps.length - 1}].required`,
      'Last workflow step should be required',
      'warning',
    ))
  }

  return createResult(issues)
}

/**
 * Validate all workflow definitions at once.
 * Useful for regression testing the complete workflow configuration.
 */
export function validateAllWorkflows(): Record<string, PayloadValidationResult> {
  const results: Record<string, PayloadValidationResult> = {}

  for (const [domain, workflow] of Object.entries(WORKFLOW_DEFINITIONS)) {
    results[domain] = validateWorkflow(domain, workflow)
  }

  return results
}

/**
 * Get the expected workflow for a task based on its domain.
 * Returns the dev workflow as default if domain is unknown.
 */
export function getWorkflowForTask(task: TaskPayload): { steps: WorkflowStepDef[] } {
  const domain = (task.domain || 'dev') as WorkflowDomain
  return WORKFLOW_DEFINITIONS[domain] || WORKFLOW_DEFINITIONS.dev
}

/**
 * Get the current step definition for a task based on its workflow state.
 * Returns null if the step cannot be determined.
 */
export function getCurrentStep(task: TaskPayload): WorkflowStepDef | null {
  if (!task.currentWorkflowStep) return null

  const baseStep = task.currentWorkflowStep.replace(/-done$/, '').replace(/-failed$/, '')
  const workflow = getWorkflowForTask(task)

  return workflow.steps.find(s => s.id === baseStep) || null
}

/**
 * Get the next step in the workflow after the current one.
 * Returns null if the task is at the final step or step is unknown.
 */
export function getNextStep(task: TaskPayload): WorkflowStepDef | null {
  if (!task.currentWorkflowStep) {
    // No step yet — return first step
    const workflow = getWorkflowForTask(task)
    return workflow.steps[0] || null
  }

  const baseStep = task.currentWorkflowStep.replace(/-done$/, '').replace(/-failed$/, '')
  const workflow = getWorkflowForTask(task)
  const currentIndex = workflow.steps.findIndex(s => s.id === baseStep)

  if (currentIndex === -1 || currentIndex >= workflow.steps.length - 1) {
    return null
  }

  return workflow.steps[currentIndex + 1]
}

/**
 * Calculate workflow progress as a percentage (0-100).
 */
export function getWorkflowProgress(task: TaskPayload): number {
  const workflow = getWorkflowForTask(task)
  const totalSteps = workflow.steps.length

  if (totalSteps === 0) return 0

  if (!task.currentWorkflowStep) return 0

  const step = task.currentWorkflowStep
  const isDone = step.endsWith('-done')
  const baseStep = step.replace(/-done$/, '').replace(/-failed$/, '')
  const currentIndex = workflow.steps.findIndex(s => s.id === baseStep)

  if (currentIndex === -1) return 0

  // If current step is done, count it as complete
  const completedSteps = isDone ? currentIndex + 1 : currentIndex

  return Math.round((completedSteps / totalSteps) * 100)
}
