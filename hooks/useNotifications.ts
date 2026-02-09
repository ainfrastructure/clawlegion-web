'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export type UserNotification = {
  id: string
  category: string
  eventType: string
  severity: string
  title: string
  body: string
  taskId: string | null
  taskShortId: string | null
  activityId: string | null
  actor: string | null
  actorType: string | null
  read: boolean
  readAt: string | null
  channels: string[]
  deliveredTo: Record<string, unknown>
  createdAt: string
}

type NotificationsResponse = {
  notifications: UserNotification[]
  hasMore: boolean
  nextCursor: string | null
}

type ListOptions = {
  category?: string
  severity?: string
  unreadOnly?: boolean
  taskId?: string
  search?: string
  limit?: number
  cursor?: string
}

export function useNotifications(options: ListOptions = {}) {
  const { category, severity, unreadOnly, taskId, search, limit = 30, cursor } = options

  return useQuery<NotificationsResponse>({
    queryKey: ['user-notifications', category, severity, unreadOnly, taskId, search, cursor],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (category && category !== 'all') params.set('category', category)
      if (severity) params.set('severity', severity)
      if (unreadOnly) params.set('unreadOnly', 'true')
      if (taskId) params.set('taskId', taskId)
      if (search) params.set('search', search)
      params.set('limit', String(limit))
      if (cursor) params.set('cursor', cursor)

      const res = await api.get(`/user-notifications?${params.toString()}`)
      return res.data
    },
    refetchInterval: 15000,
  })
}

export function useUnreadCount() {
  return useQuery<{ count: number }>({
    queryKey: ['user-notifications-unread-count'],
    queryFn: async () => {
      const res = await api.get('/user-notifications/unread-count')
      return res.data
    },
    refetchInterval: 10000,
  })
}

export function useMarkRead() {
  const queryClient = useQueryClient()

  return useMutation<UserNotification, Error, string>({
    mutationFn: async (id) => {
      const res = await api.patch(`/user-notifications/${id}/read`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] })
      queryClient.invalidateQueries({ queryKey: ['user-notifications-unread-count'] })
    },
  })
}

export function useMarkAllRead() {
  const queryClient = useQueryClient()

  return useMutation<{ updated: number }, Error, { category?: string } | void>({
    mutationFn: async (params) => {
      const res = await api.post('/user-notifications/mark-all-read', params || {})
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] })
      queryClient.invalidateQueries({ queryKey: ['user-notifications-unread-count'] })
    },
  })
}

export function useDeleteNotification() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/user-notifications/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] })
      queryClient.invalidateQueries({ queryKey: ['user-notifications-unread-count'] })
    },
  })
}

export function useClearRead() {
  const queryClient = useQueryClient()

  return useMutation<{ deleted: number }, Error>({
    mutationFn: async () => {
      const res = await api.post('/user-notifications/clear')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] })
      queryClient.invalidateQueries({ queryKey: ['user-notifications-unread-count'] })
    },
  })
}
