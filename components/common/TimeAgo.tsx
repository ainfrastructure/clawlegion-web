'use client'

import { useState, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface TimeAgoProps {
  date: string | Date
  className?: string
  live?: boolean
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  
  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  
  return date.toLocaleDateString()
}

export function TimeAgo({ date, className, live = true }: TimeAgoProps) {
  const dateObj = useMemo(() => 
    typeof date === 'string' ? new Date(date) : date,
    [date]
  )
  const [timeAgo, setTimeAgo] = useState(() => formatTimeAgo(dateObj))
  
  useEffect(() => {
    if (!live) return
    
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(dateObj))
    }, 60000) // Update every minute
    
    return () => clearInterval(interval)
  }, [dateObj, live])
  
  return (
    <time 
      dateTime={dateObj.toISOString()}
      title={dateObj.toLocaleString()}
      className={cn('text-slate-400', className)}
    >
      {timeAgo}
    </time>
  )
}

export default TimeAgo
