'use client'

import { useState, useEffect } from 'react'
import {
  Moon,
  Sun,
  Monitor,
  Bell,
  Volume2,
  VolumeX,
  Smartphone,
  PanelLeftClose,
  Save,
} from 'lucide-react'

type UserSettings = {
  theme: 'dark' | 'light' | 'system'
  notifications: boolean
  sounds: boolean
  compactMode: boolean
  sidebarCollapsed: boolean
  agentId: string
}

const STORAGE_KEY = 'ralph-settings'

const defaultSettings: UserSettings = {
  theme: 'dark',
  notifications: true,
  sounds: false,
  compactMode: false,
  sidebarCollapsed: false,
  agentId: 'dashboard-user',
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-all duration-200 ${checked ? 'bg-red-500 shadow-lg shadow-red-500/20' : 'bg-slate-700'}`}
    >
      <div
        className={`bg-white rounded-full transition-transform shadow-sm`}
        style={{ width: '18px', height: '18px', marginTop: '3px', marginLeft: checked ? '22px' : '3px' }}
      />
    </button>
  )
}

function ToggleRow({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded-lg bg-white/[0.04]">
          {icon}
        </div>
        <div>
          <span className="text-sm text-white">{label}</span>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

function ThemeCard({
  value,
  icon,
  label,
  isActive,
  onClick,
}: {
  value: string
  icon: React.ReactNode
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 relative rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
        isActive
          ? 'border-blue-500/50 shadow-lg shadow-red-500/10'
          : 'border-white/[0.06] hover:border-white/[0.12]'
      }`}
    >
      {/* Mini preview mockup */}
      <div className={`p-3 ${value === 'light' ? 'bg-slate-200' : 'bg-slate-900'}`}>
        <div className="flex gap-1.5 mb-2">
          <div className={`w-1.5 h-1.5 rounded-full ${value === 'light' ? 'bg-red-400' : 'bg-red-500/60'}`} />
          <div className={`w-1.5 h-1.5 rounded-full ${value === 'light' ? 'bg-amber-400' : 'bg-amber-500/60'}`} />
          <div className={`w-1.5 h-1.5 rounded-full ${value === 'light' ? 'bg-green-400' : 'bg-green-500/60'}`} />
        </div>
        <div className="flex gap-2">
          <div className={`w-6 rounded ${value === 'light' ? 'bg-slate-300 h-8' : 'bg-slate-800 h-8'}`} />
          <div className="flex-1 space-y-1.5">
            <div className={`h-1.5 rounded-full w-3/4 ${value === 'light' ? 'bg-slate-300' : 'bg-slate-700'}`} />
            <div className={`h-1.5 rounded-full w-1/2 ${value === 'light' ? 'bg-slate-300' : 'bg-slate-700'}`} />
            <div className={`h-1.5 rounded-full w-2/3 ${value === 'light' ? 'bg-slate-300' : 'bg-slate-700'}`} />
          </div>
        </div>
        {value === 'system' && (
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'linear-gradient(135deg, transparent 49.5%, rgba(255,255,255,0.08) 49.5%, rgba(255,255,255,0.08) 50.5%, transparent 50.5%)'
          }} />
        )}
      </div>
      {/* Label */}
      <div className={`flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium ${
        isActive ? 'text-blue-400' : 'text-slate-400'
      }`}>
        {icon}
        {label}
      </div>
    </button>
  )
}

export function AppearanceTab() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [saved, setSaved] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) })
      } catch {
        // ignore parse error
      }
    }
    setLoaded(true)
  }, [])

  const update = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)

    // Apply theme
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (settings.theme === 'light') {
      document.documentElement.classList.remove('dark')
    }
  }

  if (!loaded) return null

  return (
    <div>
      {/* Theme */}
      <div className="glass-2 rounded-2xl p-5 sm:p-6 mb-4">
        <h3 className="text-sm font-semibold text-white mb-4">Theme</h3>
        <div className="flex gap-3">
          <ThemeCard
            value="dark"
            icon={<Moon className="w-4 h-4" />}
            label="Dark"
            isActive={settings.theme === 'dark'}
            onClick={() => update('theme', 'dark')}
          />
          <ThemeCard
            value="light"
            icon={<Sun className="w-4 h-4" />}
            label="Light"
            isActive={settings.theme === 'light'}
            onClick={() => update('theme', 'light')}
          />
          <ThemeCard
            value="system"
            icon={<Monitor className="w-4 h-4" />}
            label="System"
            isActive={settings.theme === 'system'}
            onClick={() => update('theme', 'system')}
          />
        </div>
      </div>

      {/* Display */}
      <div className="glass-2 rounded-2xl p-5 sm:p-6 mb-4">
        <h3 className="text-sm font-semibold text-white mb-2">Display</h3>
        <div className="divide-y divide-white/[0.04]">
          <ToggleRow
            icon={<Smartphone className="w-4 h-4 text-slate-400" />}
            label="Compact mode"
            description="Reduce spacing throughout the UI"
            checked={settings.compactMode}
            onChange={(v) => update('compactMode', v)}
          />
          <ToggleRow
            icon={<PanelLeftClose className="w-4 h-4 text-slate-400" />}
            label="Default sidebar collapsed"
            description="Start with the sidebar collapsed on load"
            checked={settings.sidebarCollapsed}
            onChange={(v) => update('sidebarCollapsed', v)}
          />
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-2 rounded-2xl p-5 sm:p-6 mb-4">
        <h3 className="text-sm font-semibold text-white mb-2">Notifications</h3>
        <div className="divide-y divide-white/[0.04]">
          <ToggleRow
            icon={<Bell className="w-4 h-4 text-slate-400" />}
            label="Enable notifications"
            description="Browser notifications for task updates"
            checked={settings.notifications}
            onChange={(v) => update('notifications', v)}
          />
          <ToggleRow
            icon={settings.sounds
              ? <Volume2 className="w-4 h-4 text-slate-400" />
              : <VolumeX className="w-4 h-4 text-slate-400" />
            }
            label="Sound effects"
            description="Play sounds on task completion and alerts"
            checked={settings.sounds}
            onChange={(v) => update('sounds', v)}
          />
        </div>
      </div>

      {/* Identity */}
      <div className="glass-2 rounded-2xl p-5 sm:p-6 mb-5">
        <h3 className="text-sm font-semibold text-white mb-4">Identity</h3>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-white/[0.08] flex items-center justify-center text-lg font-bold text-pink-400 flex-shrink-0">
            {settings.agentId.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <label className="text-xs text-slate-400 mb-1.5 block font-medium">Agent ID</label>
            <input
              type="text"
              value={settings.agentId}
              onChange={(e) => update('agentId', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/40 border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition-all"
              placeholder="dashboard-user"
            />
            <p className="text-xs text-slate-500 mt-1">Used for @mentions and task assignments</p>
          </div>
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
          saved
            ? 'bg-green-500/15 text-green-400 border border-green-500/20'
            : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/10'
        }`}
      >
        {saved ? 'Saved!' : <><Save className="w-4 h-4" /> Save Preferences</>}
      </button>
    </div>
  )
}
