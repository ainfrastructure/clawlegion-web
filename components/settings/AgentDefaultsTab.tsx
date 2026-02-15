'use client'

import { useState, useEffect } from 'react'
import { useSystemSettings, useUpdateSystemSettings } from '@/hooks/useSystemSettings'
import type { AgentDefaultsConfig } from '@/hooks/useSystemSettings'
import { ShieldAlert, Clock, Brain, Save, RotateCcw, Minus, Plus } from 'lucide-react'

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
  const isModified = value !== defaultValue

  const decrement = () => {
    if (value > min) onChange(value - 1)
  }

  const increment = () => {
    if (value < max) onChange(value + 1)
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3.5">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{label}</span>
          {isModified && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-blue-500/15 text-blue-400 border border-blue-500/20">
              Modified
            </span>
          )}
        </div>
        <div className="text-xs text-slate-500 mt-0.5">{description}</div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex items-center glass-2 rounded-xl overflow-hidden border border-white/[0.06]">
          <button
            onClick={decrement}
            disabled={value <= min}
            className="px-2.5 py-2 hover:bg-white/[0.06] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Minus size={12} className="text-slate-400" />
          </button>
          <input
            type="number"
            value={value}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10)
              if (!isNaN(v) && v >= min && v <= max) onChange(v)
            }}
            min={min}
            max={max}
            className="w-14 py-1.5 bg-transparent text-white text-sm text-center focus:outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            onClick={increment}
            disabled={value >= max}
            className="px-2.5 py-2 hover:bg-white/[0.06] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus size={12} className="text-slate-400" />
          </button>
        </div>
        {unit && <span className="text-xs text-slate-500 w-12">{unit}</span>}
        <span className="text-xs text-slate-600 hidden sm:inline whitespace-nowrap">Default: {defaultValue}</span>
      </div>
    </div>
  )
}

function SectionCard({
  icon,
  iconColor,
  title,
  description,
  accentColor,
  children,
}: {
  icon: React.ReactNode
  iconColor: string
  title: string
  description: string
  accentColor: string
  children: React.ReactNode
}) {
  return (
    <div className="glass-2 rounded-2xl overflow-hidden mb-4">
      {/* Gradient accent stripe */}
      <div className={`h-0.5 ${accentColor}`} />

      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className={`p-2 rounded-xl ${iconColor}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
        </div>

        <div className="divide-y divide-white/[0.04] mt-3">
          {children}
        </div>
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
      {/* Action bar */}
      {hasChanges && (
        <div className="flex items-center justify-end gap-2 mb-5">
          <button
            onClick={handleReset}
            className="px-3.5 py-2.5 glass-2 hover:bg-white/[0.06] rounded-xl text-sm text-slate-400 flex items-center gap-2 transition-colors"
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button
            onClick={handleSave}
            disabled={updateSettings.isPending}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 shadow-lg shadow-red-500/10"
          >
            <Save size={14} /> {updateSettings.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}

      <SectionCard
        icon={<ShieldAlert size={16} />}
        iconColor="bg-red-500/10 text-red-400"
        title="Failure Limits"
        description="Control how agents handle failures and retries"
        accentColor="bg-gradient-to-r from-red-500/60 via-red-500/20 to-transparent"
      >
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
      </SectionCard>

      <SectionCard
        icon={<Clock size={16} />}
        iconColor="bg-amber-500/10 text-amber-400"
        title="Timeouts"
        description="Task execution time limits and retry delays"
        accentColor="bg-gradient-to-r from-amber-500/60 via-amber-500/20 to-transparent"
      >
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
      </SectionCard>

      <SectionCard
        icon={<Brain size={16} />}
        iconColor="bg-blue-500/10 text-blue-400"
        title="AI Model"
        description="Token budget for agent reasoning"
        accentColor="bg-gradient-to-r from-blue-500/60 via-blue-500/20 to-transparent"
      >
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
      </SectionCard>
    </div>
  )
}
