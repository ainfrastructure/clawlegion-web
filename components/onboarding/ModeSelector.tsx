'use client'

import { useState, useEffect } from 'react'
import { useSidebar } from '@/components/layout/SidebarContext'

const ONBOARDING_KEY = 'clawlegion-has-seen-onboarding'

export function ModeSelector({ onComplete }: { onComplete?: () => void }) {
  const { setUIMode } = useSidebar()
  const [selected, setSelected] = useState<'easy' | 'power' | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem(ONBOARDING_KEY)
    if (!hasSeenOnboarding) {
      setVisible(true)
    }
  }, [])

  const handleSelect = (mode: 'easy' | 'power') => {
    setSelected(mode)
    setUIMode(mode)
    localStorage.setItem(ONBOARDING_KEY, 'true')

    // Persist to server (fire-and-forget)
    fetch('/api/profile/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uiMode: mode }),
    }).catch(() => {
      // Server persistence is best-effort
    })

    // Brief delay then close
    setTimeout(() => {
      setVisible(false)
      onComplete?.()
    }, 400)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300">
      <div className="w-full max-w-2xl mx-4 animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to ClawLegion</h1>
          <p className="text-slate-400 text-lg">Choose your interface mode to get started</p>
        </div>

        {/* Mode Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Easy Mode Card */}
          <button
            onClick={() => handleSelect('easy')}
            className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
              selected === 'easy'
                ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20 scale-[1.02]'
                : 'border-white/[0.08] glass-2 hover:border-blue-500/40 hover:bg-blue-500/[0.04]'
            }`}
          >
            <div className="text-4xl mb-4">✨</div>
            <h2 className="text-xl font-bold text-white mb-1">Easy Mode</h2>
            <p className="text-sm font-medium text-blue-400 mb-3">Simple interface</p>
            <p className="text-sm text-slate-400 leading-relaxed">
              Clean dashboard, streamlined navigation, and simplified controls.
              Perfect if you are new to AI agents.
            </p>
            {selected === 'easy' && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center transition-transform duration-200 scale-100">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>

          {/* Power Mode Card */}
          <button
            onClick={() => handleSelect('power')}
            className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
              selected === 'power'
                ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20 scale-[1.02]'
                : 'border-white/[0.08] glass-2 hover:border-amber-500/40 hover:bg-amber-500/[0.04]'
            }`}
          >
            <div className="text-4xl mb-4">⚡</div>
            <h2 className="text-xl font-bold text-white mb-1">Power Mode</h2>
            <p className="text-sm font-medium text-amber-400 mb-3">Full control</p>
            <p className="text-sm text-slate-400 leading-relaxed">
              Advanced dashboards, detailed metrics, full agent control, and all configuration options.
              For developers and power users.
            </p>
            {selected === 'power' && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center transition-transform duration-200 scale-100">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-slate-500 mt-6">
          You can switch anytime from the sidebar or Settings
        </p>
      </div>
    </div>
  )
}

/**
 * Hook to check if onboarding should be shown.
 * Returns true if user hasn't seen onboarding yet.
 */
export function useNeedsOnboarding(): boolean {
  const [needs, setNeeds] = useState(false)

  useEffect(() => {
    const hasSeen = localStorage.getItem(ONBOARDING_KEY)
    setNeeds(!hasSeen)
  }, [])

  return needs
}
