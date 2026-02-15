/**
 * Recovery System API
 * Phase 1 Autonomous Systems - Recovery Management
 */

import { NextRequest, NextResponse } from 'next/server'
import { globalRecoverySystem } from '@/lib/autonomous/recovery-system'
import { globalCircuitBreakerManager } from '@/lib/autonomous/circuit-breaker'
import { globalHealthMonitor } from '@/lib/autonomous/health-monitor'

export const dynamic = 'force-dynamic'

/**
 * GET /api/agents/recovery
 * Query parameters:
 * - agentId: Get executions for specific agent
 * - executionId: Get specific execution
 * - status: Filter by execution status
 * - limit: Limit number of results
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const agentId = searchParams.get('agentId')
  const executionId = searchParams.get('executionId')
  const status = searchParams.get('status')
  const limit = parseInt(searchParams.get('limit') || '50')

  try {
    // Get specific execution
    if (executionId) {
      const execution = globalRecoverySystem.getExecution(executionId)
      if (!execution) {
        return NextResponse.json({ error: 'Execution not found' }, { status: 404 })
      }
      return NextResponse.json({ execution })
    }

    // Get executions for specific agent
    if (agentId) {
      const executions = globalRecoverySystem.getExecutionsForAgent(agentId)
      const filtered = status 
        ? executions.filter(e => e.status === status)
        : executions
      
      return NextResponse.json({ 
        executions: filtered.slice(0, limit),
        total: filtered.length,
        agentId
      })
    }

    // Get all recent executions
    const executions = globalRecoverySystem.getRecentExecutions(limit)
    const filtered = status 
      ? executions.filter(e => e.status === status)
      : executions

    // Get summary stats
    const summary = {
      total: executions.length,
      running: executions.filter(e => e.status === 'running').length,
      completed: executions.filter(e => e.status === 'completed').length,
      failed: executions.filter(e => e.status === 'failed').length,
      cancelled: executions.filter(e => e.status === 'cancelled').length
    }

    return NextResponse.json({
      executions: filtered,
      summary,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to fetch recovery data',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/agents/recovery
 * Actions:
 * - trigger: Trigger recovery for specific agent
 * - cancel: Cancel running recovery execution
 * - reset: Reset recovery state for agent
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, agentId, executionId, force } = body

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    switch (action) {
      case 'trigger': {
        if (!agentId) {
          return NextResponse.json({ error: 'agentId is required for trigger action' }, { status: 400 })
        }

        const execution = await globalRecoverySystem.evaluateRecovery(agentId)
        
        if (execution) {
          return NextResponse.json({
            success: true,
            message: `Recovery started for agent ${agentId}`,
            execution: {
              id: execution.id,
              agentId: execution.agentId,
              strategyId: execution.strategyId,
              status: execution.status,
              progress: execution.progress,
              startTime: execution.startTime
            }
          })
        } else {
          return NextResponse.json({
            success: false,
            message: `No applicable recovery strategy found for agent ${agentId}`,
            reason: 'no_strategy_applicable'
          })
        }
      }

      case 'cancel': {
        if (!executionId) {
          return NextResponse.json({ error: 'executionId is required for cancel action' }, { status: 400 })
        }

        const cancelled = globalRecoverySystem.cancelExecution(executionId)
        
        return NextResponse.json({
          success: cancelled,
          message: cancelled 
            ? `Recovery execution ${executionId} cancelled`
            : `Recovery execution ${executionId} not found or not cancellable`
        })
      }

      case 'reset': {
        if (!agentId) {
          return NextResponse.json({ error: 'agentId is required for reset action' }, { status: 400 })
        }

        // Reset circuit breaker
        globalCircuitBreakerManager.resetBreaker(agentId)

        // Cancel any running recoveries for the agent
        const runningExecutions = globalRecoverySystem.getExecutionsForAgent(agentId)
          .filter(e => e.status === 'running')

        for (const execution of runningExecutions) {
          globalRecoverySystem.cancelExecution(execution.id)
        }

        return NextResponse.json({
          success: true,
          message: `Recovery state reset for agent ${agentId}`,
          cancelledExecutions: runningExecutions.length
        })
      }

      case 'evaluate_all': {
        // Evaluate recovery for all agents that need it
        const allHealthStatuses = globalHealthMonitor.getAllHealthStatuses()
        const results = []

        for (const status of allHealthStatuses) {
          if (status.currentHealth < 0.6) {
            try {
              const execution = await globalRecoverySystem.evaluateRecovery(status.agentId)
              if (execution) {
                results.push({
                  agentId: status.agentId,
                  executionId: execution.id,
                  strategy: execution.strategyId
                })
              }
            } catch (error) {
              results.push({
                agentId: status.agentId,
                error: error instanceof Error ? error.message : String(error)
              })
            }
          }
        }

        return NextResponse.json({
          success: true,
          message: `Evaluated recovery for ${allHealthStatuses.length} agents`,
          results
        })
      }

      case 'get_recommendations': {
        if (!agentId) {
          return NextResponse.json({ error: 'agentId is required for get_recommendations action' }, { status: 400 })
        }

        const healthStatus = globalHealthMonitor.getHealthStatus(agentId)
        const circuitStatus = globalCircuitBreakerManager.getStatus(agentId)
        
        if (!healthStatus) {
          return NextResponse.json({ error: 'Agent health data not found' }, { status: 404 })
        }

        // Generate recommendations based on current state
        const recommendations = []

        if (circuitStatus.state === 'open') {
          recommendations.push({
            priority: 'high',
            action: 'reset_circuit_breaker',
            description: 'Circuit breaker is open, preventing requests',
            estimated_time: '30 seconds'
          })
        }

        if (healthStatus.currentHealth < 0.3) {
          recommendations.push({
            priority: 'critical',
            action: 'immediate_intervention',
            description: 'Agent health is critically low',
            estimated_time: '2-5 minutes'
          })
        } else if (healthStatus.currentHealth < 0.6) {
          recommendations.push({
            priority: 'medium',
            action: 'performance_optimization',
            description: 'Agent performance is degraded',
            estimated_time: '1-3 minutes'
          })
        }

        if (healthStatus.metrics.queueDepth > 10) {
          recommendations.push({
            priority: 'high',
            action: 'redistribute_tasks',
            description: 'Task queue is overloaded',
            estimated_time: '1-2 minutes'
          })
        }

        if (healthStatus.activeAlerts.some(a => a.type === 'critical')) {
          recommendations.push({
            priority: 'critical',
            action: 'investigate_alerts',
            description: 'Critical alerts require immediate attention',
            estimated_time: '3-10 minutes'
          })
        }

        return NextResponse.json({
          agentId,
          currentHealth: healthStatus.currentHealth,
          recommendations,
          predictions: healthStatus.predictions,
          timestamp: new Date().toISOString()
        })
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
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

/**
 * DELETE /api/agents/recovery
 * Clean up old recovery executions
 */
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const olderThan = searchParams.get('olderThan') // hours
  const status = searchParams.get('status')

  try {
    // This would implement cleanup of old recovery execution records
    // For now, return success as the in-memory implementation doesn't need cleanup
    
    return NextResponse.json({
      success: true,
      message: 'Recovery cleanup completed',
      cleaned: 0 // Would return actual count in real implementation
    })

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to clean up recovery data',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}