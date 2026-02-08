'use client'

import { useState, useEffect, useCallback } from 'react'
import { Agent } from '../AgentSelector'
import { ALL_AGENTS } from '../agentConfig'

interface UseChatAgentsResult {
  agents: Agent[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

// Derived from canonical agentConfig
const DEFAULT_AGENTS: Agent[] = ALL_AGENTS.map(a => ({
  id: a.id,
  name: a.name,
  color: a.color,
  icon: a.emoji,
  isOnline: true,
}))

export function useChatAgents(): UseChatAgentsResult {
  const [agents, setAgents] = useState<Agent[]>(DEFAULT_AGENTS)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAgents = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/v2/chat/agents')
      
      if (!response.ok) {
        // Fall back to defaults if API not available
        if (response.status === 404) {
          console.log('[useChatAgents] API not available, using defaults')
          setAgents(DEFAULT_AGENTS)
          return
        }
        throw new Error(`Failed to fetch agents: ${response.status}`)
      }
      
      const data = await response.json()
      // Handle both array response and {agents: []} wrapper
      if (Array.isArray(data)) {
        setAgents(data)
      } else if (data.agents && Array.isArray(data.agents)) {
        setAgents(data.agents)
      } else {
        // Fall back to defaults
        setAgents(DEFAULT_AGENTS)
      }
    } catch (err) {
      console.error('[useChatAgents] Error fetching agents:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
      // Use defaults on error
      setAgents(DEFAULT_AGENTS)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  return {
    agents,
    isLoading,
    error,
    refetch: fetchAgents,
  }
}
