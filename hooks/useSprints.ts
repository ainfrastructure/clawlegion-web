import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Sprint } from '@/types'

export function useSprints() {
  return useQuery<Sprint[]>({
    queryKey: ['sprints'],
    queryFn: async () => {
      const res = await api.get('/sprints')
      return res.data.sprints
    },
  })
}

export function useActiveSprint() {
  return useQuery<Sprint | null>({
    queryKey: ['sprints', 'active'],
    queryFn: async () => {
      const res = await api.get('/sprints/active')
      return res.data.sprint
    },
    refetchInterval: 15000,
  })
}

export function useSprint(id: string | null) {
  return useQuery<Sprint | null>({
    queryKey: ['sprints', id],
    queryFn: async () => {
      if (!id) return null
      const res = await api.get(`/sprints/${id}`)
      return res.data.sprint
    },
    enabled: !!id,
  })
}

export function useCreateSprint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string; goal?: string; startDate: string; endDate: string }) => {
      const res = await api.post('/sprints', data)
      return res.data.sprint as Sprint
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] })
    },
  })
}

export function useUpdateSprint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; goal?: string; startDate?: string; endDate?: string }) => {
      const res = await api.patch(`/sprints/${id}`, data)
      return res.data.sprint as Sprint
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] })
    },
  })
}

export function useStartSprint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/sprints/${id}/start`)
      return res.data.sprint as Sprint
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] })
    },
  })
}

export function useCompleteSprint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/sprints/${id}/complete`)
      return res.data as { sprint: Sprint; archived: number; rolledBack: number }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] })
      queryClient.invalidateQueries({ queryKey: ['task-tracking-tasks'] })
    },
  })
}

export function useAddTasksToSprint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ sprintId, taskIds }: { sprintId: string; taskIds: string[] }) => {
      const res = await api.post(`/sprints/${sprintId}/tasks`, { taskIds })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] })
      queryClient.invalidateQueries({ queryKey: ['task-tracking-tasks'] })
    },
  })
}

export function useRemoveTaskFromSprint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ sprintId, taskId }: { sprintId: string; taskId: string }) => {
      const res = await api.delete(`/sprints/${sprintId}/tasks/${taskId}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] })
      queryClient.invalidateQueries({ queryKey: ['task-tracking-tasks'] })
    },
  })
}
