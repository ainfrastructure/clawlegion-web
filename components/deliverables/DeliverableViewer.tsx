'use client'

import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import {
  FileText,
  Code2,
  BarChart3,
  Newspaper,
  Package,
  ExternalLink,
  Star,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Hash,
  BookOpen,
  GitBranch,
} from 'lucide-react'
import type { Deliverable } from '@/types/common'
import { FormattedText } from '@/components/tasks/shared/FormattedText'

type DeliverableViewerProps = {
  taskId: string
}

const TYPE_CONFIG: Record<string, { icon: typeof FileText; label: string; accent: string; bg: string; border: string }> = {
  document:  { icon: FileText,  label: 'Document',     accent: 'text-blue-400',   bg: 'bg-blue-500/8',   border: 'border-blue-500/20' },
  code_diff: { icon: Code2,     label: 'Code Changes', accent: 'text-emerald-400', bg: 'bg-emerald-500/8', border: 'border-emerald-500/20' },
  report:    { icon: BarChart3,  label: 'Report',       accent: 'text-violet-400', bg: 'bg-violet-500/8', border: 'border-violet-500/20' },
  blog_post: { icon: Newspaper,  label: 'Blog Post',    accent: 'text-amber-400',  bg: 'bg-amber-500/8',  border: 'border-amber-500/20' },
  artifact:  { icon: Package,    label: 'Artifact',     accent: 'text-slate-400',  bg: 'bg-slate-500/8',  border: 'border-slate-500/20' },
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; text: string }> = {
  draft:     { label: 'Draft',     dot: 'bg-slate-400',  text: 'text-slate-400' },
  submitted: { label: 'Submitted', dot: 'bg-blue-400',   text: 'text-blue-400' },
  approved:  { label: 'Approved',  dot: 'bg-emerald-400', text: 'text-emerald-400' },
  published: { label: 'Published', dot: 'bg-violet-400', text: 'text-violet-400' },
}

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [text])

  return (
    <button
      onClick={handleCopy}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
        transition-all duration-200 select-none
        ${copied
          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
          : 'bg-white/[0.04] text-slate-400 border border-white/[0.06] hover:bg-white/[0.08] hover:text-slate-200 hover:border-white/[0.12]'
        }
      `}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3" />
          Copied
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" />
          {label}
        </>
      )}
    </button>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-red-400'
  const bg = score >= 80 ? 'bg-emerald-500/10' : score >= 60 ? 'bg-amber-500/10' : 'bg-red-500/10'
  return (
    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${bg}`}>
      <Star className={`w-3 h-3 ${color}`} />
      <span className={`text-xs font-semibold tabular-nums ${color}`}>{score}</span>
    </div>
  )
}

type DeliverableMetadata = {
  wordCount?: number
  fileCount?: number
  sources?: string[]
  filesChanged?: string[]
  [key: string]: unknown
}

function MetaPill({ icon: Icon, children }: { icon: typeof Clock; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1 text-[11px] text-slate-500">
      <Icon className="w-3 h-3 text-slate-600" />
      {children}
    </div>
  )
}

