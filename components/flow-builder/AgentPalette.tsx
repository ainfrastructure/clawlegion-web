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
  { label: 'Workers', tier: ['worker'] },
  { label: 'Specialists', tier: ['council', 'orchestrator'] },
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
                    <div key={role} className="relative">
                      <div className="flex items-center gap-0">
                        <button
                          disabled={isMaxed}
                          onClick={() => onAddAgent(role)}
                          className={`
                            group/chip flex items-center gap-2 px-3 py-2 rounded-xl glass-2
                            transition-all duration-200
                            ${isMaxed
                              ? 'opacity-40 cursor-not-allowed'
                              : 'hover:scale-105 hover:shadow-lg'
                            }
                          `}
                          style={!isMaxed ? { ['--hover-border' as string]: agentColor } : undefined}
                        >
                          <div
                            className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-offset-1 ring-offset-slate-900 flex-shrink-0"
                            style={{ ['--tw-ring-color' as string]: agentColor }}
                          >
                            {avatarSrc ? (
                              <Image
                                src={avatarSrc}
                                alt={meta.name}
                                width={28}
                                height={28}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                <Bot className="w-3.5 h-3.5 text-slate-500" />
                              </div>
                            )}
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-semibold text-slate-200">{meta.name}</p>
                            <p className="text-[10px] text-slate-500 hidden sm:block">{agent?.specialty || meta.tier}</p>
                          </div>
                          <Plus className={`w-3.5 h-3.5 text-slate-500 transition-colors ${!isMaxed ? 'group-hover/chip:text-cyan-400' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setExpandedAgent(isExpanded ? null : role)
                          }}
                          className="ml-0.5 p-1 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/[0.06] transition-colors"
                          title={`About ${meta.name}`}
                        >
                          {isExpanded ? (
                            <X className="w-3 h-3" />
                          ) : (
                            <HelpCircle className="w-3 h-3" />
                          )}
                        </button>
                      </div>

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
