'use client'

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { connectSocket } from '@/lib/socket'

export function useNotificationSocket() {
  const queryClient = useQueryClient()
  const connectedRef = useRef(false)

  useEffect(() => {
    if (connectedRef.current) return
    connectedRef.current = true

    const socket = connectSocket()
    socket.emit('join-notifications')

    const handleNew = (notification: { id: string; severity: string; title: string }) => {
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] })
      queryClient.invalidateQueries({ queryKey: ['user-notifications-unread-count'] })
    }

    const handleCount = (data: { count: number }) => {
      queryClient.setQueryData(['user-notifications-unread-count'], { count: data.count })
    }

    socket.on('notification:new', handleNew)
    socket.on('notification:count', handleCount)

    return () => {
      socket.off('notification:new', handleNew)
      socket.off('notification:count', handleCount)
      connectedRef.current = false
    }
  }, [queryClient])
}
