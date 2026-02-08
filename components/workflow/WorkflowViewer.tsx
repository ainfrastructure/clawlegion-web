'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { ParsedWorkflow, TabType } from './types'
import { WorkflowTimeline } from './WorkflowTimeline'
import { ThinkingView } from './ThinkingView'
import { ToolCallsTable } from './ToolCallsTable'
import { RawTranscript } from './RawTranscript'
import { 
  GitBranch, 
  Brain, 
  Terminal, 
  FileCode, 
  Clock, 
  Activity,
  AlertCircle,
  Search,
  ChevronDown,
  History,
  RefreshCw
} from 'lucide-react'

interface Transcript {
  sessionId: string
  path: string
  modifiedAt: string
  size: number
}

interface WorkflowViewerProps {
  sessionId: string
  transcriptId?: string // If different from sessionId
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const seconds = ms / 1000
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds.toFixed(0)}s`
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function formatRelativeTime(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

const TABS: Array<{ id: TabType; label: string; icon: React.ElementType }> = [
  { id: 'workflow', label: 'Workflow', icon: GitBranch },
  { id: 'thinking', label: 'Thinking', icon: Brain },
  { id: 'tools', label: 'Tools', icon: Terminal },
  { id: 'raw', label: 'Raw', icon: FileCode },
]

export function WorkflowViewer({ sessionId, transcriptId }: WorkflowViewerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('workflow')
  const [filter, setFilter] = useState('')
  const [selectedTranscript, setSelectedTranscript] = useState<string | null>(transcriptId || null)
  const [showSelector, setShowSelector] = useState(false)

  // Fetch available transcripts
  const { data: transcripts, isLoading: transcriptsLoading, refetch: refetchTranscripts } = useQuery<Transcript[]>({
    queryKey: ['transcripts'],
    queryFn: async () => {
      const response = await api.get('/workflow/transcripts')
      return response.data
    },
    staleTime: 30000, // Cache for 30 seconds
  })

  // Determine which workflow ID to use
  const workflowId = selectedTranscript || transcriptId || sessionId

  // Fetch workflow data
  const { data: workflow, isLoading, error, refetch } = useQuery<ParsedWorkflow>({
    queryKey: ['workflow', workflowId],
    queryFn: async () => {
      const response = await api.get(`/workflow/sessions/${workflowId}`)
      return response.data
    },
    retry: false,
    enabled: !!workflowId,
  })

  // Handle transcript selection
  const handleSelectTranscript = (id: string) => {
    setSelectedTranscript(id)
    setShowSelector(false)
  }

  // Loading state
  if (isLoading && !showSelector) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-slate-700 animate-pulse" />
          <div className="h-6 w-48 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-slate-700/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  // No workflow found - show transcript selector
  if ((error || !workflow) && !isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Claude Workflow</h3>
            </div>
            <button
              onClick={() => refetchTranscripts()}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              title="Refresh transcripts"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col items-center justify-center py-4 mb-6">
            <AlertCircle className="w-10 h-10 text-gray-400 dark:text-slate-500 mb-3" />
            <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
              No Transcript Linked
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-500 text-center max-w-md">
              Select a Claude Code transcript below to view the workflow details
            </p>
          </div>

          {/* Transcript list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 flex items-center gap-2">
                <History className="w-4 h-4" />
                Recent Transcripts
              </h4>
              <span className="text-xs text-gray-500 dark:text-slate-500">
                {transcripts?.length || 0} available
              </span>
            </div>

            {transcriptsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-100 dark:bg-slate-700/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : transcripts && transcripts.length > 0 ? (
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {transcripts.map((t) => (
                  <button
                    key={t.sessionId}
                    onClick={() => handleSelectTranscript(t.sessionId)}
                    className="w-full p-3 bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-left transition-colors border border-transparent hover:border-blue-500/30"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-xs font-mono text-blue-600 dark:text-blue-400">
                        {t.sessionId.slice(0, 8)}...
                      </code>
                      <span className="text-xs text-gray-500 dark:text-slate-500">
                        {formatRelativeTime(t.modifiedAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <FileCode className="w-3 h-3" />
                        {formatSize(t.size)}
                      </span>
                      <span>
                        {new Date(t.modifiedAt).toLocaleString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-slate-500">
                <p className="text-sm">No transcripts available</p>
                <p className="text-xs mt-1">Run a Claude Code session to generate transcripts</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Workflow loaded successfully
  const { summary, steps, rawLines } = workflow!

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
      {/* Header with summary */}
      <div className="border-b border-gray-200 dark:border-slate-700 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Claude Workflow
              </h3>
              
              {/* Transcript selector dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSelector(!showSelector)}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <code className="font-mono">{workflowId.slice(0, 8)}...</code>
                  <ChevronDown className="w-3 h-3" />
                </button>
                
                {showSelector && (
                  <div className="absolute top-full left-0 mt-1 w-72 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                    <div className="p-2 border-b border-gray-200 dark:border-slate-700">
                      <span className="text-xs text-gray-500 dark:text-slate-500 font-medium">Select Transcript</span>
                    </div>
                    {transcripts?.map((t) => (
                      <button
                        key={t.sessionId}
                        onClick={() => handleSelectTranscript(t.sessionId)}
                        className={`w-full p-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors ${
                          t.sessionId === workflowId ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <code className="text-xs font-mono text-gray-700 dark:text-slate-300">
                          {t.sessionId.slice(0, 8)}...
                        </code>
                        <div className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">
                          {formatRelativeTime(t.modifiedAt)} · {formatSize(t.size)}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              View the actual Claude Code execution flow
            </p>
          </div>

          {/* Summary stats */}
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="bg-gray-100 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-gray-500 dark:text-slate-400" />
              <span className="text-gray-700 dark:text-slate-300">{summary.totalSteps} steps</span>
            </div>
            <div className="bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-purple-700 dark:text-purple-300">{summary.thinkingBlocks} thoughts</span>
            </div>
            <div className="bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-blue-700 dark:text-blue-300">{summary.toolCalls} tool calls</span>
            </div>
            {summary.duration && (
              <div className="bg-gray-100 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                <span className="text-gray-700 dark:text-slate-300">{formatDuration(summary.duration)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Model info */}
        {summary.model && (
          <div className="mt-3 text-xs text-gray-500 dark:text-slate-500">
            Model: <span className="text-gray-600 dark:text-slate-400">{summary.model}</span>
            {summary.provider && (
              <>
                {' '}· Provider: <span className="text-gray-600 dark:text-slate-400">{summary.provider}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-4">
          <div className="flex">
            {TABS.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              let count: number | undefined
              if (tab.id === 'thinking') count = summary.thinkingBlocks
              if (tab.id === 'tools') count = summary.toolCalls
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                    ${isActive 
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                      : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-600'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {count !== undefined && count > 0 && (
                    <span className={`
                      ml-1 px-1.5 py-0.5 text-xs rounded-full
                      ${isActive ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300' : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400'}
                    `}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Filter input for workflow tab */}
          {activeTab === 'workflow' && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Filter steps..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48"
              />
            </div>
          )}
        </div>
      </div>

      {/* Tab content */}
      <div className="p-4 max-h-[700px] overflow-y-auto">
        {activeTab === 'workflow' && (
          <div className="pl-8">
            <WorkflowTimeline steps={steps} filter={filter} />
          </div>
        )}
        
        {activeTab === 'thinking' && (
          <ThinkingView steps={steps} />
        )}
        
        {activeTab === 'tools' && (
          <ToolCallsTable steps={steps} />
        )}
        
        {activeTab === 'raw' && (
          <RawTranscript lines={rawLines} sessionId={workflowId} />
        )}
      </div>
    </div>
  )
}
