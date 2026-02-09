'use client'

import { useState, useEffect } from 'react'
import { useSystemSettings, useUpdateSystemSettings } from '@/hooks/useSystemSettings'
import type { NotificationPreferences } from '@/hooks/useSystemSettings'
import { Bell, Monitor, MessageSquare, Send } from 'lucide-react'

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
      className={`w-9 h-5 rounded-full transition-colors ${
        disabled ? 'bg-blue-500/50 cursor-not-allowed' : checked ? 'bg-blue-500' : 'bg-slate-700 hover:bg-slate-600'
      }`}
    >
      <div
        className={`w-3.5 h-3.5 bg-white rounded-full transition-transform mx-0.5 ${checked ? 'translate-x-4' : 'translate-x-0'}`}
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
          <Bell className="text-orange-400" /> Notification Channels
        </h2>
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={updateSettings.isPending}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      <p className="text-sm text-slate-400 mb-6">
        Configure which notification channels are active for each event category. In-App notifications are always enabled.
      </p>

      <div className="glass-2 rounded-xl border border-white/[0.06] overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-[1fr_repeat(3,80px)] gap-2 px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Category</div>
          {CHANNELS.map(ch => {
            const Icon = ch.icon
            return (
              <div key={ch.id} className="text-xs font-medium text-slate-400 text-center flex flex-col items-center gap-1">
                <Icon size={14} />
                {ch.label}
              </div>
            )
          })}
        </div>

        {/* Category rows */}
        {CATEGORIES.map((cat, i) => (
          <div
            key={cat.id}
            className={`grid grid-cols-[1fr_repeat(3,80px)] gap-2 px-5 py-4 items-center ${
              i < CATEGORIES.length - 1 ? 'border-b border-white/[0.04]' : ''
            }`}
          >
            <div>
              <p className="text-sm font-medium text-white">{cat.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
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
