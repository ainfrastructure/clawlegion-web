/**
 * TaskList — Easy Mode task list view
 *
 * Simple searchable list with tab filtering.
 * No Kanban, no graph, no bulk actions.
 * Uses Swiss Design components exclusively.
 */
'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { SwissNav, SwissInput, SwissTaskCard, SwissButton, SwissEmptyState, SwissSection } from '@/components/swiss'
import { SwissModal } from '@/components/swiss/SwissModal'
import { TaskDetail } from './TaskDetail'
import { Search, Plus, ListTodo } from 'lucide-react'
import type { Task } from '@/types'

type TabId = 'all' | 'active' | 'done' | 'backlog'

const ACTIVE_STATUSES = ['in_progress', 'building', 'researching', 'planning', 'verifying', 'todo', 'assigned', 'queued']
const DONE_STATUSES = ['done', 'completed']
const BACKLOG_STATUSES = ['backlog']

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

export function TaskList() {
  const [activeTab, setActiveTab] = useState<TabId>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['task-tracking-tasks'],
    queryFn: () => api.get('/task-tracking/tasks').then(r => r.data),
    refetchInterval: 10000,
  })

  const allTasks: Task[] = data?.tasks ?? []

  // Count by category
  const counts = useMemo(() => ({
    all: allTasks.length,
    active: allTasks.filter(t => ACTIVE_STATUSES.includes(t.status)).length,
    done: allTasks.filter(t => DONE_STATUSES.includes(t.status)).length,
    backlog: allTasks.filter(t => BACKLOG_STATUSES.includes(t.status)).length,
  }), [allTasks])

  // Filter tasks by tab + search
  const filteredTasks = useMemo(() => {
    let tasks = allTasks

    // Tab filter
    switch (activeTab) {
      case 'active':
        tasks = tasks.filter(t => ACTIVE_STATUSES.includes(t.status))
        break
      case 'done':
        tasks = tasks.filter(t => DONE_STATUSES.includes(t.status))
        break
      case 'backlog':
        tasks = tasks.filter(t => BACKLOG_STATUSES.includes(t.status))
        break
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      tasks = tasks.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.shortId?.toLowerCase().includes(q) ||
        t.assignedTo?.toLowerCase().includes(q) ||
        t.assignee?.toLowerCase().includes(q)
      )
    }

    return tasks
  }, [allTasks, activeTab, searchQuery])

  const navItems = [
    { id: 'all' as const, label: 'All', count: counts.all },
    { id: 'active' as const, label: 'Active', count: counts.active },
    { id: 'done' as const, label: 'Done', count: counts.done },
    { id: 'backlog' as const, label: 'Backlog', count: counts.backlog },
  ]

  return (
    <div className="space-y-swiss-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-swiss-2xl font-semibold text-[var(--swiss-text-primary)] tracking-tight">
            Work
          </h1>
          <p className="text-swiss-sm text-[var(--swiss-text-tertiary)] mt-swiss-1">
            {counts.all} task{counts.all !== 1 ? 's' : ''} total
          </p>
        </div>
        <SwissButton
          variant="primary"
          size="md"
          icon={<Plus size={16} />}
          onClick={() => {
            // Navigate to tasks page in power mode for creation
            window.location.href = '/tasks'
          }}
        >
          New Task
        </SwissButton>
      </div>

      {/* Search */}
      <SwissInput
        placeholder="Search tasks..."
        icon={<Search size={16} />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        inputSize="md"
      />

      {/* Tab Bar */}
      <SwissNav
        items={navItems}
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as TabId)}
        fullWidth
      />

      {/* Task List */}
      <div>
        {isLoading ? (
          <div className="space-y-swiss-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-14 bg-[var(--swiss-surface-raised)] rounded-swiss-md animate-pulse" />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <SwissEmptyState
            icon={<ListTodo size={24} />}
            title={searchQuery ? 'No matching tasks' : 'No tasks here'}
            description={searchQuery ? 'Try a different search term' : 'Tasks will appear here as they are created'}
          />
        ) : (
          <div className="space-y-swiss-2">
            {filteredTasks.map(task => (
              <SwissTaskCard
                key={task.id}
                taskId={task.shortId}
                title={task.title}
                status={task.status}
                priority={task.priority}
                assignee={task.assignedTo ?? task.assignee}
                createdAt={task.createdAt ? formatDate(task.createdAt) : undefined}
                onClick={() => setSelectedTask(task)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <SwissModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          size="lg"
        >
          <TaskDetail task={selectedTask} />
        </SwissModal>
      )}
    </div>
  )
}
