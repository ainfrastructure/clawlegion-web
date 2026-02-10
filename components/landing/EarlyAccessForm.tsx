'use client'

import { ArrowRight, CheckCircle, Loader2 } from 'lucide-react'
import { CountdownTimer } from './CountdownTimer'
import { useEarlyAccessForm } from '@/hooks/useEarlyAccessForm'
import { LAUNCH_CONFIG } from '@/lib/launch-config'

export function EarlyAccessForm() {
  const { email, setEmail, status, errorMessage, handleSubmit } = useEarlyAccessForm('footer')

  return (
    <section id="early-access" className="relative px-4 sm:px-6 py-24 overflow-hidden">
      {/* Enhanced ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-500/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
          Don&apos;t Miss the Launch Price
        </h2>
        <p className="text-lg text-slate-400 mb-4">
          Early access at ${LAUNCH_CONFIG.earlyBirdPrice}/mo — limited spots at this rate.
          Get in now before we raise pricing.
        </p>

        {/* Compact countdown */}
        <div className="flex items-center justify-center gap-2 text-sm text-slate-400 mb-8">
          <span>Offer ends in:</span>
          <CountdownTimer variant="compact" />
        </div>

        {status === 'success' ? (
          <div className="inline-flex items-center gap-3 px-6 py-4 glass-2 rounded-xl text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">You&apos;re on the list! We&apos;ll be in touch.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="flex-1 px-4 py-3 glass-2 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 text-sm whitespace-nowrap shimmer-btn"
            >
              {status === 'loading' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {LAUNCH_CONFIG.ctaText}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="mt-3 text-sm text-red-400">{errorMessage}</p>
        )}

        {/* Trust microcopy */}
        <p className="mt-4 text-xs text-slate-500">{LAUNCH_CONFIG.guaranteeText}</p>
      </div>
    </section>
  )
}
