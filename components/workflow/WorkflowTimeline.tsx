'use client'

import { useMemo } from 'react'
import { WorkflowStep } from './types'
import { WorkflowStepComponent } from './WorkflowStep'

interface WorkflowTimelineProps {
  steps: WorkflowStep[]
  filter?: string
}

export function WorkflowTimeline({ steps, filter }: WorkflowTimelineProps) {
  // Group consecutive tool_call and tool_result pairs
  const groupedSteps = useMemo(() => {
    const groups: Array<{
      type: 'single' | 'pair'
      call?: WorkflowStep
      result?: WorkflowStep
      step?: WorkflowStep
    }> = []

    let i = 0
    while (i < steps.length) {
      const current = steps[i]
      const next = steps[i + 1]

      // Try to pair tool_call with its result
      if (current.type === 'tool_call' && next?.type === 'tool_result') {
        groups.push({
          type: 'pair',
          call: current,
          result: next,
        })
        i += 2
      } else {
        groups.push({
          type: 'single',
          step: current,
        })
        i++
      }
    }

    return groups
  }, [steps])

  // Filter steps
  const filteredGroups = useMemo(() => {
    if (!filter) return groupedSteps

    const lowerFilter = filter.toLowerCase()
    return groupedSteps.filter(group => {
      if (group.type === 'pair') {
        return (
          group.call?.content.toLowerCase().includes(lowerFilter) ||
          group.result?.content.toLowerCase().includes(lowerFilter) ||
          group.call?.metadata?.tool?.toLowerCase().includes(lowerFilter)
        )
      }
      return group.step?.content.toLowerCase().includes(lowerFilter)
    })
  }, [groupedSteps, filter])

  if (steps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-sm">No workflow steps found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {filteredGroups.map((group, idx) => {
        if (group.type === 'pair' && group.call && group.result) {
          // Render paired tool call + result as a combined card
          return (
            <div key={`${group.call.id}-pair`} className="relative">
              {/* Step number */}
              <div className="absolute -left-8 top-3 w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-300">
                {idx + 1}
              </div>
              
              {/* Combined card */}
              <div className="border border-blue-500/30 rounded-lg bg-blue-500/5 overflow-hidden">
                <WorkflowStepComponent step={group.call} />
                <div className="border-t border-slate-700/50">
                  <WorkflowStepComponent step={group.result} />
                </div>
              </div>
            </div>
          )
        }

        // Single step
        const step = group.step!
        return (
          <div key={step.id} className="relative">
            {/* Step number */}
            <div className="absolute -left-8 top-3 w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-300">
              {idx + 1}
            </div>
            
            <WorkflowStepComponent step={step} />
          </div>
        )
      })}

      {filteredGroups.length === 0 && filter && (
        <div className="text-center py-8 text-slate-400">
          <p className="text-sm">No steps match your filter</p>
        </div>
      )}
    </div>
  )
}
