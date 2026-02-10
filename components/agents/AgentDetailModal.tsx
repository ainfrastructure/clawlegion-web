'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Bot, Zap, FileText, BookOpen, ChevronRight, Trash2, Loader2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { StatusBadge, type AgentStatus } from '@/components/ui/StatusBadge'
import { ReachabilityIndicator } from './ReachabilityIndicator'
import { SoulEditorModal } from './SoulEditorModal'
import { AgentsEditorModal } from './AgentsEditorModal'
import { getAgentById, getAgentByName } from '@/components/chat-v2/agentConfig'
import { useSoul, useAgentsmd } from '@/hooks/useAgentConfig'
import api from '@/lib/api'

type AgentInfo = {
  id: string
  name: string
  emoji?: string
  avatar?: string
  role?: string
  color?: string
  status: AgentStatus
  currentTask?: string
  healthEndpoint?: string
  reachable?: boolean | null
  latencyMs?: number
}

interface AgentDetailModalProps {
  agent: AgentInfo | null
  isOpen: boolean
  onClose: () => void
  onDeleted?: () => void
}

export function AgentDetailModal({ agent, isOpen, onClose, onDeleted }: AgentDetailModalProps) {
  const [showSoulEditor, setShowSoulEditor] = useState(false)
  const [showAgentsEditor, setShowAgentsEditor] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const queryClient = useQueryClient()

  const enriched = agent ? (getAgentById(agent.id) || getAgentByName(agent.name)) : null
  // Fallback to agent name (lowercase) if enrichment fails — matches old AgentProfilePanel behavior
  const openclawAgentId = enriched?.openclawAgentId || (agent?.name?.toLowerCase() ?? null)

  const { data: soulData, isLoading: soulLoading } = useSoul(openclawAgentId)
  const { data: agentsmdData, isLoading: agentsmdLoading } = useAgentsmd(openclawAgentId)

  const deleteAgent = useMutation({
    mutationFn: async (agentId: string) => {
      const res = await api.delete(`/agents/${agentId}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents-org'] })
      queryClient.invalidateQueries({ queryKey: ['agents-health'] })
      setShowDeleteConfirm(false)
      onClose()
      onDeleted?.()
    },
  })

  if (!agent) return null

  const avatarSrc = agent.avatar || enriched?.avatar
  const agentColor = agent.color || enriched?.color || '#71717a'
  const role = agent.role || enriched?.role || 'Agent'
  const longDescription = enriched?.longDescription || enriched?.description || ''
  const capabilities = enriched?.capabilities || []
  const specialty = enriched?.specialty || ''
  const agentName = enriched?.name || agent.name

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <div className="space-y-6">
          {/* Hero avatar */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {/* Glow backdrop */}
              <div
                className="absolute -inset-4 rounded-full opacity-20 blur-xl"
                style={{ backgroundColor: agentColor }}
              />
              <div className="relative w-[200px] h-[200px] rounded-full overflow-hidden ring-2 ring-offset-4 ring-offset-slate-900"
                style={{ ['--tw-ring-color' as string]: agentColor }}
              >
                {avatarSrc ? (
                  <Image
                    src={avatarSrc}
                    alt={agent.name}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                ) : agent.emoji ? (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center text-7xl">
                    {agent.emoji}
                  </div>
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    <Bot size={80} className="text-slate-500" />
                  </div>
                )}
              </div>
            </div>

            {/* Name + role */}
            <h2 className="text-2xl font-bold text-white mt-4">{agent.name}</h2>
            <p className="text-sm font-medium" style={{ color: agentColor }}>{role}</p>
            {specialty && (
              <p className="text-xs text-slate-500 mt-0.5">{specialty}</p>
            )}
            <div className="mt-2">
              <StatusBadge status={agent.status} size="md" />
            </div>
          </div>

          {/* Long description */}
          {longDescription && (
            <div className="glass-1 rounded-xl p-4">
              <p className="text-sm text-slate-300 leading-relaxed">{longDescription}</p>
            </div>
          )}

          {/* Capabilities */}
          {capabilities.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2">Capabilities</h3>
              <div className="flex flex-wrap gap-2">
                {capabilities.map((cap) => (
                  <span
                    key={cap}
                    className="glass-1 text-sm text-slate-300 px-3 py-1 rounded-full"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Current task */}
          {agent.currentTask && (
            <div className="glass-1 rounded-xl p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                <Zap size={14} className="text-amber-400" />
                Current Task
              </h3>
              <p className="text-sm text-blue-400 font-mono">{agent.currentTask}</p>
            </div>
          )}

          {/* Health status */}
          {agent.healthEndpoint && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Health:</span>
              <ReachabilityIndicator
                reachable={agent.reachable ?? null}
                latencyMs={agent.latencyMs}
                size="sm"
              />
            </div>
          )}

          {/* SOUL.md Summary */}
          {openclawAgentId && (
            <div className="glass-2 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-medium text-white flex items-center gap-2">
                    <FileText size={16} className="text-purple-400" />
                    SOUL.md
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 ml-6">Personality, values, and behavioral guidelines</p>
                </div>
                {soulData && (
                  <button
                    onClick={() => setShowSoulEditor(true)}
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    View Full <ChevronRight size={14} />
                  </button>
                )}
              </div>
              {soulLoading ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Loader2 size={14} className="animate-spin" /> Loading...
                </div>
              ) : soulData ? (
                <>
                  <p className="text-sm text-slate-400 italic line-clamp-3">
                    &ldquo;{soulData.summary}&rdquo;
                  </p>
                  {soulData.path && (
                    <p className="text-[10px] text-slate-600 font-mono mt-2 truncate" title={soulData.path}>
                      {soulData.path}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-500">Not configured</p>
              )}
            </div>
          )}

          {/* AGENTS.md Summary */}
          {openclawAgentId && (
            <div className="glass-2 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-medium text-white flex items-center gap-2">
                    <BookOpen size={16} className="text-blue-400" />
                    AGENTS.md
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 ml-6">Workspace rules, coding standards, and workflow guidelines</p>
                </div>
                {agentsmdData && (
                  <button
                    onClick={() => setShowAgentsEditor(true)}
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    View Full <ChevronRight size={14} />
                  </button>
                )}
              </div>
              {agentsmdLoading ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Loader2 size={14} className="animate-spin" /> Loading...
                </div>
              ) : agentsmdData ? (
                <>
                  <p className="text-sm text-slate-400 italic line-clamp-3">
                    &ldquo;{agentsmdData.summary}&rdquo;
                  </p>
                  {agentsmdData.path && (
                    <p className="text-[10px] text-slate-600 font-mono mt-2 truncate" title={agentsmdData.path}>
                      {agentsmdData.path}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-500">Not configured</p>
              )}
            </div>
          )}

          {/* Delete Agent */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm text-red-400 border border-red-500/20 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <Trash2 size={16} />
            Delete Agent
          </button>
        </div>
      </Modal>

      {/* SOUL Editor Modal */}
      {showSoulEditor && openclawAgentId && (
        <SoulEditorModal
          agentId={openclawAgentId}
          agentName={agentName}
          onClose={() => setShowSoulEditor(false)}
        />
      )}

      {/* AGENTS.md Editor Modal */}
      {showAgentsEditor && openclawAgentId && (
        <AgentsEditorModal
          agentId={openclawAgentId}
          agentName={agentName}
          onClose={() => setShowAgentsEditor(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteAgent.mutate(agent.id)}
        title="Delete Agent"
        message={`Are you sure you want to delete ${agent.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteAgent.isPending}
      />
    </>
  )
}
