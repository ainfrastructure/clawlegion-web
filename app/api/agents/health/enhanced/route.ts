/**
 * Enhanced Health API with Phase 1 Autonomous Systems
 * Integrates circuit breakers, predictive monitoring, and recovery systems
 */

import { NextRequest, NextResponse } from 'next/server'
import { globalCircuitBreakerManager } from '@/lib/autonomous/circuit-breaker'
import { globalHealthMonitor, type HealthMetrics, type AgentHealthStatus } from '@/lib/autonomous/health-monitor'
import { globalRecoverySystem } from '@/lib/autonomous/recovery-system'

export const dynamic = 'force-dynamic'

interface EnhancedHealthResponse {
  timestamp: string
  summary: {
    totalAgents: number
    healthyAgents: number
    degradedAgents: number
    criticalAgents: number
    circuitBreakersOpen: number
    activeRecoveries: number
  }
  agents: EnhancedAgentHealth[]
  systemHealth: {
    overallScore: number
    trend: 'improving' | 'stable' | 'degrading'
    riskFactors: string[]
    recommendations: string[]
  }
}

interface EnhancedAgentHealth {
  id: string
  name: string
  basicHealth: {
    reachable: boolean
    status: string
    latencyMs?: number
    lastCheck: string
    error?: string
  }
  autonomousHealth: AgentHealthStatus | null
  circuitBreaker: {
    state: 'closed' | 'open' | 'half-open'
    healthScore: number
    canAttempt: boolean
    failureCount: number
    timeToNextAttempt?: number
  }
  recovery: {
    hasActiveRecovery: boolean
    lastRecoveryTime?: string
    recoverySuccess?: boolean
    recommendedActions: string[]
  }
}

/**
 * Fetch basic health data from existing health API
 */
async function fetchBasicHealth(): Promise<any> {
  try {
    const response = await fetch('http://localhost:3000/api/agents/health', {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    })
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.warn('Failed to fetch basic health data:', error)
  }
  return { agents: [], summary: { total: 0, reachable: 0, unreachable: 0, noEndpoint: 0 } }
}

/**
 * Generate synthetic health metrics for demo purposes
 * In production, this would collect real metrics from agents
 */
function generateSyntheticMetrics(agentId: string, basicHealth: any): HealthMetrics {
  const now = new Date()
  const baseResponseTime = basicHealth.reachable ? (basicHealth.latencyMs || 100) : 5000
  const baseErrorRate = basicHealth.reachable ? 0.02 : 0.8
  
  // Add some variation based on agent type
  let responseTimeMultiplier = 1.0
  let errorRateMultiplier = 1.0
  let taskCompletionRate = 0.95
  let queueDepth = 2

  switch (agentId.toLowerCase()) {
    case 'caesar':
      responseTimeMultiplier = 0.8 // Caesar is fast
      taskCompletionRate = 0.98
      queueDepth = 5 // Caesar handles coordination
      break
    case 'vulcan':
      responseTimeMultiplier = 1.5 // Vulcan takes time to build
      taskCompletionRate = 0.92
      queueDepth = 3
      break
    case 'janus':
      responseTimeMultiplier = 1.2 // Janus thorough verification
      taskCompletionRate = 0.94
      queueDepth = 2
      break
    case 'minerva':
      responseTimeMultiplier = 1.3 // Research takes time
      taskCompletionRate = 0.96
      queueDepth = 1
      break
    case 'athena':
      responseTimeMultiplier = 1.1 // Planning is moderately fast
      taskCompletionRate = 0.97
      queueDepth = 3
      break
  }

  if (!basicHealth.reachable) {
    errorRateMultiplier = 10
    taskCompletionRate = 0.1
    queueDepth = 0
  }

  return {
    timestamp: now,
    agentId,
    responseTime: baseResponseTime * responseTimeMultiplier,
    errorRate: Math.min(1.0, baseErrorRate * errorRateMultiplier),
    taskCompletionRate,
    queueDepth: Math.max(0, queueDepth + Math.floor(Math.random() * 3) - 1)
  }
}

/**
 * Calculate system health score and trends
 */
