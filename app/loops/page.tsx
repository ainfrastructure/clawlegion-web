'use client'

import { useState } from 'react'
import { PageContainer } from '@/components/layout'
import { LoopDetailModal } from '@/components/loops'
import { StatCard } from '@/components/ui/StatCard'
import {
  GitBranch,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  Plus,
  Search,
  Filter
} from 'lucide-react'

// ============================================
// Types
// ============================================

type LoopStatus = 'running' | 'completed' | 'failed' | 'pending'

interface Loop {
  id: string
  title: string
  status: LoopStatus
  branch: string
  createdAt: string
  completedAt?: string
  repository: string
  filesChanged: number
  additions: number
  deletions: number
  phases: {
    scout: LoopStatus
    archie: LoopStatus
    mason: LoopStatus
    vex: LoopStatus
  }
}

// ============================================
// Mock Data
// ============================================

const mockLoops: Loop[] = [
  {
    id: 'loop-1',
    title: 'Implement user authentication',
    status: 'completed',
    branch: 'feature/auth-system',
    createdAt: '2025-02-01T10:00:00Z',
    completedAt: '2025-02-01T10:15:32Z',
    repository: 'clawlegion',
    filesChanged: 5,
    additions: 147,
    deletions: 12,
    phases: { scout: 'completed', archie: 'completed', mason: 'completed', vex: 'completed' }
  },
  {
    id: 'loop-2',
    title: 'Add dark mode support',
    status: 'running',
    branch: 'feature/dark-mode',
    createdAt: '2025-02-01T11:30:00Z',
    repository: 'clawlegion',
    filesChanged: 8,
    additions: 234,
    deletions: 45,
    phases: { scout: 'completed', archie: 'completed', mason: 'running', vex: 'pending' }
  },
  {
    id: 'loop-3',
    title: 'Fix pagination bug',
    status: 'failed',
    branch: 'fix/pagination',
    createdAt: '2025-02-01T09:00:00Z',
    repository: 'clawlegion',
    filesChanged: 2,
    additions: 15,
    deletions: 8,
    phases: { scout: 'completed', archie: 'completed', mason: 'completed', vex: 'failed' }
  },
  {
    id: 'loop-4',
    title: 'Optimize database queries',
    status: 'pending',
    branch: 'perf/db-queries',
    createdAt: '2025-02-01T12:00:00Z',
    repository: 'clawlegion-api',
    filesChanged: 0,
    additions: 0,
    deletions: 0,
    phases: { scout: 'pending', archie: 'pending', mason: 'pending', vex: 'pending' }
  },
]

// ============================================
// Components
// ============================================

