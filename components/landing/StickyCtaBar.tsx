'use client'

import { useState, useEffect } from 'react'
import { X, ArrowRight, Loader2 } from 'lucide-react'
import { CountdownTimer } from './CountdownTimer'
import { useEarlyAccessForm } from '@/hooks/useEarlyAccessForm'
import { LAUNCH_CONFIG } from '@/lib/launch-config'

const DISMISS_KEY = 'sticky-cta-dismissed'

export function StickyCtaBar() {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const { email, setEmail, status, handleSubmit } = useEarlyAccessForm('sticky-bar')

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) {
      setDismissed(true)
      return
    }

    const onScroll = () => {
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)
      setVisible(scrollPercent > 0.6)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const dismiss = () => {
    setDismissed(true)
    sessionStorage.setItem(DISMISS_KEY, '1')
  }

  if (dismissed || !visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-2 border-t border-white/[0.08] shadow-2xl shadow-black/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Price anchor */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-white font-bold text-lg">Free Beta</span>
            <span className="text-amber-400 text-sm font-medium">Limited Spots</span>
            <span className="hidden sm:inline">
              <CountdownTimer variant="compact" />
            </span>
          </div>

          {/* Desktop: inline email form */}
          <form onSubmit={handleSubmit} className="hidden md:flex items-center gap-2 flex-1 max-w-md">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="flex-1 px-3 py-2 glass-2 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-lg font-semibold transition-colors flex items-center gap-1.5 text-sm whitespace-nowrap shimmer-btn"
            >
              {status === 'loading' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Join Beta
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Mobile: scroll to pricing */}
          <a
            href="#pricing"
            className="md:hidden px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors text-sm whitespace-nowrap shimmer-btn"
          >
            Join Beta
          </a>

          {/* Dismiss */}
          <button
            onClick={dismiss}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {status === 'success' && (
          <p className="text-sm text-green-400 text-center mt-2">You&apos;re on the list!</p>
        )}
      </div>
    </div>
  )
}
