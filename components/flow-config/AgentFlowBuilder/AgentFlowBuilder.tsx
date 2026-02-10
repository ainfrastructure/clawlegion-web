'use client'

import { ArrowRight } from 'lucide-react'
import { AgentCard } from './AgentCard'
import { AGENT_METADATA } from '@/lib/flow-presets'
import type { AgentFlowBuilderProps, AgentConfig, AgentRole } from '../types'

const AGENT_ORDER: AgentRole[] = ['scout', 'athena', 'vulcan', 'janus']

export function AgentFlowBuilder({ agents, onChange }: AgentFlowBuilderProps) {
  const handleAgentChange = (updatedAgent: AgentConfig) => {
    const newAgents = agents.map(a => 
      a.role === updatedAgent.role ? updatedAgent : a
    )
    onChange(newAgents)
  }

  // Sort agents by the defined order
  const sortedAgents = [...agents].sort((a, b) => 
    AGENT_ORDER.indexOf(a.role) - AGENT_ORDER.indexOf(b.role)
  )

  // Get enabled agents for flow preview
  const enabledAgents = sortedAgents.filter(a => a.enabled)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Agent Pipeline</h3>
          <p className="text-sm text-slate-400 mt-1">
            Configure which agents will work on this task
          </p>
        </div>
        <div className="text-sm text-slate-500">
          {enabledAgents.length} of {agents.length} active
        </div>
      </div>

      {/* Mini Flow Preview */}
      {enabledAgents.length > 0 && (
        <div className="flex items-center justify-center gap-2 p-3 glass-2 rounded-lg">
          {enabledAgents.map((agent, index) => {
            const metadata = AGENT_METADATA[agent.role]
            return (
              <div key={agent.role} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-700/50 rounded-md">
                  <span className="text-sm">{metadata.emoji}</span>
                  <span className="text-xs font-medium text-slate-300">{metadata.name}</span>
                </div>
                {index < enabledAgents.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Agent Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedAgents.map((agent) => {
          const metadata = AGENT_METADATA[agent.role]
          return (
            <AgentCard
              key={agent.role}
              config={agent}
              metadata={metadata}
              onChange={handleAgentChange}
            />
          )
        })}
      </div>

      {/* Warning if no agents enabled */}
      {enabledAgents.length === 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-sm text-amber-400">
            ⚠️ At least one agent must be enabled to run a task.
          </p>
        </div>
      )}

      {/* Quick Tips */}
      <div className="text-xs text-slate-500 space-y-1">
        <p>💡 <span className="text-slate-400">Quick Fix:</span> Enable only Vulcan + Vex for small bugs</p>
        <p>💡 <span className="text-slate-400">Deep Work:</span> Enable all agents with high resources for complex features</p>
      </div>
    </div>
  )
}

export default AgentFlowBuilder
