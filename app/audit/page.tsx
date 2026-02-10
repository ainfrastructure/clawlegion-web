'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { PageContainer } from '@/components/layout'
import { ExportButton } from '@/components/ExportButton'
import { ActivityFeed } from '@/components/audit/ActivityFeed'
import {
  ScrollText,
  Filter,
  Search,
  RefreshCw,
  User,
  Bot,
  Settings,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Pause,
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight,
  Calendar,
  List,
  Activity,
  Bell,
  LayoutList
} from 'lucide-react'

interface AuditEntry {
  id: string
  timestamp: string
  action: string
  actor: string
  entityType: 'task' | 'agent' | 'settings' | 'system'
  entityId?: string
  entityName?: string
  details?: Record<string, unknown>
}

interface AuditResponse {
  entries: AuditEntry[]
  total: number
  limit: number
  offset: number
  filters: {
    actors: string[]
    actions: string[]
    entityTypes: string[]
  }
  lastUpdated: string
}

const actionConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  task_created: { icon: <FileText size={14} />, color: 'text-blue-400', label: 'Task Created' },
  task_started: { icon: <Play size={14} />, color: 'text-blue-400', label: 'Task Started' },
  task_updated: { icon: <FileText size={14} />, color: 'text-amber-400', label: 'Task Updated' },
  task_completed: { icon: <CheckCircle2 size={14} />, color: 'text-green-400', label: 'Task Completed' },
  task_failed: { icon: <XCircle size={14} />, color: 'text-red-400', label: 'Task Failed' },
  task_assigned: { icon: <User size={14} />, color: 'text-purple-400', label: 'Task Assigned' },
  task_deleted: { icon: <XCircle size={14} />, color: 'text-red-400', label: 'Task Deleted' },
  agent_started: { icon: <Play size={14} />, color: 'text-green-400', label: 'Agent Started' },
  agent_stopped: { icon: <Pause size={14} />, color: 'text-slate-400', label: 'Agent Stopped' },
  agent_rate_limited: { icon: <AlertTriangle size={14} />, color: 'text-amber-400', label: 'Rate Limited' },
  settings_changed: { icon: <Settings size={14} />, color: 'text-blue-400', label: 'Settings Changed' },
  export_requested: { icon: <FileText size={14} />, color: 'text-cyan-400', label: 'Export Requested' },
  verification_run: { icon: <CheckCircle2 size={14} />, color: 'text-green-400', label: 'Verification Run' },
  system_event: { icon: <AlertTriangle size={14} />, color: 'text-slate-400', label: 'System Event' },
}

const entityTypeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  task: { icon: <FileText size={14} />, color: 'text-blue-400' },
  agent: { icon: <Bot size={14} />, color: 'text-purple-400' },
  settings: { icon: <Settings size={14} />, color: 'text-slate-400' },
  system: { icon: <AlertTriangle size={14} />, color: 'text-amber-400' },
}

export default function AuditPage() {
  return (
    <Suspense fallback={
      <PageContainer>
        <div className="text-center text-slate-400 py-12">Loading...</div>
      </PageContainer>
    }>
      <AuditPageContent />
    </Suspense>
  )
}

function AuditPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get('view') === 'activity' ? 'activity' : 'audit'

  const setActiveTab = (tab: 'audit' | 'activity') => {
    router.replace(tab === 'activity' ? '/audit?view=activity' : '/audit', { scroll: false })
  }

  const [searchQuery, setSearchQuery] = useState('')
  const [actorFilter, setActorFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [entityTypeFilter, setEntityTypeFilter] = useState('')
  const [page, setPage] = useState(0)
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table')
  const limit = 50

  const { data, isLoading, refetch } = useQuery<AuditResponse>({
    queryKey: ['audit', searchQuery, actorFilter, actionFilter, entityTypeFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (actorFilter) params.set('actor', actorFilter)
      if (actionFilter) params.set('action', actionFilter)
      if (entityTypeFilter) params.set('entityType', entityTypeFilter)
      params.set('limit', String(limit))
      params.set('offset', String(page * limit))
      
      const res = await fetch(`/api/audit?${params}`)
      if (!res.ok) throw new Error('Failed to fetch audit log')
      return res.json()
    },
    refetchInterval: 30000,
  })

  const entries = data?.entries ?? []
  const total = data?.total ?? 0
  const filters = data?.filters ?? { actors: [], actions: [], entityTypes: [] }
  const totalPages = Math.ceil(total / limit)

  // Filter by search query (client-side for actor/entity name)
  const filteredEntries = searchQuery 
    ? entries.filter(e => 
        e.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.entityName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.action.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : entries

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return `${Math.floor(diff / 86400000)}d ago`
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
              <ScrollText className="text-purple-400" size={28} />
              {activeTab === 'audit' ? 'Audit Log' : 'Activity Feed'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {activeTab === 'audit' ? `${total} events tracked` : 'All task events and system notifications'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Tab toggle */}
            <div className="flex items-center p-1 rounded-lg bg-slate-800/40 border border-slate-700/50">
              <button
                onClick={() => setActiveTab('audit')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'audit'
                    ? 'bg-white/[0.08] text-white shadow-sm border border-white/[0.06]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <ScrollText size={14} />
                Audit Log
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'activity'
                    ? 'bg-white/[0.08] text-white shadow-sm border border-white/[0.06]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <Bell size={14} />
                Activity
              </button>
            </div>
            {activeTab === 'audit' && (
              <>
                <ExportButton
                  data={entries as unknown as Record<string, unknown>[]}
                  filename="audit_log"
                  columns={['id', 'timestamp', 'action', 'actor', 'entityType', 'entityId', 'entityName']}
                  allowColumnSelection
                />
                <button
                  onClick={() => refetch()}
                  className="flex items-center gap-2 px-4 py-2 glass-2 rounded-lg text-sm text-white hover:bg-slate-700/50 transition-colors"
                >
                  <RefreshCw size={16} /> Refresh
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {activeTab === 'activity' ? (
        <ActivityFeed />
      ) : (
      <>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 glass-2 rounded-xl p-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search actors, actions, entities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder:text-slate-500 focus:border-slate-600 focus:outline-none transition-colors"
          />
        </div>

        {/* Actor Filter */}
        <select
          value={actorFilter}
          onChange={(e) => { setActorFilter(e.target.value); setPage(0) }}
          className="px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-slate-600 focus:outline-none transition-colors"
        >
          <option value="">All Actors</option>
          {filters.actors.map(actor => (
            <option key={actor} value={actor}>{actor}</option>
          ))}
        </select>

        {/* Action Filter */}
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(0) }}
          className="px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-slate-600 focus:outline-none transition-colors"
        >
          <option value="">All Actions</option>
          {filters.actions.map(action => (
            <option key={action} value={action}>
              {actionConfig[action]?.label ?? action}
            </option>
          ))}
        </select>

        {/* Entity Type Filter */}
        <select
          value={entityTypeFilter}
          onChange={(e) => { setEntityTypeFilter(e.target.value); setPage(0) }}
          className="px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-slate-600 focus:outline-none transition-colors"
        >
          <option value="">All Types</option>
          {filters.entityTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        {/* Clear Filters */}
        {(searchQuery || actorFilter || actionFilter || entityTypeFilter) && (
          <button
            onClick={() => {
              setSearchQuery('')
              setActorFilter('')
              setActionFilter('')
              setEntityTypeFilter('')
              setPage(0)
            }}
            className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Clear filters
          </button>
        )}

        {/* View Toggle */}
        <div className="flex p-1 rounded-lg bg-slate-800/40 border border-slate-700/50 ml-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
              viewMode === 'table'
                ? 'bg-white/[0.08] text-white shadow-sm border border-white/[0.06]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <LayoutList size={14} /> Table
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
              viewMode === 'timeline'
                ? 'bg-white/[0.08] text-white shadow-sm border border-white/[0.06]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <Activity size={14} /> Timeline
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center text-slate-400 py-12">Loading audit log...</div>
      ) : filteredEntries.length === 0 ? (
        <div className="glass-2 rounded-xl p-12 text-center">
          <ScrollText className="mx-auto mb-4 text-slate-500" size={48} />
          <p className="text-slate-400 mb-2">No audit entries found</p>
          <p className="text-slate-500 text-sm">Events will appear here as they occur</p>
        </div>
      ) : viewMode === 'timeline' ? (
        /* Timeline View */
        <div className="space-y-4">
          {/* Group entries by date */}
          {Object.entries(
            filteredEntries.reduce((groups, entry) => {
              const date = new Date(entry.timestamp).toLocaleDateString()
              if (!groups[date]) groups[date] = []
              groups[date].push(entry)
              return groups
            }, {} as Record<string, typeof filteredEntries>)
          ).map(([date, dayEntries]) => (
            <div key={date} className="relative">
              {/* Date Header */}
              <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur py-2 mb-3">
                <span className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Calendar size={14} />
                  {date === new Date().toLocaleDateString() ? 'Today' : 
                   date === new Date(Date.now() - 86400000).toLocaleDateString() ? 'Yesterday' : date}
                  <span className="text-slate-600">({dayEntries.length} events)</span>
                </span>
              </div>
              
              {/* Timeline entries */}
              <div className="relative pl-8 border-l-2 border-white/[0.06] space-y-4 ml-2">
                {dayEntries.map((entry) => {
                  const action = actionConfig[entry.action] ?? { 
                    icon: <AlertTriangle size={14} />, 
                    color: 'text-slate-400', 
                    label: entry.action 
                  }
                  const entity = entityTypeConfig[entry.entityType] ?? { 
                    icon: <FileText size={14} />, 
                    color: 'text-slate-400' 
                  }
                  
                  return (
                    <div key={entry.id} className="relative group">
                      {/* Timeline dot */}
                      <div className={`absolute -left-[25px] w-4 h-4 rounded-full border-2 border-white/[0.06] bg-slate-900 flex items-center justify-center ${action.color}`}>
                        <div className="w-2 h-2 rounded-full bg-current" />
                      </div>
                      
                      {/* Entry card */}
                      <div className="glass-2 rounded-lg p-4 hover:border-slate-600 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Action + Actor */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-900 ${action.color}`}>
                                {action.icon}
                                {action.label}
                              </span>
                              <span className="text-slate-400 text-sm">by</span>
                              <span className="text-white text-sm font-medium flex items-center gap-1">
                                {entry.actor.toLowerCase().includes('chef') ? (
                                  <Bot size={12} className="text-orange-400" />
                                ) : entry.actor.toLowerCase().includes('sous') ? (
                                  <Bot size={12} className="text-blue-400" />
                                ) : (
                                  <User size={12} className="text-slate-400" />
                                )}
                                {entry.actor}
                              </span>
                            </div>
                            
                            {/* Entity */}
                            {entry.entityName && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className={entity.color}>{entity.icon}</span>
                                <span className="text-slate-300">{entry.entityName}</span>
                              </div>
                            )}
                            
                            {/* Details */}
                            {entry.details && (
                              <div className="mt-2 text-xs text-slate-500 font-mono bg-slate-900/50 rounded p-2 overflow-x-auto">
                                {JSON.stringify(entry.details, null, 2)}
                              </div>
                            )}
                          </div>
                          
                          {/* Time */}
                          <div className="text-right shrink-0">
                            <div className="text-sm text-white">{formatRelativeTime(entry.timestamp)}</div>
                            <div className="text-xs text-slate-500">
                              {new Date(entry.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
          
          {/* Pagination for timeline */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 py-4">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-lg text-sm"
              >
                ← Newer
              </button>
              <span className="text-sm text-slate-400">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-lg text-sm"
              >
                Older →
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="glass-2 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr className="text-left text-slate-400 text-sm">
                  <th className="px-4 py-4 font-medium">Time</th>
                  <th className="px-4 py-4 font-medium">Action</th>
                  <th className="px-4 py-4 font-medium">Actor</th>
                  <th className="px-4 py-4 font-medium">Entity</th>
                  <th className="px-4 py-4 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredEntries.map((entry) => {
                  const action = actionConfig[entry.action] ?? { 
                    icon: <AlertTriangle size={14} />, 
                    color: 'text-slate-400', 
                    label: entry.action 
                  }
                  const entity = entityTypeConfig[entry.entityType] ?? { 
                    icon: <FileText size={14} />, 
                    color: 'text-slate-400' 
                  }
                  
                  return (
                    <tr key={entry.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-slate-500" />
                          <div>
                            <div className="text-white text-sm">{formatRelativeTime(entry.timestamp)}</div>
                            <div className="text-xs text-slate-500">{formatDate(entry.timestamp)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 ${action.color}`}>
                          {action.icon}
                          {action.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {entry.actor.toLowerCase().includes('chef') ? (
                            <Bot size={14} className="text-orange-400" />
                          ) : entry.actor.toLowerCase().includes('sous') ? (
                            <Bot size={14} className="text-blue-400" />
                          ) : (
                            <User size={14} className="text-slate-400" />
                          )}
                          <span className="text-white">{entry.actor}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className={entity.color}>{entity.icon}</span>
                          <div>
                            <span className="text-white capitalize">{entry.entityType}</span>
                            {entry.entityName && (
                              <div className="text-xs text-slate-500 truncate max-w-[200px]">
                                {entry.entityName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {entry.details ? (
                          <span className="text-xs text-slate-400 font-mono">
                            {JSON.stringify(entry.details).slice(0, 50)}
                            {JSON.stringify(entry.details).length > 50 && '...'}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900/50 border-t border-white/[0.06]">
              <div className="text-sm text-slate-400">
                Showing {page * limit + 1} - {Math.min((page + 1) * limit, total)} of {total}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} className="text-slate-400" />
                </button>
                <span className="text-sm text-slate-400">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={18} className="text-slate-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Last Updated */}
      {data?.lastUpdated && (
        <p className="text-center text-slate-500 text-sm mt-4">
          Last updated: {new Date(data.lastUpdated).toLocaleString()}
        </p>
      )}
      </>
      )}
    </PageContainer>
  )
}
