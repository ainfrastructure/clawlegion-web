'use client'

import { useState, useEffect } from 'react'
import { useSystemSettings, useUpdateSystemSettings } from '@/hooks/useSystemSettings'
import type { NotificationPreferences } from '@/hooks/useSystemSettings'
import { Monitor, MessageSquare, Send } from 'lucide-react'

const CATEGORY_COLORS: Record<string, string> = {
  lifecycle: 'bg-blue-400',
  failure: 'bg-red-400',
  verification: 'bg-green-400',
  system: 'bg-amber-400',
}

const CATEGORIES = [
  { id: 'lifecycle', label: 'Lifecycle', description: 'Task creation, status changes, assignments, handoffs' },
  { id: 'failure', label: 'Failures', description: 'Agent failures, routing errors, blocked tasks' },
  { id: 'verification', label: 'Verification', description: 'Submissions, verification results, approvals' },
  { id: 'system', label: 'System', description: 'Comments, spec updates, manual dispatches' },
]

const CHANNELS = [
  { id: 'inApp', label: 'In-App', icon: Monitor, disabled: true },
  { id: 'discord', label: 'Discord', icon: MessageSquare, disabled: false },
  { id: 'telegram', label: 'Telegram', icon: Send, disabled: false },
] as const

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`w-10 h-5.5 rounded-full transition-all duration-200 ${
        disabled ? 'bg-blue-500/50 cursor-not-allowed' : checked ? 'bg-blue-500 shadow-md shadow-blue-500/20' : 'bg-slate-700 hover:bg-slate-600'
      }`}
      style={{ width: '40px', height: '22px' }}
    >
      <div
        className="bg-white rounded-full transition-transform shadow-sm"
        style={{
          width: '16px',
          height: '16px',
          marginTop: '3px',
          marginLeft: checked ? '21px' : '3px',
        }}
      />
    </button>
  )
}

export function NotificationsTab() {
  const { data: settings } = useSystemSettings()
  const updateSettings = useUpdateSystemSettings()

  const [localPrefs, setLocalPrefs] = useState<NotificationPreferences | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (settings?.notificationPreferences && !localPrefs) {
      setLocalPrefs(settings.notificationPreferences)
    }
  }, [settings, localPrefs])

  const prefs = localPrefs || settings?.notificationPreferences || {
    lifecycle: { inApp: true, discord: false, telegram: false },
    failure: { inApp: true, discord: false, telegram: false },
    verification: { inApp: true, discord: false, telegram: false },
    system: { inApp: true, discord: false, telegram: false },
  }

  const handleToggle = (category: string, channel: string, value: boolean) => {
    const updated = {
      ...prefs,
      [category]: { ...prefs[category], [channel]: value },
    }
    setLocalPrefs(updated)
    setHasChanges(true)
  }

  const handleSave = () => {
    if (localPrefs) {
      updateSettings.mutate({ notificationPreferences: localPrefs }, {
        onSuccess: () => setHasChanges(false),
      })
    }
  }

  return (
    <div>
      {/* Save bar */}
      {hasChanges && (
        <div className="flex justify-end mb-5">
          <button
            onClick={handleSave}
            disabled={updateSettings.isPending}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/10"
          >
            {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      <div className="glass-2 rounded-2xl border border-white/[0.06] overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-[1fr_repeat(3,80px)] gap-2 px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Category</div>
          {CHANNELS.map(ch => {
            const Icon = ch.icon
            return (
              <div key={ch.id} className="flex justify-center">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  <Icon size={12} className="text-slate-400" />
                  <span className="text-xs font-medium text-slate-400">{ch.label}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Category rows */}
        {CATEGORIES.map((cat, i) => (
          <div
            key={cat.id}
            className={`grid grid-cols-[1fr_repeat(3,80px)] gap-2 px-5 py-4 items-center hover:bg-white/[0.02] transition-colors ${
              i < CATEGORIES.length - 1 ? 'border-b border-white/[0.04]' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${CATEGORY_COLORS[cat.id]}`} />
              <div>
                <p className="text-sm font-medium text-white">{cat.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
              </div>
            </div>
            {CHANNELS.map(ch => (
              <div key={ch.id} className="flex justify-center">
                <Toggle
                  checked={prefs[cat.id]?.[ch.id as keyof typeof prefs[string]] ?? (ch.id === 'inApp')}
                  onChange={(v) => handleToggle(cat.id, ch.id, v)}
                  disabled={ch.disabled}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-500 mt-4">
        Discord and Telegram must be configured in the Integrations tab before enabling those channels.
      </p>
    </div>
  )
}
