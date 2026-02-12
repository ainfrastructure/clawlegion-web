'use client'

import { useState, useRef, useEffect } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import type { PriorityLevel } from '@/components/tasks/config'

interface EasyModeTaskFormProps {
  onSubmit: (data: { title: string; description: string; priority: PriorityLevel }) => void
  isPending: boolean
  error: string | null
}

const PRIORITY_OPTIONS: { value: PriorityLevel; label: string; description: string }[] = [
  { value: 'P3', label: 'Low', description: 'When you get to it' },
  { value: 'P2', label: 'Normal', description: 'Standard priority' },
  { value: 'P1', label: 'High', description: 'Needs attention soon' },
  { value: 'P0', label: 'Urgent', description: 'Drop everything' },
]

/**
 * Simplified 3-field task creation form for Easy Mode.
 * Title (required), Description (optional), Priority (radio).
 */
export function EasyModeTaskForm({ onSubmit, isPending, error }: EasyModeTaskFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<PriorityLevel>('P2')
  const titleRef = useRef<HTMLInputElement>(null)

  // Auto-focus title on mount
  useEffect(() => {
    // Small delay to allow modal animation
    const timer = setTimeout(() => {
      titleRef.current?.focus()
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({ title: title.trim(), description: description.trim(), priority })
  }

  const isValid = title.trim().length > 0

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Title */}
        <div>
          <label
            htmlFor="easy-task-title"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            What do you need?
          </label>
          <input
            ref={titleRef}
            id="easy-task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Build a contact form for the website"
            maxLength={200}
            className="w-full px-4 py-3 rounded-lg border border-slate-600 bg-slate-700 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
            autoComplete="off"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="easy-task-description"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            Any details?{' '}
            <span className="text-slate-500 font-normal">(optional)</span>
          </label>
          <textarea
            id="easy-task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Should include name, email, message fields..."
            rows={4}
            maxLength={2000}
            className="w-full px-4 py-3 rounded-lg border border-slate-600 bg-slate-700 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none transition-colors"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
        </div>

        {/* Priority */}
        <fieldset>
          <legend className="block text-sm font-medium text-slate-300 mb-3">
            Priority
          </legend>
          <div className="grid grid-cols-4 gap-2">
            {PRIORITY_OPTIONS.map((opt) => {
              const isSelected = priority === opt.value
              return (
                <label
                  key={opt.value}
                  className={`
                    relative flex flex-col items-center gap-1 py-3 px-2 rounded-lg border cursor-pointer transition-all
                    ${
                      isSelected
                        ? opt.value === 'P0'
                          ? 'border-red-500/50 bg-red-500/10 text-red-300'
                          : opt.value === 'P1'
                          ? 'border-orange-500/50 bg-orange-500/10 text-orange-300'
                          : opt.value === 'P2'
                          ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                          : 'border-slate-500/50 bg-slate-500/10 text-slate-300'
                        : 'border-slate-600 bg-slate-800/50 text-slate-400 hover:border-slate-500 hover:bg-slate-700/50'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="easy-priority"
                    value={opt.value}
                    checked={isSelected}
                    onChange={() => setPriority(opt.value)}
                    className="sr-only"
                    aria-label={`${opt.label} priority`}
                  />
                  <span className="text-sm font-medium">{opt.label}</span>
                  {isSelected && (
                    <span className="text-[10px] opacity-70">{opt.description}</span>
                  )}
                </label>
              )
            })}
          </div>
        </fieldset>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm" role="alert">
            {error}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-white/[0.06] space-y-3">
        <button
          type="submit"
          disabled={!isValid || isPending}
          className="w-full px-5 py-3 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Create Task
            </>
          )}
        </button>
        <p className="text-xs text-center text-slate-500">
          The agents will handle the rest — research, plan, build, and verify.
        </p>
      </div>
    </form>
  )
}
