'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  X,
  Home,
  MessageSquare,
  Briefcase,
  Bot,
  Settings,
  ChevronRight,
  User,
  LogOut,
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { PresenceDots } from '@/components/agents/PresenceIndicator'

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  subItems?: { href: string; label: string }[]
}

const navItems: NavItem[] = [
  { 
    href: '/', 
    icon: Home, 
    label: 'Home' 
  },
  { 
    href: '/chat', 
    icon: MessageSquare, 
    label: 'Chat' 
  },
  { 
    href: '/tasks', 
    icon: Briefcase, 
    label: 'Tasks',
    subItems: [
      { href: '/tasks', label: 'Board' },
      { href: '/tasks/graph', label: 'Graph' },
      { href: '/sprint', label: 'Sprint' },
    ]
  },
  { 
    href: '/agents', 
    icon: Bot, 
    label: 'Agents',
    subItems: [
      { href: '/agents/fleet', label: 'Fleet' },
      { href: '/agents/sessions', label: 'Sessions' },
      { href: '/agents/org', label: 'Organization' },
    ]
  },
  {
    href: '/settings',
    icon: Settings, 
    label: 'Settings' 
  },
]

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
      return () => window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 md:hidden transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-[280px] max-w-[85vw] bg-slate-900 z-50 md:hidden transform transition-transform duration-200 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-blue-500" />
            <span className="font-bold text-lg text-white">ClawLegion</span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 -mr-2 text-slate-400 hover:text-white rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              const hasSubItems = item.subItems && item.subItems.length > 0

              return (
                <div key={item.href}>
                  {/* Main nav item */}
                  <Link
                    href={hasSubItems ? item.subItems![0].href : item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      active
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1 font-medium">{item.label}</span>
                    {hasSubItems && (
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    )}
                  </Link>

                  {/* Sub-items (shown when parent is active) */}
                  {hasSubItems && active && (
                    <div className="ml-9 mt-1 space-y-1 border-l border-white/[0.06] pl-4">
                      {item.subItems!.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          onClick={onClose}
                          className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                            pathname === subItem.href
                              ? 'text-blue-400 bg-blue-500/10'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                          }`}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </nav>

        {/* Agent status */}
        <div className="px-4 py-3 border-t border-slate-800">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Agents:</span>
            <PresenceDots />
          </div>
        </div>

        {/* User section */}
        <div className="px-4 py-4 border-t border-slate-800 safe-area-bottom">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {session?.user?.name || 'User'}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {session?.user?.email || ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </>
  )
}
