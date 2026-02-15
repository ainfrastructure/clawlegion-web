'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { X, Hash, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ALL_AGENTS, getAgentAvatar, AgentConfig } from './agentConfig'

interface Room {
  id: string
  name: string
  description?: string
  participants: { agentId: string; joinedAt: string }[]
}

interface CreateRoomDialogProps {
  open: boolean
  onClose: () => void
  onCreated: (room: Room) => void
}

/**
 * Modal dialog to create a new chat room
 */
export function CreateRoomDialog({ open, onClose, onCreated }: CreateRoomDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Reset form when dialog opens
  const resetForm = useCallback(() => {
    setName('')
    setDescription('')
    setSelectedAgents([])
    setError(null)
  }, [])
  
  // Toggle agent selection
  const toggleAgent = (agentId: string) => {
    setSelectedAgents(prev => 
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    )
  }
  
  // Select/deselect all
  const toggleAll = () => {
    if (selectedAgents.length === ALL_AGENTS.length) {
      setSelectedAgents([])
    } else {
      setSelectedAgents(ALL_AGENTS.map(a => a.id))
    }
  }
  
  // Validate room name
  const validateName = (value: string): string | null => {
    if (!value.trim()) {
      return 'Room name is required'
    }
    if (value.length > 50) {
      return 'Room name must be 50 characters or less'
    }
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(value)) {
      return 'Room name can only contain letters, numbers, spaces, hyphens, and underscores'
    }
    return null
  }
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const nameError = validateName(name)
    if (nameError) {
      setError(nameError)
      return
    }
    
    setIsCreating(true)
    setError(null)
    
    try {
      const response = await fetch('/api/v2/chat/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          participants: selectedAgents,
        }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create room')
      }
      
      const room = await response.json()
      onCreated(room)
      resetForm()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create room')
    } finally {
      setIsCreating(false)
    }
  }
  
  // Handle close
  const handleClose = () => {
    if (!isCreating) {
      resetForm()
      onClose()
    }
  }
  
  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Dialog */}
      <div className="relative w-full max-w-lg mx-4 bg-slate-900 rounded-xl border border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-white">Create Room</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isCreating}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Error message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            
            {/* Room name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Room Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., project-discussion"
                disabled={isCreating}
                className={cn(
                  'w-full px-3 py-2 rounded-lg border',
                  'bg-slate-800 text-slate-100 placeholder:text-slate-500',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'border-white/[0.06] focus:border-blue-500'
                )}
              />
            </div>
            
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this room about?"
                disabled={isCreating}
                rows={2}
                className={cn(
                  'w-full px-3 py-2 rounded-lg border resize-none',
                  'bg-slate-800 text-slate-100 placeholder:text-slate-500',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'border-white/[0.06] focus:border-blue-500'
                )}
              />
            </div>
            
            {/* Participants */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-300">
                  Initial Participants
                </label>
                <button
                  type="button"
                  onClick={toggleAll}
                  disabled={isCreating}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  {selectedAgents.length === ALL_AGENTS.length ? 'Deselect all' : 'Select all'}
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {ALL_AGENTS.map((agent) => {
                  const isSelected = selectedAgents.includes(agent.id)
                  const avatarPath = getAgentAvatar(agent.id)
                  
                  return (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => toggleAgent(agent.id)}
                      disabled={isCreating}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded-lg border transition-all duration-200',
                        isSelected
                          ? 'border-blue-500/50 bg-blue-500/10'
                          : 'border-white/[0.06] glass-2 hover:border-slate-600 hover:bg-slate-800',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                      )}
                    >
                      {/* Avatar */}
                      <div 
                        className="relative w-8 h-8 rounded-full overflow-hidden border"
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
                            className="w-full h-full flex items-center justify-center"
                            style={{ backgroundColor: `${agent.color}30` }}
                          >
                            {agent.emoji}
                          </div>
                        )}
                      </div>
                      
                      {/* Name & role */}
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-slate-200">
                          {agent.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {agent.role}
                        </div>
                      </div>
                      
                      {/* Check indicator */}
                      <div 
                        className={cn(
                          'w-5 h-5 rounded-full border flex items-center justify-center',
                          isSelected 
                            ? 'bg-blue-500 border-blue-500' 
                            : 'border-slate-600'
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  )
                })}
              </div>
              
              {selectedAgents.length > 0 && (
                <p className="mt-2 text-xs text-slate-500">
                  {selectedAgents.length} agent{selectedAgents.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              disabled={isCreating}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium',
                'bg-slate-800 text-slate-300 hover:bg-slate-700',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors'
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !name.trim()}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium',
                'bg-red-600 text-white hover:bg-red-500',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors flex items-center gap-2'
              )}
            >
              {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
              {isCreating ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
