'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import StepRepository from './StepRepository'
import StepGoal from './StepGoal'
import StepGenerateTasks from './StepGenerateTasks'
import StepReviewTasks from './StepReviewTasks'
import StepLinearSync from './StepLinearSync'
import StepConfiguration from './StepConfiguration'
import StepSummary from './StepSummary'
import { Header } from '@/components/dashboard/Header'
import { CheckCircle } from 'lucide-react'

export interface TaskPlan {
  approach: string
  steps: string[]
  considerations: string[]
}

export interface Task {
  id: string
  title: string
  points: number
  description: string
  subtasks: string[]
  successCriteria: string[]
  notes?: string
  plan?: TaskPlan
}

import type { FlowConfiguration } from '@/components/flow-config/types'
import { DEFAULT_CONFIG } from '@/lib/flow-presets'

export interface WizardData {
  repositoryId: string
  repositoryName: string
  sessionName: string
  sessionId?: string
  goal: string
  additionalContext: string
  tasks: Task[]
  linearConfig?: any
  discordWebhook: string
  qualityChecks: string[]
  maxRuntime: number
  flowConfig: FlowConfiguration  // Agent flow configuration
}

const steps = [
  { id: 1, name: 'Repository', description: 'Select project' },
  { id: 2, name: 'Goal', description: 'Define objective' },
  { id: 3, name: 'Generate', description: 'Create tasks' },
  { id: 4, name: 'Review', description: 'Edit tasks' },
  { id: 5, name: 'Linear Sync', description: 'Sync to Linear' },
  { id: 6, name: 'Configure', description: 'Set options' },
  { id: 7, name: 'Summary', description: 'Review & launch' },
]

export default function SessionWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<WizardData>({
    repositoryId: '',
    repositoryName: '',
    sessionName: '',
    goal: '',
    additionalContext: '',
    tasks: [],
    discordWebhook: '',
    qualityChecks: [],
    maxRuntime: 28800,
    flowConfig: DEFAULT_CONFIG,  // Default agent flow configuration
  })

  const updateData = (updates: Partial<WizardData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6">Create ClawLegion Loop Session</h2>

        {/* Progress Steps */}
        <nav aria-label="Progress" className="mb-8">
          <ol className="flex items-center justify-between">
            {steps.map((step, index) => (
              <li
                key={step.id}
                className={`flex flex-col items-center ${
                  index < steps.length - 1 ? 'flex-1' : ''
                }`}
              >
                <button
                  onClick={() => goToStep(step.id)}
                  disabled={step.id > currentStep}
                  className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    step.id < currentStep
                      ? 'bg-red-600 border-red-600 text-white'
                      : step.id === currentStep
                      ? 'bg-white dark:bg-slate-800 border-red-600 text-red-600'
                      : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-400 dark:text-slate-500'
                  } ${step.id <= currentStep ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed'}`}
                >
                  {step.id < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </button>
                <span className={`mt-2 text-xs font-medium ${
                  step.id <= currentStep ? 'text-gray-900 dark:text-slate-100' : 'text-gray-500 dark:text-slate-400'
                }`}>
                  {step.name}
                </span>
                <span className="hidden sm:block text-xs text-gray-500 dark:text-slate-400">
                  {step.description}
                </span>

                {index < steps.length - 1 && (
                  <div
                    className={`hidden md:block absolute top-5 left-1/2 w-full h-0.5 ${
                      step.id < currentStep ? 'bg-red-600' : 'bg-gray-300 dark:bg-slate-600'
                    }`}
                    style={{ width: 'calc(100% - 40px)', marginLeft: '20px' }}
                  />
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Step Content */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-200 dark:border-slate-700 p-6 min-h-96">
          {currentStep === 1 && (
            <StepRepository
              data={data}
              updateData={updateData}
              onNext={nextStep}
            />
          )}
          {currentStep === 2 && (
            <StepGoal
              data={data}
              updateData={updateData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          {currentStep === 3 && (
            <StepGenerateTasks
              data={data}
              updateData={updateData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          {currentStep === 4 && (
            <StepReviewTasks
              data={data}
              updateData={updateData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          {currentStep === 5 && (
            <StepLinearSync
              data={data}
              updateData={updateData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          {currentStep === 6 && (
            <StepConfiguration
              data={data}
              updateData={updateData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          {currentStep === 7 && (
            <StepSummary
              data={data}
              onPrev={prevStep}
              onComplete={() => router.push('/dashboard')}
            />
          )}
        </div>
      </main>
    </div>
  )
}
