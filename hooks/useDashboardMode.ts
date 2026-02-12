'use client'

import { useState, useEffect, useCallback } from 'react'

export type DashboardMode = 'easy' | 'power'

const STORAGE_KEY = 'dashboard-mode'
const DEFAULT_MODE: DashboardMode = 'easy'

/**
 * Hook to manage Easy / Power mode toggle.
 * Persisted in localStorage.
 */
export function useDashboardMode() {
  const [mode, setModeState] = useState<DashboardMode>(DEFAULT_MODE)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'easy' || stored === 'power') {
        setModeState(stored)
      }
    } catch {
      // localStorage unavailable
    }
    setLoaded(true)
  }, [])

  const setMode = useCallback((newMode: DashboardMode) => {
    setModeState(newMode)
    try {
      localStorage.setItem(STORAGE_KEY, newMode)
    } catch {
      // localStorage unavailable
    }
  }, [])

  const toggleMode = useCallback(() => {
    setMode(mode === 'easy' ? 'power' : 'easy')
  }, [mode, setMode])

  const isEasyMode = mode === 'easy'
  const isPowerMode = mode === 'power'

  return { mode, setMode, toggleMode, isEasyMode, isPowerMode, loaded }
}
