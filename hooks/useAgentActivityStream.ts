'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { connectSocket, getSocket } from '@/lib/socket'

/**
 * Parsed activity entry from the backend.
 */
export interface ParsedActivity {
  timestamp: string
  type: 'session_start' | 'message' | 'tool_call' | 'tool_result' | 'model_change' | 'thinking' | 'system'
  icon: string
  summary: string
  detail?: string
}

interface ActivityBackfill {
  agentName: string
  sessionId: string
  events: ParsedActivity[]
}

interface ActivityEvents {
  agentName: string
  sessionId: string
  events: ParsedActivity[]
}

const MAX_EVENTS = 100

/**
 * Hook to subscribe to real-time agent activity via Socket.io.
 * 
 * Manages WebSocket subscription lifecycle with debouncing
 * to prevent rapid subscribe/unsubscribe on mouse hover.
 * 
 * @param agentName - The agent to watch, or null to not watch anything
 * @param options - Configuration options
 */
export function useAgentActivityStream(
  agentName: string | null,
  options: {
    /** Number of historical events to request (default: 30) */
    backfillCount?: number
    /** Max events to keep in buffer (default: 100) */
    maxEvents?: number
    /** Whether the stream is enabled (default: true) */
    enabled?: boolean
  } = {}
) {
  const {
    backfillCount = 30,
    maxEvents = MAX_EVENTS,
    enabled = true,
  } = options

  const [events, setEvents] = useState<ParsedActivity[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const currentAgentRef = useRef<string | null>(null)

  const handleBackfill = useCallback((data: ActivityBackfill) => {
    if (data.agentName !== currentAgentRef.current) return
    setEvents(data.events.slice(-maxEvents))
    setSessionId(data.sessionId || null)
    setIsLoading(false)
  }, [maxEvents])

  const handleEvents = useCallback((data: ActivityEvents) => {
    if (data.agentName !== currentAgentRef.current) return
    setEvents(prev => {
      const updated = [...prev, ...data.events]
      return updated.slice(-maxEvents)
    })
  }, [maxEvents])

  const handleReset = useCallback((data: { agentName: string }) => {
    if (data.agentName !== currentAgentRef.current) return
    setEvents([])
  }, [])

  useEffect(() => {
    if (!agentName || !enabled) {
      setEvents([])
      setSessionId(null)
      setIsLoading(false)
      currentAgentRef.current = null
      return
    }

    currentAgentRef.current = agentName
    setIsLoading(true)

    const socket = connectSocket()
    setIsConnected(socket.connected)

    // Subscribe to agent activity
    socket.emit('subscribe:agent', {
      agentName,
      lastN: backfillCount,
    })

    // Listen for events
    socket.on('activity:backfill', handleBackfill)
    socket.on('activity:events', handleEvents)
    socket.on('activity:reset', handleReset)

    const onConnect = () => {
      setIsConnected(true)
      // Re-subscribe on reconnect
      if (currentAgentRef.current) {
        socket.emit('subscribe:agent', {
          agentName: currentAgentRef.current,
          lastN: backfillCount,
        })
      }
    }

    const onDisconnect = () => {
      setIsConnected(false)
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    return () => {
      // Unsubscribe from agent activity
      socket.emit('unsubscribe:agent', { agentName })

      socket.off('activity:backfill', handleBackfill)
      socket.off('activity:events', handleEvents)
      socket.off('activity:reset', handleReset)
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)

      currentAgentRef.current = null
    }
  }, [agentName, enabled, backfillCount, handleBackfill, handleEvents, handleReset])

  return {
    events,
    isConnected,
    isLoading,
    sessionId,
    hasEvents: events.length > 0,
  }
}
