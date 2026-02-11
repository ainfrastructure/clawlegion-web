'use client'

import { ArrowRight, Eye, Loader2, CheckCircle } from 'lucide-react'
import { MascotHero } from './MascotHero'
import { useEarlyAccessForm } from '@/hooks/useEarlyAccessForm'
import { LAUNCH_CONFIG } from '@/lib/launch-config'

export function HeroSection() {
  const { email, setEmail, status, errorMessage, handleSubmit } = useEarlyAccessForm('hero')

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-16 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 landing-grid-bg" />

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Mascot */}
        <div className="relative mb-6 flex justify-center">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 bg-blue-500/15 rounded-full blur-[80px]" />
          </div>
          <MascotHero />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <span className="text-sm font-medium text-amber-300">{LAUNCH_CONFIG.badgeText}</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
          <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            AI Legion
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-6 leading-relaxed">
          Your autonomous AI workforce. Code. Content. Compliance. One command center.
        </p>

        {/* Price anchor */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="text-slate-500 line-through text-lg">${LAUNCH_CONFIG.originalPrice}/mo</span>
          <span className="text-3xl font-bold text-white">${LAUNCH_CONFIG.earlyBirdPrice}/mo</span>
          <span className="px-2.5 py-1 bg-green-500/15 border border-green-500/25 rounded-full text-green-400 text-sm font-medium">
            Save {LAUNCH_CONFIG.discount}%
          </span>
        </div>

        {/* Email form CTA */}
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
              className="flex-1 px-4 py-3.5 glass-2 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 text-sm whitespace-nowrap shimmer-btn"
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

        {/* Microcopy */}
        <p className="text-xs text-slate-500 mb-4">{LAUNCH_CONFIG.guaranteeText}</p>

        {/* Watch demo link */}
        <a
          href="#demo"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <Eye className="w-4 h-4" />
          See the Platform
        </a>
      </div>
    </section>
  )
}
