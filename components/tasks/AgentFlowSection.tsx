'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import {
  Plus,
  X,
  Bot,
  Zap,
  Gauge,
  Shield,
  Monitor,
  GripVertical,
  Workflow,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { ALL_AGENTS, getAgentById } from '@/components/chat-v2/agentConfig'
import {
  DEFAULT_PRESETS,
  RESOURCE_LEVELS,
} from '@/lib/flow-presets'
import type {
  FlowConfiguration,
  AgentConfig,
  AgentRole,
  ResourceLevel,
} from '@/components/flow-config/types'

type AgentFlowSectionProps = {
  flowConfig: FlowConfiguration
  selectedPresetId: string
  onPresetSelect: (presetId: string) => void
  onAgentToggle: (role: AgentRole) => void
  onResourceLevelChange: (role: AgentRole, level: ResourceLevel) => void
  onAgentsReorder: (agents: AgentConfig[]) => void
}

const RESOURCE_ICONS: Record<ResourceLevel, React.ReactNode> = {
  high: <Zap className="w-3 h-3" />,
  medium: <Gauge className="w-3 h-3" />,
  low: <Shield className="w-3 h-3" />,
  local: <Monitor className="w-3 h-3" />,
}

const RESOURCE_LABELS: Record<ResourceLevel, string> = {
  high: 'High',
  medium: 'Med',
  low: 'Low',
  local: 'Local',
}

