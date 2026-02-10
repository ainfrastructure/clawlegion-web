'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, Bot, HelpCircle, X } from 'lucide-react'
import type { AgentRole, AgentTier } from '@/components/flow-config/types'
import { AGENT_METADATA } from '@/lib/flow-presets'
import { getAgentById } from '@/components/chat-v2/agentConfig'

type AgentPaletteProps = {
  onAddAgent: (role: AgentRole) => void
  currentStepCount: number
  maxSteps?: number
}

const GROUPS: { label: string; tier: AgentTier[] }[] = [
  { label: 'Specialists', tier: ['council', 'orchestrator'] },
  { label: 'Workers', tier: ['worker'] },
]

export function AgentPalette({ onAddAgent, currentStepCount, maxSteps = 12 }: AgentPaletteProps) {
  const isMaxed = currentStepCount >= maxSteps
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null)
  const roles = Object.entries(AGENT_METADATA) as [AgentRole, (typeof AGENT_METADATA)[AgentRole]][]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">Agent Palette</h3>
        <span className="text-xs text-slate-500">{currentStepCount}/{maxSteps} steps</span>
      </div>

      <div className="flex flex-wrap gap-4">
        {GROUPS.map(group => (
          <div key={group.label} className="space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold">{group.label}</p>
            <div className="flex gap-2 flex-wrap">
              {roles
                .filter(([, meta]) => group.tier.includes(meta.tier))
                .map(([role, meta]) => {
                  const agent = getAgentById(role)
                  const avatarSrc = agent?.avatar
                  const agentColor = agent?.color || '#64748b'
                  const isExpanded = expandedAgent === role
                  return (
                    <div key={role} className="relative group/chip">
                      {/* Card — uses div[role=button] to avoid nested <button> */}
                      <div
                        role="button"
                        tabIndex={isMaxed ? -1 : 0}
                        aria-disabled={isMaxed}
                        onClick={() => !isMaxed && onAddAgent(role)}
                        onKeyDown={(e) => { if (!isMaxed && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onAddAgent(role) } }}
                        className={`
                          relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl glass-2
                          border border-transparent transition-all duration-200 select-none
                          ${isMaxed
                            ? 'opacity-40 cursor-not-allowed'
                            : 'cursor-pointer hover:scale-[1.04] hover:shadow-lg hover:shadow-black/20 hover:border-white/[0.08]'
                          }
                        `}
                      >
                        <div
                          className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-offset-1 ring-offset-slate-900 flex-shrink-0"
                          style={{ ['--tw-ring-color' as string]: agentColor }}
                        >
                          {avatarSrc ? (
                            <Image
                              src={avatarSrc}
                              alt={meta.name}
                              width={36}
                              height={36}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                              <Bot className="w-4 h-4 text-slate-500" />
                            </div>
                          )}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-slate-200">{meta.name}</p>
                          <p className="text-[11px] text-slate-500 hidden sm:block">{agent?.specialty || meta.tier}</p>
                        </div>
                        <Plus className={`w-4 h-4 text-slate-500 transition-colors ${!isMaxed ? 'group-hover/chip:text-cyan-400' : ''}`} />
                      </div>

                      {/* ? badge — overlaid on top-right corner, visible on hover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setExpandedAgent(isExpanded ? null : role)
                        }}
                        className={`
                          absolute -top-1.5 -right-1.5 z-10
                          w-5 h-5 rounded-full flex items-center justify-center
                          text-[10px] font-bold
                          border border-white/10 shadow-md shadow-black/30
                          transition-all duration-150
                          ${isExpanded
                            ? 'opacity-100 bg-slate-600 text-white'
                            : 'opacity-0 group-hover/chip:opacity-100 bg-slate-700/90 text-slate-300 hover:bg-slate-600 hover:text-white'
                          }
                        `}
                        title={`About ${meta.name}`}
                      >
                        {isExpanded ? <X className="w-2.5 h-2.5" /> : '?'}
                      </button>

                      {/* Expanded description popover */}
                      {isExpanded && (
                        <div className="absolute top-full left-0 mt-1.5 z-50 w-64 bg-[#0c1a30] border border-blue-500/20 rounded-xl shadow-[0_8px_32px_-8px_rgb(0_0_0/0.8)] p-3">
                          <div className="absolute -top-1.5 left-6 w-3 h-3 bg-[#0c1a30] border-l border-t border-blue-500/20 rotate-45" />
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-offset-1 ring-offset-[#0c1a30] flex-shrink-0"
                              style={{ ['--tw-ring-color' as string]: agentColor }}
                            >
                              {avatarSrc ? (
                                <Image src={avatarSrc} alt={meta.name} width={24} height={24} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                  <Bot className="w-3 h-3 text-slate-500" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-bold" style={{ color: agentColor }}>{meta.name}</p>
                              <p className="text-[10px] text-slate-500">{agent?.specialty || meta.tier}</p>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {agent?.description || 'No description available.'}
                          </p>
                          {agent?.capabilities && agent.capabilities.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {agent.capabilities.slice(0, 4).map((cap: string) => (
                                <span key={cap} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-slate-500">
                                  {cap}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
