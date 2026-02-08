'use client'

import { useState } from 'react'
import { WizardData, Task } from './SessionWizard'

interface ExpandedPlans {
  [taskId: string]: boolean
}

interface Props {
  data: WizardData
  updateData: (updates: Partial<WizardData>) => void
  onNext: () => void
  onPrev: () => void
}

export default function StepReviewTasks({ data, updateData, onNext, onPrev }: Props) {
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [editedTask, setEditedTask] = useState<Task | null>(null)
  const [expandedPlans, setExpandedPlans] = useState<ExpandedPlans>({})

  const startEdit = (task: Task) => {
    setEditingTask(task.id)
    setEditedTask({ ...task })
  }

  const cancelEdit = () => {
    setEditingTask(null)
    setEditedTask(null)
  }

  const saveEdit = () => {
    if (editedTask) {
      const updatedTasks = data.tasks.map(t =>
        t.id === editedTask.id ? editedTask : t
      )
      updateData({ tasks: updatedTasks })
      setEditingTask(null)
      setEditedTask(null)
    }
  }

  const deleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      const updatedTasks = data.tasks.filter(t => t.id !== taskId)
      updateData({ tasks: updatedTasks })
    }
  }

  const togglePlan = (taskId: string) => {
    setExpandedPlans(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }))
  }

  const totalPoints = data.tasks.reduce((sum, t) => sum + t.points, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Review Tasks</h2>
        <p className="mt-2 text-gray-600">
          Review and edit the generated tasks. You can modify any details or add/remove tasks.
        </p>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div>
          <p className="text-sm font-medium text-blue-900">
            {data.tasks.length} Task{data.tasks.length !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-blue-700">
            Total: {totalPoints} story points
          </p>
        </div>
        <div className="text-sm text-blue-800">
          Estimated: {Math.round(totalPoints * 45 / 60)} - {Math.round(totalPoints * 90 / 60)} hours
        </div>
      </div>

      {/* Task List */}
      {data.tasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-gray-600">No tasks generated yet</p>
          <button
            onClick={onPrev}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go back to generate tasks
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {data.tasks.map((task, index) => (
            <div
              key={task.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              {editingTask === task.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      value={editedTask?.id || ''}
                      onChange={(e) => setEditedTask(prev => prev ? { ...prev, id: e.target.value } : null)}
                      className="w-32 px-3 py-2 border border-gray-300 rounded font-mono text-sm"
                      placeholder="TASK-001"
                    />
                    <input
                      type="number"
                      value={editedTask?.points || 0}
                      onChange={(e) => setEditedTask(prev => prev ? { ...prev, points: parseInt(e.target.value) } : null)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded"
                      min="1"
                      max="21"
                    />
                    <span className="text-sm text-gray-500">points</span>
                  </div>

                  <input
                    type="text"
                    value={editedTask?.title || ''}
                    onChange={(e) => setEditedTask(prev => prev ? { ...prev, title: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded font-semibold"
                    placeholder="Task title"
                  />

                  <textarea
                    value={editedTask?.description || ''}
                    onChange={(e) => setEditedTask(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    placeholder="Task description"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-mono rounded">
                          {task.id}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {task.points} pts
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                      <p className="mt-2 text-sm text-gray-600">{task.description}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => startEdit(task)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit task"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete task"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {task.subtasks.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Subtasks:</h4>
                      <ul className="space-y-1">
                        {task.subtasks.map((subtask, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start">
                            <span className="mr-2">•</span>
                            <span>{subtask}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {task.successCriteria.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Success Criteria:</h4>
                      <ul className="space-y-1">
                        {task.successCriteria.map((criteria, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start">
                            <span className="mr-2">✓</span>
                            <span>{criteria}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {task.plan && (
                    <div className="mt-4">
                      <button
                        onClick={() => togglePlan(task.id)}
                        className="flex items-center gap-2 w-full text-left text-sm font-semibold text-gray-700 hover:text-gray-900"
                      >
                        <svg
                          className={`w-4 h-4 transition-transform ${expandedPlans[task.id] ? 'rotate-90' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span>Implementation Plan</span>
                        <span className="ml-auto text-xs text-gray-500 font-normal">
                          {expandedPlans[task.id] ? 'Hide' : 'Show'}
                        </span>
                      </button>

                      {expandedPlans[task.id] && (
                        <div className="mt-3 p-4 bg-indigo-50 border border-indigo-200 rounded-lg space-y-3">
                          {task.plan.approach && (
                            <div>
                              <p className="text-xs font-semibold text-indigo-900 mb-1">Approach:</p>
                              <p className="text-sm text-indigo-800">{task.plan.approach}</p>
                            </div>
                          )}

                          {task.plan.steps.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-indigo-900 mb-1">Steps:</p>
                              <ol className="space-y-1">
                                {task.plan.steps.map((step, idx) => (
                                  <li key={idx} className="text-sm text-indigo-800 flex items-start">
                                    <span className="mr-2 font-semibold">{idx + 1}.</span>
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}

                          {task.plan.considerations.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-indigo-900 mb-1">Considerations:</p>
                              <ul className="space-y-1">
                                {task.plan.considerations.map((consideration, idx) => (
                                  <li key={idx} className="text-sm text-indigo-800 flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>{consideration}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {task.notes && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-800">{task.notes}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between pt-6">
        <button
          onClick={onPrev}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={data.tasks.length === 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          Continue to Configuration
        </button>
      </div>
    </div>
  )
}
