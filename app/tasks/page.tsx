'use client'

import { useState, useCallback, useEffect, useRef, Suspense } from 'react'
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
  Target,
  ChevronDown,
  Sparkles,
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
  TaskListSkeleton,
  KanbanViewSkeleton,
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
  const [sprintDropdownOpen, setSprintDropdownOpen] = useState(false)
  const sprintDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sprintDropdownRef.current && !sprintDropdownRef.current.contains(e.target as Node)) {
        setSprintDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)
  const queryClient = useQueryClient()
  
  // URL deep linking hooks
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Sprint filtering from URL params
  const sprintId = searchParams.get('sprintId')

  // Data fetching — pass sprintId so backend returns sprint-filtered stats
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['task-tracking-tasks', sprintId],
    queryFn: () => {
      const params = new URLSearchParams()
      if (sprintId) params.set('sprintId', sprintId)
      const qs = params.toString()
      return api.get(`/task-tracking/tasks${qs ? `?${qs}` : ''}`).then(r => r.data)
    },
    refetchInterval: 10000,
  })

  const { data: repoData } = useQuery({
    queryKey: ['task-tracking-repositories'],
    queryFn: () => api.get('/task-tracking/repositories').then(r => r.data),
  })

  const { data: sprintData } = useQuery({
    queryKey: ['active-sprint'],
    queryFn: () => api.get('/sprints/active').then(r => r.data),
  })

  const { data: allSprintsData } = useQuery({
    queryKey: ['all-sprints'],
    queryFn: () => api.get('/sprints').then(r => r.data),
  })

  const allSprints = allSprintsData?.sprints ?? []

  const allTasks: Task[] = data?.tasks ?? []
  // Filter by sprint: URL param > active sprint > all tasks
  const showAllTasks = searchParams.get('allTasks') === 'true'
  const effectiveSprintId = showAllTasks ? null : (sprintId || sprintData?.sprint?.id || null)
  const tasks: Task[] = effectiveSprintId 
    ? allTasks.filter(t => t.sprintId === effectiveSprintId) 
    : allTasks
  
  const selectedSprint = allSprints.find((s: { id: string }) => s.id === effectiveSprintId)

  const handleSprintChange = useCallback((newSprintId: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('taskId')
    if (newSprintId === null) {
      params.delete('sprintId')
      params.set('allTasks', 'true')
    } else {
      params.set('sprintId', newSprintId)
      params.delete('allTasks')
    }
    router.push(`${pathname}?${params.toString()}`)
  }, [searchParams, router, pathname])

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
      Promise.all(taskIds.map(id => api.patch(`/task-tracking/tasks/${id}/status`, { status: 'done' }))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-tracking-tasks'] })
      clearSelection()
    }
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (taskIds: string[]) => 
      Promise.all(taskIds.map(id => api.delete(`/task-tracking/tasks/${id}`))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-tracking-tasks'] })
      clearSelection()
    }
  })

  const bulkPriorityMutation = useMutation({
    mutationFn: ({ taskIds, priority }: { taskIds: string[], priority: string }) => 
      Promise.all(taskIds.map(id => api.patch(`/task-tracking/tasks/${id}`, { priority }))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-tracking-tasks'] })
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
    params.delete('tab')
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

  // Compute stats from sprint-filtered tasks (not from API which may include all tasks)
  const stats = {
    total: tasks.length,
    backlog: tasks.filter(t => t.status === 'backlog').length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    verifying: tasks.filter(t => t.status === 'verifying').length,
    done: tasks.filter(t => t.status === 'done').length,
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

      {/* Sprint Selector — Glassmorphism */}
      <div className="mb-4 relative" ref={sprintDropdownRef}>
        <button
          onClick={() => setSprintDropdownOpen(!sprintDropdownOpen)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl hover:bg-white/[0.06] transition-all duration-200 group"
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              effectiveSprintId 
                ? 'bg-purple-500/20 border border-purple-500/30' 
                : 'bg-slate-500/20 border border-slate-500/30'
            }`}>
              {effectiveSprintId 
                ? <Target className="w-4 h-4 text-purple-400" />
                : <Sparkles className="w-4 h-4 text-slate-400" />
              }
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-white">
                {selectedSprint?.name || 'All Tasks'}
              </div>
              <div className="text-xs text-slate-500">
                {tasks.length} task{tasks.length !== 1 ? 's' : ''}{selectedSprint?.status === 'active' ? ' • Active Sprint' : ''}
              </div>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${sprintDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {sprintDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border border-white/[0.08] bg-slate-900/80 backdrop-blur-2xl shadow-2xl shadow-black/40 overflow-hidden">
            {/* All Tasks option */}
            <button
              onClick={() => { handleSprintChange(null); setSprintDropdownOpen(false) }}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.06] transition-colors ${
                !effectiveSprintId ? 'bg-white/[0.04]' : ''
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-slate-500/20 border border-slate-500/20 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="text-left flex-1">
                <div className="text-sm text-white">All Tasks</div>
                <div className="text-xs text-slate-500">{allTasks.length} tasks</div>
              </div>
              {!effectiveSprintId && <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
            </button>

            <div className="h-px bg-white/[0.06] mx-3" />

            {/* Sprint options */}
            {allSprints.map((s: { id: string; name: string; status: string; taskCount?: number; progress?: number }) => (
              <button
                key={s.id}
                onClick={() => { handleSprintChange(s.id); setSprintDropdownOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.06] transition-colors ${
                  effectiveSprintId === s.id ? 'bg-white/[0.04]' : ''
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  s.status === 'active' 
                    ? 'bg-emerald-500/20 border border-emerald-500/30' 
                    : s.status === 'completed'
                    ? 'bg-blue-500/20 border border-blue-500/30'
                    : 'bg-amber-500/20 border border-amber-500/30'
                }`}>
                  <Target className={`w-3.5 h-3.5 ${
                    s.status === 'active' ? 'text-emerald-400' : s.status === 'completed' ? 'text-blue-400' : 'text-amber-400'
                  }`} />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{s.name}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{s.taskCount ?? '?'} tasks</span>
                    {s.progress !== undefined && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              s.status === 'active' ? 'bg-emerald-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${s.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-600">{s.progress}%</span>
                      </div>
                    )}
                  </div>
                </div>
                {effectiveSprintId === s.id && <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>

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
          <StatCard icon={<Clock size={20} />} label="Queued" value={(stats.backlog ?? 0) + (stats.todo ?? 0)} color="slate" />
          <StatCard icon={<Zap size={20} />} label="In Progress" value={stats.inProgress ?? 0} color="amber" />
          <StatCard icon={<CheckCircle2 size={20} />} label="Completed" value={stats.done ?? 0} color="green" />
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
        viewMode === 'kanban' ? <KanbanViewSkeleton /> : <TaskListSkeleton />
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
          initialTab={searchParams.get('tab') as 'overview' | 'timeline' | 'discussion' | 'deliverables' | undefined}
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
