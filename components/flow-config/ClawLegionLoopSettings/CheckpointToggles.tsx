'use client'

import { Flag } from 'lucide-react'
import type { CheckpointTogglesProps, Checkpoint } from '../types'

export function CheckpointToggles({ checkpoints, onChange }: CheckpointTogglesProps) {
  const handleToggle = (percentage: Checkpoint['percentage']) => {
    const updated = checkpoints.map(cp => 
      cp.percentage === percentage ? { ...cp, enabled: !cp.enabled } : cp
    )
    onChange(updated)
  }

  const enabledCount = checkpoints.filter(cp => cp.enabled).length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <Flag className="w-4 h-4 text-emerald-400" />
          Progress Checkpoints
        </label>
        <span className="text-xs text-slate-500">
          {enabledCount} of {checkpoints.length} enabled
        </span>
      </div>

      <p className="text-xs text-slate-500">
        Pause and review progress at these milestones
      </p>

      {/* Checkpoint Progress Bar */}
      <div className="relative h-8 bg-slate-700/50 rounded-lg overflow-hidden">
        {/* Progress Track */}
        <div className="absolute inset-y-0 left-0 right-0 flex">
          {/* Sections */}
          <div className="w-1/4 border-r border-slate-600" />
          <div className="w-1/4 border-r border-slate-600" />
          <div className="w-1/4 border-r border-slate-600" />
          <div className="w-1/4" />
        </div>

        {/* Checkpoint Markers */}
        {checkpoints.map((checkpoint) => {
          const position = checkpoint.percentage
          return (
            <button
              key={checkpoint.percentage}
              type="button"
              onClick={() => handleToggle(checkpoint.percentage)}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 group"
              style={{ left: `${position}%` }}
            >
              <div 
                className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center
                  transition-all duration-200 cursor-pointer
                  ${checkpoint.enabled 
                    ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/30' 
                    : 'bg-slate-600 border-slate-500 text-slate-400 hover:border-slate-400'}
                `}
              >
                {checkpoint.enabled ? (
                  <Flag className="w-3 h-3" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                )}
              </div>
              
              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800
                border border-white/[0.06] rounded text-xs text-slate-300 whitespace-nowrap
                opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
                {checkpoint.percentage}% checkpoint
              </div>
            </button>
          )
        })}

        {/* Labels below */}
        <div className="absolute -bottom-5 left-0 right-0 flex justify-between px-4">
          <span className="text-[10px] text-slate-500">Start</span>
          <span className="text-[10px] text-slate-500">Finish</span>
        </div>
      </div>

      {/* Toggle Buttons */}
      <div className="flex gap-2 pt-4">
        {checkpoints.map((checkpoint) => (
          <button
            key={checkpoint.percentage}
            type="button"
            onClick={() => handleToggle(checkpoint.percentage)}
            className={`
              flex-1 px-3 py-2 rounded-lg text-sm font-medium
              transition-all duration-200 border
              ${checkpoint.enabled 
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'}
            `}
          >
            {checkpoint.percentage}%
          </button>
        ))}
      </div>
    </div>
  )
}

export default CheckpointToggles
