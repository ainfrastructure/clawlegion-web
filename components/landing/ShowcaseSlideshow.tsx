'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  LayoutGrid,
  Users,
  GitBranch,
  ChevronRight,
} from 'lucide-react'

/* ─── Slide data ─── */
type Slide = {
  id: string
  badge: string
  badgeIcon: React.ReactNode
  badgeColor: string
  headline: string
  headlineAccent: string
  subtitle: string
  accentFrom: string
  accentTo: string
  glowColor: string
  screenshot: string
}

const SLIDES: Slide[] = [
  {
    id: 'tasks',
    badge: 'Task Board',
    badgeIcon: <LayoutGrid className="w-3.5 h-3.5" />,
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    headline: 'Orchestrate',
    headlineAccent: 'Any Workflow',
    subtitle:
      'From content campaigns to compliance audits — create, assign, and track tasks across your entire AI workforce.',
    accentFrom: 'from-cyan-400',
    accentTo: 'to-blue-500',
    glowColor: 'rgb(34 211 238 / 0.12)',
    screenshot: '/showcase/tasks.png',
  },
  {
    id: 'organization',
    badge: 'Fleet Overview',
    badgeIcon: <Users className="w-3.5 h-3.5" />,
    badgeColor: 'text-red-400 bg-red-500/10 border-red-500/20',
    headline: 'Your AI Fleet,',
    headlineAccent: 'Organized',
    subtitle:
      'Visualize your entire agent hierarchy. See who\'s working on what and monitor performance in real time.',
    accentFrom: 'from-red-400',
    accentTo: 'to-red-600',
    glowColor: 'rgb(220 38 38 / 0.12)',
    screenshot: '/showcase/organization.png',
  },
  {
    id: 'flows',
    badge: 'Flow Builder',
    badgeIcon: <GitBranch className="w-3.5 h-3.5" />,
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    headline: 'Automate',
    headlineAccent: 'Multi-Agent Pipelines',
    subtitle:
      'Chain agents into powerful workflows. Design, customize, and deploy complex automations with a visual builder.',
    accentFrom: 'from-amber-400',
    accentTo: 'to-orange-500',
    glowColor: 'rgb(251 191 36 / 0.12)',
    screenshot: '/showcase/flows.png',
  },
]

const SLIDE_ICONS = [LayoutGrid, Users, GitBranch]
const PROGRESS_COLORS: [string, string][] = [
  ['#22d3ee', '#3b82f6'],
  ['#f87171', '#dc2626'],
  ['#fbbf24', '#f97316'],
]

const INTERVAL_MS = 5500

/* ─── Screenshot renderer ─── */

function ScreenContent({ slide }: { slide: Slide }) {
  return (
    <img
      src={slide.screenshot}
      alt={`${slide.badge} screenshot`}
      className="w-full h-full object-contain"
      loading="lazy"
      decoding="async"
    />
  )
}

/* ─── Main Component ─── */

