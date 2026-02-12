'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { WizardData } from './SessionWizard'
import { SelectionSkeleton } from './WizardSkeleton'

interface Props {
  data: WizardData
  updateData: (updates: Partial<WizardData>) => void
  onNext: () => void
  onPrev: () => void
}

interface Team {
  id: string
  name: string
  key: string
}

interface Project {
  id: string
  name: string
}

export default function StepLinearSync({ data, updateData, onNext, onPrev }: Props) {
  const [apiKey, setApiKey] = useState('')
  const [apiKeyValidated, setApiKeyValidated] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [syncError, setSyncError] = useState<string | null>(null)
  const [syncProgress, setSyncProgress] = useState<string | null>(null)
  const [linearConfig, setLinearConfig] = useState<any>(null)

  // Validate API key mutation
  const validateMutation = useMutation({
    mutationFn: async (key: string) => {
      const response = await api.post('/linear/validate', {}, {
        headers: { 'x-linear-api-key': key }
      })
      return response.data
    },
    onSuccess: () => {
      setApiKeyValidated(true)
      setSyncError(null)
    },
    onError: (error: any) => {
      setSyncError(error.response?.data?.message || 'Invalid API key')
      setApiKeyValidated(false)
    }
  })

  // Fetch teams query
  const teamsQuery = useQuery({
    queryKey: ['linear-teams', apiKey],
    queryFn: async () => {
      const response = await api.get('/linear/teams', {
        headers: { 'x-linear-api-key': apiKey }
      })
      return response.data.teams as Team[]
    },
    enabled: apiKeyValidated,
  })

  // Fetch projects query
  const projectsQuery = useQuery({
    queryKey: ['linear-projects', selectedTeamId, apiKey],
    queryFn: async () => {
      const response = await api.get(`/linear/projects/${selectedTeamId}`, {
        headers: { 'x-linear-api-key': apiKey }
      })
      return response.data.projects as Project[]
    },
    enabled: !!selectedTeamId && apiKeyValidated,
  })

  // Sync tasks to Linear mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      setSyncProgress('Creating Linear issues...')

      const response = await api.post('/linear/sync-tasks', {
        sessionId: data.sessionId,
        tasks: data.tasks.map(t => t.id),
        linearConfig: {
          apiKey,
          teamId: selectedTeamId,
          projectId: selectedProjectId || undefined,
        }
      })
      return response.data
    },
    onSuccess: (response) => {
      setSyncProgress(null)
      setSyncError(null)

      // Store Linear config in wizard data
      updateData({
        linearConfig: {
          apiKey,
          teamId: selectedTeamId,
          projectId: selectedProjectId,
          synced: true,
          issuesCreated: response.results?.success || data.tasks.length
        }
      })

      // Auto-advance after 1 second
      setTimeout(() => {
        onNext()
      }, 1000)
    },
    onError: (error: any) => {
      setSyncProgress(null)
      setSyncError(error.response?.data?.message || 'Failed to sync tasks to Linear')
    }
  })

  const handleValidateKey = () => {
    if (!apiKey.trim()) {
      setSyncError('Please enter a Linear API key')
      return
    }
    validateMutation.mutate(apiKey.trim())
  }

  const handleSync = () => {
    if (!selectedTeamId) {
      setSyncError('Please select a team')
      return
    }
    syncMutation.mutate()
  }

  const handleSkip = () => {
    updateData({ linearConfig: null })
    onNext()
  }

  const isSyncing = syncMutation.isPending
  const canSync = apiKeyValidated && selectedTeamId && !isSyncing

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Sync to Linear (Optional)</h2>
        <p className="mt-2 text-gray-600">
          Optionally sync your generated tasks to Linear for tracking and collaboration
        </p>
      </div>

      {/* API Key Input */}
      {!apiKeyValidated && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Linear API Key</h3>
          <p className="text-sm text-gray-600 mb-4">
            Get your API key from <a href="https://linear.app/settings/api" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Linear Settings → API</a>
          </p>

          <div className="flex gap-3">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="lin_api_..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={validateMutation.isPending}
            />
            <button
              onClick={handleValidateKey}
              disabled={validateMutation.isPending || !apiKey.trim()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {validateMutation.isPending ? 'Validating...' : 'Validate'}
            </button>
          </div>

          {syncError && !validateMutation.isPending && (
            <p className="mt-3 text-sm text-red-600">{syncError}</p>
          )}
        </div>
      )}

      {/* Team Selection */}
      {apiKeyValidated && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Select Team</h3>
            <button
              onClick={() => {
                setApiKeyValidated(false)
                setApiKey('')
                setSelectedTeamId('')
                setSelectedProjectId('')
              }}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Change API Key
            </button>
          </div>

          {teamsQuery.isLoading && (
            <SelectionSkeleton label="Loading teams..." />
          )}

          {teamsQuery.data && (
            <select
              value={selectedTeamId}
              onChange={(e) => {
                setSelectedTeamId(e.target.value)
                setSelectedProjectId('') // Reset project when team changes
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSyncing}
            >
              <option value="">Select a team...</option>
              {teamsQuery.data.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} ({team.key})
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Project Selection (Optional) */}
      {selectedTeamId && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Select Project (Optional)
          </h3>

          {projectsQuery.isLoading && (
            <SelectionSkeleton label="Loading projects..." />
          )}

          {projectsQuery.data && (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSyncing}
            >
              <option value="">No project (tasks will be unassigned)</option>
              {projectsQuery.data.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Sync Preview */}
      {canSync && !isSyncing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Ready to Sync</h3>
          <p className="text-sm text-blue-700 mb-3">
            {data.tasks.length} task{data.tasks.length !== 1 ? 's' : ''} will be created as Linear issues
          </p>
          <ul className="text-sm text-blue-700 space-y-1 mb-4">
            <li>• Tasks will include full descriptions and acceptance criteria</li>
            <li>• Story points will be mapped to Linear estimates</li>
            <li>• Implementation plans will be included in descriptions</li>
            <li>• Linear URLs will be added to tasks.md</li>
          </ul>
          <button
            onClick={handleSync}
            className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
          >
            Sync {data.tasks.length} Tasks to Linear
          </button>
        </div>
      )}

      {/* Syncing Progress */}
      {isSyncing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-red-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-blue-900 mb-2">{syncProgress}</h3>
          <p className="text-sm text-blue-700">
            This may take a few seconds...
          </p>
        </div>
      )}

      {/* Success State */}
      {data.linearConfig?.synced && !isSyncing && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Successfully Synced to Linear!
          </h3>
          <p className="text-green-700">
            {data.linearConfig.issuesCreated} Linear issue{data.linearConfig.issuesCreated !== 1 ? 's' : ''} created
          </p>
          <p className="text-sm text-green-600 mt-2">
            Proceeding to configuration...
          </p>
        </div>
      )}

      {/* Error State */}
      {syncError && apiKeyValidated && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="h-6 w-6 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Sync Failed</h3>
              <p className="mt-1 text-sm text-red-700">{syncError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Skip Option */}
      {!data.linearConfig?.synced && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">
            Or skip Linear sync
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            You can always sync tasks to Linear manually later from the session page
          </p>
          <button
            onClick={handleSkip}
            disabled={isSyncing}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            Skip Linear sync →
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onPrev}
          disabled={isSyncing}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 font-semibold"
        >
          Back
        </button>
        {data.linearConfig?.synced && (
          <button
            onClick={onNext}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
          >
            Continue to Configuration
          </button>
        )}
      </div>
    </div>
  )
}
