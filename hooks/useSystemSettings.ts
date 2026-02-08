'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export type IntegrationConfig = {
  linear: { enabled: boolean; teamId: string; syncEnabled: boolean }
  github: { enabled: boolean; repo: string; owner: string; issueCreationEnabled: boolean }
  discord: { enabled: boolean; webhookUrl: string }
}

export type AgentDefaultsConfig = {
  maxConsecutiveFailures: number
  maxTotalFailures: number
  taskTimeoutMinutes: number
  maxThinkingTokens: number
  maxRetries: number
  retryDelaySeconds: number
}

export type SystemSettings = {
  integrations: IntegrationConfig
  agentDefaults: AgentDefaultsConfig
  updatedAt: string
}

export type IntegrationStatus = Record<string, { configured: boolean; envVar: string }>

export type TestResult = { success: boolean; message: string }

/**
 * Fetch system settings
 */
export function useSystemSettings() {
  return useQuery<SystemSettings>({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const res = await api.get('/settings')
      return res.data
    },
    staleTime: 30000,
  })
}

/**
 * Update system settings (partial merge)
 */
export function useUpdateSystemSettings() {
  const queryClient = useQueryClient()

  return useMutation<SystemSettings, Error, Partial<SystemSettings>>({
    mutationFn: async (updates) => {
      const res = await api.put('/settings', updates)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] })
    },
  })
}

/**
 * Get integration env var status (configured or not)
 */
export function useIntegrationStatus() {
  return useQuery<IntegrationStatus>({
    queryKey: ['integration-status'],
    queryFn: async () => {
      const res = await api.get('/settings/integrations/status')
      return res.data
    },
    staleTime: 60000,
  })
}

/**
 * Test a specific integration's connectivity
 */
export function useTestIntegration() {
  return useMutation<TestResult, Error, string>({
    mutationFn: async (provider) => {
      const res = await api.post(`/settings/integrations/${provider}/test`)
      return res.data
    },
  })
}

/**
 * Reset all system settings to defaults
 */
export function useResetSettings() {
  const queryClient = useQueryClient()

  return useMutation<SystemSettings, Error>({
    mutationFn: async () => {
      const res = await api.post('/settings/reset')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] })
    },
  })
}

/**
 * Bulk delete all API keys
 */
export function usePurgeApiKeys() {
  const queryClient = useQueryClient()

  return useMutation<{ deleted: number }, Error>({
    mutationFn: async () => {
      const res = await api.delete('/api-keys/all', {
        headers: { 'X-Confirm-Delete': 'true' },
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
    },
  })
}
