/**
 * Workflow Payload Validation Tests
 *
 * Regression tests for the sprint engine workflow payload integrity.
 * Validates that task payloads, workflow steps, and workflow definitions
 * are correctly structured and validated.
 *
 * Run with: npx vitest run __tests__/lib/workflow-payload.test.ts
 */

import { describe, it, expect } from 'vitest'
import {
  validateTaskPayload,
  validateWorkflowStep,
  validateWorkflow,
  validateAllWorkflows,
  getWorkflowForTask,
  getCurrentStep,
  getNextStep,
  getWorkflowProgress,
  WORKFLOW_DEFINITIONS,
  type TaskPayload,
  type WorkflowStepDef,
} from '@/lib/workflow-payload'

// ============================================================
// TEST FIXTURES
// ============================================================

const validTask: TaskPayload = {
  id: 'cmljn65xx005mx5bf7ycf73v3',
  title: 'Full payload test task',
  description: 'Testing full payload for regression',
  status: 'building',
  priority: 'P1',
  domain: 'dev',
  currentWorkflowStep: 'build',
  repositoryId: 'cml2xdgmy0003uk7eaj1qrlfq',
  repository: {
    id: 'cml2xdgmy0003uk7eaj1qrlfq',
    name: 'clawlegion-dashboard',
    fullName: 'socialchef/clawlegion-dashboard',
  },
  successCriteria: 'Complete the step objectives',
  attemptCount: 1,
  verificationAttempts: 0,
  createdAt: '2026-02-12T15:56:55.317Z',
  startedAt: '2026-02-12T15:57:04.463Z',
}

const validStep: WorkflowStepDef = {
  id: 'build',
  agent: 'vulcan',
  model: 'opus',
  timeoutMin: 120,
  required: true,
}

// ============================================================
// validateTaskPayload
// ============================================================

