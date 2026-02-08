'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useResetSettings, usePurgeApiKeys } from '@/hooks/useSystemSettings'
import { AlertTriangle, RotateCcw, Trash2, HardDrive } from 'lucide-react'

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
    <div className="glass-2 rounded-xl p-5 border border-red-500/10">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-lg bg-red-500/10 text-red-400">{icon}</div>
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

export function DangerZoneTab() {
  const resetSettings = useResetSettings()
  const purgeApiKeys = usePurgeApiKeys()
  const queryClient = useQueryClient()

  // Inline confirmations
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
      <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2 mb-4">
        <AlertTriangle className="text-red-400" /> Danger Zone
      </h2>
      <p className="text-sm text-slate-500 mb-6">These actions are destructive and may not be reversible.</p>

      <div className="space-y-4">
        {/* Reset All Settings */}
        <DangerCard
          icon={<RotateCcw size={18} />}
          title="Reset All Settings"
          description="Resets integrations and agent defaults to factory values. Appearance settings are not affected."
        >
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm transition-colors"
            >
              Reset Settings
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-400">Are you sure?</span>
              <button
                onClick={handleResetSettings}
                disabled={resetSettings.isPending}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {resetSettings.isPending ? 'Resetting...' : 'Confirm'}
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
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
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm transition-colors"
            >
              Clear Cache
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-400">Are you sure?</span>
              <button
                onClick={handleClearCache}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmCache(false)}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
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
              <label className="text-xs text-slate-400 mb-1 block">
                Type <span className="text-red-400 font-mono">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={purgeText}
                onChange={(e) => setPurgeText(e.target.value)}
                placeholder="DELETE"
                className="w-full sm:w-64 px-3 py-2 bg-slate-800/50 border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-red-500/50 transition-colors"
              />
            </div>
            <button
              onClick={handlePurgeKeys}
              disabled={purgeText !== 'DELETE' || purgeApiKeys.isPending}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
  )
}
