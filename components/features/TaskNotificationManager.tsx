'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useToast } from '@/components/ui/Toast'
import { connectSocket, disconnectSocket } from '@/lib/socket'
import type { 
  TaskStatusUpdateEvent,
  TaskCompletedEvent,
  TaskStartedEvent,
  TaskVerifyingEvent,
  TaskVerificationPassedEvent,
  TaskVerificationFailedEvent,
  TaskUpdatedEvent
} from '@/types/task-events'

export function TaskNotificationManager() {
  const toast = useToast()
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting')
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const isComponentMountedRef = useRef(true)

  const handleConnectionError = useCallback(() => {
    if (!isComponentMountedRef.current) return
    
    setConnectionStatus('error')
    toast.error('Connection Lost', {
      message: 'Lost connection to real-time updates. Attempting to reconnect...',
      duration: 5000
    })
  }, [toast])

  const handleReconnect = useCallback(() => {
    if (!isComponentMountedRef.current) return
    
    // Clear any existing timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    // Attempt reconnection after 3 seconds
    reconnectTimeoutRef.current = setTimeout(() => {
      if (!isComponentMountedRef.current) return
      
      try {
        const socket = connectSocket()
        socket.emit('join-notifications')
        setConnectionStatus('connecting')
      } catch (error) {
        console.error('TaskNotificationManager: Reconnection failed:', error)
        handleConnectionError()
      }
    }, 3000)
  }, [handleConnectionError])

  useEffect(() => {
    isComponentMountedRef.current = true
    
    let socket: ReturnType<typeof connectSocket>
    
    try {
      // Connect to WebSocket
      socket = connectSocket()

      // Join notifications room to receive task updates
      socket.emit('join-notifications')

      // Task status update handlers
      socket.on('task:status-updated', (data: TaskStatusUpdateEvent) => {
        if (!isComponentMountedRef.current) return

        const { title, status, previousStatus } = data
        
        // Show different toasts based on status change
        if (status === 'done') {
          toast.taskCompleted(title)
        } else if (status === 'in_progress') {
          toast.info('Task Started', `"${title}" is now in progress`)
        } else if (status === 'verifying') {
          toast.info('Verification Started', `"${title}" submitted for verification`)
        } else {
          // General status change
          const statusMessage = previousStatus 
            ? `Status changed from ${previousStatus} to ${status}`
            : `Status updated to ${status}`
          toast.info('Task Updated', `"${title}": ${statusMessage}`)
        }
      })

      // Task completion handler
      socket.on('task:completed', (data: TaskCompletedEvent) => {
        if (!isComponentMountedRef.current) return
        toast.taskCompleted(data.title)
      })

      // Task started handler
      socket.on('task:started', (data: TaskStartedEvent) => {
        if (!isComponentMountedRef.current) return
        toast.info('Task Started', `"${data.title}" is now in progress`)
      })

      // Verification events
      socket.on('task:verifying', (data: TaskVerifyingEvent) => {
        if (!isComponentMountedRef.current) return
        toast.info('Verification Started', `"${data.title}" submitted for verification`)
      })

      socket.on('task:verification-passed', (data: TaskVerificationPassedEvent) => {
        if (!isComponentMountedRef.current) return
        toast.success('Verification Passed', `"${data.title}" has been verified!`)
      })

      socket.on('task:verification-failed', (data: TaskVerificationFailedEvent) => {
        if (!isComponentMountedRef.current) return
        
        const message = data.reason 
          ? `"${data.title}": ${data.reason}`
          : `"${data.title}" failed verification`
        
        toast.error('Verification Failed', { 
          message,
          duration: 8000  // Keep error notifications longer
        })
      })

      // General task update handler (for non-status changes like assignee, etc.)
      socket.on('task:updated', (data: TaskUpdatedEvent) => {
        if (!isComponentMountedRef.current) return
        
        // Only show for significant changes that don't have specific handlers
        if (data.changes?.assignee && !data.changes?.status) {
          const assigneeName = data.changes.assignee.to || 'Unassigned'
          toast.taskAssigned(data.title, assigneeName)
        }
        // Add more change-specific notifications as needed
      })

      // Connection event handlers
      socket.on('connect', () => {
        if (!isComponentMountedRef.current) return
        
        console.log('TaskNotificationManager: Connected to socket')
        setConnectionStatus('connected')
        
        // Clear any reconnection timeouts
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
          reconnectTimeoutRef.current = undefined
        }
        
        // Show connection restored message only if we were previously disconnected
        if (connectionStatus === 'error' || connectionStatus === 'disconnected') {
          toast.success('Connection Restored', 'Real-time updates are working again')
        }
      })

      socket.on('disconnect', (reason: string) => {
        if (!isComponentMountedRef.current) return
        
        console.log('TaskNotificationManager: Disconnected from socket:', reason)
        setConnectionStatus('disconnected')
        
        // Only attempt reconnection for certain disconnect reasons
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, don't auto-reconnect
          toast.warning('Server Disconnected', 'Real-time updates have been disabled by server')
        } else {
          // Client-side or network issue, attempt reconnection
          handleReconnect()
        }
      })

      socket.on('connect_error', (error: Error) => {
        if (!isComponentMountedRef.current) return
        
        console.error('TaskNotificationManager: Connection error:', error)
        handleConnectionError()
        handleReconnect()
      })

      socket.on('error', (error: any) => {
        if (!isComponentMountedRef.current) return
        
        console.error('TaskNotificationManager: Socket error:', error)
        handleConnectionError()
      })

    } catch (error) {
      console.error('TaskNotificationManager: Failed to initialize socket:', error)
      handleConnectionError()
    }

    // Cleanup on unmount
    return () => {
      isComponentMountedRef.current = false
      
      // Clear any pending reconnection timeouts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      
      if (socket) {
        // Remove all listeners
        socket.off('task:status-updated')
        socket.off('task:completed')
        socket.off('task:started')
        socket.off('task:verifying')
        socket.off('task:verification-passed')
        socket.off('task:verification-failed')
        socket.off('task:updated')
        socket.off('connect')
        socket.off('disconnect')
        socket.off('connect_error')
        socket.off('error')
      }
      
      disconnectSocket()
    }
  }, [toast, connectionStatus, handleConnectionError, handleReconnect])

  // This is an invisible component - it just manages WebSocket connections
  // In development, you could add a small connection status indicator here
  return process.env.NODE_ENV === 'development' ? (
    <div className="fixed bottom-4 left-4 z-50 px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded text-slate-300">
      Socket: {connectionStatus}
    </div>
  ) : null
}