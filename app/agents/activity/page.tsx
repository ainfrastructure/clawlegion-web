'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageContainer } from '@/components/layout'
import { AgentActivityFeed } from '@/components/agents/activity/AgentActivityFeed'
import { AgentTaskFlow } from '@/components/agents/activity/AgentTaskFlow'
import { AgentPerformanceMetrics } from '@/components/agents/activity/AgentPerformanceMetrics'
import { RecoveryDashboard } from '@/components/agents/activity/RecoveryDashboard'
import { 
  Activity, 
  Zap, 
  TrendingUp, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2 
} from 'lucide-react'

/**
 * Live Agent Activity Dashboard
 * Phase 1 Autonomous Systems - Real-time Monitoring
 */

interface ActivityPageProps {}

export default function AgentActivityPage({}: ActivityPageProps) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'recovery'>('overview')
  
  // Fetch enhanced health data with autonomous systems
  const { 
    data: healthData, 
    isLoading: healthLoading,
    error: healthError,
    refetch: refetchHealth
  } = useQuery({
    queryKey: ['enhanced-health'],
    queryFn: async () => {
      const response = await fetch('/api/agents/health/enhanced')
      if (!response.ok) throw new Error('Failed to fetch health data')
      return response.json()
    },
    refetchInterval: 5000 // Update every 5 seconds
  })

  // Fetch recovery data
  const { 
    data: recoveryData,
    isLoading: recoveryLoading,
    refetch: refetchRecovery
  } = useQuery({
    queryKey: ['recovery-data'],
    queryFn: async () => {
      const response = await fetch('/api/agents/recovery')
      if (!response.ok) throw new Error('Failed to fetch recovery data')
      return response.json()
    },
    refetchInterval: 3000 // Update every 3 seconds
  })

  const agents = healthData?.agents || []
  const systemHealth = healthData?.systemHealth
  const summary = healthData?.summary

  // Auto-refresh when switching views
  useEffect(() => {
    refetchHealth()
    refetchRecovery()
  }, [viewMode, refetchHealth, refetchRecovery])

  const handleTriggerRecovery = async (agentId: string) => {
    try {
      const response = await fetch('/api/agents/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'trigger', agentId })
      })
      const result = await response.json()
      
      if (result.success) {
        console.log(`Recovery started for ${agentId}:`, result.execution?.id)
        refetchRecovery()
      } else {
        console.warn(`Recovery failed for ${agentId}:`, result.message)
      }
    } catch (error) {
      console.error('Failed to trigger recovery:', error)
    }
  }

  const handleResetCircuit = async (agentId: string) => {
    try {
      const response = await fetch('/api/agents/health/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_circuit', agentId })
      })
      const result = await response.json()
      
      if (result.success) {
        console.log(`Circuit breaker reset for ${agentId}`)
        refetchHealth()
      }
    } catch (error) {
      console.error('Failed to reset circuit breaker:', error)
    }
  }

  if (healthLoading && !healthData) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin mr-3" size={24} />
          <span className="text-slate-400">Loading agent activity...</span>
        </div>
      </PageContainer>
    )
  }

  if (healthError) {
    return (
      <PageContainer>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <AlertTriangle className="mx-auto mb-4 text-red-400" size={40} />
          <p className="text-red-400 mb-4">Failed to load agent activity data</p>
          <button
            onClick={() => refetchHealth()}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300"
          >
            Retry
          </button>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Activity className="text-green-400" size={32} />
              Live Agent Activity
            </h1>
            <p className="text-slate-400 mt-1">
              Real-time monitoring with Phase 1 autonomous systems
            </p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'detailed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Detailed
            </button>
            <button
              onClick={() => setViewMode('recovery')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'recovery'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Recovery
            </button>
          </div>
        </div>

        {/* System Health Summary */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
            <div className="glass-2 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-400" size={20} />
                <span className="text-sm text-slate-400">Healthy</span>
              </div>
              <div className="text-2xl font-bold text-white mt-1">
                {summary.healthyAgents}
              </div>
            </div>
            
            <div className="glass-2 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Clock className="text-yellow-400" size={20} />
                <span className="text-sm text-slate-400">Degraded</span>
              </div>
              <div className="text-2xl font-bold text-white mt-1">
                {summary.degradedAgents}
              </div>
            </div>
            
            <div className="glass-2 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-red-400" size={20} />
                <span className="text-sm text-slate-400">Critical</span>
              </div>
              <div className="text-2xl font-bold text-white mt-1">
                {summary.criticalAgents}
              </div>
            </div>
            
            <div className="glass-2 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Shield className="text-orange-400" size={20} />
                <span className="text-sm text-slate-400">Circuits Open</span>
              </div>
              <div className="text-2xl font-bold text-white mt-1">
                {summary.circuitBreakersOpen}
              </div>
            </div>
            
            <div className="glass-2 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Zap className="text-purple-400" size={20} />
                <span className="text-sm text-slate-400">Recovering</span>
              </div>
              <div className="text-2xl font-bold text-white mt-1">
                {summary.activeRecoveries}
              </div>
            </div>
            
            <div className="glass-2 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <TrendingUp 
                  className={
                    systemHealth?.trend === 'improving' ? 'text-green-400' :
                    systemHealth?.trend === 'degrading' ? 'text-red-400' :
                    'text-slate-400'
                  } 
                  size={20} 
                />
                <span className="text-sm text-slate-400">System Health</span>
              </div>
              <div className="text-2xl font-bold text-white mt-1">
                {systemHealth ? Math.round(systemHealth.overallScore * 100) : 0}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      {viewMode === 'overview' && (
        <div className="space-y-8">
          {/* Task Flow Visualization */}
          <AgentTaskFlow 
            agents={agents}
            onAgentSelect={setSelectedAgent}
            selectedAgent={selectedAgent}
          />
          
          {/* Performance Metrics Grid */}
          <AgentPerformanceMetrics 
            agents={agents}
            onTriggerRecovery={handleTriggerRecovery}
            onResetCircuit={handleResetCircuit}
          />
        </div>
      )}

      {viewMode === 'detailed' && (
        <div className="space-y-8">
          {/* Live Activity Feed */}
          <AgentActivityFeed 
            agents={agents}
            selectedAgent={selectedAgent}
            onAgentSelect={setSelectedAgent}
          />
          
          {/* Detailed Metrics */}
          <AgentPerformanceMetrics 
            agents={agents}
            showDetails={true}
            onTriggerRecovery={handleTriggerRecovery}
            onResetCircuit={handleResetCircuit}
          />
        </div>
      )}

      {viewMode === 'recovery' && (
        <RecoveryDashboard 
          healthData={healthData}
          recoveryData={recoveryData}
          isLoading={recoveryLoading}
          onTriggerRecovery={handleTriggerRecovery}
          onRefresh={refetchRecovery}
        />
      )}

      {/* System Health Alert */}
      {systemHealth && systemHealth.riskFactors.length > 0 && (
        <div className="fixed bottom-6 right-6 max-w-sm">
          <div className="glass-2 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="text-yellow-400" size={20} />
              <span className="text-sm font-medium text-yellow-300">System Alert</span>
            </div>
            <div className="text-sm text-slate-300 space-y-1">
              {systemHealth.riskFactors.slice(0, 2).map((factor: string, index: number) => (
                <div key={index}>• {factor}</div>
              ))}
              {systemHealth.riskFactors.length > 2 && (
                <div className="text-slate-400">
                  +{systemHealth.riskFactors.length - 2} more issues
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}