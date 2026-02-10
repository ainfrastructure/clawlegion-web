'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react'
import Image from 'next/image'

/* ─── Agent pool — all available pipeline agents ─── */

type Agent = {
  id: string
  name: string
  role: string
  color: string
  avatar: string
  avatarType: 'svg' | 'png'
}

const AGENT_POOL: Record<string, Agent> = {
  athena: {
    id: 'athena',
    name: 'Athena',
    role: 'Planner',
    color: '#06B6D4',
    avatar: '/agents/athena.png',
    avatarType: 'png',
  },
  minerva: {
    id: 'minerva',
    name: 'Minerva',
    role: 'Researcher',
    color: '#10B981',
    avatar: '/agents/minerva.png',
    avatarType: 'png',
  },
  vulcan: {
    id: 'vulcan',
    name: 'Vulcan',
    role: 'Builder',
    color: '#EA580C',
    avatar: '/agents/vulcan.png',
    avatarType: 'png',
  },
  janus: {
    id: 'janus',
    name: 'Janus',
    role: 'Verifier',
    color: '#D946EF',
    avatar: '/agents/janus.png',
    avatarType: 'png',
  },
  cato: {
    id: 'cato',
    name: 'Cato',
    role: 'DevOps Engineer',
    color: '#8B5E3C',
    avatar: '/agents/cato.png',
    avatarType: 'png',
  },
  mercury: {
    id: 'mercury',
    name: 'Mercury',
    role: 'Messenger',
    color: '#C0C0C0',
    avatar: '/agents/mercury.png',
    avatarType: 'png',
  },
  cicero: {
    id: 'cicero',
    name: 'Cicero',
    role: 'Content Creator',
    color: '#7C3AED',
    avatar: '/agents/cicero.png',
    avatarType: 'png',
  },
  apollo: {
    id: 'apollo',
    name: 'Apollo',
    role: 'Creative Director',
    color: '#EAB308',
    avatar: '/agents/apollo.png',
    avatarType: 'png',
  },
  oracle: {
    id: 'oracle',
    name: 'Oracle',
    role: 'Data Analyst',
    color: '#4338CA',
    avatar: '/agents/oracle.png',
    avatarType: 'png',
  },
}

/* ─── Template data ─── */

type Outcome = {
  label: string
  action: string
}

type Template = {
  name: string
  emoji: string
  tagline: string
  pipeline: string[]
  descriptions: Record<string, string>
  outcomes: { success: Outcome; failure: Outcome }
}

const TEMPLATES: Template[] = [
  {
    name: 'Software Development',
    emoji: '🚀',
    tagline: 'From issue to shipped code — fully automated',
    pipeline: ['athena', 'minerva', 'vulcan', 'janus'],
    descriptions: {
      caesar: 'Routes tasks & manages the pipeline',
      athena: 'Decomposes tasks into implementation plans',
      minerva: 'Investigates APIs & technical discovery',
      vulcan: 'Implements code & constructs features',
      janus: 'Runtime verification with visual proof',
    },
    outcomes: {
      success: { label: 'Pass', action: 'Merge' },
      failure: { label: 'Fail', action: 'Retry' },
    },
  },
  {
    name: 'Content Marketing',
    emoji: '📝',
    tagline: 'One brief in, a week of content out',
    pipeline: ['minerva', 'cicero', 'apollo', 'mercury'],
    descriptions: {
      caesar: 'Routes briefs & coordinates the content pipeline',
      minerva: 'Researches trending topics & competitors',
      cicero: 'Writes blog posts, social copy, newsletters',
      apollo: 'Designs graphics, thumbnails, and brand assets',
      mercury: 'Distributes content across all channels',
    },
    outcomes: {
      success: { label: 'Approved', action: 'Publish' },
      failure: { label: 'Revisions', action: 'Redraft' },
    },
  },
  {
    name: 'Market Research & Analysis',
    emoji: '🔬',
    tagline: 'Data-driven insights on autopilot',
    pipeline: ['minerva', 'oracle', 'athena', 'cicero'],
    descriptions: {
      caesar: 'Coordinates research streams & deliverables',
      minerva: 'Gathers market data, competitor intel, surveys',
      oracle: 'Analyzes trends, correlations, and key metrics',
      athena: 'Structures findings into report frameworks',
      cicero: 'Writes executive summaries and slide decks',
    },
    outcomes: {
      success: { label: 'Validated', action: 'Deliver' },
      failure: { label: 'Gaps Found', action: 'Deep Dive' },
    },
  },
  {
    name: 'Product Launch',
    emoji: '🎯',
    tagline: 'From positioning to launch day — orchestrated',
    pipeline: ['oracle', 'athena', 'apollo', 'mercury'],
    descriptions: {
      caesar: 'Manages the launch timeline & coordinates teams',
      oracle: 'Analyzes market fit & competitor positioning',
      athena: 'Plans launch timeline, channels, messaging',
      apollo: 'Creates landing pages, ads, and visual assets',
      mercury: 'Handles PR outreach, emails, and announcements',
    },
    outcomes: {
      success: { label: 'Ready', action: 'Launch' },
      failure: { label: 'Not Ready', action: 'Iterate' },
    },
  },
  {
    name: 'Operations & Compliance',
    emoji: '📋',
    tagline: 'Streamline processes, enforce standards',
    pipeline: ['minerva', 'athena', 'cato', 'janus'],
    descriptions: {
      caesar: 'Oversees operational workflows & compliance',
      minerva: 'Audits current processes & regulations',
      athena: 'Creates compliance checklists & SOPs',
      cato: 'Implements automation & infrastructure tooling',
      janus: 'Validates completeness & flags compliance gaps',
    },
    outcomes: {
      success: { label: 'Compliant', action: 'Certify' },
      failure: { label: 'Violations', action: 'Remediate' },
    },
  },
]

