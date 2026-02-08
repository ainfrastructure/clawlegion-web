'use client'

import { useState } from 'react'
import { Plus, Trash2, Copy, Lock, Loader2 } from 'lucide-react'
import type { FlowPreset } from '@/components/flow-config/types'
import { AGENT_METADATA } from '@/lib/flow-presets'

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

  const renderAgentEmojis = (flow: FlowPreset) => {
    const agents = flow.agents.filter(a => a.enabled)
    return (
      <div className="flex -space-x-1">
        {agents.slice(0, 5).map((agent, i) => {
          const meta = AGENT_METADATA[agent.role]
          if (!meta) return null
          return (
            <span key={i} className="text-xs" title={meta.name}>
              {meta.emoji}
            </span>
          )
        })}
        {agents.length > 5 && (
          <span className="text-[10px] text-slate-500 ml-1">+{agents.length - 5}</span>
        )}
      </div>
    )
  }

  const FlowCard = ({ flow, isSystem }: { flow: FlowPreset; isSystem: boolean }) => {
    const isActive = activeFlowId === flow.id
    return (
      <div
        className={`group relative rounded-xl p-3 cursor-pointer transition-all duration-200
          ${isActive ? 'glass-3 border border-cyan-500/30 ring-1 ring-cyan-500/20' : 'glass-2 hover:border-white/[0.1]'}
        `}
        onClick={() => onSelectFlow(flow)}
      >
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
              {renderAgentEmojis(flow)}
              <span className="text-[10px] text-slate-600">
                {flow.agents.filter(a => a.enabled).length} agents
              </span>
            </div>
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
