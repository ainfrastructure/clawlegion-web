'use client'

import { useState, useMemo } from 'react'
import { WorkflowStep } from './types'
import { 
  Terminal, 
  FileText, 
  Edit, 
  Eye, 
  Search, 
  Settings,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Filter
} from 'lucide-react'

interface ToolCallsTableProps {
  steps: WorkflowStep[]
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

interface ToolCallRowProps {
  step: WorkflowStep
  result?: WorkflowStep
  isExpanded: boolean
  onToggle: () => void
}

function ToolCallRow({ step, result, isExpanded, onToggle }: ToolCallRowProps) {
  const Icon = TOOL_ICONS[step.metadata?.tool || ''] || Terminal
  const isSuccess = result?.metadata?.exitCode === 0
  const isFailed = result?.metadata?.exitCode !== undefined && result.metadata.exitCode !== 0
  const duration = result?.metadata?.duration

  return (
    <>
      <tr 
        className="hover:bg-slate-800/50 cursor-pointer border-b border-white/[0.06]"
        onClick={onToggle}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-500" />
            )}
            <Icon className="w-4 h-4 text-blue-400" />
            <span className="font-mono text-sm text-slate-200">
              {step.metadata?.tool || 'Unknown'}
            </span>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className="text-sm text-slate-400 truncate block max-w-md">
            {step.content.substring(0, 80)}
            {step.content.length > 80 && '...'}
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          {isSuccess && <CheckCircle className="w-4 h-4 text-green-400 inline" />}
          {isFailed && <XCircle className="w-4 h-4 text-red-400 inline" />}
          {!result && <span className="text-slate-500">-</span>}
        </td>
        <td className="px-4 py-3 text-right">
          {duration ? (
            <span className="text-sm text-slate-400 flex items-center justify-end gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(duration)}
            </span>
          ) : (
            <span className="text-slate-500">-</span>
          )}
        </td>
        <td className="px-4 py-3 text-right text-xs text-slate-500">
          {formatTime(step.timestamp)}
        </td>
      </tr>
      
      {isExpanded && (
        <tr className="bg-slate-900/50">
          <td colSpan={5} className="px-4 py-3">
            <div className="space-y-3">
              {/* Arguments */}
              {step.metadata?.arguments && Object.keys(step.metadata.arguments).length > 0 && (
                <div>
                  <div className="text-xs text-slate-500 mb-1 font-medium">Arguments:</div>
                  <pre className="text-xs bg-slate-950 p-2 rounded overflow-x-auto text-slate-400 font-mono">
                    {JSON.stringify(step.metadata.arguments, null, 2)}
                  </pre>
                </div>
              )}
              
              {/* Result */}
              {result && (
                <div>
                  <div className="text-xs text-slate-500 mb-1 font-medium flex items-center gap-2">
                    Output:
                    {result.metadata?.exitCode !== undefined && (
                      <span className={`px-1.5 py-0.5 rounded text-xs ${
                        result.metadata.exitCode === 0 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        exit code: {result.metadata.exitCode}
                      </span>
                    )}
                  </div>
                  <pre className="text-xs bg-slate-950 p-2 rounded overflow-x-auto text-slate-400 font-mono max-h-64 overflow-y-auto whitespace-pre-wrap">
                    {result.content}
                  </pre>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export function ToolCallsTable({ steps }: ToolCallsTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [toolFilter, setToolFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  // Get all tool calls with their results
  const toolCallPairs = useMemo(() => {
    const pairs: Array<{ call: WorkflowStep; result?: WorkflowStep }> = []
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      if (step.type === 'tool_call') {
        const nextStep = steps[i + 1]
        if (nextStep?.type === 'tool_result') {
          pairs.push({ call: step, result: nextStep })
        } else {
          pairs.push({ call: step })
        }
      }
    }
    
    return pairs
  }, [steps])

  // Get unique tool names
  const toolNames = useMemo(() => {
    const names = new Set<string>()
    toolCallPairs.forEach(p => {
      if (p.call.metadata?.tool) {
        names.add(p.call.metadata.tool)
      }
    })
    return Array.from(names).sort()
  }, [toolCallPairs])

  // Filter pairs
  const filteredPairs = useMemo(() => {
    return toolCallPairs.filter(pair => {
      // Search filter
      if (searchQuery) {
        const lower = searchQuery.toLowerCase()
        if (!pair.call.content.toLowerCase().includes(lower) &&
            !pair.result?.content.toLowerCase().includes(lower) &&
            !pair.call.metadata?.tool?.toLowerCase().includes(lower)) {
          return false
        }
      }
      
      // Tool filter
      if (toolFilter !== 'all' && pair.call.metadata?.tool !== toolFilter) {
        return false
      }
      
      // Status filter
      if (statusFilter !== 'all') {
        const exitCode = pair.result?.metadata?.exitCode
        if (statusFilter === 'success' && exitCode !== 0) return false
        if (statusFilter === 'failed' && (exitCode === undefined || exitCode === 0)) return false
      }
      
      return true
    })
  }, [toolCallPairs, searchQuery, toolFilter, statusFilter])

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedIds(newExpanded)
  }

  // Stats
  const stats = useMemo(() => {
    const total = toolCallPairs.length
    const success = toolCallPairs.filter(p => p.result?.metadata?.exitCode === 0).length
    const failed = toolCallPairs.filter(p => p.result?.metadata?.exitCode !== undefined && p.result.metadata.exitCode !== 0).length
    const totalDuration = toolCallPairs.reduce((acc, p) => acc + (p.result?.metadata?.duration || 0), 0)
    return { total, success, failed, totalDuration }
  }, [toolCallPairs])

  if (toolCallPairs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <Terminal className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm">No tool calls in this workflow</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="bg-slate-800 px-3 py-1.5 rounded-lg">
          <span className="text-slate-400">Total: </span>
          <span className="font-medium text-slate-200">{stats.total}</span>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 px-3 py-1.5 rounded-lg">
          <span className="text-green-400">Success: </span>
          <span className="font-medium text-green-300">{stats.success}</span>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-lg">
          <span className="text-red-400">Failed: </span>
          <span className="font-medium text-red-300">{stats.failed}</span>
        </div>
        <div className="bg-slate-800 px-3 py-1.5 rounded-lg">
          <span className="text-slate-400">Total Time: </span>
          <span className="font-medium text-slate-200">{formatDuration(stats.totalDuration)}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search tool calls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-white/[0.06] rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={toolFilter}
            onChange={(e) => setToolFilter(e.target.value)}
            className="bg-slate-800 border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Tools</option>
            {toolNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'success' | 'failed')}
          className="bg-slate-800 border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>

        <span className="text-sm text-slate-500">
          {filteredPairs.length} calls
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
        <table className="w-full">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Tool
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {filteredPairs.map(pair => (
              <ToolCallRow
                key={pair.call.id}
                step={pair.call}
                result={pair.result}
                isExpanded={expandedIds.has(pair.call.id)}
                onToggle={() => toggleExpand(pair.call.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {filteredPairs.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <p className="text-sm">No tool calls match your filters</p>
        </div>
      )}
    </div>
  )
}
