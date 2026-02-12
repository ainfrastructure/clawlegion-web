'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import {
  GitBranch,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  FolderOpen,
  ExternalLink,
  X,
} from 'lucide-react'

type Repository = {
  id: string
  name: string
  fullName: string
  githubUrl?: string
  isInitialized: boolean
  localPath: string
  _count?: { sessions: number }
}

function AddRepoForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [fullName, setFullName] = useState('')
  const [localPath, setLocalPath] = useState('')
  const [githubUrl, setGithubUrl] = useState('')

  const createRepo = useMutation({
    mutationFn: (data: { name: string; fullName: string; localPath: string; githubUrl?: string }) =>
      api.post('/repositories', data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repositories'] })
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createRepo.mutate({ name, fullName, localPath, githubUrl: githubUrl || undefined })
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-blue-500/20 bg-blue-500/[0.03] p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white">Add Repository</h3>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-[11px] text-slate-500 mb-1 block">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="my-project"
            required
            className="w-full px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
        <div>
          <label className="text-[11px] text-slate-500 mb-1 block">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="org/my-project"
            required
            className="w-full px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="text-[11px] text-slate-500 mb-1 block">Local Path</label>
        <input
          type="text"
          value={localPath}
          onChange={(e) => setLocalPath(e.target.value)}
          placeholder="/home/user/projects/my-project"
          required
          className="w-full px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm font-mono focus:outline-none focus:border-blue-500/50 transition-colors"
        />
      </div>

      <div className="mb-4">
        <label className="text-[11px] text-slate-500 mb-1 block">GitHub URL <span className="text-slate-600">(optional)</span></label>
        <input
          type="text"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          placeholder="https://github.com/org/repo"
          className="w-full px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!name || !localPath || createRepo.isPending}
          className="px-3 py-1.5 bg-blue-500/10 hover:bg-red-500/20 text-blue-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
        >
          {createRepo.isPending ? 'Adding...' : 'Add Repository'}
        </button>
      </div>

      {createRepo.isError && (
        <p className="text-xs text-red-400 mt-2">
          {(createRepo.error as any)?.response?.data?.error || 'Failed to add repository'}
        </p>
      )}
    </form>
  )
}

function RepoRow({ repo }: { repo: Repository }) {
  const queryClient = useQueryClient()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const deleteRepo = useMutation({
    mutationFn: () => api.delete(`/repositories/${repo.id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['repositories'] }),
  })

  return (
    <div className="flex items-center justify-between py-3 group">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
          <GitBranch size={14} className="text-emerald-400" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">{repo.name}</span>
            {repo.isInitialized ? (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-400">
                <CheckCircle2 size={9} /> Ready
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-400">
                <Clock size={9} /> Pending
              </span>
            )}
            {repo._count && repo._count.sessions > 0 && (
              <span className="text-[10px] text-slate-600">{repo._count.sessions} sessions</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-slate-500 font-mono truncate">{repo.localPath}</span>
            {repo.githubUrl && (
              <a
                href={repo.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0"
              >
                <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {confirmDelete ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => deleteRepo.mutate()}
              disabled={deleteRepo.isPending}
              className="px-2 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded text-[11px] font-medium transition-colors"
            >
              {deleteRepo.isPending ? '...' : 'Delete'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-2 py-1 text-slate-500 hover:text-white rounded text-[11px] transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
            title="Remove repository"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  )
}

export function RepositoriesTab() {
  const [showAddForm, setShowAddForm] = useState(false)

  const { data: repositories = [], isLoading } = useQuery<Repository[]>({
    queryKey: ['repositories'],
    queryFn: () => api.get('/repositories').then(r => r.data),
  })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Repositories</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage connected codebases for your agents</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            <Plus size={15} /> Add Repo
          </button>
        )}
      </div>

      {/* Add form */}
      {showAddForm && <AddRepoForm onClose={() => setShowAddForm(false)} />}

      {/* Repository list */}
      <div className="rounded-xl border border-white/[0.06] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-5 h-5 border-2 border-slate-600 border-t-slate-300 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-500 mt-3">Loading repositories...</p>
          </div>
        ) : repositories.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
              <GitBranch className="text-slate-600" size={20} />
            </div>
            <p className="text-sm text-slate-400">No repositories connected</p>
            <p className="text-xs text-slate-600 mt-1">Add a local repository to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04] px-4">
            {repositories.map(repo => (
              <RepoRow key={repo.id} repo={repo} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
