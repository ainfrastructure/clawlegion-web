/**
 * SettingsView — Easy Mode settings
 *
 * Three sections only:
 * 1. Appearance: Theme toggle, Interface Mode toggle
 * 2. Notifications: Task completed, needs attention, system alerts, email digest
 * 3. Danger Zone: Sign out button
 *
 * No API keys, agent defaults, repository management, integrations, shortcuts, dev settings.
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { SwissSection, SwissButton, SwissCard } from '@/components/swiss'
import { useUIMode } from '@/hooks/useUIMode'
import { signOut } from 'next-auth/react'
import { Sun, Moon, Zap, Eye, LogOut } from 'lucide-react'
import { clsx } from 'clsx'

const SETTINGS_KEY = 'ralph-settings'

function useLocalTheme() {
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.theme === 'light') setThemeState('light')
      }
    } catch { /* ignore */ }
  }, [])

  const setTheme = useCallback((t: 'dark' | 'light') => {
    setThemeState(t)
    try {
      const saved = localStorage.getItem(SETTINGS_KEY)
      const current = saved ? JSON.parse(saved) : {}
      current.theme = t
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(current))
      // Apply theme
      if (t === 'dark') {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
      } else {
        document.documentElement.classList.remove('dark')
        document.documentElement.classList.add('light')
      }
    } catch { /* ignore */ }
  }, [])

  return { theme, setTheme }
}

// Toggle component styled for Swiss design
function SwissToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-swiss-4 py-swiss-3 cursor-pointer min-h-[44px]">
      <div className="flex-1 min-w-0">
        <span className="text-swiss-sm font-medium text-[var(--swiss-text-primary)] block">
          {label}
        </span>
        {description && (
          <span className="text-swiss-xs text-[var(--swiss-text-tertiary)] block mt-swiss-1">
            {description}
          </span>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative inline-flex h-6 w-11 items-center rounded-full flex-shrink-0',
          'transition-colors duration-swiss ease-swiss',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--swiss-accent)]',
          checked
            ? 'bg-[var(--swiss-accent)]'
            : 'bg-[var(--swiss-surface-raised)] border border-[var(--swiss-border)]'
        )}
      >
        <span
          className={clsx(
            'inline-block h-4 w-4 rounded-full bg-white transition-transform duration-swiss',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </label>
  )
}

// Radio option
function SwissRadio({
  label,
  checked,
  onChange,
  name,
}: {
  label: string
  checked: boolean
  onChange: () => void
  name: string
}) {
  return (
    <label className="flex items-center gap-swiss-2 cursor-pointer min-h-[44px] py-swiss-1">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className={clsx(
          'w-4 h-4 border-2 rounded-full appearance-none cursor-pointer',
          'border-[var(--swiss-border)]',
          'checked:border-[var(--swiss-accent)] checked:bg-[var(--swiss-accent)]',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--swiss-accent)]',
          'transition-all duration-swiss'
        )}
      />
      <span className="text-swiss-sm text-[var(--swiss-text-primary)]">{label}</span>
    </label>
  )
}

