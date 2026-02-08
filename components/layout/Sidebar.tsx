'use client'
import { GlobalSearch } from "@/components/search"
import { MascotTrioIcon } from '@/components/landing/MascotTrioIcon'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  Home,
  MessageSquare,
  Briefcase,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronRight as ChevronRightSm,
  Kanban,
  List,
  GitBranch,
  Target,
  Users,
  Clock,
  Terminal,
  ScrollText,
  LayoutDashboard,
  Activity,
  AlertCircle,
  HeartPulse,
  LogOut,
  User,
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { PresenceDots } from '@/components/agents/PresenceIndicator'
import { useSidebar } from './SidebarContext'

interface NavSubItem {
  href: string
  label: string
}

interface NavItem {
  href: string
  icon: React.ReactNode
  label: string
  subItems?: NavSubItem[]
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    icon: <Home className="w-5 h-5" />,
    label: 'Home'
  },
  {
    href: '/chat',
    icon: <MessageSquare className="w-5 h-5" />,
    label: 'Chat'
  },
  {
    href: '/tasks',
    icon: <Briefcase className="w-5 h-5" />,
    label: 'Tasks',
    subItems: [
      { href: '/tasks', label: 'Board' },
      { href: '/tasks/graph', label: 'Graph' },
      { href: '/sprint', label: 'Sprint' },
    ]
  },
  {
    href: '/agents',
    icon: <Bot className="w-5 h-5" />,
    label: 'Agents',
    subItems: [
      { href: '/agents/fleet', label: 'Fleet' },
      { href: '/agents/sessions', label: 'Loops' },
      { href: '/agents/org', label: 'Organization' },
    ]
  },
  {
    href: '/health',
    icon: <HeartPulse className="w-5 h-5" />,
    label: 'Health'
  },
  {
    href: '/watchdog',
    icon: <Activity className="w-5 h-5" />,
    label: 'Watchdog'
  },
  {
    href: '/settings',
    icon: <Settings className="w-5 h-5" />,
    label: 'Settings'
  },
]

export function Sidebar() {
  const { collapsed, toggleCollapsed } = useSidebar()
  const { data: session } = useSession()
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    '/tasks': true,
    '/agents': true,
  })

  const toggleSection = (href: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [href]: !prev[href]
    }))
  }

  const isItemActive = (item: NavItem) => {
    if (item.href === '/dashboard') return pathname === '/dashboard' || pathname === '/'
    return pathname.startsWith(item.href)
  }

  const isSubItemActive = (subItem: NavSubItem) => {
    return pathname === subItem.href || pathname.startsWith(subItem.href + '/')
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-slate-950/80 backdrop-blur-xl border-r border-white/[0.06] flex flex-col z-40 transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Logo */}
      <div className={`h-14 flex items-center border-b border-white/[0.06] ${collapsed ? 'justify-center px-2' : 'px-4'}`}>
        {collapsed ? (
          <MascotTrioIcon size={28} />
        ) : (
          <Link href="/dashboard" className="flex items-center gap-2">
            <MascotTrioIcon size={28} />
            <span className="font-bold text-lg">ClawLegion</span>
          </Link>
        )}
      </div>

      {/* Global Search */}
      {!collapsed && (
        <div className="px-3 py-3 border-b border-white/[0.06]">
          <GlobalSearch />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = isItemActive(item)
            const hasSubItems = item.subItems && item.subItems.length > 0
            const isExpanded = expandedSections[item.href]

            return (
              <div key={item.href}>
                {/* Main nav item */}
                <div className="flex items-center">
                  <Link
                    href={hasSubItems && item.subItems ? item.subItems[0].href : item.href}
                    data-testid={`nav-${item.href.replace(/\//g, '-').slice(1) || 'home'}`}
                    className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-500/15 text-blue-400 shadow-glow-blue/30'
                        : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
                    } ${collapsed ? 'justify-center' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    {item.icon}
                    {!collapsed && (
                      <span className="flex-1 text-sm font-medium">{item.label}</span>
                    )}
                  </Link>

                  {/* Expand/collapse button for sections with sub-items */}
                  {hasSubItems && !collapsed && (
                    <button
                      onClick={() => toggleSection(item.href)}
                      className="p-1 text-slate-400 hover:text-white rounded transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRightSm className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>

                {/* Sub-items */}
                {hasSubItems && !collapsed && isExpanded && item.subItems && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l border-white/[0.06] pl-3">
                    {item.subItems.map((subItem) => {
                      const isSubActive = isSubItemActive(subItem)
                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          data-testid={`nav-${subItem.href.replace(/\//g, '-').slice(1)}`}
                          className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            isSubActive
                              ? 'text-blue-400 bg-blue-500/10'
                              : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
                          }`}
                        >
                          {subItem.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </nav>

      {/* Agent Status */}
      <div className={`border-t border-white/[0.06] p-3 ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <PresenceDots />
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Agents:</span>
            <PresenceDots />
          </div>
        )}
      </div>

      {/* User / Logout */}
      <div className={`border-t border-white/[0.06] p-3 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
        {collapsed ? (
          <button
            onClick={() => signOut()}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/[0.04] rounded-lg transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-300 truncate">
                {session?.user?.name || 'User'}
              </p>
            </div>
            <button
              onClick={() => signOut()}
              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-white/[0.04] rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggleCollapsed}
        className="absolute -right-3 top-20 w-6 h-6 bg-slate-900 border border-white/[0.06] rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  )
}

export function MainContent({ children, fullHeight }: { children: React.ReactNode; fullHeight?: boolean }) {
  const { collapsed } = useSidebar()

  return (
    <div className={`transition-all duration-200 ${collapsed ? "ml-16" : "ml-56"} ${
      fullHeight ? "h-screen overflow-hidden" : "min-h-screen"
    }`}>
      {children}
    </div>
  )
}
