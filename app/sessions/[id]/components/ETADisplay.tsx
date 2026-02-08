'use client'

import { useEffect, useState } from 'react'
import { formatDuration } from '@/lib/utils'
import type { SessionAnalytics } from '../types'

interface ETADisplayProps {
  taskStats: SessionAnalytics['taskStats']
  startedAt?: string
}

export default function ETADisplay({ taskStats, startedAt }: ETADisplayProps) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 5000)
    return () => clearInterval(interval)
  }, [])

  if (!startedAt || !taskStats || taskStats.total === 0) return null
  if (taskStats.completed === taskStats.total) return <span className="text-green-600 dark:text-green-400">Complete!</span>

  const completedTasks = taskStats.completed + taskStats.failed
  if (completedTasks === 0) return <span className="text-gray-500 dark:text-slate-400">Calculating...</span>

  const elapsed = now - new Date(startedAt).getTime()
  const avgTimePerTask = elapsed / completedTasks
  const remainingTasks = taskStats.total - completedTasks
  const estimatedRemaining = avgTimePerTask * remainingTasks

  const etaDate = new Date(now + estimatedRemaining)

  return (
    <div className="text-sm">
      <span className="text-gray-500 dark:text-slate-400">ETA: </span>
      <span className="font-medium text-blue-600 dark:text-blue-400">
        ~{formatDuration(Math.floor(estimatedRemaining / 1000))} remaining
      </span>
      <span className="text-gray-400 dark:text-slate-500 text-xs ml-2">
        ({etaDate.toLocaleTimeString()})
      </span>
    </div>
  )
}
