'use client'

import { useState, useEffect } from 'react'
import { Activity, CheckCircle2, PlayCircle, User, Clock } from 'lucide-react'
import { AgentAvatar } from '@/components/agents'

interface ActivityItem {
  id: string
  type: 'completed' | 'started' | 'created' | 'assigned'
  title: string
  agent?: string
  timestamp: string
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch('/api/tasks/queue')
        if (res.ok) {
          const data = await res.json()
          const tasks = data.tasks || []
          
          // Get recent activity (completed tasks in last hour)
          const now = Date.now()
          const hourAgo = now - 60 * 60 * 1000
          
          const recentActivities: ActivityItem[] = tasks
            .filter((t: any) => {
              if (t.status === 'completed' && t.completedAt) {
                return new Date(t.completedAt).getTime() > hourAgo
              }
              if (t.status === 'in-progress' && t.assignedAt) {
                return new Date(t.assignedAt).getTime() > hourAgo
              }
              return false
            })
            .map((t: any) => ({
              id: t.id,
              type: t.status === 'completed' ? 'completed' : 'started',
              title: t.title,
              agent: t.assignedTo,
              timestamp: t.status === 'completed' ? t.completedAt : t.assignedAt
            }))
            .sort((a: ActivityItem, b: ActivityItem) => 
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            )
            .slice(0, 10)
          
          setActivities(recentActivities)
        }
      } catch (err) {
        console.error('Failed to fetch activities:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchActivities()
    const interval = setInterval(fetchActivities, 5000)
    return () => clearInterval(interval)
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-400" />
      case 'started': return <PlayCircle className="w-4 h-4 text-blue-400" />
      case 'assigned': return <User className="w-4 h-4 text-purple-400" />
      default: return <Activity className="w-4 h-4 text-slate-400" />
    }
  }

  const formatTime = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    return `${hours}h ago`
  }

  if (loading) {
    return (
      <div className="glass-2 rounded-xl p-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 bg-slate-700/50 rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="glass-2 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
        <Activity className="w-4 h-4 text-purple-400" />
        <h3 className="font-medium text-white">Live Activity</h3>
        <span className="text-xs text-slate-500">(last hour)</span>
      </div>
      
      <div className="divide-y divide-white/[0.06] max-h-80 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-sm">
            No recent activity
          </div>
        ) : (
          activities.map(activity => (
            <div key={activity.id} className="px-4 py-2.5 hover:bg-slate-700/30 transition-colors">
              <div className="flex items-start gap-3">
                {getIcon(activity.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{activity.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {activity.agent && (
                      <div className="flex items-center gap-1.5">
                        <AgentAvatar agentId={activity.agent} size="xs" />
                        <span className="text-xs text-purple-400">{activity.agent}</span>
                      </div>
                    )}
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ActivityFeed
