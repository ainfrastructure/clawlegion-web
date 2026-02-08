'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Palette, Building2, AlertTriangle, Box, MessageSquare } from 'lucide-react'
import type { ApprovalRequest } from '../types'

// Helper for approval type icons
export function getTypeIcon(type: string) {
  switch (type) {
    case 'design':
      return <Palette className="w-5 h-5 text-purple-500" />
    case 'architecture':
      return <Building2 className="w-5 h-5 text-blue-500" />
    case 'breaking_change':
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />
    case 'dependency':
      return <Box className="w-5 h-5 text-green-500" />
    default:
      return <MessageSquare className="w-5 h-5 text-gray-500" />
  }
}

interface ApprovalsSectionProps {
  sessionId: string
}

export default function ApprovalsSection({ sessionId }: ApprovalsSectionProps) {
  const { data, isLoading, error } = useQuery<ApprovalRequest[]>({
    queryKey: ['session-approvals', sessionId],
    queryFn: async () => {
      const response = await api.get(`/approvals/session/${sessionId}`)
      return response.data
    },
  })

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-200 dark:border-white/[0.06] p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Approvals</h2>
        <div className="text-gray-500 dark:text-slate-400 text-sm">Loading approvals...</div>
      </div>
    )
  }

  if (error || !data?.length) {
    return null
  }

  const pendingCount = data.filter(a => a.status === 'pending').length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500'
      case 'approved':
        return 'bg-green-500'
      case 'rejected':
        return 'bg-red-500'
      case 'needs_discussion':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-200 dark:border-white/[0.06] p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-2">
          Approvals
          {pendingCount > 0 && (
            <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full">
              {pendingCount} pending
            </span>
          )}
        </h2>
        <Link href="/approvals" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
          View All Approvals →
        </Link>
      </div>
      <div className="space-y-3">
        {data.map((approval) => (
          <Link
            key={approval.id}
            href={`/approvals/${approval.id}`}
            className="block p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {getTypeIcon(approval.type)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-slate-100">{approval.title}</span>
                    <span
                      className={`px-2 text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                        approval.status
                      )} text-white`}
                    >
                      {approval.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {approval.description}
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-400 dark:text-slate-500">
                {formatDate(approval.createdAt)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
