'use client'

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
} from 'lucide-react'
import type { Deliverable } from '@/types/common'

interface DeliverableViewerProps {
  taskId: string
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  document: { icon: <FileText className="w-4 h-4" />, label: 'Document', color: 'text-blue-400' },
  code_diff: { icon: <Code2 className="w-4 h-4" />, label: 'Code Changes', color: 'text-green-400' },
  report: { icon: <BarChart3 className="w-4 h-4" />, label: 'Report', color: 'text-purple-400' },
  blog_post: { icon: <Newspaper className="w-4 h-4" />, label: 'Blog Post', color: 'text-amber-400' },
  artifact: { icon: <Package className="w-4 h-4" />, label: 'Artifact', color: 'text-slate-400' },
}

const STATUS_BADGES: Record<string, { label: string; classes: string }> = {
  draft: { label: 'Draft', classes: 'bg-slate-700 text-slate-300' },
  submitted: { label: 'Submitted', classes: 'bg-blue-500/20 text-blue-400' },
  approved: { label: 'Approved', classes: 'bg-green-500/20 text-green-400' },
  published: { label: 'Published', classes: 'bg-purple-500/20 text-purple-400' },
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-amber-400' : 'text-red-400'
  return (
    <div className={`flex items-center gap-1 ${color}`}>
      <Star className="w-3.5 h-3.5" />
      <span className="text-sm font-medium">{score}</span>
    </div>
  )
}

interface DeliverableMetadata {
  wordCount?: number
  fileCount?: number
  sources?: string[]
  filesChanged?: string[]
  [key: string]: unknown
}

function DeliverableCard({ deliverable }: { deliverable: Deliverable }) {
  const typeInfo = TYPE_CONFIG[deliverable.type] || TYPE_CONFIG.artifact
  const statusBadge = STATUS_BADGES[deliverable.status] || STATUS_BADGES.draft
  const metadata = (deliverable.metadata ?? null) as DeliverableMetadata | null

  return (
    <div className="glass-2 rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={typeInfo.color}>{typeInfo.icon}</span>
          <span className="text-sm font-medium text-slate-200">{deliverable.title}</span>
        </div>
        <div className="flex items-center gap-2">
          {deliverable.score != null && <ScoreBadge score={deliverable.score} />}
          <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge.classes}`}>
            {statusBadge.label}
          </span>
        </div>
      </div>

      {/* Metadata */}
      {metadata != null && (
        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          {metadata.wordCount != null && (
            <span>{metadata.wordCount} words</span>
          )}
          {metadata.fileCount != null && (
            <span>{metadata.fileCount} files changed</span>
          )}
          {metadata.sources && metadata.sources.length > 0 && (
            <span>{metadata.sources.length} sources</span>
          )}
          {metadata.filesChanged && metadata.filesChanged.length > 0 && (
            <span>{metadata.filesChanged.length} files</span>
          )}
        </div>
      )}

      {/* Content preview */}
      {deliverable.content && (
        <div className="text-sm text-slate-400 bg-slate-900/50 rounded-lg p-3 max-h-48 overflow-y-auto whitespace-pre-wrap">
          {deliverable.content.slice(0, 500)}
          {deliverable.content.length > 500 && '...'}
        </div>
      )}

      {/* Code diff metadata */}
      {deliverable.type === 'code_diff' && metadata?.filesChanged && (
        <div className="text-xs text-slate-500 space-y-1">
          {metadata.filesChanged.slice(0, 10).map((file, i) => (
            <div key={i} className="flex items-center gap-1">
              <Code2 className="w-3 h-3 text-green-500" />
              <span className="font-mono">{file}</span>
            </div>
          ))}
          {metadata.filesChanged.length > 10 && (
            <div className="text-slate-600">
              +{metadata.filesChanged.length - 10} more files
            </div>
          )}
        </div>
      )}

      {/* External link */}
      {deliverable.contentUrl && (
        <a
          href={deliverable.contentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
        >
          <ExternalLink className="w-3 h-3" />
          View full content
        </a>
      )}

      {/* Timestamp */}
      <div className="text-xs text-slate-600">
        {new Date(deliverable.createdAt).toLocaleDateString()} at{' '}
        {new Date(deliverable.createdAt).toLocaleTimeString()}
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
      <div className="space-y-3 animate-pulse">
        <div className="h-24 bg-slate-800 rounded-xl" />
        <div className="h-24 bg-slate-800 rounded-xl" />
      </div>
    )
  }

  if (deliverables.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm">
        No deliverables yet. Outputs will appear here when work is submitted.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {deliverables.map((d) => (
        <DeliverableCard key={d.id} deliverable={d} />
      ))}
    </div>
  )
}
