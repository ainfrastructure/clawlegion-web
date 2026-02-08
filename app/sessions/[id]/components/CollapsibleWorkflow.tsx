'use client'

import { useState } from 'react'
import { FileText, ChevronDown } from 'lucide-react'
import { WorkflowViewer } from '@/components/workflow'

interface CollapsibleWorkflowProps {
  sessionId: string
}

export default function CollapsibleWorkflow({ sessionId }: CollapsibleWorkflowProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-200 dark:border-white/[0.06] overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center gap-3 text-left">
          <FileText className="w-5 h-5 text-blue-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Claude Workflow</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">View the actual Claude Code execution flow</p>
          </div>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-gray-500 dark:text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
        />
      </button>
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-white/[0.06] p-4">
          <WorkflowViewer sessionId={sessionId} />
        </div>
      )}
    </div>
  )
}
