'use client'

import { useState } from 'react'
import { ChevronDown, Calendar, Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

interface Sprint {
  id: string
  name: string
  startDate: string
  endDate: string
  status: 'active' | 'completed' | 'planned'
  progress: number
  taskCount: number
  completedCount: number
}

interface SprintSelectorProps {
  sprints: Sprint[]
  activeSprint?: string
  onSelect: (sprintId: string) => void
  onCreateNew?: () => void
  className?: string
}

const statusConfig = {
  active: { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  completed: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/20' },
  planned: { icon: Calendar, color: 'text-slate-400', bg: 'bg-slate-500/20' },
}

export function SprintSelector({
  sprints,
  activeSprint,
  onSelect,
  onCreateNew,
  className = ''
}: SprintSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const currentSprint = sprints.find(s => s.id === activeSprint)

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    return `${startDate.toLocaleDateString('en-US', opts)} - ${endDate.toLocaleDateString('en-US', opts)}`
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-white/[0.06] rounded-lg transition-colors min-w-[280px]"
      >
        {currentSprint ? (
          <>
            <div className={`p-1.5 rounded ${statusConfig[currentSprint.status].bg}`}>
              {(() => {
                const Icon = statusConfig[currentSprint.status].icon
                return <Icon className={`w-4 h-4 ${statusConfig[currentSprint.status].color}`} />
              })()}
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-white">{currentSprint.name}</div>
              <div className="text-xs text-slate-500">
                {formatDateRange(currentSprint.startDate, currentSprint.endDate)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-slate-300">{currentSprint.progress}%</div>
              <div className="text-xs text-slate-500">
                {currentSprint.completedCount}/{currentSprint.taskCount}
              </div>
            </div>
          </>
        ) : (
          <span className="text-slate-400">Select sprint...</span>
        )}
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-white/[0.06] rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="max-h-64 overflow-y-auto">
              {sprints.map((sprint) => {
                const StatusIcon = statusConfig[sprint.status].icon
                return (
                  <button
                    key={sprint.id}
                    onClick={() => {
                      onSelect(sprint.id)
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors ${
                      sprint.id === activeSprint ? 'bg-slate-700/50' : ''
                    }`}
                  >
                    <div className={`p-1.5 rounded ${statusConfig[sprint.status].bg}`}>
                      <StatusIcon className={`w-4 h-4 ${statusConfig[sprint.status].color}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{sprint.name}</div>
                      <div className="text-xs text-slate-500">
                        {formatDateRange(sprint.startDate, sprint.endDate)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">{sprint.progress}%</div>
                      <div className="text-xs text-slate-500">
                        {sprint.completedCount}/{sprint.taskCount} tasks
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {onCreateNew && (
              <button
                onClick={() => {
                  onCreateNew()
                  setIsOpen(false)
                }}
                className="w-full flex items-center gap-2 px-4 py-3 border-t border-white/[0.06] text-blue-400 hover:bg-slate-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create new sprint
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
