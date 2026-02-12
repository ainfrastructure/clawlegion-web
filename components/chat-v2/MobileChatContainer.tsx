'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { ChatThread } from './ChatThread'
import { ChatInput } from './ChatInput'
import { TypingIndicator } from './TypingIndicator'
import { ALL_AGENTS, getAgentById, getAgentAvatar, AgentConfig } from './agentConfig'
import { useChatMessages } from './hooks/useChatMessages'
import { useDmMessages } from './hooks/useDmMessages'
import { ChatAttachment } from './ChatMessage'
import { AlertCircle, RefreshCw, MessageSquare, Users, Hash, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

type ChatMode = 'dms' | 'rooms'

interface Room {
  id: string
  name: string
  description?: string
  isDefault?: boolean
}

// Mobile mode toggle tabs
function MobileModeToggle({
  mode,
  onChange
}: {
  mode: ChatMode
  onChange: (mode: ChatMode) => void
}) {
  return (
    <div className="flex items-center gap-1 p-1 glass-2 rounded-lg">
      <button
        onClick={() => onChange('dms')}
        className={cn(
          'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all',
          mode === 'dms'
            ? 'bg-red-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
        )}
      >
        <MessageSquare className="w-4 h-4" />
        DMs
      </button>
      <button
        onClick={() => onChange('rooms')}
        className={cn(
          'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all',
          mode === 'rooms'
            ? 'bg-red-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
        )}
      >
        <Users className="w-4 h-4" />
        Rooms
      </button>
    </div>
  )
}

// Agent list for DM selection
function DMAgentList({
  selectedAgentId,
  onSelect
}: {
  selectedAgentId: string | null
  onSelect: (agentId: string) => void
}) {
  return (
    <div className="grid grid-cols-4 gap-2 p-3">
      {ALL_AGENTS.map((agent: AgentConfig) => {
        const isSelected = selectedAgentId === agent.id
        const avatarPath = getAgentAvatar(agent.id)
        
        return (
          <button
            key={agent.id}
            onClick={() => onSelect(agent.id)}
            className={cn(
              'flex flex-col items-center gap-1 p-2 rounded-lg transition-all',
              isSelected
                ? 'bg-red-600/20 border border-blue-500/50'
                : 'glass-2 hover:bg-slate-700/50 border border-transparent'
            )}
          >
            {/* Avatar */}
            <div className="relative">
              {avatarPath ? (
                <Image
                  src={avatarPath}
                  alt={agent.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                  style={{ borderColor: agent.color, borderWidth: 2 }}
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: agent.color + '30', borderColor: agent.color, borderWidth: 2 }}
                >
                  {agent.emoji}
                </div>
              )}
              {/* Online dot */}
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-900" />
            </div>
            
            {/* Name */}
            <span className={cn(
              'text-xs truncate w-full text-center',
              isSelected ? 'text-white' : 'text-slate-400'
            )}>
              {agent.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// Room list for room selection
function RoomList({
  selectedRoomId,
  onSelect
}: {
  selectedRoomId: string | null
  onSelect: (roomId: string, roomName: string) => void
}) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const hasAutoSelected = useRef(false)

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch('/api/v2/chat/rooms')
        if (res.ok) {
          const json = await res.json()
          const data = Array.isArray(json) ? json : (json.rooms || [])
          setRooms(data)
          // Auto-select default room if none selected (only once)
          if (!hasAutoSelected.current && !selectedRoomId && data.length > 0) {
            hasAutoSelected.current = true
            const defaultRoom = data.find((r: Room) => r.isDefault) || data[0]
            if (defaultRoom) {
              onSelect(defaultRoom.id, defaultRoom.name)
            }
          }
        }
      } catch (err) {
        console.error('[RoomList] Failed to fetch rooms:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchRooms()
  }, [selectedRoomId, onSelect])

  if (loading) {
    return (
      <div className="p-4 text-center text-slate-500 text-sm">
        Loading rooms...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 p-2">
      {rooms.map((room) => {
        const isSelected = selectedRoomId === room.id
        
        return (
          <button
            key={room.id}
            onClick={() => onSelect(room.id, room.name)}
            className={cn(
              'flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all',
              isSelected
                ? 'bg-red-600/20 border border-blue-500/50 text-white'
                : 'glass-2 hover:bg-slate-700/50 text-slate-400 border border-transparent'
            )}
          >
            <Hash className="w-4 h-4 opacity-60" />
            <span className="font-medium">{room.name}</span>
            {room.isDefault && (
              <span className="ml-auto text-xs text-slate-600">default</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function MobileChatContainer() {
  // Chat mode: DMs or Rooms
  const [chatMode, setChatMode] = useState<ChatMode>('dms')
  
  // DM state
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  
  // Room state
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [selectedRoomName, setSelectedRoomName] = useState<string>('')
  const [selectedRoomBot, setSelectedRoomBot] = useState<string | null>(null)
  
  // View state
  const [showConversation, setShowConversation] = useState(false)
  
  // Typing indicator
  const [typingBots, setTypingBots] = useState<string[]>([])
  
  // Room messages hook
  const roomHook = useChatMessages({
    roomId: selectedRoomId || '',
    pollInterval: 2000,
    enabled: chatMode === 'rooms' && !!selectedRoomId && showConversation,
  })
  
  // DM messages hook
  const dmHook = useDmMessages({
    agentId: selectedAgentId || '',
    pollInterval: 2000,
    enabled: chatMode === 'dms' && !!selectedAgentId && showConversation,
  })

  // Active hooks based on mode
  const isRoomMode = chatMode === 'rooms'
  const isDmMode = chatMode === 'dms'
  
  const messages = isDmMode ? dmHook.messages : roomHook.messages
  const isLoading = isDmMode ? dmHook.isLoading : roomHook.isLoading
  const isSending = isDmMode ? dmHook.isSending : roomHook.isSending
  const error = isDmMode ? dmHook.error : roomHook.error
  const refetch = isDmMode ? dmHook.refetch : roomHook.refetch

  // Get selected agent config
  const selectedAgent = isDmMode && selectedAgentId 
    ? getAgentById(selectedAgentId)
    : (selectedRoomBot ? getAgentById(selectedRoomBot) : null)

  // Handle selecting an agent for DM
  const handleSelectAgent = useCallback((agentId: string) => {
    setSelectedAgentId(agentId)
    setShowConversation(true)
  }, [])

  // Handle selecting a room
  const handleSelectRoom = useCallback((roomId: string, roomName: string) => {
    setSelectedRoomId(roomId)
    setSelectedRoomName(roomName)
    setShowConversation(true)
  }, [])

  // Handle back to list
  const handleBack = useCallback(() => {
    setShowConversation(false)
    setSelectedRoomBot(null)
  }, [])

  // Handle sending a message
  const handleSend = useCallback(async (content: string, attachments?: ChatAttachment[]) => {
    if (isDmMode && selectedAgentId) {
      await dmHook.sendMessage(content, attachments)
      setTypingBots([selectedAgentId])
      setTimeout(() => setTypingBots([]), 3000)
    } else if (isRoomMode && selectedRoomBot) {
      await roomHook.sendMessage(content, [selectedRoomBot], attachments)
      setTypingBots([selectedRoomBot])
      setTimeout(() => setTypingBots([]), 3000)
    }
  }, [isDmMode, isRoomMode, selectedAgentId, selectedRoomBot, dmHook, roomHook])

  // Handle mode change - reset conversation view
  const handleModeChange = useCallback((mode: ChatMode) => {
    setChatMode(mode)
    setShowConversation(false)
    setSelectedRoomBot(null)
  }, [])

  // Get header title
  const getHeaderTitle = () => {
    if (isDmMode && selectedAgentId) {
      const agent = getAgentById(selectedAgentId)
      return agent ? `${agent.emoji} ${agent.name}` : 'DM'
    }
    if (isRoomMode && selectedRoomName) {
      return `# ${selectedRoomName}`
    }
    return ''
  }

  // Error state
  if (error && showConversation) {
    return (
      <div className="flex flex-col h-[calc(100dvh-3.5rem-5rem)] bg-slate-900">
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6">
          <AlertCircle className="w-10 h-10 mb-3 text-red-500" />
          <p className="text-base font-medium mb-1">Failed to load chat</p>
          <p className="text-sm text-slate-500 mb-4 text-center">
            {error?.message}
          </p>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Conversation View
  if (showConversation) {
    return (
      <div className="flex flex-col h-[calc(100dvh-3.5rem-5rem)] bg-slate-900">
        {/* Header with back button */}
        <div className="flex items-center gap-2 p-3 border-b border-slate-800 bg-slate-900/95">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-white flex-1">
            {getHeaderTitle()}
          </h2>
        </div>

        {/* Room mode: agent selector */}
        {isRoomMode && (
          <div className="p-2 border-b border-slate-800 bg-slate-800/30">
            <div className="text-xs text-slate-500 mb-2">Select an agent to message:</div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {ALL_AGENTS.map((agent: AgentConfig) => {
                const isSelected = selectedRoomBot === agent.id
                const avatarPath = getAgentAvatar(agent.id)
                
                return (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedRoomBot(prev => prev === agent.id ? null : agent.id)}
                    className={cn(
                      'flex-shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-all',
                      isSelected
                        ? 'text-white'
                        : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                    )}
                    style={isSelected ? { backgroundColor: agent.color + '40', color: agent.color } : undefined}
                  >
                    {avatarPath ? (
                      <Image src={avatarPath} alt={agent.name} width={16} height={16} className="rounded-full" />
                    ) : (
                      <span>{agent.emoji}</span>
                    )}
                    {agent.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 overflow-hidden min-h-0">
          <ChatThread
            messages={messages}
            isLoading={isLoading}
          />
        </div>

        {/* Typing Indicator */}
        {typingBots.length > 0 && (
          <div className="border-t border-slate-800/50">
            <TypingIndicator botId={typingBots[0]} />
          </div>
        )}

        {/* Input Area */}
        <div className="safe-area-bottom">
          <ChatInput
            selectedAgent={selectedAgent}
            onSend={handleSend}
            disabled={isSending || (!selectedAgentId && !selectedRoomBot)}
          />
        </div>
      </div>
    )
  }

  // Selection View
  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem-5rem)] bg-slate-900">
      {/* Header */}
      <div className="p-3 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-white mb-3">Chat</h2>
        <MobileModeToggle mode={chatMode} onChange={handleModeChange} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {chatMode === 'dms' ? (
          <DMAgentList
            selectedAgentId={selectedAgentId}
            onSelect={handleSelectAgent}
          />
        ) : (
          <RoomList
            selectedRoomId={selectedRoomId}
            onSelect={handleSelectRoom}
          />
        )}
      </div>
    </div>
  )
}
