'use client'

import { useState, useCallback, useMemo } from 'react'
import { Save, Copy, RotateCcw, Layers } from 'lucide-react'
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  BackgroundVariant,
  type NodeMouseHandler,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { PipelineStep, AgentRole, RalphLoopSettings as RalphLoopSettingsType } from '@/components/flow-config/types'
import { AgentPalette } from './AgentPalette'
import { FlowPropertiesPanel } from './FlowPropertiesPanel'
import { FlowAgentNode } from './FlowAgentNode'
import { FlowEdge } from './FlowEdge'
import { useFlowLayout } from './useFlowLayout'

const nodeTypes = { flowAgent: FlowAgentNode }
const edgeTypes = { flow: FlowEdge }

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

  const handleRemoveStep = useCallback((id: string) => {
    const remaining = flow.steps.filter(s => s.id !== id)
    const reordered = remaining
      .sort((a, b) => a.order - b.order)
      .map((s, i) => ({ ...s, order: i }))
    onStepsChange(reordered)
    if (selectedStepId === id) setSelectedStepId(null)
  }, [flow.steps, onStepsChange, selectedStepId])

  const handleMoveStep = useCallback((id: string, direction: 'up' | 'down') => {
    const sorted = [...flow.steps].sort((a, b) => a.order - b.order)
    const idx = sorted.findIndex(s => s.id === id)
    if (idx < 0) return
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= sorted.length) return

    const reordered = [...sorted]
    const [moved] = reordered.splice(idx, 1)
    reordered.splice(targetIdx, 0, moved)
    onStepsChange(reordered.map((s, i) => ({ ...s, order: i })))
  }, [flow.steps, onStepsChange])

  const { nodes, edges } = useFlowLayout(flow.steps)

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedStepId(prev => prev === node.id ? null : node.id)
  }, [])

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedStepId) {
      handleRemoveStep(selectedStepId)
    }
  }, [selectedStepId, handleRemoveStep])

  const proOptions = useMemo(() => ({ hideAttribution: true }), [])

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

        {/* React Flow canvas */}
        <div
          className="flex-1 relative min-h-[300px]"
          onKeyDown={onKeyDown}
          tabIndex={-1}
          style={{
            backgroundImage: 'radial-gradient(circle, rgb(255 255 255 / 0.03) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          {flow.steps.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl glass-2 flex items-center justify-center mb-4">
                <Layers className="w-7 h-7 text-slate-500" />
              </div>
              <p className="text-slate-400 font-medium mb-1">No agents in pipeline</p>
              <p className="text-sm text-slate-600 max-w-xs">
                Add agents from the palette above to build your pipeline
              </p>
            </div>
          ) : (
            <ReactFlowProvider>
              <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  onNodeClick={onNodeClick}
                  nodesConnectable={false}
                  nodesDraggable={false}
                  fitView
                  fitViewOptions={{ padding: 0.3 }}
                  proOptions={proOptions}
                  minZoom={0.3}
                  maxZoom={1.5}
                >
                  <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgb(255 255 255 / 0.04)" />
                  <Controls showInteractive={false} />
                </ReactFlow>
              </div>
            </ReactFlowProvider>
          )}
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
          totalSteps={flow.steps.length}
          onChange={handleStepChange}
          onRemove={() => handleRemoveStep(selectedStep.id)}
          onMoveUp={() => handleMoveStep(selectedStep.id, 'up')}
          onMoveDown={() => handleMoveStep(selectedStep.id, 'down')}
          onClose={() => setSelectedStepId(null)}
        />
      )}
    </div>
  )
}
