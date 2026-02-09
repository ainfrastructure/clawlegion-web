'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, XCircle, RotateCcw, GitMerge, ChevronRight } from 'lucide-react'
import Image from 'next/image'

/* ─── Agent data ─── */
const AGENTS = [
  {
    id: 'archie',
    name: 'Archie',
    role: 'Planner',
    color: '#3B82F6',
    avatar: '/agents/archie.svg',
    avatarType: 'svg' as const,
    description: 'Decomposes tasks into implementation plans',
  },
  {
    id: 'scout',
    name: 'Scout',
    role: 'Researcher',
    color: '#06B6D4',
    avatar: '/agents/scout-researcher.png',
    avatarType: 'png' as const,
    description: 'Investigates APIs & technical discovery',
  },
  {
    id: 'mason',
    name: 'Mason',
    role: 'Builder',
    color: '#F59E0B',
    avatar: '/agents/builder.svg',
    avatarType: 'svg' as const,
    description: 'Implements code & constructs features',
  },
  {
    id: 'vex',
    name: 'Vex',
    role: 'Verifier',
    color: '#8B5CF6',
    avatar: '/agents/verifier.svg',
    avatarType: 'svg' as const,
    description: 'Runtime verification with visual proof',
  },
]

const JARVIS = {
  id: 'jarvis',
  name: 'Jarvis',
  role: 'Orchestrator',
  color: '#DC2626',
  avatar: '/agents/jarvis-lobster.svg',
  description: 'Routes tasks & manages the pipeline',
}

/* ─── Sub-components ─── */

function OrchestratorCard({ visible }: { visible: boolean }) {
  return (
    <div
      className={`relative flex flex-col items-center transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'
      }`}
    >
      <div
        className="glass-2 rounded-2xl p-5 flex items-center gap-4 animate-card-breathe w-full max-w-xs"
        style={{
          boxShadow: `0 0 24px -4px ${JARVIS.color}33, 0 0 8px -2px ${JARVIS.color}22`,
          borderColor: `${JARVIS.color}30`,
        }}
      >
        <div
          className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
          style={{ background: `${JARVIS.color}18` }}
        >
          <Image
            src={JARVIS.avatar}
            alt={JARVIS.name}
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm">{JARVIS.name}</span>
            <span
              className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ color: JARVIS.color, background: `${JARVIS.color}18` }}
            >
              {JARVIS.role}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">{JARVIS.description}</p>
        </div>
      </div>
    </div>
  )
}

