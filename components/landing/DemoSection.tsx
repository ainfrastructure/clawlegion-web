'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Play, X, Volume2 } from 'lucide-react'

export function DemoSection() {
  const [modalOpen, setModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showUnmuteHint, setShowUnmuteHint] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Lock body scroll when modal is open
  useEffect(() => {
    if (modalOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        document.body.style.overflow = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [modalOpen])

  // ESC to close
  useEffect(() => {
    if (!modalOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [modalOpen])

  const openModal = useCallback(() => {
    setIsLoading(true)
    setShowUnmuteHint(false)
    setModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    const video = videoRef.current
    if (video) {
      video.pause()
      video.currentTime = 0
    }
    setModalOpen(false)
    setIsLoading(false)
    setShowUnmuteHint(false)
  }, [])

  // Auto-play with sound when modal opens; request native fullscreen on mobile
  useEffect(() => {
    if (!modalOpen) return
    const video = videoRef.current
    if (!video) return

    const tryPlay = async () => {
      video.currentTime = 0
      video.muted = false

      try {
        await video.play()
        setIsLoading(false)
      } catch {
        // Browser blocked unmuted autoplay — fall back to muted
        video.muted = true
        try {
          await video.play()
          setShowUnmuteHint(true)
          setIsLoading(false)
        } catch {
          // Autoplay completely blocked — user will use native controls
          setIsLoading(false)
        }
      }

      // On mobile, request native fullscreen on the video element
      // This triggers the phone's landscape fullscreen player
      try {
        const isMobile = window.innerWidth < 768
        if (isMobile) {
          const videoEl = video as HTMLVideoElement & {
            webkitEnterFullscreen?: () => Promise<void>
            webkitRequestFullscreen?: () => Promise<void>
          }
          if (videoEl.requestFullscreen) {
            await videoEl.requestFullscreen()
          } else if (videoEl.webkitEnterFullscreen) {
            // iOS Safari uses webkitEnterFullscreen on video elements
            await videoEl.webkitEnterFullscreen()
          } else if (videoEl.webkitRequestFullscreen) {
            await videoEl.webkitRequestFullscreen()
          }
        }
      } catch {
        // Fullscreen request failed — that's ok, modal still works
      }
    }

    // Small delay to let the modal render and video element mount properly
    const timer = setTimeout(tryPlay, 150)
    return () => clearTimeout(timer)
  }, [modalOpen])

  // Close our modal when native fullscreen exits (user pressed done/back)
  useEffect(() => {
    if (!modalOpen) return
    const handleFullscreenExit = () => {
      if (!document.fullscreenElement) {
        closeModal()
      }
    }
    document.addEventListener('fullscreenchange', handleFullscreenExit)
    document.addEventListener('webkitfullscreenchange', handleFullscreenExit)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenExit)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenExit)
    }
  }, [modalOpen, closeModal])

  const handleUnmute = useCallback(() => {
    const video = videoRef.current
    if (video) {
      video.muted = false
      setShowUnmuteHint(false)
    }
  }, [])

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      // Close only if clicking the overlay backdrop, not the video area
      if (e.target === modalRef.current) {
        closeModal()
      }
    },
    [closeModal]
  )

  return (
    <>
      <section id="demo" className="px-4 sm:px-6 py-24 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
              Watch It Work
            </h2>
            <p className="text-lg text-slate-400">
              See how AI Legion coordinates a real multi-agent task from start to finish.
            </p>
          </div>

          {/* Thumbnail card */}
          <button
            type="button"
            onClick={openModal}
            className="group relative w-full glass-3 rounded-2xl overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617] touch-manipulation"
            aria-label="Play demo video"
          >
            {/* Aspect-ratio container — uses video's native 1280:970 ratio, not 16:9 */}
            <div className="relative overflow-hidden" style={{ aspectRatio: '1280 / 970' }}>
              {/* Poster image */}
              <img
                src="/demo-poster.jpg"
                alt="AI Legion dashboard preview"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                loading="lazy"
                decoding="async"
              />

              {/* Dark gradient overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-black/10 transition-opacity duration-300 group-hover:opacity-80" />

              {/* Play button — large, centered, touch-friendly */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="relative">
                  {/* Pulse ring */}
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" style={{ animationDuration: '2s' }} />
                  {/* Button */}
                  <div className="relative w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-full bg-blue-600/90 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-blue-500/30 transition-all duration-300 group-hover:bg-blue-500 group-hover:scale-110 group-active:scale-95">
                    <Play className="w-7 h-7 sm:w-8 sm:h-8 text-white ml-1" fill="currentColor" />
                  </div>
                </div>
              </div>
            </div>
          </button>

          {/* Caption */}
          <p className="text-center text-sm text-slate-500 mt-4">
            2-minute walkthrough of the AI Legion dashboard
          </p>
        </div>
      </section>

      {/* Fullscreen video modal */}
      {modalOpen && (
        <div
          ref={modalRef}
          onClick={handleOverlayClick}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Demo video"
          style={{ touchAction: 'none' }}
        >
          {/* Close button — large touch target */}
          <button
            onClick={closeModal}
            className="absolute top-3 right-3 sm:top-5 sm:right-5 z-[110] p-3 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/25 transition-colors backdrop-blur-sm touch-manipulation"
            aria-label="Close video"
            style={{ minWidth: 48, minHeight: 48 }}
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Video container
              Mobile: 100vw edge-to-edge, natural aspect ratio (1280:970 ≈ 4:3)
              Desktop: centered, max-width capped, natural ratio */}
          <div
            className="w-screen sm:w-[90vw] sm:max-w-5xl relative"
            style={{ aspectRatio: '1280 / 970', maxHeight: '90vh' }}
          >
            {/* Loading spinner */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="w-12 h-12 border-[3px] border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            )}

            {/* Video */}
            <video
              ref={videoRef}
              className="w-full h-full sm:rounded-xl object-contain bg-black"
              poster="/demo-poster.jpg"
              playsInline
              controls
              preload="none"
              onCanPlay={() => setIsLoading(false)}
              onWaiting={() => setIsLoading(true)}
              onPlaying={() => setIsLoading(false)}
            >
              <source src="/demo-video.webm" type="video/webm" />
              <source src="/demo-video.mp4" type="video/mp4" />
            </video>

            {/* Unmute hint — shows when autoplay fell back to muted */}
            {showUnmuteHint && (
              <button
                onClick={handleUnmute}
                className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-5 py-3 rounded-full bg-blue-600/90 hover:bg-blue-500 active:bg-blue-400 text-white text-sm font-medium shadow-lg shadow-blue-500/25 backdrop-blur-sm transition-all touch-manipulation animate-fade-in"
              >
                <Volume2 className="w-4 h-4" />
                Tap to unmute
              </button>
            )}
          </div>
        </div>
      )}

    </>
  )
}
