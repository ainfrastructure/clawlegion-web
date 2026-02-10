'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import {
  X,
  Save,
  Bot,
  RefreshCw,
  FileText,
  Settings,
  Brain,
  Loader2,
  Check,
  AlertCircle,
  ChevronRight,
  BookOpen,
  HelpCircle,
  Play,
  Pause,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  useAgentConfig,
  useSoul,
  useAgentsmd,
  useUpdateAgentConfig,
  useRestartGateway,
} from '@/hooks/useAgentConfig'
import { InjectTaskModal } from './InjectTaskModal'
import { StatusBadge, type AgentStatus } from '@/components/ui/StatusBadge'
import { Tooltip } from '@/components/ui/Tooltip'
import { SoulEditorModal } from './SoulEditorModal'
import { AgentsEditorModal } from './AgentsEditorModal'
import { getAgentById, getAgentByName } from '@/components/chat-v2/agentConfig'

interface AgentProfilePanelProps {
  agentId: string | null
  onClose: () => void
  agentStatus?: AgentStatus
}

export function AgentProfilePanel({ agentId, onClose, agentStatus = 'offline' }: AgentProfilePanelProps) {
  // Resolve enriched data from agentConfig (always available)
  // Try by ID first (e.g., "vulcan"), then by name (e.g., "Vulcan")
  const enriched = agentId ? (getAgentById(agentId) || getAgentByName(agentId)) : undefined
  // Use openclaw agent ID for backend calls (if available)
  const openclawId = enriched?.openclawAgentId || agentId

  const { data: configData, isLoading: configLoading } = useAgentConfig(openclawId)
  const { data: soulData, isLoading: soulLoading } = useSoul(openclawId)
  const { data: agentsmdData, isLoading: agentsmdLoading } = useAgentsmd(openclawId)
  const updateConfig = useUpdateAgentConfig()
  const restartGateway = useRestartGateway()

  // Local state for editing
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [selectedThinking, setSelectedThinking] = useState<string>('')
  const [hasChanges, setHasChanges] = useState(false)
  const [showSoulEditor, setShowSoulEditor] = useState(false)
  const [showAgentsEditor, setShowAgentsEditor] = useState(false)
  const [showInjectTask, setShowInjectTask] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const queryClient = useQueryClient()

  const pauseAgent = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/agents/${openclawId}/pause`, { method: 'POST' })
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agents'] }),
  })

  const resumeAgent = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/agents/${openclawId}/resume`, { method: 'POST' })
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agents'] }),
  })

  // Initialize local state from fetched data
  useEffect(() => {
    if (configData?.agent) {
      setSelectedModel(configData.agent.model || 'anthropic/claude-sonnet-4')

      // Determine thinking level from budget_tokens
      const budgetTokens = configData.agent.thinking?.budget_tokens
      if (budgetTokens !== undefined) {
        const level = configData.thinkingLevels.find(l => l.budgetTokens === budgetTokens)
        setSelectedThinking(level?.id || configData.defaults?.thinkingDefault || 'high')
      } else {
        setSelectedThinking(configData.defaults?.thinkingDefault || 'high')
      }
      setHasChanges(false)
    }
  }, [configData])

  const handleModelChange = (model: string) => {
    setSelectedModel(model)
    setHasChanges(true)
    setSaveStatus('idle')
  }

  const handleThinkingChange = (thinking: string) => {
    setSelectedThinking(thinking)
    setHasChanges(true)
    setSaveStatus('idle')
  }

  const handleSave = async () => {
    if (!openclawId || !configData) return

    setSaveStatus('saving')
    try {
      // Find the thinking level to get budget tokens
      const thinkingLevel = configData.thinkingLevels.find(l => l.id === selectedThinking)

      await updateConfig.mutateAsync({
        agentId: openclawId,
        updates: {
          model: selectedModel,
          thinking: {
            type: selectedThinking === 'off' ? 'disabled' : 'enabled',
            budget_tokens: thinkingLevel?.budgetTokens || 0,
          },
        },
      })

      // Restart gateway after config save
      await restartGateway.mutateAsync()

      setSaveStatus('saved')
      setHasChanges(false)

      // Reset status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Failed to save config:', error)
      setSaveStatus('error')
    }
  }

  if (!agentId) return null

  const agent = configData?.agent
  // Only show loading for initial config fetch; soul/agentsmd are optional
  const isLoading = configLoading

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-900 border-l border-white/[0.06] z-50 overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-white/[0.06] px-4 py-3 flex items-center justify-between z-10">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
          
          {agent && (
            <div className="flex items-center gap-2">
              {saveStatus === 'saving' && (
                <span className="text-sm text-slate-400 flex items-center gap-1">
                  <Loader2 size={14} className="animate-spin" /> Saving...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-sm text-green-400 flex items-center gap-1">
                  <Check size={14} /> Saved!
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle size={14} /> Error
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={!hasChanges || saveStatus === 'saving'}
                className={cn(
                  "px-4 py-2 rounded-lg flex items-center gap-2 transition-colors",
                  hasChanges
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                )}
              >
                <Save size={16} />
                Save
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-slate-400" size={32} />
          </div>
        ) : !agent && !enriched ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Bot size={48} className="mb-4" />
            <p>Agent not found</p>
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {/* Agent Header — larger avatar + enriched info */}
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-800 flex-shrink-0">
                {agent?.identity?.avatar ? (
                  <Image
                    src={agent.identity.avatar.startsWith('/') ? agent.identity.avatar : (enriched?.avatar || `/agents/${agentId}.png`)}
                    alt={enriched?.name || agent?.name || agentId}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : enriched?.avatar ? (
                  <Image
                    src={enriched.avatar}
                    alt={enriched.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : agent?.identity?.emoji || enriched?.emoji ? (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    {agent?.identity?.emoji || enriched?.emoji}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Bot size={40} className="text-slate-500" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-white truncate">{enriched?.name || agent?.name || agentId}</h2>
                <p className="text-slate-400 text-sm">{enriched?.role || agent?.identity?.name || agentId}</p>
                <div className="mt-1">
                  <StatusBadge status={agentStatus} size="sm" />
                </div>
              </div>
            </div>

            {/* Enriched description + capabilities */}
            {enriched && (
              <div className="glass-2 rounded-xl p-4">
                <p className="text-sm text-slate-300 mb-3">{enriched.description}</p>
                {enriched.capabilities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {enriched.capabilities.map((cap) => (
                      <span key={cap} className="glass-1 text-xs text-slate-400 px-2 py-0.5 rounded-full">
                        {cap}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Agent Controls */}
            <div className="glass-2 rounded-xl p-4">
              <h3 className="font-medium text-white flex items-center gap-2 mb-3">
                <Zap size={16} className="text-amber-400" />
                Agent Controls
              </h3>
              <div className="flex gap-2">
                {agentStatus === 'online' || agentStatus === 'busy' ? (
                  <button
                    onClick={() => pauseAgent.mutate()}
                    disabled={pauseAgent.isPending}
                    className="flex-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Pause size={14} />
                    {pauseAgent.isPending ? 'Pausing...' : 'Pause'}
                  </button>
                ) : (
                  <button
                    onClick={() => resumeAgent.mutate()}
                    disabled={resumeAgent.isPending || agentStatus === 'offline'}
                    className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Play size={14} />
                    {resumeAgent.isPending ? 'Resuming...' : 'Resume'}
                  </button>
                )}
                <button
                  onClick={() => setShowInjectTask(true)}
                  disabled={agentStatus === 'offline'}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Zap size={14} />
                  Inject Task
                </button>
              </div>
            </div>

            {/* SOUL Summary */}
            {soulData && (
              <div className="glass-2 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-white flex items-center gap-2">
                    <FileText size={16} className="text-purple-400" />
                    SOUL.md
                    <Tooltip
                      position="bottom"
                      content={
                        <div className="whitespace-normal max-w-[260px] py-0.5">
                          <p className="font-medium text-white mb-1">Agent Soul</p>
                          <p className="text-slate-300 text-xs leading-relaxed">
                            Defines the agent&apos;s personality, communication style, values, and behavioral guidelines. Edit this to shape how the agent thinks and responds.
                          </p>
                        </div>
                      }
                    >
                      <HelpCircle size={14} className="text-slate-500 hover:text-purple-400 cursor-help transition-colors" />
                    </Tooltip>
                  </h3>
                  <button
                    onClick={() => setShowSoulEditor(true)}
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    View Full <ChevronRight size={14} />
                  </button>
                </div>
                <p className="text-sm text-slate-400 italic line-clamp-3">
                  &ldquo;{soulData.summary}&rdquo;
                </p>
                {soulData.path && (
                  <p className="text-[10px] text-slate-600 font-mono mt-2 truncate" title={soulData.path}>
                    {soulData.path}
                  </p>
                )}
              </div>
            )}

            {/* AGENTS.md Summary */}
            {agentsmdData && (
              <div className="glass-2 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-white flex items-center gap-2">
                    <BookOpen size={16} className="text-blue-400" />
                    AGENTS.md
                    <Tooltip
                      position="bottom"
                      content={
                        <div className="whitespace-normal max-w-[260px] py-0.5">
                          <p className="font-medium text-white mb-1">Workspace Rules</p>
                          <p className="text-slate-300 text-xs leading-relaxed">
                            Project-specific instructions, coding standards, and workflow guidelines that the agent follows when working in its workspace.
                          </p>
                        </div>
                      }
                    >
                      <HelpCircle size={14} className="text-slate-500 hover:text-blue-400 cursor-help transition-colors" />
                    </Tooltip>
                  </h3>
                  <button
                    onClick={() => setShowAgentsEditor(true)}
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    View Full <ChevronRight size={14} />
                  </button>
                </div>
                <p className="text-sm text-slate-400 italic line-clamp-3">
                  &ldquo;{agentsmdData.summary}&rdquo;
                </p>
                {agentsmdData.path && (
                  <p className="text-[10px] text-slate-600 font-mono mt-2 truncate" title={agentsmdData.path}>
                    {agentsmdData.path}
                  </p>
                )}
              </div>
            )}

            {/* Configuration — only show when openclaw config is available */}
            {agent && (
              <div className="glass-2 rounded-xl p-4">
                <h3 className="font-medium text-white flex items-center gap-2 mb-4">
                  <Settings size={16} className="text-blue-400" />
                  Configuration
                </h3>

                <div className="space-y-4">
                  {/* Model Selector */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Model</label>
                    <select
                      value={selectedModel}
                      onChange={(e) => handleModelChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {configData?.models.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name} ({model.tier})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Thinking Level Selector */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2 flex items-center gap-2">
                      <Brain size={14} />
                      Thinking Level
                    </label>
                    <div className="grid grid-cols-5 gap-1">
                      {configData?.thinkingLevels.map((level) => (
                        <button
                          key={level.id}
                          onClick={() => handleThinkingChange(level.id)}
                          className={cn(
                            "px-2 py-1.5 text-xs rounded-lg transition-colors",
                            selectedThinking === level.id
                              ? "bg-blue-600 text-white"
                              : "bg-slate-900 text-slate-400 hover:bg-slate-700"
                          )}
                        >
                          {level.name}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {configData?.thinkingLevels.find(l => l.id === selectedThinking)?.budgetTokens.toLocaleString() || 0} tokens
                    </p>
                  </div>

                  {/* Workspace (read-only) */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Workspace</label>
                    <div className="bg-slate-900 border border-white/[0.06] rounded-lg px-3 py-2 text-slate-500 text-sm font-mono truncate">
                      {agent.workspace}
                    </div>
                  </div>

                  {/* Heartbeat (read-only) */}
                  {agent.heartbeat && (
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Heartbeat</label>
                      <div className="bg-slate-900 border border-white/[0.06] rounded-lg px-3 py-2 text-slate-500 text-sm">
                        Every {agent.heartbeat.every}
                        {agent.heartbeat.activeHours && (
                          <span className="block text-xs mt-1">
                            Active: {agent.heartbeat.activeHours.start} - {agent.heartbeat.activeHours.end} ({agent.heartbeat.activeHours.timezone})
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Gateway Status */}
            <div className="glass-2 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-white flex items-center gap-2">
                  <RefreshCw size={16} className="text-green-400" />
                  Gateway
                </h3>
                <button
                  onClick={() => restartGateway.mutate()}
                  disabled={restartGateway.isPending}
                  className="text-sm px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center gap-1 transition-colors"
                >
                  {restartGateway.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <RefreshCw size={14} />
                  )}
                  Restart
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Restart the gateway to apply configuration changes
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SOUL Editor Modal */}
      {showSoulEditor && openclawId && (
        <SoulEditorModal
          agentId={openclawId}
          agentName={enriched?.name || agent?.name || agentId}
          onClose={() => setShowSoulEditor(false)}
        />
      )}

      {/* AGENTS.md Editor Modal */}
      {showAgentsEditor && openclawId && (
        <AgentsEditorModal
          agentId={openclawId}
          agentName={enriched?.name || agent?.name || agentId}
          onClose={() => setShowAgentsEditor(false)}
        />
      )}

      {/* Inject Task Modal */}
      {showInjectTask && openclawId && (
        <InjectTaskModal
          agentId={openclawId}
          agentName={enriched?.name || agent?.name || agentId}
          onClose={() => setShowInjectTask(false)}
        />
      )}
    </>
  )
}
