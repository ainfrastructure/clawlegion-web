'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { useState } from 'react'
import Link from 'next/link'
import { PageContainer } from '@/components/layout'
import {
  GitBranch,
  FolderGit,
  Plus,
  ExternalLink,
  Trash2,
  Settings,
  CheckCircle2,
  Clock,
  FolderOpen,
  Search,
  RefreshCw
} from 'lucide-react'

// ============================================
// REDESIGNED REPOSITORIES PAGE
// ============================================

interface Repository {
  id: string
  name: string
  fullName: string
  githubUrl?: string
  isInitialized: boolean
  localPath: string
  _count?: {
    sessions: number
  }
}

export default function RepositoriesPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const queryClient = useQueryClient()

  const { data: repositories = [], isLoading, refetch } = useQuery<Repository[]>({
    queryKey: ['repositories'],
    queryFn: () => api.get('/repositories').then(r => r.data),
  })

  const filteredRepos = repositories.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FolderGit className="text-green-400" /> Repositories
            </h1>
            <p className="text-slate-400">{repositories.length} repositories connected</p>
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={18} /> Add Repository
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-white/[0.06] rounded-lg text-white placeholder-slate-400 focus:border-green-500 focus:outline-none"
            />
          </div>
          <button onClick={() => refetch()} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg">
            <RefreshCw size={18} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* Repository Grid */}
      {isLoading ? (
        <div className="text-center text-slate-400 py-12">Loading repositories...</div>
      ) : filteredRepos.length === 0 ? (
        <div className="glass-2 rounded-xl p-12 text-center">
          <FolderGit className="mx-auto mb-4 text-slate-500" size={48} />
          <p className="text-slate-400 mb-4">No repositories found</p>
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
          >
            Add Your First Repository
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRepos.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      )}

      {/* Add Form Modal would go here */}
    </PageContainer>
  )
}

function RepoCard({ repo }: { repo: Repository }) {
  return (
    <div className="glass-2 rounded-xl p-5 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 rounded-lg">
            <GitBranch className="text-green-400" size={24} />
          </div>
          <div>
            <div className="font-semibold text-white">{repo.name}</div>
            <div className="text-sm text-slate-500">{repo.fullName}</div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 mb-3">
        {repo.isInitialized ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
            <CheckCircle2 size={12} /> Initialized
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-xs">
            <Clock size={12} /> Pending
          </span>
        )}
        <span className="text-xs text-slate-500">
          {repo._count?.sessions ?? 0} loops
        </span>
      </div>

      {/* Path */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
        <FolderOpen size={12} />
        <span className="truncate">{repo.localPath}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {repo.githubUrl && (
          <a 
            href={repo.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-3 py-2 bg-slate-900 hover:bg-slate-800 rounded-lg text-sm text-slate-300 text-center transition-colors"
          >
            <ExternalLink size={14} className="inline mr-1" /> GitHub
          </a>
        )}
        <button className="flex-1 px-3 py-2 bg-slate-900 hover:bg-slate-800 rounded-lg text-sm text-slate-300 transition-colors">
          <Settings size={14} className="inline mr-1" /> Settings
        </button>
      </div>
    </div>
  )
}
