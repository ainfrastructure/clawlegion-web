'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, TrendingDown, Users, ListTodo, CheckCircle, 
  Clock, Zap, Activity, ArrowUpRight, ArrowDownRight
} from 'lucide-react'

interface Metric {
  id: string
  label: string
  value: string | number
  change?: number // percentage change
  changeLabel?: string
  icon: React.ReactNode
  color: string
}

export function MetricsCards() {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Fetch from multiple endpoints
        const [agentsRes, tasksRes, healthRes] = await Promise.all([
          fetch('/api/agents/status'),
          fetch('/api/tasks/queue'),
          fetch('/api/health')
        ])

        const agents = agentsRes.ok ? await agentsRes.json() : { summary: { online: 0, total: 0 } }
        const tasks = tasksRes.ok ? await tasksRes.json() : { summary: { completed: 0, queued: 0, inProgress: 0 } }
        const health = healthRes.ok ? await healthRes.json() : { status: 'unknown' }

        const totalTasks = (tasks.summary?.completed || 0) + (tasks.summary?.queued || 0) + 
                          (tasks.summary?.inProgress || 0) + (tasks.summary?.assigned || 0)
        const completionRate = totalTasks > 0 
          ? Math.round((tasks.summary?.completed || 0) / totalTasks * 100) 
          : 0

        setMetrics([
          {
            id: 'agents',
            label: 'Active Agents',
            value: `${agents.summary?.online || 0}/${agents.summary?.total || 0}`,
            change: agents.summary?.online > 0 ? 100 : 0,
            changeLabel: 'online now',
            icon: <Users className="w-5 h-5" />,
            color: 'text-red-400'
          },
          {
            id: 'tasks-active',
            label: 'Active Tasks',
            value: (tasks.summary?.inProgress || 0) + (tasks.summary?.assigned || 0),
            change: tasks.summary?.queued || 0,
            changeLabel: 'in queue',
            icon: <Activity className="w-5 h-5" />,
            color: 'text-yellow-400'
          },
          {
            id: 'tasks-completed',
            label: 'Completed Today',
            value: tasks.summary?.completed || 0,
            change: completionRate,
            changeLabel: 'completion rate',
            icon: <CheckCircle className="w-5 h-5" />,
            color: 'text-green-400'
          },
          {
            id: 'uptime',
            label: 'System Status',
            value: health.status === 'healthy' ? 'Healthy' : 'Degraded',
            changeLabel: health.uptime || 'unknown',
            icon: <Zap className="w-5 h-5" />,
            color: health.status === 'healthy' ? 'text-green-400' : 'text-yellow-400'
          }
        ])
      } catch (err) {
        console.error('Failed to fetch metrics:', err)
      }
      setLoading(false)
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 10000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-slate-800/50 rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-20 mb-2" />
            <div className="h-8 bg-slate-700 rounded w-16" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <div 
          key={metric.id}
          className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-white/[0.06] p-5 hover:border-slate-500 hover:shadow-lg hover:shadow-slate-900/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Animated gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/5 to-red-900/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Icon with glow effect */}
          <div className={`absolute top-4 right-4 ${metric.color} opacity-20 group-hover:opacity-40 transition-opacity`}>
            <div className="w-12 h-12">{metric.icon}</div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className={`${metric.color} transition-transform group-hover:scale-110`}>{metric.icon}</span>
              <span className="text-sm text-slate-400 font-medium">{metric.label}</span>
            </div>
            
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-white tracking-tight">
                {metric.value}
              </span>
            </div>
            
            {metric.changeLabel && (
              <div className="flex items-center gap-1.5 mt-3 text-xs">
                {typeof metric.change === 'number' && metric.change > 0 && (
                  <span className="flex items-center gap-0.5 text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">
                    <ArrowUpRight className="w-3 h-3" />
                    {metric.change}%
                  </span>
                )}
                <span className="text-slate-500">{metric.changeLabel}</span>
              </div>
            )}
          </div>
          
          {/* Bottom accent line */}
          <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${
            metric.color.includes('red') ? 'bg-gradient-to-r from-red-500/0 via-red-500 to-red-500/0' :
            metric.color.includes('green') ? 'bg-gradient-to-r from-green-500/0 via-green-500 to-green-500/0' :
            metric.color.includes('yellow') ? 'bg-gradient-to-r from-yellow-500/0 via-yellow-500 to-yellow-500/0' :
            'bg-gradient-to-r from-slate-500/0 via-slate-500 to-slate-500/0'
          } opacity-0 group-hover:opacity-100 transition-opacity`} />
        </div>
      ))}
    </div>
  )
}

export default MetricsCards
