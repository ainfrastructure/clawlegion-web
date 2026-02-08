'use client'

import Link from 'next/link'
import { useTheme } from '@/components/theme/ThemeProvider'
import { PresenceDots } from '@/components/agents/PresenceIndicator'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import {
  Sun,
  Moon,
  Plus,
  Bot,
  LayoutDashboard,
  Calendar,
  Kanban,
  Users,
  CheckSquare,
  AlertCircle,
  Inbox,
  ExternalLink,
  Settings
} from 'lucide-react'

export function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-[1600px] mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-blue-500" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                ClawLegion
              </h1>
            </Link>
            <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full font-medium">
              Command Center
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink href="/sessions" icon={<Calendar className="w-4 h-4" />}>Sessions</NavLink>
              <NavLink href="/tasks" icon={<Inbox className="w-4 h-4" />}>Tasks</NavLink>
              <NavLink href="/agents" icon={<Users className="w-4 h-4" />}>Agents</NavLink>
              <NavLink href="/approvals" icon={<CheckSquare className="w-4 h-4" />}>Approvals</NavLink>
              <NavLink href="/issues" icon={<AlertCircle className="w-4 h-4" />}>Issues</NavLink>
              <NavLink href="/settings" icon={<Settings className="w-4 h-4" />}>Settings</NavLink>
            </nav>

            {/* Agent Presence */}
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-800/50 rounded-lg" title="Agent Status">
              <span className="text-xs text-slate-500">Agents:</span>
              <PresenceDots />
            </div>

            {/* Notifications */}
            <NotificationBell agentId="dashboard" />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>

            {/* New Session Button */}
            <Link
              href="/sessions/new"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Session</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

function NavLink({ href, children, icon }: { href: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-colors flex items-center gap-2"
    >
      {icon}
      {children}
    </Link>
  )
}
