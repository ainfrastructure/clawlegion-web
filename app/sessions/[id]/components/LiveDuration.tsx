'use client'

import { useEffect, useState } from 'react'
import { formatDuration } from '@/lib/utils'

interface LiveDurationProps {
  startedAt?: string
  completedAt?: string
}

export default function LiveDuration({ startedAt, completedAt }: LiveDurationProps) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!startedAt || completedAt) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [startedAt, completedAt])

  if (!startedAt) return <span className="text-gray-500 dark:text-slate-400">Not started</span>

  const start = new Date(startedAt).getTime()
  const end = completedAt ? new Date(completedAt).getTime() : now
  const durationSeconds = Math.floor((end - start) / 1000)

  return (
    <span className="font-mono">
      {formatDuration(durationSeconds)}
      {!completedAt && <span className="text-green-500 animate-pulse ml-1">●</span>}
    </span>
  )
}