function DeliverableCard({ deliverable, index }: { deliverable: Deliverable; index: number }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const typeInfo = TYPE_CONFIG[deliverable.type] || TYPE_CONFIG.artifact
  const statusInfo = STATUS_CONFIG[deliverable.status] || STATUS_CONFIG.draft
  const metadata = (deliverable.metadata ?? null) as DeliverableMetadata | null
  const Icon = typeInfo.icon
  const hasContent = !!deliverable.content

  return (
    <div
      className="group relative animate-fade-in-entry"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Card */}
      <div className={`
        relative rounded-xl overflow-hidden
        border ${typeInfo.border}
        bg-gradient-to-b from-white/[0.03] to-transparent
        transition-all duration-300
        hover:border-white/[0.12]
      `}>
        {/* Accent top edge */}
        <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent ${typeInfo.accent.replace('text-', 'via-')}/30 to-transparent`} />

        {/* Header */}
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-start justify-between gap-3">
            {/* Left: type + title */}
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${typeInfo.bg} border ${typeInfo.border} flex items-center justify-center mt-0.5`}>
                <Icon className={`w-4 h-4 ${typeInfo.accent}`} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-semibold text-slate-100 leading-snug tracking-[-0.01em]">
                  {deliverable.title}
                </h3>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  {/* Status */}
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                    <span className={`text-[11px] font-medium uppercase tracking-wider ${statusInfo.text}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  {/* Score */}
                  {deliverable.score != null && <ScoreBadge score={deliverable.score} />}
                  {/* Meta pills */}
                  {metadata?.wordCount != null && (
                    <MetaPill icon={BookOpen}>{metadata.wordCount.toLocaleString()} words</MetaPill>
                  )}
                  {metadata?.fileCount != null && (
                    <MetaPill icon={GitBranch}>{metadata.fileCount} files</MetaPill>
                  )}
                  {metadata?.sources && metadata.sources.length > 0 && (
                    <MetaPill icon={Hash}>{metadata.sources.length} sources</MetaPill>
                  )}
                </div>
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {hasContent && <CopyButton text={deliverable.content!} />}
              {hasContent && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content area */}
        {hasContent && isExpanded && (
          <div className="px-5 pb-4">
            <div className="relative">
              {/* Content block */}
              <div className={`
                relative rounded-lg overflow-hidden
                border border-white/[0.04]
                bg-[#060e1c]/80
              `}>
                <div className="max-h-[480px] overflow-y-auto custom-scrollbar px-4 py-4 selection:bg-blue-500/30">
                  <FormattedText text={deliverable.content!} className="space-y-2" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Code diff file list */}
        {deliverable.type === 'code_diff' && metadata?.filesChanged && isExpanded && (
          <div className="px-5 pb-4">
            <div className="rounded-lg border border-white/[0.04] bg-[#060e1c]/80 p-3 space-y-1">
              {metadata.filesChanged.slice(0, 10).map((file, i) => (
                <div key={i} className="flex items-center gap-2 py-0.5">
                  <Code2 className="w-3 h-3 text-emerald-500/70 flex-shrink-0" />
                  <span className="text-xs font-mono text-slate-400 truncate">{file}</span>
                </div>
              ))}
              {metadata.filesChanged.length > 10 && (
                <div className="text-[11px] text-slate-600 pt-1">
                  +{metadata.filesChanged.length - 10} more files
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer: link + timestamp */}
        <div className="px-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {deliverable.contentUrl && (
              <a
                href={deliverable.contentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-blue-400/80 hover:text-blue-300 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                View full content
              </a>
            )}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-600">
            <Clock className="w-3 h-3" />
            {new Date(deliverable.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}{' '}
            at{' '}
            {new Date(deliverable.createdAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export function DeliverableViewer({ taskId }: DeliverableViewerProps) {
  const { data: deliverables = [], isLoading } = useQuery<Deliverable[]>({
    queryKey: ['deliverables', taskId],
    queryFn: async () => {
      const res = await api.get(`/tasks/${taskId}/deliverables`)
      return res.data
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4 p-1">
        {[0, 1].map((i) => (
          <div key={i} className="animate-pulse rounded-xl border border-white/[0.04] overflow-hidden">
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-800 rounded w-2/3" />
                  <div className="h-3 bg-slate-800/60 rounded w-1/3" />
                </div>
              </div>
            </div>
            <div className="px-5 pb-4">
              <div className="h-32 bg-slate-900/50 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (deliverables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
          <FileText className="w-5 h-5 text-slate-600" />
        </div>
        <p className="text-sm text-slate-500 text-center">
          No deliverables yet
        </p>
        <p className="text-xs text-slate-600 mt-1 text-center">
          Outputs will appear here when work is submitted
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-1">
      {/* Summary bar */}
      {deliverables.length > 1 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-slate-500">
            {deliverables.length} deliverable{deliverables.length !== 1 ? 's' : ''}
          </span>
          <CopyAllButton deliverables={deliverables} />
        </div>
      )}
      {deliverables.map((d, i) => (
        <DeliverableCard key={d.id} deliverable={d} index={i} />
      ))}
    </div>
  )
}

function CopyAllButton({ deliverables }: { deliverables: Deliverable[] }) {
  const allContent = deliverables
    .filter((d) => d.content)
    .map((d) => `# ${d.title}\n\n${d.content}`)
    .join('\n\n---\n\n')

  if (!allContent) return null

  return <CopyButton text={allContent} label="Copy all" />
}
