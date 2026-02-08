'use client'

import { Clock } from 'lucide-react'

interface HourData {
  hour: number
  count: number
}

interface TimeDistributionProps {
  data: HourData[]
  title?: string
  className?: string
}

export function TimeDistribution({
  data,
  title = 'Activity by Hour',
  className = ''
}: TimeDistributionProps) {
  const maxCount = Math.max(...data.map(d => d.count), 1)
  
  // Fill in missing hours
  const hourData = Array.from({ length: 24 }, (_, hour) => {
    const found = data.find(d => d.hour === hour)
    return { hour, count: found?.count || 0 }
  })

  const formatHour = (hour: number) => {
    if (hour === 0) return '12a'
    if (hour === 12) return '12p'
    return hour < 12 ? `${hour}a` : `${hour - 12}p`
  }

  const peakHour = hourData.reduce((max, h) => h.count > max.count ? h : max, hourData[0])

  return (
    <div className={`bg-slate-800/50 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          {title}
        </h3>
        <span className="text-xs text-slate-500">
          Peak: {formatHour(peakHour.hour)}
        </span>
      </div>

      <div className="flex items-end gap-0.5 h-20">
        {hourData.map(({ hour, count }) => {
          const height = (count / maxCount) * 100
          const isPeak = hour === peakHour.hour
          
          return (
            <div
              key={hour}
              className="flex-1 flex flex-col items-center group"
            >
              <div
                className={`w-full rounded-t transition-all ${
                  isPeak ? 'bg-blue-400' : 'bg-slate-600 group-hover:bg-slate-500'
                }`}
                style={{ height: `${Math.max(height, 2)}%` }}
                title={`${formatHour(hour)}: ${count} activities`}
              />
            </div>
          )
        })}
      </div>

      {/* Hour labels */}
      <div className="flex mt-1">
        {[0, 6, 12, 18, 23].map((hour) => (
          <div
            key={hour}
            className="text-[10px] text-slate-500"
            style={{
              position: 'relative',
              left: `${(hour / 23) * 100}%`,
              transform: 'translateX(-50%)',
            }}
          >
            {formatHour(hour)}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/[0.06]">
        <div className="text-center">
          <div className="text-lg font-bold">
            {hourData.filter(h => h.hour >= 6 && h.hour < 12).reduce((s, h) => s + h.count, 0)}
          </div>
          <div className="text-[10px] text-slate-500">Morning</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">
            {hourData.filter(h => h.hour >= 12 && h.hour < 18).reduce((s, h) => s + h.count, 0)}
          </div>
          <div className="text-[10px] text-slate-500">Afternoon</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">
            {hourData.filter(h => h.hour >= 18 || h.hour < 6).reduce((s, h) => s + h.count, 0)}
          </div>
          <div className="text-[10px] text-slate-500">Evening</div>
        </div>
      </div>
    </div>
  )
}
