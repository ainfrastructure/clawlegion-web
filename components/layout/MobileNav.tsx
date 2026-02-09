'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  Home,
  ListTodo,
  MessageSquare,
  Bot,
  MoreHorizontal,
  Settings,
  Users,
  X,
} from 'lucide-react'

interface NavTab {
  href: string
  icon: React.ElementType
  label: string
  isMenu?: boolean
}

const mainTabs: NavTab[] = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/tasks', icon: ListTodo, label: 'Tasks' },
  { href: '/chat', icon: MessageSquare, label: 'Chat' },
  { href: '/agents/fleet', icon: Bot, label: 'Agents' },
  { href: '#more', icon: MoreHorizontal, label: 'More', isMenu: true },
]

const moreMenuItems = [
  { href: '/agents/sessions', icon: Users, label: 'Sessions' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function MobileNav() {
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (href === '/agents/fleet') return pathname.startsWith('/agents')
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* More menu popup */}
      {showMore && (
        <div className="fixed bottom-[72px] right-4 left-4 bg-slate-900 border border-white/[0.06] rounded-xl p-2 z-50 md:hidden shadow-xl">
          <div className="flex items-center justify-between px-3 py-2 mb-1 border-b border-slate-800">
            <span className="text-sm font-medium text-slate-300">More Options</span>
            <button
              onClick={() => setShowMore(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {moreMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setShowMore(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 z-40 md:hidden safe-area-bottom">
        <div className="flex items-center justify-around h-full px-2">
          {mainTabs.map((tab) => {
            const Icon = tab.icon
            const active = tab.isMenu ? showMore : isActive(tab.href)

            if (tab.isMenu) {
              return (
                <button
                  key={tab.href}
                  onClick={() => setShowMore(!showMore)}
                  className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] px-3 py-2 rounded-lg transition-colors ${
                    active
                      ? 'text-blue-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs mt-1 font-medium">{tab.label}</span>
                </button>
              )
            }

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] px-3 py-2 rounded-lg transition-colors ${
                  active
                    ? 'text-blue-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <div className="relative">
                  <Icon className="w-6 h-6" />
                  {active && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full" />
                  )}
                </div>
                <span className="text-xs mt-1 font-medium">{tab.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
