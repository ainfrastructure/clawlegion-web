/**
 * Autonomous Recovery System
 * Phase 1 Autonomous Systems - Automated Error Recovery
 */

import { globalCircuitBreakerManager, type CircuitBreakerStatus } from './circuit-breaker'
import { globalHealthMonitor, type AgentHealthStatus, type HealthAlert } from './health-monitor'

export interface RecoveryAction {
  id: string
  type: 'restart' | 'scale' | 'failover' | 'throttle' | 'circuit_reset' | 'task_redistribute'
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  estimatedTime: number // seconds
  prerequisites: string[]
  execute: (context: RecoveryContext) => Promise<RecoveryResult>
}

export interface RecoveryContext {
  agentId: string
  healthStatus: AgentHealthStatus
  circuitStatus: CircuitBreakerStatus
  triggerAlert: HealthAlert
  systemState: SystemState
}

export interface RecoveryResult {
  success: boolean
  message: string
  nextCheckIn?: number // seconds
  additionalActions?: string[]
  metrics?: Record<string, number>
}

export interface RecoveryStrategy {
  id: string
  name: string
  description: string
  conditions: (context: RecoveryContext) => boolean
  actions: RecoveryAction[]
  cooldownPeriod: number // seconds between strategy applications
}

export interface SystemState {
  totalAgents: number
  healthyAgents: number
  activeTaskCount: number
  systemLoad: number
  availableResources: Record<string, number>
}

export interface RecoveryExecution {
  id: string
  agentId: string
  strategyId: string
  startTime: Date
  endTime?: Date
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  progress: number // 0-100
  currentAction?: string
  results: RecoveryResult[]
  error?: string
}

/**
 * Recovery action implementations
 */
const RECOVERY_ACTIONS: Record<string, RecoveryAction> = {
  circuit_reset: {
    id: 'circuit_reset',
    type: 'circuit_reset',
    description: 'Reset circuit breaker to allow new attempts',
    severity: 'low',
    estimatedTime: 5,
    prerequisites: [],
    execute: async (context) => {
      globalCircuitBreakerManager.resetBreaker(context.agentId)
      return {
        success: true,
        message: 'Circuit breaker reset successfully',
        nextCheckIn: 30
      }
    }
  },

  throttle_requests: {
    id: 'throttle_requests',
    type: 'throttle',
    description: 'Reduce request rate to prevent overload',
    severity: 'medium',
    estimatedTime: 10,
    prerequisites: [],
    execute: async (context) => {
      // Implementation would integrate with request throttling system
      return {
        success: true,
        message: 'Request throttling activated',
        nextCheckIn: 300,
        metrics: { throttleRate: 0.5 }
      }
    }
  },

  redistribute_tasks: {
    id: 'redistribute_tasks',
    type: 'task_redistribute',
    description: 'Redistribute pending tasks to healthy agents',
    severity: 'medium',
    estimatedTime: 30,
    prerequisites: ['healthy_agents_available'],
    execute: async (context) => {
      const healthyAgents = context.systemState.healthyAgents
      if (healthyAgents < 1) {
        return {
          success: false,
          message: 'No healthy agents available for task redistribution'
        }
      }

      // Implementation would integrate with task management system
      return {
        success: true,
        message: `Redistributed ${context.healthStatus.metrics.queueDepth} tasks to healthy agents`,
        nextCheckIn: 120,
        metrics: { redistributedTasks: context.healthStatus.metrics.queueDepth }
      }
    }
  },

  agent_restart: {
    id: 'agent_restart',
    type: 'restart',
    description: 'Restart agent process to clear errors',
    severity: 'high',
    estimatedTime: 60,
    prerequisites: ['backup_agent_available'],
    execute: async (context) => {
      // Implementation would integrate with agent management system
      return {
        success: true,
        message: 'Agent restarted successfully',
        nextCheckIn: 180,
        additionalActions: ['health_check', 'task_redistribution_check']
      }
    }
  },

  scale_resources: {
    id: 'scale_resources',
    type: 'scale',
    description: 'Scale up agent resources or spawn additional instances',
    severity: 'high',
    estimatedTime: 120,
    prerequisites: ['resources_available'],
    execute: async (context) => {
      // Implementation would integrate with scaling system
      return {
        success: true,
        message: 'Scaled up agent resources',
        nextCheckIn: 300,
        metrics: { additionalInstances: 1 }
      }
    }
  },

  failover_to_backup: {
    id: 'failover_to_backup',
    type: 'failover',
    description: 'Failover to backup agent instance',
    severity: 'critical',
    estimatedTime: 45,
    prerequisites: ['backup_agent_healthy'],
    execute: async (context) => {
      // Implementation would integrate with failover system
      return {
        success: true,
        message: 'Failed over to backup agent instance',
        nextCheckIn: 240,
        additionalActions: ['primary_agent_diagnostics']
      }
    }
  }
}