export function ShowcaseSlideshow() {
  const [active, setActive] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > active ? 'next' : 'prev')
      setActive(index)
    },
    [active]
  )

  const next = useCallback(() => {
    setDirection('next')
    setActive((i) => (i + 1) % SLIDES.length)
  }, [])

  // Auto-rotate
  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(next, INTERVAL_MS)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPaused, next])

  // Reset progress animation on slide change
  useEffect(() => {
    const el = progressRef.current
    if (!el) return
    el.classList.remove('showcase-progress-animate')
    void el.offsetWidth
    if (!isPaused) {
      el.classList.add('showcase-progress-animate')
    }
  }, [active, isPaused])

  const slide = SLIDES[active]

  return (
    <section
      id="demo"
      className="relative px-4 sm:px-6 py-20 sm:py-28 border-t border-white/[0.04] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Ambient background glow keyed to active slide */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 40%, ${slide.glowColor}, transparent)`,
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            See the Platform
          </h2>
          <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto">
            A command center built for orchestrating autonomous AI agents at scale.
          </p>
        </div>

        {/* Main showcase area */}
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-8 lg:gap-12 items-center">
          {/* Left: Text content + nav */}
          <div className="order-2 lg:order-1">
            {/* Slide badge */}
            <div key={`badge-${slide.id}`} className="showcase-slide-enter">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium mb-5 ${slide.badgeColor}`}>
                {slide.badgeIcon}
                {slide.badge}
              </div>
            </div>

            {/* Headline */}
            <div key={`headline-${slide.id}`} className="showcase-slide-enter" style={{ animationDelay: '60ms' }}>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 tracking-tight leading-[1.15]">
                {slide.headline}{' '}
                <span className={`bg-gradient-to-r ${slide.accentFrom} ${slide.accentTo} bg-clip-text text-transparent`}>
                  {slide.headlineAccent}
                </span>
              </h3>
            </div>

            {/* Subtitle */}
            <div key={`subtitle-${slide.id}`} className="showcase-slide-enter" style={{ animationDelay: '120ms' }}>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-8 max-w-md">
                {slide.subtitle}
              </p>
            </div>

            {/* Slide navigation pills */}
            <div className="flex flex-col gap-2">
              {SLIDES.map((s, i) => {
                const Icon = SLIDE_ICONS[i]
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => goTo(i)}
                    className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                      i === active
                        ? 'bg-white/[0.06] border border-white/[0.1] shadow-lg'
                        : 'bg-transparent border border-transparent hover:bg-white/[0.03]'
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${
                        i === active
                          ? `bg-gradient-to-br ${s.accentFrom} ${s.accentTo} text-white shadow-md`
                          : 'bg-white/[0.04] text-slate-500'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-xs sm:text-sm font-semibold transition-colors ${
                          i === active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                        }`}
                      >
                        {s.badge}
                      </span>
                      {i === active && (
                        <div className="mt-1.5 h-[2px] rounded-full bg-white/10 overflow-hidden">
                          <div
                            ref={progressRef}
                            className="h-full rounded-full showcase-progress-bar"
                            style={{
                              backgroundImage: `linear-gradient(to right, ${PROGRESS_COLORS[i][0]}, ${PROGRESS_COLORS[i][1]})`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 transition-all duration-300 ${
                        i === active ? 'text-white/40 translate-x-0' : 'text-transparent -translate-x-1'
                      }`}
                    />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right: Screenshot / mock */}
          <div className="order-1 lg:order-2 relative">
            {/* Outer glass frame */}
            <div className="relative rounded-2xl overflow-hidden glass-gradient-border">
              {/* Frosted glass border frame */}
              <div className="p-1.5 sm:p-2 bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl">
                {/* Window chrome bar */}
                <div className="flex items-center gap-2 px-3 py-2 mb-1.5 sm:mb-2">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-yellow-500/60" />
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 sm:px-6 py-0.5 sm:py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-[9px] sm:text-[10px] text-slate-500 font-mono">
                      app.clawlegion.com
                    </div>
                  </div>
                  <div className="w-12 sm:w-16" />
                </div>

                {/* Screenshot content area */}
                <div className="relative overflow-hidden rounded-lg sm:rounded-xl" style={{ aspectRatio: '16 / 10' }}>
                  {SLIDES.map((s, i) => (
                    <div
                      key={s.id}
                      className={`absolute inset-0 transition-all duration-700 ease-out ${
                        i === active
                          ? 'opacity-100 scale-100 translate-x-0'
                          : i < active || (active === 0 && i === SLIDES.length - 1 && direction === 'next')
                            ? 'opacity-0 scale-[0.97] -translate-x-4'
                            : 'opacity-0 scale-[0.97] translate-x-4'
                      }`}
                      aria-hidden={i !== active}
                    >
                      <ScreenContent slide={s} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Decorative glow behind the frame */}
            <div
              className="absolute -inset-8 -z-10 rounded-3xl blur-3xl transition-all duration-1000"
              style={{ background: slide.glowColor }}
            />
          </div>
        </div>

        {/* Bottom dots for mobile */}
        <div className="flex lg:hidden justify-center gap-2 mt-8">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === active ? 'w-8 bg-white/60' : 'w-1.5 bg-white/20'
              }`}
              aria-label={`Go to ${s.badge}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