function getTemplateAgents(template: Template): Agent[] {
  return template.pipeline.map((id) => AGENT_POOL[id]).filter(Boolean)
}

const CAESAR = {
  id: 'caesar',
  name: 'Caesar',
  role: 'Orchestrator',
  color: '#DC2626',
  avatar: '/agents/caesar.png',
}

/* ─── Sub-components ─── */

function SlideOrchestratorCard({ template, visible }: { template: Template; visible: boolean }) {
  return (
    <div
      className={`flex flex-col items-center transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'
      }`}
    >
      <div
        className="glass-2 rounded-2xl p-5 flex items-center gap-4 animate-card-breathe w-full max-w-xs"
        style={{
          boxShadow: `0 0 24px -4px ${CAESAR.color}33, 0 0 8px -2px ${CAESAR.color}22`,
          borderColor: `${CAESAR.color}30`,
        }}
      >
        <div
          className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
          style={{ background: `${CAESAR.color}18` }}
        >
          <Image
            src={CAESAR.avatar}
            alt={CAESAR.name}
            width={40}
            height={40}
            className="object-contain"
            loading="eager"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm">{CAESAR.name}</span>
            <span
              className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ color: CAESAR.color, background: `${CAESAR.color}18` }}
            >
              {CAESAR.role}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">{template.descriptions.caesar}</p>
        </div>
      </div>
    </div>
  )
}

