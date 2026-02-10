'use client'

import { useState, useEffect, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Loader2, MessageCircle, Activity, FileText, LayoutDashboard } from 'lucide-react'
import { TaskDetailHeader } from './TaskDetailHeader'
import { TaskDetailFooter } from './TaskDetailFooter'
import { TaskStatusTimeline } from './TaskStatusTimeline'
import { OverviewTab } from './tabs/OverviewTab'
import { TimelineTab } from './tabs/TimelineTab'
import { DiscussionTab } from './tabs/DiscussionTab'
import { DeliverablesTab } from './tabs/DeliverablesTab'
import type { Task, TaskDetailModalProps } from './types'

type TabKey = 'overview' | 'timeline' | 'discussion' | 'deliverables'

const TABS: { key: TabKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'timeline', label: 'Timeline', icon: Activity },
  { key: 'discussion', label: 'Discussion', icon: MessageCircle },
  { key: 'deliverables', label: 'Deliverables', icon: FileText },
]

export function TaskDetailModal({ taskId, task: initialTask, isOpen, onClose, initialTab }: TaskDetailModalProps) {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab ?? 'overview')
  const [commentText, setCommentText] = useState('')

  // --- Data Fetching ---

  const { data: fetchedTask, isLoading } = useQuery({
    queryKey: ['task-detail', taskId],
    queryFn: async () => {
      try {
        const response = await api.get(`/task-tracking/tasks/${taskId}?includeActivities=true`)
        return response.data.task as Task
      } catch {
        return initialTask as Task
      }
    },
    enabled: isOpen && !!taskId,
    staleTime: 30000,
  })

  const { data: activitiesData, isLoading: isLoadingActivities } = useQuery({
    queryKey: ['task-activities', taskId],
    queryFn: async () => {
      const response = await api.get(`/task-tracking/tasks/${taskId}/activities`)
      return response.data.activities
    },
    enabled: isOpen && !!taskId,
    staleTime: 15000,
  })

  const task = fetchedTask || initialTask

  const isInProgress = task?.status === 'in_progress' || task?.status === 'assigned'

  const { data: commentsData, isLoading: isLoadingComments } = useQuery({
    queryKey: ['task-comments', taskId],
    queryFn: async () => {
      const response = await api.get(`/task-tracking/tasks/${taskId}/comments`)
      return response.data.comments as Array<{
        id: string
        content: string
        author: string
        authorType: string
        mentions: string[]
        timestamp: string
      }>
    },
    enabled: isOpen && !!taskId,
    refetchInterval: 10000,
  })

  // --- Mutations ---

  const postCommentMutation = useMutation({
    mutationFn: async ({ content, author }: { content: string; author: string }) => {
      const response = await api.post(`/task-tracking/tasks/${taskId}/comments`, {
        content,
        author,
        authorType: 'human',
      })
      return response.data
    },
    onSuccess: () => {
      setCommentText('')
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] })
    },
  })

  const statusMutation = useMutation({
    mutationFn: async ({ status }: { status: string }) => {
      const response = await api.patch(`/task-tracking/tasks/${taskId}/status`, {
        status,
        actor: 'dashboard',
        actorType: 'human',
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackedTasks'] })
      queryClient.invalidateQueries({ queryKey: ['task-tracking-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task-detail', taskId] })
      queryClient.invalidateQueries({ queryKey: ['task-queue'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete(`/task-tracking/tasks/${taskId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackedTasks'] })
      queryClient.invalidateQueries({ queryKey: ['task-tracking-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task-queue'] })
      onClose()
    },
  })

  const executeMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/task-tracking/tasks/${taskId}/execute`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackedTasks'] })
      queryClient.invalidateQueries({ queryKey: ['task-queue'] })
      queryClient.invalidateQueries({ queryKey: ['task-detail', taskId] })
    },
  })

  // --- Effects ---

  // Sync active tab when initialTab or taskId changes
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab)
  }, [initialTab, taskId])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const handlePostComment = useCallback(() => {
    if (commentText.trim()) {
      postCommentMutation.mutate({ content: commentText.trim(), author: 'Sven' })
    }
  }, [commentText, postCommentMutation])

  if (!isOpen) return null

  const canExecute = !!task?.approvedAt && !task?.sessionId
  const commentCount = commentsData?.length || 0

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-2 sm:inset-4 md:inset-6 lg:inset-8 flex items-center justify-center">
        <div className="relative w-full max-w-6xl h-full rounded-2xl overflow-hidden flex flex-col bg-[#0a1628]/95 backdrop-blur-xl border border-blue-500/[0.12] shadow-[0_8px_60px_-12px_rgb(59_130_246/0.25),0_4px_20px_-4px_rgb(0_0_0/0.5)]">

          {/* Header (fixed) */}
          <TaskDetailHeader
            task={task}
            isLoading={isLoading}
            isInProgress={isInProgress}
            onDelete={() => deleteMutation.mutate()}
            isDeleting={deleteMutation.isPending}
            onClose={onClose}
          />

          {/* Pipeline Strip (fixed) */}
          <div className="flex-shrink-0 px-4 sm:px-6 bg-[#070f1e]/60 border-b border-blue-500/[0.06]">
            {isLoading ? (
              <div className="py-6 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              </div>
            ) : (
              <TaskStatusTimeline
                currentStatus={task?.status || 'backlog'}
                activities={activitiesData || []}
                /* onStatusClick removed — phases are display-only, not manually clickable */
                domain={task?.domain}
                sessionId={task?.sessionId}
              />
            )}
          </div>

          {/* Tab Bar (fixed) */}
          <div className="flex-shrink-0 flex items-center gap-0 bg-blue-950/40 border-b border-blue-500/[0.08] px-4 sm:px-6">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key
              const Icon = tab.icon
              const badge = tab.key === 'discussion' && commentCount > 0 ? commentCount : null

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors relative
                    ${isActive
                      ? 'text-blue-300 border-b-2 border-blue-400'
                      : 'text-slate-500 hover:text-slate-300 border-b-2 border-transparent'
                    }
                  `}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {badge !== null && (
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 rounded-full px-1.5 py-0.5 leading-none">
                      {badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Tab Content (scrollable) */}
          {/* Tab Content (scrollable) */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Use hidden instead of conditional rendering to preserve Discussion state */}
            <div className={`flex-1 min-h-0 overflow-y-auto ${activeTab !== 'overview' ? 'hidden' : ''}`}>
              <OverviewTab task={task} taskId={taskId} />
            </div>
            <div className={`flex-1 min-h-0 overflow-y-auto ${activeTab !== 'timeline' ? 'hidden' : ''}`}>
              <TimelineTab
                taskId={taskId}
                activities={activitiesData}
                isLoadingActivities={isLoadingActivities}
              />
            </div>
            <div className={`flex-1 min-h-0 flex flex-col ${activeTab !== 'discussion' ? 'hidden' : ''}`}>
              <DiscussionTab
                comments={commentsData}
                isLoading={isLoadingComments}
                commentText={commentText}
                onCommentTextChange={setCommentText}
                onPostComment={handlePostComment}
                isPosting={postCommentMutation.isPending}
              />
            </div>
            <div className={`flex-1 min-h-0 overflow-y-auto ${activeTab !== 'deliverables' ? 'hidden' : ''}`}>
              <DeliverablesTab taskId={taskId} />
            </div>
          </div>

          {/* Footer (fixed) */}
          <TaskDetailFooter
            taskId={taskId}
            taskStatus={task?.status}
            onStartTask={() => statusMutation.mutate({ status: 'todo' })}
            isStarting={statusMutation.isPending}
            canExecute={canExecute}
            onExecute={() => executeMutation.mutate()}
            isExecuting={executeMutation.isPending}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  )
}

export default TaskDetailModal
