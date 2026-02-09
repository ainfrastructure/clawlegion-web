'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageContainer } from '@/components/layout'
import {
  Bell, CheckCheck, Trash2, Search,
  Info, CheckCircle, AlertTriangle, XCircle,
  Activity, ShieldCheck, MessageSquare,
  ChevronDown, Loader2, Users,
} from 'lucide-react'
import { formatTimeAgo } from '@/components/common/TimeAgo'
import {
  useNotifications,
  useUnreadCount,
  useMarkRead,
  useMarkAllRead,
  useClearRead,
} from '@/hooks/useNotifications'
import type { UserNotification } from '@/hooks/useNotifications'
import { AgentAvatar } from '@/components/agents/AgentAvatar'
import { ALL_AGENTS, getAgentById, getAgentByName } from '@/components/chat-v2/agentConfig'

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Bell },
  { id: 'lifecycle', label: 'Lifecycle', icon: Activity },
  { id: 'failure', label: 'Failures', icon: XCircle },
  { id: 'verification', label: 'Verification', icon: ShieldCheck },
  { id: 'system', label: 'System', icon: MessageSquare },
] as const

const SEVERITY_CONFIG: Record<string, { icon: typeof Info; color: string; bg: string; ring: string; label: string }> = {
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10', ring: 'ring-blue-500/20', label: 'Info' },
  success: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/20', label: 'Success' },
  warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', ring: 'ring-amber-500/20', label: 'Warning' },
  error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', ring: 'ring-red-500/20', label: 'Error' },
}

const CATEGORY_COLORS: Record<string, string> = {
  lifecycle: 'bg-blue-500/10 text-blue-400',
  failure: 'bg-red-500/10 text-red-400',
  verification: 'bg-emerald-500/10 text-emerald-400',
  system: 'bg-slate-500/10 text-slate-400',
}

