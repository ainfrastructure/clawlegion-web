'use client'

import { useState } from 'react'
import { 
  Shield, 
  Zap, 
  Play, 
  Pause, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  X,
  RefreshCw,
  Activity,
  Settings
} from 'lucide-react'

interface RecoveryDashboardProps {
  healthData: any
  recoveryData: any
  isLoading: boolean
  onTriggerRecovery: (agentId: string) => void
  onRefresh: () => void
}

interface RecoveryExecution {
  id: string
  agentId: string
  strategyId: string
  startTime: string
  endTime?: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  progress: number
  currentAction?: string
  results: Array<{
    success: boolean
    message: string
    nextCheckIn?: number
  }>
}

/**
 * Recovery System Dashboard
 * Shows autonomous recovery operations and circuit breaker status
 */
export function RecoveryDashboard({ 
  healthData, 
  recoveryData, 
  isLoading,
  onTriggerRecovery,
  onRefresh 
}: RecoveryDashboardProps) {
  const [selectedExecution, setSelectedExecution] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const agents = healthData?.agents || []
  const executions: RecoveryExecution[] = recoveryData?.executions || []
  const summary = recoveryData?.summary || { total: 0, running: 0, completed: 0, failed: 0, cancelled: 0 }

  const filteredExecutions = filterStatus === 'all' 
    ? executions 
    : executions.filter(e => e.status === filterStatus)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="text-blue-400 animate-pulse" size={16} />
      case 'completed':
        return <CheckCircle className="text-green-400" size={16} />
      case 'failed':
        return <AlertTriangle className="text-red-400" size={16} />
      case 'cancelled':
        return <X className="text-slate-500" size={16} />
      default:
        return <Clock className="text-slate-400" size={16} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/30'
      case 'completed':
        return 'text-green-400 bg-green-400/10 border-green-400/30'
      case 'failed':
        return 'text-red-400 bg-red-400/10 border-red-400/30'
      case 'cancelled':
        return 'text-slate-400 bg-slate-400/10 border-slate-400/30'
      default:
        return 'text-slate-400 bg-slate-800/30 border-slate-600/30'
    }
  }

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : new Date()
    const duration = end.getTime() - start.getTime()
    const seconds = Math.floor(duration / 1000)
    
    if (seconds < 60) return `${seconds}s`
    
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getAgentName = (agentId: string) => {
    const agent = agents.find((a: any) => a.id === agentId)
    return agent?.name || agentId
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Shield className="text-purple-400" size={24} />
            Autonomous Recovery Dashboard
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Circuit breakers, recovery operations, and system resilience
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700/50 rounded-lg transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Recovery Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="glass-2 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{summary.total}</div>
          <div className="text-sm text-slate-400">Total Recoveries</div>
        </div>
        
        <div className="glass-2 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{summary.running}</div>
          <div className="text-sm text-slate-400">Running</div>
        </div>
        
        <div className="glass-2 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{summary.completed}</div>
          <div className="text-sm text-slate-400">Completed</div>
        </div>
        
        <div className="glass-2 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{summary.failed}</div>
          <div className="text-sm text-slate-400">Failed</div>
        </div>
        
        <div className="glass-2 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-slate-400">{summary.cancelled}</div>
          <div className="text-sm text-slate-400">Cancelled</div>
        </div>
      </div>

      {/* Circuit Breaker Status */}
      <div className="glass-2 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Shield className="text-orange-400" size={20} />
            Circuit Breaker Status
          </h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent: any) => {
            const circuit = agent.circuitBreaker
            const health = agent.autonomousHealth
            
            return (
              <div key={agent.id} className={`p-4 rounded-lg border ${
                circuit.state === 'open' ? 'border-red-400/30 bg-red-400/5' :
                circuit.state === 'half-open' ? 'border-yellow-400/30 bg-yellow-400/5' :
                'border-green-400/30 bg-green-400/5'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      circuit.state === 'closed' ? 'bg-green-400' :
                      circuit.state === 'half-open' ? 'bg-yellow-400' :
                      'bg-red-400'
                    }`} />
                    <span className="font-medium text-white">{agent.name}</span>
                  </div>
                  
                  <span className={`text-xs px-2 py-1 rounded ${
                    circuit.state === 'closed' ? 'bg-green-500/20 text-green-400' :
                    circuit.state === 'half-open' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {circuit.state}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Health Score:</span>
                    <span className="text-white">{Math.round(circuit.healthScore * 100)}%</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-slate-400">Failures:</span>
                    <span className="text-white">{circuit.failureCount}</span>
                  </div>
                  
                  {circuit.timeToNextAttempt && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Next Attempt:</span>
                      <span className="text-white">{Math.round(circuit.timeToNextAttempt / 1000)}s</span>
                    </div>
                  )}
                </div>
                
                {circuit.state === 'open' && (
                  <button
                    onClick={() => onTriggerRecovery(agent.id)}
                    className="mt-3 w-full px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg text-sm transition-colors"
                  >
                    Trigger Recovery
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Recovery Executions */}
      <div className="glass-2 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap className="text-purple-400" size={20} />
              Recovery Operations
            </h3>
            
            {/* Status Filter */}
            <div className="flex gap-1">
              {[
                { key: 'all', label: 'All' },
                { key: 'running', label: 'Running' },
                { key: 'completed', label: 'Completed' },
                { key: 'failed', label: 'Failed' }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setFilterStatus(filter.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    filterStatus === filter.key
                      ? 'bg-purple-600/20 text-purple-400'
                      : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="animate-spin mr-2" size={20} />
              <span className="text-slate-400">Loading recovery data...</span>
            </div>
          ) : filteredExecutions.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-slate-500">
              <div className="text-center">
                <Activity className="mx-auto mb-2" size={32} />
                <p>No recovery operations</p>
                <p className="text-sm mt-1">
                  {filterStatus === 'all' ? 'No operations recorded' : `No ${filterStatus} operations`}
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {filteredExecutions.map((execution) => (
                <div key={execution.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(execution.status)}
                        <div>
                          <span className="font-medium text-white">
                            {getAgentName(execution.agentId)}
                          </span>
                          <span className="text-slate-400 ml-2">
                            {execution.strategyId.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-xs border ${getStatusColor(execution.status)}`}>
                          {execution.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-400 mb-2">
                        <span>Started: {new Date(execution.startTime).toLocaleTimeString()}</span>
                        <span>Duration: {formatDuration(execution.startTime, execution.endTime)}</span>
                        <span>Progress: {execution.progress}%</span>
                      </div>
                      
                      {execution.currentAction && (
                        <div className="text-sm text-blue-400 mb-2">
                          Current: {execution.currentAction}
                        </div>
                      )}
                      
                      {execution.status === 'running' && (
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${execution.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setSelectedExecution(
                          selectedExecution === execution.id ? null : execution.id
                        )}
                        className="p-1.5 text-slate-400 hover:text-slate-300 hover:bg-slate-700/50 rounded"
                        title="Toggle Details"
                      >
                        <Settings size={14} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Execution Details */}
                  {selectedExecution === execution.id && (
                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                      <h4 className="text-sm font-medium text-white mb-3">Recovery Actions</h4>
                      
                      {execution.results.length === 0 ? (
                        <p className="text-sm text-slate-400">No actions completed yet</p>
                      ) : (
                        <div className="space-y-2">
                          {execution.results.map((result, index) => (
                            <div
                              key={index}
                              className={`p-3 rounded-lg text-sm ${
                                result.success 
                                  ? 'bg-green-400/10 border border-green-400/20' 
                                  : 'bg-red-400/10 border border-red-400/20'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                {result.success ? (
                                  <CheckCircle className="text-green-400 mt-0.5" size={14} />
                                ) : (
                                  <AlertTriangle className="text-red-400 mt-0.5" size={14} />
                                )}
                                <div className="flex-1">
                                  <p className={result.success ? 'text-green-300' : 'text-red-300'}>
                                    {result.message}
                                  </p>
                                  {result.nextCheckIn && (
                                    <p className="text-slate-400 text-xs mt-1">
                                      Next check in {result.nextCheckIn}s
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-2 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="text-yellow-400" size={20} />
          Quick Actions
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.filter((agent: any) => 
            agent.autonomousHealth?.currentHealth < 0.6 && 
            !agent.recovery?.hasActiveRecovery
          ).map((agent: any) => (
            <div key={agent.id} className="p-4 bg-slate-800/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-white">{agent.name}</span>
                <span className="text-xs text-red-400">
                  {Math.round(agent.autonomousHealth.currentHealth * 100)}% health
                </span>
              </div>
              
              <div className="space-y-2">
                {agent.recovery?.recommendedActions?.slice(0, 2).map((action: string, index: number) => (
                  <div key={index} className="text-xs text-slate-400">
                    • {action}
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => onTriggerRecovery(agent.id)}
                className="mt-3 w-full px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
              >
                Start Recovery
              </button>
            </div>
          ))}
          
          {agents.filter((agent: any) => 
            agent.autonomousHealth?.currentHealth < 0.6 && 
            !agent.recovery?.hasActiveRecovery
          ).length === 0 && (
            <div className="col-span-full text-center py-8 text-slate-500">
              <CheckCircle className="mx-auto mb-2" size={32} />
              <p>All agents are healthy</p>
              <p className="text-sm mt-1">No recovery actions needed</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}