function calculateSystemHealth(agentHealthStatuses: (AgentHealthStatus | null)[]): {
  overallScore: number
  trend: 'improving' | 'stable' | 'degrading'
  riskFactors: string[]
  recommendations: string[]
} {
  const validStatuses = agentHealthStatuses.filter(s => s !== null) as AgentHealthStatus[]
  
  if (validStatuses.length === 0) {
    return {
      overallScore: 0,
      trend: 'degrading',
      riskFactors: ['No agent health data available'],
      recommendations: ['Check agent connectivity']
    }
  }

  // Calculate overall score
  const overallScore = validStatuses.reduce((sum, status) => sum + status.currentHealth, 0) / validStatuses.length

  // Determine overall trend
  const improvingCount = validStatuses.reduce((count, status) => 
    count + status.trends.filter(t => t.direction === 'improving').length, 0)
  const degradingCount = validStatuses.reduce((count, status) => 
    count + status.trends.filter(t => t.direction === 'degrading').length, 0)
  
  let trend: 'improving' | 'stable' | 'degrading' = 'stable'
  if (improvingCount > degradingCount * 1.5) trend = 'improving'
  else if (degradingCount > improvingCount * 1.5) trend = 'degrading'

  // Collect risk factors
  const riskFactors: string[] = []
  const criticalAgents = validStatuses.filter(s => s.currentHealth < 0.3).length
  const degradedAgents = validStatuses.filter(s => s.currentHealth < 0.6).length

  if (criticalAgents > 0) {
    riskFactors.push(`${criticalAgents} agents in critical state`)
  }
  if (degradedAgents > validStatuses.length * 0.5) {
    riskFactors.push('Over 50% of agents showing degraded performance')
  }
  if (trend === 'degrading') {
    riskFactors.push('Overall system trend is degrading')
  }

  // Generate recommendations
  const recommendations: string[] = []
  if (overallScore < 0.6) {
    recommendations.push('Consider scaling up resources')
  }
  if (criticalAgents > 0) {
    recommendations.push('Immediate attention needed for critical agents')
  }
  if (riskFactors.length === 0) {
    recommendations.push('System operating normally')
  }

  return { overallScore, trend, riskFactors, recommendations }
}

