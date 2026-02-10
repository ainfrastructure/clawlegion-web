'use client'

import { useState } from 'react'
import {
  Clock,
  CheckCircle2,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  MoreVertical,
  Zap,
  Square,
  CheckSquare,
  MinusSquare,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import { AgentAvatar } from '@/components/agents'
import { ALL_AGENTS } from '@/components/chat-v2/agentConfig'
import type { Task } from '@/types'
import type { TaskColumns } from './useTaskFilters'

// Helper functions for time formatting
function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return mins + 'm ago'
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return hrs + 'h ago'
  return Math.floor(hrs / 24) + 'd ago'
}

function formatDuration(start: string, end: string): string {
  const diff = new Date(end).getTime() - new Date(start).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return mins + 'm'
  const hrs = Math.floor(mins / 60)
  const remainMins = mins % 60
  return hrs + 'h ' + remainMins + 'm'
}

// Build agent color lookup map
const agentColorMap: Record<string, string> = {}
ALL_AGENTS.forEach(a => {
  agentColorMap[a.id] = a.color
})

// Derive agent from workflow step when assignee is not set
function deriveAgentFromStep(step: string | null | undefined): string {
  if (!step) return ''
  const s = step.toLowerCase()
  if (s.includes('build')) return 'vulcan'
  if (s.includes('verify')) return 'janus'
  if (s.includes('research')) return 'minerva'
  if (s.includes('plan')) return 'athena'
  if (s.includes('review')) return 'janus'
  if (s.includes('create') || s.includes('draft')) return 'mercury'
  if (s.includes('execute')) return 'cato'
  if (s.includes('synthesize')) return 'athena'
  return ''
}

// Get fallback border color based on task status
function getStatusBorderColor(status: string | undefined): string {
  const s = status || ''
  if (s === 'todo' || s === 'planned' || s === 'backlog' || s === 'queued') return '#3b82f6' // blue
  if (s === 'building' || s === 'in_progress' || s === 'in_research' || s === 'assigned' || s === 'researching' || s === 'planning') return '#f59e0b' // amber
  if (s === 'verifying') return '#06b6d4' // cyan
  if (s === 'done' || s === 'completed') return '#22c55e' // green
  return '#64748b' // slate fallback
}

// ============================================
// Kanban View - horizontal scroll on mobile
// ============================================

interface KanbanViewProps {
  columns: TaskColumns
  selectedTasks: Set<string>
  onSelectTask: (id: string, index: number, shiftKey: boolean) => void
  onTaskClick: (task: Task) => void
  filteredTasks: Task[]
}

