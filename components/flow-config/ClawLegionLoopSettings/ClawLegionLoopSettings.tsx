'use client'

import { useState } from 'react'
import { ChevronDown, Settings2 } from 'lucide-react'
import { TimeBudgetSlider } from './TimeBudgetSlider'
import { CheckpointToggles } from './CheckpointToggles'
import { ThresholdInputs } from './ThresholdInputs'
import type { ClawLegionLoopSettingsProps, ClawLegionLoopSettings as ClawLegionLoopSettingsType } from '../types'

export function ClawLegionLoopSettings({ settings, onChange }: ClawLegionLoopSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const handleTimeBudgetChange = (timeBudgetHours: number) => {
    onChange({ ...settings, timeBudgetHours })
  }

  const handleCheckpointChange = (checkpoints: ClawLegionLoopSettingsType['checkpoints']) => {
    onChange({ ...settings, checkpoints })
  }

  const handleThresholdChange = (values: {
    failThreshold?: number
    expansionApprovalThreshold?: number
    roiThreshold?: number
    maxIterations?: number
  }) => {
    onChange({ ...settings, ...values })
  }

  return (
    <div className="border border-white/[0.06] rounded-xl overflow-hidden">
      {/* Header - Clickable to collapse */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Settings2 className="w-5 h-5 text-slate-400" />
          <div className="text-left">
            <h3 className="font-semibold text-slate-100">Orchestrator Loop Settings</h3>
            <p className="text-xs text-slate-400">
              Time budget, iterations, and safety thresholds
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Quick Summary when collapsed */}
          {!isExpanded && (
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span>{settings.timeBudgetHours}h</span>
              <span>{settings.maxIterations} iterations</span>
              <span>{settings.checkpoints.filter(c => c.enabled).length} checkpoints</span>
            </div>
          )}
          <ChevronDown 
            className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Content */}
      <div 
        className={`
          transition-all duration-300 ease-in-out overflow-hidden
          ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="p-4 space-y-6 border-t border-white/[0.06]">
          {/* Time Budget */}
          <TimeBudgetSlider 
            value={settings.timeBudgetHours} 
            onChange={handleTimeBudgetChange} 
          />

          <div className="border-t border-white/[0.06]" />

          {/* Checkpoints */}
          <CheckpointToggles 
            checkpoints={settings.checkpoints} 
            onChange={handleCheckpointChange} 
          />

          <div className="border-t border-white/[0.06]" />

          {/* Thresholds */}
          <ThresholdInputs
            failThreshold={settings.failThreshold}
            expansionApprovalThreshold={settings.expansionApprovalThreshold}
            roiThreshold={settings.roiThreshold}
            maxIterations={settings.maxIterations}
            onChange={handleThresholdChange}
          />
        </div>
      </div>
    </div>
  )
}

export default ClawLegionLoopSettings