describe('validateTaskPayload', () => {
  it('validates a complete, correct task payload', () => {
    const result = validateTaskPayload(validTask)
    expect(result.valid).toBe(true)
    expect(result.counts.errors).toBe(0)
  })

  it('reports errors for missing required fields', () => {
    const result = validateTaskPayload({})
    expect(result.valid).toBe(false)
    expect(result.counts.errors).toBeGreaterThan(0)

    const errorFields = result.issues
      .filter(i => i.severity === 'error')
      .map(i => i.field)
    expect(errorFields).toContain('id')
    expect(errorFields).toContain('title')
    expect(errorFields).toContain('status')
    expect(errorFields).toContain('priority')
  })

  it('detects invalid status values', () => {
    const result = validateTaskPayload({
      ...validTask,
      status: 'invalid_status',
    })
    expect(result.valid).toBe(false)
    const statusIssue = result.issues.find(i => i.field === 'status')
    expect(statusIssue).toBeDefined()
    expect(statusIssue?.severity).toBe('error')
  })

  it('detects invalid priority values', () => {
    const result = validateTaskPayload({
      ...validTask,
      priority: 'P99',
    })
    expect(result.valid).toBe(false)
    const priorityIssue = result.issues.find(i => i.field === 'priority')
    expect(priorityIssue).toBeDefined()
    expect(priorityIssue?.severity).toBe('error')
  })

  it('warns about unknown domain', () => {
    const result = validateTaskPayload({
      ...validTask,
      domain: 'telekinesis',
    })
    // Domain is a warning, not error
    expect(result.valid).toBe(true)
    const domainIssue = result.issues.find(i => i.field === 'domain')
    expect(domainIssue).toBeDefined()
    expect(domainIssue?.severity).toBe('warning')
  })

  it('warns about unknown workflow step', () => {
    const result = validateTaskPayload({
      ...validTask,
      currentWorkflowStep: 'quantum-compute',
    })
    const stepIssue = result.issues.find(i => i.field === 'currentWorkflowStep')
    expect(stepIssue).toBeDefined()
    expect(stepIssue?.severity).toBe('warning')
  })

  it('accepts done/failed step suffixes', () => {
    const resultDone = validateTaskPayload({
      ...validTask,
      currentWorkflowStep: 'build-done',
    })
    const doneIssue = resultDone.issues.find(i => i.field === 'currentWorkflowStep')
    expect(doneIssue).toBeUndefined()

    const resultFailed = validateTaskPayload({
      ...validTask,
      currentWorkflowStep: 'build-failed',
    })
    const failedIssue = resultFailed.issues.find(i => i.field === 'currentWorkflowStep')
    expect(failedIssue).toBeUndefined()
  })

  it('warns about missing repository', () => {
    const task = { ...validTask }
    delete task.repositoryId
    delete task.repository
    delete task.repositories
    const result = validateTaskPayload(task)
    const repoIssue = result.issues.find(i => i.field === 'repository')
    expect(repoIssue).toBeDefined()
    expect(repoIssue?.severity).toBe('warning')
  })

  it('detects invalid date formats', () => {
    const result = validateTaskPayload({
      ...validTask,
      createdAt: 'not-a-date',
    })
    const dateIssue = result.issues.find(i => i.field === 'createdAt')
    expect(dateIssue).toBeDefined()
    expect(dateIssue?.severity).toBe('error')
  })

  it('detects negative attempt counts', () => {
    const result = validateTaskPayload({
      ...validTask,
      attemptCount: -1,
    })
    expect(result.valid).toBe(false)
    const countIssue = result.issues.find(i => i.field === 'attemptCount')
    expect(countIssue).toBeDefined()
    expect(countIssue?.severity).toBe('error')
  })

  it('gives info for missing description', () => {
    const task = { ...validTask }
    delete task.description
    const result = validateTaskPayload(task)
    const descIssue = result.issues.find(i => i.field === 'description')
    expect(descIssue).toBeDefined()
    expect(descIssue?.severity).toBe('info')
  })

  it('gives info for short description', () => {
    const result = validateTaskPayload({
      ...validTask,
      description: 'Fix it',
    })
    const descIssue = result.issues.find(i => i.field === 'description')
    expect(descIssue).toBeDefined()
    expect(descIssue?.severity).toBe('info')
  })

  it('warns about short title', () => {
    const result = validateTaskPayload({
      ...validTask,
      title: 'Hi',
    })
    const titleIssue = result.issues.find(i => i.field === 'title' && i.severity === 'warning')
    expect(titleIssue).toBeDefined()
  })

  it('gives info for missing success criteria', () => {
    const task = { ...validTask }
    delete task.successCriteria
    const result = validateTaskPayload(task)
    const criteriaIssue = result.issues.find(i => i.field === 'successCriteria')
    expect(criteriaIssue).toBeDefined()
    expect(criteriaIssue?.severity).toBe('info')
  })

  it('includes validatedAt timestamp', () => {
    const result = validateTaskPayload(validTask)
    expect(result.validatedAt).toBeDefined()
    expect(new Date(result.validatedAt).getTime()).not.toBeNaN()
  })

  it('accepts all valid status values', () => {
    const statuses = [
      'backlog', 'todo', 'researching', 'planning', 'building',
      'in_progress', 'verifying', 'done', 'queued', 'assigned',
      'completed', 'failed',
    ]
    for (const status of statuses) {
      const result = validateTaskPayload({ ...validTask, status })
      const statusIssue = result.issues.find(i => i.field === 'status')
      expect(statusIssue).toBeUndefined()
    }
  })

  it('accepts all valid priority values', () => {
    const priorities = ['P0', 'P1', 'P2', 'P3', 'high', 'medium', 'low']
    for (const priority of priorities) {
      const result = validateTaskPayload({ ...validTask, priority })
      const priorityIssue = result.issues.find(i => i.field === 'priority')
      expect(priorityIssue).toBeUndefined()
    }
  })
})

// ============================================================
// validateWorkflowStep
// ============================================================

describe('validateWorkflowStep', () => {
  it('validates a correct workflow step', () => {
    const result = validateWorkflowStep(validStep)
    expect(result.valid).toBe(true)
    expect(result.counts.errors).toBe(0)
  })

  it('reports errors for missing fields', () => {
    const result = validateWorkflowStep({})
    expect(result.valid).toBe(false)
    const errorFields = result.issues.filter(i => i.severity === 'error').map(i => i.field)
    expect(errorFields).toContain('id')
    expect(errorFields).toContain('agent')
    expect(errorFields).toContain('model')
    expect(errorFields).toContain('timeoutMin')
  })

  it('detects unknown agent', () => {
    const result = validateWorkflowStep({ ...validStep, agent: 'batman' as any })
    expect(result.valid).toBe(false)
    const agentIssue = result.issues.find(i => i.field === 'agent')
    expect(agentIssue).toBeDefined()
    expect(agentIssue?.severity).toBe('error')
  })

  it('warns about unknown model', () => {
    const result = validateWorkflowStep({ ...validStep, model: 'gpt-5' as any })
    // Model is a warning since custom models may be added
    const modelIssue = result.issues.find(i => i.field === 'model')
    expect(modelIssue).toBeDefined()
    expect(modelIssue?.severity).toBe('warning')
  })

  it('detects zero or negative timeout', () => {
    const result = validateWorkflowStep({ ...validStep, timeoutMin: 0 })
    expect(result.valid).toBe(false)
    const timeoutIssue = result.issues.find(i => i.field === 'timeoutMin')
    expect(timeoutIssue).toBeDefined()
    expect(timeoutIssue?.severity).toBe('error')
  })

  it('warns about excessive timeout', () => {
    const result = validateWorkflowStep({ ...validStep, timeoutMin: 240 })
    const timeoutIssue = result.issues.find(i => i.field === 'timeoutMin')
    expect(timeoutIssue).toBeDefined()
    expect(timeoutIssue?.severity).toBe('warning')
  })

  it('gives info when required flag is missing', () => {
    const { required, ...stepWithoutRequired } = validStep
    const result = validateWorkflowStep(stepWithoutRequired)
    const reqIssue = result.issues.find(i => i.field === 'required')
    expect(reqIssue).toBeDefined()
    expect(reqIssue?.severity).toBe('info')
  })
})

