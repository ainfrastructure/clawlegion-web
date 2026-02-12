'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { UIMode } from '@/types/common'

interface LayoutContextType {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  toggleCollapsed: () => void
  uiMode: UIMode
  setUIMode: (mode: UIMode) => void
  toggleUIMode: () => void
  /** True while a mode switch animation is in progress */
  isModeTransitioning: boolean
  /** Allow URL override to set mode without persisting */
  setUIModeOverride: (mode: UIMode) => void
}

const SidebarContext = createContext<LayoutContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [uiMode, setUIModeState] = useState<UIMode>('power')
  const [isModeTransitioning, setIsModeTransitioning] = useState(false)

  // Load UI mode from localStorage on mount, then reconcile with server
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('clawlegion-ui-mode') : null
    if (saved === 'easy' || saved === 'power') {
      setUIModeState(saved)
    }

    // Fetch server preference and reconcile (localStorage wins)
    fetch('/api/profile/preferences')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) return
        const serverMode = data.uiMode
        const localMode = localStorage.getItem('clawlegion-ui-mode')
        if (!localMode && (serverMode === 'easy' || serverMode === 'power')) {
          // No local preference, use server value
          setUIModeState(serverMode)
          localStorage.setItem('clawlegion-ui-mode', serverMode)
        }
      })
      .catch(() => {
        // Server sync is best-effort
      })
  }, [])

  // Check URL for mode override on mount (without useSearchParams to avoid Suspense requirement)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const modeParam = params.get('mode')
    if (modeParam === 'easy' || modeParam === 'power') {
      setUIModeState(modeParam)
    }
  }, [])

  const toggleCollapsed = () => setCollapsed(prev => !prev)

  // Set mode override without persisting (for URL overrides)
  const setUIModeOverride = useCallback((mode: UIMode) => {
    setUIModeState(mode)
  }, [])

  const setUIMode = useCallback((mode: UIMode) => {
    // Trigger crossfade animation
    setIsModeTransitioning(true)
    setUIModeState(mode)
    if (typeof window !== 'undefined') {
      localStorage.setItem('clawlegion-ui-mode', mode)
    }
    // End transition after animation completes
    setTimeout(() => setIsModeTransitioning(false), 300)

    // Persist to server (fire-and-forget)
    fetch('/api/profile/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uiMode: mode }),
    }).catch(() => {
      // Server persistence is best-effort
    })
  }, [])

  const toggleUIMode = useCallback(() => {
    setUIMode(uiMode === 'easy' ? 'power' : 'easy')
  }, [uiMode, setUIMode])

  return (
    <SidebarContext.Provider value={{
      collapsed, setCollapsed, toggleCollapsed,
      uiMode, setUIMode, toggleUIMode,
      isModeTransitioning,
      setUIModeOverride,
    }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    // Return default values when not in SidebarProvider (e.g., during auth loading)
    return {
      collapsed: false,
      setCollapsed: () => {},
      toggleCollapsed: () => {},
      uiMode: 'power' as UIMode,
      setUIMode: () => {},
      toggleUIMode: () => {},
      isModeTransitioning: false,
      setUIModeOverride: () => {},
    }
  }
  return context
}
