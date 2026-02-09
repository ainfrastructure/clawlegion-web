'use client'

import { useState } from 'react'
import {
  FileText, ListChecks, Target, CheckCircle, Tag, AlertCircle,
} from 'lucide-react'
import { FormattedText } from '../shared/FormattedText'
import { CollapsibleSection } from '../shared/CollapsibleSection'
import { SubtaskList } from '../SubtaskList'
import { TaskCompactMetadata } from '../TaskCompactMetadata'
import type { Task } from '../types'

type OverviewTabProps = {
  task: Partial<Task> | undefined
  taskId: string
}

export function OverviewTab({ task, taskId }: OverviewTabProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    specs: false,
    approach: false,
    criteria: false,
  })

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-4 p-4">
      {/* Description */}
      <div className="bg-blue-950/30 border border-blue-500/[0.08] rounded-xl p-4">
        <h3 className="text-xs font-semibold text-blue-300/60 uppercase tracking-wider mb-3 flex items-center gap-2">
          <FileText className="w-3.5 h-3.5" />
          Description
        </h3>
        <FormattedText text={task?.description || 'No description provided.'} />
      </div>

      {/* Subtasks */}
      {task && !task.parentId && (task.subtasks?.length ?? 0) >= 0 && (
        <SubtaskList
          parentId={taskId}
          subtasks={task.subtasks || []}
          onSubtaskClick={(subtaskId) => {
            window.open(`/tasks?taskId=${subtaskId}`, '_blank')
          }}
        />
      )}

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

      {/* Compact Metadata */}
      <div className="bg-blue-950/30 border border-blue-500/[0.08] rounded-xl p-4">
        <TaskCompactMetadata task={task} />
      </div>

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
