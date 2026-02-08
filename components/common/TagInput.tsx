'use client'

import { useState, KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
  className?: string
}

export function TagInput({ value, onChange, placeholder = 'Add tag...', maxTags, className }: TagInputProps) {
  const [input, setInput] = useState('')
  
  const addTag = (tag: string) => {
    const trimmed = tag.trim()
    if (!trimmed) return
    if (value.includes(trimmed)) return
    if (maxTags && value.length >= maxTags) return
    
    onChange([...value, trimmed])
    setInput('')
  }
  
  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove))
  }
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    }
    if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1])
    }
  }
  
  return (
    <div className={cn(
      'flex flex-wrap gap-2 p-2 rounded-lg bg-slate-800 border border-slate-600 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent',
      className
    )}>
      {value.map(tag => (
        <span 
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-sm"
        >
          {tag}
          <button 
            type="button"
            onClick={() => removeTag(tag)}
            className="hover:text-white"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(input)}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[100px] bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none"
      />
    </div>
  )
}

export default TagInput
