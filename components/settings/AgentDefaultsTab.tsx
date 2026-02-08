'use client'

import { useState, useEffect } from 'react'
import { useSystemSettings, useUpdateSystemSettings } from '@/hooks/useSystemSettings'
import type { AgentDefaultsConfig } from '@/hooks/useSystemSettings'
import { Bot, ShieldAlert, Clock, Brain, Save, RotateCcw } from 'lucide-react'

function NumberInput({
  label,
  description,
  value,
  onChange,
  min,
  max,
  unit,
  defaultValue,
}: {
  label: string
  description: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  unit?: string
  defaultValue: number
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white">{label}</div>
        <div className="text-xs text-slate-500 mt-0.5">{description}</div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10)
            if (!isNaN(v) && v >= min && v <= max) onChange(v)
          }}
          min={min}
          max={max}
          className="w-20 px-3 py-1.5 bg-slate-800/50 border border-white/[0.06] rounded-lg text-white text-sm text-right focus:outline-none focus:border-blue-500/50 transition-colors"
        />
        {unit && <span className="text-xs text-slate-500 w-12">{unit}</span>}
        <span className="text-xs text-slate-600 hidden sm:inline">Default: {defaultValue}</span>
      </div>
    </div>
  )
}

export function AgentDefaultsTab() {
  const { data: settings } = useSystemSettings()
  const updateSettings = useUpdateSystemSettings()

  const [local, setLocal] = useState<AgentDefaultsConfig | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  const defaults: AgentDefaultsConfig = {
    maxConsecutiveFailures: 3,
    maxTotalFailures: 10,
    taskTimeoutMinutes: 60,
    maxThinkingTokens: 3000,
    maxRetries: 3,
    retryDelaySeconds: 5,
  }

  useEffect(() => {
    if (settings?.agentDefaults && !local) {
      setLocal(settings.agentDefaults)
    }
  }, [settings, local])

  const config = local || settings?.agentDefaults || defaults

  const update = (key: keyof AgentDefaultsConfig, value: number) => {
    const updated = { ...config, [key]: value }
    setLocal(updated)
    setHasChanges(true)
  }

  const handleSave = () => {
    if (local) {
      updateSettings.mutate({ agentDefaults: local }, {
        onSuccess: () => setHasChanges(false),
      })
    }
  }

  const handleReset = () => {
    setLocal(defaults)
    setHasChanges(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
          <Bot className="text-purple-400" /> Agent Defaults
        </h2>
        <div className="flex gap-2">
          {hasChanges && (
            <>
              <button
                onClick={handleReset}
                className="px-3 py-2 glass-2 hover:bg-white/[0.06] rounded-lg text-sm text-slate-400 flex items-center gap-2 transition-colors"
              >
                <RotateCcw size={14} /> Reset
              </button>
              <button
                onClick={handleSave}
                disabled={updateSettings.isPending}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Save size={14} /> {updateSettings.isPending ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Failure Limits */}
      <div className="glass-2 rounded-xl p-5 mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-1">
          <ShieldAlert size={16} className="text-red-400" /> Failure Limits
        </h3>
        <p className="text-xs text-slate-500 mb-3">Control how agents handle failures and retries</p>

        <div className="divide-y divide-white/[0.04]">
          <NumberInput
            label="Max Consecutive Failures"
            description="Stop agent after this many failures in a row"
            value={config.maxConsecutiveFailures}
            onChange={(v) => update('maxConsecutiveFailures', v)}
            min={1}
            max={20}
            defaultValue={defaults.maxConsecutiveFailures}
          />
          <NumberInput
            label="Max Total Failures"
            description="Stop agent after this many total failures"
            value={config.maxTotalFailures}
            onChange={(v) => update('maxTotalFailures', v)}
            min={1}
            max={100}
            defaultValue={defaults.maxTotalFailures}
          />
          <NumberInput
            label="Max Retries"
            description="Number of retries before marking task as failed"
            value={config.maxRetries}
            onChange={(v) => update('maxRetries', v)}
            min={0}
            max={10}
            defaultValue={defaults.maxRetries}
          />
        </div>
      </div>

      {/* Timeouts */}
      <div className="glass-2 rounded-xl p-5 mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-1">
          <Clock size={16} className="text-amber-400" /> Timeouts
        </h3>
        <p className="text-xs text-slate-500 mb-3">Task execution time limits and retry delays</p>

        <div className="divide-y divide-white/[0.04]">
          <NumberInput
            label="Task Timeout"
            description="Maximum time for a single task to complete"
            value={config.taskTimeoutMinutes}
            onChange={(v) => update('taskTimeoutMinutes', v)}
            min={5}
            max={480}
            unit="min"
            defaultValue={defaults.taskTimeoutMinutes}
          />
          <NumberInput
            label="Retry Delay"
            description="Wait time between retry attempts"
            value={config.retryDelaySeconds}
            onChange={(v) => update('retryDelaySeconds', v)}
            min={1}
            max={300}
            unit="sec"
            defaultValue={defaults.retryDelaySeconds}
          />
        </div>
      </div>

      {/* AI Model */}
      <div className="glass-2 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-1">
          <Brain size={16} className="text-blue-400" /> AI Model
        </h3>
        <p className="text-xs text-slate-500 mb-3">Token budget for agent reasoning</p>

        <div className="divide-y divide-white/[0.04]">
          <NumberInput
            label="Max Thinking Tokens"
            description="Token budget for extended thinking / chain-of-thought"
            value={config.maxThinkingTokens}
            onChange={(v) => update('maxThinkingTokens', v)}
            min={500}
            max={16000}
            unit="tokens"
            defaultValue={defaults.maxThinkingTokens}
          />
        </div>
      </div>
    </div>
  )
}
