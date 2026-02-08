'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import {
  Key,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  RefreshCw,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'

type ApiKey = {
  id: string
  provider: string
  identifier: string
  name: string | null
  status: string
  rateLimitedUntil: string | null
  requestsToday: number
  requestsTotal: number
  lastUsedAt: string | null
  priority: number
  createdAt: string
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'border-l-blue-500',
    green: 'border-l-green-500',
    amber: 'border-l-amber-500',
    red: 'border-l-red-500',
  }

  return (
    <div className={`bg-slate-800/50 rounded-lg border border-white/[0.06] border-l-4 ${colors[color]} p-3 sm:p-4`}>
      <div className="text-xl sm:text-2xl font-bold text-white">{value}</div>
      <div className="text-xs sm:text-sm text-slate-400">{label}</div>
    </div>
  )
}

const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  active: { bg: 'bg-green-500/20', text: 'text-green-400', icon: <CheckCircle2 size={12} /> },
  rate_limited: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: <AlertTriangle size={12} /> },
  disabled: { bg: 'bg-red-500/20', text: 'text-red-400', icon: <XCircle size={12} /> },
}

function ApiKeyRow({ apiKey }: { apiKey: ApiKey }) {
  const [showFull, setShowFull] = useState(false)
  const config = statusConfig[apiKey.status] ?? statusConfig.active

  return (
    <tr className="hover:bg-slate-800/50 transition-colors">
      <td className="px-4 xl:px-6 py-4">
        <span className="font-medium text-white capitalize">{apiKey.provider}</span>
        {apiKey.name && <span className="text-slate-500 ml-2">({apiKey.name})</span>}
      </td>
      <td className="px-4 xl:px-6 py-4">
        <div className="flex items-center gap-2">
          <code className="text-slate-400 font-mono text-sm">
            {showFull ? apiKey.identifier : `${apiKey.identifier.slice(0, 8)}...`}
          </code>
          <button onClick={() => setShowFull(!showFull)} className="text-slate-500 hover:text-slate-300">
            {showFull ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </td>
      <td className="px-4 xl:px-6 py-4">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${config.bg} ${config.text}`}>
          {config.icon} {apiKey.status?.replace('_', ' ')}
        </span>
      </td>
      <td className="px-4 xl:px-6 py-4 text-slate-400">{apiKey.requestsToday}</td>
      <td className="px-4 xl:px-6 py-4">
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-slate-700 rounded"><ArrowUp size={14} className="text-slate-400" /></button>
          <span className="text-white w-6 text-center">{apiKey.priority}</span>
          <button className="p-1 hover:bg-slate-700 rounded"><ArrowDown size={14} className="text-slate-400" /></button>
        </div>
      </td>
      <td className="px-4 xl:px-6 py-4">
        <button className="p-2 hover:bg-slate-700 rounded text-red-400">
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  )
}

function ApiKeyCard({ apiKey }: { apiKey: ApiKey }) {
  const [showFull, setShowFull] = useState(false)
  const config = statusConfig[apiKey.status] ?? statusConfig.active

  return (
    <div className="p-4 hover:bg-slate-800/50 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <span className="font-medium text-white capitalize">{apiKey.provider}</span>
          {apiKey.name && <span className="text-slate-500 ml-2 text-sm">({apiKey.name})</span>}
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs flex-shrink-0 ${config.bg} ${config.text}`}>
          {config.icon} {apiKey.status?.replace('_', ' ')}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="text-slate-500">Key</span>
          <div className="flex items-center gap-2">
            <code className="text-slate-400 font-mono text-xs">
              {showFull ? apiKey.identifier : `${apiKey.identifier.slice(0, 12)}...`}
            </code>
            <button onClick={() => setShowFull(!showFull)} className="text-slate-500 hover:text-slate-300">
              {showFull ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500">Requests Today</span>
          <span className="text-slate-300">{apiKey.requestsToday}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-500">Priority</span>
          <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-slate-700 rounded"><ArrowUp size={14} className="text-slate-400" /></button>
            <span className="text-white w-6 text-center">{apiKey.priority}</span>
            <button className="p-1 hover:bg-slate-700 rounded"><ArrowDown size={14} className="text-slate-400" /></button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.06]">
        <button className="flex-1 py-2 px-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
          <Trash2 size={14} /> Remove
        </button>
      </div>
    </div>
  )
}

export function ApiKeysTab() {
  const [showAddKey, setShowAddKey] = useState(false)

  const { data: keysData, isLoading, refetch } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => api.get('/api-keys').then(r => r.data),
  })

  const keys: ApiKey[] = keysData?.keys ?? []
  const stats = keysData?.stats ?? { total: 0, active: 0, rateLimited: 0, disabled: 0 }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
          <Key className="text-amber-400" /> API Keys
        </h2>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="p-2 glass-2 hover:bg-white/[0.06] rounded-lg transition-colors">
            <RefreshCw size={18} className="text-slate-400" />
          </button>
          <button
            onClick={() => setShowAddKey(!showAddKey)}
            className="px-3 sm:px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg flex items-center gap-2 text-sm sm:text-base transition-colors"
          >
            <Plus size={18} /> Add Key
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <StatCard label="Total Keys" value={stats.total} color="blue" />
        <StatCard label="Active" value={stats.active} color="green" />
        <StatCard label="Rate Limited" value={stats.rateLimited} color="amber" />
        <StatCard label="Disabled" value={stats.disabled} color="red" />
      </div>

      {/* Keys List */}
      <div className="glass-2 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Loading API keys...</div>
        ) : keys.length === 0 ? (
          <div className="p-8 text-center">
            <Key className="mx-auto mb-4 text-slate-500" size={48} />
            <p className="text-slate-400">No API keys configured</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <table className="w-full hidden lg:table">
              <thead className="bg-slate-900/50">
                <tr className="text-left text-slate-400 text-sm">
                  <th className="px-4 xl:px-6 py-4 font-medium">Provider</th>
                  <th className="px-4 xl:px-6 py-4 font-medium">Identifier</th>
                  <th className="px-4 xl:px-6 py-4 font-medium">Status</th>
                  <th className="px-4 xl:px-6 py-4 font-medium">Requests</th>
                  <th className="px-4 xl:px-6 py-4 font-medium">Priority</th>
                  <th className="px-4 xl:px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {keys.map((key) => (
                  <ApiKeyRow key={key.id} apiKey={key} />
                ))}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-white/[0.06]">
              {keys.map((key) => (
                <ApiKeyCard key={key.id} apiKey={key} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
