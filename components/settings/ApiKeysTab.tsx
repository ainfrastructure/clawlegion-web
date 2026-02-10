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
  Activity,
  ShieldOff,
  KeyRound,
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

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: number
  icon: React.ReactNode
  color: string
}) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-500/10',
    green: 'text-green-400 bg-green-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    red: 'text-red-400 bg-red-500/10',
  }

  return (
    <div className="glass-2 rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${colorMap[color]}`}>
          {icon}
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold text-white">{value}</div>
          <div className="text-xs sm:text-sm text-slate-400">{label}</div>
        </div>
      </div>
    </div>
  )
}

const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  active: { bg: 'bg-green-500/15', text: 'text-green-400', icon: <CheckCircle2 size={12} /> },
  rate_limited: { bg: 'bg-amber-500/15', text: 'text-amber-400', icon: <AlertTriangle size={12} /> },
  disabled: { bg: 'bg-red-500/15', text: 'text-red-400', icon: <XCircle size={12} /> },
}

function ApiKeyRow({ apiKey }: { apiKey: ApiKey }) {
  const [showFull, setShowFull] = useState(false)
  const config = statusConfig[apiKey.status] ?? statusConfig.active

  return (
    <tr className="hover:bg-white/[0.02] transition-colors">
      <td className="px-4 xl:px-6 py-4">
        <span className="font-medium text-white capitalize">{apiKey.provider}</span>
        {apiKey.name && <span className="text-slate-500 ml-2">({apiKey.name})</span>}
      </td>
      <td className="px-4 xl:px-6 py-4">
        <div className="flex items-center gap-2">
          <code className="text-slate-400 font-mono text-sm">
            {showFull ? apiKey.identifier : `${apiKey.identifier.slice(0, 8)}...`}
          </code>
          <button onClick={() => setShowFull(!showFull)} className="text-slate-500 hover:text-slate-300 transition-colors">
            {showFull ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </td>
      <td className="px-4 xl:px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.text}`}>
          {config.icon} {apiKey.status?.replace('_', ' ')}
        </span>
      </td>
      <td className="px-4 xl:px-6 py-4 text-slate-400 tabular-nums">{apiKey.requestsToday}</td>
      <td className="px-4 xl:px-6 py-4">
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-white/[0.06] rounded-lg transition-colors"><ArrowUp size={14} className="text-slate-400" /></button>
          <span className="text-white w-6 text-center tabular-nums">{apiKey.priority}</span>
          <button className="p-1 hover:bg-white/[0.06] rounded-lg transition-colors"><ArrowDown size={14} className="text-slate-400" /></button>
        </div>
      </td>
      <td className="px-4 xl:px-6 py-4">
        <button className="p-2 hover:bg-red-500/10 rounded-lg text-red-400/60 hover:text-red-400 transition-colors">
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
    <div className="p-4 hover:bg-white/[0.02] transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <span className="font-medium text-white capitalize">{apiKey.provider}</span>
          {apiKey.name && <span className="text-slate-500 ml-2 text-sm">({apiKey.name})</span>}
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium flex-shrink-0 ${config.bg} ${config.text}`}>
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
            <button onClick={() => setShowFull(!showFull)} className="text-slate-500 hover:text-slate-300 transition-colors">
              {showFull ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500">Requests Today</span>
          <span className="text-slate-300 tabular-nums">{apiKey.requestsToday}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-500">Priority</span>
          <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-white/[0.06] rounded-lg transition-colors"><ArrowUp size={14} className="text-slate-400" /></button>
            <span className="text-white w-6 text-center tabular-nums">{apiKey.priority}</span>
            <button className="p-1 hover:bg-white/[0.06] rounded-lg transition-colors"><ArrowDown size={14} className="text-slate-400" /></button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.06]">
        <button className="flex-1 py-2 px-3 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-400 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
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
      {/* Action bar */}
      <div className="flex items-center justify-end gap-2 mb-5">
        <button onClick={() => refetch()} className="p-2.5 glass-2 hover:bg-white/[0.06] rounded-xl transition-colors">
          <RefreshCw size={16} className="text-slate-400" />
        </button>
        <button
          onClick={() => setShowAddKey(!showAddKey)}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 rounded-xl flex items-center gap-2 text-sm font-medium transition-all shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20"
        >
          <Plus size={16} /> Add Key
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <StatCard label="Total Keys" value={stats.total} icon={<KeyRound size={18} />} color="blue" />
        <StatCard label="Active" value={stats.active} icon={<Activity size={18} />} color="green" />
        <StatCard label="Rate Limited" value={stats.rateLimited} icon={<AlertTriangle size={18} />} color="amber" />
        <StatCard label="Disabled" value={stats.disabled} icon={<ShieldOff size={18} />} color="red" />
      </div>

      {/* Keys List */}
      <div className="glass-2 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center gap-3 text-slate-400">
              <RefreshCw size={18} className="animate-spin" />
              <span>Loading API keys...</span>
            </div>
          </div>
        ) : keys.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 mb-4">
              <Key className="text-amber-400" size={28} />
            </div>
            <p className="text-slate-300 font-medium mb-1">No API keys configured</p>
            <p className="text-sm text-slate-500 mb-4">Add your first provider key to get started.</p>
            <button
              onClick={() => setShowAddKey(!showAddKey)}
              className="px-4 py-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
            >
              + Add your first key
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <table className="w-full hidden lg:table">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-white/[0.06]">
                  <th className="px-4 xl:px-6 py-3 font-medium">Provider</th>
                  <th className="px-4 xl:px-6 py-3 font-medium">Identifier</th>
                  <th className="px-4 xl:px-6 py-3 font-medium">Status</th>
                  <th className="px-4 xl:px-6 py-3 font-medium">Requests</th>
                  <th className="px-4 xl:px-6 py-3 font-medium">Priority</th>
                  <th className="px-4 xl:px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
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