export function AgentFlowSection({
  flowConfig,
  selectedPresetId,
  onPresetSelect,
  onAgentToggle,
  onResourceLevelChange,
  onAgentsReorder,
}: AgentFlowSectionProps) {
  const [showPalette, setShowPalette] = useState(false)
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const enabledAgents = flowConfig.agents.filter(a => a.enabled)

  // Cycle resource level on click
  const cycleResourceLevel = useCallback((role: AgentRole, current: ResourceLevel) => {
    const levels: ResourceLevel[] = ['low', 'medium', 'high']
    const idx = levels.indexOf(current)
    const next = levels[(idx + 1) % levels.length]
    onResourceLevelChange(role, next)
  }, [onResourceLevelChange])

  // Drag and drop reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const newAgents = [...flowConfig.agents]
    const enabledList = newAgents.filter(a => a.enabled)
    const disabledList = newAgents.filter(a => !a.enabled)

    const [moved] = enabledList.splice(draggedIndex, 1)
    enabledList.splice(targetIndex, 0, moved)

    onAgentsReorder([...enabledList, ...disabledList])
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className="space-y-4">
      {/* Section Label */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-300">
          Agent Flow
        </label>
        <span className="text-[11px] text-slate-500 tabular-nums">
          {enabledAgents.length} agent{enabledAgents.length !== 1 ? 's' : ''} active
        </span>
      </div>

      {/* Preset Ribbon */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {DEFAULT_PRESETS.map((preset) => {
          const isSelected = selectedPresetId === preset.id
          const presetAgents = preset.agents.filter(a => a.enabled)
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onPresetSelect(preset.id)}
              className={`
                group/preset relative flex-shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-xl
                transition-all duration-200 border
                ${isSelected
                  ? 'bg-white/[0.08] border-amber-500/40 shadow-[0_0_12px_-3px_rgba(245,158,11,0.25)]'
                  : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1]'
                }
              `}
            >
              {/* Stacked agent avatars */}
              <div className="flex -space-x-2">
                {presetAgents.slice(0, 4).map((a) => {
                  const agent = getAgentById(a.role)
                  return (
                    <div
                      key={a.role}
                      className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-slate-900 flex-shrink-0"
                    >
                      {agent?.avatar ? (
                        <Image
                          src={agent.avatar}
                          alt={agent.name}
                          width={24}
                          height={24}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                          <Bot className="w-3 h-3 text-slate-500" />
                        </div>
                      )}
                    </div>
                  )
                })}
                {presetAgents.length > 4 && (
                  <div className="w-6 h-6 rounded-full bg-slate-700 ring-1 ring-slate-900 flex items-center justify-center text-[9px] font-bold text-slate-400">
                    +{presetAgents.length - 4}
                  </div>
                )}
              </div>
              <div className="text-left">
                <p className={`text-xs font-semibold leading-tight ${isSelected ? 'text-amber-400' : 'text-slate-300'}`}>
                  {preset.name}
                </p>
                <p className="text-[10px] text-slate-500 leading-tight max-w-[120px] truncate">
                  {preset.description}
                </p>
              </div>
              {isSelected && (
                <div className="absolute -top-px inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
              )}
            </button>
          )
        })}
        {selectedPresetId === 'custom' && (
          <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.08] border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400">Custom</span>
          </div>
        )}
      </div>

      {/* Pipeline — enabled agents as glass cards */}
      <div className="relative rounded-xl bg-slate-900/60 border border-white/[0.06] overflow-hidden">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgb(255 255 255) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        <div className="relative p-4">
          {enabledAgents.length === 0 ? (
            <div className="py-8 text-center">
              <Workflow className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No agents in pipeline</p>
              <p className="text-xs text-slate-600 mt-1">Add agents from the palette below</p>
            </div>
          ) : (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {enabledAgents.map((agent, idx) => {
                const agentData = getAgentById(agent.role)
                const agentColor = agentData?.color || '#64748b'
                const isHovered = hoveredAgent === agent.role
                const isDragTarget = dragOverIndex === idx && draggedIndex !== idx
                const isDragging = draggedIndex === idx

                return (
                  <div key={agent.role} className="flex items-center flex-shrink-0">
                    {/* Agent Card */}
                    <div
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={() => handleDrop(idx)}
                      onDragEnd={() => { setDraggedIndex(null); setDragOverIndex(null) }}
                      onMouseEnter={() => setHoveredAgent(agent.role)}
                      onMouseLeave={() => setHoveredAgent(null)}
                      className={`
                        relative group/card w-[130px] rounded-xl overflow-hidden cursor-grab active:cursor-grabbing
                        transition-all duration-300
                        ${isDragging ? 'opacity-30 scale-95' : ''}
                        ${isDragTarget ? 'ring-2 ring-cyan-400/40 ring-offset-1 ring-offset-slate-900' : ''}
                      `}
                      style={{
                        background: 'rgb(15 23 42 / 0.7)',
                        backdropFilter: 'blur(16px)',
                        border: `1px solid ${isHovered ? `${agentColor}50` : 'rgb(255 255 255 / 0.06)'}`,
                        boxShadow: isHovered
                          ? `0 0 20px -4px ${agentColor}30, 0 4px 12px -2px rgb(0 0 0 / 0.3)`
                          : '0 2px 8px -2px rgb(0 0 0 / 0.2)',
                      }}
                    >
                      {/* Top glow accent */}
                      <div
                        className="absolute top-0 inset-x-0 h-px transition-opacity duration-300"
                        style={{
                          background: `linear-gradient(to right, transparent, ${agentColor}80, transparent)`,
                          opacity: isHovered ? 1 : 0.5,
                        }}
                      />

                      {/* Drag handle */}
                      <div className="absolute top-1 left-1 opacity-0 group-hover/card:opacity-40 transition-opacity">
                        <GripVertical className="w-3 h-3 text-slate-400" />
                      </div>

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onAgentToggle(agent.role) }}
                        className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full bg-slate-800/80 border border-white/[0.08] flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-200 hover:bg-red-500/20 hover:border-red-500/30"
                      >
                        <X className="w-3 h-3 text-slate-400 group-hover/card:text-red-400" />
                      </button>

                      <div className="p-3 flex flex-col items-center gap-2">
                        {/* Step order */}
                        <div
                          className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-widest opacity-40"
                          style={{ color: agentColor }}
                        >
                          #{idx + 1}
                        </div>

                        {/* Avatar */}
                        <div className="relative mt-2">
                          <div
                            className="absolute -inset-1 rounded-full transition-opacity duration-500 blur-md"
                            style={{
                              backgroundColor: agentColor,
                              opacity: isHovered ? 0.35 : 0.15,
                            }}
                          />
                          <div
                            className="relative w-12 h-12 rounded-full overflow-hidden ring-[1.5px] ring-offset-1 ring-offset-transparent transition-all duration-300"
                            style={{
                              ['--tw-ring-color' as string]: agentColor,
                              ['--tw-ring-offset-color' as string]: 'rgb(15 23 42)',
                            }}
                          >
                            {agentData?.avatar ? (
                              <Image
                                src={agentData.avatar}
                                alt={agentData.name}
                                width={48}
                                height={48}
                                className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-slate-500" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Name */}
                        <p
                          className="text-[11px] font-bold truncate w-full text-center transition-colors duration-300"
                          style={{ color: agentColor }}
                        >
                          {agentData?.name || agent.role}
                        </p>

                        {/* Resource level pill — click to cycle */}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); cycleResourceLevel(agent.role, agent.resourceLevel) }}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                          style={{
                            color: `${agentColor}cc`,
                            backgroundColor: `${agentColor}12`,
                            border: `1px solid ${agentColor}25`,
                          }}
                          title={`Click to change: ${RESOURCE_LEVELS.find(l => l.value === agent.resourceLevel)?.description}`}
                        >
                          {RESOURCE_ICONS[agent.resourceLevel]}
                          <span className="text-[10px] font-semibold">
                            {RESOURCE_LABELS[agent.resourceLevel]}
                          </span>
                        </button>
                      </div>

                      {/* Bottom accent line */}
                      <div
                        className="absolute bottom-0 inset-x-0 h-px transition-opacity duration-500"
                        style={{
                          background: `linear-gradient(to right, transparent, ${agentColor}60, transparent)`,
                          opacity: isHovered ? 0.8 : 0.3,
                        }}
                      />
                    </div>

                    {/* Arrow connector */}
                    {idx < enabledAgents.length - 1 && (
                      <div className="mx-1.5 flex-shrink-0">
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Add agent button */}
              <button
                type="button"
                onClick={() => setShowPalette(!showPalette)}
                className={`
                  flex-shrink-0 w-[130px] rounded-xl border-2 border-dashed transition-all duration-200
                  flex flex-col items-center justify-center py-6 gap-1
                  ${showPalette
                    ? 'border-cyan-500/30 bg-cyan-500/5 text-cyan-400'
                    : 'border-white/[0.08] hover:border-white/[0.15] text-slate-500 hover:text-slate-400'
                  }
                `}
              >
                <Plus className={`w-5 h-5 transition-transform duration-200 ${showPalette ? 'rotate-45' : ''}`} />
                <span className="text-[10px] font-medium">
                  {showPalette ? 'Close' : 'Add Agent'}
                </span>
              </button>
            </div>
          )}

          {/* Resource level legend */}
          {enabledAgents.length > 0 && (
            <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-white/[0.04]">
              {(['high', 'medium', 'low'] as ResourceLevel[]).map(level => (
                <div key={level} className="flex items-center gap-1 text-[10px] text-slate-500">
                  {RESOURCE_ICONS[level]}
                  <span className="font-medium">{RESOURCE_LABELS[level]}:</span>
                  <span className="text-slate-600">
                    {level === 'high' ? 'Deep reasoning' : level === 'medium' ? 'Balanced' : 'Fast'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Agent Palette (expandable) */}
      {showPalette && (
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Available Agents
            </p>
            <p className="text-[10px] text-slate-600">
              Click to add to pipeline
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ALL_AGENTS.filter(a => a.id !== 'caesar').map((agentData) => {
              const isEnabled = enabledAgents.some(a => a.role === agentData.id)
              const agentColor = agentData.color
              const isPaletteHovered = hoveredAgent === `palette-${agentData.id}`

              return (
                <button
                  key={agentData.id}
                  type="button"
                  onClick={() => {
                    onAgentToggle(agentData.id as AgentRole)
                    if (!isEnabled) setShowPalette(false)
                  }}
                  onMouseEnter={() => setHoveredAgent(`palette-${agentData.id}`)}
                  onMouseLeave={() => setHoveredAgent(null)}
                  className={`
                    group/palette relative flex items-center gap-2.5 p-2.5 rounded-xl
                    transition-all duration-200 text-left border
                    ${isEnabled
                      ? 'bg-white/[0.06] border-white/[0.12] opacity-50'
                      : 'bg-white/[0.02] border-transparent hover:bg-white/[0.05] hover:border-white/[0.08]'
                    }
                  `}
                  disabled={isEnabled}
                >
                  {/* Hover glow */}
                  {!isEnabled && (
                    <div
                      className="absolute -inset-px rounded-xl opacity-0 group-hover/palette:opacity-100 transition-opacity duration-300 blur-sm pointer-events-none"
                      style={{ background: `linear-gradient(135deg, ${agentColor}20, transparent 60%)` }}
                    />
                  )}

                  <div className="relative flex-shrink-0">
                    <div
                      className="absolute -inset-0.5 rounded-full blur-sm transition-opacity duration-300"
                      style={{
                        backgroundColor: agentColor,
                        opacity: isPaletteHovered && !isEnabled ? 0.3 : 0,
                      }}
                    />
                    <div
                      className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-offset-1 ring-offset-slate-900"
                      style={{ ['--tw-ring-color' as string]: isEnabled ? '#475569' : agentColor }}
                    >
                      {agentData.avatar ? (
                        <Image
                          src={agentData.avatar}
                          alt={agentData.name}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                          <Bot className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 relative">
                    <p className="text-[11px] font-semibold text-slate-200 truncate">
                      {agentData.name}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {agentData.specialty || agentData.role}
                    </p>
                  </div>

                  {isEnabled ? (
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Added</span>
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-slate-600 group-hover/palette:text-cyan-400 transition-colors flex-shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state — show palette by default when no agents */}
      {enabledAgents.length === 0 && !showPalette && (
        <button
          type="button"
          onClick={() => setShowPalette(true)}
          className="w-full py-3 text-center text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          Open agent palette to get started
        </button>
      )}
    </div>
  )
}
