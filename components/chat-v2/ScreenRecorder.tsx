'use client'

import { useState, useCallback } from 'react'
import { useMediaRecorder, checkMediaRecorderSupport, getExtensionFromMime, getSupportedMimeType } from './hooks/useMediaRecorder'
import { RecordingIndicator } from './RecordingIndicator'
import { VideoPreview } from './VideoPreview'
import { ChatAttachment } from './ChatMessage'

interface ScreenRecorderProps {
  /** Called when screen recording is ready to send */
  onRecordingReady: (attachment: ChatAttachment, blob: Blob) => void
  /** Called to close the recorder */
  onClose: () => void
  /** Disabled state */
  disabled?: boolean
}

export function ScreenRecorder({
  onRecordingReady,
  onClose,
  disabled = false,
}: ScreenRecorderProps) {
  const [error, setError] = useState<string | null>(null)
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null)
  const [recordingDuration, setRecordingDuration] = useState(0)

  const handleComplete = useCallback((blob: Blob, duration: number) => {
    setRecordingBlob(blob)
    setRecordingDuration(duration)
    
    // Create attachment data
    const mimeType = getSupportedMimeType('screen') || 'video/webm'
    const extension = getExtensionFromMime(mimeType)
    const filename = `screen-${Date.now()}${extension}`
    
    const attachment: ChatAttachment = {
      type: 'video',
      url: '', // Will be filled after upload
      filename,
      mimeType,
      size: blob.size,
      duration,
    }
    
    onRecordingReady(attachment, blob)
  }, [onRecordingReady])

  const handleError = useCallback((err: Error) => {
    setError(err.message)
  }, [])

  const {
    state,
    duration,
    previewUrl,
    start,
    stop,
    cancel,
    reset,
  } = useMediaRecorder({
    type: 'screen',
    maxDuration: 300, // 5 minutes
    onComplete: handleComplete,
    onError: handleError,
  })

  // Check browser support
  const support = checkMediaRecorderSupport()
  if (!support.screen) {
    return (
      <div className="px-4 py-3 bg-red-950/30 border-b border-red-900/50">
        <p className="text-sm text-red-400">
          Screen recording is not supported in your browser.
          Please use Chrome, Firefox, or Edge.
        </p>
        <button
          onClick={onClose}
          className="mt-2 text-xs text-slate-400 hover:text-slate-300"
        >
          Close
        </button>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="px-4 py-3 bg-red-950/30 border-b border-red-900/50">
        <p className="text-sm text-red-400">{error}</p>
        <button
          onClick={() => {
            setError(null)
            onClose()
          }}
          className="mt-2 text-xs text-slate-400 hover:text-slate-300"
        >
          Close
        </button>
      </div>
    )
  }

  // Idle state - prompt to start
  if (state === 'idle' && !recordingBlob) {
    // Auto-start - this will trigger the browser's screen picker
    start()
    return (
      <div className="px-4 py-3 bg-slate-800/80 border-b border-white/[0.06]">
        <p className="text-sm text-slate-400">Choose a screen or window to share...</p>
      </div>
    )
  }

  // Recording state
  if (state === 'recording') {
    return (
      <RecordingIndicator
        type="screen"
        duration={duration}
        onStop={stop}
        onCancel={() => {
          cancel()
          onClose()
        }}
      />
    )
  }

  // Processing state
  if (state === 'processing') {
    return (
      <RecordingIndicator
        type="screen"
        duration={duration}
        isProcessing
        onStop={() => {}}
        onCancel={() => {}}
      />
    )
  }

  // Preview state
  if (state === 'preview' && previewUrl) {
    return (
      <div className="px-3 py-2 border-b border-white/[0.06]">
        <VideoPreview
          src={previewUrl}
          duration={recordingDuration}
          isPreview
          onReRecord={() => {
            reset()
            setTimeout(() => start(), 100)
          }}
          onRemove={() => {
            reset()
            onClose()
          }}
          disabled={disabled}
        />
      </div>
    )
  }

  return null
}
