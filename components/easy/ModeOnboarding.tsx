/**
 * ModeOnboarding — First-visit mode selector
 *
 * Shows once on first visit (no localStorage value set).
 * After selection, never shows again.
 */
'use client'

import { useState, useEffect } from 'react'
import { useSidebar } from '@/components/layout/SidebarContext'
import { Eye, Zap } from 'lucide-react'
import { clsx } from 'clsx'

const ONBOARDING_KEY = 'clawlegion-mode-onboarded'

export function ModeOnboarding() {
  const [show, setShow] = useState(false)
  const { setUIMode } = useSidebar()

  useEffect(() => {
    // Only show if user hasn't been onboarded and no mode preference exists
    const onboarded = localStorage.getItem(ONBOARDING_KEY)
    const modeSet = localStorage.getItem('clawlegion-ui-mode')
    if (!onboarded && !modeSet) {
      setShow(true)
    }
  }, [])

  const selectMode = (mode: 'easy' | 'power') => {
    setUIMode(mode)
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-[480px] mx-swiss-4 animate-swiss-scale-in">
        <div className="bg-[var(--swiss-surface)] border border-[var(--swiss-border)] rounded-swiss-md p-swiss-8">
          {/* Header */}
          <div className="text-center mb-swiss-8">
            <h1 className="text-swiss-2xl font-bold text-[var(--swiss-text-primary)]">
              Welcome to ClawLegion
            </h1>
            <p className="text-swiss-sm text-[var(--swiss-text-secondary)] mt-swiss-2">
              Choose your interface mode. You can always switch later.
            </p>
          </div>

          {/* Mode cards */}
          <div className="grid grid-cols-2 gap-swiss-4">
            {/* Easy Mode */}
            <button
              onClick={() => selectMode('easy')}
              className={clsx(
                'text-left p-swiss-6 rounded-swiss-md border-2',
                'border-[var(--swiss-border)] hover:border-[var(--swiss-accent)]',
                'bg-[var(--swiss-surface)] hover:bg-[var(--swiss-surface-raised)]',
                'transition-all duration-swiss ease-swiss',
                'focus-visible:outline-2 focus-visible:outline-[var(--swiss-accent)] focus-visible:outline-offset-2',
                'group',
              )}
            >
              <div className="flex items-center gap-swiss-2 mb-swiss-3">
                <Eye
                  size={20}
                  className="text-[var(--swiss-accent)] group-hover:scale-110 transition-transform duration-swiss"
                />
                <span className="text-swiss-lg font-semibold text-[var(--swiss-text-primary)]">
                  Easy
                </span>
              </div>
              <p className="text-swiss-xs text-[var(--swiss-text-tertiary)]">
                Clean, simple interface. See what matters — tasks, team, and activity.
              </p>
            </button>

            {/* Power Mode */}
            <button
              onClick={() => selectMode('power')}
              className={clsx(
                'text-left p-swiss-6 rounded-swiss-md border-2',
                'border-[var(--swiss-border)] hover:border-amber-500',
                'bg-[var(--swiss-surface)] hover:bg-[var(--swiss-surface-raised)]',
                'transition-all duration-swiss ease-swiss',
                'focus-visible:outline-2 focus-visible:outline-amber-500 focus-visible:outline-offset-2',
                'group',
              )}
            >
              <div className="flex items-center gap-swiss-2 mb-swiss-3">
                <Zap
                  size={20}
                  className="text-amber-400 group-hover:scale-110 transition-transform duration-swiss"
                />
                <span className="text-swiss-lg font-semibold text-[var(--swiss-text-primary)]">
                  Power
                </span>
              </div>
              <p className="text-swiss-xs text-[var(--swiss-text-tertiary)]">
                Full control. Kanban boards, agent configs, flows, and more.
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
