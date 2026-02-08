'use client'

import { useState, useMemo } from 'react'
import { Download, Search, Copy, Check } from 'lucide-react'

interface RawTranscriptProps {
  lines: string[]
  sessionId?: string
}

export function RawTranscript({ lines, sessionId }: RawTranscriptProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [copied, setCopied] = useState(false)

  // Parse and syntax highlight JSON
  const highlightedLines = useMemo(() => {
    return lines.map((line, idx) => {
      try {
        const parsed = JSON.parse(line)
        const formatted = JSON.stringify(parsed, null, 2)
        return {
          index: idx,
          raw: line,
          formatted,
          type: parsed.type || 'unknown',
          matches: searchQuery ? line.toLowerCase().includes(searchQuery.toLowerCase()) : true,
        }
      } catch {
        return {
          index: idx,
          raw: line,
          formatted: line,
          type: 'invalid',
          matches: searchQuery ? line.toLowerCase().includes(searchQuery.toLowerCase()) : true,
        }
      }
    })
  }, [lines, searchQuery])

  const filteredLines = useMemo(() => {
    if (!searchQuery) return highlightedLines
    return highlightedLines.filter(l => l.matches)
  }, [highlightedLines, searchQuery])

  const handleDownload = () => {
    const content = lines.join('\n')
    const blob = new Blob([content], { type: 'application/x-jsonlines' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${sessionId || 'workflow'}-transcript.jsonl`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'session':
        return 'border-l-purple-500'
      case 'message':
        return 'border-l-blue-500'
      case 'model_change':
        return 'border-l-amber-500'
      case 'thinking_level_change':
        return 'border-l-cyan-500'
      case 'custom':
        return 'border-l-green-500'
      case 'invalid':
        return 'border-l-red-500'
      default:
        return 'border-l-slate-500'
    }
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search in transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-white/[0.06] rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-slate-200 bg-slate-800 border border-white/[0.06] rounded-lg transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-400" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy All
            </>
          )}
        </button>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-slate-200 bg-slate-800 border border-white/[0.06] rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Download
        </button>

        <span className="text-sm text-slate-500">
          {filteredLines.length} / {lines.length} lines
        </span>
      </div>

      {/* Transcript content */}
      <div className="bg-slate-950 rounded-lg border border-white/[0.06] overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          {filteredLines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <p className="text-sm">No lines match your search</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {filteredLines.map((line) => (
                <div
                  key={line.index}
                  className={`border-l-4 ${getTypeColor(line.type)} hover:bg-slate-900/50 transition-colors`}
                >
                  <div className="flex items-start">
                    {/* Line number */}
                    <div className="flex-shrink-0 w-12 px-2 py-2 text-right text-xs text-slate-600 select-none bg-slate-900/50">
                      {line.index + 1}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 overflow-x-auto">
                      <pre className="p-2 text-xs font-mono text-slate-300 whitespace-pre-wrap">
                        <code>{line.formatted}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-purple-500" />
          <span>Session</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span>Message</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-amber-500" />
          <span>Model Change</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>Custom</span>
        </div>
      </div>
    </div>
  )
}
