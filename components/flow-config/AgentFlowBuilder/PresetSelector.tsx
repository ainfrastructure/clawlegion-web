'use client'

import { ChevronDown, Sparkles, Zap, Search, Wrench, FlaskConical, Workflow } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import type { PresetSelectorProps, FlowPreset } from '../types'

const PRESET_ICONS: Record<string, React.ReactNode> = {
  'quick-fix': <Zap className="w-4 h-4 text-yellow-400" />,
  'standard': <Wrench className="w-4 h-4 text-blue-400" />,
  'deep-work': <Search className="w-4 h-4 text-purple-400" />,
  'research-only': <FlaskConical className="w-4 h-4 text-cyan-400" />,
}

export function PresetSelector({ presets, selectedId, onChange, isCustomized }: PresetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedPreset = presets.find(p => p.id === selectedId)
  const systemPresets = presets.filter(p => p.isSystem)
  const userPresets = presets.filter(p => !p.isSystem)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (preset: FlowPreset) => {
    onChange(preset)
    setIsOpen(false)
  }

  const getPresetIcon = (presetId: string) => {
    return PRESET_ICONS[presetId] || <Sparkles className="w-4 h-4 text-slate-400" />
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        Flow Preset
      </label>

      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between px-4 py-3 
          bg-slate-800 border rounded-lg text-left
          transition-all duration-200
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-600 hover:border-slate-500'}
        `}
      >
        <div className="flex items-center gap-3">
          {selectedPreset && getPresetIcon(selectedPreset.id)}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-100">
                {selectedPreset?.name || 'Select a preset'}
              </span>
              {isCustomized && (
                <span className="px-1.5 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded">
                  Modified
                </span>
              )}
            </div>
            {selectedPreset && (
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedPreset.description}
              </p>
            )}
          </div>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl overflow-hidden">
          {/* System Presets */}
          <div className="p-2">
            <p className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              System Presets
            </p>
            {systemPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelect(preset)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                  transition-colors duration-150
                  ${selectedId === preset.id ? 'bg-blue-600/20 text-blue-100' : 'hover:bg-slate-700/50 text-slate-200'}
                `}
              >
                {getPresetIcon(preset.id)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{preset.name}</p>
                  <p className="text-xs text-slate-400 truncate">{preset.description}</p>
                </div>
                {selectedId === preset.id && (
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                )}
              </button>
            ))}
          </div>

          {/* User Presets */}
          {userPresets.length > 0 && (
            <>
              <div className="border-t border-white/[0.06]" />
              <div className="p-2">
                <p className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  My Templates
                </p>
                {userPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelect(preset)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                      transition-colors duration-150
                      ${selectedId === preset.id ? 'bg-blue-600/20 text-blue-100' : 'hover:bg-slate-700/50 text-slate-200'}
                    `}
                  >
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{preset.name}</p>
                      <p className="text-xs text-slate-400 truncate">{preset.description}</p>
                    </div>
                    {selectedId === preset.id && (
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Manage Flows link */}
          <div className="border-t border-white/[0.06]">
            <Link
              href="/flows"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-5 py-3 text-xs font-medium text-cyan-400 hover:text-cyan-300 hover:bg-white/[0.04] transition-colors"
            >
              <Workflow className="w-3.5 h-3.5" />
              Manage Flows
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default PresetSelector