export async function GET(request: NextRequest) {
  const now = new Date().toISOString()
  
  try {
    // Fetch basic health data
    const basicHealthData = await fetchBasicHealth()
    const basicAgents = basicHealthData.agents || []

    // Process each agent with autonomous systems
    const enhancedAgents: EnhancedAgentHealth[] = []
    const agentHealthStatuses: (AgentHealthStatus | null)[] = []

    for (const basicAgent of basicAgents) {
      const agentId = basicAgent.id || basicAgent.name?.toLowerCase()
      
      // Generate and add synthetic metrics for demonstration
      const metrics = generateSyntheticMetrics(agentId, basicAgent)
      globalHealthMonitor.addMetrics(metrics)

      // Test circuit breaker logic based on health
      if (basicAgent.reachable) {
        globalCircuitBreakerManager.recordSuccess(agentId)
      } else {
        globalCircuitBreakerManager.recordFailure(agentId)
      }

      // Get autonomous health data
      const autonomousHealth = globalHealthMonitor.getHealthStatus(agentId)
      const circuitStatus = globalCircuitBreakerManager.getStatus(agentId)

      // Check for active recovery
      const recentExecutions = globalRecoverySystem.getExecutionsForAgent(agentId)
      const activeRecovery = recentExecutions.find(e => e.status === 'running')
      const lastRecovery = recentExecutions[0]

      // Generate recommendations based on autonomous analysis
      const recommendedActions: string[] = []
      if (autonomousHealth) {
        recommendedActions.push(...autonomousHealth.predictions.flatMap(p => p.recommendations))
      }
      if (circuitStatus.state === 'open') {
        recommendedActions.push('Circuit breaker is open - check agent connectivity')
      }

      const enhancedAgent: EnhancedAgentHealth = {
        id: agentId,
        name: basicAgent.name || agentId,
        basicHealth: {
          reachable: basicAgent.reachable,
          status: basicAgent.busy ? 'busy' : (basicAgent.reachable ? 'online' : 'offline'),
          latencyMs: basicAgent.latencyMs,
          lastCheck: basicAgent.lastCheck,
          error: basicAgent.error
        },
        autonomousHealth,
        circuitBreaker: {
          state: circuitStatus.state,
          healthScore: circuitStatus.healthScore,
          canAttempt: circuitStatus.canAttempt,
          failureCount: circuitStatus.failureCount,
          timeToNextAttempt: circuitStatus.timeToNextAttempt
        },
        recovery: {
          hasActiveRecovery: !!activeRecovery,
          lastRecoveryTime: lastRecovery?.startTime.toISOString(),
          recoverySuccess: lastRecovery?.status === 'completed',
          recommendedActions
        }
      }

      enhancedAgents.push(enhancedAgent)
      agentHealthStatuses.push(autonomousHealth)

      // Evaluate autonomous recovery if needed
      if (autonomousHealth && autonomousHealth.currentHealth < 0.6) {
        try {
          const recoveryExecution = await globalRecoverySystem.evaluateRecovery(agentId)
          if (recoveryExecution) {
            console.log(`Started recovery execution ${recoveryExecution.id} for agent ${agentId}`)
          }
        } catch (error) {
          console.warn(`Failed to evaluate recovery for agent ${agentId}:`, error)
        }
      }
    }

    // Calculate system health
    const systemHealth = calculateSystemHealth(agentHealthStatuses)

    // Generate summary
    const healthyAgents = enhancedAgents.filter(a => 
      a.autonomousHealth ? a.autonomousHealth.currentHealth > 0.6 : a.basicHealth.reachable
    ).length
    const degradedAgents = enhancedAgents.filter(a => 
      a.autonomousHealth ? a.autonomousHealth.currentHealth >= 0.3 && a.autonomousHealth.currentHealth <= 0.6 : false
    ).length
    const criticalAgents = enhancedAgents.filter(a => 
      a.autonomousHealth ? a.autonomousHealth.currentHealth < 0.3 : !a.basicHealth.reachable
    ).length
    const circuitBreakersOpen = enhancedAgents.filter(a => a.circuitBreaker.state === 'open').length
    const activeRecoveries = enhancedAgents.filter(a => a.recovery.hasActiveRecovery).length

    const response: EnhancedHealthResponse = {
      timestamp: now,
      summary: {
        totalAgents: enhancedAgents.length,
        healthyAgents,
        degradedAgents,
        criticalAgents,
        circuitBreakersOpen,
        activeRecoveries
      },
      agents: enhancedAgents,
      systemHealth
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Enhanced health API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch enhanced health data', 
        details: error instanceof Error ? error.message : String(error),
        timestamp: now 
      }, 
      { status: 500 }
    )
  }
}

/**
 * Trigger manual recovery for specific agent
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId, action } = body

    if (!agentId) {
      return NextResponse.json({ error: 'agentId is required' }, { status: 400 })
    }

    switch (action) {
      case 'reset_circuit':
        globalCircuitBreakerManager.resetBreaker(agentId)
        return NextResponse.json({ 
          success: true, 
          message: `Circuit breaker reset for agent ${agentId}` 
        })

      case 'trigger_recovery':
        const execution = await globalRecoverySystem.evaluateRecovery(agentId)
        if (execution) {
          return NextResponse.json({
            success: true,
            message: `Recovery started for agent ${agentId}`,
            executionId: execution.id
          })
        } else {
          return NextResponse.json({
            success: false,
            message: `No applicable recovery strategy found for agent ${agentId}`
          })
        }

      case 'cancel_recovery':
        const { executionId } = body
        if (!executionId) {
          return NextResponse.json({ error: 'executionId required for cancel_recovery' }, { status: 400 })
        }
        const cancelled = globalRecoverySystem.cancelExecution(executionId)
        return NextResponse.json({
          success: cancelled,
          message: cancelled 
            ? `Recovery execution ${executionId} cancelled`
            : `Recovery execution ${executionId} not found or not cancellable`
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to process recovery action',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}