'use client'

import {
  Search,
  RefreshCw,
  LayoutGrid,
  List,
} from 'lucide-react'
import { ExportButton } from '@/components/ExportButton'
import type { ViewMode } from './useTaskFilters'
import type { Task } from '@/types'

interface TaskFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onRefresh: () => void
  filteredTasks: Task[]
}

/**
 * Task filter controls - search input, view mode toggle, export button.
 */
export function TaskFilters({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onRefresh,
  filteredTasks,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-white/[0.06] rounded-lg text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none text-sm"
        />
      </div>
      
      <div className="flex gap-2 sm:gap-3">
        {/* View Toggle */}
        <div className="flex bg-slate-800 rounded-lg p-1 flex-1 sm:flex-none">
          <button
            onClick={() => onViewModeChange('kanban')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded text-xs sm:text-sm transition-colors flex items-center justify-center gap-1 ${viewMode === 'kanban' ? 'bg-amber-600 text-white' : 'text-slate-400'}`}
          >
            <LayoutGrid size={14} /> Kanban
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded text-xs sm:text-sm transition-colors flex items-center justify-center gap-1 ${viewMode === 'list' ? 'bg-amber-600 text-white' : 'text-slate-400'}`}
          >
            <List size={14} /> List
          </button>
        </div>
        
        <ExportButton
          data={filteredTasks as unknown as Record<string, unknown>[]}
          filename="tasks"
          flattenKeys={['tags']}
          columns={['id', 'title', 'priority', 'status', 'createdBy', 'createdAt', 'assignedTo', 'tags']}
          allowColumnSelection
        />
        
        <button onClick={onRefresh} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg">
          <RefreshCw size={18} className="text-slate-400" />
        </button>
      </div>
    </div>
  )
}
