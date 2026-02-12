'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react'
import { ALL_AGENTS, getAgentById } from '@/components/chat-v2/agentConfig'
import { AGENT_AVATARS_48, AGENT_AVATARS_96 } from './agent-avatars-inline'

/** Get inlined base64 avatar (zero HTTP requests) or fall back to file path */
function inlineAvatar(agentId: string, size: 48 | 96): string {
  if (size === 48) return AGENT_AVATARS_48[agentId] || `/optimized/agents/${agentId}-48w.webp`
  return AGENT_AVATARS_96[agentId] || `/optimized/agents/${agentId}-96w.webp`
}

/* ─── Agent pool — derived from agentConfig (single source of truth) ─── */

type Agent = {
  id: string
  name: string
  role: string
  color: string
  avatar: string
}

const AGENT_POOL: Record<string, Agent> = Object.fromEntries(
  ALL_AGENTS.map(a => [
    a.id,
    { id: a.id, name: a.name, role: a.role, color: a.color, avatar: a.avatar },
  ])
)

/* ─── Template data ─── */

type Outcome = { label: string; action: string }

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
    name: 'Market Research',
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
    name: 'Ops & Compliance',
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

const caesarConfig = getAgentById('caesar')!
const CAESAR = {
  id: caesarConfig.id,
  name: caesarConfig.name,
  role: caesarConfig.role,
  color: caesarConfig.color,
  avatar: caesarConfig.avatar,
}

/* ─── Shared tiny avatar component (uses pre-optimized WebP, no next/image) ─── */

function AgentAvatar({ id, size, className }: { id: string; size: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={inlineAvatar(id, size <= 48 ? 48 : 96)}
      alt=""
      width={size}
      height={size}
      className={className || 'object-cover rounded-lg'}
      loading="lazy"
      decoding="async"
    />
  )
}

/* ─── Sub-components (render only for active template) ─── */

