'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import Image from 'next/image'
import { Bot, FileText } from 'lucide-react'
import { getAgentById } from '@/components/chat-v2/agentConfig'
import type { ResourceLevel } from '@/components/flow-config/types'

export type FlowAgentNodeData = {
  role: string
  agentName: string
  avatar?: string
  agentColor: string
  resourceLevel: ResourceLevel
  enabled: boolean
  order: number
  hasContext: boolean
  stepId: string
}

const RESOURCE_LABELS: Record<ResourceLevel, string> = {
  high: 'High',
  medium: 'Med',
  low: 'Low',
  local: 'Local',
}

export const FlowAgentNode = memo(({ data, selected }: NodeProps) => {
  const d = data as FlowAgentNodeData
  const agent = getAgentById(d.role)
  const avatarSrc = d.avatar || agent?.avatar

  return (
    <div
      className={`
        relative w-[180px] rounded-2xl overflow-hidden
        transition-all duration-300 animate-node-appear
        ${d.enabled ? '' : 'opacity-40'}
        ${selected ? 'ring-2 ring-cyan-400/50' : ''}
      `}
      style={{
        background: 'rgb(15 23 42 / 0.85)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${selected ? 'rgb(6 182 212 / 0.4)' : 'rgb(255 255 255 / 0.08)'}`,
        boxShadow: selected
          ? `0 0 20px -4px ${d.agentColor}40, 0 4px 24px -1px rgb(0 0 0 / 0.3)`
          : '0 4px 24px -1px rgb(0 0 0 / 0.3)',
      }}
    >
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-slate-600 !border-slate-500 !-left-1" />

      {/* Top glow accent */}
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${d.agentColor}60, transparent)` }}
      />

      <div className="p-4 flex flex-col items-center gap-3">
        {/* Step order badge */}
        <div
          className="absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
          style={{ backgroundColor: d.agentColor }}
        >
          {d.order + 1}
        </div>

        {/* Context indicator */}
        {d.hasContext && (
          <div className="absolute top-2 right-2" title="Has custom instructions">
            <FileText className="w-3.5 h-3.5 text-cyan-400/60" />
          </div>
        )}

        {/* Avatar */}
        <div className="relative">
          <div
            className="absolute -inset-1 rounded-full opacity-30 blur-sm"
            style={{ backgroundColor: d.agentColor }}
          />
          <div
            className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-offset-1 ring-offset-slate-900"
            style={{ ['--tw-ring-color' as string]: d.agentColor }}
          >
            {avatarSrc ? (
              <Image
                src={avatarSrc}
                alt={d.agentName}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                <Bot className="w-6 h-6 text-slate-500" />
              </div>
            )}
          </div>
        </div>

        {/* Name + Role */}
        <div className="text-center w-full">
          <p className="text-sm font-bold truncate" style={{ color: d.agentColor }}>
            {d.agentName}
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">
            {agent?.role || d.role}
          </p>
        </div>

        {/* Resource level pill */}
        <div
          className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full"
          style={{
            color: `${d.agentColor}cc`,
            backgroundColor: `${d.agentColor}15`,
            border: `1px solid ${d.agentColor}30`,
          }}
        >
          {RESOURCE_LABELS[d.resourceLevel]}
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-slate-600 !border-slate-500 !-right-1" />
    </div>
  )
})

FlowAgentNode.displayName = 'FlowAgentNode'
