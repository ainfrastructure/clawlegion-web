'use client'

import { useState } from 'react'
import { 
  Activity, GitCommit, MessageSquare, CheckCircle2, 
  AlertCircle, Clock, ChevronRight, Filter 
} from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'commit' | 'message' | 'task_complete' | 'task_create' | 'alert'
  title: string
  description?: string
  author: string
  timestamp: string
  metadata?: Record<string, any>
}

interface RecentActivityProps {
  activities: ActivityItem[]
  maxItems?: number
  showFilter?: boolean
  className?: string
}

const activityConfig = {
  commit: { icon: GitCommit, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  message: { icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  task_complete: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/20' },
  task_create: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  alert: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
}

function formatTimeAgo(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

export function RecentActivity({
  activities,
  maxItems = 10,
  showFilter = true,
  className = ''
}: RecentActivityProps) {
  const [filter, setFilter] = useState<string | null>(null)

  const filteredActivities = filter
    ? activities.filter(a => a.type === filter)
    : activities

  const displayActivities = filteredActivities.slice(0, maxItems)

  return (
    <div className={`bg-slate-800/50 rounded-lg ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
        <h3 className="font-semibold flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          Recent Activity
        </h3>
        
        {showFilter && (
          <div className="flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-500" />
            <select
              value={filter || ''}
              onChange={(e) => setFilter(e.target.value || null)}
              className="bg-transparent text-xs text-slate-400 focus:outline-none cursor-pointer"
            >
              <option value="">All</option>
              <option value="commit">Commits</option>
              <option value="message">Messages</option>
              <option value="task_complete">Completed</option>
              <option value="task_create">Created</option>
              <option value="alert">Alerts</option>
            </select>
          </div>
        )}
      </div>

      <div className="divide-y divide-white/[0.06]">
        {displayActivities.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          displayActivities.map((activity) => {
            const config = activityConfig[activity.type]
            const Icon = config.icon
            
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-4 hover:bg-slate-800/50 transition-colors cursor-pointer group"
              >
                <div className={`p-2 rounded-lg ${config.bg}`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{activity.title}</span>
                    <span className="text-xs text-slate-500">{formatTimeAgo(activity.timestamp)}</span>
                  </div>
                  {activity.description && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{activity.description}</p>
                  )}
                  <div className="text-[10px] text-slate-500 mt-1">
                    by {activity.author}
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )
          })
        )}
      </div>

      {activities.length > maxItems && (
        <div className="p-3 border-t border-white/[0.06] text-center">
          <button className="text-xs text-blue-400 hover:text-blue-300">
            View all activity →
          </button>
        </div>
      )}
    </div>
  )
}
