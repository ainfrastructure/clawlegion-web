'use client'

import { useState, useCallback } from 'react'
import { Bell, BellRing, X, AtSign, CheckCircle2, Clock } from 'lucide-react'
import { formatTimeAgo } from '@/components/common/TimeAgo'
import { usePollingInterval } from '@/hooks/usePollingInterval'

interface Notification {
  id: string
  type: 'mention' | 'task' | 'system'
  from: string
  message: string
  roomId: string
  read: boolean
  createdAt: string
}

interface NotificationBellProps {
  agentId?: string
  className?: string
}

export function NotificationBell({ agentId = 'dashboard', className = '' }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`/api/notifications?agent=${agentId}`)
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [agentId])

  usePollingInterval(fetchNotifications, 30000)

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, agent: agentId })
      })
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const markAllRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read)
    // Mark all as read in parallel
    await Promise.all(
      unreadNotifications.map(n =>
        fetch('/api/notifications/mark-read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationId: n.id, agent: agentId })
        })
      )
    )
    setUnreadCount(0)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-slate-800 transition-colors"
        title="Notifications"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-5 h-5 text-orange-400 animate-pulse" />
        ) : (
          <Bell className="w-5 h-5 text-slate-400" />
        )}
        
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-slate-900 border border-white/[0.06] rounded-lg shadow-xl z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <h3 className="font-semibold text-slate-200">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-slate-800 rounded"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-4 text-center text-slate-500 text-sm">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p className="text-slate-500 text-sm">All caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                    className={`px-4 py-3 hover:bg-slate-800/50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-slate-800/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 p-1.5 rounded-full ${
                        notification.type === 'mention' ? 'bg-blue-500/20 text-blue-400' :
                        notification.type === 'task' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {notification.type === 'mention' ? (
                          <AtSign className="w-3 h-3" />
                        ) : (
                          <Bell className="w-3 h-3" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-slate-200">
                            {notification.from}
                          </span>
                          <span className="text-xs text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded">
                            #{notification.roomId}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 truncate mt-0.5">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-600">
                          <Clock className="w-2.5 h-2.5" />
                          {formatTimeAgo(new Date(notification.createdAt))}
                        </div>
                      </div>
                      
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
