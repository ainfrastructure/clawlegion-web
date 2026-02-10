'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getBotById, type BotMember } from './BotArmyStickers'
import { ImageLightbox } from './ImageLightbox'
import { MentionHighlight } from './MentionHighlight'

export interface ChatAttachment {
  type: 'image' | 'video' | 'audio'
  url: string
  filename: string
  mimeType: string
  size: number
  // Image/video dimensions
  width?: number
  height?: number
  // Media duration (video/audio) in seconds
  duration?: number
  // Thumbnail for video (optional)
  thumbnail?: string
}

export interface ReadReceipt {
  botId: string
  readAt: string
}

export interface ChatMessageData {
  id: string
  content: string
  senderType: 'human' | 'agent'
  senderId: string
  senderName: string
  timestamp: string
  agentColor?: string  // for agent messages
  readBy?: ReadReceipt[]  // bots that have read this message
  attachments?: ChatAttachment[]
  messageType?: 'text' | 'image' | 'video' | 'audio' | 'mixed'
  mentions?: string[]  // agent IDs mentioned in this message
  mentionedAll?: boolean  // whether @all was used
}

export interface ChatMessageProps extends ChatMessageData {}

// Helper to check if content has mentions
function hasMentions(content: string): boolean {
  return /@\w+/.test(content)
}

