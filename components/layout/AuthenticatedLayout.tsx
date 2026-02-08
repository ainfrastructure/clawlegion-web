'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
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
import { Bell } from 'lucide-react'

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
  const isFullHeight = pathname === '/chat'

  return (
    <SidebarProvider>
      <Sidebar />
      <MainContent fullHeight={isFullHeight}>
        {!isFullHeight && (
          <div className="sticky top-0 z-10 glass-2 border-b border-white/[0.06] px-6 py-2.5 mb-4">
            <div className="flex items-center justify-between">
              <Breadcrumbs />
              <div className="flex items-center gap-4">
                <PresenceDots />
                <LiveClock />
                <Link
                  href="/notifications"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                </Link>
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
