'use client'

import { useState, useEffect, useCallback } from 'react'

const FIFTEEN_HOURS_MS = 15 * 60 * 60 * 1000
const STORAGE_KEY = 'countdown-start-ts'

type TimeLeft = {
  hours: number
  minutes: number
  seconds: number
}

function getStartTimestamp(): number {
  if (typeof window === 'undefined') return Date.now()
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    const ts = Number(stored)
    if (!isNaN(ts)) return ts
  }
  const now = Date.now()
  localStorage.setItem(STORAGE_KEY, String(now))
  return now
}

function getTimeLeft(): TimeLeft {
  const start = getStartTimestamp()
  const elapsed = Date.now() - start
  const remaining = FIFTEEN_HOURS_MS - (elapsed % FIFTEEN_HOURS_MS)

  // Reset the stored timestamp when a cycle completes
  if (elapsed >= FIFTEEN_HOURS_MS) {
    const cycleStart = start + Math.floor(elapsed / FIFTEEN_HOURS_MS) * FIFTEEN_HOURS_MS
    localStorage.setItem(STORAGE_KEY, String(cycleStart))
  }

  return {
    hours: Math.floor(remaining / (1000 * 60 * 60)),
    minutes: Math.floor((remaining / (1000 * 60)) % 60),
    seconds: Math.floor((remaining / 1000) % 60),
  }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function CountdownTimer({ variant = 'large' }: { variant?: 'large' | 'compact' }) {
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 15, minutes: 0, seconds: 0 })

  const tick = useCallback(() => {
    setTimeLeft(getTimeLeft())
  }, [])

  useEffect(() => {
    setMounted(true)
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [tick])

  if (!mounted) {
    return variant === 'large' ? (
      <div className="flex gap-3 justify-center">
        {['Hours', 'Mins', 'Secs'].map((label) => (
          <div key={label} className="glass-2 rounded-xl px-4 py-3 min-w-[72px] text-center">
            <div className="text-2xl font-bold font-mono text-white">--</div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    ) : (
      <span className="font-mono text-sm text-white/70">--h --m --s</span>
    )
  }

  if (variant === 'compact') {
    return (
      <span className="font-mono text-sm tabular-nums tracking-tight">
        <span className="text-white font-semibold">{pad(timeLeft.hours)}</span>
        <span className="text-white/50">h </span>
        <span className="text-white font-semibold">{pad(timeLeft.minutes)}</span>
        <span className="text-white/50">m </span>
        <span className="text-white font-semibold">{pad(timeLeft.seconds)}</span>
        <span className="text-white/50">s</span>
      </span>
    )
  }

  const blocks = [
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Mins' },
    { value: timeLeft.seconds, label: 'Secs' },
  ]

  return (
    <div className="flex gap-3 justify-center">
      {blocks.map((block) => (
        <div key={block.label} className="glass-2 rounded-xl px-4 py-3 min-w-[72px] text-center">
          <div className="text-2xl font-bold font-mono text-white">{pad(block.value)}</div>
          <div className="text-[11px] text-slate-500 uppercase tracking-wider mt-0.5">{block.label}</div>
        </div>
      ))}
    </div>
  )
}
