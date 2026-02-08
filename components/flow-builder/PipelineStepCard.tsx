'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { PipelineStep, ResourceLevel, AgentMetadata } from '@/components/flow-config/types'
import { AGENT_METADATA, RESOURCE_LEVELS, getAgentColorClasses } from '@/lib/flow-presets'

type PipelineStepCardProps = {
  step: PipelineStep
  index: number
  isSelected: boolean
  onSelect: () => void
  onChange: (step: PipelineStep) => void
  onRemove: () => void
}

export function PipelineStepCard({
  step,
  index,
  isSelected,
  onSelect,
  onChange,
  onRemove,
}: PipelineStepCardProps) {
  const [showResourceDropdown, setShowResourceDropdown] = useState(false)
  const meta = AGENT_METADATA[step.role]
  const colors = getAgentColorClasses(meta.color)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    animationDelay: `${index * 50}ms`,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative glass-2 rounded-xl overflow-hidden
        transition-all duration-200 animate-in fade-in slide-in-from-bottom-2
        ${isDragging ? 'z-50 scale-[1.02] shadow-2xl opacity-90' : ''}
        ${isSelected ? 'ring-2 ring-cyan-500/40' : 'hover:border-white/[0.1]'}
        ${!step.enabled ? 'opacity-50' : ''}
      `}
    >
      {/* Color accent left border */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${colors.bg}`} />

      <div className="flex items-center gap-3 px-4 py-3 pl-5">
        {/* Drag handle */}
        <button
          className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300 transition-colors touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Order number */}
        <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${colors.bg} text-white`}>
          {index + 1}
        </div>

        {/* Agent info — clickable to select */}
        <button
          onClick={onSelect}
          className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
        >
          <span className="text-lg">{meta.emoji}</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-100 truncate">{meta.name}</p>
            <p className="text-xs text-slate-500 truncate">{meta.description}</p>
          </div>
        </button>

        {/* Resource level dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowResourceDropdown(!showResourceDropdown)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium
                       bg-white/[0.04] border border-white/[0.06] text-slate-300
                       hover:border-white/[0.1] transition-colors"
          >
            {step.resourceLevel}
            <ChevronDown className="w-3 h-3" />
          </button>
          {showResourceDropdown && (
            <div className="absolute right-0 top-full mt-1 z-50 w-36 glass-3 rounded-lg overflow-hidden shadow-xl">
              {RESOURCE_LEVELS.map(level => (
                <button
                  key={level.value}
                  onClick={() => {
                    onChange({ ...step, resourceLevel: level.value })
                    setShowResourceDropdown(false)
                  }}
                  className={`w-full px-3 py-2 text-left text-xs transition-colors
                    ${step.resourceLevel === level.value ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-300 hover:bg-white/[0.06]'}
                  `}
                >
                  <p className="font-medium">{level.label}</p>
                  <p className="text-slate-500 text-[10px]">{level.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Enable/disable toggle */}
        <button
          onClick={() => onChange({ ...step, enabled: !step.enabled })}
          className={`relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0
            ${step.enabled ? 'bg-cyan-500' : 'bg-slate-600'}
          `}
        >
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200
            ${step.enabled ? 'translate-x-[18px]' : 'translate-x-0.5'}
          `} />
        </button>

        {/* Remove button */}
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