function groupByDate(notifications: UserNotification[]): { label: string; items: UserNotification[] }[] {
  const groups: Record<string, UserNotification[]> = {}

  for (const n of notifications) {
    const date = new Date(n.createdAt)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    let label: string
    if (diffDays === 0 && date.getDate() === now.getDate()) {
      label = 'Today'
    } else if (diffDays <= 1 && date.getDate() === now.getDate() - 1) {
      label = 'Yesterday'
    } else {
      label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    if (!groups[label]) groups[label] = []
    groups[label].push(n)
  }

  return Object.entries(groups).map(([label, items]) => ({ label, items }))
}

function resolveAgentId(actor: string | null): string | null {
  if (!actor) return null
  if (getAgentById(actor)) return actor
  const byName = getAgentByName(actor)
  if (byName) return byName.id
  return null
}

function NotificationCard({ notification, onMarkRead }: { notification: UserNotification; onMarkRead: (id: string) => void }) {
  const router = useRouter()
  const severity = SEVERITY_CONFIG[notification.severity] || SEVERITY_CONFIG.info
  const SevIcon = severity.icon

  const handleClick = () => {
    if (!notification.read) onMarkRead(notification.id)
    if (notification.taskId) {
      const isComment = notification.eventType?.includes('comment')
      const tabParam = isComment ? '&tab=discussion' : ''
      router.push(`/tasks?taskId=${notification.taskId}${tabParam}`)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left glass-2 rounded-xl p-4 border transition-all duration-150 group relative ${
        notification.read
          ? 'border-white/[0.04] opacity-60 hover:opacity-90'
          : 'border-white/[0.06] hover:border-white/[0.10]'
      }`}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute left-0 top-4 bottom-4 w-[2px] bg-blue-400 rounded-r" />
      )}

      <div className="flex gap-3">
        {/* Severity icon */}
        <div className={`flex-shrink-0 w-9 h-9 rounded-lg ${severity.bg} ring-1 ${severity.ring} flex items-center justify-center`}>
          <SevIcon size={18} className={severity.color} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium leading-snug ${notification.read ? 'text-slate-400' : 'text-white'}`}>
                {notification.title}
              </p>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {notification.body}
              </p>
            </div>
            <span className="text-[10px] text-slate-500 flex-shrink-0 mt-0.5 tabular-nums">
              {formatTimeAgo(new Date(notification.createdAt))}
            </span>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${CATEGORY_COLORS[notification.category] || CATEGORY_COLORS.system}`}>
              {notification.category}
            </span>
            {notification.taskShortId && (
              <span className="text-[10px] text-slate-500 font-mono">
                {notification.taskShortId}
              </span>
            )}
            {notification.actor && (() => {
              const agentId = resolveAgentId(notification.actor)
              return (
                <div className="flex items-center gap-1 ml-auto">
                  {agentId ? (
                    <AgentAvatar agentId={agentId} size="xs" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center">
                      <span className="text-[8px] font-bold text-slate-400 uppercase">{notification.actor[0]}</span>
                    </div>
                  )}
                  <span className="text-[10px] text-slate-500">{notification.actor}</span>
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </button>
  )
}

export default function NotificationsPage() {
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [cursor, setCursor] = useState<string | undefined>()
  const [agentFilter, setAgentFilter] = useState<string | null>(null)
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false)
  const agentDropdownRef = useRef<HTMLDivElement>(null)

  // Close agent dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (agentDropdownRef.current && !agentDropdownRef.current.contains(e.target as Node)) {
        setAgentDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const { data, isLoading } = useNotifications({
    category: category === 'all' ? undefined : category,
    search: search || undefined,
    limit: 40,
    cursor,
  })
  const { data: unreadData } = useUnreadCount()
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()
  const clearRead = useClearRead()

  const notifications = data?.notifications || []
  const unreadCount = unreadData?.count || 0

  // Apply agent filter client-side
  const filteredNotifications = agentFilter
    ? notifications.filter(n => resolveAgentId(n.actor) === agentFilter)
    : notifications
  const groups = groupByDate(filteredNotifications)

  // Stats
  const failuresToday = notifications.filter(n =>
    n.category === 'failure' && new Date(n.createdAt).toDateString() === new Date().toDateString()
  ).length
  const lastActivity = notifications[0]?.createdAt

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setCursor(undefined)
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <Activity className="w-7 h-7 text-blue-400" />
            Activity Feed
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/15 text-blue-400 rounded-lg">
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-400 mt-1">All task events and system notifications</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="px-3 py-2 glass-2 rounded-lg text-sm text-slate-300 hover:text-white border border-white/[0.06] hover:border-white/[0.10] transition-colors flex items-center gap-2"
            >
              <CheckCheck size={14} />
              Mark All Read
            </button>
          )}
          <button
            onClick={() => clearRead.mutate()}
            disabled={clearRead.isPending}
            className="px-3 py-2 glass-2 rounded-lg text-sm text-slate-400 hover:text-slate-300 border border-white/[0.06] hover:border-white/[0.10] transition-colors flex items-center gap-2"
          >
            <Trash2 size={14} />
            Clear Read
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="glass-2 rounded-xl border border-white/[0.06] p-4 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Total</p>
            <p className="text-xl font-bold text-white mt-0.5 tabular-nums">{notifications.length}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Unread</p>
            <p className="text-xl font-bold text-blue-400 mt-0.5 tabular-nums">{unreadCount}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Failures Today</p>
            <p className={`text-xl font-bold mt-0.5 tabular-nums ${failuresToday > 0 ? 'text-red-400' : 'text-slate-400'}`}>
              {failuresToday}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Last Activity</p>
            <p className="text-sm font-medium text-slate-300 mt-1">
              {lastActivity ? formatTimeAgo(new Date(lastActivity)) : 'None'}
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search notifications..."
              className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-white/[0.06] rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
        </form>

        {/* Category chips */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon
            const isActive = category === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => { setCategory(cat.id); setCursor(undefined) }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                    : 'glass-2 text-slate-400 hover:text-slate-300 border border-white/[0.06] hover:border-white/[0.10]'
                }`}
              >
                <Icon size={13} />
                {cat.label}
              </button>
            )
          })}

          {/* Agent filter */}
          <div className="relative" ref={agentDropdownRef}>
            <button
              onClick={() => setAgentDropdownOpen(!agentDropdownOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                agentFilter
                  ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                  : 'glass-2 text-slate-400 hover:text-slate-300 border border-white/[0.06] hover:border-white/[0.10]'
              }`}
            >
              {agentFilter ? (
                <AgentAvatar agentId={agentFilter} size="xs" />
              ) : (
                <Users size={13} />
              )}
              {agentFilter ? ALL_AGENTS.find(a => a.id === agentFilter)?.name || 'Agent' : 'Agent'}
              <ChevronDown size={11} className={`transition-transform ${agentDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {agentDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 z-50 w-64 rounded-xl border border-white/[0.08] bg-slate-900/95 backdrop-blur-2xl shadow-2xl shadow-black/40 overflow-hidden">
                {/* Clear filter */}
                {agentFilter && (
                  <>
                    <button
                      onClick={() => { setAgentFilter(null); setAgentDropdownOpen(false); setCursor(undefined) }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/[0.06] transition-colors text-xs text-slate-400"
                    >
                      <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center">
                        <Users size={10} className="text-slate-400" />
                      </div>
                      All Agents
                    </button>
                    <div className="h-px bg-white/[0.06] mx-2" />
                  </>
                )}
                {ALL_AGENTS.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => { setAgentFilter(agent.id); setAgentDropdownOpen(false); setCursor(undefined) }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/[0.06] transition-colors ${
                      agentFilter === agent.id ? 'bg-white/[0.04]' : ''
                    }`}
                  >
                    <AgentAvatar agentId={agent.id} size="xs" />
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-xs font-medium text-slate-200 truncate">{agent.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{agent.role}</div>
                    </div>
                    {agentFilter === agent.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification list grouped by date */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center py-16">
            <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
            <p className="text-sm text-slate-500 mt-3">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="glass-2 rounded-xl border border-white/[0.06] p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
              <Bell size={22} className="text-slate-600" />
            </div>
            <h3 className="text-base font-medium text-slate-400">No notifications</h3>
            <p className="text-sm text-slate-500 mt-1">
              {search ? 'No results match your search' : agentFilter ? 'No notifications from this agent' : 'Events will appear here as tasks are processed'}
            </p>
          </div>
        ) : (
          groups.map(group => (
            <div key={group.label}>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">{group.label}</h3>
                <div className="flex-1 h-px bg-white/[0.04]" />
                <span className="text-[10px] text-slate-600 tabular-nums">{group.items.length}</span>
              </div>
              <div className="space-y-2">
                {group.items.map(n => (
                  <NotificationCard
                    key={n.id}
                    notification={n}
                    onMarkRead={(id) => markRead.mutate(id)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load more */}
      {data?.hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setCursor(data.nextCursor || undefined)}
            className="px-4 py-2 glass-2 rounded-lg text-sm text-slate-400 hover:text-white border border-white/[0.06] hover:border-white/[0.10] transition-colors flex items-center gap-2"
          >
            <ChevronDown size={14} />
            Load more
          </button>
        </div>
      )}
    </PageContainer>
  )
}
