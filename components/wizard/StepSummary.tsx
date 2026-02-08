'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'
import { WizardData } from './SessionWizard'
import { AGENT_METADATA, getAgentColorClasses, formatTimeBudget } from '@/lib/flow-presets'
import { Users, Clock, IterationCw, Flag, AlertTriangle } from 'lucide-react'

interface Props {
  data: WizardData
  onPrev: () => void
  onComplete: () => void
}

export default function StepSummary({ data, onPrev, onComplete }: Props) {
  const router = useRouter()
  const [autoStart, setAutoStart] = useState(false)

  const createMutation = useMutation({
    mutationFn: async () => {
      // 1. Save tasks to repository
      if (data.tasks.length > 0) {
        await api.post('/tasks/save', {
          repositoryId: data.repositoryId,
          tasks: data.tasks,
        })
      }

      // 2. Create session with flow config
      const config = {
        project: {
          name: data.sessionName,
          root: data.repositoryId,
          references: [],
        },
        tasks: {
          source: 'markdown',
          file: '.ralph/tasks.md',
          todoSection: '## 📋 Todo',
          completedSection: '## ✅ Completed',
        },
        quality: {
          checks: data.qualityChecks,
          commitPrefix: 'feat',
        },
        notifications: {
          discord: {
            enabled: !!data.discordWebhook,
            webhookUrl: data.discordWebhook,
          },
        },
        limits: {
          maxConsecutiveFailures: data.flowConfig.loopSettings.failThreshold,
          maxTotalFailures: data.flowConfig.loopSettings.failThreshold * 2,
          maxRuntime: data.flowConfig.loopSettings.timeBudgetHours * 3600,
        },
        // NEW: Include flow configuration
        flowConfig: data.flowConfig,
      }

      const sessionResponse = await api.post('/sessions', {
        repositoryId: data.repositoryId,
        name: data.sessionName,
        goal: data.goal,
        config,
      })

      // 3. Optionally start the session
      if (autoStart) {
        await api.post(`/process/${sessionResponse.data.id}/start`)
      }

      return sessionResponse.data
    },
    onSuccess: (session) => {
      router.push(`/sessions/${session.id}`)
    },
  })

  const totalPoints = data.tasks.reduce((sum, t) => sum + t.points, 0)
  const enabledAgents = data.flowConfig.agents.filter(a => a.enabled)
  const enabledCheckpoints = data.flowConfig.loopSettings.checkpoints.filter(c => c.enabled)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Review & Launch</h2>
        <p className="mt-2 text-gray-600 dark:text-slate-400">
          Review your session configuration before creating
        </p>
      </div>

      {/* Session Overview */}
      <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6 space-y-4 dark:bg-slate-800/50">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1">Session Name</h3>
          <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">{data.sessionName}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1">Repository</h3>
          <p className="text-gray-900 dark:text-slate-200">{data.repositoryName}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1">Goal</h3>
          <p className="text-gray-700 dark:text-slate-300">{data.goal}</p>
        </div>
      </div>

      {/* Agent Flow Configuration Summary */}
      <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6 dark:bg-slate-800/50">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" />
          Agent Flow Configuration
        </h3>

        {/* Enabled Agents */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">Active Agents ({enabledAgents.length})</p>
          <div className="flex flex-wrap gap-2">
            {data.flowConfig.agents.map((agent) => {
              const meta = AGENT_METADATA[agent.role]
              const colors = getAgentColorClasses(meta.color)
              return (
                <div
                  key={agent.role}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm
                    ${agent.enabled 
                      ? `${colors.bgLight} ${colors.border} ${colors.text}` 
                      : 'bg-gray-100 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-400 dark:text-slate-500 opacity-50'}
                  `}
                >
                  <span>{meta.emoji}</span>
                  <span className="font-medium">{meta.name}</span>
                  {agent.enabled && (
                    <span className="text-xs opacity-75">({agent.resourceLevel})</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Loop Settings Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium">Time Budget</span>
            </div>
            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {formatTimeBudget(data.flowConfig.loopSettings.timeBudgetHours)}
            </p>
          </div>

          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 mb-1">
              <IterationCw className="w-4 h-4" />
              <span className="text-xs font-medium">Max Iterations</span>
            </div>
            <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
              {data.flowConfig.loopSettings.maxIterations}
            </p>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 mb-1">
              <Flag className="w-4 h-4" />
              <span className="text-xs font-medium">Checkpoints</span>
            </div>
            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
              {enabledCheckpoints.length} of 3
            </p>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-medium">Fail Threshold</span>
            </div>
            <p className="text-lg font-bold text-amber-700 dark:text-amber-300">
              {data.flowConfig.loopSettings.failThreshold}
            </p>
          </div>
        </div>

        {/* Preset indicator */}
        {data.flowConfig.presetId && (
          <p className="mt-3 text-xs text-gray-500 dark:text-slate-500">
            Based on preset: <span className="font-medium">{data.flowConfig.presetId}</span>
          </p>
        )}
      </div>

      {/* Tasks Summary */}
      <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6 dark:bg-slate-800/50">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Tasks</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{data.tasks.length}</p>
            <p className="text-sm text-blue-800 dark:text-blue-300">Total Tasks</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{totalPoints}</p>
            <p className="text-sm text-purple-800 dark:text-purple-300">Story Points</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {Math.round(totalPoints * 45 / 60)}-{Math.round(totalPoints * 90 / 60)}h
            </p>
            <p className="text-sm text-green-800 dark:text-green-300">Est. Duration</p>
          </div>
        </div>

        {data.tasks.length > 0 && (
          <div className="space-y-2">
            {data.tasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center justify-between bg-gray-50 dark:bg-slate-700/50 rounded px-3 py-2">
                <span className="text-sm font-mono text-gray-600 dark:text-slate-400">{task.id}</span>
                <span className="text-sm text-gray-800 dark:text-slate-200 flex-1 ml-3">{task.title}</span>
                <span className="text-xs text-gray-500 dark:text-slate-400">{task.points}pts</span>
              </div>
            ))}
            {data.tasks.length > 3 && (
              <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-2">
                +{data.tasks.length - 3} more tasks
              </p>
            )}
          </div>
        )}
      </div>

      {/* Other Configuration */}
      <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6 dark:bg-slate-800/50">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Other Settings</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-slate-400">Discord Notifications</span>
            <span className={`text-sm font-semibold ${data.discordWebhook ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
              {data.discordWebhook ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-slate-400">Quality Checks</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-slate-200">
              {data.qualityChecks.length} check{data.qualityChecks.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Auto-start Option */}
      <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={autoStart}
            onChange={(e) => setAutoStart(e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 dark:border-slate-600 rounded focus:ring-blue-500"
          />
          <span className="ml-3 text-sm font-medium text-blue-900 dark:text-blue-200">
            Start ClawLegion Loop immediately after creating session
          </span>
        </label>
        <p className="ml-8 mt-1 text-xs text-blue-700 dark:text-blue-400">
          If unchecked, you can manually start the session later
        </p>
      </div>

      {/* Error Display */}
      {createMutation.isError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-300">
            Failed to create session. Please try again.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onPrev}
          disabled={createMutation.isPending}
          className="px-6 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 
            rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 disabled:opacity-50 font-semibold transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 
            disabled:opacity-50 font-semibold flex items-center gap-2 transition-colors"
        >
          {createMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Creating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Create Session
            </>
          )}
        </button>
      </div>
    </div>
  )
}
