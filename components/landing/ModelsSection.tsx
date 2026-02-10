'use client'

import { Brain, Cloud, Zap, Shuffle, ChevronRight } from 'lucide-react'

type Provider = {
  name: string
  models: string[]
  hex: string
  icon: typeof Brain
}

const modelProviders: Provider[] = [
  {
    name: 'Anthropic',
    models: ['Claude Opus', 'Sonnet', 'Haiku'],
    hex: '#F97316',
    icon: Brain,
  },
  {
    name: 'OpenAI',
    models: ['GPT-5.2', 'Codex', 'o3'],
    hex: '#10B981',
    icon: Zap,
  },
  {
    name: 'Google',
    models: ['Gemini 2.5 Pro', 'Flash'],
    hex: '#3B82F6',
    icon: Cloud,
  },
  {
    name: 'DeepSeek',
    models: ['V3', 'R1'],
    hex: '#06B6D4',
    icon: Brain,
  },
]

const keyPoints = [
  {
    title: 'Model-agnostic',
    text: 'Not locked to one provider — switch freely between any model',
    icon: Shuffle,
    hex: '#06B6D4',
  },
  {
    title: 'Mix per task',
    text: 'Opus for complex reasoning, Sonnet for speed — per agent, per task',
    icon: Zap,
    hex: '#F59E0B',
  },
]

function ProviderCard({ provider }: { provider: Provider }) {
  const Icon = provider.icon
  return (
    <div
      className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
    >
      {/* Ambient glow — bleeds through from below */}
      <div
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-12 rounded-full blur-2xl opacity-15 group-hover:opacity-35 transition-opacity duration-500"
        style={{ backgroundColor: provider.hex }}
      />

      {/* Top edge highlight */}
      <div
        className="absolute top-0 inset-x-0 h-px opacity-0 group-hover:opacity-60 transition-opacity duration-500"
        style={{ background: `linear-gradient(to right, transparent, ${provider.hex}, transparent)` }}
      />

      {/* Glass card body */}
      <div className="relative backdrop-blur-md bg-white/[0.03] border border-white/[0.06] group-hover:border-white/[0.12] group-hover:bg-white/[0.06] rounded-2xl p-5 transition-all duration-300">
        {/* Inner refraction highlight */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${provider.hex}08 0%, transparent 70%)`,
          }}
        />

        <div className="relative flex flex-col items-center text-center gap-3">
          {/* Icon container with glass + glow ring */}
          <div className="relative">
            <div
              className="absolute inset-0 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-300 scale-125"
              style={{ backgroundColor: provider.hex }}
            />
            <div
              className="relative w-11 h-11 rounded-xl flex items-center justify-center ring-1 ring-white/[0.08] group-hover:ring-white/[0.15] transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${provider.hex}30, ${provider.hex}10)`,
              }}
            >
              <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" style={{ color: provider.hex }} />
            </div>
          </div>

          {/* Text */}
          <div>
            <h3 className="text-[13px] font-semibold text-slate-100 mb-0.5 tracking-tight">
              {provider.name}
            </h3>
            <p className="text-[11px] text-slate-500 group-hover:text-slate-400 transition-colors duration-300 leading-relaxed">
              {provider.models.join(', ')}
            </p>
          </div>
        </div>

        {/* Bottom accent bar */}
        <div
          className="absolute bottom-0 inset-x-0 h-[2px] opacity-30 group-hover:opacity-70 transition-opacity duration-500"
          style={{
            background: `linear-gradient(to right, transparent, ${provider.hex}, transparent)`,
          }}
        />
      </div>
    </div>
  )
}

export function ModelsSection() {
  return (
    <section className="px-4 sm:px-6 pt-24 pb-32 relative">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">
              Multi-Provider
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Powered by the AI Models of Your Choosing
          </h2>
          <p className="text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Anthropic, OpenAI, Google, DeepSeek, Mistral, Meta, and many more.
            <br className="hidden sm:block" />
            Use any model. Switch freely. Your agents run on what works best.
          </p>
        </div>

        {/* Provider grid — 4 cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-16">
          {modelProviders.map((provider) => (
            <ProviderCard key={provider.name} provider={provider} />
          ))}
        </div>

        {/* Why This Matters — same card height as provider cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {keyPoints.map((point, index) => {
            const PointIcon = point.icon
            return (
              <div
                key={index}
                className="group/kp relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
              >
                {/* Ambient glow */}
                <div
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-12 rounded-full blur-2xl opacity-15 group-hover/kp:opacity-35 transition-opacity duration-500"
                  style={{ backgroundColor: point.hex }}
                />

                {/* Top edge highlight */}
                <div
                  className="absolute top-0 inset-x-0 h-px opacity-0 group-hover/kp:opacity-60 transition-opacity duration-500"
                  style={{ background: `linear-gradient(to right, transparent, ${point.hex}, transparent)` }}
                />

                <div className="relative backdrop-blur-md bg-white/[0.03] border border-white/[0.06] group-hover/kp:border-white/[0.12] group-hover/kp:bg-white/[0.06] rounded-2xl p-5 h-full transition-all duration-300">
                  {/* Inner refraction */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover/kp:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse at 50% 0%, ${point.hex}08 0%, transparent 70%)`,
                    }}
                  />

                  <div className="relative flex flex-col items-center text-center gap-3">
                    {/* Icon container — same style as provider cards */}
                    <div className="relative">
                      <div
                        className="absolute inset-0 rounded-xl blur-md opacity-20 group-hover/kp:opacity-40 transition-opacity duration-300 scale-125"
                        style={{ backgroundColor: point.hex }}
                      />
                      <div
                        className="relative w-11 h-11 rounded-xl flex items-center justify-center ring-1 ring-white/[0.08] group-hover/kp:ring-white/[0.15] transition-all duration-300"
                        style={{
                          background: `linear-gradient(135deg, ${point.hex}30, ${point.hex}10)`,
                        }}
                      >
                        <PointIcon
                          className="w-5 h-5 transition-transform duration-300 group-hover/kp:scale-110"
                          style={{ color: point.hex }}
                        />
                      </div>
                    </div>

                    {/* Text */}
                    <div>
                      <h3 className="text-[13px] font-semibold text-slate-100 mb-0.5 tracking-tight">
                        {point.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 group-hover/kp:text-slate-400 leading-relaxed transition-colors duration-300">
                        {point.text}
                      </p>
                    </div>
                  </div>

                  {/* Bottom accent bar */}
                  <div
                    className="absolute bottom-0 inset-x-0 h-[2px] opacity-30 group-hover/kp:opacity-70 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(to right, transparent, ${point.hex}, transparent)`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