/**
 * Recovery strategy definitions
 */
const RECOVERY_STRATEGIES: RecoveryStrategy[] = [
  {
    id: 'circuit_recovery',
    name: 'Circuit Breaker Recovery',
    description: 'Handle circuit breaker state issues',
    cooldownPeriod: 300,
    conditions: (context) => context.circuitStatus.state === 'open',
    actions: [
      RECOVERY_ACTIONS.circuit_reset,
      RECOVERY_ACTIONS.throttle_requests
    ]
  },

  {
    id: 'performance_degradation',
    name: 'Performance Degradation Recovery', 
    description: 'Address declining performance metrics',
    cooldownPeriod: 600,
    conditions: (context) => 
      context.healthStatus.currentHealth < 0.6 && 
      context.healthStatus.trends.some(t => t.direction === 'degrading'),
    actions: [
      RECOVERY_ACTIONS.throttle_requests,
      RECOVERY_ACTIONS.redistribute_tasks
    ]
  },

  {
    id: 'high_error_rate',
    name: 'High Error Rate Recovery',
    description: 'Address elevated error rates',
    cooldownPeriod: 450,
    conditions: (context) => context.healthStatus.metrics.errorRate > 0.15,
    actions: [
      RECOVERY_ACTIONS.circuit_reset,
      RECOVERY_ACTIONS.redistribute_tasks,
      RECOVERY_ACTIONS.agent_restart
    ]
  },

  {
    id: 'critical_failure',
    name: 'Critical Failure Recovery',
    description: 'Handle critical agent failures',
    cooldownPeriod: 900,
    conditions: (context) => 
      context.healthStatus.currentHealth < 0.3 ||
      context.healthStatus.activeAlerts.some(a => a.type === 'critical'),
    actions: [
      RECOVERY_ACTIONS.redistribute_tasks,
      RECOVERY_ACTIONS.failover_to_backup,
      RECOVERY_ACTIONS.scale_resources
    ]
  },

  {
    id: 'queue_overload',
    name: 'Queue Overload Recovery',
    description: 'Handle task queue overload situations',
    cooldownPeriod: 300,
    conditions: (context) => context.healthStatus.metrics.queueDepth > 10,
    actions: [
      RECOVERY_ACTIONS.redistribute_tasks,
      RECOVERY_ACTIONS.scale_resources
    ]
  }
]

/**
 * Autonomous Recovery System
 */
export class RecoverySystem {
  private executions = new Map<string, RecoveryExecution>()
  private strategies = new Map<string, RecoveryStrategy>()
  private lastExecutionTime = new Map<string, Date>()
  private executionIdCounter = 0

  constructor() {
    // Initialize strategies
    for (const strategy of RECOVERY_STRATEGIES) {
      this.strategies.set(strategy.id, strategy)
    }
  }

  /**
   * Evaluate and execute recovery actions for an agent
   */
  async evaluateRecovery(agentId: string): Promise<RecoveryExecution | null> {
    const healthStatus = globalHealthMonitor.getHealthStatus(agentId)
    const circuitStatus = globalCircuitBreakerManager.getStatus(agentId)
    
    if (!healthStatus) return null

    // Find applicable recovery strategy
    const strategy = this.findApplicableStrategy(agentId, healthStatus, circuitStatus)
    if (!strategy) return null

    // Check cooldown period
    const lastExecution = this.lastExecutionTime.get(`${agentId}_${strategy.id}`)
    if (lastExecution) {
      const timeSinceExecution = Date.now() - lastExecution.getTime()
      if (timeSinceExecution < strategy.cooldownPeriod * 1000) {
        return null // Still in cooldown
      }
    }

    // Find trigger alert
    const triggerAlert = healthStatus.activeAlerts[0] || {
      id: 'system_trigger',
      agentId,
      type: 'warning' as const,
      message: 'Automated recovery trigger',
      timestamp: new Date(),
      resolved: false
    }

    // Create execution context
    const context: RecoveryContext = {
      agentId,
      healthStatus,
      circuitStatus,
      triggerAlert,
      systemState: await this.getSystemState()
    }

    // Execute recovery strategy
    return this.executeStrategy(strategy, context)
  }

