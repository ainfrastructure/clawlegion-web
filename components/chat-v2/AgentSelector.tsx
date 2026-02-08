'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'

export interface Agent {
  id: string
  name: string
  color: string  // hex
  icon: string   // emoji
  isOnline?: boolean
}

export interface AgentSelectorProps {
  agents: Agent[]
  selected: string[]
  onSelectionChange: (ids: string[]) => void
}

const STORAGE_KEY = 'chat-v2-selected-agents'

export function AgentSelector({ agents, selected, onSelectionChange }: AgentSelectorProps) {
  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Validate that stored IDs exist in agents
          const validIds = parsed.filter((id: string) => agents.some(a => a.id === id))
          if (validIds.length > 0) {
            onSelectionChange(validIds)
            return
          }
        }
      } catch {
        // Ignore parse errors
      }
    }
    // Default to first agent if nothing stored
    if (agents.length > 0 && selected.length === 0) {
      onSelectionChange([agents[0].id])
    }
  }, [agents]) // eslint-disable-line react-hooks/exhaustive-deps

  // Persist to localStorage on change
  useEffect(() => {
    if (selected.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selected))
    }
  }, [selected])

  const toggleAgent = (agentId: string) => {
    const isSelected = selected.includes(agentId)
    
    if (isSelected) {
      // Don't allow deselecting if it's the last one
      if (selected.length <= 1) return
      onSelectionChange(selected.filter(id => id !== agentId))
    } else {
      onSelectionChange([...selected, agentId])
    }
  }

  return (
    <div className="flex items-center justify-center gap-3 py-4">
      {agents.map((agent) => {
        const isSelected = selected.includes(agent.id)
        
        return (
          <button
            key={agent.id}
            onClick={() => toggleAgent(agent.id)}
            className={cn(
              'flex flex-col items-center justify-center',
              'w-[120px] h-[80px] rounded-lg',
              'transition-all duration-200 cursor-pointer',
              'text-white font-medium',
              isSelected && 'ring-2 ring-white shadow-lg'
            )}
            style={{ 
              backgroundColor: agent.color,
              opacity: isSelected ? 1 : 0.7
            }}
          >
            <span className="text-2xl mb-1">{agent.icon}</span>
            <span className="text-sm">{agent.name}</span>
            {agent.isOnline !== undefined && (
              <span className={cn(
                'absolute top-2 right-2 w-2 h-2 rounded-full',
                agent.isOnline ? 'bg-green-400' : 'bg-slate-500'
              )} />
            )}
          </button>
        )
      })}
    </div>
  )
}
