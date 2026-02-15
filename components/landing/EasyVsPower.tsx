'use client'

import { useState } from 'react'
import { MessageSquareText, Terminal, Sparkles, Workflow, BarChart3, Code2, MousePointerClick, Settings2 } from 'lucide-react'

const easyFeatures = [
  {
    icon: MessageSquareText,
    title: 'Just Type What You Need',
    description: 'Describe tasks in plain English — like texting an employee.',
  },
  {
    icon: MousePointerClick,
    title: 'Drag-and-Drop Workflows',
    description: 'Build custom processes visually. No code, no terminal, no confusion.',
  },
  {
    icon: Sparkles,
    title: 'Agents Figure It Out',
    description: 'They research, plan, create, and verify — automatically.',
  },
  {
    icon: BarChart3,
    title: 'See Results, Not Complexity',
    description: 'Clean dashboard shows progress, deliverables, and what\'s next.',
  },
]

const powerFeatures = [
  {
    icon: Terminal,
    title: 'Full API Access',
    description: 'REST API, webhooks, custom integrations. Build on top of the fleet.',
  },
  {
    icon: Workflow,
    title: 'Custom Pipeline Logic',
    description: 'Branch conditions, parallel execution, retry policies, timeout controls.',
  },
  {
    icon: Code2,
    title: 'Agent-Level Configuration',
    description: 'Custom system prompts, model selection, tool permissions per agent.',
  },
  {
    icon: Settings2,
    title: 'Session Replay & Audit',
    description: 'Full transcripts, tool call logs, token usage, and decision traces.',
  },
]

export function EasyVsPower() {
  const [activeTab, setActiveTab] = useState<'easy' | 'power'>('easy')

  return (
    <section className="px-4 sm:px-6 py-24 border-t border-white/[0.04]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-widest text-purple-400">
              Built For Everyone
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Your Skill Level Doesn&apos;t Matter
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Never opened a terminal? No problem. Live in the command line? Even better.
            <br />
            <span className="text-slate-300">One platform. Two ways to use it.</span>
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center glass-2 rounded-full p-1 border border-white/[0.06]">
            <button
              onClick={() => setActiveTab('easy')}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeTab === 'easy'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ✨ Easy Mode
            </button>
            <button
              onClick={() => setActiveTab('power')}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeTab === 'power'
                  ? 'bg-gradient-to-r from-red-500 to-red-700 text-white shadow-lg shadow-red-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ⚡ Power Mode
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="relative">
          {/* Easy Mode */}
          <div
            className={`transition-all duration-500 ${
              activeTab === 'easy'
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4 absolute inset-0 pointer-events-none'
            }`}
          >
            {/* Tagline */}
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-medium">
                No coding. No terminal. No jargon.
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {easyFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="glass-2 glass-gradient-border rounded-2xl p-6 group hover:bg-white/[0.08] transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
            {/* Quote */}
            <div className="mt-10 text-center">
              <blockquote className="text-slate-500 italic text-sm max-w-xl mx-auto">
                &ldquo;I don&apos;t know what Terminal is and had never used it. Running commands there was totally foreign to me.&rdquo;
                <span className="block mt-2 text-slate-400 not-italic font-medium text-xs">
                  — The exact person we built Easy Mode for.
                </span>
              </blockquote>
            </div>
          </div>

          {/* Power Mode */}
          <div
            className={`transition-all duration-500 ${
              activeTab === 'power'
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4 absolute inset-0 pointer-events-none'
            }`}
          >
            {/* Tagline */}
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-300 text-sm font-medium">
                Full control. Every lever. Your infrastructure.
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {powerFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="glass-2 glass-gradient-border rounded-2xl p-6 group hover:bg-white/[0.08] transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10"
                >
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
            {/* Quote */}
            <div className="mt-10 text-center">
              <blockquote className="text-slate-500 italic text-sm max-w-xl mx-auto">
                &ldquo;I want to customize system prompts, set retry policies, and pipe webhooks into my own orchestration layer.&rdquo;
                <span className="block mt-2 text-slate-400 not-italic font-medium text-xs">
                  — Yeah, we built Power Mode for you.
                </span>
              </blockquote>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-14">
          <p className="text-slate-400 text-sm mb-4">
            Same platform. Same agents. Same price.
            <span className="text-white font-medium"> You choose how deep to go.</span>
          </p>
        </div>
      </div>
    </section>
  )
}
