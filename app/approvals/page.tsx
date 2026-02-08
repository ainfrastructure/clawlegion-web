'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { PageContainer } from '@/components/layout'
import { StatCard } from '@/components/ui/StatCard'
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  FileText,
  RefreshCw,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'

// ============================================
// REDESIGNED APPROVALS PAGE - Mobile Responsive
// ============================================

interface Approval {
  id: string
  title: string
  type: string
  description?: string
  status: 'pending' | 'approved' | 'rejected'
  requestedBy?: string
  createdAt: string
  session?: {
    name: string
  }
}

export default function ApprovalsPage() {
  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['approvals'],
    queryFn: () => api.get('/approvals').then(r => r.data).catch(() => []),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.post(`/approvals/${id}/approve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['approvals'] }),
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.post(`/approvals/${id}/reject`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['approvals'] }),
  })

  const approvals: Approval[] = Array.isArray(data) ? data : data?.approvals ?? []
  const pending = approvals.filter(a => a.status === 'pending')
  const processed = approvals.filter(a => a.status !== 'pending')

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
              <CheckSquare className="text-orange-400" /> Approvals
            </h1>
            <p className="text-sm sm:text-base text-slate-400">{pending.length} pending approvals</p>
          </div>
          <button onClick={() => refetch()} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg">
            <RefreshCw size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Stats - 1 col mobile, 3 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <StatCard icon={<Clock />} label="Pending" value={pending.length} color="orange" />
          <StatCard icon={<CheckCircle2 />} label="Approved" value={approvals.filter(a => a.status === 'approved').length} color="green" />
          <StatCard icon={<XCircle />} label="Rejected" value={approvals.filter(a => a.status === 'rejected').length} color="red" />
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Pending Approvals</h2>
        {isLoading ? (
          <div className="text-slate-400">Loading...</div>
        ) : pending.length === 0 ? (
          <div className="glass-2 rounded-xl p-6 sm:p-8 text-center">
            <CheckCircle2 className="mx-auto mb-4 text-green-400" size={40} />
            <p className="text-sm sm:text-base text-slate-400">All caught up! No pending approvals.</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {pending.map((approval) => (
              <ApprovalCard 
                key={approval.id} 
                approval={approval}
                onApprove={() => approveMutation.mutate(approval.id)}
                onReject={() => rejectMutation.mutate(approval.id)}
                isLoading={approveMutation.isPending || rejectMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* History */}
      {processed.length > 0 && (
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">History</h2>
          <div className="glass-2 rounded-xl divide-y divide-white/[0.06]">
            {processed.slice(0, 10).map((approval) => (
              <HistoryRow key={approval.id} approval={approval} />
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  )
}

// StatCard imported from @/components/ui/StatCard

function ApprovalCard({ approval, onApprove, onReject, isLoading }: { 
  approval: Approval
  onApprove: () => void
  onReject: () => void
  isLoading: boolean 
}) {
  return (
    <div className="glass-2 rounded-xl p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3">
        <div className="min-w-0">
          <div className="font-semibold text-white text-sm sm:text-base">{approval.title}</div>
          <div className="text-xs sm:text-sm text-slate-500 truncate">
            {approval.type} • {approval.session?.name ?? 'Unknown session'}
          </div>
        </div>
        <span className="self-start px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs flex-shrink-0">
          Pending
        </span>
      </div>
      
      {approval.description && (
        <p className="text-slate-400 text-xs sm:text-sm mb-4">{approval.description}</p>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-xs text-slate-500">
          Requested {new Date(approval.createdAt).toLocaleDateString()}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onReject}
            disabled={isLoading}
            className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            <ThumbsDown size={16} /> Reject
          </button>
          <button 
            onClick={onApprove}
            disabled={isLoading}
            className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            <ThumbsUp size={16} /> Approve
          </button>
        </div>
      </div>
    </div>
  )
}

function HistoryRow({ approval }: { approval: Approval }) {
  return (
    <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {approval.status === 'approved' ? (
          <CheckCircle2 className="text-green-400 flex-shrink-0" size={18} />
        ) : (
          <XCircle className="text-red-400 flex-shrink-0" size={18} />
        )}
        <div className="min-w-0">
          <div className="text-white text-sm sm:text-base truncate">{approval.title}</div>
          <div className="text-xs text-slate-500">{approval.type}</div>
        </div>
      </div>
      <div className="text-xs sm:text-sm text-slate-500 flex-shrink-0">
        {new Date(approval.createdAt).toLocaleDateString()}
      </div>
    </div>
  )
}
