'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { UIMode } from '@/types/common'

interface LayoutContextType {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  toggleCollapsed: () => void
  uiMode: UIMode
  setUIMode: (mode: UIMode) => void
  toggleUIMode: () => void
}

const SidebarContext = createContext<LayoutContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [uiMode, setUIModeState] = useState<UIMode>('power')
  const [urlOverride, setUrlOverride] = useState(false)

  // Load UI mode: URL param > localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check URL parameter first (override, but don't persist)
    const params = new URLSearchParams(window.location.search)
    const urlMode = params.get('mode')
    if (urlMode === 'easy' || urlMode === 'power') {
      setUIModeState(urlMode)
      setUrlOverride(true)
      return
    }

    // Fall back to localStorage
    const saved = localStorage.getItem('clawlegion-ui-mode')
    if (saved === 'easy' || saved === 'power') {
      setUIModeState(saved)
    }
  }, [])

  const toggleCollapsed = () => setCollapsed(prev => !prev)

  const setUIMode = (mode: UIMode) => {
    setUIModeState(mode)
    setUrlOverride(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('clawlegion-ui-mode', mode)
    }
  }

  const toggleUIMode = () => {
    const next = uiMode === 'easy' ? 'power' : 'easy'
    setUIMode(next)
  }

  return (
    <SidebarContext.Provider value={{
      collapsed, setCollapsed, toggleCollapsed,
      uiMode, setUIMode, toggleUIMode,
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
    }
  }
  return context
}
