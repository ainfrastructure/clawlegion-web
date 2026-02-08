'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { getAgentById, getAgentAvatar, ALL_AGENTS, AgentConfig } from './agentConfig'

interface MentionAutocompleteProps {
  /** Text after the @ symbol to filter by */
  query: string
  /** Agent IDs in the room (prioritized in suggestions) */
  participants?: string[]
  /** Position for the dropdown */
  position: { top: number; left: number }
  /** Callback when an agent is selected */
  onSelect: (agentId: string, displayName: string) => void
  /** Callback when autocomplete should close */
  onClose: () => void
}

interface MentionOption {
  id: string
  name: string
  role: string
  emoji: string
  color: string
  avatar?: string
  isParticipant: boolean
  isAll?: boolean
}

/**
 * Dropdown autocomplete for @mentions in chat input
 * Shows room participants first, then other agents
 * Supports keyboard navigation
 */
export function MentionAutocomplete({ 
  query, 
  participants = [],
  position, 
  onSelect, 
  onClose 
}: MentionAutocompleteProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  
  // Build filtered options
  const options: MentionOption[] = (() => {
    const normalizedQuery = query.toLowerCase().trim()
    
    // Start with @all option
    const allOption: MentionOption = {
      id: 'all',
      name: 'all',
      role: 'Mention everyone',
      emoji: '📢',
      color: '#EAB308',
      isParticipant: false,
      isAll: true,
    }
    
    // Get all agent options
    const agentOptions: MentionOption[] = ALL_AGENTS.map(agent => ({
      id: agent.id,
      name: agent.name,
      role: agent.role,
      emoji: agent.emoji,
      color: agent.color,
      avatar: getAgentAvatar(agent.id),
      isParticipant: participants.includes(agent.id),
    }))
    
    // Filter by query
    const filteredAgents = normalizedQuery
      ? agentOptions.filter(opt => 
          opt.name.toLowerCase().includes(normalizedQuery) ||
          opt.id.toLowerCase().includes(normalizedQuery)
        )
      : agentOptions
    
    // Sort: participants first, then alphabetically
    filteredAgents.sort((a, b) => {
      if (a.isParticipant && !b.isParticipant) return -1
      if (!a.isParticipant && b.isParticipant) return 1
      return a.name.localeCompare(b.name)
    })
    
    // Include @all if query matches
    const showAll = !normalizedQuery || 'all'.includes(normalizedQuery)
    
    return showAll ? [...filteredAgents, allOption] : filteredAgents
  })()
  
  // Reset selection when options change
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])
  
  // Scroll selected item into view
  useEffect(() => {
    const item = itemRefs.current[selectedIndex]
    if (item) {
      item.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < options.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : options.length - 1
          )
          break
        case 'Enter':
        case 'Tab':
          e.preventDefault()
          if (options[selectedIndex]) {
            const opt = options[selectedIndex]
            onSelect(opt.id, opt.name.toLowerCase())
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [options, selectedIndex, onSelect, onClose])
  
  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])
  
  // Handle item click
  const handleItemClick = useCallback((option: MentionOption) => {
    onSelect(option.id, option.name.toLowerCase())
  }, [onSelect])
  
  if (options.length === 0) {
    return null
  }
  
  return (
    <div
      ref={containerRef}
      className={cn(
        'absolute z-50 w-64 max-h-64 overflow-y-auto',
        'bg-slate-900 border border-white/[0.06] rounded-lg shadow-xl',
        'py-1'
      )}
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      {/* Header */}
      <div className="px-3 py-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
        Mention
      </div>
      
      {/* Options */}
      {options.map((option, index) => (
        <button
          key={option.id}
          ref={el => { itemRefs.current[index] = el }}
          onClick={() => handleItemClick(option)}
          onMouseEnter={() => setSelectedIndex(index)}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 text-left',
            'transition-colors',
            index === selectedIndex 
              ? 'bg-slate-800' 
              : 'hover:bg-slate-800/50'
          )}
        >
          {/* Avatar/Icon */}
          {option.isAll ? (
            <div 
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${option.color}30` }}
            >
              <span className="text-sm">{option.emoji}</span>
            </div>
          ) : option.avatar ? (
            <div 
              className="relative w-7 h-7 rounded-full overflow-hidden border"
              style={{ borderColor: option.color }}
            >
              <Image
                src={option.avatar}
                alt={option.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div 
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${option.color}30` }}
            >
              <span className="text-sm">{option.emoji}</span>
            </div>
          )}
          
          {/* Name and role */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span 
                className="text-sm font-medium"
                style={{ color: option.color }}
              >
                @{option.name.toLowerCase()}
              </span>
              {option.isParticipant && (
                <span className="px-1 py-0.5 rounded text-[10px] bg-green-500/20 text-green-400">
                  in room
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 truncate">
              {option.role}
            </div>
          </div>
        </button>
      ))}
      
      {/* Keyboard hint */}
      <div className="px-3 py-1.5 text-[10px] text-slate-600 border-t border-slate-800">
        ↑↓ to navigate • Enter to select • Esc to close
      </div>
    </div>
  )
}
