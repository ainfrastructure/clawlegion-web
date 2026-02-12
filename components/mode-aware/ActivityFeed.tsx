/**
 * ActivityFeed — Easy Mode activity timeline
 *
 * Chronological timeline grouped by day (Today, Yesterday, date headers).
 * Merges audit events + notifications into single feed.
 * Human-readable messages with category icons.
 * No filters, no data table, no export.
 */
'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { SwissTimeline, type SwissTimelineItem, type SwissTimelineStatus, SwissButton, SwissEmptyState } from '@/components/swiss'
import { ScrollText, ChevronDown } from 'lucide-react'

interface AuditEntry {
  id: string
  timestamp: string
  action: string
  actor: string
  entityType: string
  entityId?: string
  entityName?: string
  details?: Record<string, unknown>
}

interface Notification {
  id: string
  createdAt: string
  title: string
  message?: string
  type: string
  read: boolean
}

// Map audit actions to human-readable messages
function humanizeAuditAction(entry: AuditEntry): string {
  const name = entry.entityName ?? entry.entityId ?? ''
  switch (entry.action) {
    case 'task_created': return `New task created: ${name}`
    case 'task_started': return `Task started: ${name}`
    case 'task_updated': return `Task updated: ${name}`
    case 'task_completed': return `Task completed: ${name}`
    case 'task_failed': return `Task failed: ${name}`
    case 'task_assigned': return `Task assigned to ${entry.actor}: ${name}`
    case 'task_deleted': return `Task deleted: ${name}`
    case 'agent_started': return `${entry.actor || 'Agent'} came online`
    case 'agent_stopped': return `${entry.actor || 'Agent'} went offline`
    case 'agent_rate_limited': return `${entry.actor || 'Agent'} was rate limited`
    case 'settings_changed': return `Settings updated by ${entry.actor}`
    case 'verification_run': return `Verification completed: ${name}`
    default: return entry.action.replace(/_/g, ' ')
  }
}

// Map actions to category icons
function actionToIcon(action: string): string {
  if (action.includes('completed') || action.includes('done')) return '✓'
  if (action.includes('created')) return '+'
  if (action.includes('started')) return '→'
  if (action.includes('failed') || action.includes('error')) return '✕'
  return '●'
}

// Map actions to timeline status
function actionToStatus(action: string): SwissTimelineStatus {
  if (action.includes('completed') || action.includes('done')) return 'completed'
  if (action.includes('started') || action.includes('in_progress')) return 'active'
  if (action.includes('failed') || action.includes('error')) return 'error'
  return 'pending'
}

// Group items by date
function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (itemDate.getTime() === today.getTime()) return 'Today'
  if (itemDate.getTime() === yesterday.getTime()) return 'Yesterday'
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  } catch {
    return ''
  }
}

export function ActivityFeed() {
  const [limit, setLimit] = useState(50)

  // Fetch audit entries
  const { data: auditData, isLoading: auditLoading } = useQuery({
    queryKey: ['audit-easy', limit],
    queryFn: () => api.get(`/audit?limit=${limit}`).then(r => r.data),
    refetchInterval: 30000,
  })

  // Fetch notifications
  const { data: notifData, isLoading: notifLoading } = useQuery({
    queryKey: ['notifications-easy', limit],
    queryFn: () => fetch(`/api/user-notifications?limit=20`).then(r => r.ok ? r.json() : { notifications: [] }),
    refetchInterval: 30000,
  })

  const isLoading = auditLoading || notifLoading

  // Merge and sort chronologically
  const groupedItems = useMemo(() => {
    const auditEntries: AuditEntry[] = auditData?.entries ?? []
    const notifications: Notification[] = notifData?.notifications ?? []

    // Convert to unified timeline items
    const items: (SwissTimelineItem & { date: string; sortDate: number })[] = []

    for (const entry of auditEntries) {
      items.push({
        id: `audit-${entry.id}`,
        title: `${actionToIcon(entry.action)} ${humanizeAuditAction(entry)}`,
        timestamp: formatTime(entry.timestamp),
        status: actionToStatus(entry.action),
        date: entry.timestamp,
        sortDate: new Date(entry.timestamp).getTime(),
      })
    }

    for (const notif of notifications) {
      items.push({
        id: `notif-${notif.id}`,
        title: `● ${notif.title}`,
        description: notif.message,
        timestamp: formatTime(notif.createdAt),
        status: 'active' as SwissTimelineStatus,
        date: notif.createdAt,
        sortDate: new Date(notif.createdAt).getTime(),
      })
    }

    // Sort by date descending
    items.sort((a, b) => b.sortDate - a.sortDate)

    // Group by date
    const groups: { label: string; items: SwissTimelineItem[] }[] = []
    let currentGroup: string | null = null

    for (const item of items) {
      const group = getDateGroup(item.date)
      if (group !== currentGroup) {
        groups.push({ label: group, items: [] })
        currentGroup = group
      }
      groups[groups.length - 1].items.push({
        id: item.id,
        title: item.title,
        description: item.description,
        timestamp: item.timestamp,
        status: item.status,
      })
    }

    return groups
  }, [auditData, notifData])

  const totalItems = (auditData?.entries?.length ?? 0) + (notifData?.notifications?.length ?? 0)

  return (
    <div className="space-y-swiss-6">
      {/* Header */}
      <div>
        <h1 className="text-swiss-2xl font-semibold text-[var(--swiss-text-primary)] tracking-tight">
          Log
        </h1>
        <p className="text-swiss-sm text-[var(--swiss-text-tertiary)] mt-swiss-1">
          Activity timeline
        </p>
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="space-y-swiss-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-8 bg-[var(--swiss-surface-raised)] rounded-swiss-md animate-pulse" />
          ))}
        </div>
      ) : groupedItems.length === 0 ? (
        <SwissEmptyState
          icon={<ScrollText size={24} />}
          title="No activity yet"
          description="Activity will appear here as work happens"
        />
      ) : (
        <div className="space-y-swiss-8">
          {groupedItems.map(group => (
            <div key={group.label}>
              <h2 className="text-swiss-sm font-semibold text-[var(--swiss-text-secondary)] uppercase tracking-wider mb-swiss-4">
                {group.label}
              </h2>
              <SwissTimeline items={group.items} size="sm" />
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      {totalItems >= limit && (
        <div className="flex justify-center pt-swiss-4">
          <SwissButton
            variant="ghost"
            size="sm"
            icon={<ChevronDown size={14} />}
            onClick={() => setLimit(prev => prev + 50)}
          >
            Load more
          </SwissButton>
        </div>
      )}
    </div>
  )
}
