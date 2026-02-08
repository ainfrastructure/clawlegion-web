'use client'

import { X, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PendingImage {
  id: string                      // Temporary ID for tracking
  file: File                       // The original file
  preview: string                  // Local preview URL (blob)
  uploadState: 'pending' | 'uploading' | 'uploaded' | 'error'
  uploadedData?: {                 // Data from server after upload
    url: string
    filename: string
    mimeType: string
    size: number
    width: number
    height: number
  }
  error?: string
}

export interface ImagePreviewProps {
  images: PendingImage[]
  onRemove: (id: string) => void
  disabled?: boolean
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function ImagePreview({ images, onRemove, disabled }: ImagePreviewProps) {
  if (images.length === 0) return null
  
  return (
    <div className="flex flex-wrap gap-2 p-2 glass-2 rounded-lg">
      {images.map((image) => (
        <div
          key={image.id}
          className={cn(
            'relative group rounded-lg overflow-hidden',
            'border-2 transition-colors',
            image.uploadState === 'error' 
              ? 'border-red-500/50' 
              : image.uploadState === 'uploaded'
                ? 'border-green-500/50'
                : 'border-slate-600'
          )}
        >
          {/* Image thumbnail */}
          <div className="w-20 h-20 relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- dynamic user upload */}
            <img
              src={image.preview}
              alt={image.file.name}
              className={cn(
                'w-full h-full object-cover',
                image.uploadState === 'uploading' && 'opacity-50'
              )}
            />
            
            {/* Upload state overlay */}
            {image.uploadState === 'uploading' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
            
            {image.uploadState === 'error' && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
            )}
            
            {image.uploadState === 'uploaded' && (
              <div className="absolute bottom-0 left-0 right-0 bg-green-500/80 text-white text-[10px] text-center py-0.5">
                ✓ Ready
              </div>
            )}
          </div>
          
          {/* Remove button */}
          <button
            onClick={() => onRemove(image.id)}
            disabled={disabled || image.uploadState === 'uploading'}
            className={cn(
              'absolute -top-1 -right-1 p-1 rounded-full',
              'bg-slate-900 border border-white/[0.06]',
              'text-slate-400 hover:text-white hover:bg-red-500 hover:border-red-500',
              'transition-colors opacity-0 group-hover:opacity-100',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            title="Remove image"
          >
            <X className="w-3 h-3" />
          </button>
          
          {/* File info tooltip on hover */}
          <div className={cn(
            'absolute bottom-0 left-0 right-0 p-1',
            'bg-black/70 text-white text-[10px]',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            'truncate'
          )}>
            {image.file.name} ({formatFileSize(image.file.size)})
          </div>
        </div>
      ))}
      
      {/* Summary text */}
      <div className="flex items-center px-2 text-xs text-slate-500">
        {images.length} image{images.length !== 1 ? 's' : ''} selected
        {images.some(i => i.uploadState === 'uploading') && (
          <span className="ml-2 text-yellow-500">Uploading...</span>
        )}
        {images.some(i => i.uploadState === 'error') && (
          <span className="ml-2 text-red-400">Upload failed</span>
        )}
      </div>
    </div>
  )
}
