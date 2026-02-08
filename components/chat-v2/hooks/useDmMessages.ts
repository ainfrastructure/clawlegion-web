'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ChatMessageData, ChatAttachment } from '../ChatMessage'

interface UseDmMessagesOptions {
  agentId: string
  userId?: string
  pollInterval?: number
  enabled?: boolean
}

interface UseDmMessagesResult {
  messages: ChatMessageData[]
  roomId: string | null
  agentInfo: {
    id: string
    name: string
    color: string
    icon: string
  } | null
  isLoading: boolean
  isSending: boolean
  error: Error | null
  sendMessage: (content: string, attachments?: ChatAttachment[]) => Promise<void>
  refetch: () => Promise<void>
}

export function useDmMessages({
  agentId,
  userId = 'default-user',
  pollInterval = 2000,
  enabled = true,
}: UseDmMessagesOptions): UseDmMessagesResult {
  const [messages, setMessages] = useState<ChatMessageData[]>([])
  const [roomId, setRoomId] = useState<string | null>(null)
  const [agentInfo, setAgentInfo] = useState<UseDmMessagesResult['agentInfo']>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  // Fetch DM (creates if doesn't exist)
  const fetchDm = useCallback(async () => {
    if (!enabled || !agentId) {
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch(`/api/v2/chat/dms/${agentId}?userId=${userId}`)
      
      if (!res.ok) {
        throw new Error(`Failed to fetch DM: ${res.status}`)
      }
      
      const data = await res.json()
      
      if (isMountedRef.current) {
        setRoomId(data.id)
        // Map API response to ChatMessageData format (createdAt -> timestamp)
        const mappedMessages = (data.messages || []).map((m: any) => ({
          id: m.id,
          content: m.content,
          senderType: m.senderType,
          senderId: m.senderId,
          senderName: m.senderName,
          timestamp: m.createdAt || m.timestamp,
          attachments: m.attachments,
          messageType: m.messageType,
        }))
        setMessages(mappedMessages)
        setAgentInfo(data.agent || null)
        setError(null)
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [agentId, userId, enabled])

  // Fetch messages only (for polling)
  const fetchMessages = useCallback(async () => {
    if (!enabled || !roomId) return

    try {
      const res = await fetch(`/api/v2/chat/messages?roomId=${roomId}&limit=100`)
      
      if (res.ok && isMountedRef.current) {
        const data = await res.json()
        // Map API response to ChatMessageData format
        const mappedMessages = (Array.isArray(data) ? data : []).map((m: any) => ({
          id: m.id,
          content: m.content,
          senderType: m.senderType,
          senderId: m.senderId,
          senderName: m.senderName,
          timestamp: m.createdAt || m.timestamp,
          attachments: m.attachments,
          messageType: m.messageType,
        }))
        setMessages(mappedMessages)
      }
    } catch (err) {
      console.error('[useDmMessages] Poll error:', err)
    }
  }, [roomId, enabled])

  // Send message
  const sendMessage = useCallback(async (content: string, attachments?: ChatAttachment[]) => {
    if (!agentId || isSending) return

    setIsSending(true)
    
    try {
      const res = await fetch(`/api/v2/chat/dms/${agentId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          senderId: userId,
          senderName: 'Human',
          userId,
          attachments,
        }),
      })

      if (!res.ok) {
        throw new Error(`Failed to send message: ${res.status}`)
      }

      const result = await res.json()
      
      // Optimistically add message
      if (result.message && isMountedRef.current) {
        const mappedMessage = {
          id: result.message.id,
          content: result.message.content,
          senderType: result.message.senderType,
          senderId: result.message.senderId,
          senderName: result.message.senderName,
          timestamp: result.message.createdAt || result.message.timestamp || new Date().toISOString(),
          attachments: result.message.attachments,
          messageType: result.message.messageType,
        }
        setMessages(prev => {
          const prevArray = Array.isArray(prev) ? prev : []
          return [...prevArray, mappedMessage]
        })
      }
      
      // Update roomId if we didn't have it
      if (result.roomId && !roomId) {
        setRoomId(result.roomId)
      }
    } catch (err) {
      console.error('[useDmMessages] Send error:', err)
      throw err
    } finally {
      if (isMountedRef.current) {
        setIsSending(false)
      }
    }
  }, [agentId, userId, roomId, isSending])

  // Initial fetch when agent changes
  useEffect(() => {
    isMountedRef.current = true
    
    // Only fetch if we have an agentId and are enabled
    if (enabled && agentId) {
      setIsLoading(true)
      setMessages([])
      setRoomId(null)
      
      // Inline fetch to avoid stale closure issues
      const doFetch = async () => {
        try {
          const res = await fetch(`/api/v2/chat/dms/${agentId}?userId=${userId}`)
          
          if (!res.ok) {
            throw new Error(`Failed to fetch DM: ${res.status}`)
          }
          
          const data = await res.json()
          
          if (isMountedRef.current) {
            setRoomId(data.id)
            const mappedMessages = (data.messages || []).map((m: any) => ({
              id: m.id,
              content: m.content,
              senderType: m.senderType,
              senderId: m.senderId,
              senderName: m.senderName,
              timestamp: m.createdAt || m.timestamp,
              attachments: m.attachments,
              messageType: m.messageType,
            }))
            setMessages(mappedMessages)
            setAgentInfo(data.agent || null)
            setError(null)
          }
        } catch (err) {
          if (isMountedRef.current) {
            setError(err instanceof Error ? err : new Error('Unknown error'))
          }
        } finally {
          if (isMountedRef.current) {
            setIsLoading(false)
          }
        }
      }
      
      doFetch()
    } else {
      setIsLoading(false)
    }

    return () => {
      isMountedRef.current = false
    }
  }, [agentId, enabled, userId])

  // Polling
  useEffect(() => {
    if (!enabled || !roomId || pollInterval <= 0) return

    const poll = () => {
      fetchMessages()
      pollTimeoutRef.current = setTimeout(poll, pollInterval)
    }

    pollTimeoutRef.current = setTimeout(poll, pollInterval)

    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current)
      }
    }
  }, [enabled, roomId, pollInterval, fetchMessages])

  return {
    messages,
    roomId,
    agentInfo,
    isLoading,
    isSending,
    error,
    sendMessage,
    refetch: fetchDm,
  }
}