  /**
   * Find applicable recovery strategy
   */
  private findApplicableStrategy(
    agentId: string, 
    healthStatus: AgentHealthStatus, 
    circuitStatus: CircuitBreakerStatus
  ): RecoveryStrategy | null {
    
    const context = {
      agentId,
      healthStatus,
      circuitStatus,
      triggerAlert: healthStatus.activeAlerts[0],
      systemState: { totalAgents: 0, healthyAgents: 0, activeTaskCount: 0, systemLoad: 0, availableResources: {} }
    }

    // Sort strategies by severity (critical failures first)
    const sortedStrategies = Array.from(this.strategies.values()).sort((a, b) => {
      const aSeverity = Math.max(...a.actions.map(action => this.getSeverityWeight(action.severity)))
      const bSeverity = Math.max(...b.actions.map(action => this.getSeverityWeight(action.severity)))
      return bSeverity - aSeverity
    })

    return sortedStrategies.find(strategy => strategy.conditions(context)) || null
  }

  /**
   * Get severity weight for sorting
   */
  private getSeverityWeight(severity: string): number {
    const weights = { low: 1, medium: 2, high: 3, critical: 4 }
    return weights[severity as keyof typeof weights] || 0
  }

  /**
   * Execute recovery strategy
   */
  private async executeStrategy(strategy: RecoveryStrategy, context: RecoveryContext): Promise<RecoveryExecution> {
    const execution: RecoveryExecution = {
      id: `recovery_${this.executionIdCounter++}`,
      agentId: context.agentId,
      strategyId: strategy.id,
      startTime: new Date(),
      status: 'running',
      progress: 0,
      results: []
    }

    this.executions.set(execution.id, execution)
    this.lastExecutionTime.set(`${context.agentId}_${strategy.id}`, execution.startTime)

    try {
      const totalActions = strategy.actions.length
      
      for (let i = 0; i < strategy.actions.length; i++) {
        const action = strategy.actions[i]
        execution.currentAction = action.description
        execution.progress = Math.round((i / totalActions) * 100)

        // Check prerequisites
        if (!this.checkPrerequisites(action.prerequisites, context)) {
          const result: RecoveryResult = {
            success: false,
            message: `Prerequisites not met for ${action.description}`
          }
          execution.results.push(result)
          continue
        }

        // Execute action
        const result = await action.execute(context)
        execution.results.push(result)

        if (!result.success && action.severity === 'critical') {
          execution.status = 'failed'
          execution.error = result.message
          break
        }
      }

      if (execution.status === 'running') {
        execution.status = 'completed'
        execution.progress = 100
      }

    } catch (error) {
      execution.status = 'failed'
      execution.error = error instanceof Error ? error.message : String(error)
    } finally {
      execution.endTime = new Date()
      execution.currentAction = undefined
    }

    return execution
  }

  /**
   * Check if prerequisites are met
   */
  private checkPrerequisites(prerequisites: string[], context: RecoveryContext): boolean {
    for (const prereq of prerequisites) {
      switch (prereq) {
        case 'healthy_agents_available':
          if (context.systemState.healthyAgents < 1) return false
          break
        case 'backup_agent_available':
          // Implementation would check for backup agent availability
          break
        case 'backup_agent_healthy':
          // Implementation would check backup agent health
          break
        case 'resources_available':
          // Implementation would check system resources
          break
        default:
          // Unknown prerequisite, assume not met
          return false
      }
    }
    return true
  }

  /**
   * Get current system state
   */
  private async getSystemState(): Promise<SystemState> {
    const allHealthStatuses = globalHealthMonitor.getAllHealthStatuses()
    const healthyAgents = allHealthStatuses.filter(status => status.currentHealth > 0.6).length
    
    return {
      totalAgents: allHealthStatuses.length,
      healthyAgents,
      activeTaskCount: allHealthStatuses.reduce((sum, status) => sum + status.metrics.queueDepth, 0),
      systemLoad: healthyAgents > 0 ? (allHealthStatuses.length - healthyAgents) / allHealthStatuses.length : 1.0,
      availableResources: {
        cpu: 0.8, // Mock values - would integrate with actual resource monitoring
        memory: 0.7,
        network: 0.9
      }
    }
  }

  /**
   * Get execution by ID
   */
  getExecution(executionId: string): RecoveryExecution | null {
    return this.executions.get(executionId) || null
  }

  /**
   * Get all executions for agent
   */
  getExecutionsForAgent(agentId: string): RecoveryExecution[] {
    return Array.from(this.executions.values())
      .filter(execution => execution.agentId === agentId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
  }

  /**
   * Get all recent executions
   */
  getRecentExecutions(limit: number = 10): RecoveryExecution[] {
    return Array.from(this.executions.values())
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit)
  }

  /**
   * Cancel running execution
   */
  cancelExecution(executionId: string): boolean {
    const execution = this.executions.get(executionId)
    if (execution && execution.status === 'running') {
      execution.status = 'cancelled'
      execution.endTime = new Date()
      return true
    }
    return false
  }
}

// Global recovery system instance
export const globalRecoverySystem = new RecoverySystem()