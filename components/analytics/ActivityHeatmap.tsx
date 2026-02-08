'use client'

import { useState } from 'react'

interface DayActivity {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

interface ActivityHeatmapProps {
  data: DayActivity[]
  weeks?: number
  title?: string
  className?: string
}

const levelColors = [
  'bg-slate-800',      // 0: none
  'bg-green-900',      // 1: low
  'bg-green-700',      // 2: medium
  'bg-green-500',      // 3: high
  'bg-green-400',      // 4: very high
]

const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', '']

export function ActivityHeatmap({
  data,
  weeks = 12,
  title = 'Activity',
  className = ''
}: ActivityHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<DayActivity | null>(null)

  // Generate grid data (last N weeks)
  const today = new Date()
  const gridData: (DayActivity | null)[][] = []
  
  for (let w = weeks - 1; w >= 0; w--) {
    const week: (DayActivity | null)[] = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(today)
      date.setDate(date.getDate() - (w * 7 + (6 - d)))
      
      if (date > today) {
        week.push(null)
      } else {
        const dateStr = date.toISOString().split('T')[0]
        const dayData = data.find(day => day.date === dateStr)
        week.push(dayData || { date: dateStr, count: 0, level: 0 })
      }
    }
    gridData.push(week)
  }

  const totalCount = data.reduce((sum, day) => sum + day.count, 0)

  return (
    <div className={`bg-slate-800/50 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className="text-xs text-slate-500">{totalCount} total contributions</span>
      </div>

      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 pr-2 text-[10px] text-slate-500">
          {dayLabels.map((label, i) => (
            <div key={i} className="h-3 leading-3">{label}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-1 overflow-x-auto">
          {gridData.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => (
                <div
                  key={di}
                  className={`w-3 h-3 rounded-sm transition-colors cursor-pointer ${
                    day ? levelColors[day.level] : 'bg-transparent'
                  } ${day ? 'hover:ring-1 hover:ring-white/30' : ''}`}
                  onMouseEnter={() => day && setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-[10px] text-slate-500">Less</div>
        <div className="flex gap-1">
          {levelColors.map((color, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${color}`} />
          ))}
        </div>
        <div className="text-[10px] text-slate-500">More</div>
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div className="mt-2 text-xs text-center text-slate-400">
          <span className="font-medium">{hoveredDay.count} contributions</span>
          {' on '}
          <span>{new Date(hoveredDay.date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
          })}</span>
        </div>
      )}
    </div>
  )
}
