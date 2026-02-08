'use client'

import { Square, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type RecordingType = 'screen' | 'voice'

interface RecordingIndicatorProps {
  type: RecordingType
  duration: number
  isProcessing?: boolean
  onStop: () => void
  onCancel: () => void
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function RecordingIndicator({
  type,
  duration,
  isProcessing = false,
  onStop,
  onCancel,
}: RecordingIndicatorProps) {
  const label = type === 'screen' ? 'Recording screen' : 'Recording voice'
  const icon = type === 'screen' ? '🖥️' : '🎤'
  const maxDuration = type === 'screen' ? 300 : 120 // 5min screen, 2min voice

  if (isProcessing) {
    return (
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
          <span className="text-sm text-slate-300">Processing recording...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-red-950/30 border-b border-red-900/50">
      <div className="flex items-center gap-3">
        {/* Pulsing red dot */}
        <div className="relative">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <div className="absolute inset-0 w-3 h-3 rounded-full bg-red-500 animate-ping opacity-50" />
        </div>
        
        {/* Label with icon */}
        <div className="flex items-center gap-2">
          <span className="text-sm">{icon}</span>
          <span className="text-sm text-slate-300">{label}...</span>
        </div>
        
        {/* Timer */}
        <span className="font-mono text-sm text-red-400">
          {formatDuration(duration)}
          <span className="text-slate-600"> / {formatDuration(maxDuration)}</span>
        </span>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Stop button */}
        <button
          onClick={onStop}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
            'bg-red-500 hover:bg-red-600 text-white text-sm font-medium',
            'transition-colors'
          )}
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>Stop</span>
        </button>
        
        {/* Cancel button */}
        <button
          onClick={onCancel}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
            'bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm',
            'transition-colors'
          )}
        >
          <X className="w-3.5 h-3.5" />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  )
}
