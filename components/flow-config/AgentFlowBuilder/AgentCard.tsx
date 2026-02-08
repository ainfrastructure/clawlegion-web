'use client'

import { AGENT_METADATA, RESOURCE_LEVELS, getAgentColorClasses } from '@/lib/flow-presets'
import type { AgentConfig, AgentCardProps } from '../types'

export function AgentCard({ config, metadata, onChange }: AgentCardProps) {
  const colors = getAgentColorClasses(metadata.color)

  const handleToggle = () => {
    onChange({
      ...config,
      enabled: !config.enabled,
    })
  }

  const handleResourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...config,
      resourceLevel: e.target.value as AgentConfig['resourceLevel'],
    })
  }

  return (
    <div
      className={`
        relative p-4 rounded-xl border-2 transition-all duration-200
        ${config.enabled 
          ? `${colors.border} ${colors.bgLight} shadow-md` 
          : 'border-white/[0.06] bg-slate-800/50 opacity-60'}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-label={metadata.name}>
            {metadata.emoji}
          </span>
          <div>
            <h3 className={`font-semibold ${config.enabled ? colors.text : 'text-slate-400'}`}>
              {metadata.name}
            </h3>
          </div>
        </div>
        
        {/* Toggle Switch */}
        <button
          type="button"
          role="switch"
          aria-checked={config.enabled}
          onClick={handleToggle}
          className={`
            relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full 
            border-2 border-transparent transition-colors duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900
            ${config.enabled ? colors.bg + ' focus:ring-' + metadata.color + '-500' : 'bg-slate-600 focus:ring-slate-500'}
          `}
        >
          <span className="sr-only">Enable {metadata.name}</span>
          <span
            className={`
              pointer-events-none inline-block h-5 w-5 rounded-full 
              bg-white shadow ring-0 transition duration-200 ease-in-out
              ${config.enabled ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 mb-3 leading-relaxed">
        {metadata.description}
      </p>

      {/* Resource Level Dropdown */}
      <div className={`transition-opacity duration-200 ${config.enabled ? 'opacity-100' : 'opacity-50'}`}>
        <label className="block text-xs text-slate-500 mb-1">Resource Level</label>
        <select
          value={config.resourceLevel}
          onChange={handleResourceChange}
          disabled={!config.enabled}
          className={`
            w-full px-3 py-2 rounded-lg text-sm
            bg-slate-900/50 border border-slate-600
            text-slate-200 
            focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-800
            ${config.enabled ? 'focus:' + colors.border : ''}
            disabled:cursor-not-allowed disabled:opacity-50
          `}
        >
          {RESOURCE_LEVELS.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
      </div>

      {/* Status Indicator */}
      <div className="absolute top-2 right-14">
        <div 
          className={`
            w-2 h-2 rounded-full transition-colors duration-200
            ${config.enabled ? colors.bg : 'bg-slate-600'}
          `}
          title={config.enabled ? 'Active' : 'Inactive'}
        />
      </div>
    </div>
  )
}

export default AgentCard
