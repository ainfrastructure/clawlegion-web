'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Settings, Plus, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getAgentById, getAgentAvatar, ALL_AGENTS } from './agentConfig'

export interface Participant {
  agentId: string
  joinedAt: string
  agent?: {
    id: string
    name: string
    color: string
    icon?: string
  } | null
}

interface RoomParticipantBarProps {
  participants: Participant[]
  onManageClick: () => void
  roomName?: string
}

/**
 * Horizontal bar showing agents in the current room
 * Displays as a row of avatars with a manage button
 */
export function RoomParticipantBar({ 
  participants, 
  onManageClick,
  roomName 
}: RoomParticipantBarProps) {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null)
  
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-800">
      {/* Left: Participants */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Users className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wide">
            In Room
          </span>
        </div>
        
        {/* Avatar stack */}
        <div className="flex items-center -space-x-1.5">
          {participants.map((participant) => {
            const agentConfig = getAgentById(participant.agentId)
            const avatarPath = getAgentAvatar(participant.agentId)
            const color = participant.agent?.color || agentConfig?.color || '#71717a'
            const name = participant.agent?.name || agentConfig?.name || participant.agentId
            const isHovered = hoveredAgent === participant.agentId
            
            return (
              <div
                key={participant.agentId}
                className={cn(
                  'relative w-8 h-8 rounded-full overflow-hidden border-2 transition-all duration-200',
                  isHovered ? 'scale-110 z-10' : 'hover:scale-105'
                )}
                style={{ 
                  borderColor: color,
                  zIndex: isHovered ? 10 : 1
                }}
                onMouseEnter={() => setHoveredAgent(participant.agentId)}
                onMouseLeave={() => setHoveredAgent(null)}
                title={`${name}${agentConfig?.role ? ` - ${agentConfig.role}` : ''}`}
              >
                {avatarPath ? (
                  <Image
                    src={avatarPath}
                    alt={name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center text-sm"
                    style={{ backgroundColor: `${color}30` }}
                  >
                    {agentConfig?.emoji || '🤖'}
                  </div>
                )}
              </div>
            )
          })}
          
          {/* Add participant button */}
          <button
            onClick={onManageClick}
            className={cn(
              'w-8 h-8 rounded-full border-2 border-dashed border-slate-600',
              'bg-slate-800/50 text-slate-500 hover:text-slate-300 hover:border-slate-500',
              'flex items-center justify-center transition-all duration-200',
              'hover:scale-105'
            )}
            title="Add agent to room"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        {/* Participant count */}
        <span className="text-xs text-slate-500">
          {participants.length} {participants.length === 1 ? 'agent' : 'agents'}
        </span>
      </div>
      
      {/* Right: Manage button */}
      <button
        onClick={onManageClick}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs',
          'bg-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-700',
          'transition-all duration-200'
        )}
      >
        <Settings className="w-3.5 h-3.5" />
        Manage
      </button>
    </div>
  )
}
