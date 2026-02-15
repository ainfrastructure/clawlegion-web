'use client'

import { ArrowRight, Loader2, CheckCircle } from 'lucide-react'
import { useEarlyAccessForm } from '@/hooks/useEarlyAccessForm'
import { LAUNCH_CONFIG } from '@/lib/launch-config'

export function EarlyAccessFormClient() {
  const { email, setEmail, status, errorMessage, handleSubmit } = useEarlyAccessForm('hero')

  return (
    <>
      {status === 'success' ? (
        <div className="inline-flex items-center gap-3 px-6 py-4 glass-2 rounded-xl text-green-400 mb-4">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">You&apos;re on the list! We&apos;ll be in touch.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            className="flex-1 px-4 py-3.5 glass-2 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-6 py-3.5 bg-red-600 hover:bg-red-500 disabled:bg-red-600/50 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 text-sm whitespace-nowrap shimmer-btn"
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
        <p className="text-sm text-red-400 mb-4">{errorMessage}</p>
      )}
    </>
  )
}
