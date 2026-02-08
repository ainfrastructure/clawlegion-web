'use client'

import { useMemo, ReactNode } from 'react'
import { getAgentById, getAgentColor } from './agentConfig'

interface MentionHighlightProps {
  content: string
  mentions?: string[]
}

/**
 * Renders message content with @mentions highlighted
 * @mentions are rendered with the agent's color as background
 * @all is rendered with a distinct gold color
 */
export function MentionHighlight({ content, mentions = [] }: MentionHighlightProps) {
  const renderedContent = useMemo(() => {
    if (!content) return null
    
    // Match @mentions in the content (alphanumeric and underscores)
    const mentionRegex = /@(\w+)/g
    const parts: ReactNode[] = []
    let lastIndex = 0
    let match
    
    while ((match = mentionRegex.exec(content)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index))
      }
      
      const mentionName = match[1].toLowerCase()
      const isAll = mentionName === 'all'
      const agent = !isAll ? getAgentById(mentionName) : null
      
      // Style based on whether it's a valid mention
      if (isAll) {
        // @all gets gold styling
        parts.push(
          <span
            key={`mention-${match.index}`}
            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
            style={{
              backgroundColor: 'rgba(234, 179, 8, 0.2)',
              color: '#EAB308',
            }}
          >
            @all
          </span>
        )
      } else if (agent) {
        // Known agent gets their color
        parts.push(
          <span
            key={`mention-${match.index}`}
            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
            style={{
              backgroundColor: `${agent.color}20`,
              color: agent.color,
            }}
            title={`${agent.name} - ${agent.role}`}
          >
            @{agent.name.toLowerCase()}
          </span>
        )
      } else {
        // Unknown mention - render as plain text
        parts.push(match[0])
      }
      
      lastIndex = match.index + match[0].length
    }
    
    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex))
    }
    
    return parts.length > 0 ? parts : content
  }, [content])
  
  return <>{renderedContent}</>
}
