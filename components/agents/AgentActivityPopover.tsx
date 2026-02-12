'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Radio, X, ChevronRight, ArrowDown, Zap, MessageSquare, Play, Cpu, Brain, Terminal, RotateCcw } from 'lucide-react'
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

  if (seconds < 5) return 'just now'
  if (seconds < 60) return `${seconds}s`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`

  const hours = Math.floor(minutes / 60)
  return `${hours}h`
}

type ActivityType = ParsedActivity['type']

/**
 * Visual config per event type — border accent, background tint, icon.
 */
function getTypeStyles(type: ActivityType) {
  switch (type) {
    case 'tool_call':
      return {
        border: 'border-l-blue-400',
        bg: 'bg-blue-400/[0.04]',
        text: 'text-blue-300',
        label: 'Tool Call',
        labelColor: 'text-red-400/70',
        Icon: Terminal,
      }
    case 'tool_result':
      return {
        border: 'border-l-cyan-400',
        bg: 'bg-cyan-400/[0.04]',
        text: 'text-cyan-300',
        label: 'Result',
        labelColor: 'text-cyan-400/70',
        Icon: RotateCcw,
      }
    case 'message':
      return {
        border: 'border-l-slate-400',
        bg: 'bg-white/[0.02]',
        text: 'text-slate-200',
        label: 'Message',
        labelColor: 'text-slate-500',
        Icon: MessageSquare,
      }
    case 'session_start':
      return {
        border: 'border-l-emerald-400',
        bg: 'bg-emerald-400/[0.06]',
        text: 'text-emerald-300',
        label: 'Session Start',
        labelColor: 'text-emerald-400/70',
        Icon: Play,
      }
    case 'model_change':
      return {
        border: 'border-l-violet-400',
        bg: 'bg-violet-400/[0.04]',
        text: 'text-violet-300',
        label: 'Model',
        labelColor: 'text-violet-400/70',
        Icon: Cpu,
      }
    case 'thinking':
      return {
        border: 'border-l-amber-400',
        bg: 'bg-amber-400/[0.04]',
        text: 'text-amber-200',
        label: 'Thinking',
        labelColor: 'text-amber-400/70',
        Icon: Brain,
      }
    case 'system':
      return {
        border: 'border-l-slate-600',
        bg: 'bg-white/[0.01]',
        text: 'text-slate-400',
        label: 'System',
        labelColor: 'text-slate-600',
        Icon: Zap,
      }
    default:
      return {
        border: 'border-l-slate-500',
        bg: 'bg-white/[0.02]',
        text: 'text-slate-300',
        label: type,
        labelColor: 'text-slate-500',
        Icon: Zap,
      }
  }
}

function ActivityEntry({ event, isLatest }: { event: ParsedActivity; isLatest: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const styles = getTypeStyles(event.type)
  const TypeIcon = styles.Icon

  return (
    <div
      className={`
        relative border-l-2 ${styles.border} ${styles.bg}
        mx-2 mb-1 rounded-r-lg
        transition-all duration-150
        hover:bg-white/[0.05]
        ${isLatest ? 'animate-fade-in-entry' : ''}
      `}
    >
      <div className="px-3 py-2.5">
        {/* Top row: type icon + label + timestamp */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <TypeIcon size={11} className={styles.labelColor} />
            <span className={`text-[10px] font-medium uppercase tracking-wider ${styles.labelColor}`}>
              {styles.label}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 tabular-nums">
            {formatRelativeTime(event.timestamp)}
          </span>
        </div>

        {/* Summary line */}
        <div className="flex items-start gap-2">
          <span className="text-base leading-5 flex-shrink-0 mt-0.5">{event.icon}</span>
          <p className={`text-[13px] leading-relaxed ${styles.text} break-words`}>
            {event.summary}
          </p>
        </div>

        {/* Expandable details */}
        {event.detail && (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="
                mt-1.5 flex items-center gap-1 text-[11px] text-slate-500
                hover:text-slate-300 transition-colors group/expand
              "
            >
              <ChevronRight
                size={12}
                className={`transition-transform duration-200 ${expanded ? 'rotate-90' : ''} group-hover/expand:text-slate-300`}
              />
              <span>{expanded ? 'Hide details' : 'Show details'}</span>
            </button>
            <div
              className={`
                overflow-hidden transition-all duration-200 ease-out
                ${expanded ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'}
              `}
            >
              <div className="text-[12px] text-slate-400 bg-black/30 rounded-md p-2.5 font-mono leading-relaxed break-all overflow-y-auto max-h-32 custom-scrollbar border border-white/[0.04]">
                {event.detail}
              </div>
            </div>
          </>
        )}
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
  const [eventCount, setEventCount] = useState(0)

  // Track new events for the counter badge
  useEffect(() => {
    setEventCount(events.length)
  }, [events.length])

  // Auto-scroll to bottom on new events
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: events.length > eventCount ? 'smooth' : 'auto',
      })
    }
  }, [events, autoScroll, eventCount])

  // Detect if user has scrolled up
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 40
    setAutoScroll(isAtBottom)
  }, [])

  return (
    <div
      className="
        absolute z-50 w-[420px] max-h-[460px]
        bg-[#0c1222]/[0.97] backdrop-blur-xl
        border border-white/[0.08]
        rounded-xl
        shadow-[0_8px_40px_-8px_rgba(0,0,0,0.7),0_0_1px_0_rgba(255,255,255,0.05)]
        overflow-hidden
        flex flex-col
      "
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02] flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Radio
              size={13}
              className={isConnected ? 'text-emerald-400' : 'text-slate-600'}
            />
            {isConnected && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-40" />
            )}
          </div>
          <span className="text-sm font-medium text-slate-200 tracking-tight">
            Live Activity
          </span>
          <span className="text-sm text-slate-500">&mdash;</span>
          <span className="text-sm font-semibold text-white">
            {agentName}
          </span>
          {hasEvents && (
            <span className="text-[10px] font-mono text-slate-500 bg-white/[0.04] px-1.5 py-0.5 rounded-full tabular-nums">
              {events.length}
            </span>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-white/[0.08] transition-colors"
          >
            <X size={14} className="text-slate-400 hover:text-slate-200 transition-colors" />
          </button>
        )}
      </div>

      {/* Content */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="overflow-y-auto flex-1 py-2 custom-scrollbar"
        style={{ maxHeight: 380 }}
      >
        {isLoading && !hasEvents ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="relative">
              <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin" />
            </div>
            <span className="text-sm text-slate-500">Connecting to stream...</span>
          </div>
        ) : !hasEvents ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Radio size={20} className="text-slate-700" />
            <span className="text-sm text-slate-500">No recent activity</span>
            <span className="text-xs text-slate-600">
              {isConnected ? 'Listening for events...' : 'Establishing connection...'}
            </span>
          </div>
        ) : (
          <div className="space-y-0">
            {events.map((event, i) => (
              <ActivityEntry
                key={`${event.timestamp}-${i}`}
                event={event}
                isLatest={i === events.length - 1}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer — jump to latest */}
      {hasEvents && !autoScroll && (
        <div className="border-t border-white/[0.06] bg-white/[0.02] flex-shrink-0">
          <button
            onClick={() => {
              setAutoScroll(true)
              if (scrollRef.current) {
                scrollRef.current.scrollTo({
                  top: scrollRef.current.scrollHeight,
                  behavior: 'smooth',
                })
              }
            }}
            className="
              w-full px-4 py-2 flex items-center justify-center gap-1.5
              text-xs font-medium text-red-400 hover:text-red-300
              hover:bg-blue-400/[0.05] transition-all
            "
          >
            <ArrowDown size={12} />
            Jump to latest
          </button>
        </div>
      )}

    </div>
  )
}
