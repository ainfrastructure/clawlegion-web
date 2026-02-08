'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { 
  Play, Pause, Square, Zap, Activity, 
  AlertTriangle, CheckCircle, Clock, Users,
  Send, RefreshCw, Terminal, Cpu, HardDrive
} from 'lucide-react'

interface Agent {
  id: string
  name: string
  status: 'idle' | 'busy' | 'paused' | 'offline'
  currentTaskId?: string
  lastHeartbeat?: string
}

interface HealthCheck {
  name: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  latencyMs?: number
  details?: any
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  checks: HealthCheck[]
}

interface TaskToInject {
  title: string
  description: string
  priority: 'urgent' | 'high' | 'normal' | 'low'
}

export default function CommandCenterPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [injectTask, setInjectTask] = useState<TaskToInject>({
    title: '',
    description: '',
    priority: 'high'
  })
  const [showInjectModal, setShowInjectModal] = useState(false)

  // Fetch agents
  const { data: agentsData, refetch: refetchAgents } = useQuery({
    queryKey: ['agents-status'],
    queryFn: async () => {
      const res = await fetch('/api/agents/status')
      return res.json()
    },
    refetchInterval: 5000,
  })

  // Fetch system health
  const { data: healthData } = useQuery<SystemHealth>({
    queryKey: ['system-health'],
    queryFn: async () => {
      const res = await fetch('/api/health/dashboard')
      return res.json()
    },
    refetchInterval: 10000,
  })

  // Fetch task queue summary
  const { data: queueData } = useQuery({
    queryKey: ['queue-summary'],
    queryFn: async () => {
      const res = await fetch('/api/tasks/queue')
      return res.json()
    },
    refetchInterval: 5000,
  })

  // Mutations for agent control
  const pauseAgent = useMutation({
    mutationFn: async (agentId: string) => {
      const res = await fetch(`/api/agents/${agentId}/pause`, { method: 'POST' })
      return res.json()
    },
    onSuccess: () => refetchAgents(),
  })

  const resumeAgent = useMutation({
    mutationFn: async (agentId: string) => {
      const res = await fetch(`/api/agents/${agentId}/resume`, { method: 'POST' })
      return res.json()
    },
    onSuccess: () => refetchAgents(),
  })

  const injectTaskMutation = useMutation({
    mutationFn: async ({ agentId, task }: { agentId: string; task: TaskToInject }) => {
      const res = await fetch(`/api/agents/${agentId}/inject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      })
      return res.json()
    },
    onSuccess: () => {
      setShowInjectModal(false)
      setInjectTask({ title: '', description: '', priority: 'high' })
      refetchAgents()
    },
  })

  const emergencyStop = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/agents/emergency-stop', { method: 'POST' })
      return res.json()
    },
    onSuccess: () => refetchAgents(),
  })

  const agents = agentsData?.agents || []
  const healthStatus = healthData?.status || 'unknown'
  const queueSummary = queueData?.summary || { queued: 0, assigned: 0, completed: 0 }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400'
      case 'degraded': return 'text-yellow-400'
      case 'unhealthy': return 'text-red-400'
      case 'idle': return 'text-blue-400'
      case 'busy': return 'text-green-400'
      case 'paused': return 'text-yellow-400'
      case 'offline': return 'text-gray-500'
      default: return 'text-gray-400'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500/20 border-green-500/50'
      case 'degraded': return 'bg-yellow-500/20 border-yellow-500/50'
      case 'unhealthy': return 'bg-red-500/20 border-red-500/50'
      default: return 'bg-gray-500/20 border-gray-500/50'
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Terminal className="w-8 h-8 text-blue-400" />
            Command Center
          </h1>
          <p className="text-slate-400 mt-1">Real-time agent control and monitoring</p>
        </div>
        <button
          onClick={() => emergencyStop.mutate()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Square className="w-4 h-4" />
          Emergency Stop
        </button>
      </div>

      {/* System Status Banner */}
      <div className={`mb-6 p-4 rounded-lg border ${getStatusBg(healthStatus)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className={`w-5 h-5 ${getStatusColor(healthStatus)}`} />
            <span className="font-medium">System Status: {healthStatus.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Uptime: {healthData?.uptime ? `${Math.floor(healthData.uptime / 60)}m` : '--'}
            </span>
            <span className="flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              {healthData?.checks?.find(c => c.name === 'memory')?.details?.heapPercent || '--'}% Memory
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Agent Cards */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Agents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.length === 0 ? (
              <div className="col-span-2 bg-slate-900 rounded-lg p-8 text-center text-slate-400">
                No agents registered
              </div>
            ) : (
              agents.map((agent: Agent) => (
                <div
                  key={agent.id}
                  className={`bg-slate-900 rounded-lg p-4 border transition-all cursor-pointer ${
                    selectedAgent === agent.id 
                      ? 'border-blue-500 ring-2 ring-blue-500/20' 
                      : 'border-slate-800 hover:border-white/[0.06]'
                  }`}
                  onClick={() => setSelectedAgent(agent.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">{agent.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(agent.status)} bg-slate-800`}>
                      {agent.status.toUpperCase()}
                    </span>
                  </div>
                  
                  {agent.currentTaskId && (
                    <p className="text-sm text-slate-400 mb-3 truncate">
                      Working on: {agent.currentTaskId}
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    {agent.status === 'paused' ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); resumeAgent.mutate(agent.id) }}
                        className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <Play className="w-3 h-3" /> Resume
                      </button>
                    ) : agent.status !== 'offline' ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); pauseAgent.mutate(agent.id) }}
                        className="flex-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <Pause className="w-3 h-3" /> Pause
                      </button>
                    ) : null}
                    <button
                      onClick={(e) => { 
                        e.stopPropagation()
                        setSelectedAgent(agent.id)
                        setShowInjectModal(true)
                      }}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium flex items-center justify-center gap-1"
                      disabled={agent.status === 'offline'}
                    >
                      <Zap className="w-3 h-3" /> Inject Task
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Queue & Health Panel */}
        <div className="space-y-4">
          {/* Task Queue Summary */}
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Task Queue
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Queued</span>
                <span className="font-mono text-xl">{queueSummary.queued}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Assigned</span>
                <span className="font-mono text-xl text-blue-400">{queueSummary.assigned}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Completed</span>
                <span className="font-mono text-xl text-green-400">{queueSummary.completed}</span>
              </div>
              <div className="pt-3 border-t border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total</span>
                  <span className="font-mono text-xl">{queueData?.count || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Health Checks */}
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Health Checks
            </h2>
            <div className="space-y-2">
              {healthData?.checks?.map((check: HealthCheck) => (
                <div key={check.name} className="flex justify-between items-center py-2 border-b border-slate-800 last:border-0">
                  <span className="text-slate-400 capitalize">{check.name.replace('_', ' ')}</span>
                  <div className="flex items-center gap-2">
                    {check.latencyMs !== undefined && (
                      <span className="text-xs text-slate-500">{check.latencyMs}ms</span>
                    )}
                    {check.status === 'healthy' ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : check.status === 'degraded' ? (
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </div>
              )) || (
                <p className="text-slate-500 text-sm">Loading health data...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inject Task Modal */}
      {showInjectModal && selectedAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-lg p-6 w-full max-w-md border border-white/[0.06]">
            <h2 className="text-xl font-semibold mb-4">Inject Task</h2>
            <p className="text-slate-400 text-sm mb-4">
              Inject a task directly to: <strong>{agents.find((a: Agent) => a.id === selectedAgent)?.name}</strong>
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={injectTask.title}
                  onChange={(e) => setInjectTask(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-white/[0.06] rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Task title..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={injectTask.description}
                  onChange={(e) => setInjectTask(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-white/[0.06] rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-24"
                  placeholder="Task description..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={injectTask.priority}
                  onChange={(e) => setInjectTask(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-white/[0.06] rounded focus:border-blue-500"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInjectModal(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => injectTaskMutation.mutate({ agentId: selectedAgent, task: injectTask })}
                disabled={!injectTask.title || injectTaskMutation.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {injectTaskMutation.isPending ? 'Injecting...' : 'Inject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Need to import this
import { ClipboardList } from 'lucide-react'
