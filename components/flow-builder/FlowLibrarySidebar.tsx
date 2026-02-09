'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, Trash2, Copy, Lock, Loader2, Bot } from 'lucide-react'
import type { FlowPreset } from '@/components/flow-config/types'
import { AGENT_METADATA } from '@/lib/flow-presets'
import { getAgentById } from '@/components/chat-v2/agentConfig'

type FlowLibrarySidebarProps = {
  systemPresets: FlowPreset[]
  userFlows: FlowPreset[]
  activeFlowId: string | null
  isLoading: boolean
  onSelectFlow: (flow: FlowPreset) => void
  onNewFlow: () => void
  onDuplicateFlow: (flow: FlowPreset) => void
  onDeleteFlow: (id: string) => void
}

export function FlowLibrarySidebar({
  systemPresets,
  userFlows,
  activeFlowId,
  isLoading,
  onSelectFlow,
  onNewFlow,
  onDuplicateFlow,
  onDeleteFlow,
}: FlowLibrarySidebarProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const handleDelete = (id: string) => {
    if (confirmDeleteId === id) {
      onDeleteFlow(id)
      setConfirmDeleteId(null)
    } else {
      setConfirmDeleteId(id)
      setTimeout(() => setConfirmDeleteId(null), 3000)
    }
  }

  const renderAgentAvatars = (flow: FlowPreset) => {
    const agents = flow.agents.filter(a => a.enabled)
    return (
      <div className="flex items-center">
        {/* Stacked avatar circles */}
        <div className="flex -space-x-2">
          {agents.slice(0, 5).map((agent, i) => {
            const agentData = getAgentById(agent.role)
            const avatarSrc = agentData?.avatar
            const agentColor = agentData?.color || '#64748b'
            const meta = AGENT_METADATA[agent.role]
            return (
              <div
                key={i}
                className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-offset-1 ring-offset-slate-900 relative"
                style={{
                  ['--tw-ring-color' as string]: agentColor,
                  zIndex: 5 - i,
                }}
                title={meta?.name || agent.role}
              >
                {avatarSrc ? (
                  <Image
                    src={avatarSrc}
                    alt={meta?.name || agent.role}
                    width={20}
                    height={20}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    <Bot className="w-2.5 h-2.5 text-slate-500" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {agents.length > 5 && (
          <span className="text-[10px] text-slate-500 ml-1.5">+{agents.length - 5}</span>
        )}
      </div>
    )
  }

  const renderMiniFlowPreview = (flow: FlowPreset) => {
    const agents = flow.agents.filter(a => a.enabled)
    if (agents.length === 0) return null

    return (
      <div className="flex items-center gap-0.5 mt-1.5">
        {agents.slice(0, 6).map((agent, i) => {
          const agentData = getAgentById(agent.role)
          const agentColor = agentData?.color || '#64748b'
          return (
            <div key={i} className="flex items-center">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: agentColor }}
              />
              {i < Math.min(agents.length, 6) - 1 && (
                <div className="w-2 h-px bg-slate-700" />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const FlowCard = ({ flow, isSystem }: { flow: FlowPreset; isSystem: boolean }) => {
    const isActive = activeFlowId === flow.id
    const primaryAgent = flow.agents.find(a => a.enabled)
    const primaryColor = primaryAgent ? getAgentById(primaryAgent.role)?.color : undefined

    return (
      <div
        className={`group relative rounded-xl cursor-pointer transition-all duration-200 overflow-hidden
          ${isActive ? 'ring-1 ring-cyan-500/20' : ''}
        `}
        onClick={() => onSelectFlow(flow)}
      >
        {/* Gradient border for system presets */}
        {isSystem && primaryColor && (
          <div
            className="absolute -inset-px rounded-xl opacity-30 group-hover:opacity-50 transition-opacity"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}40, transparent 60%)`,
            }}
          />
        )}

        <div className={`relative rounded-xl p-3
          ${isActive ? 'glass-3 border border-cyan-500/30' : 'glass-2 hover:border-white/[0.1]'}
        `}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                {isSystem && <Lock className="w-3 h-3 text-slate-600 flex-shrink-0" />}
                <p className={`text-sm font-semibold truncate ${isActive ? 'text-cyan-300' : 'text-slate-200'}`}>
                  {flow.name}
                </p>
              </div>
              {flow.description && (
                <p className="text-xs text-slate-500 truncate mt-0.5">{flow.description}</p>
              )}
              <div className="mt-2 flex items-center gap-2">
                {renderAgentAvatars(flow)}
                <span className="text-[10px] text-slate-600">
                  {flow.agents.filter(a => a.enabled).length} agents
                </span>
              </div>
              {isSystem && renderMiniFlowPreview(flow)}
            </div>

            {/* Actions */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); onDuplicateFlow(flow) }}
                className="p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors"
                title="Duplicate"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              {!isSystem && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(flow.id) }}
                  className={`p-1 rounded-md transition-colors ${confirmDeleteId === flow.id ? 'text-red-400 bg-red-500/10' : 'text-slate-500 hover:text-red-400 hover:bg-white/[0.06]'}`}
                  title={confirmDeleteId === flow.id ? 'Click again to confirm' : 'Delete'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 flex-shrink-0 glass-1 border-r border-white/[0.06] flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-bold text-slate-100">Flow Library</h2>
          <button
            onClick={onNewFlow}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                       bg-cyan-500/10 text-cyan-400 border border-cyan-500/20
                       hover:bg-cyan-500/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Flow
          </button>
        </div>
        <p className="text-xs text-slate-500">System presets and custom flows</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* System Presets */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold mb-2 px-1">
                System Presets
              </p>
              <div className="space-y-2">
                {systemPresets.map(flow => (
                  <FlowCard key={flow.id} flow={flow} isSystem />
                ))}
              </div>
            </div>

            {/* User Flows */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold mb-2 px-1">
                My Flows
              </p>
              {userFlows.length === 0 ? (
                <p className="text-xs text-slate-600 px-1 py-3">
                  No custom flows yet. Create one to get started.
                </p>
              ) : (
                <div className="space-y-2">
                  {userFlows.map(flow => (
                    <FlowCard key={flow.id} flow={flow} isSystem={false} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
