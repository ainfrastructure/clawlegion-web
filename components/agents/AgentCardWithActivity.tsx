'use client'

import { useState, useRef, useCallback } from 'react'
import { Radio } from 'lucide-react'
import { AgentCard, type AgentData } from './AgentCard'
import { AgentActivityPopover } from './AgentActivityPopover'
import { useAgentActivityStream } from '@/hooks/useAgentActivityStream'

interface AgentCardWithActivityProps {
  agent: AgentData
  variant?: 'full' | 'compact' | 'mini'
  showStats?: boolean
  showHealth?: boolean
  showActions?: boolean
  className?: string
  onClick?: () => void
  onPause?: () => void
  onConfigure?: () => void
  /** Disable the activity popover (default: false) */
  disableActivity?: boolean
}

/** Hover debounce delay in ms */
const HOVER_DEBOUNCE_MS = 300

/**
 * Wrapper around AgentCard that adds live activity streaming on hover.
 * Shows a popover with real-time agent activity when the user hovers
 * for more than 300ms over a busy/online agent.
 */
export function AgentCardWithActivity({
  agent,
  disableActivity = false,
  ...props
}: AgentCardWithActivityProps) {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null)
  const [popoverPosition, setPopoverPosition] = useState<'below' | 'above'>('below')
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // Only enable activity stream for active agents
  const isActiveAgent = agent.status === 'busy' || agent.status === 'online'
  const shouldStream = !disableActivity && isActiveAgent && hoveredAgent === agent.id

  const { events, isConnected, isLoading, hasEvents } = useAgentActivityStream(
    shouldStream ? agent.id : null
  )

  const handleMouseEnter = useCallback(() => {
    if (disableActivity || !isActiveAgent) return

    hoverTimerRef.current = setTimeout(() => {
      // Determine popover position based on card position in viewport
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect()
        const spaceBelow = window.innerHeight - rect.bottom
        setPopoverPosition(spaceBelow < 420 ? 'above' : 'below')
      }
      setHoveredAgent(agent.id)
    }, HOVER_DEBOUNCE_MS)
  }, [agent.id, disableActivity, isActiveAgent])

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
      {/* Activity indicator dot (shown when agent is active) */}
      {isActiveAgent && !disableActivity && (
        <div className="absolute top-2 right-2 z-10">
          <Radio 
            size={10} 
            className={`${shouldStream && isConnected ? 'text-green-400 animate-pulse' : 'text-slate-600'} transition-colors`}
          />
        </div>
      )}

      <AgentCard agent={agent} {...props} />

      {/* Activity popover */}
      {hoveredAgent === agent.id && (
        <div
          className={`absolute left-0 right-0 ${
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
