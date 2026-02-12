'use client'

import { Clock } from 'lucide-react'
import { formatTimeBudget } from '@/lib/flow-presets'
import type { TimeBudgetSliderProps } from '../types'

const TIME_PRESETS = [0.5, 1, 2, 4, 8, 12, 24]

export function TimeBudgetSlider({ value, onChange }: TimeBudgetSliderProps) {
  // Calculate percentage for the slider track fill
  const minHours = 0.5
  const maxHours = 24
  const percentage = ((value - minHours) / (maxHours - minHours)) * 100

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <Clock className="w-4 h-4 text-blue-400" />
          Time Budget
        </label>
        <span className="text-lg font-semibold text-blue-400">
          {formatTimeBudget(value)}
        </span>
      </div>

      {/* Custom Slider */}
      <div className="relative pt-1">
        <input
          type="range"
          min={minHours}
          max={maxHours}
          step={0.5}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-blue-500
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-blue-400
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-all
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-blue-500
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-blue-400
            [&::-moz-range-thumb]:cursor-pointer
          "
          style={{
            background: `linear-gradient(to right, rgb(59 130 246) 0%, rgb(59 130 246) ${percentage}%, rgb(51 65 85) ${percentage}%, rgb(51 65 85) 100%)`,
          }}
        />
        
        {/* Markers */}
        <div className="flex justify-between px-0.5 mt-2">
          <span className="text-[10px] text-slate-500">30m</span>
          <span className="text-[10px] text-slate-500">4h</span>
          <span className="text-[10px] text-slate-500">8h</span>
          <span className="text-[10px] text-slate-500">12h</span>
          <span className="text-[10px] text-slate-500">24h</span>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap gap-2">
        {TIME_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={`
              px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-150
              ${value === preset 
                ? 'bg-red-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}
            `}
          >
            {formatTimeBudget(preset)}
          </button>
        ))}
      </div>
    </div>
  )
}

export default TimeBudgetSlider
