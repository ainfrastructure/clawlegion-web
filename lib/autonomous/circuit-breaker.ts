/**
 * Circuit Breaker Pattern Implementation for Agent Health Monitoring
 * Phase 1 Autonomous Systems - Error Recovery
 */

export interface CircuitBreakerConfig {
  /** Failure threshold before opening circuit */
  failureThreshold: number
  /** Reset timeout in milliseconds */
  resetTimeout: number
  /** Recovery timeout in milliseconds */
  recoveryTimeout: number
  /** Success threshold for half-open to closed transition */
  successThreshold: number
}

export type CircuitState = 'closed' | 'open' | 'half-open'

export interface CircuitBreakerStats {
  state: CircuitState
  failureCount: number
  successCount: number
  lastFailureTime?: Date
  nextAttemptTime?: Date
  totalRequests: number
  totalFailures: number
  totalSuccesses: number
}

export interface CircuitBreakerStatus extends CircuitBreakerStats {
  agentId: string
  healthScore: number
  isHealthy: boolean
  canAttempt: boolean
  timeToNextAttempt?: number
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeout: 60000, // 1 minute
  recoveryTimeout: 30000, // 30 seconds  
  successThreshold: 3
}

/**
 * Circuit Breaker for individual agents
 */
export class AgentCircuitBreaker {
  private config: CircuitBreakerConfig
  private stats: CircuitBreakerStats
  private agentId: string

  constructor(agentId: string, config: Partial<CircuitBreakerConfig> = {}) {
    this.agentId = agentId
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.stats = {
      state: 'closed',
      failureCount: 0,
      successCount: 0,
      totalRequests: 0,
      totalFailures: 0,
      totalSuccesses: 0
    }
  }

  /**
   * Check if circuit allows attempts
   */
  canAttempt(): boolean {
    const now = new Date()

    switch (this.stats.state) {
      case 'closed':
        return true
      
      case 'open':
        if (this.stats.nextAttemptTime && now >= this.stats.nextAttemptTime) {
          this.transitionTo('half-open')
          return true
        }
        return false
      
      case 'half-open':
        return true
      
      default:
        return false
    }
  }

  /**
   * Record successful operation
   */
  recordSuccess(): void {
    this.stats.totalRequests++
    this.stats.totalSuccesses++
    
    switch (this.stats.state) {
      case 'closed':
        this.stats.failureCount = 0
        break
      
      case 'half-open':
        this.stats.successCount++
        if (this.stats.successCount >= this.config.successThreshold) {
          this.transitionTo('closed')
        }
        break
    }
  }

  /**
   * Record failed operation
   */
  recordFailure(error?: Error): void {
    this.stats.totalRequests++
    this.stats.totalFailures++
    this.stats.lastFailureTime = new Date()
    
    switch (this.stats.state) {
      case 'closed':
        this.stats.failureCount++
        if (this.stats.failureCount >= this.config.failureThreshold) {
          this.transitionTo('open')
        }
        break
      
      case 'half-open':
        this.transitionTo('open')
        break
    }
  }

  /**
   * Get current circuit breaker status
   */
  getStatus(): CircuitBreakerStatus {
    const now = new Date()
    const healthScore = this.calculateHealthScore()
    
    return {
      agentId: this.agentId,
      ...this.stats,
      healthScore,
      isHealthy: this.stats.state === 'closed' && healthScore > 0.5,
      canAttempt: this.canAttempt(),
      timeToNextAttempt: this.stats.nextAttemptTime 
        ? Math.max(0, this.stats.nextAttemptTime.getTime() - now.getTime())
        : undefined
    }
  }

  /**
   * Reset circuit breaker to initial state
   */
  reset(): void {
    this.stats = {
      state: 'closed',
      failureCount: 0,
      successCount: 0,
      totalRequests: this.stats.totalRequests,
      totalFailures: this.stats.totalFailures,
      totalSuccesses: this.stats.totalSuccesses
    }
  }

  /**
   * Transition to new state
   */
  private transitionTo(newState: CircuitState): void {
    const now = new Date()
    
    switch (newState) {
      case 'open':
        this.stats.state = 'open'
        this.stats.nextAttemptTime = new Date(now.getTime() + this.config.resetTimeout)
        this.stats.successCount = 0
        break
      
      case 'half-open':
        this.stats.state = 'half-open'
        this.stats.successCount = 0
        this.stats.failureCount = 0
        delete this.stats.nextAttemptTime
        break
      
      case 'closed':
        this.stats.state = 'closed'
        this.stats.failureCount = 0
        this.stats.successCount = 0
        delete this.stats.nextAttemptTime
        delete this.stats.lastFailureTime
        break
    }
  }

  /**
   * Calculate health score (0-1)
   */
  private calculateHealthScore(): number {
    if (this.stats.totalRequests === 0) return 1.0

    const successRate = this.stats.totalSuccesses / this.stats.totalRequests
    const recencyFactor = this.getRecencyFactor()
    const stateFactor = this.getStateFactor()

    return (successRate * 0.6) + (recencyFactor * 0.2) + (stateFactor * 0.2)
  }

  /**
   * Calculate recency factor based on last failure time
   */
  private getRecencyFactor(): number {
    if (!this.stats.lastFailureTime) return 1.0

    const now = new Date()
    const timeSinceFailure = now.getTime() - this.stats.lastFailureTime.getTime()
    const recoveryWindow = this.config.recoveryTimeout * 2

    if (timeSinceFailure >= recoveryWindow) return 1.0
    return Math.max(0, timeSinceFailure / recoveryWindow)
  }

  /**
   * Get factor based on current state
   */
  private getStateFactor(): number {
    switch (this.stats.state) {
      case 'closed': return 1.0
      case 'half-open': return 0.5
      case 'open': return 0.0
      default: return 0.0
    }
  }
}

/**
 * Global Circuit Breaker Manager for all agents
 */
export class CircuitBreakerManager {
  private breakers = new Map<string, AgentCircuitBreaker>()
  private config: CircuitBreakerConfig

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Get or create circuit breaker for agent
   */
  getBreaker(agentId: string): AgentCircuitBreaker {
    if (!this.breakers.has(agentId)) {
      this.breakers.set(agentId, new AgentCircuitBreaker(agentId, this.config))
    }
    return this.breakers.get(agentId)!
  }

  /**
   * Get status for all circuit breakers
   */
  getAllStatuses(): CircuitBreakerStatus[] {
    return Array.from(this.breakers.values()).map(breaker => breaker.getStatus())
  }

  /**
   * Get status for specific agent
   */
  getStatus(agentId: string): CircuitBreakerStatus {
    return this.getBreaker(agentId).getStatus()
  }

  /**
   * Record success for agent
   */
  recordSuccess(agentId: string): void {
    this.getBreaker(agentId).recordSuccess()
  }

  /**
   * Record failure for agent
   */
  recordFailure(agentId: string, error?: Error): void {
    this.getBreaker(agentId).recordFailure(error)
  }

  /**
   * Check if agent can be used
   */
  canAttempt(agentId: string): boolean {
    return this.getBreaker(agentId).canAttempt()
  }

  /**
   * Reset circuit breaker for agent
   */
  resetBreaker(agentId: string): void {
    this.getBreaker(agentId).reset()
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    this.breakers.forEach(breaker => breaker.reset())
  }
}

// Global instance
export const globalCircuitBreakerManager = new CircuitBreakerManager()