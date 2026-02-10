'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Sidebar, MainContent } from './Sidebar'
import { SidebarProvider } from './SidebarContext'
import { MobileNav } from './MobileNav'
import { MobileHeader } from './MobileHeader'
import { MobileDrawer } from './MobileDrawer'
import { useMobile } from '@/hooks/useMobile'
import { Breadcrumbs } from '@/components/ui'
import { PresenceDots } from '@/components/agents/PresenceIndicator'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { KeyboardShortcutsHelp } from '@/components/ui/KeyboardShortcutsHelp'
import { GlobalKeyboardShortcuts } from '@/components/ui/GlobalKeyboardShortcuts'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { useNotificationSocket } from '@/hooks/useNotificationSocket'

function LiveClock() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }
    update()
    const id = setInterval(update, 10_000)
    return () => clearInterval(id)
  }, [])

  if (!time) return null

  return (
    <span className="text-xs font-mono text-slate-400 tabular-nums">{time}</span>
  )
}

export function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const pathname = usePathname()
  const isMobile = useMobile()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Global real-time notification listener
  useNotificationSocket()

  // Don't show sidebar/chrome on public pages
  const isPublicPage = pathname === '/login' || pathname === '/' || pathname === '/auth/error'

  if (isPublicPage) {
    return <>{children}</>
  }

  // Auth guard for protected pages
  if (status === 'loading') {
    return (
      <div className="min-h-screen ambient-bg flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  const overlays = (
    <>
      <CommandPalette />
      <KeyboardShortcutsHelp />
      <GlobalKeyboardShortcuts />
    </>
  )

  // Mobile layout
  if (isMobile) {
    return (
      <SidebarProvider>
        <div className="min-h-screen ambient-bg">
          {/* Mobile header */}
          <MobileHeader onMenuClick={() => setDrawerOpen(true)} />

          {/* Mobile drawer */}
          <MobileDrawer
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
          />

          {/* Main content with padding for header and nav */}
          <main className="pt-14 pb-20 px-4">
            {children}
          </main>

          {/* Bottom navigation */}
          <MobileNav />
        </div>
        {overlays}
      </SidebarProvider>
    )
  }

  // Desktop layout with sidebar and header
  const isFullHeight = pathname === '/tasks/graph'

  return (
    <SidebarProvider>
      <Sidebar />
      <MainContent fullHeight={isFullHeight}>
        {!isFullHeight && (
          <div className="sticky top-0 z-20 border-b border-white/[0.06] mb-4">
            <div className="flex items-center justify-between px-6 py-2 bg-[rgb(12,15,24)]/80 backdrop-blur-xl">
              <Breadcrumbs />
              <div className="flex items-center gap-1 ml-auto">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-slate-500 hover:bg-white/[0.03] transition-colors">
                  <PresenceDots />
                </div>
                <div className="w-px h-3.5 bg-white/[0.06]" />
                <div className="flex items-center px-2.5 py-1.5 rounded-md text-slate-500 hover:bg-white/[0.03] transition-colors">
                  <LiveClock />
                </div>
                <div className="w-px h-3.5 bg-white/[0.06]" />
                <NotificationCenter />
              </div>
            </div>
          </div>
        )}
        {children}
      </MainContent>
      {overlays}
    </SidebarProvider>
  )
}
