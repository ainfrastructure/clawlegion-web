'use client'

import Image from 'next/image'
import { Bot, Settings, Zap } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { StatusBadge, type AgentStatus } from '@/components/ui/StatusBadge'
import { ReachabilityIndicator } from './ReachabilityIndicator'
import { getAgentById, getAgentByName } from '@/components/chat-v2/agentConfig'

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
  onOpenConfig?: (agentId: string) => void
}

export function AgentDetailModal({ agent, isOpen, onClose, onOpenConfig }: AgentDetailModalProps) {
  if (!agent) return null

  const enriched = getAgentById(agent.id) || getAgentByName(agent.name)
  const avatarSrc = agent.avatar || enriched?.avatar
  const agentColor = agent.color || enriched?.color || '#71717a'
  const role = agent.role || enriched?.role || 'Agent'
  const longDescription = enriched?.longDescription || enriched?.description || ''
  const capabilities = enriched?.capabilities || []
  const specialty = enriched?.specialty || ''

  return (
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

        {/* Open Config button */}
        {onOpenConfig && (
          <button
            onClick={() => onOpenConfig(agent.id)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 glass-2 rounded-xl text-sm text-slate-300 hover:text-white transition-colors"
          >
            <Settings size={16} />
            Open Config
          </button>
        )}
      </div>
    </Modal>
  )
}