function SlideOversightLine({ visible }: { visible: boolean }) {
  return (
    <div
      className={`flex justify-center py-3 transition-all duration-500 delay-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col items-center gap-1">
        <div className="w-px h-8 border-l border-dashed" style={{ borderColor: `${CAESAR.color}40` }} />
        <div
          className="w-1.5 h-1.5 rounded-full animate-glow-border-pulse"
          style={{ background: CAESAR.color }}
        />
      </div>
    </div>
  )
}

function SlideAgentCard({
  agent,
  index,
  visible,
  description,
}: {
  agent: Agent
  index: number
  visible: boolean
  description: string
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
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            boxShadow: `inset 0 0 0 1px ${agent.color}40, 0 0 24px -4px ${agent.color}33`,
            borderRadius: 'inherit',
          }}
        />
        <div
          className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center mb-3 relative"
          style={{ background: `${agent.color}12` }}
        >
          <Image
            src={agent.avatar}
            alt={agent.name}
            width={44}
            height={44}
            className={agent.avatarType === 'svg' ? 'object-contain' : 'object-cover rounded-lg'}
            loading="eager"
          />
        </div>
        <span className="text-white font-semibold text-sm">{agent.name}</span>
        <span
          className="text-[10px] font-mono uppercase tracking-wider mt-1 px-2 py-0.5 rounded"
          style={{ color: agent.color, background: `${agent.color}18` }}
        >
          {agent.role}
        </span>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function SlideConnectionArrow({ color, delay = 0, visible }: { color: string; delay?: number; visible: boolean }) {
  return (
    <div
      className={`hidden md:flex items-center justify-center transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="relative w-12 flex items-center">
        <div
          className="absolute inset-y-1/2 left-0 right-0 h-px"
          style={{ background: `${color}40` }}
        />
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
        <ChevronRight
          className="absolute -right-1 w-3 h-3"
          style={{ color: `${color}80` }}
        />
      </div>
    </div>
  )
}

function SlideMobileFlowArrow({ color, visible }: { color: string; visible: boolean }) {
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

function SlideBranchFork({ visible, outcomes }: { visible: boolean; outcomes: Template['outcomes'] }) {
  return (
    <div
      className={`mt-6 transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style={{ transitionDelay: '900ms' }}
    >
      <div className="flex justify-center mb-4">
        <div className="flex flex-col items-center">
          <div className="w-px h-6 bg-purple-500/30" />
          <div className="w-2 h-2 rounded-full bg-purple-500/50" />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
        <div className="glass-2 rounded-xl px-5 py-3 flex items-center gap-3 group hover:scale-[1.03] transition-transform"
          style={{ boxShadow: '0 0 16px -4px rgb(34 197 94 / 0.2)' }}
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <span className="text-xs font-semibold text-emerald-400">{outcomes.success.label}</span>
            <span className="text-slate-500 mx-2">→</span>
            <span className="text-xs text-slate-300">{outcomes.success.action}</span>
          </div>
        </div>
        <span className="text-xs text-slate-600 font-mono">or</span>
        <div className="glass-2 rounded-xl px-5 py-3 flex items-center gap-3 group hover:scale-[1.03] transition-transform"
          style={{ boxShadow: '0 0 16px -4px rgb(239 68 68 / 0.2)' }}
        >
          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <span className="text-xs font-semibold text-red-400">{outcomes.failure.label}</span>
            <span className="text-slate-500 mx-2">→</span>
            <span className="text-xs text-slate-300">{outcomes.failure.action}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/** A complete pipeline visualization for one template */
function SlideContent({ template, visible }: { template: Template; visible: boolean }) {
  const agents = getTemplateAgents(template)

  return (
    <div className="flex-shrink-0 px-2" style={{ width: '10%' }}>
      {/* Template label */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-2 border border-white/[0.06]">
          <span className="text-sm font-semibold text-white">{template.name}</span>
        </div>
        <p className="text-sm text-slate-500 mt-2 italic">{template.tagline}</p>
      </div>

      {/* Orchestrator */}
      <SlideOrchestratorCard template={template} visible={visible} />

      {/* Oversight line */}
      <SlideOversightLine visible={visible} />

      {/* Agent pipeline — Desktop: horizontal, Mobile: vertical */}
      <div className="hidden md:flex items-center justify-center">
        {agents.map((agent, i) => (
          <div key={agent.id} className="flex items-center">
            <div className="w-[180px]">
              <SlideAgentCard
                agent={agent}
                index={i}
                visible={visible}
                description={template.descriptions[agent.id]}
              />
            </div>
            {i < agents.length - 1 && (
              <SlideConnectionArrow
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
        {agents.map((agent, i) => (
          <div key={agent.id} className="w-full max-w-[220px]">
            <SlideAgentCard
              agent={agent}
              index={i}
              visible={visible}
              description={template.descriptions[agent.id]}
            />
            {i < agents.length - 1 && (
              <SlideMobileFlowArrow color={agent.color} visible={visible} />
            )}
          </div>
        ))}
      </div>

      {/* Branch fork */}
      <SlideBranchFork visible={visible} outcomes={template.outcomes} />
    </div>
  )
}

/* ─── Main section ─── */

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [entryDone, setEntryDone] = useState(false)
  const [paused, setPaused] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [reducedMotionIdx, setReducedMotionIdx] = useState(0)

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mql.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  // Visibility observer
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

  // After entry animations complete, start the CSS scroll
  useEffect(() => {
    if (!visible) return
    const timeout = setTimeout(() => setEntryDone(true), 1500)
    return () => clearTimeout(timeout)
  }, [visible])

  // Hover pause/resume
  const handleMouseEnter = useCallback(() => setPaused(true), [])
  const handleMouseLeave = useCallback(() => setPaused(false), [])

  // Reduced-motion fallback: discrete rotation
  useEffect(() => {
    if (!prefersReducedMotion || !entryDone || paused) return
    const interval = setInterval(() => {
      setReducedMotionIdx((prev) => (prev + 1) % TEMPLATES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [prefersReducedMotion, entryDone, paused])

  return (
    <section
      ref={sectionRef}
      id="pipeline"
      className="py-24 border-t border-white/[0.04] overflow-hidden"
    >
      {/* Header — constrained */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
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
            One Team. Any Workflow.
          </h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Five specialized agents working in concert. Watch them adapt to any industry.
          </p>
        </div>
      </div>

      {/* Pipeline strip — full width, edge to edge */}
      {prefersReducedMotion ? (
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <SlideContent
            template={TEMPLATES[reducedMotionIdx]}
            visible={visible}
          />
        </div>
      ) : (
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className={`flex ${entryDone ? 'pipeline-strip' : ''} ${paused ? 'paused' : ''}`}
            style={{ width: '500%' }}
          >
            {[...TEMPLATES, ...TEMPLATES].map((tmpl, i) => (
              <SlideContent
                key={`${tmpl.name}-${i < TEMPLATES.length ? 'a' : 'b'}`}
                template={tmpl}
                visible={visible}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
