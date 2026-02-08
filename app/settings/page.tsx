'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PageContainer } from '@/components/layout'
import { Settings } from 'lucide-react'
import {
  SettingsTabs,
  ApiKeysTab,
  IntegrationsTab,
  AgentDefaultsTab,
  AppearanceTab,
  DangerZoneTab,
} from '@/components/settings'

function SettingsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get('tab') || 'api-keys'

  const setTab = (tab: string) => {
    router.push(`/settings?tab=${tab}`)
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <Settings className="text-slate-400" /> Settings
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-1">AI Agent Command Center</p>
      </div>

      {/* Tabbed layout */}
      <SettingsTabs activeTab={activeTab} onTabChange={setTab}>
        {activeTab === 'api-keys' && <ApiKeysTab />}
        {activeTab === 'integrations' && <IntegrationsTab />}
        {activeTab === 'agents' && <AgentDefaultsTab />}
        {activeTab === 'appearance' && <AppearanceTab />}
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
