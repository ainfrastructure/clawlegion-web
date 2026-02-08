'use client'

import { useState } from 'react'
import { X, ChevronDown, Check } from 'lucide-react'

interface FilterOption {
  value: string
  label: string
  count?: number
}

interface FilterChipsProps {
  options: FilterOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  label?: string
  multiple?: boolean
  clearable?: boolean
}

export function FilterChips({
  options,
  selected,
  onChange,
  label,
  multiple = true,
  clearable = true
}: FilterChipsProps) {
  const toggle = (value: string) => {
    if (multiple) {
      if (selected.includes(value)) {
        onChange(selected.filter(v => v !== value))
      } else {
        onChange([...selected, value])
      }
    } else {
      onChange(selected.includes(value) ? [] : [value])
    }
  }

  const clearAll = () => onChange([])

  return (
    <div className="flex flex-wrap items-center gap-2">
      {label && <span className="text-sm text-slate-400 mr-2">{label}:</span>}
      
      {options.map(option => {
        const isSelected = selected.includes(option.value)
        return (
          <button
            key={option.value}
            onClick={() => toggle(option.value)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors
              ${isSelected 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' 
                : 'bg-slate-800 text-slate-400 border border-white/[0.06] hover:border-slate-600'
              }
            `}
          >
            {isSelected && <Check className="w-3 h-3" />}
            {option.label}
            {option.count !== undefined && (
              <span className="text-xs opacity-70">({option.count})</span>
            )}
          </button>
        )
      })}

      {clearable && selected.length > 0 && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 px-2 py-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-3 h-3" />
          Clear
        </button>
      )}
    </div>
  )
}

// Dropdown filter variant
interface FilterDropdownProps {
  options: FilterOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  label: string
  multiple?: boolean
}

export function FilterDropdown({
  options,
  selected,
  onChange,
  label,
  multiple = true
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = (value: string) => {
    if (multiple) {
      if (selected.includes(value)) {
        onChange(selected.filter(v => v !== value))
      } else {
        onChange([...selected, value])
      }
    } else {
      onChange([value])
      setIsOpen(false)
    }
  }

  const selectedLabels = options
    .filter(o => selected.includes(o.value))
    .map(o => o.label)
    .join(', ')

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-white/[0.06] rounded-lg hover:border-slate-600 transition-colors"
      >
        <span className="text-sm text-slate-400">{label}:</span>
        <span className="text-sm font-medium truncate max-w-[150px]">
          {selectedLabels || 'All'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-48 bg-slate-900 border border-white/[0.06] rounded-lg shadow-xl z-20 py-1">
            {options.map(option => {
              const isSelected = selected.includes(option.value)
              return (
                <button
                  key={option.value}
                  onClick={() => toggle(option.value)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 text-sm transition-colors
                    ${isSelected ? 'bg-blue-500/10 text-blue-400' : 'text-slate-300 hover:bg-slate-800'}
                  `}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check className="w-4 h-4" />}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default FilterChips
