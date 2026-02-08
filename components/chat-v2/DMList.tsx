'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { ALL_AGENTS, getAgentAvatar, AgentConfig } from './agentConfig'

interface DMThread {
  id: string
  name: string
  agentId: string
  lastMessage: {
    content: string
    senderName: string
    createdAt: string
  } | null
  messageCount: number
}

interface DMListProps {
  selectedAgentId: string | null
  onSelectAgent: (agentId: string) => void
  userId?: string
}

export function DMList({ selectedAgentId, onSelectAgent, userId = 'default-user' }: DMListProps) {
  const [dmThreads, setDmThreads] = useState<DMThread[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch DM threads
  useEffect(() => {
    const fetchDms = async () => {
      try {
        const res = await fetch(`/api/v2/chat/dms?userId=${userId}`)
        if (res.ok) {
          const dms = await res.json()
          setDmThreads(dms)
        }
      } catch (err) {
        console.error('[DMList] Failed to fetch DMs:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDms()
  }, [userId])

  // Get last message preview for an agent
  const getLastMessage = (agentId: string) => {
    const thread = dmThreads.find(t => t.agentId === agentId)
    return thread?.lastMessage
  }

  // Get message count for an agent
  const getMessageCount = (agentId: string) => {
    const thread = dmThreads.find(t => t.agentId === agentId)
    return thread?.messageCount || 0
  }

  // Format relative time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`
    return `${Math.floor(diffMins / 1440)}d`
  }

  // Get all agents as an array for display
  const agentList = ALL_AGENTS

  return (
    <div className="flex flex-col gap-1 p-2">
      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider px-2 py-1">
        Direct Messages
      </div>
      
      {agentList.map((agent: AgentConfig) => {
        const lastMessage = getLastMessage(agent.id)
        const messageCount = getMessageCount(agent.id)
        const isSelected = selectedAgentId === agent.id
        const avatarPath = getAgentAvatar(agent.id)
        
        return (
          <button
            key={agent.id}
            onClick={() => onSelectAgent(agent.id)}
            className={cn(
              'flex items-center gap-3 w-full p-2 rounded-lg transition-all text-left',
              isSelected
                ? 'bg-blue-600/20 border border-blue-500/30'
                : 'hover:glass-2 border border-transparent'
            )}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {avatarPath ? (
                <Image
                  src={avatarPath}
                  alt={agent.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: agent.color + '30' }}
                >
                  {agent.emoji}
                </div>
              )}
              {/* Online indicator */}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
            </div>
            
            {/* Name and preview */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={cn(
                  'font-medium truncate',
                  isSelected ? 'text-white' : 'text-slate-200'
                )}>
                  {agent.name}
                </span>
                {lastMessage && (
                  <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                    {formatTime(lastMessage.createdAt)}
                  </span>
                )}
              </div>
              
              {lastMessage ? (
                <p className="text-sm text-slate-500 truncate">
                  {lastMessage.senderName === 'Human' ? 'You: ' : ''}
                  {lastMessage.content.slice(0, 40)}
                  {lastMessage.content.length > 40 ? '...' : ''}
                </p>
              ) : (
                <p className="text-sm text-slate-600 italic">
                  No messages yet
                </p>
              )}
            </div>
            
            {/* Unread badge (if any) */}
            {messageCount > 0 && !lastMessage && (
              <div className="flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">
                  {messageCount > 9 ? '9+' : messageCount}
                </span>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