// ============================================================
// validateWorkflow
// ============================================================

describe('validateWorkflow', () => {
  it('validates the dev workflow', () => {
    const result = validateWorkflow('dev', WORKFLOW_DEFINITIONS.dev)
    expect(result.valid).toBe(true)
    expect(result.counts.errors).toBe(0)
  })

  it('errors on empty workflow', () => {
    const result = validateWorkflow('empty', { steps: [] })
    expect(result.valid).toBe(false)
    const stepsIssue = result.issues.find(i => i.field === 'steps')
    expect(stepsIssue).toBeDefined()
    expect(stepsIssue?.severity).toBe('error')
  })

  it('detects duplicate step IDs', () => {
    const result = validateWorkflow('test', {
      steps: [
        { id: 'build', agent: 'vulcan', model: 'opus', timeoutMin: 60, required: true },
        { id: 'build', agent: 'vulcan', model: 'opus', timeoutMin: 60, required: true },
      ],
    })
    const dupIssue = result.issues.find(i => i.message.includes('Duplicate'))
    expect(dupIssue).toBeDefined()
    expect(dupIssue?.severity).toBe('error')
  })

  it('errors when onFail references nonexistent step', () => {
    const result = validateWorkflow('test', {
      steps: [
        { id: 'build', agent: 'vulcan', model: 'opus', timeoutMin: 60, required: true },
        { id: 'verify', agent: 'janus', model: 'sonnet', timeoutMin: 30, required: true, onFail: 'missing' },
      ],
    })
    const failIssue = result.issues.find(i => i.field === 'steps[1].onFail' && i.severity === 'error')
    expect(failIssue).toBeDefined()
  })

  it('warns when last step is not required', () => {
    const result = validateWorkflow('test', {
      steps: [
        { id: 'research', agent: 'minerva', model: 'sonnet', timeoutMin: 30, required: false },
      ],
    })
    const lastStepIssue = result.issues.find(i => i.message.includes('Last workflow step'))
    expect(lastStepIssue).toBeDefined()
    expect(lastStepIssue?.severity).toBe('warning')
  })
})

// ============================================================
// validateAllWorkflows (regression test)
// ============================================================

describe('validateAllWorkflows', () => {
  it('validates all built-in workflow definitions without errors', () => {
    const results = validateAllWorkflows()

    for (const [domain, result] of Object.entries(results)) {
      expect(result.counts.errors).toBe(0)
    }
  })

  it('returns results for all known domains', () => {
    const results = validateAllWorkflows()
    const domains = Object.keys(results)

    expect(domains).toContain('dev')
    expect(domains).toContain('research')
    expect(domains).toContain('marketing')
    expect(domains).toContain('ops')
    expect(domains).toContain('comms')
    expect(domains).toContain('design')
  })
})

// ============================================================
// getWorkflowForTask
// ============================================================

