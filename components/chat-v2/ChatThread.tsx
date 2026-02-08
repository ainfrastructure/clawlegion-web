'use client'

import { useEffect, useRef } from 'react'
import { Loader2, MessageSquare } from 'lucide-react'
import { ChatMessage, ChatMessageData } from './ChatMessage'

export interface ChatThreadProps {
  messages: ChatMessageData[]
  isLoading: boolean
}

export function ChatThread({ messages, isLoading }: ChatThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Empty state
  if (!isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
        <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm">No messages yet</p>
        <p className="text-xs mt-1">Select an agent and start chatting!</p>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-2"
    >
      {/* Loading indicator at top when fetching history */}
      {isLoading && messages.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
        </div>
      )}
      
      {/* Messages */}
      <div className="flex flex-col gap-2">
        {Array.isArray(messages) && messages.map((message) => (
          <ChatMessage key={message.id} {...message} />
        ))}
      </div>
      
      {/* Loading indicator for new messages */}
      {isLoading && messages.length > 0 && (
        <div className="flex items-center gap-2 mt-2 text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs">Agent is thinking...</span>
        </div>
      )}
      
      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  )
}
