'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, Home, LayoutDashboard, ListTodo, Users, Settings,
  MessageSquare, Bell, GitBranch, Zap, Command
} from 'lucide-react'
import { useShortcutConfig } from '@/hooks/useShortcutConfig'

interface CommandItem {
  id: string
  title: string
  description?: string
  icon: React.ReactNode
  action: () => void
  keywords?: string[]
  shortcut?: string
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { getBinding, enabled } = useShortcutConfig()

  const commands: CommandItem[] = [
    {
      id: 'home',
      title: 'Go to Home',
      icon: <Home className="w-4 h-4" />,
      action: () => router.push('/'),
      keywords: ['home', 'start'],
      shortcut: getBinding('go-home').currentDisplay,
    },
    {
      id: 'dashboard',
      title: 'Go to Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      action: () => router.push('/dashboard'),
      keywords: ['dashboard', 'main', 'overview'],
      shortcut: getBinding('go-dashboard').currentDisplay,
    },
    {
      id: 'tasks',
      title: 'View Task Board',
      icon: <ListTodo className="w-4 h-4" />,
      action: () => router.push('/tasks'),
      keywords: ['tasks', 'kanban', 'board', 'todo'],
      shortcut: getBinding('go-tasks').currentDisplay,
    },
    {
      id: 'agents',
      title: 'View Agents',
      icon: <Users className="w-4 h-4" />,
      action: () => router.push('/agents'),
      keywords: ['agents', 'bots', 'workers'],
      shortcut: getBinding('go-agents').currentDisplay,
    },
    {
      id: 'sessions',
      title: 'View Sessions',
      icon: <GitBranch className="w-4 h-4" />,
      action: () => router.push('/sessions'),
      keywords: ['sessions', 'runs', 'executions'],
      shortcut: getBinding('go-sessions').currentDisplay,
    },
    {
      id: 'chat',
      title: 'Open Chat',
      description: 'Open agent chat panel',
      icon: <MessageSquare className="w-4 h-4" />,
      action: () => document.dispatchEvent(new CustomEvent('toggle-chat')),
      keywords: ['chat', 'message', 'talk'],
      shortcut: getBinding('chat').currentDisplay,
    },
    {
      id: 'notifications',
      title: 'View Notifications',
      icon: <Bell className="w-4 h-4" />,
      action: () => document.dispatchEvent(new CustomEvent('toggle-notifications')),
      keywords: ['notifications', 'alerts', 'updates'],
      shortcut: getBinding('new-task').currentDisplay,
    },
    {
      id: 'quick-task',
      title: 'Create Quick Task',
      description: 'Add a new task to the queue',
      icon: <Zap className="w-4 h-4" />,
      action: () => document.dispatchEvent(new CustomEvent('create-task')),
      keywords: ['create', 'new', 'task', 'add'],
      shortcut: getBinding('quick-task').currentDisplay,
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      action: () => router.push('/settings'),
      keywords: ['settings', 'preferences', 'config'],
      shortcut: getBinding('settings').currentDisplay,
    }
  ]

  const filteredCommands = commands.filter(cmd => {
    const searchLower = search.toLowerCase()
    return (
      cmd.title.toLowerCase().includes(searchLower) ||
      cmd.description?.toLowerCase().includes(searchLower) ||
      cmd.keywords?.some(k => k.includes(searchLower))
    )
  })

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k' && enabled) {
        e.preventDefault()
        setIsOpen(prev => !prev)
        setSearch('')
        setSelectedIndex(0)
      }

      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }

      // Navigation when open
      if (isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1))
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
        }
        if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
          e.preventDefault()
          filteredCommands[selectedIndex].action()
          setIsOpen(false)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredCommands, selectedIndex])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Palette */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/[0.06] rounded-xl shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none"
          />
          <kbd className="px-2 py-1 text-xs bg-slate-800 text-slate-400 rounded">ESC</kbd>
        </div>

        {/* Commands list */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-500">
              No commands found
            </div>
          ) : (
            filteredCommands.map((cmd, index) => (
              <button
                key={cmd.id}
                onClick={() => {
                  cmd.action()
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  index === selectedIndex 
                    ? 'bg-blue-600/20 text-white' 
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="text-slate-400">{cmd.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{cmd.title}</div>
                  {cmd.description && (
                    <div className="text-xs text-slate-500">{cmd.description}</div>
                  )}
                </div>
                {cmd.shortcut && (
                  <kbd className="px-2 py-0.5 text-xs bg-slate-800 text-slate-400 rounded">
                    {cmd.shortcut}
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-white/[0.06] text-xs text-slate-500 flex items-center gap-4">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">↑</kbd>
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">↓</kbd>
            to navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">↵</kbd>
            to select
          </span>
          <span className="flex items-center gap-1">
            <Command className="w-3 h-3" />
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">K</kbd>
            to toggle
          </span>
        </div>
      </div>
    </div>
  )
}

export default CommandPalette
