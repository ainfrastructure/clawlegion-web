'use client'

import { useState, useRef, useCallback } from 'react'
import { Radio } from 'lucide-react'
import { FleetAgentCard } from './FleetAgentCard'
import { AgentActivityPopover } from './AgentActivityPopover'
import { useAgentActivityStream } from '@/hooks/useAgentActivityStream'
import type { AgentStatus } from '@/components/ui/StatusBadge'

interface FleetAgentCardWithActivityProps {
  agent: {
    id: string
    name: string
    emoji?: string
    avatar?: string
    role?: string
    color?: string
    status: AgentStatus
    currentTask?: string
    healthEndpoint?: string
    reachable?: boolean | null
    latencyMs?: number
  }
  onClick?: () => void
}

const HOVER_DEBOUNCE_MS = 300

/**
 * FleetAgentCard with live activity streaming popover on hover.
 */
export function FleetAgentCardWithActivity({ agent, onClick }: FleetAgentCardWithActivityProps) {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null)
  const [popoverPosition, setPopoverPosition] = useState<'below' | 'above'>('below')
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const isActiveAgent = agent.status === 'busy' || agent.status === 'online'
  const shouldStream = isActiveAgent && hoveredAgent === agent.id

  const { events, isConnected, isLoading, hasEvents } = useAgentActivityStream(
    shouldStream ? agent.id : null
  )

  const handleMouseEnter = useCallback(() => {
    if (!isActiveAgent) return
    hoverTimerRef.current = setTimeout(() => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect()
        const spaceBelow = window.innerHeight - rect.bottom
        setPopoverPosition(spaceBelow < 420 ? 'above' : 'below')
      }
      setHoveredAgent(agent.id)
    }, HOVER_DEBOUNCE_MS)
  }, [agent.id, isActiveAgent])

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
    setHoveredAgent(null)
  }, [])

  return (
    <div
      ref={cardRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Streaming indicator */}
      {isActiveAgent && (
        <div className="absolute top-3 left-3 z-10">
          <div className="flex items-center gap-1">
            <Radio 
              size={10} 
              className={`${shouldStream && isConnected ? 'text-green-400 animate-pulse' : 'text-slate-600/50'} transition-colors`}
            />
            {shouldStream && isConnected && (
              <span className="text-[9px] text-green-400/70 font-medium">LIVE</span>
            )}
          </div>
        </div>
      )}

      <FleetAgentCard agent={agent} onClick={onClick} />

      {/* Activity popover */}
      {hoveredAgent === agent.id && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 ${
            popoverPosition === 'below' 
              ? 'top-full mt-2' 
              : 'bottom-full mb-2'
          }`}
          style={{ zIndex: 50 }}
        >
          <AgentActivityPopover
            events={events}
            isLoading={isLoading}
            isConnected={isConnected}
            hasEvents={hasEvents}
            agentName={agent.name}
            onClose={() => setHoveredAgent(null)}
          />
        </div>
      )}
    </div>
  )
}
