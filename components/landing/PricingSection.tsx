'use client'

import { Check, Shield, Clock, Lock, ArrowRight, Loader2, CheckCircle } from 'lucide-react'
import { CountdownTimer } from './CountdownTimer'
import { useEarlyAccessForm } from '@/hooks/useEarlyAccessForm'
import { LAUNCH_CONFIG } from '@/lib/launch-config'

const valueItems = [
  'Unlimited custom agents',
  'Visual flow builder — design any workflow',
  'Smart task routing & parallel execution',
  'Agent-to-agent coordination',
  'Live dashboard & session replay',
  'Bring your own API keys',
  'Platform integrations (social, messaging, more)',
  '1-on-1 mentoring & hands-on setup',
  'All future features included',
]

export function PricingSection() {
  const { email, setEmail, status, errorMessage, handleSubmit } = useEarlyAccessForm('pricing')

  return (
    <section id="pricing" className="px-4 sm:px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            One plan. Unlimited agents. Infinite workflows.
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Early access includes 1-on-1 mentoring and hands-on setup. Limited spots available.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Value stack */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-6">Everything included:</h3>
            {valueItems.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">{item}</span>
              </div>
            ))}
            <div className="pt-4 mt-4 border-t border-white/10">
              <p className="text-slate-500 text-sm">
                Total value: <span className="text-white font-semibold">${LAUNCH_CONFIG.originalPrice}/mo</span>
              </p>
            </div>
          </div>

          {/* Right: Pricing card */}
          <div className="relative glass-3 rounded-2xl p-8 border border-blue-500/20 shadow-xl shadow-blue-500/5">
            {/* Glow border effect */}
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-blue-500/20 to-purple-500/20 -z-10 blur-sm" />

            {/* Save badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/15 border border-green-500/25 rounded-full text-green-400 text-sm font-medium mb-6">
              Save {LAUNCH_CONFIG.discount}%
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold text-white">${LAUNCH_CONFIG.earlyBirdPrice}</span>
                <span className="text-slate-400">/mo</span>
              </div>
              <div className="mt-1">
                <span className="text-slate-500 line-through text-lg">${LAUNCH_CONFIG.originalPrice}/mo</span>
              </div>
            </div>

            {/* Countdown */}
            <div className="mb-6">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Price increases in:</p>
              <CountdownTimer variant="large" />
            </div>

            {/* Email form */}
            {status === 'success' ? (
              <div className="flex items-center justify-center gap-3 px-6 py-4 glass-2 rounded-xl text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">You&apos;re on the list!</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full px-4 py-3 glass-2 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full px-6 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 text-sm shimmer-btn"
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
              <p className="mt-3 text-sm text-red-400 text-center">{errorMessage}</p>
            )}

            {/* Trust signals */}
            <div className="mt-6 grid grid-cols-3 gap-2">
              {[
                { icon: Shield, text: '30-day guarantee' },
                { icon: Clock, text: 'Cancel anytime' },
                { icon: Lock, text: 'Secure checkout' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-1.5 text-center">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span className="text-[11px] text-slate-500">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
