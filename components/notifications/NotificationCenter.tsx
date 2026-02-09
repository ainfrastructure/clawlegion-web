'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Bell, X, CheckCheck, Info, CheckCircle,
  AlertTriangle, XCircle, ArrowRight,
  Activity, ShieldCheck, Zap, MessageSquare,
} from 'lucide-react'
import { formatTimeAgo } from '@/components/common/TimeAgo'
import {
  useNotifications,
  useUnreadCount,
  useMarkRead,
  useMarkAllRead,
} from '@/hooks/useNotifications'
import type { UserNotification } from '@/hooks/useNotifications'

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Bell },
  { id: 'lifecycle', label: 'Lifecycle', icon: Activity },
  { id: 'failure', label: 'Failures', icon: XCircle },
  { id: 'verification', label: 'Verification', icon: ShieldCheck },
  { id: 'system', label: 'System', icon: MessageSquare },
] as const

const SEVERITY_CONFIG: Record<string, { icon: typeof Info; color: string; bg: string; ring: string }> = {
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10', ring: 'ring-blue-500/20' },
  success: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/20' },
  warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', ring: 'ring-amber-500/20' },
  error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', ring: 'ring-red-500/20' },
}

function SeverityIcon({ severity, size = 16 }: { severity: string; size?: number }) {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.info
  const Icon = config.icon
  return (
    <div className={`flex-shrink-0 w-7 h-7 rounded-lg ${config.bg} ring-1 ${config.ring} flex items-center justify-center`}>
      <Icon size={size} className={config.color} />
    </div>
  )
}

function NotificationItem({ notification, onMarkRead }: { notification: UserNotification; onMarkRead: (id: string) => void }) {
  const router = useRouter()

  const handleClick = () => {
    if (!notification.read) {
      onMarkRead(notification.id)
    }
    if (notification.taskId) {
      router.push(`/tasks?selected=${notification.taskId}`)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left flex gap-3 px-4 py-3 transition-all duration-150 group relative
        ${notification.read
          ? 'opacity-60 hover:opacity-90'
          : 'hover:bg-white/[0.03]'
        }
      `}
    >
      {/* Unread indicator line */}
      {!notification.read && (
        <div className="absolute left-0 top-3 bottom-3 w-[2px] bg-blue-400 rounded-r" />
      )}

      <SeverityIcon severity={notification.severity} />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-[13px] font-medium leading-snug ${notification.read ? 'text-slate-400' : 'text-slate-200'}`}>
            {notification.title}
          </p>
          <span className="text-[10px] text-slate-500 flex-shrink-0 mt-0.5 tabular-nums">
            {formatTimeAgo(new Date(notification.createdAt))}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
          {notification.body}
        </p>
        {notification.actor && (
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-3.5 h-3.5 rounded-full bg-slate-700 flex items-center justify-center">
              <span className="text-[8px] font-bold text-slate-400 uppercase">{notification.actor[0]}</span>
            </div>
            <span className="text-[10px] text-slate-500">{notification.actor}</span>
          </div>
        )}
      </div>
    </button>
  )
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [category, setCategory] = useState('all')
  const panelRef = useRef<HTMLDivElement>(null)

  const { data } = useNotifications({ category: category === 'all' ? undefined : category, limit: 20 })
  const { data: unreadData } = useUnreadCount()
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()

  const notifications = data?.notifications || []
  const unreadCount = unreadData?.count || 0

  // Keyboard shortcut
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
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('toggle-notifications', handleToggle)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Click outside
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    // Delay to avoid closing immediately from the bell click
    const timer = setTimeout(() => document.addEventListener('mousedown', handleClickOutside), 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors"
        title="Notifications (N)"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 rounded-full text-[10px] font-semibold flex items-center justify-center text-white leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-[420px] max-h-[70vh] bg-slate-900 rounded-xl border border-white/[0.08] shadow-2xl shadow-black/50 overflow-hidden flex flex-col z-50"
          style={{
            animation: 'notificationSlideIn 180ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <h3 className="text-sm font-semibold text-white tracking-tight">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-500/15 text-blue-400 rounded-md tabular-nums">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-0.5">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead.mutate()}
                  className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-colors"
                  title="Mark all read"
                >
                  <CheckCheck size={14} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-0.5 px-3 py-2 border-b border-white/[0.06] overflow-x-auto scrollbar-hide">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon
              const isActive = category === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-all duration-150 ${
                    isActive
                      ? 'bg-white/[0.08] text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon size={12} className={isActive ? 'text-blue-400' : ''} />
                  {cat.label}
                </button>
              )
            })}
          </div>

          {/* Notification list */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
                  <Bell size={18} className="text-slate-600" />
                </div>
                <p className="text-sm text-slate-500 font-medium">No notifications</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Activity will appear here as events occur
                </p>
              </div>
            ) : (
              notifications.map(n => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkRead={(id) => markRead.mutate(id)}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.06] px-4 py-2.5 flex items-center justify-between">
            <span className="text-[10px] text-slate-600">
              <kbd className="px-1 py-0.5 bg-white/[0.04] rounded text-[9px] font-mono">N</kbd> toggle
            </span>
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white transition-colors"
            >
              View all
              <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      )}

      {/* Keyframe animation */}
      <style jsx global>{`
        @keyframes notificationSlideIn {
          from {
            opacity: 0;
            transform: translateY(-6px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  )
}

export default NotificationCenter
