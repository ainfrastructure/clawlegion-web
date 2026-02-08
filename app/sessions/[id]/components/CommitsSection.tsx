'use client'

import { GitCommit } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Execution } from '../types'

interface CommitsSectionProps {
  executions: Execution[]
  githubUrl?: string
}

export default function CommitsSection({ executions, githubUrl }: CommitsSectionProps) {
  const commitsWithInfo = executions
    .filter(e => e.commitSha)
    .map(e => ({
      sha: e.commitSha!,
      taskId: e.taskId,
      taskName: e.taskName,
      timestamp: e.completedAt || e.startedAt,
    }))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const uniqueCommits = commitsWithInfo.filter(
    (commit, index, self) => index === self.findIndex(c => c.sha === commit.sha)
  )

  if (uniqueCommits.length === 0) {
    return null
  }

  const getCommitUrl = (sha: string) => {
    if (!githubUrl) return null
    return `${githubUrl}/commit/${sha}`
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-200 dark:border-white/[0.06] p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4 flex items-center gap-2">
        <GitCommit className="w-5 h-5" />
        Commits ({uniqueCommits.length})
      </h2>
      <div className="space-y-2">
        {uniqueCommits.slice(0, 10).map((commit) => {
          const commitUrl = getCommitUrl(commit.sha)
          return (
            <div
              key={commit.sha}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <div className="flex items-center gap-3">
                <code className="font-mono text-sm bg-gray-200 dark:bg-slate-600 px-2 py-1 rounded text-gray-700 dark:text-slate-300">
                  {commitUrl ? (
                    <a
                      href={commitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {commit.sha.substring(0, 8)}
                    </a>
                  ) : (
                    commit.sha.substring(0, 8)
                  )}
                </code>
                <span className="text-sm text-gray-600 dark:text-slate-400">
                  <span className="font-mono text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-1 rounded mr-2">
                    {commit.taskId}
                  </span>
                  {commit.taskName}
                </span>
              </div>
              <span className="text-xs text-gray-400 dark:text-slate-500">
                {formatDate(commit.timestamp)}
              </span>
            </div>
          )
        })}
        {uniqueCommits.length > 10 && (
          <p className="text-sm text-gray-500 dark:text-slate-400 text-center pt-2">
            +{uniqueCommits.length - 10} more commits
          </p>
        )}
      </div>
    </div>
  )
}
