'use client'

import { useState } from 'react'
import { WorkflowStep as WorkflowStepType } from './types'
import { 
  FileText, 
  Terminal, 
  Brain, 
  MessageSquare, 
  ChevronDown, 
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Eye,
  Search,
  Settings
} from 'lucide-react'

interface WorkflowStepProps {
  step: WorkflowStepType
  showDetails?: boolean
}

const TOOL_ICONS: Record<string, React.ElementType> = {
  Read: Eye,
  read: Eye,
  Write: Edit,
  write: Edit,
  Edit: Edit,
  edit: Edit,
  exec: Terminal,
  process: Settings,
  web_search: Search,
  web_fetch: Search,
  browser: Search,
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  thinking: { 
    icon: Brain, 
    color: 'text-purple-400', 
    bgColor: 'bg-purple-500/10 border-purple-500/30',
    label: 'Thinking'
  },
  tool_call: { 
    icon: Terminal, 
    color: 'text-blue-400', 
    bgColor: 'bg-blue-500/10 border-blue-500/30',
    label: 'Tool Call'
  },
  tool_result: { 
    icon: FileText, 
    color: 'text-cyan-400', 
    bgColor: 'bg-cyan-500/10 border-cyan-500/30',
    label: 'Result'
  },
  text: { 
    icon: MessageSquare, 
    color: 'text-slate-400', 
    bgColor: 'bg-slate-500/10 border-slate-500/30',
    label: 'Response'
  },
  decision: { 
    icon: Brain, 
    color: 'text-amber-400', 
    bgColor: 'bg-amber-500/10 border-amber-500/30',
    label: 'Decision'
  },
  system: { 
    icon: Settings, 
    color: 'text-slate-500', 
    bgColor: 'bg-slate-500/10 border-slate-500/30',
    label: 'System'
  },
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const seconds = ms / 1000
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds.toFixed(0)}s`
}

function formatTime(timestamp: string): string {
  try {
    return new Date(timestamp).toLocaleTimeString()
  } catch {
    return timestamp
  }
}

export function WorkflowStepComponent({ step, showDetails = false }: WorkflowStepProps) {
  const [isExpanded, setIsExpanded] = useState(showDetails)
  
  const config = TYPE_CONFIG[step.type] || TYPE_CONFIG.text
  const Icon = step.type === 'tool_call' && step.metadata?.tool 
    ? TOOL_ICONS[step.metadata.tool] || config.icon
    : config.icon

  const isSuccess = step.metadata?.exitCode === 0
  const isFailed = step.metadata?.exitCode !== undefined && step.metadata.exitCode !== 0

  return (
    <div className={`border rounded-lg ${config.bgColor} overflow-hidden`}>
      {/* Header */}
      <div 
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={`flex-shrink-0 ${config.color}`}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${config.color}`}>
              {config.label}
            </span>
            {step.metadata?.tool && (
              <span className="text-xs font-mono bg-slate-700/50 px-1.5 py-0.5 rounded">
                {step.metadata.tool}
              </span>
            )}
            {step.metadata?.duration && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(step.metadata.duration)}
              </span>
            )}
            {isSuccess && (
              <CheckCircle className="w-4 h-4 text-green-400" />
            )}
            {isFailed && (
              <XCircle className="w-4 h-4 text-red-400" />
            )}
          </div>
          <p className="text-sm text-slate-300 truncate mt-0.5">
            {step.content.split('\n')[0].substring(0, 150)}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-slate-500">
            {formatTime(step.timestamp)}
          </span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-500" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-white/[0.06] p-3 bg-slate-900/50">
          {/* Arguments for tool calls */}
          {step.metadata?.arguments && Object.keys(step.metadata.arguments).length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-slate-500 mb-1 font-medium">Arguments:</div>
              <pre className="text-xs bg-slate-950/50 p-2 rounded overflow-x-auto text-slate-400 font-mono">
                {JSON.stringify(step.metadata.arguments, null, 2)}
              </pre>
            </div>
          )}
          
          {/* Content */}
          <div>
            <div className="text-xs text-slate-500 mb-1 font-medium">
              {step.type === 'tool_result' ? 'Output:' : 'Content:'}
            </div>
            <pre className="text-sm bg-slate-950/50 p-3 rounded overflow-x-auto text-slate-300 whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
              {step.content}
            </pre>
          </div>

          {/* Usage stats */}
          {step.metadata?.usage && (
            <div className="mt-3 flex gap-4 text-xs text-slate-500">
              <span>Tokens: {step.metadata.usage.total?.toLocaleString()}</span>
              {step.metadata.usage.cost && (
                <span>Cost: ${step.metadata.usage.cost.toFixed(4)}</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
