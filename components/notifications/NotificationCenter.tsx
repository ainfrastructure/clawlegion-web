'use client'

import { useState, useEffect } from 'react'
import { 
  Bell, X, Check, CheckCheck, MessageSquare, AlertCircle, 
  Info, Zap, User, Clock, Settings, Trash2
} from 'lucide-react'

interface Notification {
  id: string
  type: 'mention' | 'task' | 'alert' | 'info' | 'success'
  title: string
  message: string
  read: boolean
  timestamp: string
  actionUrl?: string
  sender?: string
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    // Fetch notifications from chat rooms for @mentions
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/coordination/room-messages?roomId=bot-collab')
        if (res.ok) {
          const data = await res.json()
          // Convert mentions to notifications
          const mentions = (data.messages || [])
            .filter((m: any) => 
              m.content.toLowerCase().includes('@socialchefai') ||
              m.content.toLowerCase().includes('@all') ||
              m.content.toLowerCase().includes('@both')
            )
            .slice(-10)
            .map((m: any) => ({
              id: m.id,
              type: 'mention' as const,
              title: `${m.author} mentioned you`,
              message: m.content.slice(0, 100),
              read: false, // Would track in real app
              timestamp: m.timestamp,
              sender: m.author
            }))
          
          setNotifications(mentions.reverse())
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err)
      }
    }

    fetchNotifications()
    const interval = setInterval(fetchNotifications, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev)
    document.addEventListener('toggle-notifications', handleToggle)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey &&
          !(e.target instanceof HTMLInputElement) &&
          !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('toggle-notifications', handleToggle)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const markRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const typeIcons: Record<string, React.ReactNode> = {
    mention: <MessageSquare className="w-4 h-4 text-purple-400" />,
    task: <Zap className="w-4 h-4 text-yellow-400" />,
    alert: <AlertCircle className="w-4 h-4 text-red-400" />,
    info: <Info className="w-4 h-4 text-blue-400" />,
    success: <Check className="w-4 h-4 text-green-400" />
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    
    if (diffMin < 1) return 'now'
    if (diffMin < 60) return `${diffMin}m`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return `${diffHr}h`
    return date.toLocaleDateString()
  }

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications

  return (
    <>
      {/* Bell button (for header) */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 hover:bg-slate-800 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-4 top-16 w-96 max-h-[70vh] bg-slate-900 border border-white/[0.06] rounded-xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-slate-400" />
                <h3 className="font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={markAllRead}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                  title="Mark all read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
                <button 
                  onClick={clearAll}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                  title="Clear all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex border-b border-white/[0.06]">
              {(['all', 'unread'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    filter === f
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Notifications list */}
            <div className="flex-1 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Bell className="w-8 h-8 mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                filteredNotifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`flex gap-3 p-4 border-b border-white/[0.06]/50 cursor-pointer transition-colors ${
                      n.read ? 'bg-transparent' : 'bg-blue-500/5'
                    } hover:bg-slate-800/50`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {typeIcons[n.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`font-medium text-sm ${n.read ? 'text-slate-300' : 'text-white'}`}>
                          {n.title}
                        </p>
                        <span className="text-xs text-slate-500 flex-shrink-0">
                          {formatTime(n.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      {n.sender && (
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {n.sender}
                        </p>
                      )}
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/[0.06] text-center">
              <p className="text-xs text-slate-500">
                Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">N</kbd> to toggle
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default NotificationCenter
