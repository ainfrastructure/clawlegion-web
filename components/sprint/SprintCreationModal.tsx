'use client'

import { useState } from 'react'
import { X, Loader2, Calendar, Target } from 'lucide-react'
import { useCreateSprint } from '@/hooks/useSprints'

interface SprintCreationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SprintCreationModal({ isOpen, onClose }: SprintCreationModalProps) {
  const createSprint = useCreateSprint()

  // Default: start today, end in 2 weeks
  const today = new Date().toISOString().split('T')[0]
  const twoWeeks = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [name, setName] = useState('')
  const [goal, setGoal] = useState('')
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(twoWeeks)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !startDate || !endDate) return

    try {
      await createSprint.mutateAsync({ name: name.trim(), goal: goal.trim() || undefined, startDate, endDate })
      setName('')
      setGoal('')
      onClose()
    } catch {
      // error is available via createSprint.error
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 glass-2 rounded-2xl border border-white/[0.08] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            Create Sprint
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/[0.08] rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Sprint Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sprint 12 — Auth Overhaul"
              className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/30"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Goal (optional)</label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="What do we want to accomplish this sprint?"
              rows={3}
              className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/30 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/30"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/30"
                required
              />
            </div>
          </div>

          {createSprint.isError && (
            <p className="text-sm text-red-400">
              {(createSprint.error as Error)?.message || 'Failed to create sprint'}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createSprint.isPending || !name.trim()}
              className="px-5 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg flex items-center gap-2 transition-colors"
            >
              {createSprint.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Sprint
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
