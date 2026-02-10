'use client'

import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { X, Loader2, ChevronDown, ChevronUp, Sparkles, ArrowLeft, HelpCircle } from 'lucide-react'
import { AgentFlowSection } from './AgentFlowSection'
import { SuccessCriteriaSection } from './SuccessCriteriaSection'
import {
  DEFAULT_PRESETS,
  applyPreset,
} from '@/lib/flow-presets'
import type {
  FlowConfiguration,
  AgentConfig,
  AgentRole,
  ResourceLevel
} from '@/components/flow-config/types'
import type { CreateTaskModalProps } from './types'

type Step = 'prompt' | 'review'

interface SuccessCriterion {
  id: string
  text: string
}

const DEFAULT_CRITERIA: SuccessCriterion[] = [
  { id: '1', text: 'Feature works as described' },
  { id: '2', text: 'Screenshot proof captured' },
]

export function EnhancedTaskModal({ isOpen, onClose, onTaskCreated, repositories }: CreateTaskModalProps) {
  // Step state
  const [step, setStep] = useState<Step>('prompt')

  // Prompt step fields
  const [promptText, setPromptText] = useState('')
  const [promptRepoId, setPromptRepoId] = useState('')

  // Review step fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [repositoryId, setRepositoryId] = useState('')
  const [priority, setPriority] = useState<'P0' | 'P1' | 'P2' | 'P3'>('P2')
  const [specs, setSpecs] = useState('')
  const [approach, setApproach] = useState('')
  const [createLinearIssue, setCreateLinearIssue] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Flow configuration
  const [selectedPresetId, setSelectedPresetId] = useState<string>('standard')
  const [flowConfig, setFlowConfig] = useState<FlowConfiguration>(() => {
    const preset = DEFAULT_PRESETS.find(p => p.id === 'standard')!
    return applyPreset(preset)
  })

  // Success criteria
  const [successCriteria, setSuccessCriteria] = useState<SuccessCriterion[]>(DEFAULT_CRITERIA)

  // Collapsible sections
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showTechnical, setShowTechnical] = useState(false)

  const hasLinearApiKey = typeof window !== 'undefined' && !!localStorage.getItem('linearApiKey')

  // Reset all state
  const resetForm = useCallback(() => {
    setStep('prompt')
    setPromptText('')
    setPromptRepoId('')
    setTitle('')
    setDescription('')
    setRepositoryId('')
    setPriority('P2')
    setSpecs('')
    setApproach('')
    setCreateLinearIssue(true)
    setError(null)
    setSelectedPresetId('standard')
    const preset = DEFAULT_PRESETS.find(p => p.id === 'standard')!
    setFlowConfig(applyPreset(preset))
    setSuccessCriteria(DEFAULT_CRITERIA)
    setShowAdvanced(false)
    setShowTechnical(false)
  }, [])

  // AI expand mutation
  const expandMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/task-tracking/tasks/expand', {
        prompt: promptText.trim(),
        repositoryId: promptRepoId || undefined,
      })
      return response.data.expanded
    },
    onSuccess: (expanded: {
      title: string
      description: string
      priority: 'P0' | 'P1' | 'P2' | 'P3'
      successCriteria: string[]
      specs: string
      approach: string
    }) => {
      setTitle(expanded.title)
      setDescription(expanded.description)
      setPriority(expanded.priority)
      setSuccessCriteria(
        expanded.successCriteria.map((text, i) => ({
          id: `ai-${i}`,
          text,
        }))
      )
      setSpecs(expanded.specs)
      setApproach(expanded.approach)
      if (promptRepoId) setRepositoryId(promptRepoId)
      setShowTechnical(true)
      setError(null)
      setStep('review')
    },
    onError: (err: { response?: { data?: { error?: string } }; message?: string }) => {
      setError(err.response?.data?.error || err.message || 'AI expansion failed. Try again or skip to manual.')
    },
  })

  // Handle preset selection
  const handlePresetSelect = useCallback((presetId: string) => {
    const preset = DEFAULT_PRESETS.find(p => p.id === presetId)
    if (preset) {
      setSelectedPresetId(presetId)
      setFlowConfig(applyPreset(preset))
    }
  }, [])

  // Handle agent toggle — also adds agents not yet in config
  const handleAgentToggle = useCallback((role: AgentRole) => {
    setFlowConfig(prev => {
      const existing = prev.agents.find(a => a.role === role)
      if (existing) {
        return {
          ...prev,
          agents: prev.agents.map(agent =>
            agent.role === role
              ? { ...agent, enabled: !agent.enabled }
              : agent
          ),
          presetId: undefined,
        }
      }
      // Agent not in config yet — add it as enabled
      return {
        ...prev,
        agents: [...prev.agents, { role, enabled: true, resourceLevel: 'medium' as ResourceLevel }],
        presetId: undefined,
      }
    })
    setSelectedPresetId('custom')
  }, [])

  // Handle resource level change
  const handleResourceLevelChange = useCallback((role: AgentRole, level: ResourceLevel) => {
    setFlowConfig(prev => ({
      ...prev,
      agents: prev.agents.map(agent =>
        agent.role === role
          ? { ...agent, resourceLevel: level }
          : agent
      ),
      presetId: undefined,
    }))
    setSelectedPresetId('custom')
  }, [])

  // Handle agents reorder (drag & drop)
  const handleAgentsReorder = useCallback((agents: AgentConfig[]) => {
    setFlowConfig(prev => ({
      ...prev,
      agents,
      presetId: undefined,
    }))
    setSelectedPresetId('custom')
  }, [])

  // Handle success criteria change (from SuccessCriteriaSection)
  const handleCriteriaChange = useCallback((newCriteria: typeof successCriteria) => {
    setSuccessCriteria(newCriteria)
  }, [])

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async () => {
      const apiKey = localStorage.getItem('linearApiKey')
      const headers: Record<string, string> = {}
      if (apiKey) {
        headers['x-linear-api-key'] = apiKey
      }

      const payload = {
        title,
        description,
        repositoryId,
        priority,
        createLinearIssue: createLinearIssue && !!apiKey,
        successCriteria: successCriteria.map(c => c.text),
        specs: specs || undefined,
        approach: approach || undefined,
        metadata: {
          flowConfig: {
            presetId: selectedPresetId,
            agents: flowConfig.agents.map(a => ({
              role: a.role,
              enabled: a.enabled,
              resourceLevel: a.resourceLevel,
            })),
          },
        },
      }

      const response = await api.post('/task-tracking/tasks', payload, { headers })
      return response.data
    },
    onSuccess: () => {
      resetForm()
      onTaskCreated()
    },
    onError: (err: { response?: { data?: { error?: string } }; message?: string }) => {
      setError(err.response?.data?.error || err.message || 'Failed to create task')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Title is required')
      return
    }
    if (!description.trim()) {
      setError('Description is required')
      return
    }
    if (!repositoryId) {
      setError('Please select a repository')
      return
    }

    const enabledAgents = flowConfig.agents.filter(a => a.enabled)
    if (enabledAgents.length === 0) {
      setError('At least one agent must be enabled')
      return
    }

    createTaskMutation.mutate()
  }

  const handleExpand = () => {
    setError(null)
    if (!promptText.trim() || promptText.trim().length < 3) {
      setError('Please enter at least 3 characters describing your task')
      return
    }
    expandMutation.mutate()
  }

  const handleSkipToManual = () => {
    setError(null)
    setStep('review')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  const selectedRepo = repositories.find((r) => r.id === repositoryId)
  const repoHasLinearProject = selectedRepo?.linearProject != null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/[0.06] flex-shrink-0">
            <div className="flex items-center gap-3">
              {step === 'review' && (
                <button
                  onClick={() => setStep('prompt')}
                  className="p-1 -ml-1 rounded-md hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>
              )}
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
                {step === 'prompt' ? 'Create Task' : 'Review & Edit'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ============= STEP 1: PROMPT ============= */}
          {step === 'prompt' && (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Prompt textarea */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Describe what you want to build
                  </label>
                  <textarea
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="Fix mobile CSS on login page, add dark mode support to settings panel, refactor auth middleware to use JWT..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-slate-600 bg-slate-700 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault()
                        handleExpand()
                      }
                    }}
                  />
                  <p className="mt-1.5 text-xs text-slate-500">
                    Press {typeof navigator !== 'undefined' && navigator.platform?.includes('Mac') ? 'Cmd' : 'Ctrl'}+Enter to generate
                  </p>
                </div>

                {/* Optional workspace selector */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Workspace <span className="text-slate-500">(optional, provides context)</span>
                  </label>
                  <select
                    value={promptRepoId}
                    onChange={(e) => setPromptRepoId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-600 bg-slate-700 text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">No workspace selected</option>
                    {repositories.map((repo) => (
                      <option key={repo.id} value={repo.id}>
                        {repo.icon ? `${repo.icon} ` : ''}{repo.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Loading skeleton */}
                {expandMutation.isPending && (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-slate-700 rounded w-2/3" />
                    <div className="h-3 bg-slate-700 rounded w-full" />
                    <div className="h-3 bg-slate-700 rounded w-5/6" />
                    <div className="h-3 bg-slate-700 rounded w-4/6" />
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}
              </div>

              {/* Prompt footer */}
              <div className="flex items-center justify-between p-6 border-t border-white/[0.06] flex-shrink-0">
                <button
                  type="button"
                  onClick={handleSkipToManual}
                  className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
                >
                  Skip to manual entry
                </button>
                <button
                  type="button"
                  onClick={handleExpand}
                  disabled={expandMutation.isPending || !promptText.trim()}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {expandMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Expanding...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate with AI
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* ============= STEP 2: REVIEW/EDIT ============= */}
          {step === 'review' && (
            <>
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* AI banner */}
                {expandMutation.isSuccess && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
                    <Sparkles size={14} />
                    AI-generated — review and edit before submitting
                  </div>
                )}

                {/* Task Details */}
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      What do you want to build? *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Add user profile editing with avatar upload"
                      className="w-full px-4 py-3 rounded-lg border border-slate-600 bg-slate-700 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      autoFocus={!expandMutation.isSuccess}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what needs to be built, any requirements or constraints..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-slate-600 bg-slate-700 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Repository & Priority */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Workspace *
                      </label>
                      <select
                        value={repositoryId}
                        onChange={(e) => setRepositoryId(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-600 bg-slate-700 text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                        <option value="">Select workspace</option>
                        {repositories.map((repo) => (
                          <option key={repo.id} value={repo.id}>
                            {repo.icon ? `${repo.icon} ` : ''}{repo.name}
                            {repo.type && repo.type !== 'code' ? ` (${repo.type})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300 mb-2">
                        Priority
                        <span className="relative group/tip">
                          <HelpCircle className="w-3.5 h-3.5 text-slate-500 cursor-help" />
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-slate-900 border border-white/[0.08] text-[11px] text-slate-300 leading-relaxed whitespace-nowrap opacity-0 pointer-events-none group-hover/tip:opacity-100 transition-opacity duration-150 shadow-xl z-20">
                            <span className="font-semibold text-red-400">P0</span> Critical / urgent<br />
                            <span className="font-semibold text-orange-400">P1</span> High priority<br />
                            <span className="font-semibold text-amber-400">P2</span> Medium priority<br />
                            <span className="font-semibold text-blue-400">P3</span> Low priority
                            <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-900" />
                          </span>
                        </span>
                      </label>
                      <div className="flex gap-2">
                        {(['P0', 'P1', 'P2', 'P3'] as const).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPriority(p)}
                            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                              priority === p
                                ? p === 'P0' ? 'bg-red-500 text-white'
                                : p === 'P1' ? 'bg-orange-500 text-white'
                                : p === 'P2' ? 'bg-amber-500 text-white'
                                : 'bg-blue-500 text-white'
                                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Agent Flow Builder */}
                <AgentFlowSection
                  flowConfig={flowConfig}
                  selectedPresetId={selectedPresetId}
                  onPresetSelect={handlePresetSelect}
                  onAgentToggle={handleAgentToggle}
                  onResourceLevelChange={handleResourceLevelChange}
                  onAgentsReorder={handleAgentsReorder}
                />

                {/* Success Criteria */}
                <SuccessCriteriaSection
                  criteria={successCriteria}
                  onCriteriaChange={handleCriteriaChange}
                />

                {/* Technical Details (collapsible) */}
                <button
                  type="button"
                  onClick={() => setShowTechnical(!showTechnical)}
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300"
                >
                  {showTechnical ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  Technical Details
                  {(specs || approach) && !showTechnical && (
                    <span className="text-xs text-amber-400 ml-1">(has content)</span>
                  )}
                </button>

                {showTechnical && (
                  <div className="space-y-4 pl-4 border-l-2 border-white/[0.06]">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Specs
                      </label>
                      <textarea
                        value={specs}
                        onChange={(e) => setSpecs(e.target.value)}
                        placeholder="Technical specification: files, components, constraints..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg border border-slate-600 bg-slate-700 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Approach
                      </label>
                      <textarea
                        value={approach}
                        onChange={(e) => setApproach(e.target.value)}
                        placeholder="Implementation approach: step-by-step plan..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg border border-slate-600 bg-slate-700 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Advanced Options Toggle */}
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300"
                >
                  {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  Advanced Options
                </button>

                {showAdvanced && (
                  <div className="space-y-4 pl-4 border-l-2 border-white/[0.06]">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={createLinearIssue}
                        onChange={(e) => setCreateLinearIssue(e.target.checked)}
                        disabled={!hasLinearApiKey || !repoHasLinearProject}
                        className="w-5 h-5 rounded border-slate-600 text-amber-600 focus:ring-amber-500 disabled:opacity-50"
                      />
                      <span className="text-sm text-slate-300">
                        Create Linear issue
                        {!hasLinearApiKey && (
                          <span className="text-slate-500 ml-1">(API key not configured)</span>
                        )}
                        {hasLinearApiKey && !repoHasLinearProject && repositoryId && (
                          <span className="text-slate-500 ml-1">(No Linear project mapped)</span>
                        )}
                      </span>
                    </label>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}
              </form>

              {/* Review footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-white/[0.06] flex-shrink-0">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 border border-slate-600 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={createTaskMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {createTaskMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Task'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
