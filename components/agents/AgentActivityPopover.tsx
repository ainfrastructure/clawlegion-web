'use client'

import { useEffect, useRef, useState } from 'react'
import { Radio, X, ChevronDown } from 'lucide-react'
import { type ParsedActivity } from '@/hooks/useAgentActivityStream'

interface AgentActivityPopoverProps {
  events: ParsedActivity[]
  isLoading: boolean
  isConnected: boolean
  hasEvents: boolean
  agentName: string
  onClose?: () => void
}

/**
 * Format a timestamp as relative time (e.g., "2s ago", "1m ago").
 */
function formatRelativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const seconds = Math.floor(diff / 1000)
  
  if (seconds < 5) return 'now'
  if (seconds < 60) return `${seconds}s ago`
  
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

/**
 * Get CSS class for the activity type.
 */
function getTypeColor(type: ParsedActivity['type']): string {
  switch (type) {
    case 'tool_call': return 'text-blue-400'
    case 'message': return 'text-slate-300'
    case 'session_start': return 'text-green-400'
    case 'model_change': return 'text-purple-400'
    case 'thinking': return 'text-amber-400'
    case 'system': return 'text-slate-500'
    case 'tool_result': return 'text-cyan-400'
    default: return 'text-slate-400'
  }
}

function ActivityEntry({ event }: { event: ParsedActivity }) {
  const [expanded, setExpanded] = useState(false)
  const colorClass = getTypeColor(event.type)

  return (
    <div className="group px-3 py-1.5 hover:bg-white/[0.03] transition-colors">
      <div className="flex items-start gap-2">
        {/* Icon */}
        <span className="text-xs leading-5 flex-shrink-0 w-4 text-center">{event.icon}</span>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <span className={`text-xs ${colorClass} break-words`}>
            {event.summary}
          </span>
          {event.detail && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="ml-1 text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
            >
              <ChevronDown size={10} className={`inline transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          )}
          {expanded && event.detail && (
            <div className="mt-1 text-[11px] text-slate-500 bg-slate-900/50 rounded p-1.5 font-mono break-all max-h-24 overflow-y-auto">
              {event.detail}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-slate-600 flex-shrink-0 whitespace-nowrap leading-5">
          {formatRelativeTime(event.timestamp)}
        </span>
      </div>
    </div>
  )
}

export function AgentActivityPopover({
  events,
  isLoading,
  isConnected,
  hasEvents,
  agentName,
  onClose,
}: AgentActivityPopoverProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  // Auto-scroll to bottom on new events
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [events, autoScroll])

  // Detect if user has scrolled up
  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 30
    setAutoScroll(isAtBottom)
  }

  return (
    <div 
      className="absolute z-50 w-[380px] max-h-[400px] bg-slate-900/95 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl shadow-black/40 overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Radio 
            size={12} 
            className={isConnected ? 'text-green-400 animate-pulse' : 'text-slate-600'}
          />
          <span className="text-xs font-medium text-slate-300">
            Live Activity — {agentName}
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-0.5 rounded hover:bg-white/10 transition-colors"
          >
            <X size={12} className="text-slate-500" />
          </button>
        )}
      </div>

      {/* Content */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="overflow-y-auto max-h-[340px] py-1"
      >
        {isLoading && !hasEvents ? (
          <div className="flex items-center justify-center py-8 gap-2">
            <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-500">Loading activity...</span>
          </div>
        ) : !hasEvents ? (
          <div className="flex flex-col items-center justify-center py-8 gap-1">
            <span className="text-xs text-slate-500">No recent activity</span>
            <span className="text-[10px] text-slate-600">
              {isConnected ? 'Waiting for agent events...' : 'Connecting...'}
            </span>
          </div>
        ) : (
          <>
            {events.map((event, i) => (
              <ActivityEntry key={`${event.timestamp}-${i}`} event={event} />
            ))}
          </>
        )}
      </div>

      {/* Footer - scroll indicator */}
      {hasEvents && !autoScroll && (
        <div className="border-t border-white/[0.06] px-3 py-1">
          <button
            onClick={() => {
              setAutoScroll(true)
              if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight
              }
            }}
            className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
          >
            ↓ Jump to latest
          </button>
        </div>
      )}
    </div>
  )
}
