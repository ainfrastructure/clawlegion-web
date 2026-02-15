'use client'

import { useState } from 'react'
import { 
  ArrowRight, 
  GitBranch, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Zap,
  User,
  Settings
} from 'lucide-react'

interface AgentTaskFlowProps {
  agents: any[]
  onAgentSelect: (agentId: string | null) => void
  selectedAgent: string | null
}

interface TaskFlowStep {
  id: string
  name: string
  agent: any
  status: 'idle' | 'active' | 'completed' | 'error'
  progress?: number
  currentTask?: string
  queueDepth: number
  healthScore: number
}

/**
 * Task Flow Visualization Component
 * Shows Caesar → Athena → Vulcan → Janus workflow
 */
export function AgentTaskFlow({ agents, onAgentSelect, selectedAgent }: AgentTaskFlowProps) {
  const [showDetails, setShowDetails] = useState(false)

  // Define the canonical workflow
  const workflowSteps = ['caesar', 'minerva', 'athena', 'vulcan', 'janus']
  
  const getTaskFlowSteps = (): TaskFlowStep[] => {
    return workflowSteps.map(stepId => {
      const agent = agents.find(a => a.id === stepId)
      
      if (!agent) {
        return {
          id: stepId,
          name: stepId.charAt(0).toUpperCase() + stepId.slice(1),
          agent: null,
          status: 'idle',
          queueDepth: 0,
          healthScore: 0
        }
      }

      // Determine status based on agent state
      let status: 'idle' | 'active' | 'completed' | 'error' = 'idle'
      
      if (agent.basicHealth?.status === 'busy') {
        status = 'active'
      } else if (agent.autonomousHealth?.activeAlerts?.some((a: any) => a.type === 'critical')) {
        status = 'error'
      } else if (agent.basicHealth?.reachable) {
        status = 'idle'
      } else {
        status = 'error'
      }

      const healthScore = agent.autonomousHealth?.currentHealth || 0
      const queueDepth = agent.autonomousHealth?.metrics?.queueDepth || 0
      const currentTask = agent.basicHealth?.activeTask

      return {
        id: stepId,
        name: agent.name || stepId.charAt(0).toUpperCase() + stepId.slice(1),
        agent,
        status,
        queueDepth,
        healthScore,
        currentTask
      }
    })
  }

  const steps = getTaskFlowSteps()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Zap className="text-blue-400 animate-pulse" size={20} />
      case 'completed':
        return <CheckCircle className="text-green-400" size={20} />
      case 'error':
        return <AlertTriangle className="text-red-400" size={20} />
      default:
        return <Clock className="text-slate-500" size={20} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'border-blue-400 bg-blue-400/10'
      case 'completed':
        return 'border-green-400 bg-green-400/10'
      case 'error':
        return 'border-red-400 bg-red-400/10'
      default:
        return 'border-slate-600 bg-slate-800/50'
    }
  }

  const getHealthColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-400'
    if (score >= 0.6) return 'bg-yellow-400'
    if (score >= 0.3) return 'bg-orange-400'
    return 'bg-red-400'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <GitBranch className="text-purple-400" size={24} />
            Agent Task Flow Pipeline
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Caesar → Minerva → Athena → Vulcan → Janus workflow visualization
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              showDetails 
                ? 'bg-purple-600/20 text-purple-400' 
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            <Settings size={14} className="mr-1" />
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
      </div>

      {/* Flow Visualization */}
      <div className="glass-2 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-4">
              {/* Step Card */}
              <div
                className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer min-w-48 ${
                  getStatusColor(step.status)
                } ${selectedAgent === step.id ? 'ring-2 ring-blue-400' : ''}`}
                onClick={() => onAgentSelect(step.id)}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(step.status)}
                    <span className="font-medium text-white">{step.name}</span>
                  </div>
                  
                  {step.agent && (
                    <div className="flex items-center gap-1">
                      <div 
                        className={`w-2 h-2 rounded-full ${getHealthColor(step.healthScore)}`}
                        title={`Health: ${Math.round(step.healthScore * 100)}%`}
                      />
                    </div>
                  )}
                </div>

                {/* Status Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Status:</span>
                    <span className={`capitalize ${
                      step.status === 'active' ? 'text-blue-400' :
                      step.status === 'error' ? 'text-red-400' :
                      step.status === 'completed' ? 'text-green-400' :
                      'text-slate-400'
                    }`}>
                      {step.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Queue:</span>
                    <span className="text-white">{step.queueDepth}</span>
                  </div>

                  {step.agent && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Health:</span>
                      <span className="text-white">
                        {Math.round(step.healthScore * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Current Task */}
                {step.currentTask && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <p className="text-xs text-slate-400 mb-1">Current Task:</p>
                    <p className="text-xs text-slate-300 truncate" title={step.currentTask}>
                      {step.currentTask}
                    </p>
                  </div>
                )}

                {/* Circuit Breaker Status */}
                {step.agent?.circuitBreaker?.state === 'open' && (
                  <div className="mt-2 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-400">
                    Circuit Breaker Open
                  </div>
                )}

                {/* Recovery Active */}
                {step.agent?.recovery?.hasActiveRecovery && (
                  <div className="mt-2 px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-400">
                    Recovery Active
                  </div>
                )}
              </div>

              {/* Arrow */}
              {index < steps.length - 1 && (
                <div className="hidden lg:flex items-center">
                  <ArrowRight className="text-slate-600" size={24} />
                </div>
              )}
              
              {/* Mobile Arrow */}
              {index < steps.length - 1 && (
                <div className="flex lg:hidden items-center rotate-90">
                  <ArrowRight className="text-slate-600" size={24} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Flow Statistics */}
        <div className="mt-6 pt-6 border-t border-slate-700/50">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {steps.filter(s => s.status === 'active').length}
              </div>
              <div className="text-sm text-slate-400">Active</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-400">
                {steps.filter(s => s.status === 'idle').length}
              </div>
              <div className="text-sm text-slate-400">Idle</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {steps.filter(s => s.status === 'error').length}
              </div>
              <div className="text-sm text-slate-400">Errors</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {steps.reduce((sum, s) => sum + s.queueDepth, 0)}
              </div>
              <div className="text-sm text-slate-400">Total Queue</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed View */}
      {showDetails && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {steps.filter(step => step.agent).map((step) => (
            <div key={step.id} className="glass-2 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-white">{step.name} Details</h3>
                <button
                  onClick={() => onAgentSelect(step.id)}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  View Activity
                </button>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Response Time:</span>
                  <span className="text-white">
                    {step.agent.autonomousHealth?.metrics?.responseTime 
                      ? `${Math.round(step.agent.autonomousHealth.metrics.responseTime)}ms`
                      : 'N/A'
                    }
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-400">Error Rate:</span>
                  <span className="text-white">
                    {step.agent.autonomousHealth?.metrics?.errorRate 
                      ? `${Math.round(step.agent.autonomousHealth.metrics.errorRate * 100)}%`
                      : 'N/A'
                    }
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-400">Task Completion:</span>
                  <span className="text-white">
                    {step.agent.autonomousHealth?.metrics?.taskCompletionRate 
                      ? `${Math.round(step.agent.autonomousHealth.metrics.taskCompletionRate * 100)}%`
                      : 'N/A'
                    }
                  </span>
                </div>
                
                {step.agent.autonomousHealth?.trends && step.agent.autonomousHealth.trends.length > 0 && (
                  <div className="pt-2 border-t border-slate-700/50">
                    <span className="text-slate-400 text-xs">Trends:</span>
                    <div className="mt-1 space-y-1">
                      {step.agent.autonomousHealth.trends.slice(0, 2).map((trend: any, index: number) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 capitalize">{trend.metric}:</span>
                          <span className={`${
                            trend.direction === 'improving' ? 'text-green-400' :
                            trend.direction === 'degrading' ? 'text-red-400' :
                            'text-slate-400'
                          }`}>
                            {trend.direction}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}