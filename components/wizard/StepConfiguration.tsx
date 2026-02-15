'use client'

import { WizardData } from './SessionWizard'
import { FlowConfigPanel } from '@/components/flow-config'
import type { FlowConfiguration } from '@/components/flow-config/types'

interface Props {
  data: WizardData
  updateData: (updates: Partial<WizardData>) => void
  onNext: () => void
  onPrev: () => void
}

export default function StepConfiguration({ data, updateData, onNext, onPrev }: Props) {
  const addQualityCheck = () => {
    const check = prompt('Enter a quality check command (e.g., npm test, npm run lint):')
    if (check && check.trim()) {
      updateData({ qualityChecks: [...data.qualityChecks, check.trim()] })
    }
  }

  const removeQualityCheck = (index: number) => {
    const updated = data.qualityChecks.filter((_, i) => i !== index)
    updateData({ qualityChecks: updated })
  }

  const handleFlowConfigChange = (flowConfig: FlowConfiguration) => {
    updateData({ flowConfig })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Configuration</h2>
        <p className="mt-2 text-gray-600 dark:text-slate-400">
          Configure agent flow, notifications, quality checks, and runtime limits
        </p>
      </div>

      {/* Agent Flow Configuration */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
        <FlowConfigPanel
          config={data.flowConfig}
          onChange={handleFlowConfigChange}
          isWizardMode={true}
        />
      </div>

      {/* Notifications */}
      <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6 dark:bg-slate-800/50">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Notifications</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Discord Webhook URL
          </label>
          <input
            type="url"
            value={data.discordWebhook}
            onChange={(e) => updateData({ discordWebhook: e.target.value })}
            placeholder="https://discord.com/api/webhooks/..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg 
              focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-200"
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
            Get notified on Discord when sessions start, complete, or fail
          </p>
        </div>
      </div>

      {/* Quality Checks */}
      <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6 dark:bg-slate-800/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Quality Checks</h3>
          <button
            onClick={addQualityCheck}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            + Add Check
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
          Commands to run before each commit to ensure code quality
        </p>

        {data.qualityChecks.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
            <p className="text-sm text-gray-500 dark:text-slate-400">No quality checks configured</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
              Checks will run before each commit
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.qualityChecks.map((check, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg px-4 py-3"
              >
                <code className="text-sm text-gray-800 dark:text-slate-200 font-mono">{check}</code>
                <button
                  onClick={() => removeQualityCheck(index)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Common checks:</strong> npm test, npm run lint, npm run type-check, npm run build
          </p>
        </div>
      </div>

      {/* Runtime Limits - Simplified since flow config handles time budget */}
      <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6 dark:bg-slate-800/50">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Legacy Runtime Limits</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
          ⚠️ Note: Time budget is now configured in the Agent Flow settings above. 
          This setting is kept for backwards compatibility.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Maximum Runtime (seconds)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={data.maxRuntime}
              onChange={(e) => updateData({ maxRuntime: parseInt(e.target.value) })}
              min="600"
              max="86400"
              step="300"
              className="w-32 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg 
                focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-200"
            />
            <span className="text-sm text-gray-600 dark:text-slate-400">
              ({Math.round(data.maxRuntime / 3600)} hours)
            </span>
          </div>

          {/* Presets */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { label: '30 min', value: 1800 },
              { label: '1 hour', value: 3600 },
              { label: '2 hours', value: 7200 },
              { label: '4 hours', value: 14400 },
              { label: '8 hours', value: 28800 },
            ].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => updateData({ maxRuntime: value })}
                className={`px-3 py-1 rounded text-sm transition-colors
                  ${data.maxRuntime === value 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onPrev}
          className="px-6 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 
            rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 font-semibold transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors"
        >
          Review Summary
        </button>
      </div>
    </div>
  )
}
