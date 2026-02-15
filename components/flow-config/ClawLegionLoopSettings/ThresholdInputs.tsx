'use client'

import { AlertTriangle, TrendingUp, IterationCw, Maximize } from 'lucide-react'
import type { ThresholdInputsProps } from '../types'

export function ThresholdInputs({ 
  failThreshold, 
  expansionApprovalThreshold, 
  roiThreshold, 
  maxIterations,
  onChange 
}: ThresholdInputsProps) {
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-medium text-slate-300">Safety & Performance Thresholds</h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Max Iterations */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <IterationCw className="w-4 h-4 text-blue-400" />
            Max Iterations
          </label>
          <div className="relative">
            <input
              type="number"
              min={1}
              max={100}
              value={maxIterations}
              onChange={(e) => onChange({ maxIterations: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg
                text-slate-200 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
              cycles
            </span>
          </div>
          <p className="text-xs text-slate-500">Maximum work cycles before stopping</p>
        </div>

        {/* Fail Threshold */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Fail Threshold
          </label>
          <div className="relative">
            <input
              type="number"
              min={1}
              max={10}
              value={failThreshold}
              onChange={(e) => onChange({ failThreshold: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg
                text-slate-200 text-sm
                focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
              fails
            </span>
          </div>
          <p className="text-xs text-slate-500">Stop after this many consecutive failures</p>
        </div>

        {/* ROI Threshold */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            ROI Threshold
          </label>
          <div className="relative">
            <input
              type="number"
              min={0}
              max={100}
              value={roiThreshold}
              onChange={(e) => onChange({ roiThreshold: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg
                text-slate-200 text-sm
                focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
              %
            </span>
          </div>
          <p className="text-xs text-slate-500">Minimum ROI to continue execution</p>
        </div>

        {/* Expansion Approval Threshold */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <Maximize className="w-4 h-4 text-purple-400" />
            Expansion Threshold
          </label>
          <div className="relative">
            <input
              type="number"
              min={0}
              max={100}
              value={expansionApprovalThreshold}
              onChange={(e) => onChange({ expansionApprovalThreshold: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg
                text-slate-200 text-sm
                focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
              %
            </span>
          </div>
          <p className="text-xs text-slate-500">ROI needed to auto-approve scope expansion</p>
        </div>
      </div>

      {/* Info Box */}
      <div className="p-3 glass-2 rounded-lg">
        <p className="text-xs text-slate-400">
          💡 <span className="text-slate-300">Tip:</span> Lower thresholds are more aggressive (continues longer), 
          higher thresholds are safer (stops sooner). Default values work well for most tasks.
        </p>
      </div>
    </div>
  )
}

export default ThresholdInputs
