'use client'

import Image from 'next/image'
import { X, Zap, Gauge, Shield, Trash2, ChevronUp, ChevronDown, Bot } from 'lucide-react'
import type { PipelineStep, ResourceLevel } from '@/components/flow-config/types'
import { AGENT_METADATA, RESOURCE_LEVELS, getAgentColorClasses } from '@/lib/flow-presets'
import { getAgentById } from '@/components/chat-v2/agentConfig'

type FlowPropertiesPanelProps = {
  step: PipelineStep
  totalSteps: number
  onChange: (step: PipelineStep) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onClose: () => void
}

const RESOURCE_ICONS: Record<ResourceLevel, React.ReactNode> = {
  high: <Zap className="w-4 h-4" />,
  medium: <Gauge className="w-4 h-4" />,
  low: <Shield className="w-4 h-4" />,
  local: <Shield className="w-4 h-4" />,
}

export function FlowPropertiesPanel({ step, totalSteps, onChange, onRemove, onMoveUp, onMoveDown, onClose }: FlowPropertiesPanelProps) {
  const meta = AGENT_METADATA[step.role]
  const colors = getAgentColorClasses(meta.color)
  const agent = getAgentById(step.role)
  const avatarSrc = agent?.avatar
  const agentColor = agent?.color || '#64748b'

  return (
    <div className="w-80 glass-1 border-l border-white/[0.06] h-full overflow-y-auto animate-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-slate-200">Step Properties</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Agent info with avatar */}
        <div className="flex items-start gap-3">
          <div
            className="relative w-14 h-14 rounded-xl overflow-hidden ring-2 ring-offset-1 ring-offset-slate-900 flex-shrink-0"
            style={{ ['--tw-ring-color' as string]: agentColor }}
          >
            {avatarSrc ? (
              <Image
                src={avatarSrc}
                alt={meta.name}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${colors.bgLight}`}>
                <Bot className="w-6 h-6 text-slate-500" />
              </div>
            )}
          </div>
          <div>
            <h4 className="text-base font-bold" style={{ color: agentColor }}>{meta.name}</h4>
            <p className="text-xs text-slate-400 mt-0.5 capitalize">{meta.tier}</p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{meta.description}</p>
          </div>
        </div>

        {/* Reorder + Remove */}
        <div className="flex items-center gap-2">
          <button
            onClick={onMoveUp}
            disabled={step.order === 0}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium
                       glass-2 text-slate-300 hover:text-white hover:bg-white/[0.08]
                       disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronUp className="w-3.5 h-3.5" />
            Up
          </button>
          <button
            onClick={onMoveDown}
            disabled={step.order >= totalSteps - 1}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium
                       glass-2 text-slate-300 hover:text-white hover:bg-white/[0.08]
                       disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronDown className="w-3.5 h-3.5" />
            Down
          </button>
          <div className="flex-1" />
          <button
            onClick={onRemove}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium
                       text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Remove
          </button>
        </div>

        {/* Enable/disable */}
        <div className="flex items-center justify-between glass-2 rounded-xl px-4 py-3">
          <div>
            <p className="text-sm font-medium text-slate-200">Enabled</p>
            <p className="text-xs text-slate-500">Include in pipeline execution</p>
          </div>
          <button
            onClick={() => onChange({ ...step, enabled: !step.enabled })}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200
              ${step.enabled ? 'bg-cyan-500' : 'bg-slate-600'}
            `}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200
              ${step.enabled ? 'translate-x-[22px]' : 'translate-x-0.5'}
            `} />
          </button>
        </div>

        {/* Resource level — visual radio */}
        <div>
          <p className="text-sm font-medium text-slate-200 mb-3">Resource Level</p>
          <div className="space-y-2">
            {RESOURCE_LEVELS.map(level => (
              <button
                key={level.value}
                onClick={() => onChange({ ...step, resourceLevel: level.value })}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                  ${step.resourceLevel === level.value
                    ? 'glass-3 border border-cyan-500/30 ring-1 ring-cyan-500/20'
                    : 'glass-2 hover:border-white/[0.1]'
                  }
                `}
              >
                <div className={`p-1.5 rounded-lg ${step.resourceLevel === level.value ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-500 bg-white/[0.04]'}`}>
                  {RESOURCE_ICONS[level.value]}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${step.resourceLevel === level.value ? 'text-cyan-300' : 'text-slate-300'}`}>
                    {level.label}
                  </p>
                  <p className="text-xs text-slate-500">{level.description}</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors
                  ${step.resourceLevel === level.value ? 'border-cyan-500' : 'border-slate-600'}
                `}>
                  {step.resourceLevel === level.value && (
                    <div className="w-2 h-2 rounded-full bg-cyan-500" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Agent Instructions (context) */}
        <div>
          <p className="text-sm font-medium text-slate-200 mb-1">Agent Instructions</p>
          <p className="text-xs text-slate-500 mb-3">Custom context for this agent in this flow</p>
          <textarea
            value={step.context || ''}
            onChange={(e) => onChange({ ...step, context: e.target.value || undefined })}
            placeholder="e.g., Focus on performance optimization..."
            rows={4}
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5
                       text-sm text-slate-300 placeholder:text-slate-600
                       focus:outline-none focus:border-cyan-500/30 focus:ring-1 focus:ring-cyan-500/20
                       resize-none transition-colors"
          />
        </div>
      </div>
    </div>
  )
}
