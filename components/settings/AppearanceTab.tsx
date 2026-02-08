'use client'

import { useState, useEffect } from 'react'
import {
  Paintbrush,
  Moon,
  Sun,
  Monitor,
  Bell,
  Volume2,
  VolumeX,
  Smartphone,
  PanelLeftClose,
  User,
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
      className={`w-10 h-6 rounded-full transition-colors ${checked ? 'bg-blue-500' : 'bg-slate-700'}`}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full transition-transform mx-1 ${checked ? 'translate-x-4' : 'translate-x-0'}`}
      />
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
      <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2 mb-4">
        <Paintbrush className="text-pink-400" /> Appearance
      </h2>

      {/* Theme */}
      <div className="glass-2 rounded-xl p-5 mb-4">
        <h3 className="text-sm font-semibold text-white mb-3">Theme</h3>
        <div className="flex gap-2">
          {([
            { value: 'dark' as const, icon: <Moon className="w-4 h-4" />, label: 'Dark' },
            { value: 'light' as const, icon: <Sun className="w-4 h-4" />, label: 'Light' },
            { value: 'system' as const, icon: <Monitor className="w-4 h-4" />, label: 'System' },
          ]).map((option) => (
            <button
              key={option.value}
              onClick={() => update('theme', option.value)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                settings.theme === option.value
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                  : 'bg-slate-800/50 text-slate-400 border border-white/[0.06] hover:border-slate-600'
              }`}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Display */}
      <div className="glass-2 rounded-xl p-5 mb-4">
        <h3 className="text-sm font-semibold text-white mb-3">Display</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-sm text-white">Compact mode</span>
                <p className="text-xs text-slate-500">Reduce spacing throughout the UI</p>
              </div>
            </div>
            <Toggle checked={settings.compactMode} onChange={(v) => update('compactMode', v)} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PanelLeftClose className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-sm text-white">Default sidebar collapsed</span>
                <p className="text-xs text-slate-500">Start with the sidebar collapsed on load</p>
              </div>
            </div>
            <Toggle checked={settings.sidebarCollapsed} onChange={(v) => update('sidebarCollapsed', v)} />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-2 rounded-xl p-5 mb-4">
        <h3 className="text-sm font-semibold text-white mb-3">Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-sm text-white">Enable notifications</span>
                <p className="text-xs text-slate-500">Browser notifications for task updates</p>
              </div>
            </div>
            <Toggle checked={settings.notifications} onChange={(v) => update('notifications', v)} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.sounds ? (
                <Volume2 className="w-4 h-4 text-slate-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
              <div>
                <span className="text-sm text-white">Sound effects</span>
                <p className="text-xs text-slate-500">Play sounds on task completion and alerts</p>
              </div>
            </div>
            <Toggle checked={settings.sounds} onChange={(v) => update('sounds', v)} />
          </div>
        </div>
      </div>

      {/* Identity */}
      <div className="glass-2 rounded-xl p-5 mb-4">
        <h3 className="text-sm font-semibold text-white mb-3">Identity</h3>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <User className="w-4 h-4 text-slate-400" />
            <label className="text-sm text-white">Agent ID</label>
          </div>
          <input
            type="text"
            value={settings.agentId}
            onChange={(e) => update('agentId', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800/50 border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
            placeholder="dashboard-user"
          />
          <p className="text-xs text-slate-500 mt-1">Used for @mentions and task assignments</p>
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
          saved
            ? 'bg-green-500/20 text-green-400'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {saved ? 'Saved!' : <><Save className="w-4 h-4" /> Save Preferences</>}
      </button>
    </div>
  )
}
