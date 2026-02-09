'use client'

import { useState } from 'react'
import {
  Bell, Play, Loader2, Send, ChevronDown, CheckCircle, AlertCircle,
} from 'lucide-react'

const AVAILABLE_AGENTS = [
  { id: 'jarvis', name: 'Jarvis', description: 'Main orchestrator' },
  { id: 'lux', name: 'Lux', description: 'Secondary agent' },
] as const

type TaskDetailFooterProps = {
  taskId: string
  canPingAgent: boolean
  canExecute: boolean
  // Ping
  onPingAgent: (args: { taskId: string; message: string; agent: string }) => void
  isPinging: boolean
  pingSuccess: boolean
  pingError: boolean
  // Execute
  onExecute: () => void
  isExecuting: boolean
  // Close
  onClose: () => void
}

export function TaskDetailFooter({
  taskId,
  canPingAgent,
  canExecute,
  onPingAgent,
  isPinging,
  pingSuccess,
  pingError,
  onExecute,
  isExecuting,
  onClose,
}: TaskDetailFooterProps) {
  const [showPingInput, setShowPingInput] = useState(false)
  const [pingMessage, setPingMessage] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<string>(AVAILABLE_AGENTS[0].id)

  const handlePing = () => {
    onPingAgent({ taskId, message: pingMessage, agent: selectedAgent })
    setShowPingInput(false)
    setPingMessage('')
  }

  return (
    <div className="px-4 sm:px-6 py-4 border-t border-blue-500/[0.1] flex-shrink-0 bg-gradient-to-r from-blue-600/[0.06] via-transparent to-transparent">
      {showPingInput && (
        <div className="mb-4 space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-400 whitespace-nowrap">Ping Agent:</label>
            <div className="relative">
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="appearance-none bg-blue-950/40 border border-blue-500/[0.12] rounded-lg px-4 py-2 pr-10 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer"
              >
                {AVAILABLE_AGENTS.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} — {agent.description}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={pingMessage}
              onChange={(e) => setPingMessage(e.target.value)}
              placeholder="Optional message for the agent..."
              className="flex-1 bg-blue-950/40 border border-blue-500/[0.12] rounded-lg px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handlePing()
              }}
            />
            <button
              onClick={handlePing}
              disabled={isPinging}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2 text-sm font-medium transition-colors"
            >
              {isPinging ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send
            </button>
            <button
              onClick={() => setShowPingInput(false)}
              className="px-3 py-2 bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {canPingAgent && !showPingInput && (
            <button
              onClick={() => setShowPingInput(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Ping Agent</span>
              <span className="sm:hidden">Ping</span>
            </button>
          )}
          {canExecute && (
            <button
              onClick={onExecute}
              disabled={isExecuting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium disabled:opacity-50 transition-colors shadow-glow-blue"
            >
              {isExecuting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Execute Task
            </button>
          )}
          <a
            href="/tasks"
            className="px-4 py-2 bg-white/[0.04] border border-white/[0.06] text-blue-300/70 hover:text-white hover:bg-white/[0.08] rounded-lg text-sm transition-colors"
          >
            View Tasks
          </a>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] text-blue-200/80 rounded-lg text-sm transition-colors"
        >
          Close
        </button>
      </div>

      {pingSuccess && (
        <div className="mt-3 text-sm text-green-400 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Agent notified successfully!
        </div>
      )}
      {pingError && (
        <div className="mt-3 text-sm text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Failed to ping agent. Please try again.
        </div>
      )}
    </div>
  )
}
