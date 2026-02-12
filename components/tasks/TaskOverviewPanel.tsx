'use client'

import { useState } from 'react'
import {
  FileText, ListChecks, Target, CheckCircle, Tag, AlertCircle,
  ChevronRight,
} from 'lucide-react'
import { TaskCompactMetadata } from './TaskCompactMetadata'
import type { Task } from './types'

type TaskOverviewPanelProps = {
  task: Partial<Task> | undefined
}

export function TaskOverviewPanel({ task }: TaskOverviewPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    specs: false,
    approach: false,
    criteria: false,
  })

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-4">
      {/* Description */}
      <div className="bg-blue-950/30 border border-blue-500/[0.08] rounded-xl p-4">
        <h3 className="text-xs font-semibold text-blue-300/60 uppercase tracking-wider mb-3 flex items-center gap-2">
          <FileText className="w-3.5 h-3.5" />
          Description
        </h3>
        <FormattedText text={task?.description || 'No description provided.'} />
      </div>

      {/* Compact metadata */}
      <div className="bg-blue-950/30 border border-blue-500/[0.08] rounded-xl p-4">
        <TaskCompactMetadata task={task} />
      </div>

      {/* Collapsible sections */}
      {task?.specs && (
        <CollapsibleSection
          title="Specifications"
          icon={<ListChecks className="w-3.5 h-3.5" />}
          borderColor="border-l-blue-500"
          isOpen={expandedSections.specs}
          onToggle={() => toggleSection('specs')}
        >
          <FormattedText text={task.specs} />
        </CollapsibleSection>
      )}
      {task?.approach && (
        <CollapsibleSection
          title="Approach"
          icon={<Target className="w-3.5 h-3.5" />}
          borderColor="border-l-emerald-500"
          isOpen={expandedSections.approach}
          onToggle={() => toggleSection('approach')}
        >
          <FormattedText text={task.approach} />
        </CollapsibleSection>
      )}
      {task?.successCriteria && (
        <CollapsibleSection
          title="Success Criteria"
          icon={<CheckCircle className="w-3.5 h-3.5" />}
          borderColor="border-l-purple-500"
          isOpen={expandedSections.criteria}
          onToggle={() => toggleSection('criteria')}
        >
          <FormattedText text={task.successCriteria} />
        </CollapsibleSection>
      )}

      {/* Verification note */}
      {task?.verificationAttempts !== undefined && task.verificationAttempts > 0 && task?.lastVerificationNote && (
        <div className="bg-red-950/20 border border-red-500/[0.15] rounded-xl p-4 border-l-2 border-l-red-500">
          <div className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5" />
            Last Verification Note
          </div>
          <p className="text-sm text-red-300">{task.lastVerificationNote}</p>
        </div>
      )}

      {/* Tags */}
      {task?.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-slate-500" />
          {task.tags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/[0.08] rounded-lg text-xs text-blue-300/70">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// --- Helper Components ---

function CollapsibleSection({
  title,
  icon,
  borderColor,
  isOpen,
  onToggle,
  children,
}: {
  title: string
  icon: React.ReactNode
  borderColor: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className={`bg-blue-950/30 border border-blue-500/[0.08] rounded-xl border-l-2 ${borderColor} overflow-hidden`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-red-500/[0.04] transition-colors"
      >
        <h3 className="text-xs font-semibold text-blue-300/60 uppercase tracking-wider flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 -mt-1">
          {children}
        </div>
      )}
    </div>
  )
}

function FormattedText({ text }: { text: string }) {
  if (!text) return null

  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let currentList: string[] = []
  let key = 0

  function flushList() {
    if (currentList.length > 0) {
      elements.push(
        <ul key={key++} className="list-disc list-inside space-y-0.5 text-slate-300 text-sm">
          {currentList.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      )
      currentList = []
    }
  }

  function renderInline(str: string): React.ReactNode {
    const parts = str.split(/(\*\*[^*]+\*\*|`[^`]+`)/)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="px-1 py-0.5 rounded bg-white/[0.06] text-blue-300 text-xs font-mono">{part.slice(1, -1)}</code>
      }
      return part
    })
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      currentList.push(trimmed.slice(2))
    } else {
      flushList()
      if (trimmed === '') {
        elements.push(<div key={key++} className="h-2" />)
      } else {
        elements.push(
          <p key={key++} className="text-slate-300 text-sm leading-relaxed">
            {renderInline(trimmed)}
          </p>
        )
      }
    }
  }
  flushList()

  return <div className="space-y-1.5">{elements}</div>
}
