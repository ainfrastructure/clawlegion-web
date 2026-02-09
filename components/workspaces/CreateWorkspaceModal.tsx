'use client'

import { useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import {
  X,
  Loader2,
  Code2,
  Search,
  FileText,
  Settings2,
  Puzzle,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'
import type { WorkspaceType } from '@/types/common'

interface CreateWorkspaceModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated?: () => void
}

type Step = 'basics' | 'domain' | 'settings'

const DOMAIN_OPTIONS: Array<{
  type: WorkspaceType
  label: string
  description: string
  icon: React.ReactNode
  emoji: string
}> = [
  {
    type: 'code',
    label: 'Code',
    description: 'Software development with Git repos, CI/CD, and code review',
    icon: <Code2 className="w-6 h-6" />,
    emoji: '💻',
  },
  {
    type: 'research',
    label: 'Research',
    description: 'Deep research with source gathering, analysis, and reports',
    icon: <Search className="w-6 h-6" />,
    emoji: '🔬',
  },
  {
    type: 'content',
    label: 'Content',
    description: 'Content creation: blog posts, docs, marketing copy',
    icon: <FileText className="w-6 h-6" />,
    emoji: '✍️',
  },
  {
    type: 'operations',
    label: 'Operations',
    description: 'Business ops: process automation, analysis, execution',
    icon: <Settings2 className="w-6 h-6" />,
    emoji: '⚙️',
  },
  {
    type: 'custom',
    label: 'Custom',
    description: 'Define your own workflow and agent configuration',
    icon: <Puzzle className="w-6 h-6" />,
    emoji: '🧩',
  },
]

export function CreateWorkspaceModal({ isOpen, onClose, onCreated }: CreateWorkspaceModalProps) {
  const queryClient = useQueryClient()
  const [step, setStep] = useState<Step>('basics')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<WorkspaceType>('code')
  const [icon, setIcon] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  const resetForm = useCallback(() => {
    setStep('basics')
    setName('')
    setDescription('')
    setType('code')
    setIcon('')
    setGithubUrl('')
    setError(null)
  }, [])

  const createMutation = useMutation({
    mutationFn: async () => {
      const settings: Record<string, unknown> = {}
      if (type === 'code' && githubUrl) {
        settings.githubUrl = githubUrl
      }

      const response = await api.post('/workspaces', {
        name,
        type,
        description: description || undefined,
        icon: icon || DOMAIN_OPTIONS.find(d => d.type === type)?.emoji,
        settings,
        githubUrl: type === 'code' ? githubUrl || undefined : undefined,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      queryClient.invalidateQueries({ queryKey: ['repositories'] })
      resetForm()
      onCreated?.()
      onClose()
    },
    onError: (err: { response?: { data?: { error?: string } }; message?: string }) => {
      setError(err.response?.data?.error || err.message || 'Failed to create workspace')
    },
  })

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleNext = () => {
    if (step === 'basics') {
      if (!name.trim()) {
        setError('Name is required')
        return
      }
      setError(null)
      setStep('domain')
    } else if (step === 'domain') {
      setError(null)
      setStep('settings')
    }
  }

  const handleBack = () => {
    setError(null)
    if (step === 'domain') setStep('basics')
    else if (step === 'settings') setStep('domain')
  }

  const handleSubmit = () => {
    setError(null)
    createMutation.mutate()
  }

  if (!isOpen) return null

  const selectedDomain = DOMAIN_OPTIONS.find(d => d.type === type)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={handleClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/[0.06] flex-shrink-0">
            <div className="flex items-center gap-3">
              {step !== 'basics' && (
                <button
                  onClick={handleBack}
                  className="p-1 -ml-1 rounded-md hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>
              )}
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
                Create Workspace
              </h2>
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 px-6 pt-4">
            {(['basics', 'domain', 'settings'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  s === step ? 'bg-amber-500' : i < ['basics', 'domain', 'settings'].indexOf(step) ? 'bg-green-500' : 'bg-slate-600'
                }`} />
                {i < 2 && <div className="w-8 h-px bg-slate-700" />}
              </div>
            ))}
            <span className="text-xs text-slate-500 ml-2">
              Step {['basics', 'domain', 'settings'].indexOf(step) + 1} of 3
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Step 1: Name + Description */}
            {step === 'basics' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Workspace Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Project"
                    className="w-full px-4 py-3 rounded-lg border border-slate-600 bg-slate-700 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description <span className="text-slate-500">(optional)</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this workspace for?"
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-slate-600 bg-slate-700 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  />
                </div>
              </>
            )}

            {/* Step 2: Domain Type */}
            {step === 'domain' && (
              <div className="space-y-3">
                <p className="text-sm text-slate-400">What kind of work will happen in this workspace?</p>
                {DOMAIN_OPTIONS.map((option) => (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => setType(option.type)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      type === option.type
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
                    }`}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <div className="flex-1">
                      <div className={`font-medium ${type === option.type ? 'text-amber-400' : 'text-slate-200'}`}>
                        {option.label}
                      </div>
                      <div className="text-xs text-slate-500">{option.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 3: Domain-specific settings */}
            {step === 'settings' && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 border border-white/[0.06]">
                  <span className="text-2xl">{selectedDomain?.emoji}</span>
                  <div>
                    <div className="text-sm font-medium text-slate-200">{selectedDomain?.label} Workspace</div>
                    <div className="text-xs text-slate-500">{name}</div>
                  </div>
                </div>

                {type === 'code' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      GitHub URL <span className="text-slate-500">(optional)</span>
                    </label>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/org/repo"
                      className="w-full px-4 py-3 rounded-lg border border-slate-600 bg-slate-700 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                )}

                {type === 'content' && (
                  <div className="text-sm text-slate-400 p-4 rounded-lg bg-slate-900/50 border border-white/[0.06]">
                    Content workspaces come pre-configured with a Brief → Draft → Edit → Review workflow.
                    You can customize workflows later from Settings.
                  </div>
                )}

                {type === 'research' && (
                  <div className="text-sm text-slate-400 p-4 rounded-lg bg-slate-900/50 border border-white/[0.06]">
                    Research workspaces use a Scope → Gather → Analyze → Draft → Review workflow.
                    Sources and citations are tracked automatically.
                  </div>
                )}

                {type === 'operations' && (
                  <div className="text-sm text-slate-400 p-4 rounded-lg bg-slate-900/50 border border-white/[0.06]">
                    Operations workspaces follow an Analyze → Execute → Verify workflow.
                    Perfect for process automation and business tasks.
                  </div>
                )}

                {type === 'custom' && (
                  <div className="text-sm text-slate-400 p-4 rounded-lg bg-slate-900/50 border border-white/[0.06]">
                    Custom workspaces start with a minimal setup. Configure your own workflow steps
                    and agent roles from the workspace settings after creation.
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Icon <span className="text-slate-500">(optional emoji)</span>
                  </label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder={selectedDomain?.emoji}
                    maxLength={4}
                    className="w-20 px-4 py-3 rounded-lg border border-slate-600 bg-slate-700 text-slate-100 text-center text-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-white/[0.06] flex-shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 border border-slate-600 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>

            {step !== 'settings' ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
              >
                Next
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={createMutation.isPending}
                className="px-5 py-2.5 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Workspace'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