function OversightLine({ visible }: { visible: boolean }) {
  return (
    <div
      className={`flex justify-center py-3 transition-all duration-500 delay-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col items-center gap-1">
        <div className="w-px h-8 border-l border-dashed" style={{ borderColor: `${JARVIS.color}40` }} />
        <div
          className="w-1.5 h-1.5 rounded-full animate-glow-border-pulse"
          style={{ background: JARVIS.color }}
        />
      </div>
    </div>
  )
}

function AgentCard({
  agent,
  index,
  visible,
}: {
  agent: (typeof AGENTS)[0]
  index: number
  visible: boolean
}) {
  return (
    <div
      className={`relative transition-all duration-600 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${300 + index * 150}ms` }}
    >
      <div
        className="glass-2 rounded-2xl p-4 flex flex-col items-center text-center group hover:scale-[1.03] transition-transform duration-300"
        style={{
          boxShadow: `0 0 20px -4px ${agent.color}22`,
        }}
      >
        {/* Glow border on hover */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            boxShadow: `inset 0 0 0 1px ${agent.color}40, 0 0 24px -4px ${agent.color}33`,
            borderRadius: 'inherit',
          }}
        />

        {/* Avatar */}
        <div
          className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center mb-3 relative"
          style={{ background: `${agent.color}12` }}
        >
          {agent.avatarType === 'svg' ? (
            <Image
              src={agent.avatar}
              alt={agent.name}
              width={44}
              height={44}
              className="object-contain"
            />
          ) : (
            <Image
              src={agent.avatar}
              alt={agent.name}
              width={44}
              height={44}
              className="object-cover rounded-lg"
              loading="lazy"
            />
          )}
        </div>

        {/* Name + role */}
        <span className="text-white font-semibold text-sm">{agent.name}</span>
        <span
          className="text-[10px] font-mono uppercase tracking-wider mt-1 px-2 py-0.5 rounded"
          style={{ color: agent.color, background: `${agent.color}18` }}
        >
          {agent.role}
        </span>

        {/* Description */}
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">{agent.description}</p>
      </div>
    </div>
  )
}

function ConnectionArrow({ color, delay = 0, visible }: { color: string; delay?: number; visible: boolean }) {
  return (
    <div
      className={`hidden md:flex items-center justify-center transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="relative w-12 flex items-center">
        {/* Line */}
        <div
          className="absolute inset-y-1/2 left-0 right-0 h-px"
          style={{ background: `${color}40` }}
        />
        {/* Flowing particle */}
        <div
          className="absolute w-1.5 h-1.5 rounded-full animate-flow-particle"
          style={{
            background: color,
            boxShadow: `0 0 6px ${color}`,
            top: '50%',
            transform: 'translateY(-50%)',
            animationDelay: `${delay}ms`,
          }}
        />
        {/* Arrow tip */}
        <ChevronRight
          className="absolute -right-1 w-3 h-3"
          style={{ color: `${color}80` }}
        />
      </div>
    </div>
  )
}

function MobileFlowArrow({ color, visible }: { color: string; visible: boolean }) {
  return (
    <div
      className={`flex md:hidden justify-center py-2 transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="relative flex flex-col items-center">
        <div
          className="w-px h-6"
          style={{ background: `${color}40` }}
        />
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: color, boxShadow: `0 0 6px ${color}` }}
        />
      </div>
    </div>
  )
}

function BranchFork({ visible }: { visible: boolean }) {
  return (
    <div
      className={`mt-6 transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style={{ transitionDelay: '900ms' }}
    >
      {/* Fork stem */}
      <div className="flex justify-center mb-4">
        <div className="flex flex-col items-center">
          <div className="w-px h-6 bg-purple-500/30" />
          <div className="w-2 h-2 rounded-full bg-purple-500/50" />
        </div>
      </div>

      {/* Pass / Fail branches */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
        {/* Pass → Merge */}
        <div className="glass-2 rounded-xl px-5 py-3 flex items-center gap-3 group hover:scale-[1.03] transition-transform"
          style={{ boxShadow: '0 0 16px -4px rgb(34 197 94 / 0.2)' }}
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <span className="text-xs font-semibold text-emerald-400">Pass</span>
            <span className="text-slate-500 mx-2">→</span>
            <GitMerge className="w-4 h-4 text-emerald-400 inline" />
            <span className="text-xs text-slate-300 ml-1">Merge</span>
          </div>
        </div>

        {/* Divider */}
        <span className="text-xs text-slate-600 font-mono">or</span>

        {/* Fail → Retry */}
        <div className="glass-2 rounded-xl px-5 py-3 flex items-center gap-3 group hover:scale-[1.03] transition-transform"
          style={{ boxShadow: '0 0 16px -4px rgb(239 68 68 / 0.2)' }}
        >
          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <span className="text-xs font-semibold text-red-400">Fail</span>
            <span className="text-slate-500 mx-2">→</span>
            <RotateCcw className="w-4 h-4 text-red-400 inline" />
            <span className="text-xs text-slate-300 ml-1">Retry</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Main section ─── */

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="pipeline"
      className="px-4 sm:px-6 py-24 border-t border-white/[0.04]"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div
          className={`text-center mb-14 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400">
              Autonomous Pipeline
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Meet your AI workforce
          </h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Five specialized agents working in concert. Each task flows through the pipeline automatically.
          </p>
        </div>

        {/* Orchestrator */}
        <OrchestratorCard visible={visible} />

        {/* Oversight line */}
        <OversightLine visible={visible} />

        {/* Agent pipeline — Desktop: horizontal, Mobile: vertical */}
        <div className="hidden md:flex items-center justify-center">
          {AGENTS.map((agent, i) => (
            <div key={agent.id} className="flex items-center">
              <div className="w-[180px]">
                <AgentCard agent={agent} index={i} visible={visible} />
              </div>
              {i < AGENTS.length - 1 && (
                <ConnectionArrow
                  color={agent.color}
                  delay={400 + i * 150}
                  visible={visible}
                />
              )}
            </div>
          ))}
        </div>

        {/* Mobile vertical stack */}
        <div className="flex md:hidden flex-col items-center">
          {AGENTS.map((agent, i) => (
            <div key={agent.id} className="w-full max-w-[220px]">
              <AgentCard agent={agent} index={i} visible={visible} />
              {i < AGENTS.length - 1 && (
                <MobileFlowArrow color={agent.color} visible={visible} />
              )}
            </div>
          ))}
        </div>

        {/* Branch fork */}
        <BranchFork visible={visible} />
      </div>
    </section>
  )
}
