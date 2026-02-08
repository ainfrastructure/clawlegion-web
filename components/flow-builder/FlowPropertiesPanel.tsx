'use client'

import { X, Zap, Gauge, Shield } from 'lucide-react'
import type { PipelineStep, ResourceLevel } from '@/components/flow-config/types'
import { AGENT_METADATA, RESOURCE_LEVELS, getAgentColorClasses } from '@/lib/flow-presets'

type FlowPropertiesPanelProps = {
  step: PipelineStep
  onChange: (step: PipelineStep) => void
  onClose: () => void
}

const RESOURCE_ICONS: Record<ResourceLevel, React.ReactNode> = {
  high: <Zap className="w-4 h-4" />,
  medium: <Gauge className="w-4 h-4" />,
  low: <Shield className="w-4 h-4" />,
  local: <Shield className="w-4 h-4" />,
}

export function FlowPropertiesPanel({ step, onChange, onClose }: FlowPropertiesPanelProps) {
  const meta = AGENT_METADATA[step.role]
  const colors = getAgentColorClasses(meta.color)

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
        {/* Agent info */}
        <div className="flex items-start gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colors.bgLight}`}>
            {meta.emoji}
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-100">{meta.name}</h4>
            <p className="text-xs text-slate-400 mt-0.5 capitalize">{meta.tier}</p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{meta.description}</p>
          </div>
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
      </div>
    </div>
  )
}
