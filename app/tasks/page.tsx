'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { PageContainer } from '@/components/layout'
import {
  ListTodo,
  Plus,
  Clock,
  CheckCircle2,
  Zap,
  LayoutGrid,
} from 'lucide-react'
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal'
import { EnhancedTaskModal } from '@/components/tasks/EnhancedTaskModal'
import type { Task } from '@/types'

// Local components
import {
  TaskErrorBoundary,
  TaskFilters,
  KanbanView,
  ListView,
  StatCard,
  BulkActionsBar,
  useTaskFilters,
  useTaskSelection,
} from './components'

// ============================================
// TASKS PAGE - Mobile Responsive
// ============================================

export default function TasksPage() {
  return (
    <Suspense fallback={
      <PageContainer>
        <div className="text-center text-slate-400 py-12">Loading tasks...</div>
      </PageContainer>
    }>
      <TasksPageContent />
    </Suspense>
  )
}

function TasksPageContent() {
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<Task | null>(null)
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)
  const queryClient = useQueryClient()
  
  // URL deep linking hooks
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Data fetching
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['task-tracking-tasks'],
    queryFn: () => api.get('/task-tracking/tasks').then(r => r.data),
    refetchInterval: 10000,
  })

  const { data: repoData } = useQuery({
    queryKey: ['task-tracking-repositories'],
    queryFn: () => api.get('/task-tracking/repositories').then(r => r.data),
  })

  const tasks: Task[] = data?.tasks ?? []

  // Filter and selection hooks
  const {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    filteredTasks,
    columns,
  } = useTaskFilters(tasks)

  const {
    selectedTasks,
    handleSelectTask,
    handleSelectAll,
    clearSelection,
  } = useTaskSelection(filteredTasks)

  // Bulk action mutations
  const bulkCompleteMutation = useMutation({
    mutationFn: (taskIds: string[]) => 
      Promise.all(taskIds.map(id => api.patch(`/tasks/${id}`, { status: 'completed' }))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-queue'] })
      clearSelection()
    }
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (taskIds: string[]) => 
      Promise.all(taskIds.map(id => api.delete(`/tasks/${id}`))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-queue'] })
      clearSelection()
    }
  })

  const bulkPriorityMutation = useMutation({
    mutationFn: ({ taskIds, priority }: { taskIds: string[], priority: string }) => 
      Promise.all(taskIds.map(id => api.patch(`/tasks/${id}`, { priority }))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-queue'] })
    }
  })

  // Handle URL deep linking - sync modal state with URL
  useEffect(() => {
    const taskIdFromUrl = searchParams.get('taskId')
    
    if (taskIdFromUrl && tasks.length > 0) {
      if (!selectedTaskForModal || selectedTaskForModal.id !== taskIdFromUrl) {
        const taskFromUrl = tasks.find(t => t.id === taskIdFromUrl)
        if (taskFromUrl) {
          setSelectedTaskForModal(taskFromUrl)
        }
      }
    } else if (!taskIdFromUrl && selectedTaskForModal) {
      setSelectedTaskForModal(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, tasks])

  // Modal handlers with URL sync
  const openTaskModal = useCallback((task: Task) => {
    setSelectedTaskForModal(task)
    const params = new URLSearchParams(searchParams.toString())
    params.set('taskId', task.id)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [searchParams, router, pathname])

  const closeTaskModal = useCallback(() => {
    setSelectedTaskForModal(null)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('taskId')
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.push(newUrl, { scroll: false })
  }, [searchParams, router, pathname])

  // Bulk action handlers
  const handleBulkComplete = () => {
    if (selectedTasks.size > 0) {
      bulkCompleteMutation.mutate(Array.from(selectedTasks))
    }
  }

  const handleBulkDelete = () => {
    if (selectedTasks.size > 0 && confirm(`Delete ${selectedTasks.size} task(s)?`)) {
      bulkDeleteMutation.mutate(Array.from(selectedTasks))
    }
  }

  const handleBulkPriority = (priority: string) => {
    if (selectedTasks.size > 0) {
      bulkPriorityMutation.mutate({ taskIds: Array.from(selectedTasks), priority })
    }
  }

  // Stats from API or calculated
  const stats = data?.stats ?? {
    total: tasks.length,
    backlog: columns.todo.length,
    inProgress: columns.building.length,
    verifying: columns.verifying.length,
    completed: columns.done.length,
  }

  return (
    <PageContainer>
      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedTasks.size}
        onComplete={handleBulkComplete}
        onDelete={handleBulkDelete}
        onPriorityChange={handleBulkPriority}
        onClear={clearSelection}
        isCompletePending={bulkCompleteMutation.isPending}
        isDeletePending={bulkDeleteMutation.isPending}
      />

      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
              <ListTodo className="text-amber-400" size={28} /> Task Queue
            </h1>
            <p className="text-sm text-slate-400">{tasks.length} tasks total</p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button 
              onClick={() => setShowNewTaskModal(true)}
              type="button"
              data-testid="btn-add-task" 
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
            >
              <Plus size={18} /> Add Task
            </button>
            <Link href="/tasks/graph" className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm">
              <LayoutGrid size={18} /> Graph
            </Link>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <StatCard icon={<Clock size={20} />} label="Queued" value={stats.backlog ?? 0} color="slate" />
          <StatCard icon={<Zap size={20} />} label="In Progress" value={stats.inProgress ?? 0} color="amber" />
          <StatCard icon={<CheckCircle2 size={20} />} label="Completed" value={stats.completed ?? 0} color="green" />
          <StatCard icon={<CheckCircle2 size={20} />} label="Verifying" value={stats.verifying ?? 0} color="blue" />
        </div>

        {/* Filters */}
        <TaskFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onRefresh={() => refetch()}
          filteredTasks={filteredTasks}
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center text-slate-400 py-12">Loading tasks...</div>
      ) : viewMode === 'kanban' ? (
        <KanbanView 
          columns={columns} 
          selectedTasks={selectedTasks}
          onSelectTask={handleSelectTask}
          onTaskClick={openTaskModal}
          filteredTasks={filteredTasks}
        />
      ) : (
        <ListView 
          tasks={filteredTasks} 
          selectedTasks={selectedTasks}
          onSelectTask={handleSelectTask}
          onSelectAll={handleSelectAll}
          onTaskClick={openTaskModal}
        />
      )}

      {/* Task Detail Modal */}
      {selectedTaskForModal && (
        <TaskDetailModal
          taskId={selectedTaskForModal.id}
          task={selectedTaskForModal}
          isOpen={!!selectedTaskForModal}
          onClose={closeTaskModal}
        />
      )}

      {/* New Task Modal */}
      <TaskErrorBoundary>
        <EnhancedTaskModal
          isOpen={showNewTaskModal}
          onClose={() => setShowNewTaskModal(false)}
          onTaskCreated={() => {
            setShowNewTaskModal(false)
            refetch()
          }}
          repositories={repoData?.repositories ?? []}
        />
      </TaskErrorBoundary>
    </PageContainer>
  )
}
