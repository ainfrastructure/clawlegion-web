/**
 * EasyWorkPage — Simplified task list for Easy Mode
 *
 * Shows a clean list of tasks with search and tab filtering.
 * No Kanban, no graph, no drag-and-drop.
 */
'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import { PageContainer } from '@/components/layout'
import { Plus, Search } from 'lucide-react'
import {
  SwissHeader,
  SwissTabBar,
  SwissTaskCard,
  SwissButton,
  SwissInput,
  SwissModal,
  SwissEmptyState,
} from '@/components/swiss'
import type { Task } from '@/types'

type TabId = 'all' | 'active' | 'done' | 'backlog'

const ACTIVE_STATUSES = ['in_progress', 'building', 'researching', 'planning', 'verifying']
const DONE_STATUSES = ['done', 'completed']
const BACKLOG_STATUSES = ['backlog', 'pending', 'open']

// Priority mapping for simplified creation
const PRIORITY_MAP: Record<string, string> = {
  low: 'P3',
  normal: 'P2',
  high: 'P1',
  urgent: 'P0',
}

export function EasyWorkPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState<TabId>('all')
  const [search, setSearch] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    searchParams.get('taskId')
  )
  const [showNewTask, setShowNewTask] = useState(false)

  // Task creation form state
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newPriority, setNewPriority] = useState<string>('normal')
  const [createError, setCreateError] = useState('')
  const titleRef = useRef<HTMLInputElement>(null)

  // Fetch tasks
  const { data: boardData, refetch } = useQuery({
    queryKey: ['board'],
    queryFn: () => api.get('/tasks/board').then(r => r.data),
    refetchInterval: 10000,
  })

  // Flatten all tasks from columns
  const allTasks: Task[] = (() => {
    if (!boardData?.columns) return []
    const columns = boardData.columns as Record<string, Task[]>
    return Object.values(columns).flat()
  })()

  // Filter by tab
  const tabFiltered = allTasks.filter((task) => {
    if (activeTab === 'active') return ACTIVE_STATUSES.includes(task.status)
    if (activeTab === 'done') return DONE_STATUSES.includes(task.status)
    if (activeTab === 'backlog') return BACKLOG_STATUSES.includes(task.status)
    return true
  })

  // Filter by search
  const filteredTasks = tabFiltered.filter((task) =>
    !search || task.title.toLowerCase().includes(search.toLowerCase())
  )

  // Tab counts
  const counts = {
    all: allTasks.length,
    active: allTasks.filter(t => ACTIVE_STATUSES.includes(t.status)).length,
    done: allTasks.filter(t => DONE_STATUSES.includes(t.status)).length,
    backlog: allTasks.filter(t => BACKLOG_STATUSES.includes(t.status)).length,
  }

  const tabs = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'active', label: 'Active', count: counts.active },
    { id: 'done', label: 'Done', count: counts.done },
    { id: 'backlog', label: 'Backlog', count: counts.backlog },
  ]

  // Selected task detail
  const selectedTask = selectedTaskId
    ? allTasks.find(t => t.id === selectedTaskId) ?? null
    : null

  // Keyboard shortcut: Cmd+N for new task
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        setShowNewTask(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Auto-focus title when new task modal opens
  useEffect(() => {
    if (showNewTask) {
      setTimeout(() => titleRef.current?.focus(), 100)
    }
  }, [showNewTask])

  // Fetch repos for task creation (we'll use the first one as default)
  const { data: repoData } = useQuery({
    queryKey: ['repositories'],
    queryFn: () => api.get('/task-tracking/repositories').then(r => r.data),
    staleTime: 60000,
  })

  // Create task mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const repos = repoData?.repositories ?? []
      const defaultRepoId = repos[0]?.id

      const res = await api.post('/task-tracking/tasks', {
        title: newTitle.trim(),
        description: newDescription.trim() || 'Created from Easy Mode',
        priority: PRIORITY_MAP[newPriority] ?? 'P2',
        ...(defaultRepoId ? { repositoryId: defaultRepoId } : {}),
      })
      return res.data
    },
    onSuccess: () => {
      setShowNewTask(false)
      setNewTitle('')
      setNewDescription('')
      setNewPriority('normal')
      setCreateError('')
      refetch()
      queryClient.invalidateQueries({ queryKey: ['board'] })
    },
    onError: (err: any) => {
      setCreateError(err?.response?.data?.error ?? 'Failed to create task')
    },
  })

  const handleCreateTask = () => {
    if (!newTitle.trim()) {
      setCreateError('Title is required')
      return
    }
    setCreateError('')
    createMutation.mutate()
  }

  return (
    <PageContainer>
      <div className="space-y-swiss-6">
        {/* Header */}
        <SwissHeader
          title="Work"
          subtitle={`${counts.all} tasks · ${counts.active} active`}
          actions={
            <SwissButton
              icon={<Plus size={16} />}
              onClick={() => setShowNewTask(true)}
              size="sm"
            >
              New Task
            </SwissButton>
          }
        />

        {/* Search */}
        <SwissInput
          placeholder="Search tasks..."
          icon={<Search size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search tasks"
        />

        {/* Tab bar */}
        <SwissTabBar
          items={tabs}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as TabId)}
        />

        {/* Task list */}
        <div className="space-y-swiss-2">
          {filteredTasks.length === 0 ? (
            <SwissEmptyState
              title={search ? 'No matching tasks' : 'No tasks yet'}
              description={search ? `No tasks match "${search}"` : 'Create a task to get started'}
              action={
                !search
                  ? { label: 'New Task', onClick: () => setShowNewTask(true) }
                  : undefined
              }
            />
          ) : (
            filteredTasks.map((task) => (
              <SwissTaskCard
                key={task.id}
                title={task.title}
                status={task.status}
                priority={task.priority}
                assignee={task.assignedTo ?? undefined}
                onClick={() => setSelectedTaskId(task.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      <SwissModal
        open={!!selectedTask}
        onClose={() => setSelectedTaskId(null)}
        title={selectedTask?.title}
        subtitle={selectedTask?.status ? `Status: ${selectedTask.status}` : undefined}
        size="lg"
      >
        {selectedTask && (
          <div className="space-y-swiss-4">
            {selectedTask.description && (
              <div>
                <p className="text-swiss-xs font-medium text-[var(--swiss-text-tertiary)] mb-swiss-2">
                  Description
                </p>
                <p className="text-swiss-sm text-[var(--swiss-text-secondary)]">
                  {selectedTask.description}
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-swiss-4">
              <div>
                <p className="text-swiss-xs text-[var(--swiss-text-tertiary)]">Priority</p>
                <p className="text-swiss-sm font-medium text-[var(--swiss-text-primary)]">
                  {selectedTask.priority ?? 'None'}
                </p>
              </div>
              <div>
                <p className="text-swiss-xs text-[var(--swiss-text-tertiary)]">Assigned to</p>
                <p className="text-swiss-sm font-medium text-[var(--swiss-text-primary)]">
                  {selectedTask.assignedTo ?? 'Unassigned'}
                </p>
              </div>
            </div>
          </div>
        )}
      </SwissModal>

      {/* New Task Modal */}
      <SwissModal
        open={showNewTask}
        onClose={() => {
          setShowNewTask(false)
          setCreateError('')
        }}
        title="New Task"
        size="sm"
        footer={
          <>
            <SwissButton
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowNewTask(false)
                setCreateError('')
              }}
            >
              Cancel
            </SwissButton>
            <SwissButton
              size="sm"
              onClick={handleCreateTask}
              loading={createMutation.isPending}
            >
              Create
            </SwissButton>
          </>
        }
      >
        <div className="space-y-swiss-4">
          <SwissInput
            ref={titleRef}
            label="Title"
            placeholder="What needs to be done?"
            value={newTitle}
            onChange={(e) => {
              setNewTitle(e.target.value)
              if (createError) setCreateError('')
            }}
            error={createError || undefined}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateTask()
            }}
          />
          <div>
            <label className="block text-swiss-xs font-medium text-[var(--swiss-text-tertiary)] mb-swiss-2">
              Description
            </label>
            <textarea
              placeholder="Optional details..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={3}
              className="w-full px-swiss-3 py-swiss-2 text-swiss-sm bg-[var(--swiss-surface)] border border-[var(--swiss-border)] rounded-swiss-md text-[var(--swiss-text-primary)] placeholder:text-[var(--swiss-text-muted)] focus:outline-none focus:border-[var(--swiss-accent)] transition-colors duration-swiss resize-none"
            />
          </div>
          <div>
            <p className="text-swiss-xs font-medium text-[var(--swiss-text-tertiary)] mb-swiss-2">
              Priority
            </p>
            <div className="flex gap-swiss-2">
              {(['low', 'normal', 'high', 'urgent'] as const).map((p) => (
                <label
                  key={p}
                  className={`flex items-center gap-swiss-2 px-swiss-3 py-swiss-2 rounded-swiss-sm border cursor-pointer transition-colors duration-swiss text-swiss-sm ${
                    newPriority === p
                      ? 'border-[var(--swiss-accent)] bg-[var(--swiss-accent-muted)] text-[var(--swiss-accent)]'
                      : 'border-[var(--swiss-border)] text-[var(--swiss-text-secondary)] hover:border-[var(--swiss-text-muted)]'
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={p}
                    checked={newPriority === p}
                    onChange={() => setNewPriority(p)}
                    className="sr-only"
                  />
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </label>
              ))}
            </div>
          </div>
        </div>
      </SwissModal>
    </PageContainer>
  )
}
