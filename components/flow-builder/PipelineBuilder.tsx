'use client'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Layers } from 'lucide-react'
import type { PipelineStep } from '@/components/flow-config/types'
import { PipelineStepCard } from './PipelineStepCard'

type PipelineBuilderProps = {
  steps: PipelineStep[]
  selectedStepId: string | null
  onSelectStep: (id: string | null) => void
  onStepsChange: (steps: PipelineStep[]) => void
}

export function PipelineBuilder({
  steps,
  selectedStepId,
  onSelectStep,
  onStepsChange,
}: PipelineBuilderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const sortedSteps = [...steps].sort((a, b) => a.order - b.order)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sortedSteps.findIndex(s => s.id === active.id)
    const newIndex = sortedSteps.findIndex(s => s.id === over.id)

    const reordered = [...sortedSteps]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)

    // Reassign order values
    const updated = reordered.map((step, i) => ({ ...step, order: i }))
    onStepsChange(updated)
  }

  const handleStepChange = (updated: PipelineStep) => {
    onStepsChange(steps.map(s => (s.id === updated.id ? updated : s)))
  }

  const handleRemoveStep = (id: string) => {
    const remaining = steps.filter(s => s.id !== id)
    // Reassign order
    const reordered = remaining
      .sort((a, b) => a.order - b.order)
      .map((s, i) => ({ ...s, order: i }))
    onStepsChange(reordered)
    if (selectedStepId === id) onSelectStep(null)
  }

  if (sortedSteps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl glass-2 flex items-center justify-center mb-4">
          <Layers className="w-7 h-7 text-slate-500" />
        </div>
        <p className="text-slate-400 font-medium mb-1">No agents in pipeline</p>
        <p className="text-sm text-slate-600 max-w-xs">
          Add agents from the palette above to build your pipeline
        </p>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedSteps.map(s => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {sortedSteps.map((step, index) => (
            <div key={step.id} className="relative">
              {/* Connection line */}
              {index > 0 && (
                <div className="absolute left-[42px] -top-2 w-px h-2 bg-gradient-to-b from-slate-600/50 to-slate-700/30" />
              )}
              <PipelineStepCard
                step={step}
                index={index}
                isSelected={selectedStepId === step.id}
                onSelect={() => onSelectStep(selectedStepId === step.id ? null : step.id)}
                onChange={handleStepChange}
                onRemove={() => handleRemoveStep(step.id)}
              />
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