function formatTime(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

// Default avatar paths for agents
const AGENT_AVATARS: Record<string, string> = {
  'caesar': '/agents/caesar.png',
  'main': '/agents/caesar.png',
  'lux': '/agents/lux-lobster.png',
  'athena': '/agents/athena.png',
  'vulcan': '/agents/vulcan.png',
  'janus': '/agents/janus.png',
  'hermes': '/agents/hermes.png',
  'ralph': '/agents/ralph.png',
  'quill': '/agents/quill-writer.svg',
  'pixel': '/agents/pixel-designer.svg',
  'sage': '/agents/sage-analyst.svg',
}

// Default colors for agents
const AGENT_COLORS: Record<string, string> = {
  'caesar': '#DC2626',
  'main': '#DC2626',
  'lux': '#22C55E',
  'athena': '#06B6D4',
  'vulcan': '#F59E0B',
  'janus': '#1E40AF',
  'hermes': '#10B981',
  'ralph': '#EC4899',
  'quill': '#F97316',
  'pixel': '#D946EF',
  'sage': '#14B8A6',
}

function getAgentAvatar(senderId: string): string | undefined {
  const lowerId = senderId.toLowerCase()
  return AGENT_AVATARS[lowerId]
}

function getAgentColor(senderId: string): string {
  const lowerId = senderId.toLowerCase()
  return AGENT_COLORS[lowerId] || '#F97316'
}

// Check if a senderId is a known agent (case-insensitive)
function isKnownAgent(senderId: string): boolean {
  const lowerId = senderId.toLowerCase()
  return lowerId in AGENT_AVATARS
}

function getSenderIcon(senderType: 'human' | 'agent', senderId: string): string {
  if (senderType === 'human') return '🧑'
  const bot = getBotById(senderId)
  if (bot) return bot.emoji
  // Fallback for unknown agents
  const agentIcons: Record<string, string> = {
    'caesar': '🔴',
    'main': '🔴',
    'lux': '✨',
    'athena': '🩵',
    'vulcan': '🔥',
    'janus': '🌗',
    'hermes': '💚',
    'ralph': '🔄',
    'quill': '🪶',
    'pixel': '🎨',
    'sage': '📊',
  }
  return agentIcons[senderId.toLowerCase()] || '🤖'
}

interface ReadReceiptsProps {
  readBy: ReadReceipt[]
}

function ReadReceipts({ readBy }: ReadReceiptsProps) {
  if (!readBy || readBy.length === 0) return null

  // Get bot info for each reader
  const readers = readBy
    .map(r => getBotById(r.botId))
    .filter(Boolean) as BotMember[]

  if (readers.length === 0) return null

  return (
    <div className="flex items-center gap-0.5 mt-1 justify-end">
      {/* "Read by" text for accessibility */}
      <span className="sr-only">
        Read by {readers.map(r => r.name).join(', ')}
      </span>
      
      {/* Stacked mini avatars */}
      <div className="flex -space-x-1.5">
        {readers.slice(0, 4).map((bot) => (
          <div
            key={bot.id}
            className="relative w-4 h-4 rounded-full overflow-hidden border border-white/[0.06] bg-slate-800"
            title={`Read by ${bot.name}`}
          >
            <Image
              src={bot.avatar}
              alt={bot.name}
              fill
              className="object-cover opacity-70 hover:opacity-100 transition-opacity"
            />
          </div>
        ))}
        {readers.length > 4 && (
          <div className="flex items-center justify-center w-4 h-4 rounded-full bg-slate-700 text-[8px] text-slate-400">
            +{readers.length - 4}
          </div>
        )}
      </div>
    </div>
  )
}

export function ChatMessage({ 
  content, 
  senderType, 
  senderId, 
  senderName, 
  timestamp, 
  agentColor,
  readBy,
  attachments,
  mentions,
}: ChatMessageProps) {
  // Treat as agent if senderType is 'agent' OR if senderId is a known bot
  const isAgent = senderType === 'agent' || isKnownAgent(senderId)
  const icon = getSenderIcon(senderType, senderId)
  const bot = isAgent ? getBotById(senderId) : null
  
  // Get avatar with fallback - ALWAYS try to get avatar for known agents
  const avatarPath = bot?.avatar ?? getAgentAvatar(senderId)
  const avatarColor = bot?.color ?? getAgentColor(senderId)
  
  // Lightbox state for viewing images full-screen
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  
  // Dynamic styles for agent messages
  const agentBgColor = agentColor ? `${agentColor}10` : (avatarColor ? `${avatarColor}10` : 'rgba(249, 115, 22, 0.1)')
  const agentBorderColor = agentColor || avatarColor || '#F97316'
  
  return (
    <>
      <div
        className={cn(
          'w-full rounded-lg p-3',
          !isAgent && 'bg-slate-800'
        )}
        style={isAgent ? {
          backgroundColor: agentBgColor,
          borderLeft: `2px solid ${agentBorderColor}`
        } : undefined}
      >
        {/* Header: icon/avatar + name + timestamp */}
        <div className="flex items-center gap-2 mb-1">
          {/* Show mini avatar for agent, emoji for human */}
          {avatarPath ? (
            <div
              className="relative w-5 h-5 rounded-full overflow-hidden border"
              style={{ borderColor: avatarColor || '#F97316' }}
            >
              <Image
                src={avatarPath}
                alt={senderName}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <span className="text-sm">{icon}</span>
          )}
          
          <span className={cn(
            'font-medium text-sm',
            isAgent ? 'text-white' : 'text-slate-300'
          )} style={isAgent && avatarColor ? { color: avatarColor } : undefined}>
            {senderName}
          </span>
          <span className="text-slate-500 text-xs ml-auto">
            {formatTime(timestamp)}
          </span>
        </div>
        
        {/* Content */}
        {content && (
          <div className="text-slate-200 text-sm whitespace-pre-wrap break-words">
            {hasMentions(content) ? (
              <MentionHighlight content={content} mentions={mentions} />
            ) : (
              content
            )}
          </div>
        )}

        {/* Media Attachments */}
        {attachments && attachments.length > 0 && (
          <div className={cn('flex flex-col gap-2', content && 'mt-2')}>
            {attachments.map((attachment, idx) => {
              // Image attachment
              if (attachment.type === 'image') {
                return (
                  <div 
                    key={idx}
                    className="relative rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ 
                      maxWidth: attachments.length === 1 ? '300px' : '150px',
                      aspectRatio: attachment.width && attachment.height 
                        ? `${attachment.width} / ${attachment.height}` 
                        : undefined
                    }}
                    onClick={() => setLightboxImage(attachment.url)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- dynamic user attachment */}
                    <img
                      src={attachment.url}
                      alt={attachment.filename}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )
              }
              
              // Video attachment (screen recording)
              if (attachment.type === 'video') {
                return (
                  <div key={idx} className="max-w-md rounded-lg overflow-hidden bg-slate-900">
                    <video
                      src={attachment.url}
                      poster={attachment.thumbnail}
                      controls
                      preload="metadata"
                      className="w-full max-h-[300px] object-contain"
                      playsInline
                    />
                    <div className="px-2 py-1 glass-2 text-xs text-slate-500 flex items-center gap-2">
                      <span>📹</span>
                      <span>Screen Recording</span>
                      {attachment.duration && (
                        <span>• {Math.floor(attachment.duration / 60)}:{String(Math.floor(attachment.duration % 60)).padStart(2, '0')}</span>
                      )}
                    </div>
                  </div>
                )
              }
              
              // Audio attachment (voice message)
              if (attachment.type === 'audio') {
                return (
                  <div key={idx} className="max-w-sm rounded-lg overflow-hidden glass-2 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">🎤</span>
                      <span className="text-xs text-slate-400">Voice Message</span>
                      {attachment.duration && (
                        <span className="text-xs text-slate-500">
                          • {Math.floor(attachment.duration / 60)}:{String(Math.floor(attachment.duration % 60)).padStart(2, '0')}
                        </span>
                      )}
                    </div>
                    <audio
                      src={attachment.url}
                      controls
                      preload="metadata"
                      className="w-full h-10"
                      style={{ 
                        filter: 'invert(1) hue-rotate(180deg)',
                        opacity: 0.8
                      }}
                    />
                  </div>
                )
              }
              
              return null
            })}
          </div>
        )}

        {/* Read receipts - only show for human messages */}
        {!isAgent && readBy && readBy.length > 0 && (
          <ReadReceipts readBy={readBy} />
        )}
      </div>
      
      {/* Image Lightbox */}
      {lightboxImage && (
        <ImageLightbox 
          imageUrl={lightboxImage} 
          onClose={() => setLightboxImage(null)} 
        />
      )}
    </>
  )
}
