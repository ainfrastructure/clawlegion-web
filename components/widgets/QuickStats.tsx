'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Users, ListTodo, Zap } from 'lucide-react'

interface QuickStat {
  label: string
  value: string | number
  icon: React.ReactNode
  color: string
}

export function QuickStats() {
  const [stats, setStats] = useState<QuickStat[]>([])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [agents, tasks] = await Promise.all([
          fetch('/api/agents/status').then(r => r.ok ? r.json() : { summary: {} }),
          fetch('/api/tasks/queue').then(r => r.ok ? r.json() : { summary: {} })
        ])

        setStats([
          {
            label: 'Online Agents',
            value: agents.summary?.online || 0,
            icon: <Users className="w-5 h-5" />,
            color: 'text-green-400'
          },
          {
            label: 'Tasks in Queue',
            value: tasks.summary?.queued || 0,
            icon: <ListTodo className="w-5 h-5" />,
            color: 'text-blue-400'
          },
          {
            label: 'Active Tasks',
            value: (tasks.summary?.inProgress || 0) + (tasks.summary?.assigned || 0),
            icon: <Zap className="w-5 h-5" />,
            color: 'text-yellow-400'
          },
          {
            label: 'Completed',
            value: tasks.summary?.completed || 0,
            icon: <TrendingUp className="w-5 h-5" />,
            color: 'text-emerald-400'
          }
        ])
      } catch (err) {
        console.error('Failed to fetch stats:', err)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <div 
          key={i}
          className="bg-slate-800/50 rounded-lg border border-white/[0.06] p-3 hover:border-slate-600 transition-colors"
        >
          <div className={`${stat.color} mb-2`}>{stat.icon}</div>
          <div className="text-2xl font-bold">{stat.value}</div>
          <div className="text-xs text-slate-400">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}

export default QuickStats