function OrchestratorCard({ template }: { template: Template }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="glass-2 rounded-2xl p-3 flex items-center gap-3 animate-card-breathe w-full max-w-xs"
        style={{
          boxShadow: `0 0 24px -4px ${CAESAR.color}33, 0 0 8px -2px ${CAESAR.color}22`,
          borderColor: `${CAESAR.color}30`,
        }}
      >
        <div
          className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
          style={{ background: `${CAESAR.color}18` }}
        >
          <AgentAvatar id="caesar" size={40} className="object-contain" />
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

function OversightLine() {
  return (
    <div className="flex justify-center py-1">
      <div className="flex flex-col items-center gap-0.5">
        <div className="w-px border-l border-dashed h-5" style={{ borderColor: `${CAESAR.color}40` }} />
        <div className="rounded-full animate-glow-border-pulse w-1.5 h-1.5" style={{ background: CAESAR.color }} />
      </div>
    </div>
  )
}

function AgentCard({ agent, index, description }: { agent: Agent; index: number; description: string }) {
  return (
    <div
      className="relative animate-fade-in-up"
      style={{ animationDelay: `${200 + index * 100}ms` }}
    >
      <div
        className="glass-2 rounded-2xl p-4 flex flex-col items-center text-center group hover:scale-[1.03] transition-transform duration-300"
        style={{ boxShadow: `0 0 20px -4px ${agent.color}22` }}
      >
        <div
          className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center mb-3 relative"
          style={{ background: `${agent.color}12` }}
        >
          <AgentAvatar id={agent.id} size={44} />
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

function ConnectionArrow({ color, delay = 0 }: { color: string; delay?: number }) {
  return (
    <div className="flex items-center justify-center animate-fade-in" style={{ animationDelay: `${delay}ms` }}>
      <div className="relative flex items-center w-12">
        <div className="absolute inset-y-1/2 left-0 right-0 h-px" style={{ background: `${color}40` }} />
        <div
          className="absolute rounded-full animate-flow-particle w-1.5 h-1.5"
          style={{
            background: color,
            boxShadow: `0 0 6px ${color}`,
            top: '50%',
            transform: 'translateY(-50%)',
            animationDelay: `${delay}ms`,
          }}
        />
        <ChevronRight className="absolute -right-0.5 w-3 h-3" style={{ color: `${color}80` }} />
      </div>
    </div>
  )
}

function BranchFork({ outcomes }: { outcomes: Template['outcomes'] }) {
  return (
    <div className="mt-3 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
      <div className="flex justify-center mb-2">
        <div className="flex flex-col items-center">
          <div className="w-px h-4 bg-purple-500/30" />
          <div className="w-2 h-2 rounded-full bg-purple-500/50" />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
        <div
          className="glass-2 rounded-xl px-5 py-3 flex items-center gap-3"
          style={{ boxShadow: '0 0 16px -4px rgb(34 197 94 / 0.2)' }}
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <span className="text-xs font-semibold text-emerald-400">{outcomes.success.label}</span>
            <span className="text-slate-500 mx-2">&rarr;</span>
            <span className="text-xs text-slate-300">{outcomes.success.action}</span>
          </div>
        </div>
        <span className="text-xs text-slate-600 font-mono">or</span>
        <div
          className="glass-2 rounded-xl px-5 py-3 flex items-center gap-3"
          style={{ boxShadow: '0 0 16px -4px rgb(239 68 68 / 0.2)' }}
        >
          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <span className="text-xs font-semibold text-red-400">{outcomes.failure.label}</span>
            <span className="text-slate-500 mx-2">&rarr;</span>
            <span className="text-xs text-slate-300">{outcomes.failure.action}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Single template pipeline — rendered only for active slide */
function PipelineView({ template }: { template: Template }) {
  const agents = getTemplateAgents(template)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Template label */}
      <div className="text-center mb-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-2 border border-white/[0.06]">
          <span className="text-sm font-semibold text-white">{template.name}</span>
        </div>
        <p className="text-sm text-slate-500 mt-1 italic">{template.tagline}</p>
      </div>

      {/* Orchestrator */}
      <OrchestratorCard template={template} />
      <OversightLine />

      {/* Agent pipeline — horizontal on desktop, wrapped grid on mobile */}
      <div className="hidden md:flex items-center justify-center flex-nowrap gap-1">
        {agents.map((agent, i) => (
          <div key={agent.id} className="flex items-center">
            <div className="w-[140px] lg:w-[160px] xl:w-[180px]">
              <AgentCard agent={agent} index={i} description={template.descriptions[agent.id]} />
            </div>
            {i < agents.length - 1 && (
              <ConnectionArrow color={agent.color} delay={300 + i * 100} />
            )}
          </div>
        ))}
      </div>

      {/* Mobile: 2x2 grid instead of horizontal scroll */}
      <div className="md:hidden grid grid-cols-2 gap-2 px-2">
        {agents.map((agent, i) => (
          <div key={agent.id}>
            <div
              className="glass-2 rounded-xl p-2.5 flex items-center gap-2 animate-fade-in-up"
              style={{ animationDelay: `${200 + i * 80}ms`, boxShadow: `0 0 14px -4px ${agent.color}22` }}
            >
              <div
                className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0"
                style={{ background: `${agent.color}12` }}
              >
                <AgentAvatar id={agent.id} size={24} />
              </div>
              <div className="min-w-0">
                <span className="text-white font-semibold text-[11px] leading-tight block">{agent.name}</span>
                <span
                  className="text-[8px] font-mono uppercase tracking-wider px-1 py-px rounded"
                  style={{ color: agent.color, background: `${agent.color}18` }}
                >
                  {agent.role}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Branch fork */}
      <BranchFork outcomes={template.outcomes} />
    </div>
  )
}

/* ─── Main section ─── */

const ROTATE_MS = 5000

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Auto-rotate
  const next = useCallback(() => {
    setActiveIdx(i => (i + 1) % TEMPLATES.length)
  }, [])

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(next, ROTATE_MS)
    return () => clearInterval(timer)
  }, [isPaused, next])

  const template = TEMPLATES[activeIdx]

  return (
    <section
      ref={sectionRef}
      id="pipeline"
      className="py-16 border-t border-white/[0.04] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
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
            Specialized agents working in concert. Watch them adapt to any industry.
          </p>
          <p className="text-sm text-slate-500 max-w-lg mx-auto mt-3">
            They learn your preferences, adapt to your workflow, and get better at what you need — every single run.
          </p>
        </div>
      </div>

      {/* Template selector tabs */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mb-6">
        <div className="flex justify-center gap-1.5 flex-wrap">
          {TEMPLATES.map((tmpl, i) => (
            <button
              key={tmpl.name}
              onClick={() => setActiveIdx(i)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                i === activeIdx
                  ? 'bg-white/[0.1] text-white border border-white/[0.15] shadow-lg'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              <span className="mr-1">{tmpl.emoji}</span>
              {tmpl.name}
            </button>
          ))}
        </div>
      </div>

      {/* Active pipeline — ONLY ONE rendered at a time */}
      <div key={template.name}>
        <PipelineView template={template} />
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mt-6">
        {TEMPLATES.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            className={`rounded-full transition-all duration-300 ${
              i === activeIdx ? 'w-6 h-1.5 bg-white/50' : 'w-1.5 h-1.5 bg-white/20'
            }`}
            aria-label={`Template ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
