'use client'

import { useState } from 'react'
import { BookOpen, ChevronDown } from 'lucide-react'

// Parse goal text into sections
export function parseGoalSections(goal: string) {
  const lines = goal.split('\n')
  const sections: { title: string; items: string[] }[] = []
  let currentSection: { title: string; items: string[] } | null = null
  let summary = ''
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    // Check for section headers (## or bold **)
    if (trimmed.startsWith('##') || trimmed.startsWith('**')) {
      if (currentSection) {
        sections.push(currentSection)
      }
      const title = trimmed.replace(/^##\s*/, '').replace(/^\*\*/, '').replace(/\*\*$/, '').trim()
      currentSection = { title, items: [] }
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.match(/^\d+\./)) {
      // Bullet point or numbered item
      if (currentSection) {
        currentSection.items.push(trimmed.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, ''))
      }
    } else if (trimmed && !currentSection) {
      // First paragraph is summary
      if (!summary) {
        summary = trimmed
      } else {
        summary += ' ' + trimmed
      }
    } else if (trimmed && currentSection) {
      // Regular text in a section
      currentSection.items.push(trimmed)
    }
  }
  
  if (currentSection) {
    sections.push(currentSection)
  }
  
  return { summary: summary.slice(0, 200) + (summary.length > 200 ? '...' : ''), sections, full: goal }
}

interface CollapsibleGoalProps {
  goal: string
}

export default function CollapsibleGoal({ goal }: CollapsibleGoalProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const parsed = parseGoalSections(goal)
  
  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/[0.06]">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left group"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Goal
              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </h3>
            {!isExpanded && (
              <p className="mt-2 text-sm text-gray-700 dark:text-slate-300 line-clamp-2">
                {parsed.summary}
              </p>
            )}
          </div>
        </div>
      </button>
      
      {isExpanded && (
        <div className="mt-3 space-y-4">
          {/* Summary */}
          {parsed.summary && (
            <p className="text-sm text-gray-700 dark:text-slate-300">{parsed.summary}</p>
          )}
          
          {/* Sections with bullet points */}
          {parsed.sections.map((section, idx) => (
            <div key={idx} className="bg-slate-800/50 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-amber-400 mb-2">{section.title}</h4>
              {section.items.length > 0 ? (
                <ul className="space-y-1">
                  {section.items.map((item, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400 italic">No items</p>
              )}
            </div>
          ))}
          
          {/* Show raw if no sections parsed */}
          {parsed.sections.length === 0 && (
            <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans">{parsed.full}</pre>
          )}
        </div>
      )}
    </div>
  )
}
