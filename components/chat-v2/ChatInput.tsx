'use client'

import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent, useCallback } from 'react'
import { Send, MessageCircle, ImagePlus, X, Mic, Monitor } from 'lucide-react'
import Image from 'next/image'
import { AgentConfig } from './agentConfig'
import { ImagePreview, PendingImage } from './ImagePreview'
import { ChatAttachment } from './ChatMessage'
import { VoiceRecorder } from './VoiceRecorder'
import { ScreenRecorder } from './ScreenRecorder'
import { MentionAutocomplete } from './MentionAutocomplete'
import { checkMediaRecorderSupport } from './hooks/useMediaRecorder'
import { cn } from '@/lib/utils'

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

// Pending media state (for voice/screen recordings)
interface PendingMedia {
  id: string
  type: 'video' | 'audio'
  blob: Blob
  attachment: ChatAttachment
  uploadState: 'pending' | 'uploading' | 'uploaded' | 'error'
  error?: string
}

export interface ChatInputProps {
  /** Currently selected agent to send to */
  selectedAgent: AgentConfig | null | undefined
  /** Callback when user sends a message */
  onSend: (content: string, attachments?: ChatAttachment[]) => void
  /** Whether input is disabled */
  disabled?: boolean
  /** Room participants (for @mention autocomplete) */
  roomParticipants?: string[]
  /** Whether we're in room mode (enables @mentions) */
  isRoomMode?: boolean
}

