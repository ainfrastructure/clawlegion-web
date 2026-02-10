'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type TimeLeft = {
  hours: number
  minutes: number
  seconds: number
}

function getTimeLeft(): TimeLeft {
  const now = new Date()
  const target = new Date(now)
  target.setHours(9, 0, 0, 0)
  if (now >= target) {
    target.setDate(target.getDate() + 1)
  }
  const remaining = target.getTime() - now.getTime()

  return {
    hours: Math.floor(remaining / (1000 * 60 * 60)),
    minutes: Math.floor((remaining / (1000 * 60)) % 60),
    seconds: Math.floor((remaining / 1000) % 60),
  }
}

const CountdownContext = createContext<TimeLeft | null>(null)

export function CountdownProvider({ children }: { children: ReactNode }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)

  useEffect(() => {
    setTimeLeft(getTimeLeft())
    const interval = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <CountdownContext.Provider value={timeLeft}>
      {children}
    </CountdownContext.Provider>
  )
}

export function useCountdown(): TimeLeft | null {
  return useContext(CountdownContext)
}
