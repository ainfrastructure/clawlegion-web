'use client'

import { ReactNode } from 'react'
import { Key, Plug, Bot, Paintbrush, Keyboard, AlertTriangle, Bell } from 'lucide-react'

export type SettingsTab = 'api-keys' | 'integrations' | 'notifications' | 'agents' | 'appearance' | 'keyboard-shortcuts' | 'danger-zone'

export const tabs: { id: SettingsTab; label: string; icon: ReactNode; color: string; activeGlow: string }[] = [
  { id: 'api-keys', label: 'API Keys', icon: <Key size={16} />, color: 'text-amber-400', activeGlow: 'shadow-amber-500/20' },
  { id: 'integrations', label: 'Integrations', icon: <Plug size={16} />, color: 'text-blue-400', activeGlow: 'shadow-blue-500/20' },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={16} />, color: 'text-orange-400', activeGlow: 'shadow-orange-500/20' },
  { id: 'agents', label: 'Agent Defaults', icon: <Bot size={16} />, color: 'text-purple-400', activeGlow: 'shadow-purple-500/20' },
  { id: 'appearance', label: 'Appearance', icon: <Paintbrush size={16} />, color: 'text-pink-400', activeGlow: 'shadow-pink-500/20' },
  { id: 'keyboard-shortcuts', label: 'Shortcuts', icon: <Keyboard size={16} />, color: 'text-green-400', activeGlow: 'shadow-green-500/20' },
  { id: 'danger-zone', label: 'Danger Zone', icon: <AlertTriangle size={16} />, color: 'text-red-400', activeGlow: 'shadow-red-500/20' },
]

type SettingsTabsProps = {
  activeTab: string
  onTabChange: (tab: string) => void
  children: ReactNode
}

export function SettingsTabs({ activeTab, onTabChange, children }: SettingsTabsProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Horizontal segmented nav */}
      <nav className="glass-2 rounded-2xl p-1.5 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? `glass-3 ${tab.color} shadow-lg ${tab.activeGlow} border border-white/[0.08]`
                    : 'text-slate-400 hover:text-slate-300 hover:bg-white/[0.04]'
                }`}
              >
                <span className={isActive ? tab.color : 'text-slate-500'}>
                  {tab.icon}
                </span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Full-width content area */}
      <div className="min-w-0">
        {children}
      </div>
    </div>
  )
}
