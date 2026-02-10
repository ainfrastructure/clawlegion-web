'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useResetSettings, usePurgeApiKeys } from '@/hooks/useSystemSettings'
import { RotateCcw, Trash2, HardDrive } from 'lucide-react'

function DangerCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="glass-2 rounded-2xl overflow-hidden border border-red-500/10">
      <div className="flex">
        {/* Left accent line */}
        <div className="w-0.5 bg-gradient-to-b from-red-500/40 to-red-500/10 flex-shrink-0" />
        <div className="flex-1 p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400">{icon}</div>
            <div>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{description}</p>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

export function DangerZoneTab() {
  const resetSettings = useResetSettings()
  const purgeApiKeys = usePurgeApiKeys()
  const queryClient = useQueryClient()

  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmCache, setConfirmCache] = useState(false)
  const [purgeText, setPurgeText] = useState('')
  const [purgeResult, setPurgeResult] = useState<string | null>(null)
  const [cacheCleared, setCacheCleared] = useState(false)

  const handleResetSettings = () => {
    resetSettings.mutate(undefined, {
      onSuccess: () => {
        setConfirmReset(false)
      },
    })
  }

  const handleClearCache = () => {
    localStorage.removeItem('ralph-settings')
    queryClient.clear()
    setConfirmCache(false)
    setCacheCleared(true)
    setTimeout(() => setCacheCleared(false), 3000)
  }

  const handlePurgeKeys = () => {
    purgeApiKeys.mutate(undefined, {
      onSuccess: (data) => {
        setPurgeText('')
        setPurgeResult(`Deleted ${data.deleted} API key${data.deleted === 1 ? '' : 's'}`)
        setTimeout(() => setPurgeResult(null), 5000)
      },
      onError: () => {
        setPurgeResult('Failed to purge API keys')
        setTimeout(() => setPurgeResult(null), 5000)
      },
    })
  }

  return (
    <div>
      {/* Red gradient border container */}
      <div className="rounded-2xl border border-red-500/10 p-px bg-gradient-to-b from-red-500/[0.06] to-transparent">
        <div className="space-y-4 p-4">
          {/* Reset All Settings */}
          <DangerCard
            icon={<RotateCcw size={18} />}
            title="Reset All Settings"
            description="Resets integrations and agent defaults to factory values. Appearance settings are not affected."
          >
            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-400 rounded-xl text-sm transition-colors"
              >
                Reset Settings
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-400">Are you sure?</span>
                <button
                  onClick={handleResetSettings}
                  disabled={resetSettings.isPending}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm transition-colors disabled:opacity-50"
                >
                  {resetSettings.isPending ? 'Resetting...' : 'Confirm'}
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-1.5 glass-2 hover:bg-white/[0.06] rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </DangerCard>

          {/* Clear Local Cache */}
          <DangerCard
            icon={<HardDrive size={18} />}
            title="Clear Local Cache"
            description="Clears appearance settings from localStorage and resets the React Query cache."
          >
            {cacheCleared ? (
              <p className="text-sm text-green-400">Cache cleared successfully</p>
            ) : !confirmCache ? (
              <button
                onClick={() => setConfirmCache(true)}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-400 rounded-xl text-sm transition-colors"
              >
                Clear Cache
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-400">Are you sure?</span>
                <button
                  onClick={handleClearCache}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmCache(false)}
                  className="px-3 py-1.5 glass-2 hover:bg-white/[0.06] rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </DangerCard>

          {/* Purge All API Keys */}
          <DangerCard
            icon={<Trash2 size={18} />}
            title="Purge All API Keys"
            description="Permanently deletes ALL API keys from the database. This cannot be undone."
          >
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block font-medium">
                  Type <span className="text-red-400 font-mono">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={purgeText}
                  onChange={(e) => setPurgeText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full sm:w-64 px-3 py-2 bg-slate-800/40 border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/40 transition-all"
                />
              </div>
              <button
                onClick={handlePurgeKeys}
                disabled={purgeText !== 'DELETE' || purgeApiKeys.isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {purgeApiKeys.isPending ? 'Purging...' : 'Purge All Keys'}
              </button>
              {purgeResult && (
                <p className={`text-xs ${purgeResult.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>
                  {purgeResult}
                </p>
              )}
            </div>
          </DangerCard>
        </div>
      </div>
    </div>
  )
}