export function KanbanView({ 
  columns, 
  selectedTasks, 
  onSelectTask,
  onTaskClick,
  filteredTasks 
}: KanbanViewProps) {
  const columnConfig = [
    { key: 'todo' as const, label: 'Todo', color: 'blue', icon: <Clock size={16} /> },
    { key: 'building' as const, label: 'Building', color: 'amber', icon: <Zap size={16} /> },
    { key: 'verifying' as const, label: 'Verifying', color: 'cyan', icon: <CheckCircle2 size={16} /> },
    { key: 'done' as const, label: 'Done', color: 'green', icon: <CheckCircle2 size={16} /> },
  ]
  
  return (
    <>
      {/* Mobile: Stacked columns for better UX */}
      <div className="block sm:hidden space-y-4">
        {columnConfig.map(({ key, label, color, icon }) => (
          <div key={key} className="bg-slate-800/30 rounded-xl border border-white/[0.06]">
            <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-${color}-400`}>{icon}</span>
                <span className="font-medium text-white text-base">{label}</span>
              </div>
              <span className="px-2.5 py-1 bg-slate-700 rounded-md text-sm text-slate-300">
                {columns[key]?.length ?? 0}
              </span>
            </div>
            <div className="p-3 space-y-3 max-h-[300px] overflow-y-auto">
              {columns[key]?.slice(0, 20).map((task) => {
                const globalIndex = filteredTasks.findIndex(t => t.id === task.id)
                return (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    isSelected={selectedTasks.has(task.id)}
                    onSelect={(shiftKey) => onSelectTask(task.id, globalIndex, shiftKey)}
                    onClick={() => onTaskClick(task)}
                  />
                )
              })}
              {columns[key]?.length === 0 && (
                <div className="text-center text-slate-500 py-6 text-sm">No tasks</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tablet/Desktop: Grid layout with better breakpoints */}
      <div className="hidden sm:block">
        <div className="overflow-x-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 min-w-[640px] h-[calc(100vh-360px)] md:h-[calc(100vh-320px)]">
            {columnConfig.map(({ key, label, color, icon }) => (
              <div key={key} className="bg-slate-800/30 rounded-xl border border-white/[0.06] flex flex-col min-w-[200px]">
                <div className="p-3 md:p-4 border-b border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-${color}-400`}>{icon}</span>
                    <span className="font-medium text-white text-sm md:text-base">{label}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-700 rounded text-xs md:text-sm text-slate-300">
                    {columns[key]?.length ?? 0}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {columns[key]?.slice(0, 20).map((task) => {
                    const globalIndex = filteredTasks.findIndex(t => t.id === task.id)
                    return (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        isSelected={selectedTasks.has(task.id)}
                        onSelect={(shiftKey) => onSelectTask(task.id, globalIndex, shiftKey)}
                        onClick={() => onTaskClick(task)}
                      />
                    )
                  })}
                  {columns[key]?.length === 0 && (
                    <div className="text-center text-slate-500 py-8 text-sm">No tasks</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

// ============================================
// List View - cards on mobile, table on desktop
// ============================================

interface ListViewProps {
  tasks: Task[]
  selectedTasks: Set<string>
  onSelectTask: (id: string, index: number, shiftKey: boolean) => void
  onSelectAll: () => void
  onTaskClick: (task: Task) => void
}

export function ListView({ 
  tasks, 
  selectedTasks, 
  onSelectTask,
  onSelectAll,
  onTaskClick 
}: ListViewProps) {
  const allSelected = tasks.length > 0 && selectedTasks.size === tasks.length
  const someSelected = selectedTasks.size > 0 && selectedTasks.size < tasks.length
  
  return (
    <>
      {/* Mobile: Card view */}
      <div className="sm:hidden space-y-3">
        <button 
          onClick={onSelectAll}
          className="w-full p-3 bg-slate-800 rounded-lg flex items-center gap-3 text-sm"
        >
          {allSelected ? (
            <CheckSquare size={18} className="text-amber-400" />
          ) : someSelected ? (
            <MinusSquare size={18} className="text-amber-400" />
          ) : (
            <Square size={18} className="text-slate-500" />
          )}
          <span className="text-slate-300">{allSelected ? 'Deselect all' : 'Select all'}</span>
        </button>
        
        {tasks.slice(0, 50).map((task, index) => (
          <MobileTaskCard 
            key={task.id} 
            task={task} 
            isSelected={selectedTasks.has(task.id)}
            onSelect={(shiftKey) => onSelectTask(task.id, index, shiftKey)}
            onClick={() => onTaskClick(task)}
          />
        ))}
      </div>
      
      {/* Desktop: Table view */}
      <div className="hidden sm:block glass-2 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-900/50">
            <tr className="text-left text-slate-400 text-sm">
              <th className="px-4 py-4">
                <button 
                  onClick={onSelectAll}
                  className="p-1 hover:bg-slate-700 rounded transition-colors"
                >
                  {allSelected ? (
                    <CheckSquare size={18} className="text-amber-400" />
                  ) : someSelected ? (
                    <MinusSquare size={18} className="text-amber-400" />
                  ) : (
                    <Square size={18} className="text-slate-500" />
                  )}
                </button>
              </th>
              <th className="px-4 py-4 font-medium">Task</th>
              <th className="px-4 py-4 font-medium">Priority</th>
              <th className="px-4 py-4 font-medium">Status</th>
              <th className="px-4 py-4 font-medium">Assigned</th>
              <th className="px-4 py-4 font-medium">Created</th>
              <th className="px-4 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {tasks.slice(0, 50).map((task, index) => (
              <TaskRow 
                key={task.id} 
                task={task} 
                isSelected={selectedTasks.has(task.id)}
                onSelect={(shiftKey) => onSelectTask(task.id, index, shiftKey)}
                onClick={() => onTaskClick(task)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ============================================
// Task Card Components
// ============================================

const priorityConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  P0: { icon: <ArrowUp size={12} />, color: 'text-red-400', bg: 'bg-red-500/20' },
  P1: { icon: <ArrowUp size={12} />, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  P2: { icon: <ArrowRight size={12} />, color: 'text-amber-400', bg: 'bg-amber-500/20' },
  P3: { icon: <ArrowDown size={12} />, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  high: { icon: <ArrowUp size={12} />, color: 'text-red-400', bg: 'bg-red-500/20' },
  medium: { icon: <ArrowRight size={12} />, color: 'text-amber-400', bg: 'bg-amber-500/20' },
  low: { icon: <ArrowDown size={12} />, color: 'text-blue-400', bg: 'bg-blue-500/20' },
}

const statusConfig: Record<string, { color: string; bg: string }> = {
  todo: { color: 'text-slate-400', bg: 'bg-slate-500/20' },
  queued: { color: 'text-slate-400', bg: 'bg-slate-500/20' },
  assigned: { color: 'text-amber-400', bg: 'bg-amber-500/20' },
  in_progress: { color: 'text-amber-400', bg: 'bg-amber-500/20' },
  researching: { color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  planning: { color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  building: { color: 'text-orange-400', bg: 'bg-orange-500/20' },
  verifying: { color: 'text-sky-400', bg: 'bg-sky-500/20' },
  'research-done': { color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  'plan-done': { color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  'build-done': { color: 'text-orange-400', bg: 'bg-orange-500/20' },
  'verify-done': { color: 'text-green-400', bg: 'bg-green-500/20' },
  'build-failed': { color: 'text-red-400', bg: 'bg-red-500/20' },
  'verify-failed': { color: 'text-red-400', bg: 'bg-red-500/20' },
  done: { color: 'text-green-400', bg: 'bg-green-500/20' },
  completed: { color: 'text-green-400', bg: 'bg-green-500/20' },
}

interface TaskCardProps {
  task: Task
  isSelected: boolean
  onSelect: (shiftKey: boolean) => void
  onClick: () => void
}

function TaskCard({ task, isSelected, onSelect, onClick }: TaskCardProps) {
  const prio = priorityConfig[task.priority] ?? priorityConfig.P2
  const subtasks = task.subtasks || []
  const subtaskDone = subtasks.filter(s => s.status === 'done' || s.status === 'completed').length
  const subtaskTotal = subtasks.length
  
  // Get agent color for border (with workflow step fallback)
  const agentId = task.assignee || task.assignedTo || deriveAgentFromStep(task.currentWorkflowStep)
  const agentColor = agentColorMap[agentId]
  const fallbackBorderColor = getStatusBorderColor(task.status)
  
  return (
    <div
      className={`group bg-slate-900/50 rounded-lg p-4 border transition-all duration-200 cursor-pointer touch-manipulation ${
        isSelected
          ? 'border-amber-500 bg-amber-500/10 shadow-lg'
          : 'border-white/[0.06] hover:border-slate-600 active:border-slate-500'
      }`}
      style={{
        borderLeftColor: agentColor || fallbackBorderColor,
        borderLeftWidth: '3px',
      }}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return
        onClick()
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Checkbox: visible on hover or when selected */}
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(e.shiftKey) }}
            className={`mt-0.5 flex-shrink-0 w-5 h-5 flex items-center justify-center rounded transition-all duration-150 ${
              isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            aria-label={isSelected ? 'Deselect task' : 'Select task'}
          >
            {isSelected ? (
              <CheckSquare size={16} className="text-amber-400" />
            ) : (
              <Square size={16} className="text-slate-500" />
            )}
          </button>
          <span className="text-sm text-white font-medium line-clamp-2 leading-relaxed">{task.title}</span>
        </div>
        <div className={`${prio.color} flex-shrink-0 mt-1`}>{prio.icon}</div>
      </div>
      {/* Subtask progress chip */}
      {subtaskTotal > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 rounded-full text-xs text-slate-400">
            <span>{subtaskDone}/{subtaskTotal} subtasks</span>
            <div className="w-14 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${subtaskTotal > 0 ? (subtaskDone / subtaskTotal) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Workflow step badge */}
      {task.currentWorkflowStep && task.currentWorkflowStep !== 'pending' && task.currentWorkflowStep !== 'done' && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span
            className="px-2 py-1 rounded-md text-[11px] uppercase tracking-wide font-medium"
            style={{
              backgroundColor: agentColor ? `${agentColor}20` : 'rgba(96,165,250,0.15)',
              color: agentColor || '#93c5fd',
            }}
          >
            {task.currentWorkflowStep}
          </span>
        </div>
      )}
      
      {/* Agent assignment with timestamp */}
      {agentId && (
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <AgentAvatar agentId={agentId} size="xs" />
          <span className="capitalize">{agentId}</span>
          {/* Timestamp for active tasks */}
          {task.startedAt && (task.status !== 'done' && task.status !== 'verifying') && (
            <span className="text-[10px] text-slate-500">
              · started {formatTimeAgo(task.startedAt)}
            </span>
          )}
          {/* Timestamp for verifying tasks */}
          {task.status === 'verifying' && (task.submittedAt || task.startedAt) && (
            <span className="text-[10px] text-slate-500">
              · verifying {formatTimeAgo(task.submittedAt || task.startedAt!)}
            </span>
          )}
          {/* Completion time for done tasks */}
          {task.status === 'done' && task.verifiedAt && (
            <span className="text-[10px] text-slate-500">
              · completed {formatTimeAgo(task.verifiedAt)}
            </span>
          )}
          {/* Duration for done tasks */}
          {task.status === 'done' && task.startedAt && task.verifiedAt && (
            <span className="text-[10px] text-emerald-400/70">
              took {formatDuration(task.startedAt, task.verifiedAt)}
            </span>
          )}
        </div>
      )}
      
      {task.tags && task.tags.length > 0 && (
        <div className="mt-3 flex gap-1.5 flex-wrap">
          {task.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="px-2 py-1 bg-slate-800 rounded-md text-xs text-slate-400">{tag}</span>
          ))}
        </div>
      )}
    </div>
  )
}

function MobileTaskCard({ task, isSelected, onSelect, onClick }: TaskCardProps) {
  const prio = priorityConfig[task.priority] ?? priorityConfig.P2
  const status = statusConfig[task.status] ?? statusConfig.queued
  
  // Get agent color for border (with workflow step fallback)
  const agentId = task.assignee || task.assignedTo || deriveAgentFromStep(task.currentWorkflowStep)
  const agentColor = agentColorMap[agentId]
  const fallbackBorderColor = getStatusBorderColor(task.status)
  
  return (
    <div 
      className={`bg-slate-800/50 rounded-xl border p-5 transition-all duration-200 cursor-pointer touch-manipulation ${
        isSelected ? 'border-amber-500 bg-amber-500/10 shadow-lg transform scale-[0.98]' : 'border-white/[0.06] active:transform active:scale-[0.98]'
      }`}
      style={{
        borderLeftColor: agentColor || fallbackBorderColor,
        borderLeftWidth: '4px',
      }}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return
        onClick()
      }}
    >
      <div className="flex items-start gap-4">
        <button 
          onClick={(e) => { e.stopPropagation(); onSelect(e.shiftKey) }}
          className="mt-1 flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center -m-2 rounded-lg hover:bg-slate-700/50 active:bg-slate-700/70 transition-colors"
          aria-label={isSelected ? 'Deselect task' : 'Select task'}
        >
          {isSelected ? (
            <CheckSquare size={22} className="text-amber-400" />
          ) : (
            <Square size={22} className="text-slate-500" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium mb-3 text-base leading-relaxed">{task.title}</h3>
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${prio.bg} ${prio.color}`}>
              {prio.icon} {task.priority}
            </span>
            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${status.bg} ${status.color}`}>
              {task.status?.replace('_', ' ')}
            </span>
          </div>
          {agentId && (
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
              <AgentAvatar agentId={agentId} size="sm" />
              <span className="font-medium">{agentId}</span>
              {/* Timestamp for active tasks */}
              {task.startedAt && (task.status === 'in_progress' || task.status === 'building') && (
                <span className="text-xs text-slate-500">
                  · started {formatTimeAgo(task.startedAt)}
                </span>
              )}
              {/* Timestamp for verifying tasks */}
              {task.status === 'verifying' && (task.submittedAt || task.startedAt) && (
                <span className="text-xs text-slate-500">
                  · verifying {formatTimeAgo(task.submittedAt || task.startedAt!)}
                </span>
              )}
              {/* Completion time for done tasks */}
              {task.status === 'done' && task.verifiedAt && (
                <span className="text-xs text-slate-500">
                  · completed {formatTimeAgo(task.verifiedAt)}
                </span>
              )}
            </div>
          )}
          {/* Duration for done tasks */}
          {task.status === 'done' && task.startedAt && task.verifiedAt && (
            <div className="mt-2 text-sm">
              <span className="text-emerald-400/70 font-medium">
                took {formatDuration(task.startedAt, task.verifiedAt)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TaskRow({ task, isSelected, onSelect, onClick }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false)
  const prio = priorityConfig[task.priority] ?? priorityConfig.P2
  const status = statusConfig[task.status] ?? statusConfig.queued
  const subtasks = task.subtasks || []
  const hasSubtasks = subtasks.length > 0
  // Derive agent from workflow step as fallback
  const derivedAgent = task.assignee || task.assignedTo || deriveAgentFromStep(task.currentWorkflowStep)

  return (
    <>
      <tr
        className={`transition-colors cursor-pointer ${
          isSelected ? 'bg-amber-500/10' : 'hover:bg-slate-800/50'
        }`}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('button')) return
          onClick()
        }}
      >
        <td className="px-4 py-4">
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(e.shiftKey) }}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
          >
            {isSelected ? (
              <CheckSquare size={18} className="text-amber-400" />
            ) : (
              <Square size={18} className="text-slate-500" />
            )}
          </button>
        </td>
        <td className="px-4 py-4">
          <div className="flex items-center gap-2">
            {hasSubtasks && (
              <button
                onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
                className="p-0.5 hover:bg-slate-700 rounded transition-colors flex-shrink-0"
              >
                {expanded ? (
                  <ChevronDown size={14} className="text-slate-400" />
                ) : (
                  <ChevronRight size={14} className="text-slate-400" />
                )}
              </button>
            )}
            <span className="text-white font-medium">{task.title}</span>
            {hasSubtasks && (
              <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded-full">
                {subtasks.filter(s => s.status === 'done' || s.status === 'completed').length}/{subtasks.length}
              </span>
            )}
          </div>
        </td>
        <td className="px-4 py-4">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${prio.bg} ${prio.color}`}>
            {prio.icon} {task.priority}
          </span>
        </td>
        <td className="px-4 py-4">
          <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${status.bg} ${status.color}`}>
            {task.status?.replace('_', ' ')}
          </span>
        </td>
        <td className="px-4 py-4">
          {derivedAgent ? (
            <div className="flex items-center gap-2">
              <AgentAvatar agentId={derivedAgent} size="sm" />
              <span className="text-slate-300">{derivedAgent}</span>
            </div>
          ) : (
            <span className="text-slate-500">-</span>
          )}
        </td>
        <td className="px-4 py-4 text-slate-400 text-sm">
          {new Date(task.createdAt).toLocaleDateString()}
        </td>
        <td className="px-4 py-4">
          <button
            className="p-2 hover:bg-slate-700 rounded"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical size={16} className="text-slate-400" />
          </button>
        </td>
      </tr>
      {/* Expanded subtask rows */}
      {expanded && subtasks.map((sub) => {
        const subPrio = priorityConfig[sub.priority] ?? priorityConfig.P2
        const subStatus = statusConfig[sub.status] ?? statusConfig.queued
        return (
          <tr key={sub.id} className="bg-slate-900/30 hover:bg-slate-800/40 transition-colors cursor-pointer">
            <td className="px-4 py-2" />
            <td className="px-4 py-2 pl-12">
              <span className="text-sm text-slate-400">{sub.title}</span>
            </td>
            <td className="px-4 py-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${subPrio.bg} ${subPrio.color}`}>
                {subPrio.icon} {sub.priority}
              </span>
            </td>
            <td className="px-4 py-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${subStatus.bg} ${subStatus.color}`}>
                {sub.status?.replace('_', ' ')}
              </span>
            </td>
            <td className="px-4 py-2">
              {sub.assignee ? (
                <span className="text-xs text-slate-400">@{sub.assignee}</span>
              ) : (
                <span className="text-slate-500 text-xs">-</span>
              )}
            </td>
            <td className="px-4 py-2" />
            <td className="px-4 py-2" />
          </tr>
        )
      })}
    </>
  )
}