export function ChatInput({ 
  selectedAgent, 
  onSend, 
  disabled,
  roomParticipants,
  isRoomMode,
}: ChatInputProps) {
  const [content, setContent] = useState('')
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([])
  const [pendingMedia, setPendingMedia] = useState<PendingMedia | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [activeRecorder, setActiveRecorder] = useState<'voice' | 'screen' | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Mention autocomplete state
  const [showMentionAutocomplete, setShowMentionAutocomplete] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 })
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(null)
  
  // Check browser support for recording features (must run client-side only to avoid SSR hydration mismatch)
  const [mediaSupport, setMediaSupport] = useState({ voice: false, screen: false })
  useEffect(() => {
    setMediaSupport(checkMediaRecorderSupport())
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const scrollHeight = textarea.scrollHeight
      // Max 4 lines (~96px)
      textarea.style.height = Math.min(scrollHeight, 96) + 'px'
    }
  }, [content])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // If mention autocomplete is open, let it handle navigation keys
    if (showMentionAutocomplete) {
      if (['ArrowDown', 'ArrowUp', 'Enter', 'Tab', 'Escape'].includes(e.key)) {
        // These are handled by MentionAutocomplete component
        return
      }
    }
    
    // Enter to send, Shift+Enter for newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }
  
  // Handle text change and detect @mentions
  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setContent(value)
    
    // Only detect mentions in room mode
    if (!isRoomMode) {
      setShowMentionAutocomplete(false)
      return
    }
    
    const cursorPos = e.target.selectionStart || 0
    const textBeforeCursor = value.slice(0, cursorPos)
    
    // Look for @ followed by word characters at the end of textBeforeCursor
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)
    
    if (mentionMatch) {
      const query = mentionMatch[1]
      const startIdx = cursorPos - mentionMatch[0].length
      
      setMentionQuery(query)
      setMentionStartIndex(startIdx)
      setShowMentionAutocomplete(true)
      
      // Calculate position for dropdown (above the input)
      if (textareaRef.current) {
        const rect = textareaRef.current.getBoundingClientRect()
        // Position above the textarea
        setMentionPosition({
          top: -200, // Will be positioned relative to input container
          left: 12,
        })
      }
    } else {
      setShowMentionAutocomplete(false)
      setMentionStartIndex(null)
    }
  }
  
  // Handle mention selection
  const handleMentionSelect = useCallback((agentId: string, displayName: string) => {
    if (mentionStartIndex === null) return
    
    // Insert the mention at the correct position
    const beforeMention = content.slice(0, mentionStartIndex)
    const afterMention = content.slice(mentionStartIndex + mentionQuery.length + 1) // +1 for @
    const newContent = `${beforeMention}@${displayName} ${afterMention}`
    
    setContent(newContent)
    setShowMentionAutocomplete(false)
    setMentionStartIndex(null)
    
    // Focus back to textarea and set cursor after the mention
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        const newCursorPos = mentionStartIndex + displayName.length + 2 // @ + name + space
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }, [content, mentionStartIndex, mentionQuery])
  
  // Close mention autocomplete
  const handleMentionClose = useCallback(() => {
    setShowMentionAutocomplete(false)
    setMentionStartIndex(null)
  }, [])

  // Upload a single image
  const uploadImage = async (image: PendingImage): Promise<PendingImage> => {
    const formData = new FormData()
    formData.append('image', image.file)
    
    try {
      const response = await fetch('/api/uploads/chat-image', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }
      
      const data = await response.json()
      return {
        ...image,
        uploadState: 'uploaded',
        uploadedData: data,
      }
    } catch (error: any) {
      return {
        ...image,
        uploadState: 'error',
        error: error.message || 'Upload failed',
      }
    }
  }

  // Handle file selection
  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    
    // Validate and create pending images
    const newImages: PendingImage[] = []
    
    for (const file of files) {
      // Validate type
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(`Invalid file type: ${file.name}. Allowed: JPEG, PNG, GIF, WebP`)
        continue
      }
      
      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        alert(`File too large: ${file.name}. Maximum size is 10MB`)
        continue
      }
      
      newImages.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
        uploadState: 'pending',
      })
    }
    
    if (newImages.length === 0) return
    
    // Add to pending images
    setPendingImages(prev => [...prev, ...newImages])
    
    // Start uploading
    setIsUploading(true)
    
    // Upload all new images
    const uploadPromises = newImages.map(async (img) => {
      // Update state to uploading
      setPendingImages(prev => 
        prev.map(p => p.id === img.id ? { ...p, uploadState: 'uploading' } : p)
      )
      
      const result = await uploadImage(img)
      
      // Update state with result
      setPendingImages(prev =>
        prev.map(p => p.id === img.id ? result : p)
      )
      
      return result
    })
    
    await Promise.all(uploadPromises)
    setIsUploading(false)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Remove a pending image
  const handleRemoveImage = (id: string) => {
    setPendingImages(prev => {
      const image = prev.find(p => p.id === id)
      if (image) {
        // Revoke the blob URL to free memory
        URL.revokeObjectURL(image.preview)
      }
      return prev.filter(p => p.id !== id)
    })
  }

  // Upload media (video/audio)
  const uploadMedia = useCallback(async (blob: Blob, type: 'video' | 'audio', attachment: ChatAttachment): Promise<ChatAttachment | null> => {
    const formData = new FormData()
    const fieldName = type === 'video' ? 'video' : 'audio'
    formData.append(fieldName, blob, attachment.filename)
    
    const endpoint = type === 'video' 
      ? '/api/uploads/chat-video' 
      : '/api/uploads/chat-audio'
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }
      
      const data = await response.json()
      return {
        ...attachment,
        url: data.url,
        size: data.size,
      }
    } catch (error: any) {
      console.error('[ChatInput] Upload error:', error)
      throw error
    }
  }, [])

  // Handle voice recording ready
  const handleVoiceRecordingReady = useCallback((attachment: ChatAttachment, blob: Blob) => {
    const id = `media-${Date.now()}`
    setPendingMedia({
      id,
      type: 'audio',
      blob,
      attachment,
      uploadState: 'pending',
    })
  }, [])

  // Handle screen recording ready
  const handleScreenRecordingReady = useCallback((attachment: ChatAttachment, blob: Blob) => {
    const id = `media-${Date.now()}`
    setPendingMedia({
      id,
      type: 'video',
      blob,
      attachment,
      uploadState: 'pending',
    })
  }, [])

  // Close recorder
  const handleCloseRecorder = useCallback(() => {
    setActiveRecorder(null)
  }, [])

  const handleSend = async () => {
    const trimmed = content.trim()
    const uploadedImages = pendingImages.filter(p => p.uploadState === 'uploaded' && p.uploadedData)
    const hasPendingMedia = pendingMedia && pendingMedia.uploadState === 'pending'
    
    // Need either text, uploaded images, or pending media
    if ((!trimmed && uploadedImages.length === 0 && !hasPendingMedia) || disabled || !selectedAgent) return
    
    // Can't send while still uploading
    if (isUploading) return
    
    setIsUploading(true)
    
    // Prepare attachments from images
    const attachments: ChatAttachment[] = uploadedImages.map(img => ({
      type: 'image',
      url: img.uploadedData!.url,
      filename: img.uploadedData!.filename,
      mimeType: img.uploadedData!.mimeType,
      size: img.uploadedData!.size,
      width: img.uploadedData!.width,
      height: img.uploadedData!.height,
    }))
    
    // Upload pending media (voice/video) if exists
    if (pendingMedia && pendingMedia.uploadState === 'pending') {
      try {
        setPendingMedia(prev => prev ? { ...prev, uploadState: 'uploading' } : null)
        
        const uploadedAttachment = await uploadMedia(
          pendingMedia.blob, 
          pendingMedia.type, 
          pendingMedia.attachment
        )
        
        if (uploadedAttachment) {
          attachments.push(uploadedAttachment)
        }
        
        setPendingMedia(prev => prev ? { ...prev, uploadState: 'uploaded' } : null)
      } catch (error: any) {
        setPendingMedia(prev => prev ? { 
          ...prev, 
          uploadState: 'error',
          error: error.message || 'Upload failed'
        } : null)
        setIsUploading(false)
        return // Don't send if upload fails
      }
    }
    
    onSend(trimmed, attachments.length > 0 ? attachments : undefined)
    
    // Clean up
    setContent('')
    pendingImages.forEach(img => URL.revokeObjectURL(img.preview))
    setPendingImages([])
    setPendingMedia(null)
    setActiveRecorder(null)
    setIsUploading(false)
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  // Open file picker
  const handleImageButtonClick = () => {
    fileInputRef.current?.click()
  }

  // Check if we can send
  const canSend = selectedAgent && !disabled && !isUploading && (
    content.trim() || 
    pendingImages.some(p => p.uploadState === 'uploaded') ||
    (pendingMedia && pendingMedia.uploadState === 'pending')
  )

  return (
    <div className="border-t border-slate-800 bg-slate-900/95 backdrop-blur">
      {/* Sending to indicator */}
      <div 
        className={cn(
          'flex items-center gap-3 px-4 py-2.5 transition-colors',
          selectedAgent 
            ? 'bg-slate-800/60' 
            : 'bg-slate-900/50'
        )}
        style={selectedAgent ? { 
          borderLeftWidth: '3px',
          borderLeftColor: selectedAgent.color,
        } : undefined}
      >
        {selectedAgent ? (
          <>
            {/* Agent avatar in badge */}
            <div 
              className="relative w-7 h-7 rounded-full overflow-hidden border-2 flex-shrink-0"
              style={{ borderColor: selectedAgent.color }}
            >
              <Image
                src={selectedAgent.avatar}
                alt={selectedAgent.name}
                fill
                className="object-cover"
              />
            </div>
            
            {/* Badge content */}
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-slate-400">Sending to:</span>
              <span 
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium"
                style={{ 
                  backgroundColor: `${selectedAgent.color}20`,
                  color: selectedAgent.color,
                }}
              >
                <span>{selectedAgent.emoji}</span>
                <span>{selectedAgent.name}</span>
              </span>
              <span className="text-[10px] text-slate-600 uppercase tracking-wide">
                {selectedAgent.role}
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-slate-500">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">Select a bot above to start chatting</span>
          </div>
        )}
      </div>
      
      {/* Active recorder */}
      {activeRecorder === 'voice' && (
        <VoiceRecorder
          onRecordingReady={handleVoiceRecordingReady}
          onClose={handleCloseRecorder}
          disabled={disabled}
        />
      )}
      {activeRecorder === 'screen' && (
        <ScreenRecorder
          onRecordingReady={handleScreenRecordingReady}
          onClose={handleCloseRecorder}
          disabled={disabled}
        />
      )}
      
      {/* Image preview area */}
      {pendingImages.length > 0 && (
        <div className="px-3 pt-2">
          <ImagePreview 
            images={pendingImages}
            onRemove={handleRemoveImage}
            disabled={disabled}
          />
        </div>
      )}
      
      {/* Pending media preview (voice/screen recording) */}
      {pendingMedia && pendingMedia.uploadState === 'pending' && !activeRecorder && (
        <div className="px-3 pt-2">
          <div className="flex items-center justify-between p-2 glass-2 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-2">
              <span>{pendingMedia.type === 'audio' ? '🎤' : '📹'}</span>
              <span className="text-sm text-slate-300">
                {pendingMedia.type === 'audio' ? 'Voice message' : 'Screen recording'} ready
              </span>
              {pendingMedia.attachment.duration && (
                <span className="text-xs text-slate-500">
                  ({Math.floor(pendingMedia.attachment.duration / 60)}:{String(Math.floor(pendingMedia.attachment.duration % 60)).padStart(2, '0')})
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setPendingMedia(null)
              }}
              className="text-xs text-slate-400 hover:text-red-400"
            >
              Remove
            </button>
          </div>
        </div>
      )}
      
      {/* Input area */}
      <div className="p-3">
        <div className="flex items-end gap-2">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {/* Media buttons row */}
          <div className="flex items-center gap-1">
            {/* Image upload button */}
            <button
              onClick={handleImageButtonClick}
              disabled={disabled || !selectedAgent || isUploading || activeRecorder !== null}
              className={cn(
                'flex items-center justify-center',
                'w-10 h-10 rounded-lg',
                'bg-slate-800 text-slate-400 border border-white/[0.06]',
                'hover:bg-slate-700 hover:text-slate-200 hover:border-slate-600',
                'transition-all duration-200',
                'disabled:opacity-40 disabled:cursor-not-allowed'
              )}
              title="Attach images"
            >
              <ImagePlus className="w-4 h-4" />
            </button>
            
            {/* Screen recording button */}
            {mediaSupport.screen && (
              <button
                onClick={() => setActiveRecorder('screen')}
                disabled={disabled || !selectedAgent || isUploading || activeRecorder !== null || pendingMedia !== null}
                className={cn(
                  'flex items-center justify-center',
                  'w-10 h-10 rounded-lg',
                  'bg-slate-800 text-slate-400 border border-white/[0.06]',
                  'hover:bg-slate-700 hover:text-slate-200 hover:border-slate-600',
                  'transition-all duration-200',
                  'disabled:opacity-40 disabled:cursor-not-allowed'
                )}
                title="Record screen"
              >
                <Monitor className="w-4 h-4" />
              </button>
            )}
            
            {/* Voice recording button */}
            {mediaSupport.voice && (
              <button
                onClick={() => setActiveRecorder('voice')}
                disabled={disabled || !selectedAgent || isUploading || activeRecorder !== null || pendingMedia !== null}
                className={cn(
                  'flex items-center justify-center',
                  'w-10 h-10 rounded-lg',
                  'bg-slate-800 text-slate-400 border border-white/[0.06]',
                  'hover:bg-slate-700 hover:text-slate-200 hover:border-slate-600',
                  'transition-all duration-200',
                  'disabled:opacity-40 disabled:cursor-not-allowed'
                )}
                title="Record voice message"
              >
                <Mic className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="relative flex-1">
            {/* Mention Autocomplete */}
            {showMentionAutocomplete && isRoomMode && (
              <div className="absolute bottom-full left-0 mb-2 z-50">
                <MentionAutocomplete
                  query={mentionQuery}
                  participants={roomParticipants}
                  position={{ top: 0, left: 0 }}
                  onSelect={handleMentionSelect}
                  onClose={handleMentionClose}
                />
              </div>
            )}
            
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              placeholder={
                isRoomMode
                  ? 'Type a message... Use @mention to notify agents'
                  : selectedAgent 
                    ? `Message ${selectedAgent.name}...` 
                    : "Select a bot to start chatting..."
              }
              disabled={disabled || !selectedAgent}
              rows={1}
              className={cn(
                'w-full resize-none rounded-lg border',
                'bg-slate-800 px-3 py-2.5 text-sm text-slate-100',
                'placeholder:text-slate-500',
                'focus:outline-none focus:ring-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'min-h-[44px] max-h-[96px]',
                'transition-all duration-200'
              )}
              style={selectedAgent ? { 
                borderColor: `${selectedAgent.color}40`,
                '--tw-ring-color': `${selectedAgent.color}60`,
              } as React.CSSProperties : {
                borderColor: 'rgb(63 63 70)',
              }}
            />
          </div>
          
          <button
            onClick={handleSend}
            disabled={!canSend}
            className={cn(
              'flex items-center justify-center',
              'w-11 h-11 rounded-lg',
              'text-white transition-all duration-200',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'hover:scale-105 active:scale-95',
              !selectedAgent && 'bg-slate-700'
            )}
            style={selectedAgent ? {
              backgroundColor: selectedAgent.color,
            } : undefined}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-2 px-1">
          <p className="text-xs text-slate-600">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">Enter</kbd> to send
          </p>
          <p className="text-xs text-slate-600">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">Shift+Enter</kbd> for new line
          </p>
        </div>
      </div>
    </div>
  )
}
