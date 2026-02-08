'use client'

import { useState, useCallback } from 'react'

interface ConfidenceSliderProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

const confidenceLevels: Record<number, { label: string; meaning: string; action: string }> = {
  1: { label: 'Very Low', meaning: '"It compiles"', action: 'Consider rejecting' },
  2: { label: 'Very Low', meaning: 'Minimal effort', action: 'Consider rejecting' },
  3: { label: 'Low', meaning: 'Basic testing only', action: 'Deep dive required' },
  4: { label: 'Low', meaning: 'Minimal testing', action: 'Deep dive required' },
  5: { label: 'Medium', meaning: 'Basic testing done', action: 'Thorough review' },
  6: { label: 'Medium', meaning: 'Core paths tested', action: 'Thorough review' },
  7: { label: 'Good', meaning: 'Main paths tested', action: 'Standard review' },
  8: { label: 'Good', meaning: 'Well tested', action: 'Standard review' },
  9: { label: 'High', meaning: 'Thoroughly tested', action: 'Quick spot-check' },
  10: { label: 'High', meaning: 'Exhaustively tested', action: 'Quick spot-check' },
}

function getSliderColor(value: number): string {
  if (value <= 2) return 'bg-red-500'
  if (value <= 4) return 'bg-orange-500'
  if (value <= 6) return 'bg-yellow-500'
  if (value <= 8) return 'bg-lime-500'
  return 'bg-green-500'
}

function getGradientStyle(value: number): string {
  const percentage = ((value - 1) / 9) * 100
  return `linear-gradient(to right, 
    rgb(239, 68, 68) 0%, 
    rgb(249, 115, 22) 25%, 
    rgb(234, 179, 8) 50%, 
    rgb(132, 204, 22) 75%, 
    rgb(34, 197, 94) 100%)`
}

export function ConfidenceSlider({ value, onChange, disabled = false }: ConfidenceSliderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const level = confidenceLevels[value] || confidenceLevels[5]
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value, 10))
  }, [onChange])

  const fillPercentage = ((value - 1) / 9) * 100

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300">
          Confidence Score
        </label>
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-bold ${
            value <= 2 ? 'text-red-400' :
            value <= 4 ? 'text-orange-400' :
            value <= 6 ? 'text-yellow-400' :
            value <= 8 ? 'text-lime-400' :
            'text-green-400'
          }`}>
            {value}
          </span>
          <span className="text-slate-500">/10</span>
        </div>
      </div>

      {/* Slider Track */}
      <div className="relative pt-1">
        <div className="relative h-3 rounded-full overflow-hidden bg-slate-700">
          {/* Gradient background */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{ background: getGradientStyle(value) }}
          />
          {/* Fill */}
          <div 
            className={`absolute h-full transition-all duration-150 ${getSliderColor(value)}`}
            style={{ width: `${fillPercentage}%` }}
          />
        </div>
        
        {/* Actual slider input */}
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          disabled={disabled}
          className="absolute inset-0 w-full h-3 appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-slate-300
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-slate-300
            [&::-moz-range-thumb]:cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-xs text-slate-500 px-1">
        <span>1</span>
        <span>5</span>
        <span>10</span>
      </div>

      {/* Meaning box */}
      <div className={`p-3 rounded-lg border transition-colors ${
        value <= 2 ? 'bg-red-500/10 border-red-500/30' :
        value <= 4 ? 'bg-orange-500/10 border-orange-500/30' :
        value <= 6 ? 'bg-yellow-500/10 border-yellow-500/30' :
        value <= 8 ? 'bg-lime-500/10 border-lime-500/30' :
        'bg-green-500/10 border-green-500/30'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <span className={`text-sm font-medium ${
              value <= 2 ? 'text-red-400' :
              value <= 4 ? 'text-orange-400' :
              value <= 6 ? 'text-yellow-400' :
              value <= 8 ? 'text-lime-400' :
              'text-green-400'
            }`}>
              {level.label}
            </span>
            <span className="text-slate-400 text-sm ml-2">— {level.meaning}</span>
          </div>
          <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded">
            {level.action}
          </span>
        </div>
      </div>

      {/* Quick tips */}
      <div className="flex justify-between text-xs text-slate-500">
        <span className="text-red-400/70">Low confidence → Deep dive required</span>
        <span className="text-green-400/70">High confidence → Quick spot-check</span>
      </div>
    </div>
  )
}

export default ConfidenceSlider
