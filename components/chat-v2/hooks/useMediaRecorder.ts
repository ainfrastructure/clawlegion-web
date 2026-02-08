'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

export type RecordingType = 'screen' | 'voice'
export type RecordingState = 'idle' | 'recording' | 'processing' | 'preview'

interface UseMediaRecorderOptions {
  type: RecordingType
  maxDuration?: number // seconds
  onComplete: (blob: Blob, duration: number) => void
  onError?: (error: Error) => void
}

interface UseMediaRecorderResult {
  state: RecordingState
  duration: number
  blob: Blob | null
  previewUrl: string | null
  start: () => Promise<void>
  stop: () => void
  cancel: () => void
  reset: () => void
}

// Check browser support for recording
export function checkMediaRecorderSupport(): { voice: boolean; screen: boolean } {
  const hasMediaRecorder = typeof MediaRecorder !== 'undefined'
  const hasGetUserMedia = !!(navigator.mediaDevices?.getUserMedia)
  const hasGetDisplayMedia = !!(navigator.mediaDevices?.getDisplayMedia)

  return {
    voice: hasMediaRecorder && hasGetUserMedia,
    screen: hasMediaRecorder && hasGetDisplayMedia,
  }
}

// Get supported MIME type for recording
export function getSupportedMimeType(type: RecordingType): string | null {
  if (typeof MediaRecorder === 'undefined') return null
  
  // Priority order for each type
  const mimeTypes = type === 'screen'
    ? [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4', // Safari
      ]
    : [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4', // Safari
      ]

  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType
    }
  }
  
  return null
}

// Get file extension from MIME type
export function getExtensionFromMime(mimeType: string): string {
  if (mimeType.startsWith('video/webm')) return '.webm'
  if (mimeType.startsWith('video/mp4')) return '.mp4'
  if (mimeType.startsWith('audio/webm')) return '.webm'
  if (mimeType.startsWith('audio/ogg')) return '.ogg'
  if (mimeType.startsWith('audio/mp4')) return '.m4a'
  return mimeType.startsWith('video') ? '.webm' : '.webm'
}

export function useMediaRecorder({
  type,
  maxDuration = type === 'screen' ? 300 : 120, // 5min screen, 2min voice
  onComplete,
  onError,
}: UseMediaRecorderOptions): UseMediaRecorderResult {
  const [state, setState] = useState<RecordingState>('idle')
  const [duration, setDuration] = useState(0)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  // Cleanup function
  const cleanup = useCallback(() => {
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    
    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    // Clear recorder
    mediaRecorderRef.current = null
    chunksRef.current = []
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [cleanup, previewUrl])

  const start = useCallback(async () => {
    try {
      // Get supported MIME type
      const mimeType = getSupportedMimeType(type)
      if (!mimeType) {
        throw new Error(`${type === 'screen' ? 'Screen' : 'Voice'} recording not supported in this browser`)
      }

      // Request media stream
      let stream: MediaStream
      
      if (type === 'screen') {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: 1920, max: 1920 },
            height: { ideal: 1080, max: 1080 },
            frameRate: { ideal: 30, max: 30 },
          },
          audio: true, // Include system audio if available
        })
        
        // Handle user stopping share via browser UI
        stream.getVideoTracks()[0].addEventListener('ended', () => {
          if (state === 'recording') {
            stop()
          }
        })
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 48000,
          },
        })
      }

      streamRef.current = stream
      chunksRef.current = []

      // Create MediaRecorder
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: type === 'screen' ? 2500000 : undefined, // 2.5 Mbps for video
        audioBitsPerSecond: 128000, // 128 kbps for audio
      })

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        setState('processing')
        
        const recordingBlob = new Blob(chunksRef.current, { type: mimeType })
        const recordingDuration = Math.floor((Date.now() - startTimeRef.current) / 1000)
        
        setBlob(recordingBlob)
        setDuration(recordingDuration)
        
        // Create preview URL
        const url = URL.createObjectURL(recordingBlob)
        setPreviewUrl(url)
        
        // Call completion callback
        onComplete(recordingBlob, recordingDuration)
        
        setState('preview')
        cleanup()
      }

      recorder.onerror = (event: any) => {
        const error = new Error(event.error?.message || 'Recording failed')
        onError?.(error)
        cleanup()
        setState('idle')
      }

      mediaRecorderRef.current = recorder
      
      // Start recording - collect data every second
      recorder.start(1000)
      startTimeRef.current = Date.now()
      setState('recording')
      setDuration(0)

      // Start duration timer
      timerRef.current = setInterval(() => {
        setDuration(d => {
          const newDuration = d + 1
          if (newDuration >= maxDuration) {
            // Auto-stop at max duration
            stop()
          }
          return newDuration
        })
      }, 1000)

    } catch (err: any) {
      console.error('[useMediaRecorder] Error starting recording:', err)
      
      // Handle specific errors
      let errorMessage = err.message || 'Failed to start recording'
      if (err.name === 'NotAllowedError') {
        errorMessage = type === 'screen' 
          ? 'Screen sharing was denied or cancelled'
          : 'Microphone access was denied'
      } else if (err.name === 'NotFoundError') {
        errorMessage = type === 'screen'
          ? 'No screen available to capture'
          : 'No microphone found'
      }
      
      onError?.(new Error(errorMessage))
      cleanup()
      setState('idle')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- stop is defined below and uses same refs
  }, [type, maxDuration, onComplete, onError, cleanup, state])

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const cancel = useCallback(() => {
    cleanup()
    
    // Revoke preview URL if exists
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    
    setBlob(null)
    setDuration(0)
    setState('idle')
  }, [cleanup, previewUrl])

  const reset = useCallback(() => {
    // Revoke preview URL if exists
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    
    setBlob(null)
    setDuration(0)
    setState('idle')
  }, [previewUrl])

  return {
    state,
    duration,
    blob,
    previewUrl,
    start,
    stop,
    cancel,
    reset,
  }
}
