'use client'

import { useState } from 'react'
import { SprintProgress, SprintCreationModal, SprintCompletionModal } from '@/components/sprint'
import { TaskQueuePanel } from '@/components/tasks'
import { ActivityTimeline } from '@/components/activity'
import { QuickStats } from '@/components/widgets'
import Link from 'next/link'
import {
  ArrowLeft, Plus, CheckCircle2, Clock, Target,
  Calendar, Loader2,
} from 'lucide-react'
import { useSprints, useActiveSprint, useStartSprint } from '@/hooks/useSprints'
import type { Sprint } from '@/types'

export default function SprintPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [sprintToComplete, setSprintToComplete] = useState<Sprint | null>(null)
  const { data: sprints, isLoading } = useSprints()
  const { data: activeSprint } = useActiveSprint()
  const startSprint = useStartSprint()

  const planningSprints = sprints?.filter((s) => s.status === 'planning') || []
  const completedSprints = sprints?.filter((s) => s.status === 'completed') || []

  return (
    <div className="min-h-screen bg-slate-900 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Sprints</h1>
            <p className="text-slate-400 text-sm">
              {activeSprint ? `Active: ${activeSprint.name}` : 'No active sprint'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Sprint
        </button>
      </div>

      {/* Active Sprint Progress */}
      <div className="mb-6">
        <SprintProgress />
      </div>

      {/* Active sprint actions */}
      {activeSprint && (
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setSprintToComplete(activeSprint)}
            className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Complete Sprint
          </button>
          <Link
            href={`/tasks${activeSprint ? `?sprintId=${activeSprint.id}` : ''}`}
            className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.06] rounded-lg text-sm transition-colors"
          >
            View Board
          </Link>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mb-6">
        <QuickStats />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Planning Sprints */}
          {planningSprints.length > 0 && (
            <div className="glass-2 rounded-xl p-4">
              <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                Planned Sprints
              </h2>
              <div className="space-y-2">
                {planningSprints.map((sprint) => (
                  <div key={sprint.id} className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/[0.06] rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">{sprint.name}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(sprint.startDate).toLocaleDateString()} — {new Date(sprint.endDate).toLocaleDateString()}
                        {sprint.taskCount > 0 && ` | ${sprint.taskCount} tasks`}
                      </p>
                    </div>
                    <button
                      onClick={() => startSprint.mutate(sprint.id)}
                      disabled={!!activeSprint || startSprint.isPending}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      {startSprint.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Target className="w-3 h-3" />}
                      Start
                    </button>
                  </div>
                ))}
              </div>
              {startSprint.isError && (
                <p className="text-xs text-red-400 mt-2">{(startSprint.error as Error)?.message}</p>
              )}
            </div>
          )}

          {/* Task Queue */}
          <TaskQueuePanel maxItems={8} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Completed Sprints */}
          {completedSprints.length > 0 && (
            <div className="glass-2 rounded-xl p-4">
              <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                Completed Sprints
              </h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {completedSprints.map((sprint) => (
                  <div key={sprint.id} className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/[0.06] rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-slate-300">{sprint.name}</p>
                      <p className="text-xs text-slate-500">
                        {sprint.completedCount}/{sprint.taskCount} tasks | {sprint.progress}% done
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded">
                      Completed
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Timeline */}
          <ActivityTimeline />
        </div>
      </div>

      {isLoading && (
        <div className="mt-6 text-center">
          <Loader2 className="w-6 h-6 text-slate-500 animate-spin mx-auto" />
        </div>
      )}

      {/* Modals */}
      <SprintCreationModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      {sprintToComplete && (
        <SprintCompletionModal
          sprint={sprintToComplete}
          isOpen={!!sprintToComplete}
          onClose={() => setSprintToComplete(null)}
        />
      )}
    </div>
  )
}
