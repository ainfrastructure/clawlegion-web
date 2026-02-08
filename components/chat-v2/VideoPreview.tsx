'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, X, RotateCcw, Check, Maximize2, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoPreviewProps {
  /** Video blob or URL to preview */
  src: string | Blob
  /** Duration in seconds (if known) */
  duration?: number
  /** Called when user wants to re-record */
  onReRecord?: () => void
  /** Called when user removes the video */
  onRemove?: () => void
  /** Whether this is a preview before sending (shows controls) or inline playback */
  isPreview?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Thumbnail URL for inline display */
  thumbnail?: string
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function VideoPreview({
  src,
  duration: initialDuration,
  onReRecord,
  onRemove,
  isPreview = false,
  disabled = false,
  thumbnail,
}: VideoPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(initialDuration || 0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fileSize, setFileSize] = useState<number | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  // Create URL from blob if needed
  const videoUrl = typeof src === 'string' ? src : URL.createObjectURL(src)

  // Get file size for blob
  useEffect(() => {
    if (typeof src !== 'string') {
      setFileSize(src.size)
    }
  }, [src])

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (typeof src !== 'string') {
        URL.revokeObjectURL(videoUrl)
      }
    }
  }, [src, videoUrl])

  // Handle video events
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      if (video.duration && isFinite(video.duration)) {
        setDuration(video.duration)
      }
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
    }
  }, [])

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const togglePlayPause = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  const toggleFullscreen = () => {
    const container = containerRef.current
    if (!container) return

    if (!document.fullscreenElement) {
      container.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    const progress = progressRef.current
    if (!video || !progress || !duration) return

    const rect = progress.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    video.currentTime = percentage * duration
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      className={cn(
        'rounded-lg overflow-hidden',
        isPreview
          ? 'glass-2'
          : 'bg-slate-900'
      )}
    >
      {/* Header for preview mode */}
      {isPreview && (
        <div className="flex items-center justify-between p-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="text-sm">📹</span>
            <span className="text-sm font-medium text-slate-300">Screen Recording</span>
          </div>
          <div className="flex items-center gap-3">
            {/* File info */}
            <div className="text-xs text-slate-500">
              {formatTime(duration)} • {fileSize && formatFileSize(fileSize)}
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
        </div>
      )}

      {/* Video player */}
      <div className="relative group">
        <video
          ref={videoRef}
          src={videoUrl}
          poster={thumbnail}
          preload="metadata"
          className={cn(
            'w-full bg-black',
            isPreview ? 'max-h-[300px]' : 'max-h-[400px]',
            'object-contain'
          )}
          onClick={togglePlayPause}
          playsInline
        />

        {/* Play overlay when paused */}
        {!isPlaying && (
          <button
            onClick={togglePlayPause}
            className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors"
          >
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="w-8 h-8 text-black ml-1" />
            </div>
          </button>
        )}

        {/* Video controls */}
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 p-3',
            'bg-gradient-to-t from-black/80 to-transparent',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            isPlaying && 'opacity-100'
          )}
        >
          {/* Progress bar */}
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="h-1.5 rounded-full bg-white/30 cursor-pointer mb-2 overflow-hidden"
          >
            <div
              className="h-full bg-blue-500 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button
                onClick={togglePlayPause}
                className="text-white hover:text-blue-400 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>

              {/* Mute/Unmute */}
              <button
                onClick={toggleMute}
                className="text-white hover:text-blue-400 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>

              {/* Time */}
              <span className="text-xs text-white">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-blue-400 transition-colors"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Preview actions */}
      {isPreview && (onReRecord || onRemove) && (
        <div className="flex items-center justify-end gap-2 p-3 border-t border-white/[0.06]">
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
