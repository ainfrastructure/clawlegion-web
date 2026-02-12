'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, X, RotateCcw, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AudioPreviewProps {
  /** Audio blob or URL to preview */
  src: string | Blob
  /** Duration in seconds (if known) */
  duration?: number
  /** Called when user wants to re-record */
  onReRecord?: () => void
  /** Called when user removes the audio */
  onRemove?: () => void
  /** Whether this is a preview before sending (shows controls) or inline playback */
  isPreview?: boolean
  /** Disabled state */
  disabled?: boolean
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function AudioPreview({
  src,
  duration: initialDuration,
  onReRecord,
  onRemove,
  isPreview = false,
  disabled = false,
}: AudioPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(initialDuration || 0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  // Create URL from blob if needed
  const audioUrl = typeof src === 'string' ? src : URL.createObjectURL(src)

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (typeof src !== 'string') {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [src, audioUrl])

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration)
      }
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [])

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    const progress = progressRef.current
    if (!audio || !progress || !duration) return

    const rect = progress.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    audio.currentTime = percentage * duration
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      className={cn(
        'rounded-lg p-3',
        isPreview
          ? 'glass-2'
          : 'bg-slate-800/30'
      )}
    >
      {/* Hidden audio element */}
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Header for preview mode */}
      {isPreview && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">🎤</span>
            <span className="text-sm font-medium text-slate-300">Voice Message</span>
          </div>
          {onRemove && (
            <button
              onClick={onRemove}
              disabled={disabled}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded text-xs',
                'text-slate-400 hover:text-red-400 hover:bg-slate-700/50',
                'transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <X className="w-3 h-3" />
              <span>Remove</span>
            </button>
          )}
        </div>
      )}

      {/* Player controls */}
      <div className="flex items-center gap-3">
        {/* Play/Pause button */}
        <button
          onClick={togglePlayPause}
          disabled={disabled}
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-full',
            'bg-red-500 hover:bg-red-600 text-white',
            'transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>

        {/* Progress bar and time */}
        <div className="flex-1">
          {/* Progress bar */}
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className={cn(
              'h-2 rounded-full bg-slate-700 cursor-pointer',
              'overflow-hidden'
            )}
          >
            <div
              className="h-full bg-blue-500 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Time */}
          <div className="flex justify-between mt-1">
            <span className="text-xs text-slate-500">
              {formatTime(currentTime)}
            </span>
            <span className="text-xs text-slate-500">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Preview actions */}
      {isPreview && (onReRecord || onRemove) && (
        <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-white/[0.06]">
          {onReRecord && (
            <button
              onClick={onReRecord}
              disabled={disabled}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm',
                'bg-slate-700 hover:bg-slate-600 text-slate-300',
                'transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-record</span>
            </button>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-green-400">
            <Check className="w-3.5 h-3.5" />
            <span>Ready to send</span>
          </div>
        </div>
      )}
    </div>
  )
}
