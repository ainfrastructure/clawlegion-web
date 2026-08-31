'use client'
import { GlobalSearch } from "@/components/search"
import { MascotTrioIcon } from '@/components/landing/MascotTrioIcon'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  Home,
  Briefcase,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronRight as ChevronRightSm,
  HeartPulse,
  LogOut,
  User,
  Zap,
  ScrollText,
  Eye,
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

// Easy mode: 5 simple items — Home (⌂), Work (☐), Team (◎), Log (✎), Settings (⚙)
const EASY_NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    icon: <Home className="w-5 h-5" />,
    label: 'Home'
  },
  {
    href: '/tasks',
    icon: <Briefcase className="w-5 h-5" />,
    label: 'Work'
  },
  {
    href: '/agents/org',
    icon: <Bot className="w-5 h-5" />,
    label: 'Team'
  },
  {
    href: '/audit',
    icon: <ScrollText className="w-5 h-5" />,
    label: 'Log'
  },
  {
    href: '/settings',
    icon: <Settings className="w-5 h-5" />,
    label: 'Settings'
  },
]

// Power mode: all items with sub-nav
const POWER_NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    icon: <Home className="w-5 h-5" />,
    label: 'Home'
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
      { href: '/agents/org', label: 'Organization' },
      { href: '/flows', label: 'Flows' },
    ]
  },
  {
    href: '/health',
    icon: <HeartPulse className="w-5 h-5" />,
    label: 'Monitoring',
    subItems: [
      { href: '/health', label: 'System' },
    ]
  },
  {
    href: '/audit',
    icon: <ScrollText className="w-5 h-5" />,
    label: 'Audit'
  },
  {
    href: '/settings',
    icon: <Settings className="w-5 h-5" />,
    label: 'Settings'
  },
]

export function Sidebar() {
  const { collapsed, toggleCollapsed, uiMode, toggleUIMode } = useSidebar()
  const { data: session } = useSession()
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    '/tasks': true,
    '/agents': true,
    '/health': true,
  })

  const navItems = uiMode === 'easy' ? EASY_NAV_ITEMS : POWER_NAV_ITEMS

  const toggleSection = (href: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [href]: !prev[href]
    }))
  }

  const isItemActive = (item: NavItem) => {
    if (item.href === '/dashboard') return pathname === '/dashboard' || pathname === '/'
    // Check sub-items first — they may have non-prefix paths (e.g., /sessions under /agents)
    if (item.subItems) {
      return item.subItems.some(sub => pathname === sub.href || pathname.startsWith(sub.href + '/'))
    }
    return pathname === item.href || pathname.startsWith(item.href + '/')
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

      {/* Mode Toggle */}
      {!collapsed && (
        <div className="px-3 py-2 border-t border-white/[0.06]">
          <button
            onClick={toggleUIMode}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors hover:bg-white/[0.04]"
          >
            {uiMode === 'easy' ? (
              <>
                <span className="text-sm">🔌</span>
                <span className="text-slate-400 flex-1 text-left">
                  <span className="text-amber-400 font-medium">Power Mode</span> →
                </span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-slate-400">Switch to <span className="text-blue-400 font-medium">Easy Mode</span></span>
              </>
            )}
          </button>
        </div>
      )}

      {collapsed && (
        <div className="px-2 py-2 border-t border-white/[0.06] flex justify-center">
          <button
            onClick={toggleUIMode}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors"
            title={uiMode === 'easy' ? 'Switch to Power Mode' : 'Switch to Easy Mode'}
          >
            {uiMode === 'easy' ? <Zap className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-blue-400" />}
          </button>
        </div>
      )}

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