export function SettingsView() {
  const { mode, toggle: toggleMode } = useUIMode()
  const { theme, setTheme } = useLocalTheme()
  const [mounted, setMounted] = useState(false)

  // Notification preferences (local state, could be connected to API)
  const [notifs, setNotifs] = useState({
    taskCompleted: true,
    taskAttention: true,
    systemAlerts: true,
    emailDigest: 'off' as 'off' | 'daily' | 'weekly',
  })

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted ? theme === 'dark' : true

  return (
    <div className="space-y-swiss-2 max-w-2xl">
      {/* Header */}
      <div className="mb-swiss-6">
        <h1 className="text-swiss-2xl font-semibold text-[var(--swiss-text-primary)] tracking-tight">
          Settings
        </h1>
        <p className="text-swiss-sm text-[var(--swiss-text-tertiary)] mt-swiss-1">
          Manage your preferences
        </p>
      </div>

      {/* Section 1: Appearance */}
      <SwissSection title="Appearance" spacing="default">
        <SwissCard variant="default" size="md">
          <div className="divide-y divide-[var(--swiss-border-subtle)]">
            {/* Theme toggle */}
            <div className="flex items-center justify-between gap-swiss-4 py-swiss-3">
              <div className="flex-1 min-w-0">
                <span className="text-swiss-sm font-medium text-[var(--swiss-text-primary)] block">
                  Theme
                </span>
                <span className="text-swiss-xs text-[var(--swiss-text-tertiary)] block mt-swiss-1">
                  Choose between light and dark mode
                </span>
              </div>
              <div className="flex items-center gap-swiss-1 bg-[var(--swiss-surface-raised)] rounded-swiss-sm p-swiss-1">
                <button
                  onClick={() => setTheme('light')}
                  className={clsx(
                    'flex items-center gap-swiss-1 px-swiss-3 py-swiss-1 rounded-swiss-sm text-swiss-sm transition-all duration-swiss',
                    !isDark
                      ? 'bg-[var(--swiss-surface)] text-[var(--swiss-text-primary)] shadow-swiss-sm'
                      : 'text-[var(--swiss-text-muted)] hover:text-[var(--swiss-text-secondary)]'
                  )}
                >
                  <Sun size={14} />
                  Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={clsx(
                    'flex items-center gap-swiss-1 px-swiss-3 py-swiss-1 rounded-swiss-sm text-swiss-sm transition-all duration-swiss',
                    isDark
                      ? 'bg-[var(--swiss-surface)] text-[var(--swiss-text-primary)] shadow-swiss-sm'
                      : 'text-[var(--swiss-text-muted)] hover:text-[var(--swiss-text-secondary)]'
                  )}
                >
                  <Moon size={14} />
                  Dark
                </button>
              </div>
            </div>

            {/* Mode toggle */}
            <div className="flex items-center justify-between gap-swiss-4 py-swiss-3">
              <div className="flex-1 min-w-0">
                <span className="text-swiss-sm font-medium text-[var(--swiss-text-primary)] block">
                  Interface Mode
                </span>
                <span className="text-swiss-xs text-[var(--swiss-text-tertiary)] block mt-swiss-1">
                  Easy mode shows a simplified interface. Power mode shows all features.
                </span>
              </div>
              <div className="flex items-center gap-swiss-1 bg-[var(--swiss-surface-raised)] rounded-swiss-sm p-swiss-1">
                <button
                  onClick={() => mode !== 'easy' && toggleMode()}
                  className={clsx(
                    'flex items-center gap-swiss-1 px-swiss-3 py-swiss-1 rounded-swiss-sm text-swiss-sm transition-all duration-swiss',
                    mode === 'easy'
                      ? 'bg-[var(--swiss-surface)] text-[var(--swiss-text-primary)] shadow-swiss-sm'
                      : 'text-[var(--swiss-text-muted)] hover:text-[var(--swiss-text-secondary)]'
                  )}
                >
                  <Eye size={14} />
                  Easy
                </button>
                <button
                  onClick={() => mode !== 'power' && toggleMode()}
                  className={clsx(
                    'flex items-center gap-swiss-1 px-swiss-3 py-swiss-1 rounded-swiss-sm text-swiss-sm transition-all duration-swiss',
                    mode === 'power'
                      ? 'bg-[var(--swiss-surface)] text-[var(--swiss-text-primary)] shadow-swiss-sm'
                      : 'text-[var(--swiss-text-muted)] hover:text-[var(--swiss-text-secondary)]'
                  )}
                >
                  <Zap size={14} />
                  Power
                </button>
              </div>
            </div>
          </div>
        </SwissCard>
      </SwissSection>

      {/* Section 2: Notifications */}
      <SwissSection title="Notifications" spacing="default" divider>
        <SwissCard variant="default" size="md">
          <div className="divide-y divide-[var(--swiss-border-subtle)]">
            <SwissToggle
              label="Task completed"
              description="Get notified when a task finishes"
              checked={notifs.taskCompleted}
              onChange={(v) => setNotifs(prev => ({ ...prev, taskCompleted: v }))}
            />
            <SwissToggle
              label="Task needs attention"
              description="Get notified when a task fails or needs input"
              checked={notifs.taskAttention}
              onChange={(v) => setNotifs(prev => ({ ...prev, taskAttention: v }))}
            />
            <SwissToggle
              label="System alerts"
              description="Important system status changes"
              checked={notifs.systemAlerts}
              onChange={(v) => setNotifs(prev => ({ ...prev, systemAlerts: v }))}
            />
          </div>
        </SwissCard>

        <div className="mt-swiss-4">
          <h4 className="text-swiss-sm font-medium text-[var(--swiss-text-secondary)] mb-swiss-2">
            Email Digest
          </h4>
          <SwissCard variant="default" size="md">
            <div className="flex flex-col sm:flex-row sm:items-center gap-swiss-2">
              <SwissRadio
                label="Off"
                name="email-digest"
                checked={notifs.emailDigest === 'off'}
                onChange={() => setNotifs(prev => ({ ...prev, emailDigest: 'off' }))}
              />
              <SwissRadio
                label="Daily"
                name="email-digest"
                checked={notifs.emailDigest === 'daily'}
                onChange={() => setNotifs(prev => ({ ...prev, emailDigest: 'daily' }))}
              />
              <SwissRadio
                label="Weekly"
                name="email-digest"
                checked={notifs.emailDigest === 'weekly'}
                onChange={() => setNotifs(prev => ({ ...prev, emailDigest: 'weekly' }))}
              />
            </div>
          </SwissCard>
        </div>
      </SwissSection>

      {/* Section 3: Danger Zone */}
      <SwissSection title="Danger Zone" spacing="default" divider>
        <SwissCard variant="outlined" size="md" className="border-swiss-error/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-swiss-sm font-medium text-[var(--swiss-text-primary)]">Sign out</p>
              <p className="text-swiss-xs text-[var(--swiss-text-tertiary)] mt-swiss-1">
                Sign out of your account on this device
              </p>
            </div>
            <SwissButton
              variant="danger"
              size="sm"
              icon={<LogOut size={14} />}
              onClick={() => signOut()}
            >
              Sign Out
            </SwissButton>
          </div>
        </SwissCard>
      </SwissSection>
    </div>
  )
}
