/**
 * TaskDetail — Easy Mode task detail view (inside SwissModal)
 *
 * Shows task summary: status, priority, agent, description, progress.
 * No edit capabilities — tasks are managed by agents.
 */
'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { SwissStatusBadge, type SwissStatusBadgeType } from '@/components/swiss'
import { clsx } from 'clsx'
import { Clock, User, AlertTriangle, FileText, ExternalLink } from 'lucide-react'
import type { Task } from '@/types'

interface TaskDetailProps {
  task: Task
}

const statusToBadgeType: Record<string, SwissStatusBadgeType> = {
  in_progress: 'active',
  building: 'active',
  researching: 'active',
  planning: 'active',
  verifying: 'info',
  done: 'success',
  completed: 'success',
  failed: 'error',
  backlog: 'neutral',
  todo: 'neutral',
}

const statusToLabel: Record<string, string> = {
  in_progress: 'In Progress',
  building: 'Building',
  researching: 'Researching',
  planning: 'Planning',
  verifying: 'Verifying',
  done: 'Done',
  completed: 'Done',
  failed: 'Failed',
  backlog: 'Backlog',
  todo: 'To Do',
}

const priorityLabels: Record<string, string> = {
  P0: 'Critical',
  P1: 'High',
  P2: 'Medium',
  P3: 'Low',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

const priorityColors: Record<string, string> = {
  P0: 'text-swiss-error bg-swiss-error/10',
  P1: 'text-swiss-warning bg-swiss-warning/10',
  P2: 'text-[var(--swiss-text-secondary)] bg-[var(--swiss-surface-raised)]',
  P3: 'text-[var(--swiss-text-muted)] bg-[var(--swiss-surface-raised)]',
  high: 'text-swiss-error bg-swiss-error/10',
  medium: 'text-swiss-warning bg-swiss-warning/10',
  low: 'text-[var(--swiss-text-muted)] bg-[var(--swiss-surface-raised)]',
}

function formatDateTime(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

export function TaskDetail({ task }: TaskDetailProps) {
  // Fetch deliverables and comments for this task
  const { data: deliverablesData } = useQuery({
    queryKey: ['task-deliverables', task.id],
    queryFn: () => api.get(`/tasks/${task.id}/deliverables`).then(r => r.data),
    enabled: !!task.id,
  })

  const { data: commentsData } = useQuery({
    queryKey: ['task-comments', task.id],
    queryFn: () => api.get(`/task-tracking/tasks/${task.id}/comments`).then(r => r.data),
    enabled: !!task.id,
  })

  const deliverables = deliverablesData?.deliverables ?? []
  const comments = commentsData?.comments ?? []

  const badgeType = statusToBadgeType[task.status] ?? 'neutral'
  const statusLabel = statusToLabel[task.status] ?? task.status

  return (
    <div className="space-y-swiss-6">
      {/* Title + ID */}
      <div>
        {task.shortId && (
          <span className="swiss-mono text-swiss-xs text-[var(--swiss-text-muted)] block mb-swiss-1">
            {task.shortId}
          </span>
        )}
        <h2 className="text-swiss-xl font-semibold text-[var(--swiss-text-primary)] tracking-tight">
          {task.title}
        </h2>
      </div>

      {/* Metadata row */}
      <div className="flex flex-wrap items-center gap-swiss-3">
        <SwissStatusBadge label={statusLabel} type={badgeType} dot />

        {task.priority && (
          <span className={clsx(
            'text-swiss-xs font-medium px-swiss-2 py-swiss-1 rounded-swiss-sm',
            priorityColors[task.priority] ?? 'text-[var(--swiss-text-muted)] bg-[var(--swiss-surface-raised)]'
          )}>
            {priorityLabels[task.priority] ?? task.priority}
          </span>
        )}

        {(task.assignedTo || task.assignee) && (
          <span className="flex items-center gap-swiss-1 text-swiss-sm text-[var(--swiss-text-secondary)]">
            <User size={14} />
            {task.assignedTo ?? task.assignee}
          </span>
        )}

        {task.createdAt && (
          <span className="flex items-center gap-swiss-1 swiss-mono text-swiss-xs text-[var(--swiss-text-muted)]">
            <Clock size={12} />
            {formatDateTime(task.createdAt)}
          </span>
        )}
      </div>

      {/* Divider + Description */}
      {task.description && (
        <>
          <div className="border-t border-[var(--swiss-border)]" />
          <div>
            <h3 className="text-swiss-sm font-medium text-[var(--swiss-text-secondary)] mb-swiss-2">
              Description
            </h3>
            <div className="text-swiss-sm text-[var(--swiss-text-primary)] whitespace-pre-wrap leading-relaxed">
              {task.description}
            </div>
          </div>
        </>
      )}

      {/* Divider + Progress / What's happening */}
      {task.currentWorkflowStep && (
        <>
          <div className="border-t border-[var(--swiss-border)]" />
          <div>
            <h3 className="text-swiss-sm font-medium text-[var(--swiss-text-secondary)] mb-swiss-2">
              What&apos;s happening
            </h3>
            <div className="space-y-swiss-2">
              <div className="flex items-center gap-swiss-2 text-swiss-sm text-[var(--swiss-text-primary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-swiss-accent flex-shrink-0" />
                Currently in <span className="font-medium">{task.currentWorkflowStep}</span> step
              </div>
              {task.attemptCount && task.attemptCount > 1 && (
                <div className="flex items-center gap-swiss-2 text-swiss-sm text-[var(--swiss-text-tertiary)]">
                  <AlertTriangle size={12} />
                  Attempt {task.attemptCount}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Recent activity from comments */}
      {comments.length > 0 && (
        <>
          <div className="border-t border-[var(--swiss-border)]" />
          <div>
            <h3 className="text-swiss-sm font-medium text-[var(--swiss-text-secondary)] mb-swiss-2">
              Recent Activity
            </h3>
            <div className="space-y-swiss-3">
              {comments.slice(0, 5).map((comment: { id: string; content: string; author: string; createdAt: string }) => (
                <div key={comment.id} className="text-swiss-sm">
                  <div className="flex items-center gap-swiss-2 mb-swiss-1">
                    <span className="font-medium text-[var(--swiss-text-primary)]">{comment.author}</span>
                    <span className="swiss-mono text-swiss-xs text-[var(--swiss-text-muted)]">
                      {formatDateTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-[var(--swiss-text-secondary)] line-clamp-3">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Divider + Deliverables */}
      {deliverables.length > 0 && (
        <>
          <div className="border-t border-[var(--swiss-border)]" />
          <div>
            <h3 className="text-swiss-sm font-medium text-[var(--swiss-text-secondary)] mb-swiss-2">
              Output
            </h3>
            <div className="space-y-swiss-2">
              {deliverables.map((d: { id: string; title: string; contentUrl?: string; type: string; status: string }) => (
                <div
                  key={d.id}
                  className="flex items-center gap-swiss-2 text-swiss-sm"
                >
                  <FileText size={14} className="text-[var(--swiss-text-muted)] flex-shrink-0" />
                  <span className="text-[var(--swiss-text-primary)] truncate flex-1">{d.title}</span>
                  {d.contentUrl && (
                    <a
                      href={d.contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--swiss-accent)] hover:underline flex items-center gap-1 flex-shrink-0"
                    >
                      View <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
