'use client'

import { useState } from 'react'
import { 
  X, 
  Clock, 
  Calendar,
  GitBranch,
  GitMerge,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
  Plus,
  Minus
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================
// Types
// ============================================

type LoopStatus = 'running' | 'completed' | 'failed' | 'pending'
type PhaseStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped'

interface PhaseData {
  name: string
  icon: string
  status: PhaseStatus
  startedAt?: string
  completedAt?: string
  duration?: number // seconds
  output?: string
}

interface FileDiff {
  path: string
  additions: number
  deletions: number
  status: 'added' | 'modified' | 'deleted' | 'renamed'
  hunks: DiffHunk[]
}

interface DiffHunk {
  oldStart: number
  oldLines: number
  newStart: number
  newLines: number
  lines: DiffLine[]
}

interface DiffLine {
  type: 'context' | 'addition' | 'deletion'
  content: string
  oldLineNumber?: number
  newLineNumber?: number
}

interface LoopData {
  id: string
  title: string
  status: LoopStatus
  createdAt: string
  startedAt?: string
  completedAt?: string
  branch?: string
  phases: PhaseData[]
  diff?: {
    filesChanged: number
    additions: number
    deletions: number
    files: FileDiff[]
  }
}

interface LoopDetailModalProps {
  loopId: string
  onClose: () => void
}

// ============================================
// Mock Data (for demo)
// ============================================

const getMockLoopData = (loopId: string): LoopData => ({
  id: loopId,
  title: 'Implement user authentication',
  status: 'completed',
  createdAt: '2025-02-01T10:00:00Z',
  startedAt: '2025-02-01T10:00:05Z',
  completedAt: '2025-02-01T10:15:32Z',
  branch: 'feature/auth-system',
  phases: [
    {
      name: 'Scout',
      icon: '🔍',
      status: 'completed',
      startedAt: '2025-02-01T10:00:05Z',
      completedAt: '2025-02-01T10:02:15Z',
      duration: 130,
      output: 'Researched OAuth2 libraries. Found 3 options:\n- next-auth (recommended)\n- passport.js\n- auth0-react\n\nRecommending next-auth for Next.js integration.'
    },
    {
      name: 'Archie',
      icon: '📋',
      status: 'completed',
      startedAt: '2025-02-01T10:02:15Z',
      completedAt: '2025-02-01T10:05:45Z',
      duration: 210,
      output: 'Created implementation plan:\n1. Install next-auth\n2. Configure providers (GitHub, Google)\n3. Create auth API routes\n4. Add session provider\n5. Protect routes'
    },
    {
      name: 'Mason',
      icon: '🔧',
      status: 'completed',
      startedAt: '2025-02-01T10:05:45Z',
      completedAt: '2025-02-01T10:12:00Z',
      duration: 375,
      output: 'Implementation complete:\n- Created /api/auth/[...nextauth]/route.ts\n- Added SessionProvider to layout\n- Created useSession hook wrapper\n- Added login/logout buttons'
    },
    {
      name: 'Vex',
      icon: '✅',
      status: 'completed',
      startedAt: '2025-02-01T10:12:00Z',
      completedAt: '2025-02-01T10:15:32Z',
      duration: 212,
      output: 'Verification passed:\n✓ Login flow works\n✓ Session persists\n✓ Protected routes redirect\n✓ Logout clears session\n\nAll tests passing. Ready for merge.'
    }
  ],
  diff: {
    filesChanged: 5,
    additions: 147,
    deletions: 12,
    files: [
      {
        path: 'app/api/auth/[...nextauth]/route.ts',
        additions: 45,
        deletions: 0,
        status: 'added',
        hunks: [
          {
            oldStart: 0,
            oldLines: 0,
            newStart: 1,
            newLines: 45,
            lines: [
              { type: 'addition', content: "import NextAuth from 'next-auth'", newLineNumber: 1 },
              { type: 'addition', content: "import GithubProvider from 'next-auth/providers/github'", newLineNumber: 2 },
              { type: 'addition', content: "import GoogleProvider from 'next-auth/providers/google'", newLineNumber: 3 },
              { type: 'addition', content: '', newLineNumber: 4 },
              { type: 'addition', content: 'const handler = NextAuth({', newLineNumber: 5 },
              { type: 'addition', content: '  providers: [', newLineNumber: 6 },
              { type: 'addition', content: '    GithubProvider({', newLineNumber: 7 },
              { type: 'addition', content: '      clientId: process.env.GITHUB_ID!,', newLineNumber: 8 },
              { type: 'addition', content: '      clientSecret: process.env.GITHUB_SECRET!,', newLineNumber: 9 },
              { type: 'addition', content: '    }),', newLineNumber: 10 },
            ]
          }
        ]
      },
      {
        path: 'app/layout.tsx',
        additions: 12,
        deletions: 4,
        status: 'modified',
        hunks: [
          {
            oldStart: 1,
            oldLines: 10,
            newStart: 1,
            newLines: 18,
            lines: [
              { type: 'context', content: "import './globals.css'", oldLineNumber: 1, newLineNumber: 1 },
              { type: 'addition', content: "import { SessionProvider } from 'next-auth/react'", newLineNumber: 2 },
              { type: 'context', content: '', oldLineNumber: 2, newLineNumber: 3 },
              { type: 'deletion', content: 'export default function RootLayout({', oldLineNumber: 3 },
              { type: 'addition', content: 'export default function RootLayout({', newLineNumber: 4 },
              { type: 'context', content: '  children,', oldLineNumber: 4, newLineNumber: 5 },
              { type: 'deletion', content: '}: { children: React.ReactNode }) {', oldLineNumber: 5 },
              { type: 'addition', content: '}: { children: React.ReactNode }) {', newLineNumber: 6 },
              { type: 'context', content: '  return (', oldLineNumber: 6, newLineNumber: 7 },
              { type: 'addition', content: '    <SessionProvider>', newLineNumber: 8 },
            ]
          }
        ]
      },
      {
        path: 'components/auth/LoginButton.tsx',
        additions: 35,
        deletions: 0,
        status: 'added',
        hunks: [
          {
            oldStart: 0,
            oldLines: 0,
            newStart: 1,
            newLines: 35,
            lines: [
              { type: 'addition', content: "'use client'", newLineNumber: 1 },
              { type: 'addition', content: '', newLineNumber: 2 },
              { type: 'addition', content: "import { signIn, signOut, useSession } from 'next-auth/react'", newLineNumber: 3 },
              { type: 'addition', content: '', newLineNumber: 4 },
              { type: 'addition', content: 'export function LoginButton() {', newLineNumber: 5 },
              { type: 'addition', content: '  const { data: session } = useSession()', newLineNumber: 6 },
            ]
          }
        ]
      },
      {
        path: 'middleware.ts',
        additions: 28,
        deletions: 0,
        status: 'added',
        hunks: [
          {
            oldStart: 0,
            oldLines: 0,
            newStart: 1,
            newLines: 28,
            lines: [
              { type: 'addition', content: "export { default } from 'next-auth/middleware'", newLineNumber: 1 },
              { type: 'addition', content: '', newLineNumber: 2 },
              { type: 'addition', content: 'export const config = {', newLineNumber: 3 },
              { type: 'addition', content: "  matcher: ['/dashboard/:path*', '/api/protected/:path*']", newLineNumber: 4 },
              { type: 'addition', content: '}', newLineNumber: 5 },
            ]
          }
        ]
      },
      {
        path: 'hooks/useAuth.ts',
        additions: 27,
        deletions: 8,
        status: 'modified',
        hunks: [
          {
            oldStart: 1,
            oldLines: 15,
            newStart: 1,
            newLines: 34,
            lines: [
              { type: 'deletion', content: '// Placeholder auth hook', oldLineNumber: 1 },
              { type: 'deletion', content: 'export function useAuth() {', oldLineNumber: 2 },
              { type: 'deletion', content: '  return { user: null, isLoading: false }', oldLineNumber: 3 },
              { type: 'deletion', content: '}', oldLineNumber: 4 },
              { type: 'addition', content: "'use client'", newLineNumber: 1 },
              { type: 'addition', content: '', newLineNumber: 2 },
              { type: 'addition', content: "import { useSession } from 'next-auth/react'", newLineNumber: 3 },
              { type: 'addition', content: '', newLineNumber: 4 },
              { type: 'addition', content: 'export function useAuth() {', newLineNumber: 5 },
              { type: 'addition', content: '  const { data: session, status } = useSession()', newLineNumber: 6 },
            ]
          }
        ]
      }
    ]
  }
})

// ============================================
// Helper Functions
// ============================================

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs}s`
  return `${mins}m ${secs}s`
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function calculateDuration(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const seconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000)
  return formatDuration(seconds)
}

// ============================================
// Sub-Components
// ============================================

function StatusBadge({ status }: { status: LoopStatus }) {
  const config = {
    running: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: Loader2, animate: true },
    completed: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle2, animate: false },
    failed: { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle, animate: false },
    pending: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: Clock, animate: false }
  }[status]

  const Icon = config.icon

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm', config.bg, config.text)}>
      <Icon size={14} className={config.animate ? 'animate-spin' : ''} />
      <span className="capitalize">{status}</span>
    </span>
  )
}

function PhaseStatusIcon({ status }: { status: PhaseStatus }) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 size={16} className="text-green-400" />
    case 'running':
      return <Loader2 size={16} className="text-blue-400 animate-spin" />
    case 'failed':
      return <XCircle size={16} className="text-red-400" />
    case 'skipped':
      return <div className="w-4 h-4 rounded-full border-2 border-slate-500" />
    default:
      return <div className="w-4 h-4 rounded-full border-2 border-slate-600" />
  }
}

function PhaseCard({ phase, isLast }: { phase: PhaseData; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="relative">
      {/* Timeline connector */}
      {!isLast && (
        <div className={cn(
          'absolute left-[19px] top-10 w-0.5 h-[calc(100%-20px)]',
          phase.status === 'completed' ? 'bg-green-500/50' :
          phase.status === 'running' ? 'bg-blue-500/50' :
          'bg-slate-700'
        )} />
      )}

      <div className="flex gap-3">
        {/* Timeline node */}
        <div className={cn(
          'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2',
          phase.status === 'completed' ? 'border-green-500 bg-green-500/20' :
          phase.status === 'running' ? 'border-blue-500 bg-blue-500/20' :
          phase.status === 'failed' ? 'border-red-500 bg-red-500/20' :
          'border-slate-600 bg-slate-800'
        )}>
          <span className="text-lg">{phase.icon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pb-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">{phase.name}</span>
                <PhaseStatusIcon status={phase.status} />
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                {phase.duration && <span>{formatDuration(phase.duration)}</span>}
                {phase.output && (
                  expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                )}
              </div>
            </div>
          </button>

          {/* Expanded output */}
          {expanded && phase.output && (
            <div className="mt-2 p-3 glass-2 rounded-lg">
              <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono overflow-x-auto">
                {phase.output}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DiffSummary({ diff }: { diff: LoopData['diff'] }) {
  if (!diff) return null

  return (
    <div className="flex items-center gap-4 text-sm">
      <span className="text-slate-400">
        <FileText size={14} className="inline mr-1" />
        {diff.filesChanged} {diff.filesChanged === 1 ? 'file' : 'files'} changed
      </span>
      <span className="text-green-400">
        <Plus size={14} className="inline mr-1" />
        {diff.additions}
      </span>
      <span className="text-red-400">
        <Minus size={14} className="inline mr-1" />
        {diff.deletions}
      </span>
    </div>
  )
}

function FileDiffCard({ file }: { file: FileDiff }) {
  const [expanded, setExpanded] = useState(false)

  const statusConfig = {
    added: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'A' },
    modified: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'M' },
    deleted: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'D' },
    renamed: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'R' }
  }[file.status]

  return (
    <div className="border border-white/[0.06] rounded-lg overflow-hidden">
      {/* File header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2 bg-slate-800/50 hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={cn('px-1.5 py-0.5 rounded text-xs font-medium', statusConfig.bg, statusConfig.text)}>
            {statusConfig.label}
          </span>
          <span className="text-sm text-slate-300 truncate font-mono">{file.path}</span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-green-400 text-sm">+{file.additions}</span>
          <span className="text-red-400 text-sm">-{file.deletions}</span>
          {expanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
        </div>
      </button>

      {/* Diff content */}
      {expanded && (
        <div className="bg-slate-900/50 overflow-x-auto">
          {file.hunks.map((hunk, hunkIdx) => (
            <div key={hunkIdx}>
              {/* Hunk header */}
              <div className="px-4 py-1 bg-slate-800/30 text-slate-500 text-xs font-mono border-y border-slate-800">
                @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@
              </div>
              {/* Lines */}
              {hunk.lines.map((line, lineIdx) => (
                <div
                  key={lineIdx}
                  className={cn(
                    'flex font-mono text-xs',
                    line.type === 'addition' && 'bg-green-500/10',
                    line.type === 'deletion' && 'bg-red-500/10'
                  )}
                >
                  <span className="w-12 px-2 py-0.5 text-right text-slate-600 select-none border-r border-slate-800 flex-shrink-0">
                    {line.oldLineNumber || ''}
                  </span>
                  <span className="w-12 px-2 py-0.5 text-right text-slate-600 select-none border-r border-slate-800 flex-shrink-0">
                    {line.newLineNumber || ''}
                  </span>
                  <span className={cn(
                    'px-2 py-0.5 flex-shrink-0 w-4',
                    line.type === 'addition' && 'text-green-400',
                    line.type === 'deletion' && 'text-red-400'
                  )}>
                    {line.type === 'addition' ? '+' : line.type === 'deletion' ? '-' : ' '}
                  </span>
                  <span className={cn(
                    'px-2 py-0.5 flex-1 whitespace-pre',
                    line.type === 'addition' && 'text-green-300',
                    line.type === 'deletion' && 'text-red-300',
                    line.type === 'context' && 'text-slate-400'
                  )}>
                    {line.content}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function LoopDetailModal({ loopId, onClose }: LoopDetailModalProps) {
  // In production, this would be fetched via useQuery
  const loop = getMockLoopData(loopId)
  const [merging, setMerging] = useState(false)
  const [discarding, setDiscarding] = useState(false)

  const handleMerge = async () => {
    setMerging(true)
    // TODO: Implement actual merge logic
    await new Promise(resolve => setTimeout(resolve, 1500))
    setMerging(false)
    onClose()
  }

  const handleDiscard = async () => {
    setDiscarding(true)
    // TODO: Implement actual discard logic
    await new Promise(resolve => setTimeout(resolve, 1000))
    setDiscarding(false)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-y-8 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:max-w-4xl md:w-full bg-slate-900 border border-white/[0.06] rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-start justify-between p-4 md:p-6 border-b border-white/[0.06]">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-lg md:text-xl font-bold text-white truncate">{loop.title}</h2>
              <StatusBadge status={loop.status} />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {formatDateTime(loop.createdAt)}
              </span>
              {loop.completedAt && loop.startedAt && (
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {calculateDuration(loop.startedAt, loop.completedAt)}
                </span>
              )}
              {loop.branch && (
                <span className="flex items-center gap-1">
                  <GitBranch size={14} />
                  {loop.branch}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* Timeline Section */}
          <section>
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
              Agent Pipeline
            </h3>
            <div className="space-y-0">
              {loop.phases.map((phase, idx) => (
                <PhaseCard 
                  key={phase.name} 
                  phase={phase} 
                  isLast={idx === loop.phases.length - 1}
                />
              ))}
            </div>
          </section>

          {/* Diff Section */}
          {loop.diff && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                  Changes
                </h3>
                <DiffSummary diff={loop.diff} />
              </div>
              <div className="space-y-2">
                {loop.diff.files.map((file) => (
                  <FileDiffCard key={file.path} file={file} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 md:p-6 border-t border-white/[0.06] bg-slate-900/80">
          <div className="flex items-center gap-2">
            {loop.branch && (
              <a
                href={`https://github.com/org/repo/tree/${loop.branch}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
              >
                <ExternalLink size={16} />
                View Branch
              </a>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDiscard}
              disabled={discarding || merging}
              className="px-4 py-2 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {discarding ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              Discard
            </button>
            <button
              onClick={handleMerge}
              disabled={merging || discarding || loop.status !== 'completed'}
              className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {merging ? <Loader2 size={16} className="animate-spin" /> : <GitMerge size={16} />}
              Merge to Main
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoopDetailModal
