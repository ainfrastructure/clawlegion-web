'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import Link from 'next/link'
import { useState } from 'react'
import { PageContainer } from '@/components/layout'
import { StatCard } from '@/components/ui/StatCard'
import {
  FolderKanban,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Eye,
  Plus,
  Filter,
  Search,
  MoreVertical,
  ArrowRight,
  RefreshCw
} from 'lucide-react'

// ============================================
// REDESIGNED SESSIONS PAGE - Mobile Responsive
// ============================================

import type { Session } from '@/types'

export default function SessionsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const queryClient = useQueryClient()

  const { data: sessionsData, isLoading, refetch } = useQuery({
    queryKey: ['sessions', statusFilter],
    queryFn: async () => {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : ''
      const response = await api.get(`/sessions${params}`)
      return response.data
    },
  })

  const sessions: Session[] = sessionsData?.sessions ?? sessionsData ?? []
  
  // Filter by search
  const filteredSessions = sessions.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.repository?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Stats
  const totalSessions = sessions.length
  const activeSessions = sessions.filter(s => s.status === 'running' || s.status === 'active').length
  const completedSessions = sessions.filter(s => s.status === 'completed').length

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        {/* Title Row - stacks on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <FolderKanban className="text-purple-400" /> ClawLegion Loops
            </h1>
            <p className="text-sm sm:text-base text-slate-400">Manage your ClawLegion Loops and repositories</p>
          </div>
          <Link 
            href="/sessions/new" 
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
          >
            <Plus size={18} /> New Loop
          </Link>
        </div>

        {/* Stats Bar - 1 col mobile, 3 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <StatCard label="Total Loops" value={totalSessions} color="blue" />
          <StatCard label="Active" value={activeSessions} color="green" />
          <StatCard label="Completed" value={completedSessions} color="purple" />
        </div>

        {/* Filters - stacks on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search loops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-white/[0.06] rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none text-sm sm:text-base"
            />
          </div>
          
          {/* Filter buttons - horizontal scroll on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Filter className="text-slate-400 flex-shrink-0" size={18} />
            {['all', 'running', 'completed', 'failed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors flex-shrink-0 ${
                  statusFilter === status 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
            
            <button 
              onClick={() => refetch()}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0 ml-auto sm:ml-0"
            >
              <RefreshCw size={18} className="text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="glass-2 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Loading loops...</div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-8 text-center">
            <FolderKanban className="mx-auto mb-4 text-slate-500" size={48} />
            <p className="text-slate-400">No loops found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table - hidden on mobile */}
            <table className="w-full hidden md:table">
              <thead className="bg-slate-900/50">
                <tr className="text-left text-slate-400 text-sm">
                  <th className="px-4 lg:px-6 py-4 font-medium">Loop</th>
                  <th className="px-4 lg:px-6 py-4 font-medium">Repository</th>
                  <th className="px-4 lg:px-6 py-4 font-medium">Status</th>
                  <th className="px-4 lg:px-6 py-4 font-medium">Progress</th>
                  <th className="px-4 lg:px-6 py-4 font-medium">Created</th>
                  <th className="px-4 lg:px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredSessions.map((session) => (
                  <SessionRow key={session.id} session={session} />
                ))}
              </tbody>
            </table>
            
            {/* Mobile Card View - shown only on mobile */}
            <div className="md:hidden divide-y divide-white/[0.06]">
              {filteredSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          </>
        )}
      </div>
    </PageContainer>
  )
}

// ============================================
// Components
// ============================================

// StatCard imported from @/components/ui/StatCard

function SessionRow({ session }: { session: Session }) {
  const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    running: { bg: 'bg-green-500/20', text: 'text-green-400', icon: <Play size={12} /> },
    active: { bg: 'bg-green-500/20', text: 'text-green-400', icon: <Play size={12} /> },
    completed: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: <CheckCircle2 size={12} /> },
    failed: { bg: 'bg-red-500/20', text: 'text-red-400', icon: <XCircle size={12} /> },
    pending: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: <Clock size={12} /> },
  }
  
  const config = statusConfig[session.status] ?? statusConfig.pending
  const progress = session.taskStats 
    ? Math.round((session.taskStats.completed / session.taskStats.total) * 100) 
    : 0

  return (
    <tr className="hover:bg-slate-800/50 transition-colors">
      <td className="px-4 lg:px-6 py-4">
        <Link href={`/sessions/${session.id}`} className="font-medium text-white hover:text-purple-400 transition-colors">
          {session.name}
        </Link>
      </td>
      <td className="px-4 lg:px-6 py-4 text-slate-400">{session.repository?.name ?? '-'}</td>
      <td className="px-4 lg:px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${config.bg} ${config.text}`}>
          {config.icon}
          <span className="capitalize">{session.status}</span>
        </span>
      </td>
      <td className="px-4 lg:px-6 py-4">
        {session.taskStats ? (
          <div className="flex items-center gap-2">
            <div className="w-16 lg:w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-slate-400">{progress}%</span>
          </div>
        ) : (
          <span className="text-slate-500">-</span>
        )}
      </td>
      <td className="px-4 lg:px-6 py-4 text-slate-400 text-sm">
        {new Date(session.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 lg:px-6 py-4">
        <div className="flex items-center gap-2">
          <Link 
            href={`/sessions/${session.id}`}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Eye size={16} className="text-slate-400" />
          </Link>
          <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <Trash2 size={16} className="text-red-400" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// Mobile card view for sessions
function SessionCard({ session }: { session: Session }) {
  const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    running: { bg: 'bg-green-500/20', text: 'text-green-400', icon: <Play size={12} /> },
    active: { bg: 'bg-green-500/20', text: 'text-green-400', icon: <Play size={12} /> },
    completed: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: <CheckCircle2 size={12} /> },
    failed: { bg: 'bg-red-500/20', text: 'text-red-400', icon: <XCircle size={12} /> },
    pending: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: <Clock size={12} /> },
  }
  
  const config = statusConfig[session.status] ?? statusConfig.pending
  const progress = session.taskStats 
    ? Math.round((session.taskStats.completed / session.taskStats.total) * 100) 
    : 0

  return (
    <div className="p-4 hover:bg-slate-800/50 transition-colors">
      {/* Header row with name and status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <Link href={`/sessions/${session.id}`} className="font-medium text-white hover:text-purple-400 transition-colors flex-1 min-w-0 truncate">
          {session.name}
        </Link>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs flex-shrink-0 ${config.bg} ${config.text}`}>
          {config.icon}
          <span className="capitalize">{session.status}</span>
        </span>
      </div>
      
      {/* Details */}
      <div className="space-y-2 text-sm">
        {session.repository?.name && (
          <div className="flex justify-between">
            <span className="text-slate-500">Repository</span>
            <span className="text-slate-300 truncate ml-2">{session.repository.name}</span>
          </div>
        )}
        
        {session.taskStats && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-500">Progress</span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-slate-400 text-xs">{progress}%</span>
            </div>
          </div>
        )}
        
        <div className="flex justify-between">
          <span className="text-slate-500">Created</span>
          <span className="text-slate-400">{new Date(session.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.06]">
        <Link 
          href={`/sessions/${session.id}`}
          className="flex-1 py-2 px-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Eye size={14} /> View
        </Link>
        <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
          <Trash2 size={16} className="text-red-400" />
        </button>
      </div>
    </div>
  )
}
