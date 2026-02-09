'use client'

import Image from 'next/image'
import { Plus, Bot } from 'lucide-react'
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
            <div className="flex gap-2">
              {roles
                .filter(([, meta]) => group.tier.includes(meta.tier))
                .map(([role, meta]) => {
                  const agent = getAgentById(role)
                  const avatarSrc = agent?.avatar
                  const agentColor = agent?.color || '#64748b'
                  return (
                    <button
                      key={role}
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
                      {/* Avatar instead of emoji */}
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
                        <p className="text-[10px] text-slate-500 hidden sm:block">{meta.tier}</p>
                      </div>
                      <Plus className={`w-3.5 h-3.5 text-slate-500 transition-colors ${!isMaxed ? 'group-hover/chip:text-cyan-400' : ''}`} />
                    </button>
                  )
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
