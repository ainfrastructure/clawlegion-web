'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface LayoutContextType {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  toggleCollapsed: () => void
}

const SidebarContext = createContext<LayoutContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  const toggleCollapsed = () => setCollapsed(prev => !prev)

  return (
    <SidebarContext.Provider value={{ 
      collapsed, setCollapsed, toggleCollapsed
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
    }
  }
  return context
}
