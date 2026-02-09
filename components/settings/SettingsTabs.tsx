'use client'

import { ReactNode } from 'react'
import { Key, Plug, Bot, Paintbrush, Keyboard, AlertTriangle, Bell } from 'lucide-react'

export type SettingsTab = 'api-keys' | 'integrations' | 'notifications' | 'agents' | 'appearance' | 'keyboard-shortcuts' | 'danger-zone'

const tabs: { id: SettingsTab; label: string; icon: ReactNode; color: string }[] = [
  { id: 'api-keys', label: 'API Keys', icon: <Key size={18} />, color: 'text-amber-400' },
  { id: 'integrations', label: 'Integrations', icon: <Plug size={18} />, color: 'text-blue-400' },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={18} />, color: 'text-orange-400' },
  { id: 'agents', label: 'Agent Defaults', icon: <Bot size={18} />, color: 'text-purple-400' },
  { id: 'appearance', label: 'Appearance', icon: <Paintbrush size={18} />, color: 'text-pink-400' },
  { id: 'keyboard-shortcuts', label: 'Shortcuts', icon: <Keyboard size={18} />, color: 'text-green-400' },
  { id: 'danger-zone', label: 'Danger Zone', icon: <AlertTriangle size={18} />, color: 'text-red-400' },
]

type SettingsTabsProps = {
  activeTab: string
  onTabChange: (tab: string) => void
  children: ReactNode
}

export function SettingsTabs({ activeTab, onTabChange, children }: SettingsTabsProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Desktop sidebar */}
      <nav className="hidden lg:block w-52 flex-shrink-0">
        <div className="glass-2 rounded-xl p-2 sticky top-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'nav-active-indicator text-blue-400 bg-blue-500/10'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-300'
              }`}
            >
              <span className={activeTab === tab.id ? 'text-blue-400' : tab.color}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile horizontal tabs */}
      <nav className="lg:hidden -mx-4 px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 min-w-max pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20'
                  : 'text-slate-400 hover:bg-white/[0.04]'
              }`}
            >
              <span className={activeTab === tab.id ? 'text-blue-400' : tab.color}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content area */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  )
}
