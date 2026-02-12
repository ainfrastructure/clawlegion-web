/**
 * EasyTeamPage — Simplified agent grid for Easy Mode
 *
 * Shows agents in a clean grid with status.
 * No org chart, no config, no inject/pause controls.
 */
'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { PageContainer } from '@/components/layout'
import { SwissHeader, SwissAgentCard, SwissGrid, SwissEmptyState } from '@/components/swiss'
import { Users } from 'lucide-react'

export function EasyTeamPage() {
  const { data: agentsData, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.get('/agents?includeOffline=true').then(r => r.data),
    refetchInterval: 10000,
  })

  // Fetch task data for current task titles
  const { data: boardData } = useQuery({
    queryKey: ['board'],
    queryFn: () => api.get('/tasks/board').then(r => r.data),
    refetchInterval: 10000,
  })

  // Build task lookup for current task titles
  const taskLookup: Record<string, { id: string; title: string }> = {}
  if (boardData?.columns) {
    const columns = boardData.columns as Record<string, any[]>
    for (const tasks of Object.values(columns)) {
      for (const task of tasks) {
        taskLookup[task.id] = { id: task.id, title: task.title }
      }
    }
  }

  // Normalize agents array
  const agents = Array.isArray(agentsData)
    ? agentsData
    : (agentsData?.agents ?? agentsData?.data ?? [])

  // Derive status — all agents are sub-agents, treat as online unless busy
  const processedAgents = agents.map((agent: any) => {
    let status = 'online'
    if (agent.currentTaskId || agent.currentTask) {
      status = 'busy'
    } else if (agent.status === 'rate_limited') {
      status = 'rate_limited'
    }

    return {
      ...agent,
      derivedStatus: status,
      currentTaskInfo: agent.currentTaskId ? taskLookup[agent.currentTaskId] ?? null : null,
    }
  })

  const activeCount = processedAgents.filter((a: any) => a.derivedStatus === 'busy').length

  return (
    <PageContainer>
      <div className="space-y-swiss-6">
        <SwissHeader
          title="Team"
          subtitle={`${processedAgents.length} agents · ${activeCount} active right now`}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-swiss-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[140px] rounded-swiss-md bg-[var(--swiss-surface-raised)] animate-pulse"
              />
            ))}
          </div>
        ) : processedAgents.length === 0 ? (
          <SwissEmptyState
            icon={<Users size={24} />}
            title="No agents found"
            description="Agents will appear here once they're configured."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-swiss-4">
            {processedAgents.map((agent: any) => (
              <SwissAgentCard
                key={agent.id}
                emoji={agent.emoji}
                name={agent.name}
                role={agent.title ?? agent.type}
                description={agent.description}
                status={agent.derivedStatus}
                currentTask={agent.currentTaskInfo}
              />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  )
}
