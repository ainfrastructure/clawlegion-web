'use client'

import { useState } from 'react'
import { 
  Plus, MessageSquare, Bell, Search, Settings,
  Zap, Users, ListTodo, LayoutDashboard, Command
} from 'lucide-react'

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  shortcut?: string
  action: () => void
  color: string
}

export function QuickActions() {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null)

  const actions: QuickAction[] = [
    {
      id: 'search',
      label: 'Search',
      icon: <Search className="w-4 h-4" />,
      shortcut: '⌘K',
      action: () => {
        const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true })
        document.dispatchEvent(event)
      },
      color: 'hover:bg-red-500/20 hover:text-blue-400'
    },
    {
      id: 'new-task',
      label: 'New Task',
      icon: <Plus className="w-4 h-4" />,
      shortcut: 'T',
      action: () => document.dispatchEvent(new CustomEvent('create-task')),
      color: 'hover:bg-green-500/20 hover:text-green-400'
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: <MessageSquare className="w-4 h-4" />,
      shortcut: 'C',
      action: () => document.dispatchEvent(new CustomEvent('toggle-chat')),
      color: 'hover:bg-purple-500/20 hover:text-purple-400'
    },
    {
      id: 'notifications',
      label: 'Alerts',
      icon: <Bell className="w-4 h-4" />,
      shortcut: 'N',
      action: () => document.dispatchEvent(new CustomEvent('toggle-notifications')),
      color: 'hover:bg-yellow-500/20 hover:text-yellow-400'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      shortcut: '⌘,',
      action: () => {
        const event = new KeyboardEvent('keydown', { key: ',', metaKey: true })
        document.dispatchEvent(event)
      },
      color: 'hover:bg-slate-500/20 hover:text-slate-300'
    }
  ]

  return (
    <div className="flex items-center gap-1 p-1 glass-2 rounded-lg">
      {actions.map(action => (
        <button
          key={action.id}
          onClick={action.action}
          onMouseEnter={() => setHoveredAction(action.id)}
          onMouseLeave={() => setHoveredAction(null)}
          className={`relative p-2 rounded-lg transition-colors ${action.color}`}
          title={`${action.label}${action.shortcut ? ` (${action.shortcut})` : ''}`}
        >
          {action.icon}
          
          {/* Tooltip */}
          {hoveredAction === action.id && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 border border-white/[0.06] rounded text-xs whitespace-nowrap z-10">
              {action.label}
              {action.shortcut && (
                <kbd className="ml-2 px-1 bg-slate-800 rounded">{action.shortcut}</kbd>
              )}
            </div>
          )}
        </button>
      ))}
    </div>
  )
}

export default QuickActions
