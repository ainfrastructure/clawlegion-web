'use client'

import { WizardData } from './SessionWizard'

interface Props {
  data: WizardData
  updateData: (updates: Partial<WizardData>) => void
  onNext: () => void
  onPrev: () => void
}

export default function StepGoal({ data, updateData, onNext, onPrev }: Props) {
  const canProceed = data.sessionName.trim() !== '' && data.goal.trim() !== ''

  const exampleGoals = [
    'Build a user dashboard with analytics and charts',
    'Implement authentication with OAuth and JWT',
    'Add real-time notifications using WebSocket',
    'Create a REST API with CRUD operations',
    'Migrate from JavaScript to TypeScript',
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Define Your Goal</h2>
        <p className="mt-2 text-gray-600">
          Describe what you want to accomplish in this ClawLegion Loop session
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Session Name *
        </label>
        <input
          type="text"
          value={data.sessionName}
          onChange={(e) => updateData({ sessionName: e.target.value })}
          placeholder="e.g., Feature Implementation Sprint"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="mt-1 text-sm text-gray-500">
          A short, descriptive name for this session
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Goal *
        </label>
        <textarea
          value={data.goal}
          onChange={(e) => updateData({ goal: e.target.value })}
          placeholder="Be specific about what features or changes you want implemented..."
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="mt-1 text-sm text-gray-500">
          Be clear and specific. This will be used to generate actionable tasks.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Context (Optional)
        </label>
        <textarea
          value={data.additionalContext}
          onChange={(e) => updateData({ additionalContext: e.target.value })}
          placeholder="Any additional context, constraints, or requirements..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="mt-1 text-sm text-gray-500">
          Optional: Add any specific requirements, technologies to use, or constraints
        </p>
      </div>

      {/* Example Goals */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Example Goals:</h3>
        <ul className="space-y-2">
          {exampleGoals.map((example, idx) => (
            <li key={idx} className="text-sm text-blue-800">
              • {example}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onPrev}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          Generate Tasks
        </button>
      </div>
    </div>
  )
}
