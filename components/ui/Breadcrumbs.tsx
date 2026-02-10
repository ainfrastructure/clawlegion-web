'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href: string
}

// Route name mapping
const routeNames: Record<string, string> = {
  dashboard: 'Dashboard',
  tasks: 'Tasks',
  agents: 'Agents',
  sessions: 'Sessions',
  chat: 'Chat',
  settings: 'Settings',
  notifications: 'Notifications',
  verification: 'Verification',
  repositories: 'Repositories',
  graph: 'Graph View',
  leaderboard: 'Leaderboard',
  fleet: 'Fleet',
  org: 'Organization',
  sprint: 'Sprint',
  loops: 'Loops',
  health: 'Health',
  approvals: 'Approvals',
  audit: 'Audit',
  command: 'Command',
  flows: 'Flows',
  profile: 'Profile',
}

function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)

  return segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const label = routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
    return { label, href }
  })
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const breadcrumbs = getBreadcrumbs(pathname)

  if (pathname === '/' || pathname === '/dashboard') {
    return null // No breadcrumbs on home/dashboard
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm text-slate-400">
      <Link
        href="/"
        className="p-1 rounded bg-white/[0.04] hover:bg-white/[0.08] hover:text-white transition-colors flex items-center"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>

      {breadcrumbs.map((item, index) => (
        <span key={item.href} className="flex items-center">
          <ChevronRight className="w-3.5 h-3.5 mx-2 text-slate-600" />
          {index === breadcrumbs.length - 1 ? (
            <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-white font-medium text-sm">
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
