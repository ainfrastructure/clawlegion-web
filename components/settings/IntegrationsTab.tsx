'use client'

import { useState, useEffect } from 'react'
import {
  useSystemSettings,
  useUpdateSystemSettings,
  useIntegrationStatus,
  useTestIntegration,
} from '@/hooks/useSystemSettings'
import type { IntegrationConfig } from '@/hooks/useSystemSettings'
import { Plug, CheckCircle2, XCircle, Loader2, Zap } from 'lucide-react'

type Provider = 'linear' | 'github' | 'discord'

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-10 h-6 rounded-full transition-colors ${checked ? 'bg-blue-500' : 'bg-slate-700'}`}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full transition-transform mx-1 ${checked ? 'translate-x-4' : 'translate-x-0'}`}
      />
    </button>
  )
}

function IntegrationCard({
  provider,
  title,
  icon,
  color,
  configured,
  config,
  onUpdate,
  onTest,
  testResult,
  isTesting,
}: {
  provider: Provider
  title: string
  icon: React.ReactNode
  color: string
  configured: boolean
  config: IntegrationConfig[Provider]
  onUpdate: (updates: Partial<IntegrationConfig[Provider]>) => void
  onTest: () => void
  testResult: { success: boolean; message: string } | null
  isTesting: boolean
}) {
  const isLinear = provider === 'linear'
  const isGithub = provider === 'github'
  const isDiscord = provider === 'discord'

  return (
    <div className="glass-2 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
          <div>
            <h3 className="font-semibold text-white">{title}</h3>
            <span
              className={`inline-flex items-center gap-1 text-xs mt-0.5 ${
                configured ? 'text-green-400' : 'text-slate-500'
              }`}
            >
              {configured ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
              {configured ? 'API key configured' : 'Not configured'}
            </span>
          </div>
        </div>
        <Toggle
          checked={'enabled' in config ? config.enabled : false}
          onChange={(v) => onUpdate({ enabled: v } as any)}
        />
      </div>

      {/* Config fields */}
      <div className="space-y-3">
        {isLinear && 'teamId' in config && (
          <>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Team ID</label>
              <input
                type="text"
                value={(config as IntegrationConfig['linear']).teamId}
                onChange={(e) => onUpdate({ teamId: e.target.value } as any)}
                placeholder="e.g. TEAM-123"
                className="w-full px-3 py-2 bg-slate-800/50 border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Sync tasks to Linear</span>
              <Toggle
                checked={(config as IntegrationConfig['linear']).syncEnabled}
                onChange={(v) => onUpdate({ syncEnabled: v } as any)}
              />
            </div>
          </>
        )}

        {isGithub && 'owner' in config && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Owner</label>
                <input
                  type="text"
                  value={(config as IntegrationConfig['github']).owner}
                  onChange={(e) => onUpdate({ owner: e.target.value } as any)}
                  placeholder="username or org"
                  className="w-full px-3 py-2 bg-slate-800/50 border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Repository</label>
                <input
                  type="text"
                  value={(config as IntegrationConfig['github']).repo}
                  onChange={(e) => onUpdate({ repo: e.target.value } as any)}
                  placeholder="repo-name"
                  className="w-full px-3 py-2 bg-slate-800/50 border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Auto-create issues</span>
              <Toggle
                checked={(config as IntegrationConfig['github']).issueCreationEnabled}
                onChange={(v) => onUpdate({ issueCreationEnabled: v } as any)}
              />
            </div>
          </>
        )}

        {isDiscord && 'webhookUrl' in config && (
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Webhook URL</label>
            <input
              type="text"
              value={(config as IntegrationConfig['discord']).webhookUrl}
              onChange={(e) => onUpdate({ webhookUrl: e.target.value } as any)}
              placeholder="https://discord.com/api/webhooks/..."
              className="w-full px-3 py-2 bg-slate-800/50 border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
        )}
      </div>

      {/* Test button + result */}
      <div className="mt-4 pt-4 border-t border-white/[0.06]">
        <button
          onClick={onTest}
          disabled={isTesting}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {isTesting ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
          Test Connection
        </button>
        {testResult && (
          <p className={`text-xs mt-2 ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
            {testResult.message}
          </p>
        )}
      </div>
    </div>
  )
}

export function IntegrationsTab() {
  const { data: settings } = useSystemSettings()
  const { data: envStatus } = useIntegrationStatus()
  const updateSettings = useUpdateSystemSettings()
  const testIntegration = useTestIntegration()

  const [localIntegrations, setLocalIntegrations] = useState<IntegrationConfig | null>(null)
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string } | null>>({})
  const [testingProvider, setTestingProvider] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (settings?.integrations && !localIntegrations) {
      setLocalIntegrations(settings.integrations)
    }
  }, [settings, localIntegrations])

  const integrations = localIntegrations || settings?.integrations || {
    linear: { enabled: false, teamId: '', syncEnabled: false },
    github: { enabled: false, repo: '', owner: '', issueCreationEnabled: false },
    discord: { enabled: false, webhookUrl: '' },
  }

  const handleUpdate = (provider: Provider, updates: Record<string, unknown>) => {
    const updated = {
      ...integrations,
      [provider]: { ...integrations[provider], ...updates },
    }
    setLocalIntegrations(updated)
    setHasChanges(true)
  }

  const handleSave = () => {
    if (localIntegrations) {
      updateSettings.mutate({ integrations: localIntegrations }, {
        onSuccess: () => setHasChanges(false),
      })
    }
  }

  const handleTest = (provider: Provider) => {
    setTestingProvider(provider)
    testIntegration.mutate(provider, {
      onSuccess: (result) => {
        setTestResults((prev) => ({ ...prev, [provider]: result }))
        setTestingProvider(null)
      },
      onError: () => {
        setTestResults((prev) => ({ ...prev, [provider]: { success: false, message: 'Request failed' } }))
        setTestingProvider(null)
      },
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
          <Plug className="text-blue-400" /> Integrations
        </h2>
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={updateSettings.isPending}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      <div className="space-y-4">
        <IntegrationCard
          provider="linear"
          title="Linear"
          icon={<svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3.36 6.16l14.48 14.48c-1.74 1.44-3.97 2.3-6.39 2.3C5.82 22.94 1.06 18.18 1.06 12.55c0-2.42.86-4.65 2.3-6.39zm1.1-1.1C6.2 3.62 8.43 2.76 10.85 2.76c5.63 0 10.2 4.57 10.2 10.2 0 2.42-.86 4.65-2.3 6.39L4.47 5.07z"/></svg>}
          color="bg-indigo-500/20 text-indigo-400"
          configured={envStatus?.linear?.configured ?? false}
          config={integrations.linear}
          onUpdate={(updates) => handleUpdate('linear', updates)}
          onTest={() => handleTest('linear')}
          testResult={testResults.linear ?? null}
          isTesting={testingProvider === 'linear'}
        />

        <IntegrationCard
          provider="github"
          title="GitHub"
          icon={<svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>}
          color="bg-slate-500/20 text-slate-300"
          configured={envStatus?.github?.configured ?? false}
          config={integrations.github}
          onUpdate={(updates) => handleUpdate('github', updates)}
          onTest={() => handleTest('github')}
          testResult={testResults.github ?? null}
          isTesting={testingProvider === 'github'}
        />

        <IntegrationCard
          provider="discord"
          title="Discord"
          icon={<svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>}
          color="bg-violet-500/20 text-violet-400"
          configured={envStatus?.discord?.configured ?? false}
          config={integrations.discord}
          onUpdate={(updates) => handleUpdate('discord', updates)}
          onTest={() => handleTest('discord')}
          testResult={testResults.discord ?? null}
          isTesting={testingProvider === 'discord'}
        />
      </div>
    </div>
  )
}
