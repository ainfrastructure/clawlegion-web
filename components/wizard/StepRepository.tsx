'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { WizardData } from './SessionWizard'
import { RepositorySkeleton } from './WizardSkeleton'

interface Repository {
  id: string
  name: string
  fullName: string
  isInitialized: boolean
}

interface Props {
  data: WizardData
  updateData: (updates: Partial<WizardData>) => void
  onNext: () => void
}

export default function StepRepository({ data, updateData, onNext }: Props) {
  const { data: repositories, isLoading, error } = useQuery<Repository[]>({
    queryKey: ['repositories'],
    queryFn: async () => {
      const response = await api.get('/repositories')
      return response.data
    },
  })

  const initializedRepos = repositories?.filter(r => r.isInitialized) || []

  const handleSelect = (repo: Repository) => {
    updateData({
      repositoryId: repo.id,
      repositoryName: repo.name,
    })
  }

  const canProceed = !!data.repositoryId

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Select Repository</h2>
        <p className="mt-2 text-gray-600 dark:text-slate-400">
          Choose a repository that has been initialized with ClawLegion Loop
        </p>
      </div>

      {isLoading ? (
        <RepositorySkeleton />
      ) : error ? (
        <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">Failed to load repositories.</p>
          <p className="text-sm text-red-600 dark:text-red-300 mt-2">
            Please check your connection and try again.
          </p>
        </div>
      ) : initializedRepos.length === 0 ? (
        <div className="text-center py-12 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-800 dark:text-yellow-200">No initialized repositories found.</p>
          <a
            href="/repositories"
            className="mt-4 inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Initialize a Repository
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {initializedRepos.map((repo) => (
            <button
              key={repo.id}
              onClick={() => handleSelect(repo)}
              className={`text-left p-6 rounded-lg border-2 transition-all ${
                data.repositoryId === repo.id
                  ? 'border-red-600 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                  : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:shadow bg-white dark:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{repo.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{repo.fullName}</p>
                </div>
                {data.repositoryId === repo.id && (
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-end pt-6">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
