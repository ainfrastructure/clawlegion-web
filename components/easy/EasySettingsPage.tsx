/**
 * EasySettingsPage — Simplified settings for Easy Mode
 *
 * Only 3 sections: Appearance, Notifications, Danger Zone.
 * No API keys, no integrations, no developer settings.
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { PageContainer } from '@/components/layout'
import { useSidebar } from '@/components/layout/SidebarContext'
import {
  SwissHeader,
  SwissCard,
  SwissSection,
  SwissButton,
  SwissModal,
} from '@/components/swiss'
import { Moon, Sun, Zap, Eye, Bell, LogOut, Trash2 } from 'lucide-react'
import { clsx } from 'clsx'

// ─── Theme Toggle ───
function useTheme() {
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const isDark = stored === 'dark' || (!stored && document.documentElement.classList.contains('dark'))
    setThemeState(isDark ? 'dark' : 'light')
  }, [])

  const setTheme = useCallback((t: 'dark' | 'light') => {
    setThemeState(t)
    localStorage.setItem('theme', t)
    if (t === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return { theme, setTheme }
}

// ─── Notification Preferences ───
function useNotifications() {
  const [prefs, setPrefs] = useState({
    taskUpdates: true,
    agentStatus: true,
    systemAlerts: true,
  })

  useEffect(() => {
    const stored = localStorage.getItem('clawlegion-notifications')
    if (stored) {
      try {
        setPrefs(JSON.parse(stored))
      } catch { /* ignore */ }
    }
  }, [])

  const toggle = useCallback((key: keyof typeof prefs) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      localStorage.setItem('clawlegion-notifications', JSON.stringify(next))
      return next
    })
  }, [])

  return { prefs, toggle }
}

