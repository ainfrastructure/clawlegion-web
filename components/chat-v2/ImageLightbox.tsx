'use client'

import { useEffect, useCallback } from 'react'
import { X, Download, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ImageLightboxProps {
  imageUrl: string
  onClose: () => void
}

export function ImageLightbox({ imageUrl, onClose }: ImageLightboxProps) {
  // Handle keyboard events
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])
  
  // Add keyboard listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])
  
  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }
  
  // Handle download
  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = imageUrl.split('/').pop() || 'image'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download image:', error)
    }
  }
  
  // Open in new tab
  const handleOpenInNewTab = () => {
    window.open(imageUrl, '_blank')
  }
  
  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={handleOpenInNewTab}
          className={cn(
            'p-2 rounded-lg bg-slate-800/80 text-slate-300',
            'hover:bg-slate-700 hover:text-white transition-colors'
          )}
          title="Open in new tab"
        >
          <ExternalLink className="w-5 h-5" />
        </button>
        <button
          onClick={handleDownload}
          className={cn(
            'p-2 rounded-lg bg-slate-800/80 text-slate-300',
            'hover:bg-slate-700 hover:text-white transition-colors'
          )}
          title="Download"
        >
          <Download className="w-5 h-5" />
        </button>
        <button
          onClick={onClose}
          className={cn(
            'p-2 rounded-lg bg-slate-800/80 text-slate-300',
            'hover:bg-slate-700 hover:text-white transition-colors'
          )}
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Image */}
      {/* eslint-disable-next-line @next/next/no-img-element -- dynamic user attachment */}
      <img
        src={imageUrl}
        alt="Full size view"
        className="max-w-full max-h-full object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
      
      {/* Hint text */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-slate-500 text-sm">
        Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-xs">Esc</kbd> or click outside to close
      </div>
    </div>
  )
}
