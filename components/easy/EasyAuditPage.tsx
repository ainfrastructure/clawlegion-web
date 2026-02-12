/**
 * EasyAuditPage — Simplified audit timeline for Easy Mode
 *
 * Shows human-readable messages in a clean timeline.
 * No filter controls, no data table.
 */
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { PageContainer } from '@/components/layout'
import {
  SwissHeader,
  SwissButton,
  SwissEmptyState,
} from '@/components/swiss'
import {
  Bot,
  CheckCircle2,
  AlertTriangle,
  Info,
  Settings,
  Zap,
  Clock,
  ScrollText,
} from 'lucide-react'
import { clsx } from 'clsx'

interface AuditEntry {
  id: string
  timestamp: string
  action: string
  actor: string
  entityType: string
  entityId: string
  entityName: string
  details: Record<string, any>
  humanMessage?: string
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  agent_started: <Bot size={14} />,
  agent_idle: <Bot size={14} />,
  agent_stopped: <Bot size={14} />,
  task_created: <Zap size={14} />,
  task_completed: <CheckCircle2 size={14} />,
  task_failed: <AlertTriangle size={14} />,
  task_updated: <Info size={14} />,
  config_changed: <Settings size={14} />,
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function getDateLabel(timestamp: string): string {
  const date = new Date(timestamp)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatHumanMessage(entry: AuditEntry): string {
  if (entry.humanMessage) return entry.humanMessage

  const action = entry.action.replace(/_/g, ' ')
  const entity = entry.entityName || entry.entityId
  return `${entry.actor} ${action}${entity ? ` — ${entity}` : ''}`
}

export function EasyAuditPage() {
  const [page, setPage] = useState(1)
  const pageSize = 25

  const { data, isLoading } = useQuery({
    queryKey: ['audit', 'easy', page],
    queryFn: () =>
      api.get(`/audit?format=human&limit=${pageSize * page}`).then(r => r.data),
    refetchInterval: 15000,
  })

  const entries: AuditEntry[] = data?.entries ?? []

  // Group entries by date
  const groups: { label: string; entries: AuditEntry[] }[] = []
  let currentLabel = ''
  for (const entry of entries) {
    const label = getDateLabel(entry.timestamp)
    if (label !== currentLabel) {
      currentLabel = label
      groups.push({ label, entries: [entry] })
    } else {
      groups[groups.length - 1].entries.push(entry)
    }
  }

  const hasMore = entries.length >= pageSize * page

  return (
    <PageContainer>
      <div className="space-y-swiss-6">
        <SwissHeader title="Log" subtitle="Activity timeline" />

        {isLoading && entries.length === 0 ? (
          <div className="space-y-swiss-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-[56px] rounded-swiss-md bg-[var(--swiss-surface-raised)] animate-pulse" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <SwissEmptyState
            icon={<ScrollText size={24} />}
            title="No activity yet"
            description="Events will appear here as things happen."
          />
        ) : (
          <div className="space-y-swiss-8">
            {groups.map((group) => (
              <div key={group.label}>
                {/* Date header */}
                <h3 className="text-swiss-xs font-semibold text-[var(--swiss-text-tertiary)] uppercase tracking-wider mb-swiss-4">
                  {group.label}
                </h3>

                {/* Timeline */}
                <div className="relative pl-swiss-6">
                  {/* Vertical line */}
                  <div className="absolute left-[7px] top-[8px] bottom-[8px] w-[1px] bg-[var(--swiss-border)]" />

                  <div className="space-y-swiss-4">
                    {group.entries.map((entry) => {
                      const icon = CATEGORY_ICONS[entry.action] ?? <Clock size={14} />
                      return (
                        <div key={entry.id} className="relative flex items-start gap-swiss-3">
                          {/* Dot */}
                          <div
                            className={clsx(
                              'absolute -left-swiss-6 top-[4px]',
                              'w-[14px] h-[14px] rounded-full',
                              'flex items-center justify-center',
                              'bg-[var(--swiss-surface)] border border-[var(--swiss-border)]',
                              'text-[var(--swiss-text-tertiary)]',
                            )}
                          >
                            {icon}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-swiss-sm text-[var(--swiss-text-primary)]">
                              {formatHumanMessage(entry)}
                            </p>
                            <p className="text-swiss-xs text-[var(--swiss-text-muted)] mt-swiss-1">
                              {formatTime(entry.timestamp)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center pt-swiss-4">
                <SwissButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                >
                  Load more
                </SwissButton>
              </div>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  )
}