describe('getWorkflowForTask', () => {
  it('returns dev workflow for code domain', () => {
    const workflow = getWorkflowForTask({ ...validTask, domain: 'dev' })
    expect(workflow.steps.length).toBe(4)
    expect(workflow.steps[0].id).toBe('research')
    expect(workflow.steps[3].id).toBe('verify')
  })

  it('returns dev workflow for unknown domain', () => {
    const workflow = getWorkflowForTask({ ...validTask, domain: 'telekinesis' })
    expect(workflow.steps.length).toBe(4)
    expect(workflow.steps[0].id).toBe('research')
  })

  it('returns dev workflow when domain is missing', () => {
    const task = { ...validTask }
    delete task.domain
    const workflow = getWorkflowForTask(task)
    expect(workflow.steps.length).toBe(4)
  })

  it('returns dev workflow for "code" domain (common alias)', () => {
    const workflow = getWorkflowForTask({ ...validTask, domain: 'code' })
    expect(workflow.steps.length).toBe(4)
    expect(workflow.steps[0].id).toBe('research')
    expect(workflow.steps[2].agent).toBe('vulcan')
  })

  it('does not warn about "code" domain', () => {
    const result = validateTaskPayload({ ...validTask, domain: 'code' })
    const domainIssue = result.issues.find(i => i.field === 'domain')
    expect(domainIssue).toBeUndefined()
  })

  it('returns ops workflow for ops domain', () => {
    const workflow = getWorkflowForTask({ ...validTask, domain: 'ops' })
    expect(workflow.steps.length).toBe(2)
    expect(workflow.steps[0].id).toBe('execute')
  })
})

// ============================================================
// getCurrentStep
// ============================================================

describe('getCurrentStep', () => {
  it('returns correct step for current workflow step', () => {
    const step = getCurrentStep(validTask)
    expect(step).not.toBeNull()
    expect(step?.id).toBe('build')
    expect(step?.agent).toBe('vulcan')
  })

  it('handles -done suffix', () => {
    const step = getCurrentStep({ ...validTask, currentWorkflowStep: 'build-done' })
    expect(step).not.toBeNull()
    expect(step?.id).toBe('build')
  })

  it('handles -failed suffix', () => {
    const step = getCurrentStep({ ...validTask, currentWorkflowStep: 'build-failed' })
    expect(step).not.toBeNull()
    expect(step?.id).toBe('build')
  })

  it('returns null when no current step', () => {
    const step = getCurrentStep({ ...validTask, currentWorkflowStep: null })
    expect(step).toBeNull()
  })

  it('returns null for unknown step', () => {
    const step = getCurrentStep({ ...validTask, currentWorkflowStep: 'quantum-compute' })
    expect(step).toBeNull()
  })
})

// ============================================================
// getNextStep
// ============================================================

describe('getNextStep', () => {
  it('returns next step after current', () => {
    const next = getNextStep({ ...validTask, currentWorkflowStep: 'build' })
    expect(next).not.toBeNull()
    expect(next?.id).toBe('verify')
  })

  it('returns first step when no current step', () => {
    const next = getNextStep({ ...validTask, currentWorkflowStep: null })
    expect(next).not.toBeNull()
    expect(next?.id).toBe('research')
  })

  it('returns null at last step', () => {
    const next = getNextStep({ ...validTask, currentWorkflowStep: 'verify' })
    expect(next).toBeNull()
  })

  it('returns next step even with -done suffix', () => {
    const next = getNextStep({ ...validTask, currentWorkflowStep: 'build-done' })
    expect(next).not.toBeNull()
    expect(next?.id).toBe('verify')
  })
})

// ============================================================
// getWorkflowProgress
// ============================================================

describe('getWorkflowProgress', () => {
  it('returns 0 when no current step', () => {
    const progress = getWorkflowProgress({ ...validTask, currentWorkflowStep: null })
    expect(progress).toBe(0)
  })

  it('returns 0 for first step (not done)', () => {
    const progress = getWorkflowProgress({ ...validTask, currentWorkflowStep: 'research' })
    expect(progress).toBe(0)
  })

  it('returns 25% after first step done in 4-step workflow', () => {
    const progress = getWorkflowProgress({ ...validTask, currentWorkflowStep: 'research-done' })
    expect(progress).toBe(25)
  })

  it('returns 50% at step 2 done of 4 steps', () => {
    const progress = getWorkflowProgress({ ...validTask, currentWorkflowStep: 'plan-done' })
    expect(progress).toBe(50)
  })

  it('returns 75% at step 3 done of 4 steps', () => {
    const progress = getWorkflowProgress({ ...validTask, currentWorkflowStep: 'build-done' })
    expect(progress).toBe(75)
  })

  it('returns 100% at last step done', () => {
    const progress = getWorkflowProgress({ ...validTask, currentWorkflowStep: 'verify-done' })
    expect(progress).toBe(100)
  })

  it('returns 0 for unknown step', () => {
    const progress = getWorkflowProgress({ ...validTask, currentWorkflowStep: 'quantum-compute' })
    expect(progress).toBe(0)
  })

  it('handles 2-step ops workflow', () => {
    const opsTask: TaskPayload = { ...validTask, domain: 'ops', currentWorkflowStep: 'execute-done' }
    const progress = getWorkflowProgress(opsTask)
    expect(progress).toBe(50)
  })
})
