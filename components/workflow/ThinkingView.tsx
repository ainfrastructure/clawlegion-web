'use client'

import { useState, useMemo } from 'react'
import { WorkflowStep } from './types'
import { Brain, ChevronDown, ChevronRight, Search, List, FileText } from 'lucide-react'

interface ThinkingViewProps {
  steps: WorkflowStep[]
}

type ViewMode = 'summary' | 'detailed'

function formatTime(timestamp: string): string {
  try {
    return new Date(timestamp).toLocaleTimeString()
  } catch {
    return timestamp
  }
}

// Extract key points from thinking content as bullet points
function extractKeyPoints(content: string): string[] {
  const lines = content.split('\n').filter(line => line.trim())
  const points: string[] = []
  
  for (const line of lines) {
    const trimmed = line.trim()
    // Skip very short lines or lines that are just punctuation
    if (trimmed.length < 10) continue
    
    // Look for action verbs, decisions, or key observations
    const isKeyPoint = 
      /^(I (need|should|will|must|can|want|think|found|see|notice)|Let me|Now|First|Then|Next|Finally|The |This |So |Actually|Okay|Looking|Check|Found|Got it|Ah|Hmm)/i.test(trimmed) ||
      trimmed.includes('→') ||
      trimmed.includes(':') ||
      trimmed.startsWith('-') ||
      trimmed.startsWith('•') ||
      trimmed.startsWith('*')
    
    if (isKeyPoint) {
      // Clean up the point
      let point = trimmed
        .replace(/^[-•*]\s*/, '')
        .replace(/^(Okay,?\s*|Hmm,?\s*|Ah,?\s*|Actually,?\s*|So,?\s*)/i, '')
        .trim()
      
      // Truncate if too long
      if (point.length > 100) {
        point = point.substring(0, 97) + '...'
      }
      
      if (point.length >= 10 && !points.includes(point)) {
        points.push(point)
      }
    }
  }
  
  // If no key points found, take first few sentences
  if (points.length === 0) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10)
    for (let i = 0; i < Math.min(3, sentences.length); i++) {
      let point = sentences[i].trim()
      if (point.length > 100) {
        point = point.substring(0, 97) + '...'
      }
      points.push(point)
    }
  }
  
  return points.slice(0, 5) // Max 5 bullet points
}

// Summary Card - shows bullet points
interface SummaryCardProps {
  step: WorkflowStep
  index: number
  isExpanded: boolean
  onToggle: () => void
}

function SummaryCard({ step, index, isExpanded, onToggle }: SummaryCardProps) {
  const keyPoints = useMemo(() => extractKeyPoints(step.content), [step.content])
  
  return (
    <div className="border border-purple-500/30 rounded-lg bg-purple-500/5 overflow-hidden">
      <div 
        className="flex items-start gap-3 p-3 cursor-pointer hover:bg-purple-500/10 transition-colors"
        onClick={onToggle}
      >
        <div className="flex-shrink-0 text-purple-400 mt-0.5">
          <Brain className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-purple-400">
              #{index + 1}
            </span>
            <span className="text-xs text-slate-500">
              {formatTime(step.timestamp)}
            </span>
          </div>
          
          <ul className="space-y-1">
            {keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-purple-400 mt-1">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
          
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-purple-500/20">
              <pre className="text-xs text-slate-400 whitespace-pre-wrap font-mono leading-relaxed max-h-64 overflow-y-auto">
                {step.content}
              </pre>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 text-slate-500">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </div>
      </div>
    </div>
  )
}

// Detailed Card - shows full content
interface DetailedCardProps {
  step: WorkflowStep
  index: number
  isExpanded: boolean
  onToggle: () => void
}

function DetailedCard({ step, index, isExpanded, onToggle }: DetailedCardProps) {
  const preview = step.content.split('\n')[0].substring(0, 200)
  const hasMore = step.content.length > 200 || step.content.includes('\n')

  return (
    <div className="border border-purple-500/30 rounded-lg bg-purple-500/5 overflow-hidden">
      <div 
        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-purple-500/10 transition-colors"
        onClick={onToggle}
      >
        <div className="flex-shrink-0 text-purple-400 mt-1">
          <Brain className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-purple-400">
              Thought #{index + 1}
            </span>
            <span className="text-xs text-slate-500">
              {formatTime(step.timestamp)}
            </span>
          </div>
          
          {isExpanded ? (
            <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
              {step.content}
            </pre>
          ) : (
            <p className="text-sm text-slate-300">
              {preview}
              {hasMore && <span className="text-slate-500">...</span>}
            </p>
          )}
        </div>

        {hasMore && (
          <div className="flex-shrink-0 text-slate-500">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function ThinkingView({ steps }: ThinkingViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [expandAll, setExpandAll] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('summary')

  const thinkingSteps = useMemo(() => 
    steps.filter(s => s.type === 'thinking'),
    [steps]
  )

  const filteredSteps = useMemo(() => {
    if (!searchQuery) return thinkingSteps
    const lower = searchQuery.toLowerCase()
    return thinkingSteps.filter(s => 
      s.content.toLowerCase().includes(lower)
    )
  }, [thinkingSteps, searchQuery])

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedIds(newExpanded)
  }

  const toggleExpandAll = () => {
    if (expandAll) {
      setExpandedIds(new Set())
    } else {
      setExpandedIds(new Set(filteredSteps.map(s => s.id)))
    }
    setExpandAll(!expandAll)
  }

  if (thinkingSteps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <Brain className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm">No thinking blocks in this workflow</p>
        <p className="text-xs mt-1 text-slate-500">
          Thinking blocks show Claude&apos;s internal reasoning
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* View mode toggle and controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* View mode toggle */}
        <div className="flex items-center bg-slate-800 border border-white/[0.06] rounded-lg p-1">
          <button
            onClick={() => setViewMode('summary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
              viewMode === 'summary'
                ? 'bg-purple-500/20 text-purple-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="w-4 h-4" />
            Summary
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
              viewMode === 'detailed'
                ? 'bg-purple-500/20 text-purple-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Detailed
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search thinking blocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-white/[0.06] rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <button
          onClick={toggleExpandAll}
          className="px-3 py-2 text-sm text-slate-400 hover:text-slate-200 bg-slate-800 border border-white/[0.06] rounded-lg transition-colors"
        >
          {expandAll ? 'Collapse All' : 'Expand All'}
        </button>

        <div className="text-sm text-slate-500">
          {filteredSteps.length} of {thinkingSteps.length} blocks
        </div>
      </div>

      {/* Thinking blocks */}
      <div className="space-y-3">
        {filteredSteps.map((step, idx) => (
          viewMode === 'summary' ? (
            <SummaryCard
              key={step.id}
              step={step}
              index={idx}
              isExpanded={expandAll || expandedIds.has(step.id)}
              onToggle={() => toggleExpand(step.id)}
            />
          ) : (
            <DetailedCard
              key={step.id}
              step={step}
              index={idx}
              isExpanded={expandAll || expandedIds.has(step.id)}
              onToggle={() => toggleExpand(step.id)}
            />
          )
        ))}
      </div>

      {filteredSteps.length === 0 && searchQuery && (
        <div className="text-center py-8 text-slate-400">
          <p className="text-sm">No thinking blocks match &quot;{searchQuery}&quot;</p>
        </div>
      )}
    </div>
  )
}
