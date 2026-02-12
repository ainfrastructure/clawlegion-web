/**
 * AgentGrid — Easy Mode agent grid view
 *
 * 2-column responsive grid of SwissAgentCards.
 * Simplified status: Online, Busy, Offline.
 * No config, no inject/pause, no system prompt editing.
 */
'use client'

import { useQuery } from '@tanstack/react-query'
import { SwissAgentCard, type SwissAgentStatus } from '@/components/swiss'
import { getAgentByName } from '@/components/chat-v2/agentConfig'
import { Users } from 'lucide-react'

interface ApiAgent {
  id: string
  name: string
  emoji?: string
  avatar?: string
  role?: string
  title?: string
  description?: string
  color?: string
  status: string
  currentTask?: string
  currentTaskId?: string
}

function deriveStatus(agent: ApiAgent): SwissAgentStatus {
  if (agent.currentTask || agent.currentTaskId || agent.status === 'busy') {
    return 'busy'
  }
  if (agent.status === 'offline') {
    return 'offline'
  }
  return 'online'
}

export function AgentGrid() {
  const { data: agentsData, isLoading } = useQuery<ApiAgent[]>({
    queryKey: ['agents-easy'],
    queryFn: async () => {
      const res = await fetch('/api/agents?includeOffline=true')
      if (!res.ok) throw new Error('Failed to fetch agents')
      const data = await res.json()
      return data.agents ?? data ?? []
    },
    refetchInterval: 10000,
  })

  const agents = agentsData ?? []
  const activeCount = agents.filter(a => deriveStatus(a) !== 'offline').length

  return (
    <div className="space-y-swiss-6">
      {/* Header */}
      <div>
        <h1 className="text-swiss-2xl font-semibold text-[var(--swiss-text-primary)] tracking-tight">
          Team
        </h1>
        <p className="text-swiss-sm text-[var(--swiss-text-tertiary)] mt-swiss-1">
          {agents.length} agent{agents.length !== 1 ? 's' : ''} · {activeCount} active right now
        </p>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-swiss-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-32 bg-[var(--swiss-surface-raised)] rounded-swiss-md animate-pulse" />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="flex flex-col items-center text-center py-swiss-10">
          <Users size={32} className="text-[var(--swiss-text-muted)] mb-swiss-4" />
          <p className="text-swiss-base text-[var(--swiss-text-secondary)]">No agents registered</p>
          <p className="text-swiss-sm text-[var(--swiss-text-muted)] mt-swiss-1">
            Agents will appear here once they&apos;re connected
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-swiss-4">
          {agents.map(agent => {
            // Enrich from agentConfig for colors/avatars/descriptions
            const config = getAgentByName(agent.name)
            const status = deriveStatus(agent)

            return (
              <SwissAgentCard
                key={agent.id}
                name={config?.name ?? agent.name}
                emoji={config?.emoji ?? agent.emoji}
                avatar={config?.avatar ?? agent.avatar}
                role={config?.role ?? agent.role ?? agent.title ?? 'Agent'}
                description={config?.description ?? agent.description}
                status={status}
                currentTaskTitle={agent.currentTask}
                currentTaskId={agent.currentTaskId}
                color={config?.color ?? agent.color}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
