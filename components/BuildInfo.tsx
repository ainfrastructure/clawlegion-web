'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { GitCommit, Clock, ChevronDown, ChevronUp, GitBranch, ExternalLink, MessageSquare } from 'lucide-react'

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

const REPO_URL = 'https://github.com/ainfrastructure/clawlegion'

export function BuildInfo() {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)

  // Hide on landing page
  if (pathname === '/') return null
  
  const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME || ''
  const commitSha = process.env.NEXT_PUBLIC_COMMIT_SHA || 'dev'
  const branch = process.env.NEXT_PUBLIC_BRANCH || 'main'
  const commitMsg = process.env.NEXT_PUBLIC_COMMIT_MSG || ''
  
  const shortSha = commitSha.slice(0, 7)
  const relativeTime = buildTime ? getRelativeTime(buildTime) : ''
  const isDev = commitSha === 'dev'
  const commitUrl = isDev ? null : `${REPO_URL}/commit/${commitSha}`

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-white/[0.06] rounded-lg text-xs text-slate-400 hover:text-slate-300 transition-all backdrop-blur-sm shadow-lg"
        title="Build info"
      >
        <GitCommit size={12} />
        <span className="font-mono">{isDev ? 'dev' : shortSha}</span>
        {relativeTime && (
          <>
            <span className="text-slate-600">•</span>
            <span>{relativeTime}</span>
          </>
        )}
        {expanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
      </button>

      {expanded && (
        <div className="absolute bottom-full right-0 mb-2 p-3 bg-slate-800/95 border border-white/[0.06] rounded-lg text-xs backdrop-blur-sm shadow-xl min-w-[220px]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-300">
              <GitCommit size={14} className="text-blue-400" />
              <div className="flex-1">
                <div className="text-slate-500 text-[10px] uppercase tracking-wide">Commit</div>
                {commitUrl ? (
                  <a 
                    href={commitUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-mono hover:text-blue-400 flex items-center gap-1"
                  >
                    {shortSha}
                    <ExternalLink size={10} />
                  </a>
                ) : (
                  <div className="font-mono text-amber-400">Development</div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <GitBranch size={14} className="text-purple-400" />
              <div>
                <div className="text-slate-500 text-[10px] uppercase tracking-wide">Branch</div>
                <a 
                  href={`${REPO_URL}/tree/${branch}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono hover:text-purple-400 flex items-center gap-1"
                >
                  {branch}
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>

            {commitMsg && (
              <div className="flex items-start gap-2 text-slate-300">
                <MessageSquare size={14} className="text-amber-400 mt-0.5" />
                <div>
                  <div className="text-slate-500 text-[10px] uppercase tracking-wide">Message</div>
                  <div className="text-slate-300 break-words max-w-[180px]">{commitMsg}</div>
                </div>
              </div>
            )}
            
            {buildTime && (
              <div className="flex items-center gap-2 text-slate-300">
                <Clock size={14} className="text-green-400" />
                <div>
                  <div className="text-slate-500 text-[10px] uppercase tracking-wide">Built</div>
                  <div>{new Date(buildTime).toLocaleString()}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
