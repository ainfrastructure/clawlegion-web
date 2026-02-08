'use client'

import { X, Copy, Check, Zap, Clock, AlertTriangle, TrendingUp, Flag } from 'lucide-react'
import { useState } from 'react'
import { AGENT_METADATA, formatTimeBudget, getAgentColorClasses } from '@/lib/flow-presets'
import type { ConfigPreviewModalProps } from '../types'

export function ConfigPreviewModal({ isOpen, onClose, config }: ConfigPreviewModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const enabledAgents = config.agents.filter(a => a.enabled)
  const enabledCheckpoints = config.loopSettings.checkpoints.filter(c => c.enabled)

  const handleCopyConfig = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(config, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy config:', err)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden bg-slate-900 border border-white/[0.06] rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-lg font-semibold text-white">Configuration Preview</h2>
            <p className="text-sm text-slate-400">Review your flow configuration before launching</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(85vh-140px)] space-y-6">
          {/* Agent Pipeline */}
          <section>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Agent Pipeline
            </h3>
            <div className="glass-2 rounded-lg p-4">
              <div className="flex flex-wrap gap-3">
                {config.agents.map((agent) => {
                  const meta = AGENT_METADATA[agent.role]
                  const colors = getAgentColorClasses(meta.color)
                  return (
                    <div
                      key={agent.role}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg border
                        ${agent.enabled 
                          ? `${colors.bgLight} ${colors.border}` 
                          : 'bg-slate-800 border-slate-600 opacity-50'}
                      `}
                    >
                      <span className="text-lg">{meta.emoji}</span>
                      <div>
                        <p className={`text-sm font-medium ${agent.enabled ? colors.text : 'text-slate-400'}`}>
                          {meta.name}
                        </p>
                        {agent.enabled && (
                          <p className="text-xs text-slate-400 capitalize">
                            {agent.resourceLevel} resources
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-slate-500 mt-3">
                {enabledAgents.length} agent{enabledAgents.length !== 1 ? 's' : ''} will work on this task
              </p>
            </div>
          </section>

          {/* Time & Iterations */}
          <section>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Time & Iterations
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-2 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-1">Time Budget</p>
                <p className="text-xl font-semibold text-blue-400">
                  {formatTimeBudget(config.loopSettings.timeBudgetHours)}
                </p>
              </div>
              <div className="glass-2 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-1">Max Iterations</p>
                <p className="text-xl font-semibold text-slate-200">
                  {config.loopSettings.maxIterations} cycles
                </p>
              </div>
            </div>
          </section>

          {/* Checkpoints */}
          <section>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Flag className="w-4 h-4 text-emerald-400" />
              Checkpoints
            </h3>
            <div className="flex gap-3">
              {config.loopSettings.checkpoints.map((checkpoint) => (
                <div
                  key={checkpoint.percentage}
                  className={`
                    flex-1 text-center py-3 rounded-lg border
                    ${checkpoint.enabled 
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
                      : 'bg-slate-800 border-slate-600 text-slate-500'}
                  `}
                >
                  <p className="text-lg font-semibold">{checkpoint.percentage}%</p>
                  <p className="text-xs">{checkpoint.enabled ? 'Enabled' : 'Disabled'}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {enabledCheckpoints.length > 0 
                ? `Progress will pause at ${enabledCheckpoints.map(c => `${c.percentage}%`).join(', ')} for review`
                : 'No checkpoints - will run without pausing'}
            </p>
          </section>

          {/* Safety Thresholds */}
          <section>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Safety Thresholds
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="glass-2 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Fail Threshold</p>
                <p className="text-lg font-semibold text-amber-400">
                  {config.loopSettings.failThreshold}
                </p>
                <p className="text-xs text-slate-500">consecutive fails</p>
              </div>
              <div className="glass-2 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">ROI Threshold</p>
                <p className="text-lg font-semibold text-emerald-400">
                  {config.loopSettings.roiThreshold}%
                </p>
                <p className="text-xs text-slate-500">minimum to continue</p>
              </div>
              <div className="glass-2 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Expansion Approval</p>
                <p className="text-lg font-semibold text-purple-400">
                  {config.loopSettings.expansionApprovalThreshold}%
                </p>
                <p className="text-xs text-slate-500">ROI for auto-approve</p>
              </div>
            </div>
          </section>

          {/* Raw JSON (collapsible) */}
          <section>
            <details className="group">
              <summary className="text-sm font-medium text-slate-400 cursor-pointer hover:text-slate-300 flex items-center gap-2">
                <span className="group-open:rotate-90 transition-transform">▶</span>
                Raw Configuration
              </summary>
              <div className="mt-3 relative">
                <pre className="p-4 bg-slate-950 rounded-lg text-xs text-slate-400 overflow-x-auto border border-white/[0.06]">
                  {JSON.stringify(config, null, 2)}
                </pre>
                <button
                  onClick={handleCopyConfig}
                  className="absolute top-2 right-2 p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </details>
          </section>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-white/[0.06] bg-slate-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfigPreviewModal
