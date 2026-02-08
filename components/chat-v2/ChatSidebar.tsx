'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Hash, Plus, ChevronDown, ChevronRight, MessageSquare } from 'lucide-react'
import { ALL_AGENTS, getAgentAvatar, AgentConfig } from './agentConfig'
import { CreateRoomDialog } from './CreateRoomDialog'

// Suppress hydration warnings for time-based content
const suppressHydrationWarning = true

// Types
interface Room {
  id: string
  name: string
  description?: string
  isDefault?: boolean
  _count?: { messages: number }
  lastMessage?: {
    content: string
    senderName: string
    createdAt: string
  } | null
}

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

export type ChatTarget = 
  | { type: 'room'; roomId: string; roomName: string }
  | { type: 'dm'; agentId: string; agentName: string }

interface ChatSidebarProps {
  activeTarget: ChatTarget | null
  onSelectTarget: (target: ChatTarget) => void
  userId?: string
}

export function ChatSidebar({ activeTarget, onSelectTarget, userId = 'default-user' }: ChatSidebarProps) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [dmThreads, setDmThreads] = useState<DMThread[]>([])
  const [roomsExpanded, setRoomsExpanded] = useState(true)
  const [dmsExpanded, setDmsExpanded] = useState(true)
  const [loading, setLoading] = useState(true)
  const [showCreateRoom, setShowCreateRoom] = useState(false)

  // Fetch rooms
  const fetchRooms = useCallback(async () => {
    try {
      console.log('[ChatSidebar] Fetching rooms...')
      const res = await fetch('/api/v2/chat/rooms')
      console.log('[ChatSidebar] Response status:', res.status)
      if (res.ok) {
        const data = await res.json()
        console.log('[ChatSidebar] Rooms data:', data)
        setRooms(data.rooms || [])
      }
    } catch (err) {
      console.error('[ChatSidebar] Failed to fetch rooms:', err)
    }
  }, [])
  
  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])
  
  // Handle room created
  const handleRoomCreated = useCallback((room: Room) => {
    // Add to local state
    setRooms(prev => [...prev, room])
    // Select the new room
    onSelectTarget({ type: 'room', roomId: room.id, roomName: room.name })
  }, [onSelectTarget])

  // Fetch DM threads
  useEffect(() => {
    const fetchDms = async () => {
      try {
        const res = await fetch(`/api/v2/chat/dms?userId=${userId}`)
        if (res.ok) {
          const data = await res.json()
          setDmThreads(data.dms || [])
        }
      } catch (err) {
        console.error('[ChatSidebar] Failed to fetch DMs:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDms()
  }, [userId])

  // Check if target is active
  const isActive = (target: ChatTarget) => {
    if (!activeTarget) return false
    if (target.type === 'room' && activeTarget.type === 'room') {
      return target.roomId === activeTarget.roomId
    }
    if (target.type === 'dm' && activeTarget.type === 'dm') {
      return target.agentId === activeTarget.agentId
    }
    return false
  }

  // Get DM thread info for an agent
  const getDmInfo = (agentId: string) => {
    return dmThreads.find(t => t.agentId === agentId)
  }

  // Format time
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

  return (
    <div className="w-64 h-full bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-white">Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {/* Rooms Section */}
        <div className="mb-4">
          <button 
            onClick={() => setRoomsExpanded(!roomsExpanded)}
            className="w-full flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-300 transition-colors"
          >
            {roomsExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            Rooms
            <span className="ml-auto text-slate-600">{rooms.length}</span>
          </button>
          
          {roomsExpanded && (
            <div className="mt-1 space-y-0.5 px-2">
              {rooms.map(room => {
                const target: ChatTarget = { type: 'room', roomId: room.id, roomName: room.name }
                const active = isActive(target)
                
                return (
                  <button
                    key={room.id}
                    onClick={() => onSelectTarget(target)}
                    className={cn(
                      'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-left',
                      active
                        ? 'bg-blue-600/20 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    )}
                  >
                    <Hash className="w-4 h-4 flex-shrink-0 opacity-60" />
                    <span className="truncate">{room.name}</span>
                    {room._count && room._count.messages > 0 && (
                      <span className="ml-auto text-xs text-slate-600">
                        {room._count.messages}
                      </span>
                    )}
                  </button>
                )
              })}
              
              {rooms.length === 0 && !loading && (
                <p className="text-xs text-slate-600 px-2 py-2">No rooms yet</p>
              )}
            </div>
          )}
        </div>

        {/* DMs Section */}
        <div>
          <button 
            onClick={() => setDmsExpanded(!dmsExpanded)}
            className="w-full flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-300 transition-colors"
          >
            {dmsExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            Direct Messages
            <span className="ml-auto text-slate-600">{ALL_AGENTS.length}</span>
          </button>
          
          {dmsExpanded && (
            <div className="mt-1 space-y-0.5 px-2">
              {ALL_AGENTS.map((agent: AgentConfig) => {
                const target: ChatTarget = { type: 'dm', agentId: agent.id, agentName: agent.name }
                const active = isActive(target)
                const dmInfo = getDmInfo(agent.id)
                const avatarPath = getAgentAvatar(agent.id)
                
                return (
                  <button
                    key={agent.id}
                    onClick={() => onSelectTarget(target)}
                    className={cn(
                      'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-left',
                      active
                        ? 'bg-blue-600/20 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    )}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {avatarPath ? (
                        <Image
                          src={avatarPath}
                          alt={agent.name}
                          width={20}
                          height={20}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div 
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                          style={{ backgroundColor: agent.color + '30' }}
                        >
                          {agent.emoji}
                        </div>
                      )}
                      {/* Online dot */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-slate-900" />
                    </div>
                    
                    <span className="truncate flex-1">{agent.name}</span>
                    
                    {/* Last message time */}
                    {dmInfo?.lastMessage && (
                      <span 
                        className="text-xs text-slate-600 flex-shrink-0"
                        suppressHydrationWarning
                      >
                        {formatTime(dmInfo.lastMessage.createdAt)}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer - New Room button */}
      <div className="p-2 border-t border-slate-800">
        <button 
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-md transition-colors"
          onClick={() => setShowCreateRoom(true)}
        >
          <Plus className="w-4 h-4" />
          New Room
        </button>
      </div>
      
      {/* Create Room Dialog */}
      <CreateRoomDialog
        open={showCreateRoom}
        onClose={() => setShowCreateRoom(false)}
        onCreated={handleRoomCreated}
      />
    </div>
  )
}
