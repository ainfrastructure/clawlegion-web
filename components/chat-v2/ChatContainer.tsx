'use client'

import { useState, useCallback, useEffect } from 'react'
import { ChatSidebar, ChatTarget } from './ChatSidebar'
import { ChatThread } from './ChatThread'
import { ChatInput } from './ChatInput'
import { TypingIndicator } from './TypingIndicator'
import { BotArmySection } from './BotArmySection'
import { CouncilSection } from './CouncilSection'
import { RoomParticipantBar, Participant } from './RoomParticipantBar'
import { RoomSettingsDialog } from './RoomSettingsDialog'
import { getAgentById } from './agentConfig'
import { useChatMessages } from './hooks/useChatMessages'
import { useDmMessages } from './hooks/useDmMessages'
import { ChatAttachment } from './ChatMessage'
import { AlertCircle, RefreshCw, MessageSquare } from 'lucide-react'

export interface ChatContainerProps {
  roomId?: string
}

interface RoomDetails {
  id: string
  name: string
  description?: string
  isDefault?: boolean
  participants: Participant[]
}

export function ChatContainer({ roomId: initialRoomId }: ChatContainerProps) {
  // Active chat target (room or DM)
  const [activeTarget, setActiveTarget] = useState<ChatTarget | null>(
    initialRoomId ? { type: 'room', roomId: initialRoomId, roomName: '' } : null
  )
  
  // For room mode: selected bot to send to
  const [selectedRoomBot, setSelectedRoomBot] = useState<string | null>(null)
  
  // Track which bots are typing
  const [typingBots, setTypingBots] = useState<string[]>([])
  
  // Room details including participants
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null)
  
  // Room settings dialog
  const [showRoomSettings, setShowRoomSettings] = useState(false)
  
  // Room messages hook (when viewing a room)
  const roomHook = useChatMessages({
    roomId: activeTarget?.type === 'room' ? activeTarget.roomId : '',
    pollInterval: 2000,
    enabled: activeTarget?.type === 'room',
  })
  
  // DM messages hook (when viewing a DM)
  const dmHook = useDmMessages({
    agentId: activeTarget?.type === 'dm' ? activeTarget.agentId : '',
    pollInterval: 2000,
    enabled: activeTarget?.type === 'dm',
  })

  // Fetch room details when room is selected
  const fetchRoomDetails = useCallback(async (roomId: string) => {
    try {
      const res = await fetch(`/api/v2/chat/rooms/${roomId}?messageLimit=0`)
      if (res.ok) {
        const data = await res.json()
        setRoomDetails({
          id: data.id,
          name: data.name,
          description: data.description,
          isDefault: data.isDefault,
          participants: data.participants || [],
        })
      }
    } catch (err) {
      console.error('[ChatContainer] Failed to fetch room details:', err)
    }
  }, [])
  
  // Fetch room details when room changes
  useEffect(() => {
    if (activeTarget?.type === 'room' && activeTarget.roomId) {
      fetchRoomDetails(activeTarget.roomId)
    } else {
      setRoomDetails(null)
    }
  }, [activeTarget, fetchRoomDetails])
  
  // Select active data based on target type
  const isRoomMode = activeTarget?.type === 'room'
  const isDmMode = activeTarget?.type === 'dm'
  
  const messages = isRoomMode ? roomHook.messages : isDmMode ? dmHook.messages : []
  const isLoading = isRoomMode ? roomHook.isLoading : isDmMode ? dmHook.isLoading : false
  const isSending = isRoomMode ? roomHook.isSending : isDmMode ? dmHook.isSending : false
  const error = isRoomMode ? roomHook.error : isDmMode ? dmHook.error : null
  const refetch = isRoomMode ? roomHook.refetch : isDmMode ? dmHook.refetch : () => {}

  // Get the agent for input display
  const selectedAgent = isDmMode 
    ? getAgentById(activeTarget.agentId) 
    : (selectedRoomBot ? getAgentById(selectedRoomBot) : null)

  // Handle selecting a chat target
  const handleSelectTarget = useCallback((target: ChatTarget) => {
    setActiveTarget(target)
    setTypingBots([])
    setSelectedRoomBot(null) // Reset room bot selection when switching
    setRoomDetails(null) // Clear room details, will be fetched by effect
  }, [])

  // Handle selecting a bot in room mode
  const handleSelectRoomBot = useCallback((botId: string) => {
    setSelectedRoomBot(prev => prev === botId ? null : botId)
  }, [])

  // Handle sending a message
  const handleSend = useCallback(async (content: string, attachments?: ChatAttachment[]) => {
    if (!activeTarget) return

    if (activeTarget.type === 'dm') {
      await dmHook.sendMessage(content, attachments)
      setTypingBots([activeTarget.agentId])
      setTimeout(() => setTypingBots([]), 3000)
    } else if (activeTarget.type === 'room' && selectedRoomBot) {
      // Send to selected bot in room
      await roomHook.sendMessage(content, [selectedRoomBot], attachments)
      setTypingBots([selectedRoomBot])
      setTimeout(() => setTypingBots([]), 3000)
    }
  }, [activeTarget, dmHook, roomHook, selectedRoomBot])

  // Handle refresh
  const handleRefresh = () => {
    refetch()
  }

  // Get header title
  const getHeaderTitle = () => {
    if (!activeTarget) return 'Select a conversation'
    if (activeTarget.type === 'room') return `# ${activeTarget.roomName}`
    if (activeTarget.type === 'dm') return activeTarget.agentName
    return ''
  }

  return (
    <div className="flex h-full bg-slate-950">
      {/* Sidebar */}
      <ChatSidebar 
        activeTarget={activeTarget}
        onSelectTarget={handleSelectTarget}
      />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-900">
        {/* Header */}
        <div className="h-14 px-4 flex items-center border-b border-slate-800">
          {activeTarget ? (
            <div className="flex items-center gap-2">
              {activeTarget.type === 'dm' && selectedAgent && (
                <span className="text-lg">{selectedAgent.emoji}</span>
              )}
              <h2 className="text-lg font-semibold text-white">
                {getHeaderTitle()}
              </h2>
              {activeTarget.type === 'dm' && selectedAgent && (
                <span className="text-sm text-slate-500">
                  {selectedAgent.role}
                </span>
              )}
            </div>
          ) : (
            <h2 className="text-lg text-slate-500">Select a conversation</h2>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
            <AlertCircle className="w-12 h-12 mb-4 text-red-500" />
            <p className="text-lg font-medium mb-2">Failed to load messages</p>
            <p className="text-sm text-slate-500 mb-4">{error?.message}</p>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!activeTarget && !error && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
            <MessageSquare className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">Welcome to Chat</p>
            <p className="text-sm text-slate-600">
              Select a room or DM from the sidebar to start chatting
            </p>
          </div>
        )}

        {/* Messages */}
        {activeTarget && !error && (
          <>
            {/* Room mode: Show participant bar and bot selection */}
            {isRoomMode && (
              <>
                {/* Participant bar */}
                {roomDetails && roomDetails.participants.length > 0 && (
                  <RoomParticipantBar
                    participants={roomDetails.participants}
                    onManageClick={() => setShowRoomSettings(true)}
                    roomName={roomDetails.name}
                  />
                )}
                
                {/* Bot selection for sending (legacy method) */}
                <div className="border-b border-slate-800">
                  <CouncilSection 
                    selectedBotId={selectedRoomBot}
                    onSelect={handleSelectRoomBot}
                  />
                  <BotArmySection
                    selectedBotId={selectedRoomBot}
                    onSelect={handleSelectRoomBot}
                  />
                </div>
              </>
            )}
            
            <ChatThread
              messages={messages}
              isLoading={isLoading}
            />
            
            {/* Typing Indicator */}
            {typingBots.length > 0 && (
              <div className="border-t border-slate-800/50">
                <TypingIndicator botId={typingBots[0]} />
              </div>
            )}
            
            {/* Input */}
            {(activeTarget.type === 'dm' || (isRoomMode && selectedRoomBot)) ? (
              <ChatInput
                selectedAgent={selectedAgent}
                onSend={handleSend}
                disabled={isSending}
                roomParticipants={isRoomMode && roomDetails ? roomDetails.participants.map(p => p.agentId) : undefined}
                isRoomMode={isRoomMode}
              />
            ) : isRoomMode ? (
              <div className="p-4 border-t border-slate-800">
                <p className="text-sm text-slate-500 text-center">
                  Select a bot above to send a message
                </p>
              </div>
            ) : null}
          </>
        )}
      </div>
      
      {/* Room Settings Dialog */}
      {roomDetails && (
        <RoomSettingsDialog
          room={roomDetails}
          open={showRoomSettings}
          onClose={() => setShowRoomSettings(false)}
          onUpdated={() => {
            // Refetch room details when participants are updated
            if (activeTarget?.type === 'room') {
              fetchRoomDetails(activeTarget.roomId)
            }
          }}
        />
      )}
    </div>
  )
}
