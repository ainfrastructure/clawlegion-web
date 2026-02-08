'use client'

import { useState, useCallback } from 'react'
import { Save, Copy, RotateCcw } from 'lucide-react'
import type { PipelineStep, AgentRole, FlowPreset, RalphLoopSettings as RalphLoopSettingsType } from '@/components/flow-config/types'
import { AGENT_METADATA, DEFAULT_CHECKPOINTS } from '@/lib/flow-presets'
import { AgentPalette } from './AgentPalette'
import { PipelineBuilder } from './PipelineBuilder'
import { FlowPropertiesPanel } from './FlowPropertiesPanel'

type FlowCanvasProps = {
  flow: {
    id: string | null
    name: string
    description: string
    steps: PipelineStep[]
    loopSettings: RalphLoopSettingsType
    isSystem: boolean
  }
  isDirty: boolean
  onNameChange: (name: string) => void
  onDescriptionChange: (description: string) => void
  onStepsChange: (steps: PipelineStep[]) => void
  onSave: () => void
  onSaveAsNew: () => void
  onReset: () => void
}

export function FlowCanvas({
  flow,
  isDirty,
  onNameChange,
  onDescriptionChange,
  onStepsChange,
  onSave,
  onSaveAsNew,
  onReset,
}: FlowCanvasProps) {
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null)

  const selectedStep = flow.steps.find(s => s.id === selectedStepId) || null

  const handleAddAgent = useCallback((role: AgentRole) => {
    const newStep: PipelineStep = {
      id: crypto.randomUUID(),
      role,
      enabled: true,
      resourceLevel: 'medium',
      order: flow.steps.length,
    }
    onStepsChange([...flow.steps, newStep])
  }, [flow.steps, onStepsChange])

  const handleStepChange = useCallback((updated: PipelineStep) => {
    onStepsChange(flow.steps.map(s => s.id === updated.id ? updated : s))
  }, [flow.steps, onStepsChange])

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      {/* Main canvas area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Canvas header — name & description */}
        <div className="p-6 pb-0">
          <input
            type="text"
            value={flow.name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Flow name..."
            disabled={flow.isSystem}
            className="w-full bg-transparent text-2xl font-extrabold text-slate-100 placeholder:text-slate-600
                       focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <textarea
            value={flow.description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Describe what this flow does..."
            disabled={flow.isSystem}
            rows={1}
            className="w-full bg-transparent text-sm text-slate-400 placeholder:text-slate-600
                       mt-1 resize-none focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        {/* Agent palette */}
        <div className="px-6 py-4">
          <AgentPalette
            onAddAgent={handleAddAgent}
            currentStepCount={flow.steps.length}
          />
        </div>

        {/* Pipeline builder — scrollable area with dot grid bg */}
        <div className="flex-1 overflow-y-auto px-6 pb-6"
          style={{
            backgroundImage: 'radial-gradient(circle, rgb(255 255 255 / 0.03) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          <div className="max-w-2xl mx-auto">
            <PipelineBuilder
              steps={flow.steps}
              selectedStepId={selectedStepId}
              onSelectStep={setSelectedStepId}
              onStepsChange={onStepsChange}
            />
          </div>
        </div>

        {/* Action bar */}
        <div className="glass-3 border-t border-white/[0.06] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isDirty && (
              <span className="text-xs text-amber-400 font-medium">Unsaved changes</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isDirty && (
              <button
                onClick={onReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                           text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
            <button
              onClick={onSaveAsNew}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                         text-slate-300 border border-white/[0.06] hover:border-white/[0.1]
                         hover:bg-white/[0.04] transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              Save As New
            </button>
            <button
              onClick={onSave}
              disabled={!isDirty || flow.isSystem}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold
                         bg-cyan-500 text-white hover:bg-cyan-400
                         disabled:opacity-40 disabled:cursor-not-allowed
                         transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Properties panel (slides in when step selected) */}
      {selectedStep && (
        <FlowPropertiesPanel
          step={selectedStep}
          onChange={handleStepChange}
          onClose={() => setSelectedStepId(null)}
        />
      )}
    </div>
  )
}
