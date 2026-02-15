'use client'

import { useState, useEffect } from 'react'
import { useAgentActivityStream } from '@/hooks/useAgentActivityStream'
import { 
  Radio, 
  MessageSquare, 
  Terminal, 
  Brain, 
  Zap, 
  AlertTriangle, 
  Play,
  ChevronRight,
  User,
  Bot,
  Clock
} from 'lucide-react'

interface AgentActivityFeedProps {
  agents: any[]
  selectedAgent: string | null
  onAgentSelect: (agentId: string | null) => void
}

interface ActivityEvent {
  timestamp: string
  agentId: string
  type: 'tool_call' | 'tool_result' | 'message' | 'thinking' | 'session_start' | 'model_change' | 'system'
  icon: string
  summary: string
  detail?: string
}

/**
 * Real-time agent activity feed component
 */
export function AgentActivityFeed({ agents, selectedAgent, onAgentSelect }: AgentActivityFeedProps) {
  const [allEvents, setAllEvents] = useState<ActivityEvent[]>([])
  const [filterType, setFilterType] = useState<string>('all')
  const [autoScroll, setAutoScroll] = useState(true)

  // Stream activity for selected agent
  const { events, isConnected, hasEvents } = useAgentActivityStream(
    selectedAgent,
    { enabled: !!selectedAgent }
  )

  // Update events when new activity comes in
  useEffect(() => {
    if (selectedAgent && events.length > 0) {
      const newEvents = events.map(event => ({
        ...event,
        agentId: selectedAgent
      }))
      
      setAllEvents(prev => {
        const combined = [...prev, ...newEvents]
        // Keep only recent events (last 100)
        return combined.slice(-100)
      })
    }
  }, [events, selectedAgent])

  const getAgentInfo = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId)
    return {
      name: agent?.name || agentId,
      status: agent?.basicHealth?.status || 'unknown',
      healthScore: agent?.autonomousHealth?.currentHealth || 0
    }
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'tool_call':
        return <Terminal className="text-blue-400" size={16} />
      case 'tool_result':
        return <Zap className="text-green-400" size={16} />
      case 'message':
        return <MessageSquare className="text-slate-400" size={16} />
      case 'thinking':
        return <Brain className="text-purple-400" size={16} />
      case 'session_start':
        return <Play className="text-green-400" size={16} />
      case 'system':
        return <AlertTriangle className="text-yellow-400" size={16} />
      default:
        return <Radio className="text-slate-500" size={16} />
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'tool_call':
        return 'border-l-blue-400 bg-blue-400/5'
      case 'tool_result':
        return 'border-l-green-400 bg-green-400/5'
      case 'thinking':
        return 'border-l-purple-400 bg-purple-400/5'
      case 'session_start':
        return 'border-l-green-400 bg-green-400/5'
      case 'system':
        return 'border-l-yellow-400 bg-yellow-400/5'
      default:
        return 'border-l-slate-600 bg-slate-400/5'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    
    if (diffSeconds < 5) return 'just now'
    if (diffSeconds < 60) return `${diffSeconds}s ago`
    
    const diffMinutes = Math.floor(diffSeconds / 60)
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    
    return date.toLocaleTimeString()
  }

  const filteredEvents = filterType === 'all' 
    ? allEvents 
    : allEvents.filter(event => event.type === filterType)

  const activeAgents = agents.filter(a => 
    a.basicHealth?.status === 'busy' || a.basicHealth?.status === 'online'
  )

  return (
    <div className="glass-2 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Radio className="text-green-400" size={24} />
              Live Agent Activity
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Real-time stream of agent actions and decisions
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-sm text-slate-400">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            {/* Auto-scroll Toggle */}
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`px-3 py-1 rounded-lg text-xs ${
                autoScroll 
                  ? 'bg-green-600/20 text-green-400' 
                  : 'bg-slate-700 text-slate-400'
              }`}
            >
              Auto-scroll
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-96">
        {/* Agent Selector */}
        <div className="w-64 border-r border-slate-700/50 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Select Agent</h3>
            
            <button
              onClick={() => onAgentSelect(null)}
              className={`w-full text-left p-3 rounded-lg transition-colors mb-2 ${
                !selectedAgent 
                  ? 'bg-blue-600/20 text-blue-400' 
                  : 'hover:bg-slate-700/50 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <User size={16} />
                <span className="text-sm">All Agents</span>
              </div>
            </button>
            
            {activeAgents.map((agent) => {
              const info = getAgentInfo(agent.id)
              const isSelected = selectedAgent === agent.id
              
              return (
                <button
                  key={agent.id}
                  onClick={() => onAgentSelect(agent.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors mb-2 ${
                    isSelected 
                      ? 'bg-blue-600/20 text-blue-400' 
                      : 'hover:bg-slate-700/50 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Bot size={16} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {info.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          info.status === 'busy' ? 'bg-orange-400' :
                          info.status === 'online' ? 'bg-green-400' :
                          'bg-slate-500'
                        }`} />
                        <span className="text-xs text-slate-500">
                          {Math.round(info.healthScore * 100)}%
                        </span>
                      </div>
                    </div>
                    {isSelected && <ChevronRight size={14} />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="flex-1 flex flex-col">
          {/* Filter Tabs */}
          <div className="flex gap-1 p-4 border-b border-slate-700/50 overflow-x-auto">
            {[
              { key: 'all', label: 'All', count: allEvents.length },
              { key: 'tool_call', label: 'Tools', count: allEvents.filter(e => e.type === 'tool_call').length },
              { key: 'thinking', label: 'Thinking', count: allEvents.filter(e => e.type === 'thinking').length },
              { key: 'message', label: 'Messages', count: allEvents.filter(e => e.type === 'message').length }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setFilterType(filter.key)}
                className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                  filterType === filter.key
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                {filter.label} {filter.count > 0 && `(${filter.count})`}
              </button>
            ))}
          </div>

          {/* Event List */}
          <div className="flex-1 overflow-y-auto">
            {!selectedAgent ? (
              <div className="flex items-center justify-center h-full text-slate-500">
                <div className="text-center">
                  <Bot className="mx-auto mb-2" size={32} />
                  <p>Select an agent to view live activity</p>
                </div>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-500">
                <div className="text-center">
                  <Clock className="mx-auto mb-2" size={32} />
                  <p>No activity yet</p>
                  <p className="text-sm mt-1">Activity will appear here as it happens</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {filteredEvents.map((event, index) => {
                  const agentInfo = getAgentInfo(event.agentId)
                  
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-l-2 ${getEventTypeColor(event.type)}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getEventTypeIcon(event.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-slate-200">
                              {agentInfo.name}
                            </span>
                            <span className="text-xs text-slate-500">
                              {formatTimestamp(event.timestamp)}
                            </span>
                          </div>
                          
                          <p className="text-sm text-slate-300 mb-1">
                            {event.summary}
                          </p>
                          
                          {event.detail && (
                            <p className="text-xs text-slate-500 font-mono bg-slate-800/50 p-2 rounded">
                              {event.detail}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}