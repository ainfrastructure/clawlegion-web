'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { WizardData, Task } from './SessionWizard'

interface Props {
  data: WizardData
  updateData: (updates: Partial<WizardData>) => void
  onNext: () => void
  onPrev: () => void
}

export default function StepGenerateTasks({ data, updateData, onNext, onPrev }: Props) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [includePlans, setIncludePlans] = useState(true)

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/tasks/generate', {
        repositoryId: data.repositoryId,
        goal: data.goal,
        additionalContext: data.additionalContext,
        includePlans,
      })
      return response.data
    },
    onSuccess: (response) => {
      updateData({ tasks: response.tasks })
      setIsGenerating(false)
      // Auto-advance to next step after generation
      setTimeout(() => {
        onNext()
      }, 1000)
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to generate tasks')
      setIsGenerating(false)
    },
  })

  const handleGenerate = () => {
    setIsGenerating(true)
    setError(null)
    generateMutation.mutate()
  }

  const hasGeneratedTasks = data.tasks.length > 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Generate Tasks</h2>
        <p className="mt-2 text-gray-600">
          Let Claude Code analyze your goal and break it down into actionable tasks
        </p>
      </div>

      {/* Goal Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Your Goal:</h3>
        <p className="text-gray-700">{data.goal}</p>
        {data.additionalContext && (
          <>
            <h3 className="font-semibold text-gray-900 mt-4 mb-2">Additional Context:</h3>
            <p className="text-gray-700">{data.additionalContext}</p>
          </>
        )}
      </div>

      {/* Plan Generation Toggle */}
      {!isGenerating && !hasGeneratedTasks && !error && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={includePlans}
              onChange={(e) => setIncludePlans(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="ml-3 text-sm text-gray-900 font-medium">
              Generate detailed implementation plans
            </span>
          </label>
          <p className="mt-2 ml-7 text-xs text-gray-600">
            Include approach, steps, and considerations for each task. Recommended for complex projects.
          </p>
        </div>
      )}

      {/* Generation Status */}
      {!isGenerating && !hasGeneratedTasks && !error && (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Generate Tasks</h3>
          <p className="text-gray-600 mb-6">
            Click the button below to start task generation with Claude Code
          </p>
          <button
            onClick={handleGenerate}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Generate Tasks with Claude
          </button>
        </div>
      )}

      {/* Generating */}
      {isGenerating && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Tasks...</h3>
          <p className="text-gray-600 mb-2">
            Claude Code is analyzing your goal and creating actionable tasks
          </p>
          <p className="text-sm text-gray-500">
            This may take 30-60 seconds depending on complexity
          </p>
          <div className="mt-6 max-w-md mx-auto">
            <div className="flex items-start space-x-3 text-left">
              <div className="flex-shrink-0 mt-1">
                <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
              <div className="text-sm text-gray-600">
                Analyzing project structure and requirements...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success */}
      {hasGeneratedTasks && !isGenerating && (
        <div className="text-center py-12 bg-green-50 border border-green-200 rounded-lg">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Tasks Generated Successfully!
          </h3>
          <p className="text-green-700">
            Generated {data.tasks.length} task{data.tasks.length !== 1 ? 's' : ''} totaling{' '}
            {data.tasks.reduce((sum, t) => sum + t.points, 0)} story points
          </p>
          <p className="text-sm text-green-600 mt-2">
            Proceeding to review step...
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">Generation Failed</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                onClick={handleGenerate}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Skip Option */}
      {!isGenerating && !hasGeneratedTasks && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">
            Or add tasks manually later
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            You can skip automatic generation and add tasks manually to the repository&apos;s tasks.md file
          </p>
          <button
            onClick={onNext}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Skip task generation →
          </button>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <button
          onClick={onPrev}
          disabled={isGenerating}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 font-semibold"
        >
          Back
        </button>
        {hasGeneratedTasks && !isGenerating && (
          <button
            onClick={onNext}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Review Tasks
          </button>
        )}
      </div>
    </div>
  )
}
