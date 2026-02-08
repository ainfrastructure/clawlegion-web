'use client'

import { useState, useEffect, useCallback } from 'react'
import { Workflow } from 'lucide-react'
import type { FlowPreset, PipelineStep, FlowConfiguration, RalphLoopSettings } from '@/components/flow-config/types'
import {
  DEFAULT_PRESETS,
  DEFAULT_CHECKPOINTS,
  migrateToPipelineSteps,
  stepsToAgentConfigs,
} from '@/lib/flow-presets'
import { FlowLibrarySidebar } from '@/components/flow-builder/FlowLibrarySidebar'
import { FlowCanvas } from '@/components/flow-builder/FlowCanvas'

type ActiveFlow = {
  id: string | null
  name: string
  description: string
  steps: PipelineStep[]
  loopSettings: RalphLoopSettings
  isSystem: boolean
}

const DEFAULT_LOOP_SETTINGS: RalphLoopSettings = {
  timeBudgetHours: 4,
  maxIterations: 20,
  failThreshold: 3,
  checkpoints: DEFAULT_CHECKPOINTS.map(c => ({ ...c })),
  expansionApprovalThreshold: 60,
  roiThreshold: 40,
}

function presetToActiveFlow(preset: FlowPreset): ActiveFlow {
  return {
    id: preset.id,
    name: preset.name,
    description: preset.description,
    steps: migrateToPipelineSteps(preset.agents),
    loopSettings: preset.loopSettings
      ? { ...preset.loopSettings, checkpoints: preset.loopSettings.checkpoints.map(c => ({ ...c })) }
      : { ...DEFAULT_LOOP_SETTINGS },
    isSystem: preset.isSystem,
  }
}

function newEmptyFlow(): ActiveFlow {
  return {
    id: null,
    name: '',
    description: '',
    steps: [],
    loopSettings: { ...DEFAULT_LOOP_SETTINGS, checkpoints: DEFAULT_CHECKPOINTS.map(c => ({ ...c })) },
    isSystem: false,
  }
}

export default function FlowsPage() {
  const [userFlows, setUserFlows] = useState<FlowPreset[]>([])
  const [activeFlow, setActiveFlow] = useState<ActiveFlow>(newEmptyFlow())
  const [savedSnapshot, setSavedSnapshot] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const isDirty = JSON.stringify({
    name: activeFlow.name,
    description: activeFlow.description,
    steps: activeFlow.steps,
  }) !== savedSnapshot

  // Fetch user presets on mount
  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const response = await fetch('/api/flow-config/presets')
        if (response.ok) {
          const data = await response.json()
          const presets = (data.presets || []).filter((p: FlowPreset) => !p.isSystem)
          setUserFlows(presets)
        }
      } catch (error) {
        console.error('Failed to fetch presets:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPresets()
  }, [])

  const selectFlow = useCallback((flow: FlowPreset) => {
    const af = presetToActiveFlow(flow)
    setActiveFlow(af)
    setSavedSnapshot(JSON.stringify({
      name: af.name,
      description: af.description,
      steps: af.steps,
    }))
  }, [])

  const handleNewFlow = useCallback(() => {
    const af = newEmptyFlow()
    setActiveFlow(af)
    setSavedSnapshot('')
  }, [])

  const handleDuplicateFlow = useCallback((flow: FlowPreset) => {
    const af = presetToActiveFlow(flow)
    af.id = null
    af.name = `${flow.name} (Copy)`
    af.isSystem = false
    setActiveFlow(af)
    setSavedSnapshot('')
  }, [])

  const handleDeleteFlow = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/flow-config/presets/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setUserFlows(prev => prev.filter(f => f.id !== id))
        if (activeFlow.id === id) {
          handleNewFlow()
        }
      }
    } catch (error) {
      console.error('Failed to delete flow:', error)
    }
  }, [activeFlow.id, handleNewFlow])

  const handleSaveAsNew = useCallback(async () => {
    if (!activeFlow.name.trim()) return
    setIsSaving(true)

    const config: FlowConfiguration = {
      agents: stepsToAgentConfigs(activeFlow.steps),
      steps: activeFlow.steps,
      loopSettings: activeFlow.loopSettings,
    }

    try {
      const response = await fetch('/api/flow-config/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: activeFlow.name,
          description: activeFlow.description,
          config,
        }),
      })
      if (response.ok) {
        const saved = await response.json()
        setUserFlows(prev => [...prev, saved])
        setActiveFlow(prev => ({ ...prev, id: saved.id }))
        setSavedSnapshot(JSON.stringify({
          name: activeFlow.name,
          description: activeFlow.description,
          steps: activeFlow.steps,
        }))
      }
    } catch (error) {
      console.error('Failed to save flow:', error)
    } finally {
      setIsSaving(false)
    }
  }, [activeFlow])

  const handleSave = useCallback(async () => {
    if (!activeFlow.name.trim()) return
    setIsSaving(true)

    const config: FlowConfiguration = {
      agents: stepsToAgentConfigs(activeFlow.steps),
      steps: activeFlow.steps,
      loopSettings: activeFlow.loopSettings,
    }

    try {
      if (activeFlow.id && !activeFlow.isSystem) {
        // Update existing
        const response = await fetch(`/api/flow-config/presets/${activeFlow.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: activeFlow.name,
            description: activeFlow.description,
            config,
          }),
        })
        if (response.ok) {
          const updated = await response.json()
          setUserFlows(prev => prev.map(f => f.id === updated.id ? updated : f))
          setSavedSnapshot(JSON.stringify({
            name: activeFlow.name,
            description: activeFlow.description,
            steps: activeFlow.steps,
          }))
        }
      } else {
        // Create new
        await handleSaveAsNew()
      }
    } catch (error) {
      console.error('Failed to save flow:', error)
    } finally {
      setIsSaving(false)
    }
  }, [activeFlow, handleSaveAsNew])

  const handleReset = useCallback(() => {
    if (activeFlow.id) {
      // Re-load from the saved version
      const allFlows = [...DEFAULT_PRESETS, ...userFlows]
      const original = allFlows.find(f => f.id === activeFlow.id)
      if (original) selectFlow(original)
    } else {
      handleNewFlow()
    }
  }, [activeFlow.id, userFlows, selectFlow, handleNewFlow])

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Page header */}
      <div className="px-6 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10">
            <Workflow className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Flow Builder
            </h1>
            <p className="text-xs text-slate-500">Create and manage agent pipeline configurations</p>
          </div>
        </div>
      </div>

      {/* Main content — sidebar + canvas */}
      <div className="flex-1 flex overflow-hidden">
        <FlowLibrarySidebar
          systemPresets={DEFAULT_PRESETS}
          userFlows={userFlows}
          activeFlowId={activeFlow.id}
          isLoading={isLoading}
          onSelectFlow={selectFlow}
          onNewFlow={handleNewFlow}
          onDuplicateFlow={handleDuplicateFlow}
          onDeleteFlow={handleDeleteFlow}
        />

        <FlowCanvas
          flow={activeFlow}
          isDirty={isDirty}
          onNameChange={(name) => setActiveFlow(prev => ({ ...prev, name }))}
          onDescriptionChange={(description) => setActiveFlow(prev => ({ ...prev, description }))}
          onStepsChange={(steps) => setActiveFlow(prev => ({ ...prev, steps }))}
          onSave={handleSave}
          onSaveAsNew={handleSaveAsNew}
          onReset={handleReset}
        />
      </div>
    </div>
  )
}
