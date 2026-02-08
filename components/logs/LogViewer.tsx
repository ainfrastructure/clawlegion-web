'use client'

import { useState, useMemo } from 'react'
import type { Log, Execution, LogLevel } from '@/types/session'

interface LogViewerProps {
  sessionId: string
  logs: Log[]
  executions?: Execution[]
  isRunning?: boolean
  githubUrl?: string
}

const levelColors: Record<string, string> = {
  INFO: 'text-blue-400',
  WARN: 'text-yellow-400',
  ERROR: 'text-red-400',
  DEBUG: 'text-gray-400',
}

const levelBg: Record<string, string> = {
  INFO: 'bg-blue-500/10',
  WARN: 'bg-yellow-500/10',
  ERROR: 'bg-red-500/10',
  DEBUG: 'bg-gray-500/10',
}

export function LogViewer({ logs, executions, isRunning, githubUrl }: LogViewerProps) {
  const [filter, setFilter] = useState<LogLevel>('ALL')
  const [search, setSearch] = useState('')

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (filter !== 'ALL' && log.level !== filter) return false
      if (search && !log.message.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [logs, filter, search])

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-zinc-300">Logs</h3>
          {isRunning && (
            <span className="flex items-center gap-1 text-xs text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live
            </span>
          )}
          <span className="text-xs text-zinc-500">{filteredLogs.length} entries</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Search */}
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-300 placeholder-zinc-500 w-40 focus:outline-none focus:border-zinc-600"
          />
          {/* Level filter */}
          <div className="flex gap-1">
            {(['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG'] as LogLevel[]).map(level => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`text-xs px-2 py-0.5 rounded transition-colors ${
                  filter === level
                    ? 'bg-zinc-700 text-zinc-200'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Executions */}
      {executions && executions.length > 0 && (
        <div className="p-3 border-b border-zinc-800 space-y-1">
          <p className="text-xs text-zinc-500 mb-1">Executions</p>
          {executions.map(exec => (
            <div key={exec.id} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  exec.status === 'completed' ? 'bg-green-400' :
                  exec.status === 'running' ? 'bg-blue-400 animate-pulse' :
                  exec.status === 'failed' ? 'bg-red-400' : 'bg-zinc-400'
                }`} />
                <span className="text-zinc-300">{exec.taskName}</span>
                {exec.commitSha && githubUrl && (
                  <a href={`${githubUrl}/commit/${exec.commitSha}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-mono">
                    {exec.commitSha.slice(0, 7)}
                  </a>
                )}
              </div>
              <span className="text-zinc-500">
                {exec.duration ? `${(exec.duration / 1000).toFixed(1)}s` : exec.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Log entries */}
      <div className="max-h-[500px] overflow-y-auto font-mono text-xs">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            {logs.length === 0 ? 'No log entries yet' : 'No logs match the current filter'}
          </div>
        ) : (
          filteredLogs.map(log => (
            <div
              key={log.id}
              className={`flex items-start gap-2 px-3 py-1.5 border-b border-zinc-800/50 hover:bg-zinc-800/30 ${levelBg[log.level] || ''}`}
            >
              <span className="text-zinc-600 whitespace-nowrap shrink-0">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className={`font-semibold w-12 shrink-0 ${levelColors[log.level] || 'text-zinc-400'}`}>
                {log.level}
              </span>
              {log.source && (
                <span className="text-zinc-600 shrink-0">[{log.source}]</span>
              )}
              <span className="text-zinc-300 break-all">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
