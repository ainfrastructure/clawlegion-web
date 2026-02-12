'use client'

import { MessageSquare, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ChatMode = 'dms' | 'rooms'

interface ChatModeToggleProps {
  mode: ChatMode
  onChange: (mode: ChatMode) => void
  unreadDms?: number
  unreadRooms?: number
}

export function ChatModeToggle({ 
  mode, 
  onChange,
  unreadDms = 0,
  unreadRooms = 0
}: ChatModeToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-slate-800/50 rounded-lg">
      <button
        onClick={() => onChange('dms')}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
          mode === 'dms'
            ? 'bg-red-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
        )}
      >
        <MessageSquare className="w-4 h-4" />
        DMs
        {unreadDms > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
            {unreadDms}
          </span>
        )}
      </button>
      <button
        onClick={() => onChange('rooms')}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
          mode === 'rooms'
            ? 'bg-red-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
        )}
      >
        <Users className="w-4 h-4" />
        Rooms
        {unreadRooms > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
            {unreadRooms}
          </span>
        )}
      </button>
    </div>
  )
}
