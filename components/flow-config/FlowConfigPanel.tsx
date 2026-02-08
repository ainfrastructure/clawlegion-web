'use client'

import { useState, useEffect, useCallback } from 'react'
import { PresetSelector, AgentFlowBuilder } from './AgentFlowBuilder'
import { RalphLoopSettings } from './RalphLoopSettings'
import { LaunchControls, ConfigPreviewModal, SaveTemplateModal } from './LaunchControls'
import {
  DEFAULT_PRESETS,
  DEFAULT_CONFIG,
  applyPreset,
  cloneConfig,
  configMatchesPreset,
  detectPreset,
  ensureSteps
} from '@/lib/flow-presets'
import type { 
  FlowConfigPanelProps, 
  FlowConfiguration, 
  FlowPreset,
  AgentConfig,
  RalphLoopSettings as RalphLoopSettingsType 
} from './types'

interface FlowConfigPanelState {
  config: FlowConfiguration
  userPresets: FlowPreset[]
  selectedPresetId?: string
  isDirty: boolean
  showPreviewModal: boolean
  showSaveModal: boolean
  isLoading: boolean
  isSaving: boolean
}

export function FlowConfigPanel({ 
  config: initialConfig, 
  onChange, 
  onLaunch, 
  onSaveTemplate,
  isWizardMode = false 
}: FlowConfigPanelProps) {
  const [state, setState] = useState<FlowConfigPanelState>(() => {
    // Auto-migrate old format to include steps field
    const config = initialConfig ? ensureSteps(initialConfig) : cloneConfig(DEFAULT_CONFIG)
    return {
      config,
      userPresets: [],
      selectedPresetId: initialConfig?.presetId || 'standard',
      isDirty: false,
      showPreviewModal: false,
      showSaveModal: false,
      isLoading: true,
      isSaving: false,
    }
  })

  // Fetch user presets on mount
  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const response = await fetch('/api/flow-config/presets')
        if (response.ok) {
          const data = await response.json()
          const userPresets = data.presets.filter((p: FlowPreset) => !p.isSystem)
          setState(prev => ({ ...prev, userPresets, isLoading: false }))
        }
      } catch (error) {
        console.error('Failed to fetch presets:', error)
      } finally {
        setState(prev => ({ ...prev, isLoading: false }))
      }
    }
    fetchPresets()
  }, [])

  // Update parent when config changes
  useEffect(() => {
    onChange(state.config)
  }, [state.config, onChange])

  // Check if current config matches selected preset
  const checkIfDirty = useCallback((config: FlowConfiguration, presetId?: string) => {
    if (!presetId) return false
    
    const allPresets = [...DEFAULT_PRESETS, ...state.userPresets]
    const preset = allPresets.find(p => p.id === presetId)
    
    if (!preset) return true
    return !configMatchesPreset(config, preset)
  }, [state.userPresets])

  // Handle preset selection
  const handlePresetChange = (preset: FlowPreset) => {
    const newConfig = applyPreset(preset)
    setState(prev => ({
      ...prev,
      config: newConfig,
      selectedPresetId: preset.id,
      isDirty: false,
    }))
  }

  // Handle agent changes
  const handleAgentsChange = (agents: AgentConfig[]) => {
    const newConfig = { ...state.config, agents }
    const isDirty = checkIfDirty(newConfig, state.selectedPresetId)
    
    setState(prev => ({
      ...prev,
      config: newConfig,
      isDirty,
    }))
  }

  // Handle loop settings changes
  const handleLoopSettingsChange = (loopSettings: RalphLoopSettingsType) => {
    const newConfig = { ...state.config, loopSettings }
    const isDirty = checkIfDirty(newConfig, state.selectedPresetId)
    
    setState(prev => ({
      ...prev,
      config: newConfig,
      isDirty,
    }))
  }

  // Handle preview
  const handlePreview = () => {
    setState(prev => ({ ...prev, showPreviewModal: true }))
  }

  // Handle save template
  const handleSaveTemplateClick = () => {
    setState(prev => ({ ...prev, showSaveModal: true }))
  }

  const handleSaveTemplate = async (name: string, description: string) => {
    setState(prev => ({ ...prev, isSaving: true }))
    
    try {
      const response = await fetch('/api/flow-config/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          config: state.config,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save template')
      }

      const savedPreset = await response.json()
      
      // Add to user presets and select it
      setState(prev => ({
        ...prev,
        userPresets: [...prev.userPresets, savedPreset],
        selectedPresetId: savedPreset.id,
        isDirty: false,
        showSaveModal: false,
        isSaving: false,
      }))

      // Notify parent if callback provided
      if (onSaveTemplate) {
        onSaveTemplate(name, description)
      }
    } catch (error) {
      setState(prev => ({ ...prev, isSaving: false }))
      throw error
    }
  }

  // Handle launch
  const handleLaunch = () => {
    if (onLaunch) {
      onLaunch()
    }
  }

  const allPresets = [...DEFAULT_PRESETS, ...state.userPresets]

  return (
    <div className="space-y-6">
      {/* Preset Selector */}
      <PresetSelector
        presets={allPresets}
        selectedId={state.selectedPresetId}
        onChange={handlePresetChange}
        isCustomized={state.isDirty}
      />

      {/* Agent Flow Builder */}
      <AgentFlowBuilder
        agents={state.config.agents}
        onChange={handleAgentsChange}
      />

      {/* ClawLegion Loop Settings */}
      <RalphLoopSettings
        settings={state.config.loopSettings}
        onChange={handleLoopSettingsChange}
      />

      {/* Launch Controls */}
      <LaunchControls
        onPreview={handlePreview}
        onSaveTemplate={handleSaveTemplateClick}
        onLaunch={handleLaunch}
        isWizardMode={isWizardMode}
        isDirty={state.isDirty}
      />

      {/* Modals */}
      <ConfigPreviewModal
        isOpen={state.showPreviewModal}
        onClose={() => setState(prev => ({ ...prev, showPreviewModal: false }))}
        config={state.config}
      />

      <SaveTemplateModal
        isOpen={state.showSaveModal}
        onClose={() => setState(prev => ({ ...prev, showSaveModal: false }))}
        onSave={handleSaveTemplate}
      />
    </div>
  )
}

export default FlowConfigPanel
