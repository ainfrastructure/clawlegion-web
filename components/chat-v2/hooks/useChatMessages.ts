'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ChatMessageData, ChatAttachment } from '../ChatMessage'

interface UseChatMessagesOptions {
  roomId: string
  pollInterval?: number  // ms, default 2000
  enabled?: boolean
}

interface UseChatMessagesResult {
  messages: ChatMessageData[]
  isLoading: boolean
  isSending: boolean
  error: Error | null
  sendMessage: (content: string, agents: string[], attachments?: ChatAttachment[]) => Promise<void>
  refetch: () => void
}

export function useChatMessages({
  roomId,
  pollInterval = 2000,
  enabled = true,
}: UseChatMessagesOptions): UseChatMessagesResult {
  const [messages, setMessages] = useState<ChatMessageData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  // Track last message ID to detect new messages
  const lastMessageIdRef = useRef<string | null>(null)

  const fetchMessages = useCallback(async (showLoading = true) => {
    if (!enabled || !roomId) return
    
    if (showLoading) setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/v2/chat/messages?roomId=${encodeURIComponent(roomId)}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          // API not available yet, use empty state
          console.log('[useChatMessages] API not available')
          return
        }
        throw new Error(`Failed to fetch messages: ${response.status}`)
      }
      
      const data = await response.json()
      // Handle both array response and {messages: []} wrapper
      const messagesArr = Array.isArray(data) ? data : (data.messages || [])
      if (messagesArr.length > 0) {
        // Sort oldest first (API returns newest first)
        messagesArr.sort((a: any, b: any) => 
          new Date(a.createdAt || a.timestamp).getTime() - new Date(b.createdAt || b.timestamp).getTime()
        )
        setMessages(messagesArr.map((m: any) => ({
          id: m.id,
          content: m.content,
          senderType: m.senderType,
          senderId: m.senderId,
          senderName: m.senderName,
          timestamp: m.createdAt || m.timestamp,
          attachments: m.attachments,
          messageType: m.messageType,
          mentions: m.mentions,
          mentionedAll: m.mentionedAll,
        })))
        // Update last message ID
        lastMessageIdRef.current = messagesArr[messagesArr.length - 1].id
      } else {
        setMessages([])
      }
    } catch (err) {
      console.error('[useChatMessages] Error fetching messages:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }, [roomId, enabled])

  // Initial fetch
  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Polling for new messages
  useEffect(() => {
    if (!enabled || pollInterval <= 0) return
    
    const interval = setInterval(() => {
      fetchMessages(false) // Don't show loading on poll
    }, pollInterval)
    
    return () => clearInterval(interval)
  }, [enabled, pollInterval, fetchMessages])

  const sendMessage = useCallback(async (content: string, agents: string[], attachments?: ChatAttachment[]) => {
    // Need either content or attachments
    const hasContent = content.trim().length > 0
    const hasAttachments = attachments && attachments.length > 0
    
    if ((!hasContent && !hasAttachments) || agents.length === 0) return
    
    setIsSending(true)
    setError(null)
    
    // Optimistic update - add message immediately
    const tempId = `temp-${Date.now()}`
    const tempMessage: ChatMessageData = {
      id: tempId,
      content,
      senderType: 'human',
      senderId: 'user',
      senderName: 'You',
      timestamp: new Date().toISOString(),
      attachments,
      messageType: hasAttachments && !hasContent ? 'image' : hasAttachments ? 'mixed' : 'text',
    }
    
    setMessages(prev => {
      const prevArray = Array.isArray(prev) ? prev : []
      return [...prevArray, tempMessage]
    })
    
    try {
      const response = await fetch('/api/v2/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          content,
          agents,
          attachments,
        }),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Replace temp message with real one from server
      if (data.message) {
        setMessages(prev => prev.map(m => 
          m.id === tempId ? {
            ...data.message,
            timestamp: data.message.createdAt || data.message.timestamp,
          } : m
        ))
      }
      
      // Fetch to get any agent responses
      setTimeout(() => fetchMessages(false), 500)
      
    } catch (err) {
      console.error('[useChatMessages] Error sending message:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
      
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.id !== tempId))
    } finally {
      setIsSending(false)
    }
  }, [roomId, fetchMessages])

  return {
    messages,
    isLoading,
    isSending,
    error,
    sendMessage,
    refetch: () => fetchMessages(),
  }
}
