'use client'

import { ArrowRight, Zap } from 'lucide-react'
import { AGENT_METADATA, getAgentColorClasses } from '@/lib/flow-presets'
import type { FlowPreviewProps, AgentRole } from '../types'

const AGENT_ORDER: AgentRole[] = ['scout', 'athena', 'vulcan', 'vex']

export function FlowPreview({ agents }: FlowPreviewProps) {
  // Sort agents by the defined order
  const sortedAgents = [...agents].sort((a, b) => 
    AGENT_ORDER.indexOf(a.role) - AGENT_ORDER.indexOf(b.role)
  )

  const enabledAgents = sortedAgents.filter(a => a.enabled)

  if (enabledAgents.length === 0) {
    return (
      <div className="p-6 bg-slate-800/30 border border-white/[0.06] rounded-xl text-center">
        <div className="text-slate-400 mb-2">
          <Zap className="w-8 h-8 mx-auto opacity-30" />
        </div>
        <p className="text-sm text-slate-500">No agents enabled</p>
        <p className="text-xs text-slate-600 mt-1">Enable at least one agent to see the flow</p>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/[0.06] rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-sm font-semibold text-slate-300">Execution Pipeline</h4>
        <span className="text-xs text-slate-500">
          {enabledAgents.length} step{enabledAgents.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Pipeline Visualization */}
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-full transform -translate-y-1/2" />
        
        {/* Animated flow indicator */}
        <div className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transform -translate-y-1/2 animate-pulse" 
          style={{ width: '100%', opacity: 0.3 }} 
        />

        {/* Agent Nodes */}
        <div className="relative flex items-center justify-between">
          {sortedAgents.map((agent, index) => {
            const meta = AGENT_METADATA[agent.role]
            const colors = getAgentColorClasses(meta.color)
            const isEnabled = agent.enabled
            const isLast = index === sortedAgents.length - 1

            return (
              <div key={agent.role} className="flex items-center">
                {/* Node */}
                <div
                  className={`
                    relative flex flex-col items-center transition-all duration-300
                    ${isEnabled ? 'scale-100' : 'scale-90 opacity-40'}
                  `}
                >
                  {/* Resource Badge */}
                  {isEnabled && (
                    <div className={`
                      absolute -top-2 -right-2 px-1.5 py-0.5 text-[10px] font-bold 
                      rounded-full border ${colors.border} ${colors.bgLight} ${colors.text}
                    `}>
                      {agent.resourceLevel.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Agent Circle */}
                  <div
                    className={`
                      relative w-16 h-16 rounded-full flex items-center justify-center
                      border-2 transition-all duration-300
                      ${isEnabled 
                        ? `${colors.border} ${colors.bgLight} shadow-lg` 
                        : 'border-slate-600 bg-slate-800'}
                      ${isEnabled ? 'shadow-' + meta.color + '-500/20' : ''}
                    `}
                  >
                    <span className="text-2xl">{meta.emoji}</span>
                    
                    {/* Glow effect when enabled */}
                    {isEnabled && (
                      <div 
                        className={`absolute inset-0 rounded-full ${colors.bg} opacity-10 animate-pulse`}
                      />
                    )}
                  </div>

                  {/* Agent Name */}
                  <span className={`
                    mt-2 text-xs font-medium transition-colors duration-300
                    ${isEnabled ? colors.text : 'text-slate-500'}
                  `}>
                    {meta.name}
                  </span>

                  {/* Status Text */}
                  <span className={`
                    text-[10px] transition-colors duration-300
                    ${isEnabled ? 'text-slate-400' : 'text-slate-600'}
                  `}>
                    {isEnabled ? 'Active' : 'Skipped'}
                  </span>
                </div>

                {/* Arrow */}
                {!isLast && (
                  <div className="mx-4 flex items-center">
                    <ArrowRight className={`
                      w-5 h-5 transition-colors duration-300
                      ${isEnabled && sortedAgents[index + 1]?.enabled 
                        ? 'text-blue-400' 
                        : 'text-slate-600'}
                    `} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Flow Statistics */}
      <div className="mt-6 pt-4 border-t border-white/[0.06] grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-lg font-bold text-blue-400">{enabledAgents.length}</p>
          <p className="text-xs text-slate-500">Active</p>
        </div>
        <div>
          <p className="text-lg font-bold text-slate-400">{sortedAgents.length - enabledAgents.length}</p>
          <p className="text-xs text-slate-500">Skipped</p>
        </div>
        <div>
          <p className="text-lg font-bold text-purple-400">
            {enabledAgents.filter(a => a.resourceLevel === 'high').length}
          </p>
          <p className="text-xs text-slate-500">High Power</p>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-slate-500">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500" /> Scout
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-cyan-500" /> Athena
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" /> Vulcan
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500" /> Vex
        </div>
      </div>
    </div>
  )
}

export default FlowPreview
