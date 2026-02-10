'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PageContainer } from '@/components/layout'
import { Settings } from 'lucide-react'
import {
  SettingsTabs,
  ApiKeysTab,
  IntegrationsTab,
  NotificationsTab,
  AgentDefaultsTab,
  AppearanceTab,
  KeyboardShortcutsTab,
  DangerZoneTab,
} from '@/components/settings'
import { tabs } from '@/components/settings/SettingsTabs'

const tabDescriptions: Record<string, string> = {
  'api-keys': 'Manage provider keys, monitor usage, and control priority routing.',
  'integrations': 'Connect external services and configure sync behavior.',
  'notifications': 'Configure notification channels for each event category.',
  'agents': 'Set default limits, timeouts, and AI model parameters for all agents.',
  'appearance': 'Customize theme, display preferences, and identity settings.',
  'keyboard-shortcuts': 'View and customize keyboard shortcuts for navigation and actions.',
  'danger-zone': 'Destructive operations — reset settings, clear cache, purge keys.',
}

function SettingsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get('tab') || 'api-keys'

  const setTab = (tab: string) => {
    router.push(`/settings?tab=${tab}`)
  }

  const currentTab = tabs.find(t => t.id === activeTab)
  const tabLabel = currentTab?.label ?? 'Settings'
  const tabDescription = tabDescriptions[activeTab] ?? ''

  return (
    <PageContainer>
      {/* Header with contextual breadcrumb */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
          <Settings size={14} />
          <span>Settings</span>
          <span className="text-slate-600">/</span>
          <span className={currentTab?.color ?? 'text-slate-300'}>{tabLabel}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">{tabLabel}</h1>
        {tabDescription && (
          <p className="text-sm text-slate-400 mt-1">{tabDescription}</p>
        )}
        <div className="mt-3 h-px bg-gradient-to-r from-white/[0.06] via-white/[0.03] to-transparent" />
      </div>

      {/* Tabbed layout */}
      <SettingsTabs activeTab={activeTab} onTabChange={setTab}>
        {activeTab === 'api-keys' && <ApiKeysTab />}
        {activeTab === 'integrations' && <IntegrationsTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'agents' && <AgentDefaultsTab />}
        {activeTab === 'appearance' && <AppearanceTab />}
        {activeTab === 'keyboard-shortcuts' && <KeyboardShortcutsTab />}
        {activeTab === 'danger-zone' && <DangerZoneTab />}
      </SettingsTabs>
    </PageContainer>
  )
}

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  )
}
