'use client'

import { TrendingDown, Target, AlertTriangle } from 'lucide-react'

interface BurndownPoint {
  date: string
  remaining: number
  ideal: number
}

interface SprintBurndownProps {
  data: BurndownPoint[]
  totalPoints: number
  daysRemaining: number
  velocity?: number
  className?: string
}

export function SprintBurndown({
  data,
  totalPoints,
  daysRemaining,
  velocity,
  className = ''
}: SprintBurndownProps) {
  if (data.length === 0) {
    return (
      <div className={`bg-slate-800/50 rounded-lg p-6 ${className}`}>
        <div className="text-center text-slate-500">
          <TrendingDown className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No burndown data yet</p>
        </div>
      </div>
    )
  }

  const currentRemaining = data[data.length - 1]?.remaining || 0
  const currentIdeal = data[data.length - 1]?.ideal || 0
  const isOnTrack = currentRemaining <= currentIdeal
  const projectedCompletion = velocity && velocity > 0 
    ? Math.ceil(currentRemaining / velocity) 
    : null

  // Calculate chart dimensions
  const maxValue = Math.max(totalPoints, ...data.map(d => d.remaining))
  const chartHeight = 150
  const chartWidth = 300

  // Generate path for actual burndown
  const actualPath = data.map((point, i) => {
    const x = (i / (data.length - 1)) * chartWidth
    const y = chartHeight - (point.remaining / maxValue) * chartHeight
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')

  // Generate path for ideal burndown
  const idealPath = data.map((point, i) => {
    const x = (i / (data.length - 1)) * chartWidth
    const y = chartHeight - (point.ideal / maxValue) * chartHeight
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')

  return (
    <div className={`bg-slate-800/50 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-blue-400" />
          Sprint Burndown
        </h3>
        <div className={`flex items-center gap-1 text-sm ${
          isOnTrack ? 'text-green-400' : 'text-yellow-400'
        }`}>
          {isOnTrack ? (
            <Target className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          {isOnTrack ? 'On Track' : 'Behind Schedule'}
        </div>
      </div>

      {/* Mini Chart */}
      <div className="relative mb-4">
        <svg 
          viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
          className="w-full h-32"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={ratio}
              x1={0}
              y1={chartHeight * ratio}
              x2={chartWidth}
              y2={chartHeight * ratio}
              stroke="currentColor"
              className="text-slate-700"
              strokeDasharray="4 4"
            />
          ))}

          {/* Ideal line */}
          <path
            d={idealPath}
            fill="none"
            stroke="currentColor"
            className="text-slate-500"
            strokeWidth="2"
            strokeDasharray="6 4"
          />

          {/* Actual line */}
          <path
            d={actualPath}
            fill="none"
            stroke="currentColor"
            className={isOnTrack ? 'text-green-400' : 'text-yellow-400'}
            strokeWidth="3"
          />

          {/* Current point */}
          <circle
            cx={chartWidth}
            cy={chartHeight - (currentRemaining / maxValue) * chartHeight}
            r="4"
            fill="currentColor"
            className={isOnTrack ? 'text-green-400' : 'text-yellow-400'}
          />
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-slate-500" style={{ borderStyle: 'dashed' }} />
            <span className="text-slate-500">Ideal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-0.5 ${isOnTrack ? 'bg-green-400' : 'bg-yellow-400'}`} />
            <span className="text-slate-400">Actual</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-white">{currentRemaining}</div>
          <div className="text-xs text-slate-500">Points Left</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{daysRemaining}</div>
          <div className="text-xs text-slate-500">Days Left</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white">
            {projectedCompletion !== null ? `${projectedCompletion}d` : '-'}
          </div>
          <div className="text-xs text-slate-500">Projected</div>
        </div>
      </div>
    </div>
  )
}
