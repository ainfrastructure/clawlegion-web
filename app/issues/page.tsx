'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useState } from 'react'
import { PageContainer } from '@/components/layout'
import { StatCard } from '@/components/ui/StatCard'
import {
  Bug,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Plus,
  MessageSquare,
  Tag
} from 'lucide-react'

// ============================================
// REDESIGNED ISSUES PAGE
// ============================================

interface Issue {
  id: string
  title: string
  description?: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  labels?: string[]
  createdAt: string
  assignee?: string
}

export default function IssuesPage() {
  const [statusFilter, setStatusFilter] = useState<string>('open')
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['issues', statusFilter],
    queryFn: () => api.get('/issues').then(r => r.data).catch(() => []),
  })

  const issues: Issue[] = Array.isArray(data) ? data : data?.issues ?? []
  
  const filteredIssues = issues.filter(i => {
    if (statusFilter !== 'all' && i.status !== statusFilter) return false
    if (searchQuery && !i.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const openCount = issues.filter(i => i.status === 'open').length
  const inProgressCount = issues.filter(i => i.status === 'in_progress').length
  const resolvedCount = issues.filter(i => i.status === 'resolved' || i.status === 'closed').length

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Bug className="text-red-400" /> Issues
            </h1>
            <p className="text-slate-400">{openCount} open issues</p>
          </div>
          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2">
            <Plus size={18} /> Report Issue
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard icon={<AlertTriangle />} label="Open" value={openCount} color="red" />
          <StatCard icon={<Clock />} label="In Progress" value={inProgressCount} color="amber" />
          <StatCard icon={<CheckCircle2 />} label="Resolved" value={resolvedCount} color="green" />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-white/[0.06] rounded-lg text-white placeholder-slate-400 focus:border-red-500 focus:outline-none"
            />
          </div>
          
          <div className="flex bg-slate-800 rounded-lg p-1">
            {['all', 'open', 'in_progress', 'resolved'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${statusFilter === status ? 'bg-red-600 text-white' : 'text-slate-400'}`}
              >
                {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
              </button>
            ))}
          </div>
          
          <button onClick={() => refetch()} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg">
            <RefreshCw size={18} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* Issues List */}
      <div className="glass-2 rounded-xl">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Loading issues...</div>
        ) : filteredIssues.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="mx-auto mb-4 text-green-400" size={48} />
            <p className="text-slate-400">No issues found</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {filteredIssues.map((issue) => (
              <IssueRow key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  )
}

// StatCard imported from @/components/ui/StatCard

function IssueRow({ issue }: { issue: Issue }) {
  const priorityConfig: Record<string, { color: string; bg: string }> = {
    critical: { color: 'text-red-400', bg: 'bg-red-500/20' },
    high: { color: 'text-orange-400', bg: 'bg-orange-500/20' },
    medium: { color: 'text-amber-400', bg: 'bg-amber-500/20' },
    low: { color: 'text-blue-400', bg: 'bg-blue-500/20' },
  }
  
  const statusConfig: Record<string, { color: string; bg: string }> = {
    open: { color: 'text-red-400', bg: 'bg-red-500/20' },
    in_progress: { color: 'text-amber-400', bg: 'bg-amber-500/20' },
    resolved: { color: 'text-green-400', bg: 'bg-green-500/20' },
    closed: { color: 'text-slate-400', bg: 'bg-slate-500/20' },
  }
  
  const prio = priorityConfig[issue.priority] ?? priorityConfig.medium
  const status = statusConfig[issue.status] ?? statusConfig.open

  return (
    <div className="px-6 py-4 hover:bg-slate-800/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <Bug className="text-red-400" size={16} />
            <span className="font-medium text-white">{issue.title}</span>
            <span className={`px-2 py-0.5 rounded text-xs ${prio.bg} ${prio.color}`}>
              {issue.priority}
            </span>
          </div>
          {issue.description && (
            <p className="text-sm text-slate-400 ml-7 line-clamp-1">{issue.description}</p>
          )}
          {issue.labels && issue.labels.length > 0 && (
            <div className="flex gap-1 mt-2 ml-7">
              {issue.labels.map((label) => (
                <span key={label} className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded text-xs ${status.bg} ${status.color}`}>
            {issue.status?.replace('_', ' ')}
          </span>
          <span className="text-xs text-slate-500">
            {new Date(issue.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  )
}
