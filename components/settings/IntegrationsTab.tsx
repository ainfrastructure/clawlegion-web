'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import {
  useSystemSettings,
  useUpdateSystemSettings,
  useIntegrationStatus,
  useTestIntegration,
} from '@/hooks/useSystemSettings'
import type { IntegrationConfig } from '@/hooks/useSystemSettings'
import { CheckCircle2, XCircle, Loader2, Zap, ChevronDown, LogOut } from 'lucide-react'
import { useXConnection } from '@/hooks/useXConnection'

type Provider = 'linear' | 'github' | 'discord' | 'telegram'

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-all duration-200 ${checked ? 'bg-red-500 shadow-lg shadow-red-500/20' : 'bg-slate-700'}`}
    >
      <div
        className={`w-4.5 h-4.5 bg-white rounded-full transition-transform mx-0.5 shadow-sm ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
        style={{ width: '18px', height: '18px', marginTop: '3px' }}
      />
    </button>
  )
}

function IntegrationCard({
  provider,
  title,
  icon,
  color,
  glowColor,
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
  glowColor: string
  configured: boolean
  config: IntegrationConfig[Provider]
  onUpdate: (updates: Partial<IntegrationConfig[Provider]>) => void
  onTest: () => void
  testResult: { success: boolean; message: string } | null
  isTesting: boolean
}) {
  const [showConfig, setShowConfig] = useState(false)
  const isLinear = provider === 'linear'
  const isGithub = provider === 'github'
  const isDiscord = provider === 'discord'
  const isTelegram = provider === 'telegram'

  const hasFields = isLinear || isGithub || isDiscord || isTelegram

  return (
    <div className="glass-2 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${color} ring-4 ${glowColor}`}>
              {icon}
            </div>
            <div>
              <h3 className="font-semibold text-white">{title}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                {configured ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-400 shadow-sm shadow-green-400/50" />
                    <span className="text-xs text-green-400 font-medium">Connected</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-slate-500" />
                    <span className="text-xs text-slate-500">Not configured</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Toggle
            checked={'enabled' in config ? config.enabled : false}
            onChange={(v) => onUpdate({ enabled: v } as Partial<IntegrationConfig[Provider]>)}
          />
        </div>

        {/* Configuration toggle */}
        {hasFields && (
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] text-sm text-slate-400 transition-colors"
          >
            <span>Configuration</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${showConfig ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Collapsible config fields */}
      {showConfig && (
        <div className="px-5 pb-5 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {isLinear && 'teamId' in config && (
            <>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block font-medium">Team ID</label>
                <input
                  type="text"
                  value={(config as IntegrationConfig['linear']).teamId}
                  onChange={(e) => onUpdate({ teamId: e.target.value } as Partial<IntegrationConfig[Provider]>)}
                  placeholder="e.g. TEAM-123"
                  className="w-full px-3 py-2 bg-slate-800/40 border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition-all"
                />
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-slate-400">Sync tasks to Linear</span>
                <Toggle
                  checked={(config as IntegrationConfig['linear']).syncEnabled}
                  onChange={(v) => onUpdate({ syncEnabled: v } as Partial<IntegrationConfig[Provider]>)}
                />
              </div>
            </>
          )}

          {isGithub && 'owner' in config && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block font-medium">Owner</label>
                  <input
                    type="text"
                    value={(config as IntegrationConfig['github']).owner}
                    onChange={(e) => onUpdate({ owner: e.target.value } as Partial<IntegrationConfig[Provider]>)}
                    placeholder="username or org"
                    className="w-full px-3 py-2 bg-slate-800/40 border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block font-medium">Repository</label>
                  <input
                    type="text"
                    value={(config as IntegrationConfig['github']).repo}
                    onChange={(e) => onUpdate({ repo: e.target.value } as Partial<IntegrationConfig[Provider]>)}
                    placeholder="repo-name"
                    className="w-full px-3 py-2 bg-slate-800/40 border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition-all"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-slate-400">Auto-create issues</span>
                <Toggle
                  checked={(config as IntegrationConfig['github']).issueCreationEnabled}
                  onChange={(v) => onUpdate({ issueCreationEnabled: v } as Partial<IntegrationConfig[Provider]>)}
                />
              </div>
            </>
          )}

          {isDiscord && 'webhookUrl' in config && (
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block font-medium">Webhook URL</label>
              <input
                type="text"
                value={(config as IntegrationConfig['discord']).webhookUrl}
                onChange={(e) => onUpdate({ webhookUrl: e.target.value } as Partial<IntegrationConfig[Provider]>)}
                placeholder="https://discord.com/api/webhooks/..."
                className="w-full px-3 py-2 bg-slate-800/40 border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition-all"
              />
            </div>
          )}

          {isTelegram && 'botToken' in config && (
            <>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block font-medium">Bot Token</label>
                <input
                  type="password"
                  value={(config as IntegrationConfig['telegram']).botToken}
                  onChange={(e) => onUpdate({ botToken: e.target.value } as Partial<IntegrationConfig[Provider]>)}
                  placeholder="123456:ABC-DEF..."
                  className="w-full px-3 py-2 bg-slate-800/40 border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block font-medium">Chat ID</label>
                <input
                  type="text"
                  value={(config as IntegrationConfig['telegram']).chatId}
                  onChange={(e) => onUpdate({ chatId: e.target.value } as Partial<IntegrationConfig[Provider]>)}
                  placeholder="-1001234567890"
                  className="w-full px-3 py-2 bg-slate-800/40 border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition-all"
                />
              </div>
            </>
          )}

          {/* Test button + result */}
          <div className="pt-2">
            <button
              onClick={onTest}
              disabled={isTesting}
              className="px-3.5 py-2 glass-2 hover:bg-white/[0.06] rounded-xl text-sm text-slate-300 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isTesting ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} className="text-amber-400" />}
              Test Connection
            </button>
            {testResult && (
              <div className={`flex items-center gap-1.5 text-xs mt-2.5 ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
                {testResult.success ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                {testResult.message}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function XIntegrationCard() {
  const { status, isLoading, isConnecting, isDisconnecting, connect, disconnect, refresh } = useXConnection()
  const searchParams = useSearchParams()
  const [oauthMessage, setOauthMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Handle OAuth callback URL params (from /settings/connections redirect)
  useEffect(() => {
    const oauthStatus = searchParams.get('oauth_status') || searchParams.get('status')
    const oauthError = searchParams.get('oauth_error') || searchParams.get('error')
    if (oauthStatus === 'success') {
      setOauthMessage({ type: 'success', text: 'Successfully connected to X!' })
      refresh()
      // Clean URL params
      const url = new URL(window.location.href)
      url.searchParams.delete('oauth_status')
      url.searchParams.delete('status')
      window.history.replaceState({}, '', url.toString())
    } else if (oauthError) {
      setOauthMessage({ type: 'error', text: decodeURIComponent(oauthError) })
      const url = new URL(window.location.href)
      url.searchParams.delete('oauth_error')
      url.searchParams.delete('error')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams, refresh])

  const xIcon = (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )

  return (
    <div className="glass-2 rounded-2xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800/15 text-white ring-4 ring-slate-500/10">
              {xIcon}
            </div>
            <div>
              <h3 className="font-semibold text-white">X (Twitter)</h3>
              <div className="flex items-center gap-1.5 mt-1">
                {isLoading ? (
                  <>
                    <Loader2 size={10} className="animate-spin text-slate-400" />
                    <span className="text-xs text-slate-500">Checking...</span>
                  </>
                ) : status?.connected && status.account ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-400 shadow-sm shadow-green-400/50" />
                    <span className="text-xs text-green-400 font-medium">
                      Connected as @{status.account.username}
                    </span>
                  </>
                ) : !status?.configured ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
                    <span className="text-xs text-amber-400">Not configured</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-slate-500" />
                    <span className="text-xs text-slate-500">Not connected</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Connected account details */}
        {status?.connected && status.account && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] mb-3">
            {status.account.avatarUrl && (
              <Image
                src={status.account.avatarUrl}
                alt={status.account.displayName}
                width={32}
                height={32}
                className="rounded-full ring-2 ring-white/10"
                unoptimized
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">
                {status.account.displayName}
              </p>
              <p className="text-xs text-slate-400">
                Connected {new Date(status.account.connectedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {/* Not configured message */}
        {!isLoading && !status?.configured && (
          <div className="px-3 py-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10 mb-3">
            <p className="text-xs text-amber-400/80">
              Not configured — add <code className="px-1 py-0.5 bg-slate-800/60 rounded text-amber-300 text-[11px]">X_CLIENT_ID</code> and{' '}
              <code className="px-1 py-0.5 bg-slate-800/60 rounded text-amber-300 text-[11px]">X_CLIENT_SECRET</code> to .env
            </p>
          </div>
        )}

        {/* OAuth callback message */}
        {oauthMessage && (
          <div className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl mb-3 ${
            oauthMessage.type === 'success'
              ? 'bg-green-500/5 border border-green-500/10'
              : 'bg-red-500/5 border border-red-500/10'
          }`}>
            {oauthMessage.type === 'success' ? (
              <CheckCircle2 size={14} className="text-green-400 shrink-0" />
            ) : (
              <XCircle size={14} className="text-red-400 shrink-0" />
            )}
            <p className={`text-xs ${oauthMessage.type === 'success' ? 'text-green-400/80' : 'text-red-400/80'}`}>
              {oauthMessage.text}
            </p>
          </div>
        )}

        {/* Connect / Disconnect button */}
        {!isLoading && status?.configured && (
          <div>
            {status.connected ? (
              <button
                onClick={disconnect}
                disabled={isDisconnecting}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2 glass-2 hover:bg-red-500/10 hover:text-red-400 rounded-xl text-sm text-slate-300 transition-colors disabled:opacity-50"
              >
                {isDisconnecting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <LogOut size={14} />
                )}
                {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
              </button>
            ) : (
              <button
                onClick={connect}
                disabled={isConnecting}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2 bg-white/90 hover:bg-white text-slate-900 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 shadow-lg shadow-white/5"
              >
                {isConnecting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                )}
                {isConnecting ? 'Connecting...' : 'Connect with X'}
              </button>
            )}
          </div>
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
    telegram: { enabled: false, botToken: '', chatId: '' },
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
      {/* Save bar */}
      {hasChanges && (
        <div className="flex justify-end mb-5">
          <button
            onClick={handleSave}
            disabled={updateSettings.isPending}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 shadow-lg shadow-red-500/10"
          >
            {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <IntegrationCard
          provider="linear"
          title="Linear"
          icon={<svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3.36 6.16l14.48 14.48c-1.74 1.44-3.97 2.3-6.39 2.3C5.82 22.94 1.06 18.18 1.06 12.55c0-2.42.86-4.65 2.3-6.39zm1.1-1.1C6.2 3.62 8.43 2.76 10.85 2.76c5.63 0 10.2 4.57 10.2 10.2 0 2.42-.86 4.65-2.3 6.39L4.47 5.07z"/></svg>}
          color="bg-indigo-500/15 text-indigo-400"
          glowColor="ring-indigo-500/10"
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
          color="bg-slate-500/15 text-slate-300"
          glowColor="ring-slate-500/10"
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
          color="bg-violet-500/15 text-violet-400"
          glowColor="ring-violet-500/10"
          configured={envStatus?.discord?.configured ?? false}
          config={integrations.discord}
          onUpdate={(updates) => handleUpdate('discord', updates)}
          onTest={() => handleTest('discord')}
          testResult={testResults.discord ?? null}
          isTesting={testingProvider === 'discord'}
        />

        <IntegrationCard
          provider="telegram"
          title="Telegram"
          icon={<svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>}
          color="bg-sky-500/15 text-sky-400"
          glowColor="ring-sky-500/10"
          configured={envStatus?.telegram?.configured ?? false}
          config={integrations.telegram}
          onUpdate={(updates) => handleUpdate('telegram', updates)}
          onTest={() => handleTest('telegram')}
          testResult={testResults.telegram ?? null}
          isTesting={testingProvider === 'telegram'}
        />

        <XIntegrationCard />
      </div>
    </div>
  )
}
