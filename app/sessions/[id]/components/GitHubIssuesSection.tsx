'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { GitHubIssue } from '../types'

interface GitHubIssuesSectionProps {
  sessionId: string
}

export default function GitHubIssuesSection({ sessionId }: GitHubIssuesSectionProps) {
  const { data, isLoading } = useQuery<{ issues: GitHubIssue[]; count: number }>({
    queryKey: ['session-github-issues', sessionId],
    queryFn: async () => {
      const response = await api.get(`/github/sessions/${sessionId}/issues`)
      return response.data
    },
  })

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-200 dark:border-white/[0.06] p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">GitHub Issues</h2>
        <div className="text-gray-500 dark:text-slate-400 text-sm">Loading issues...</div>
      </div>
    )
  }

  if (!data?.issues?.length) {
    return null
  }

  const getStatusBadge = (status: string) => {
    return status === 'open' ? 'bg-green-500' : 'bg-purple-500'
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-200 dark:border-white/[0.06] p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
          GitHub Issues ({data.count})
        </h2>
        <a
          href="/issues"
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          View All Issues →
        </a>
      </div>
      <div className="space-y-3">
        {data.issues.map((issue) => (
          <div
            key={issue.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer"
            onClick={() => window.open(issue.issueUrl, '_blank')}
          >
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-gray-400 dark:text-slate-500"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    #{issue.issueNumber}
                  </span>
                  <span
                    className={`px-2 text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                      issue.status
                    )} text-white`}
                  >
                    {issue.status}
                  </span>
                </div>
                <div className="text-sm text-gray-700 dark:text-slate-300 max-w-md truncate">
                  {issue.title}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-slate-400">
              {issue.relatedFailures?.length || 0} failures
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
