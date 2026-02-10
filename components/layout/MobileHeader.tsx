'use client'

import { usePathname } from 'next/navigation'
import { Menu, Bell } from 'lucide-react'
import Link from 'next/link'
import { MascotIcon } from '@/components/landing/MascotIcon'

interface MobileHeaderProps {
  onMenuClick: () => void
}

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/tasks': 'Tasks',
  '/tasks/graph': 'Task Graph',
  '/sprint': 'Sprint',
  '/agents': 'Agents',
  '/agents/org': 'Organization',
  '/agents/sessions': 'Sessions',
  '/health': 'System Health',
  '/flows': 'Flows',
  '/settings': 'Settings',
  '/profile': 'Profile',
}

function getPageTitle(pathname: string): string {
  // Exact match first
  if (pageTitles[pathname]) return pageTitles[pathname]

  // Check for partial matches (for dynamic routes)
  for (const [path, title] of Object.entries(pageTitles)) {
    if (pathname.startsWith(path) && path !== '/') {
      return title
    }
  }

  return 'ClawLegion'
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const pathname = usePathname()
  const title = getPageTitle(pathname)

  return (
    <header className="fixed top-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 z-40 md:hidden">
      <div className="pt-safe-area-inset-top">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Hamburger menu button */}
          <button
            onClick={onMenuClick}
            className="flex items-center justify-center min-w-[44px] min-h-[44px] -ml-2 text-slate-400 hover:text-white active:text-slate-200 rounded-xl transition-colors touch-manipulation"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Title with logo */}
          <Link href="/" className="flex items-center gap-2 min-h-[44px] px-2 rounded-lg active:bg-slate-800/50 transition-colors touch-manipulation">
            <MascotIcon size={24} />
            <h1 className="text-base font-semibold text-white">{title}</h1>
          </Link>

          {/* Notification bell */}
          <Link
            href="/audit?view=activity"
            className="flex items-center justify-center min-w-[44px] min-h-[44px] -mr-2 text-slate-400 hover:text-white active:text-slate-200 rounded-xl transition-colors touch-manipulation"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  )
}
