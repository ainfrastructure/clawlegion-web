'use client'

import { useState, useRef, useCallback } from 'react'
import { Play, Maximize2, Minimize2, X, Volume2, VolumeX } from 'lucide-react'

export function DemoSection() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fullscreenVideoRef = useRef<HTMLVideoElement>(null)

  const handlePlay = useCallback(() => {
    const video = isFullscreen ? fullscreenVideoRef.current : videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
      setIsPlaying(true)
      // Unmute after a brief moment so autoplay isn't blocked
      setTimeout(() => {
        video.muted = false
        setIsMuted(false)
      }, 300)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }, [isFullscreen])

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    const video = isFullscreen ? fullscreenVideoRef.current : videoRef.current
    if (!video) return
    video.muted = !video.muted
    setIsMuted(video.muted)
  }, [isFullscreen])

  const handleFullscreenOpen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFullscreen(true)
    // Sync playback state to fullscreen video after mount
    setTimeout(() => {
      const fsVideo = fullscreenVideoRef.current
      const mainVideo = videoRef.current
      if (fsVideo && mainVideo) {
        fsVideo.currentTime = mainVideo.currentTime
        fsVideo.muted = mainVideo.muted
        if (isPlaying) {
          fsVideo.play()
        }
      }
    }, 100)
  }, [isPlaying])

  const handleFullscreenClose = useCallback(() => {
    const fsVideo = fullscreenVideoRef.current
    const mainVideo = videoRef.current
    if (fsVideo && mainVideo) {
      mainVideo.currentTime = fsVideo.currentTime
      mainVideo.muted = fsVideo.muted
      if (isPlaying) {
        mainVideo.play()
      }
    }
    setIsFullscreen(false)
  }, [isPlaying])

  const handleVideoEnd = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const VideoContent = ({ fullscreen = false }: { fullscreen?: boolean }) => {
    const ref = fullscreen ? fullscreenVideoRef : videoRef

    return (
      <div
        className={`${fullscreen ? '' : 'glass-3 rounded-2xl overflow-hidden'} relative group cursor-pointer`}
        onClick={handlePlay}
      >
        <div className={`${fullscreen ? 'w-full h-full flex items-center justify-center bg-black' : 'aspect-video'} relative overflow-hidden`}>
          <video
            ref={ref}
            className={`${fullscreen ? 'max-w-full max-h-full' : 'w-full h-full object-cover'}`}
            poster="/demo-poster.jpg"
            muted
            playsInline
            preload="metadata"
            onEnded={handleVideoEnd}
            controls={isPlaying}
          >
            <source src="/demo-video.webm" type="video/webm" />
            <source src="/demo-video.mp4" type="video/mp4" />
          </video>

          {/* Play button overlay — visible when not playing */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/30 transition-opacity">
              <div className="w-20 h-20 rounded-full bg-blue-600/90 flex items-center justify-center shadow-lg shadow-blue-500/30 hover:bg-blue-500 hover:scale-105 transition-all">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
            </div>
          )}

          {/* Top-right controls */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {isPlaying && (
              <button
                onClick={toggleMute}
                className="p-2 glass-2 rounded-lg text-slate-400 hover:text-white transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}
            {!fullscreen && (
              <button
                onClick={handleFullscreenOpen}
                className="p-2 glass-2 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="View fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <section id="demo" className="px-4 sm:px-6 py-24 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
              Watch It Work
            </h2>
            <p className="text-lg text-slate-400">
              See how AI Legion coordinates a real multi-agent task from start to finish.
            </p>
          </div>

          <VideoContent />

          <p className="text-center text-sm text-slate-500 mt-4">
            2-minute walkthrough of the AI Legion dashboard
          </p>
        </div>
      </section>

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
          <button
            onClick={handleFullscreenClose}
            className="absolute top-4 right-4 z-[110] p-3 glass-2 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="w-[95vw] h-[90vh]">
            <VideoContent fullscreen />
          </div>
        </div>
      )}
    </>
  )
}
