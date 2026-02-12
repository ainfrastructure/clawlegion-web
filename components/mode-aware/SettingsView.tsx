'use client'

import { useState, useCallback } from 'react'
import { useSidebar } from '@/components/layout/SidebarContext'
import { useTheme } from '@/components/theme/ThemeProvider'
import {
  Moon,
  Sun,
  Zap,
  Eye,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Mail,
  LogOut,
  Paintbrush,
} from 'lucide-react'
import { signOut } from 'next-auth/react'

/* ─── Swiss-style Toggle ─── */
function SwissToggle({
  checked,
  onChange,
  labelA,
  labelB,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  labelA: string
  labelB: string
}) {
  return (
    <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-800/60 border border-white/[0.06]">
      <button
        onClick={() => onChange(false)}
        className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          !checked
            ? 'bg-white/[0.1] text-white shadow-sm border border-white/[0.08]'
            : 'text-slate-400 hover:text-slate-300'
        }`}
      >
        {labelA}
      </button>
      <button
        onClick={() => onChange(true)}
        className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          checked
            ? 'bg-white/[0.1] text-white shadow-sm border border-white/[0.08]'
            : 'text-slate-400 hover:text-slate-300'
        }`}
      >
        {labelB}
      </button>
    </div>
  )
}

/* ─── Swiss-style Checkbox ─── */
function SwissCheckbox({
  checked,
  onChange,
  label,
  description,
  icon,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-white/[0.02] group text-left"
    >
      {/* Custom checkbox */}
      <div
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
          checked
            ? 'bg-blue-500 border-blue-500 shadow-sm shadow-blue-500/20'
            : 'border-slate-600 group-hover:border-slate-500'
        }`}
      >
        {checked && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <div className="p-1.5 rounded-lg bg-white/[0.04]">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </button>
  )
}

/* ─── Swiss-style Radio Group ─── */
function SwissRadioGroup({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-800/60 border border-white/[0.06]">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            value === opt.value
              ? 'bg-white/[0.1] text-white shadow-sm border border-white/[0.08]'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

/* ─── Section wrapper ─── */
function SwissSection({
  title,
  icon,
  children,
  variant = 'default',
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  variant?: 'default' | 'danger'
}) {
  return (
    <div
      className={`glass-2 rounded-2xl overflow-hidden ${
        variant === 'danger'
          ? 'border-2 border-red-500/20'
          : 'border border-white/[0.06]'
      }`}
    >
      <div className={`px-5 py-4 border-b flex items-center gap-3 ${
        variant === 'danger'
          ? 'border-red-500/10 bg-red-500/[0.03]'
          : 'border-white/[0.06]'
      }`}>
        <div className={`p-1.5 rounded-lg ${
          variant === 'danger' ? 'bg-red-500/10 text-red-400' : 'bg-white/[0.04] text-slate-400'
        }`}>
          {icon}
        </div>
        <h3 className={`text-sm font-semibold ${
          variant === 'danger' ? 'text-red-400' : 'text-white'
        }`}>
          {title}
        </h3>
      </div>
      <div className="p-5 space-y-4">
        {children}
      </div>
    </div>
  )
}

/* ─── Notification preferences type ─── */
interface NotificationPrefs {
  taskCompleted: boolean
  taskNeedsAttention: boolean
  systemAlerts: boolean
  emailDigest: 'off' | 'daily' | 'weekly'
}

const NOTIFICATION_STORAGE_KEY = 'clawlegion-notification-prefs'

function loadNotificationPrefs(): NotificationPrefs {
  if (typeof window === 'undefined') {
    return { taskCompleted: true, taskNeedsAttention: true, systemAlerts: true, emailDigest: 'off' }
  }
  try {
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return { taskCompleted: true, taskNeedsAttention: true, systemAlerts: true, emailDigest: 'off' }
}

function saveNotificationPrefs(prefs: NotificationPrefs) {
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(prefs))
}

/* ─── Main Settings View (Easy Mode) ─── */
export function EasyModeSettingsView() {
  const { uiMode, setUIMode } = useSidebar()
  const { theme, setTheme } = useTheme()
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(loadNotificationPrefs)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)

  const updateNotifPref = useCallback(<K extends keyof NotificationPrefs>(
    key: K,
    value: NotificationPrefs[K]
  ) => {
    setNotifPrefs((prev) => {
      const updated = { ...prev, [key]: value }
      saveNotificationPrefs(updated)
      return updated
    })
  }, [])

  return (
    <div className="space-y-6">
      {/* ── Appearance ── */}
      <SwissSection title="Appearance" icon={<Paintbrush className="w-4 h-4" />}>
        {/* Theme toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-white/[0.04]">
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-slate-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <div>
              <p className="text-sm text-white font-medium">Theme</p>
              <p className="text-xs text-slate-500">Visual appearance of the interface</p>
            </div>
          </div>
          <SwissToggle
            checked={theme === 'light'}
            onChange={(isLight) => setTheme(isLight ? 'light' : 'dark')}
            labelA="Dark"
            labelB="Light"
          />
        </div>

        {/* Interface Mode toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-white/[0.04]">
              {uiMode === 'easy' ? (
                <Eye className="w-4 h-4 text-blue-400" />
              ) : (
                <Zap className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <div>
              <p className="text-sm text-white font-medium">Interface Mode</p>
              <p className="text-xs text-slate-500">Controls feature visibility and complexity</p>
            </div>
          </div>
          <SwissToggle
            checked={uiMode === 'power'}
            onChange={(isPower) => setUIMode(isPower ? 'power' : 'easy')}
            labelA="Easy"
            labelB="Power"
          />
        </div>
      </SwissSection>

      {/* ── Notifications ── */}
      <SwissSection title="Notifications" icon={<Bell className="w-4 h-4" />}>
        <SwissCheckbox
          checked={notifPrefs.taskCompleted}
          onChange={(v) => updateNotifPref('taskCompleted', v)}
          label="Task completed"
          description="Get notified when a task finishes successfully"
          icon={<CheckCircle2 className="w-4 h-4 text-green-400" />}
        />
        <SwissCheckbox
          checked={notifPrefs.taskNeedsAttention}
          onChange={(v) => updateNotifPref('taskNeedsAttention', v)}
          label="Task needs attention"
          description="Alerts for stuck, failed, or blocked tasks"
          icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
        />
        <SwissCheckbox
          checked={notifPrefs.systemAlerts}
          onChange={(v) => updateNotifPref('systemAlerts', v)}
          label="System alerts"
          description="Health checks, downtime, and system events"
          icon={<Activity className="w-4 h-4 text-cyan-400" />}
        />

        <div className="pt-2 border-t border-white/[0.04]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-white/[0.04]">
                <Mail className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <p className="text-sm text-white font-medium">Email digest</p>
                <p className="text-xs text-slate-500">Summary of activity sent to your email</p>
              </div>
            </div>
            <SwissRadioGroup
              value={notifPrefs.emailDigest}
              onChange={(v) => updateNotifPref('emailDigest', v as 'off' | 'daily' | 'weekly')}
              options={[
                { value: 'off', label: 'Off' },
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
              ]}
            />
          </div>
        </div>
      </SwissSection>

      {/* ── Danger Zone ── */}
      <SwissSection
        title="Danger Zone"
        icon={<AlertTriangle className="w-4 h-4" />}
        variant="danger"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white font-medium">Sign out</p>
            <p className="text-xs text-slate-500">End your current session</p>
          </div>
          {!showSignOutConfirm ? (
            <button
              onClick={() => setShowSignOutConfirm(true)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-colors"
            >
              <span className="flex items-center gap-2">
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-400">Are you sure?</span>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="px-3 py-1.5 glass-2 hover:bg-white/[0.06] rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </SwissSection>
    </div>
  )
}
