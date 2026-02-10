'use client'

import { useState, useCallback } from 'react'
import type { Task } from '@/types'

export type ViewMode = 'kanban' | 'list'

export interface TaskFilterState {
  viewMode: ViewMode
  statusFilter: string
  searchQuery: string
}

export interface TaskFilterActions {
  setViewMode: (mode: ViewMode) => void
  setStatusFilter: (status: string) => void
  setSearchQuery: (query: string) => void
}

export interface TaskColumns {
  todo: Task[]
  building: Task[]
  verifying: Task[]
  done: Task[]
}

export interface UseTaskFiltersReturn extends TaskFilterState, TaskFilterActions {
  filteredTasks: Task[]
  columns: TaskColumns
}

/**
 * Hook for managing task filtering and view state.
 * Handles search, status filtering, and Kanban column grouping.
 */
export function useTaskFilters(tasks: Task[]): UseTaskFiltersReturn {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter tasks based on status and search query
  const filteredTasks = tasks.filter(t => {
    if (statusFilter && t.status !== statusFilter) return false
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  // Group tasks for Kanban view - map statuses to columns
  const columns: TaskColumns = {
    todo: filteredTasks.filter(t => t.status === 'todo' || t.status === 'backlog' || t.status === 'queued'),
    building: filteredTasks.filter(t => ['building', 'in_progress', 'researching', 'planning', 'assigned', 'build-failed', 'research-done', 'plan-done'].includes(t.status)),
    verifying: filteredTasks.filter(t => ['verifying', 'verify-failed', 'build-done'].includes(t.status)),
    done: filteredTasks.filter(t => ['done', 'completed', 'verify-done'].includes(t.status)),
  }

  return {
    viewMode,
    setViewMode,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    filteredTasks,
    columns,
  }
}

export interface TaskSelectionState {
  selectedTasks: Set<string>
  lastSelectedIndex: number | null
}

export interface TaskSelectionActions {
  handleSelectTask: (taskId: string, index: number, shiftKey: boolean) => void
  handleSelectAll: () => void
  clearSelection: () => void
}

export interface UseTaskSelectionReturn extends TaskSelectionActions {
  selectedTasks: Set<string>
}

/**
 * Hook for managing task selection state (multi-select, shift-click range).
 */
export function useTaskSelection(filteredTasks: Task[]): UseTaskSelectionReturn {
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null)

  const handleSelectTask = useCallback((taskId: string, index: number, shiftKey: boolean) => {
    setSelectedTasks(prev => {
      const next = new Set(prev)
      
      if (shiftKey && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, index)
        const end = Math.max(lastSelectedIndex, index)
        for (let i = start; i <= end; i++) {
          if (filteredTasks[i]) {
            next.add(filteredTasks[i].id)
          }
        }
      } else {
        if (next.has(taskId)) {
          next.delete(taskId)
        } else {
          next.add(taskId)
        }
      }
      
      return next
    })
    setLastSelectedIndex(index)
  }, [lastSelectedIndex, filteredTasks])

  const handleSelectAll = useCallback(() => {
    if (selectedTasks.size === filteredTasks.length) {
      setSelectedTasks(new Set())
    } else {
      setSelectedTasks(new Set(filteredTasks.map(t => t.id)))
    }
  }, [filteredTasks, selectedTasks.size])

  const clearSelection = useCallback(() => {
    setSelectedTasks(new Set())
    setLastSelectedIndex(null)
  }, [])

  return {
    selectedTasks,
    handleSelectTask,
    handleSelectAll,
    clearSelection,
  }
}
