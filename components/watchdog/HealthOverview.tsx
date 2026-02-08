'use client'

import { CheckCircle, AlertTriangle, Clock, XCircle, Activity, RefreshCw } from 'lucide-react'

interface HealthSummary {
  total: number
  healthy: number
  warning: number
  stale: number
  failed: number
}

interface HealthOverviewProps {
  summary: HealthSummary
  lastScan?: string
  isLoading?: boolean
  onRefresh?: () => void
}

export function HealthOverview({ summary, lastScan, isLoading, onRefresh }: HealthOverviewProps) {
  const cards = [
    {
      label: 'Total Active',
      value: summary.total,
      icon: <Activity size={20} />,
      color: 'text-slate-400',
      bg: 'bg-slate-500/20',
      border: 'border-slate-500/30'
    },
    {
      label: 'Healthy',
      value: summary.healthy,
      icon: <CheckCircle size={20} />,
      color: 'text-green-400',
      bg: 'bg-green-500/20',
      border: 'border-green-500/30'
    },
    {
      label: 'Warning',
      value: summary.warning,
      icon: <AlertTriangle size={20} />,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/30'
    },
    {
      label: 'Stale',
      value: summary.stale,
      icon: <Clock size={20} />,
      color: 'text-orange-400',
      bg: 'bg-orange-500/20',
      border: 'border-orange-500/30'
    },
    {
      label: 'Failed',
      value: summary.failed,
      icon: <XCircle size={20} />,
      color: 'text-red-400',
      bg: 'bg-red-500/20',
      border: 'border-red-500/30'
    }
  ]

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Health Overview</h2>
        <div className="flex items-center gap-3">
          {lastScan && (
            <span className="text-xs text-slate-500">
              Last scan: {new Date(lastScan).toLocaleTimeString()}
            </span>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={`text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((card) => (
          <div 
            key={card.label}
            className={`${card.bg} border ${card.border} rounded-xl p-4 transition-all hover:scale-[1.02]`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={card.color}>{card.icon}</span>
              <span className="text-sm text-slate-400">{card.label}</span>
            </div>
            <div className={`text-2xl font-bold ${card.color}`}>
              {isLoading ? '...' : card.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HealthOverview
