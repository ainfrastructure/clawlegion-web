'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, Settings, Trash2, UserMinus, UserPlus, Loader2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ALL_AGENTS, getAgentAvatar, getAgentById } from './agentConfig'
import { Participant } from './RoomParticipantBar'

interface Room {
  id: string
  name: string
  description?: string
  isDefault?: boolean
  participants: Participant[]
}

interface RoomSettingsDialogProps {
  room: Room | null
  open: boolean
  onClose: () => void
  onUpdated: () => void
}

/**
 * Modal dialog to manage room settings (add/remove participants, delete room)
 */
export function RoomSettingsDialog({ room, open, onClose, onUpdated }: RoomSettingsDialogProps) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  // Update local state when room changes
  useEffect(() => {
    if (room) {
      setParticipants(room.participants || [])
      setError(null)
      setShowDeleteConfirm(false)
    }
  }, [room])
  
  // Get agents not in room
  const availableAgents = ALL_AGENTS.filter(
    agent => !participants.some(p => p.agentId === agent.id)
  )
  
  // Add agent to room
  const handleAddAgent = async (agentId: string) => {
    if (!room || actionInProgress) return
    
    setActionInProgress(agentId)
    setError(null)
    
    try {
      const response = await fetch(`/api/v2/chat/rooms/${room.id}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add agent')
      }
      
      const newParticipant = await response.json()
      setParticipants(prev => [...prev, newParticipant])
      onUpdated()
    } catch (err: any) {
      setError(err.message || 'Failed to add agent')
    } finally {
      setActionInProgress(null)
    }
  }
  
  // Remove agent from room
  const handleRemoveAgent = async (agentId: string) => {
    if (!room || actionInProgress) return
    
    setActionInProgress(agentId)
    setError(null)
    
    try {
      const response = await fetch(`/api/v2/chat/rooms/${room.id}/participants/${agentId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to remove agent')
      }
      
      setParticipants(prev => prev.filter(p => p.agentId !== agentId))
      onUpdated()
    } catch (err: any) {
      setError(err.message || 'Failed to remove agent')
    } finally {
      setActionInProgress(null)
    }
  }
  
  // Delete room
  const handleDeleteRoom = async () => {
    if (!room || actionInProgress || room.isDefault) return
    
    setActionInProgress('delete')
    setError(null)
    
    try {
      const response = await fetch(`/api/v2/chat/rooms/${room.id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete room')
      }
      
      onUpdated()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to delete room')
    } finally {
      setActionInProgress(null)
    }
  }
  
  if (!open || !room) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative w-full max-w-lg mx-4 bg-slate-900 rounded-xl border border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-white">Room Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Error message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
          
          {/* Room info */}
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-2">Room</h3>
            <div className="p-3 rounded-lg glass-2">
              <div className="font-medium text-slate-200"># {room.name}</div>
              {room.description && (
                <div className="text-sm text-slate-500 mt-1">{room.description}</div>
              )}
              {room.isDefault && (
                <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">
                  Default Room
                </div>
              )}
            </div>
          </div>
          
          {/* Current participants */}
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-2">
              Current Participants ({participants.length})
            </h3>
            <div className="space-y-2">
              {participants.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No agents in this room</p>
              ) : (
                participants.map((participant) => {
                  const agent = getAgentById(participant.agentId)
                  const avatarPath = getAgentAvatar(participant.agentId)
                  const isRemoving = actionInProgress === participant.agentId
                  
                  return (
                    <div
                      key={participant.agentId}
                      className={cn(
                        'flex items-center justify-between p-2 rounded-lg',
                        'glass-2'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div 
                          className="relative w-8 h-8 rounded-full overflow-hidden border"
                          style={{ borderColor: agent?.color || '#71717a' }}
                        >
                          {avatarPath ? (
                            <Image
                              src={avatarPath}
                              alt={agent?.name || participant.agentId}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div 
                              className="w-full h-full flex items-center justify-center"
                              style={{ backgroundColor: `${agent?.color || '#71717a'}30` }}
                            >
                              {agent?.emoji || '🤖'}
                            </div>
                          )}
                        </div>
                        
                        {/* Name & role */}
                        <div>
                          <div className="text-sm font-medium text-slate-200">
                            {agent?.name || participant.agentId}
                          </div>
                          {agent?.role && (
                            <div className="text-xs text-slate-500">{agent.role}</div>
                          )}
                        </div>
                      </div>
                      
                      {/* Remove button */}
                      <button
                        onClick={() => handleRemoveAgent(participant.agentId)}
                        disabled={isRemoving || actionInProgress !== null}
                        className={cn(
                          'p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-400/10',
                          'disabled:opacity-50 disabled:cursor-not-allowed',
                          'transition-colors'
                        )}
                        title="Remove from room"
                      >
                        {isRemoving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <UserMinus className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>
          
          {/* Available agents to add */}
          {availableAgents.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2">
                Add Agents ({availableAgents.length} available)
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {availableAgents.map((agent) => {
                  const avatarPath = getAgentAvatar(agent.id)
                  const isAdding = actionInProgress === agent.id
                  
                  return (
                    <button
                      key={agent.id}
                      onClick={() => handleAddAgent(agent.id)}
                      disabled={isAdding || actionInProgress !== null}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded-lg border',
                        'bg-slate-800/30 border-white/[0.06] hover:border-slate-600 hover:bg-slate-800',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'transition-all'
                      )}
                    >
                      {/* Avatar */}
                      <div 
                        className="relative w-7 h-7 rounded-full overflow-hidden border"
                        style={{ borderColor: agent.color }}
                      >
                        {avatarPath ? (
                          <Image
                            src={avatarPath}
                            alt={agent.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div 
                            className="w-full h-full flex items-center justify-center text-sm"
                            style={{ backgroundColor: `${agent.color}30` }}
                          >
                            {agent.emoji}
                          </div>
                        )}
                      </div>
                      
                      {/* Name */}
                      <span className="flex-1 text-sm text-slate-300 text-left truncate">
                        {agent.name}
                      </span>
                      
                      {/* Add icon */}
                      {isAdding ? (
                        <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
                      ) : (
                        <UserPlus className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          
          {/* Danger zone - Delete room */}
          {!room.isDefault && (
            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-sm font-medium text-red-400 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Danger Zone
              </h3>
              
              {showDeleteConfirm ? (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-slate-300 mb-3">
                    Are you sure you want to delete <strong>#{room.name}</strong>? 
                    This will also delete all messages in this room.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDeleteRoom}
                      disabled={actionInProgress === 'delete'}
                      className={cn(
                        'px-3 py-1.5 rounded-md text-sm font-medium',
                        'bg-red-600 text-white hover:bg-red-500',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'transition-colors flex items-center gap-2'
                      )}
                    >
                      {actionInProgress === 'delete' && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      Delete Room
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={actionInProgress === 'delete'}
                      className={cn(
                        'px-3 py-1.5 rounded-md text-sm',
                        'bg-slate-700 text-slate-300 hover:bg-slate-600',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'transition-colors'
                      )}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                    'bg-red-500/10 text-red-400 border border-red-500/20',
                    'hover:bg-red-500/20 transition-colors'
                  )}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Room
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium',
              'bg-slate-800 text-slate-300 hover:bg-slate-700',
              'transition-colors'
            )}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