// ─── Toggle Component ───
function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: () => void
  label: string
  description?: string
}) {
  return (
    <div className="flex items-center justify-between py-swiss-3">
      <div className="flex-1 min-w-0 mr-swiss-4">
        <p className="text-swiss-sm font-medium text-[var(--swiss-text-primary)]">{label}</p>
        {description && (
          <p className="text-swiss-xs text-[var(--swiss-text-tertiary)] mt-swiss-1">
            {description}
          </p>
        )}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={clsx(
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent',
          'transition-colors duration-swiss ease-swiss',
          'focus-visible:outline-2 focus-visible:outline-[var(--swiss-accent)] focus-visible:outline-offset-2',
          checked ? 'bg-[var(--swiss-accent)]' : 'bg-[var(--swiss-surface-raised)]',
        )}
      >
        <span
          className={clsx(
            'pointer-events-none inline-block h-5 w-5 rounded-full shadow',
            'transition-transform duration-swiss ease-swiss',
            'bg-white',
            checked ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </button>
    </div>
  )
}

export function EasySettingsPage() {
  const { theme, setTheme } = useTheme()
  const { uiMode, toggleUIMode } = useSidebar()
  const { prefs, toggle } = useNotifications()
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)

  return (
    <PageContainer>
      <div className="space-y-swiss-8 max-w-[640px]">
        <SwissHeader title="Settings" />

        {/* ─── Appearance ─── */}
        <SwissSection title="Appearance" description="Customize how the interface looks">
          <SwissCard variant="default">
            <div className="space-y-swiss-2 divide-y divide-[var(--swiss-border-subtle)]">
              {/* Theme */}
              <div className="flex items-center justify-between py-swiss-3">
                <div className="flex-1 min-w-0 mr-swiss-4">
                  <p className="text-swiss-sm font-medium text-[var(--swiss-text-primary)]">Theme</p>
                  <p className="text-swiss-xs text-[var(--swiss-text-tertiary)] mt-swiss-1">
                    Switch between dark and light mode
                  </p>
                </div>
                <div className="flex items-center gap-swiss-1 bg-[var(--swiss-surface-raised)] rounded-swiss-sm p-swiss-1">
                  <button
                    onClick={() => setTheme('dark')}
                    aria-label="Dark theme"
                    className={clsx(
                      'p-swiss-2 rounded-swiss-sm transition-colors duration-swiss',
                      'focus-visible:outline-2 focus-visible:outline-[var(--swiss-accent)]',
                      theme === 'dark'
                        ? 'bg-[var(--swiss-surface)] text-[var(--swiss-text-primary)] shadow-swiss-sm'
                        : 'text-[var(--swiss-text-muted)] hover:text-[var(--swiss-text-secondary)]',
                    )}
                  >
                    <Moon size={16} />
                  </button>
                  <button
                    onClick={() => setTheme('light')}
                    aria-label="Light theme"
                    className={clsx(
                      'p-swiss-2 rounded-swiss-sm transition-colors duration-swiss',
                      'focus-visible:outline-2 focus-visible:outline-[var(--swiss-accent)]',
                      theme === 'light'
                        ? 'bg-[var(--swiss-surface)] text-[var(--swiss-text-primary)] shadow-swiss-sm'
                        : 'text-[var(--swiss-text-muted)] hover:text-[var(--swiss-text-secondary)]',
                    )}
                  >
                    <Sun size={16} />
                  </button>
                </div>
              </div>

              {/* Mode */}
              <div className="flex items-center justify-between py-swiss-3">
                <div className="flex-1 min-w-0 mr-swiss-4">
                  <p className="text-swiss-sm font-medium text-[var(--swiss-text-primary)]">Interface Mode</p>
                  <p className="text-swiss-xs text-[var(--swiss-text-tertiary)] mt-swiss-1">
                    Easy shows a simplified view. Power shows all controls.
                  </p>
                </div>
                <div className="flex items-center gap-swiss-1 bg-[var(--swiss-surface-raised)] rounded-swiss-sm p-swiss-1">
                  <button
                    onClick={() => { if (uiMode !== 'easy') toggleUIMode() }}
                    className={clsx(
                      'flex items-center gap-swiss-2 px-swiss-3 py-swiss-2 rounded-swiss-sm text-swiss-xs font-medium transition-colors duration-swiss',
                      'focus-visible:outline-2 focus-visible:outline-[var(--swiss-accent)]',
                      uiMode === 'easy'
                        ? 'bg-[var(--swiss-surface)] text-[var(--swiss-accent)] shadow-swiss-sm'
                        : 'text-[var(--swiss-text-muted)] hover:text-[var(--swiss-text-secondary)]',
                    )}
                  >
                    <Eye size={14} />
                    Easy
                  </button>
                  <button
                    onClick={() => { if (uiMode !== 'power') toggleUIMode() }}
                    className={clsx(
                      'flex items-center gap-swiss-2 px-swiss-3 py-swiss-2 rounded-swiss-sm text-swiss-xs font-medium transition-colors duration-swiss',
                      'focus-visible:outline-2 focus-visible:outline-[var(--swiss-accent)]',
                      uiMode === 'power'
                        ? 'bg-[var(--swiss-surface)] text-amber-400 shadow-swiss-sm'
                        : 'text-[var(--swiss-text-muted)] hover:text-[var(--swiss-text-secondary)]',
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

        {/* ─── Notifications ─── */}
        <SwissSection title="Notifications" description="Choose what you get notified about">
          <SwissCard variant="default">
            <div className="divide-y divide-[var(--swiss-border-subtle)]">
              <ToggleSwitch
                checked={prefs.taskUpdates}
                onChange={() => toggle('taskUpdates')}
                label="Task updates"
                description="When tasks are created, completed, or need attention"
              />
              <ToggleSwitch
                checked={prefs.agentStatus}
                onChange={() => toggle('agentStatus')}
                label="Agent status changes"
                description="When agents come online, go idle, or encounter errors"
              />
              <ToggleSwitch
                checked={prefs.systemAlerts}
                onChange={() => toggle('systemAlerts')}
                label="System alerts"
                description="Important system health and security notifications"
              />
            </div>
          </SwissCard>
        </SwissSection>

        {/* ─── Danger Zone ─── */}
        <SwissSection title="Danger Zone" description="Irreversible actions">
          <SwissCard variant="default" accent="red">
            <div className="space-y-swiss-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 mr-swiss-4">
                  <p className="text-swiss-sm font-medium text-[var(--swiss-text-primary)]">Sign out</p>
                  <p className="text-swiss-xs text-[var(--swiss-text-tertiary)]">
                    End your current session
                  </p>
                </div>
                <SwissButton
                  variant="danger"
                  size="sm"
                  icon={<LogOut size={14} />}
                  onClick={() => setShowSignOutConfirm(true)}
                >
                  Sign Out
                </SwissButton>
              </div>
            </div>
          </SwissCard>
        </SwissSection>
      </div>

      {/* Sign Out Confirmation */}
      <SwissModal
        open={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        title="Sign out?"
        size="sm"
        footer={
          <>
            <SwissButton
              variant="secondary"
              size="sm"
              onClick={() => setShowSignOutConfirm(false)}
            >
              Cancel
            </SwissButton>
            <SwissButton
              variant="danger"
              size="sm"
              onClick={() => {
                // Sign out logic
                window.location.href = '/login'
              }}
            >
              Sign Out
            </SwissButton>
          </>
        }
      >
        <p className="text-swiss-sm text-[var(--swiss-text-secondary)]">
          Are you sure you want to sign out? You&apos;ll need to log in again to access the dashboard.
        </p>
      </SwissModal>
    </PageContainer>
  )
}
