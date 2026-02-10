'use client'

import { useCountdown } from './CountdownContext'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function CountdownTimer({ variant = 'large' }: { variant?: 'large' | 'compact' }) {
  const timeLeft = useCountdown()

  if (!timeLeft) {
    return variant === 'compact' ? (
      <span className="font-mono text-sm text-white/70">--h --m --s</span>
    ) : (
      <div className="flex gap-3 justify-center">
        {['Hours', 'Mins', 'Secs'].map((label) => (
          <div key={label} className="glass-2 rounded-xl px-4 py-3 min-w-[72px] text-center">
            <div className="text-2xl font-bold font-mono text-white">--</div>
            <div className="text-[11px] text-white uppercase tracking-wider mt-0.5">{label}</div>
          </div>
        ))}
      </div>
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
          <div className="text-[11px] text-white uppercase tracking-wider mt-0.5">{block.label}</div>
        </div>
      ))}
    </div>
  )
}
