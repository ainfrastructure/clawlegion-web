'use client'

import { useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Activity,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle,
  Shield,
  RotateCcw,
  Play,
  Info
} from 'lucide-react'

interface AgentPerformanceMetricsProps {
  agents: any[]
  showDetails?: boolean
  onTriggerRecovery?: (agentId: string) => void
  onResetCircuit?: (agentId: string) => void
}

interface MetricCardProps {
  title: string
  value: string | number
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
  icon: React.ReactNode
  color: string
  subtitle?: string
  onClick?: () => void
}

function MetricCard({ title, value, trend, trendValue, icon, color, subtitle, onClick }: MetricCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="text-green-400" size={14} />
      case 'down':
        return <TrendingDown className="text-red-400" size={14} />
      default:
        return <Minus className="text-slate-500" size={14} />
    }
  }

  return (
    <div 
      className={`p-4 rounded-lg glass-2 ${onClick ? 'cursor-pointer hover:bg-slate-700/30' : ''} transition-colors`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className={color}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="text-xl font-semibold text-white">{value}</p>
            {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          </div>
        </div>
        
        {trend && trendValue && (
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span className={`text-xs ${
              trend === 'up' ? 'text-green-400' :
              trend === 'down' ? 'text-red-400' :
              'text-slate-400'
            }`}>
              {trendValue}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Agent Performance Metrics Dashboard
 */
export function AgentPerformanceMetrics({ 
  agents, 
  showDetails = false, 
  onTriggerRecovery,
  onResetCircuit 
}: AgentPerformanceMetricsProps) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [showAlerts, setShowAlerts] = useState(false)

  const getAgentMetrics = (agent: any) => {
    const health = agent.autonomousHealth
    const circuit = agent.circuitBreaker
    const basic = agent.basicHealth
    
    if (!health) {
      return {
        responseTime: basic?.latencyMs || 0,
        errorRate: basic?.reachable ? 0 : 1,
        taskCompletion: basic?.reachable ? 0.8 : 0,
        queueDepth: 0,
        healthScore: basic?.reachable ? 0.8 : 0,
        trends: [],
        alerts: [],
        predictions: []
      }
    }

    return {
      responseTime: health.metrics.responseTime,
      errorRate: health.metrics.errorRate,
      taskCompletion: health.metrics.taskCompletionRate,
      queueDepth: health.metrics.queueDepth,
      healthScore: health.currentHealth,
      trends: health.trends || [],
      alerts: health.activeAlerts || [],
      predictions: health.predictions || []
    }
  }

  const getTrendDirection = (trends: any[], metric: string) => {
    const trend = trends.find(t => t.metric === metric)
    return trend?.direction || 'stable'
  }

  const formatValue = (value: number, type: 'time' | 'percent' | 'number') => {
    switch (type) {
      case 'time':
        return value < 1000 ? `${Math.round(value)}ms` : `${(value / 1000).toFixed(1)}s`
      case 'percent':
        return `${Math.round(value * 100)}%`
      case 'number':
        return Math.round(value).toString()
      default:
        return value.toString()
    }
  }

  // Calculate overall system metrics
  const systemMetrics = agents.reduce((acc, agent) => {
    const metrics = getAgentMetrics(agent)
    acc.totalAgents += 1
    acc.totalResponseTime += metrics.responseTime
    acc.totalErrorRate += metrics.errorRate
    acc.totalTaskCompletion += metrics.taskCompletion
    acc.totalQueueDepth += metrics.queueDepth
    acc.totalHealthScore += metrics.healthScore
    acc.totalAlerts += metrics.alerts.length
    acc.circuitBreakersOpen += agent.circuitBreaker?.state === 'open' ? 1 : 0
    acc.activeRecoveries += agent.recovery?.hasActiveRecovery ? 1 : 0
    return acc
  }, {
    totalAgents: 0,
    totalResponseTime: 0,
    totalErrorRate: 0,
    totalTaskCompletion: 0,
    totalQueueDepth: 0,
    totalHealthScore: 0,
    totalAlerts: 0,
    circuitBreakersOpen: 0,
    activeRecoveries: 0
  })

  const avgResponseTime = systemMetrics.totalAgents > 0 ? systemMetrics.totalResponseTime / systemMetrics.totalAgents : 0
  const avgErrorRate = systemMetrics.totalAgents > 0 ? systemMetrics.totalErrorRate / systemMetrics.totalAgents : 0
  const avgTaskCompletion = systemMetrics.totalAgents > 0 ? systemMetrics.totalTaskCompletion / systemMetrics.totalAgents : 0
  const avgHealthScore = systemMetrics.totalAgents > 0 ? systemMetrics.totalHealthScore / systemMetrics.totalAgents : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Activity className="text-blue-400" size={24} />
            Performance Metrics
            {showDetails && <span className="text-slate-500">- Detailed View</span>}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time performance metrics with Phase 1 autonomous systems
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-colors ${
              showAlerts 
                ? 'bg-red-600/20 text-red-400' 
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            <AlertTriangle size={14} />
            Alerts ({systemMetrics.totalAlerts})
          </button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Avg Response Time"
          value={formatValue(avgResponseTime, 'time')}
          icon={<Clock size={20} />}
          color="text-blue-400"
          trend={avgResponseTime < 1000 ? 'up' : avgResponseTime > 5000 ? 'down' : 'stable'}
          trendValue="5min"
        />
        
        <MetricCard
          title="Error Rate"
          value={formatValue(avgErrorRate, 'percent')}
          icon={<AlertTriangle size={20} />}
          color="text-red-400"
          trend={avgErrorRate < 0.05 ? 'up' : avgErrorRate > 0.2 ? 'down' : 'stable'}
          trendValue="avg"
        />
        
        <MetricCard
          title="Task Completion"
          value={formatValue(avgTaskCompletion, 'percent')}
          icon={<CheckCircle size={20} />}
          color="text-green-400"
          trend={avgTaskCompletion > 0.9 ? 'up' : avgTaskCompletion < 0.7 ? 'down' : 'stable'}
          trendValue="rate"
        />
        
        <MetricCard
          title="System Health"
          value={formatValue(avgHealthScore, 'percent')}
          icon={<Activity size={20} />}
          color="text-purple-400"
          trend={avgHealthScore > 0.8 ? 'up' : avgHealthScore < 0.5 ? 'down' : 'stable'}
          trendValue="overall"
        />
        
        <MetricCard
          title="Circuit Breakers"
          value={systemMetrics.circuitBreakersOpen}
          icon={<Shield size={20} />}
          color="text-orange-400"
          subtitle="open"
        />
        
        <MetricCard
          title="Active Recoveries"
          value={systemMetrics.activeRecoveries}
          icon={<Zap size={20} />}
          color="text-yellow-400"
          subtitle="running"
        />
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const metrics = getAgentMetrics(agent)
          const isSelected = selectedAgent === agent.id
          
          return (
            <div key={agent.id} className={`glass-2 rounded-xl p-6 ${
              isSelected ? 'ring-2 ring-blue-400' : ''
            }`}>
              {/* Agent Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    metrics.healthScore >= 0.8 ? 'bg-green-400' :
                    metrics.healthScore >= 0.6 ? 'bg-yellow-400' :
                    metrics.healthScore >= 0.3 ? 'bg-orange-400' :
                    'bg-red-400'
                  }`} />
                  <div>
                    <h3 className="font-medium text-white">{agent.name}</h3>
                    <p className="text-sm text-slate-400">
                      Health: {formatValue(metrics.healthScore, 'percent')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {agent.circuitBreaker?.state === 'open' && (
                    <button
                      onClick={() => onResetCircuit?.(agent.id)}
                      className="p-1.5 text-orange-400 hover:bg-orange-400/10 rounded"
                      title="Reset Circuit Breaker"
                    >
                      <RotateCcw size={16} />
                    </button>
                  )}
                  
                  {metrics.healthScore < 0.6 && !agent.recovery?.hasActiveRecovery && (
                    <button
                      onClick={() => onTriggerRecovery?.(agent.id)}
                      className="p-1.5 text-purple-400 hover:bg-purple-400/10 rounded"
                      title="Trigger Recovery"
                    >
                      <Play size={16} />
                    </button>
                  )}
                  
                  <button
                    onClick={() => setSelectedAgent(isSelected ? null : agent.id)}
                    className="p-1.5 text-slate-400 hover:bg-slate-700/50 rounded"
                    title="Toggle Details"
                  >
                    <Info size={16} />
                  </button>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                  <div className="text-lg font-semibold text-white">
                    {formatValue(metrics.responseTime, 'time')}
                  </div>
                  <div className="text-xs text-slate-400">Response Time</div>
                  {getTrendDirection(metrics.trends, 'responseTime') !== 'stable' && (
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {getTrendDirection(metrics.trends, 'responseTime') === 'improving' ? 
                        <TrendingUp className="text-green-400" size={10} /> :
                        <TrendingDown className="text-red-400" size={10} />
                      }
                    </div>
                  )}
                </div>
                
                <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                  <div className="text-lg font-semibold text-white">
                    {formatValue(metrics.errorRate, 'percent')}
                  </div>
                  <div className="text-xs text-slate-400">Error Rate</div>
                  {getTrendDirection(metrics.trends, 'errorRate') !== 'stable' && (
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {getTrendDirection(metrics.trends, 'errorRate') === 'improving' ? 
                        <TrendingUp className="text-green-400" size={10} /> :
                        <TrendingDown className="text-red-400" size={10} />
                      }
                    </div>
                  )}
                </div>
                
                <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                  <div className="text-lg font-semibold text-white">
                    {formatValue(metrics.taskCompletion, 'percent')}
                  </div>
                  <div className="text-xs text-slate-400">Completion</div>
                  {getTrendDirection(metrics.trends, 'taskCompletionRate') !== 'stable' && (
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {getTrendDirection(metrics.trends, 'taskCompletionRate') === 'improving' ? 
                        <TrendingUp className="text-green-400" size={10} /> :
                        <TrendingDown className="text-red-400" size={10} />
                      }
                    </div>
                  )}
                </div>
                
                <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                  <div className="text-lg font-semibold text-white">
                    {formatValue(metrics.queueDepth, 'number')}
                  </div>
                  <div className="text-xs text-slate-400">Queue Depth</div>
                  {getTrendDirection(metrics.trends, 'queueDepth') !== 'stable' && (
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {getTrendDirection(metrics.trends, 'queueDepth') === 'improving' ? 
                        <TrendingUp className="text-green-400" size={10} /> :
                        <TrendingDown className="text-red-400" size={10} />
                      }
                    </div>
                  )}
                </div>
              </div>

              {/* Status Indicators */}
              <div className="flex gap-2 text-xs">
                {agent.circuitBreaker?.state === 'open' && (
                  <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded">
                    Circuit Open
                  </span>
                )}
                
                {agent.recovery?.hasActiveRecovery && (
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                    Recovering
                  </span>
                )}
                
                {metrics.alerts.length > 0 && (
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded">
                    {metrics.alerts.length} Alert{metrics.alerts.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Detailed View */}
              {isSelected && showDetails && (
                <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-3">
                  {/* Predictions */}
                  {metrics.predictions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">Predictions</h4>
                      {metrics.predictions.map((prediction: any, index: number) => (
                        <div key={index} className="text-xs text-slate-400 space-y-1">
                          <div>
                            {prediction.timeHorizon}min: {formatValue(prediction.predictedHealth, 'percent')} health
                          </div>
                          {prediction.riskFactors.length > 0 && (
                            <div>Risks: {prediction.riskFactors.join(', ')}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Recommendations */}
                  {agent.recovery?.recommendedActions?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">Recommendations</h4>
                      <div className="text-xs text-slate-400 space-y-1">
                        {agent.recovery.recommendedActions.slice(0, 3).map((action: string, index: number) => (
                          <div key={index}>• {action}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Alerts Panel */}
      {showAlerts && (
        <div className="glass-2 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-400" size={20} />
            Active Alerts
          </h3>
          
          {systemMetrics.totalAlerts === 0 ? (
            <p className="text-slate-400 text-center py-4">No active alerts</p>
          ) : (
            <div className="space-y-3">
              {agents.flatMap(agent => 
                getAgentMetrics(agent).alerts.map((alert: any) => ({
                  ...alert,
                  agentName: agent.name
                }))
              ).map((alert: any) => (
                <div key={alert.id} className={`p-3 rounded-lg border-l-2 ${
                  alert.type === 'critical' ? 'border-l-red-400 bg-red-400/5' :
                  alert.type === 'warning' ? 'border-l-yellow-400 bg-yellow-400/5' :
                  'border-l-blue-400 bg-blue-400/5'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">
                          {alert.agentName}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          alert.type === 'critical' ? 'bg-red-500/20 text-red-400' :
                          alert.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {alert.type}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300">{alert.message}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}