function StatusBadge({ status }: { status: LoopStatus }) {
  const config = {
    running: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: Play },
    completed: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle2 },
    failed: { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle },
    pending: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: Clock }
  }[status]

  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${config.bg} ${config.text}`}>
      <Icon size={12} className={status === 'running' ? 'animate-pulse' : ''} />
      <span className="capitalize">{status}</span>
    </span>
  )
}

function PhaseIndicator({ status }: { status: LoopStatus }) {
  const colors = {
    completed: 'bg-green-500',
    running: 'bg-blue-500 animate-pulse',
    failed: 'bg-red-500',
    pending: 'bg-slate-600'
  }[status]

  return <div className={`w-2 h-2 rounded-full ${colors}`} />
}

function LoopRow({ loop, onClick }: { loop: Loop; onClick: () => void }) {
  return (
    <tr 
      className="hover:bg-slate-800/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <td className="px-6 py-4">
        <div className="font-medium text-white">{loop.title}</div>
        <div className="text-sm text-slate-400 flex items-center gap-1">
          <GitBranch size={12} />
          {loop.branch}
        </div>
      </td>
      <td className="px-6 py-4 text-slate-400">{loop.repository}</td>
      <td className="px-6 py-4">
        <StatusBadge status={loop.status} />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1">
          <PhaseIndicator status={loop.phases.scout} />
          <PhaseIndicator status={loop.phases.archie} />
          <PhaseIndicator status={loop.phases.mason} />
          <PhaseIndicator status={loop.phases.vex} />
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm">
          <span className="text-green-400">+{loop.additions}</span>
          {' / '}
          <span className="text-red-400">-{loop.deletions}</span>
        </div>
        <div className="text-xs text-slate-500">{loop.filesChanged} files</div>
      </td>
      <td className="px-6 py-4 text-slate-400 text-sm">
        {new Date(loop.createdAt).toLocaleString()}
      </td>
      <td className="px-6 py-4">
        <button 
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
        >
          <Eye size={16} className="text-slate-400" />
        </button>
      </td>
    </tr>
  )
}

function LoopCard({ loop, onClick }: { loop: Loop; onClick: () => void }) {
  return (
    <div 
      className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="font-medium text-white flex-1 min-w-0 truncate">{loop.title}</div>
        <StatusBadge status={loop.status} />
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500 flex items-center gap-1">
            <GitBranch size={12} />
            Branch
          </span>
          <span className="text-slate-300 truncate ml-2">{loop.branch}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Phases</span>
          <div className="flex items-center gap-1">
            <PhaseIndicator status={loop.phases.scout} />
            <PhaseIndicator status={loop.phases.archie} />
            <PhaseIndicator status={loop.phases.mason} />
            <PhaseIndicator status={loop.phases.vex} />
          </div>
        </div>
        
        <div className="flex justify-between">
          <span className="text-slate-500">Changes</span>
          <span>
            <span className="text-green-400">+{loop.additions}</span>
            {' / '}
            <span className="text-red-400">-{loop.deletions}</span>
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-slate-500">Created</span>
          <span className="text-slate-400">{new Date(loop.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.06]">
        <button 
          className="flex-1 py-2 px-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
        >
          <Eye size={14} /> View Details
        </button>
      </div>
    </div>
  )
}

// ============================================
// Main Page
// ============================================

export default function LoopsPage() {
  const [selectedLoopId, setSelectedLoopId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredLoops = mockLoops.filter(loop => {
    if (statusFilter !== 'all' && loop.status !== statusFilter) return false
    if (searchQuery && !loop.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const stats = {
    total: mockLoops.length,
    running: mockLoops.filter(l => l.status === 'running').length,
    completed: mockLoops.filter(l => l.status === 'completed').length,
    failed: mockLoops.filter(l => l.status === 'failed').length,
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <GitBranch className="text-purple-400" /> Development Loops
            </h1>
            <p className="text-sm sm:text-base text-slate-400">
              AI-powered development cycles with Scout → Archie → Mason → Vex
            </p>
          </div>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center justify-center gap-2 transition-colors">
            <Plus size={18} /> New Loop
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
          <StatCard label="Total Loops" value={stats.total} color="blue" />
          <StatCard label="Running" value={stats.running} color="green" />
          <StatCard label="Completed" value={stats.completed} color="purple" />
          <StatCard label="Failed" value={stats.failed} color="red" />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search loops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-white/[0.06] rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Filter className="text-slate-400 flex-shrink-0" size={18} />
            {['all', 'running', 'completed', 'failed', 'pending'].map((status) => (
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
            
            <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0 ml-auto sm:ml-0">
              <RefreshCw size={18} className="text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Loops List */}
      <div className="glass-2 rounded-xl overflow-hidden">
        {filteredLoops.length === 0 ? (
          <div className="p-8 text-center">
            <GitBranch className="mx-auto mb-4 text-slate-500" size={48} />
            <p className="text-slate-400">No loops found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <table className="w-full hidden md:table">
              <thead className="bg-slate-900/50">
                <tr className="text-left text-slate-400 text-sm">
                  <th className="px-6 py-4 font-medium">Loop</th>
                  <th className="px-6 py-4 font-medium">Repository</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Phases</th>
                  <th className="px-6 py-4 font-medium">Changes</th>
                  <th className="px-6 py-4 font-medium">Created</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredLoops.map((loop) => (
                  <LoopRow 
                    key={loop.id} 
                    loop={loop} 
                    onClick={() => setSelectedLoopId(loop.id)}
                  />
                ))}
              </tbody>
            </table>
            
            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-white/[0.06]">
              {filteredLoops.map((loop) => (
                <LoopCard 
                  key={loop.id} 
                  loop={loop} 
                  onClick={() => setSelectedLoopId(loop.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Loop Detail Modal */}
      {selectedLoopId && (
        <LoopDetailModal
          loopId={selectedLoopId}
          onClose={() => setSelectedLoopId(null)}
        />
      )}
    </PageContainer>
  )
}

// ============================================
// Sub-components
// ============================================

// StatCard imported from @/components/ui/StatCard
