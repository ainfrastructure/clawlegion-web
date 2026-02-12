import { Eye } from 'lucide-react'
import { MascotHero } from './MascotHero'
import { EarlyAccessFormClient } from './EarlyAccessFormClient'
import { LAUNCH_CONFIG } from '@/lib/launch-config'

export function HeroSection() {
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
        <div className="relative mb-2 flex justify-center">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 bg-blue-500/15 rounded-full blur-[80px]" />
          </div>
          <MascotHero />
        </div>

        {/* Headline — Logo (pre-optimized WebP) */}
        <div className="mb-6 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/optimized/agents/logo-640w.webp"
            srcSet="/optimized/agents/logo-384w.webp 384w, /optimized/agents/logo-640w.webp 640w, /optimized/agents/logo-1080w.webp 1080w"
            sizes="(max-width: 640px) 384px, 500px"
            alt="ClawLegion"
            width={500}
            height={115}
            className="object-contain"
            fetchPriority="high"
            decoding="async"
          />
        </div>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-6 leading-relaxed">
          Your autonomous AI workforce. Code. Content. Compliance. One command center.
        </p>

        {/* Price */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="text-3xl font-bold text-white">${LAUNCH_CONFIG.earlyBirdPrice}/mo</span>
          <span className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/25 rounded-full text-amber-400 text-sm font-medium">
            Limited Spots
          </span>
        </div>

        {/* Email form CTA — client island */}
        <EarlyAccessFormClient />

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
