'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Send } from 'lucide-react'

interface TaskToInject {
  title: string
  description: string
  priority: 'urgent' | 'high' | 'normal' | 'low'
}

interface InjectTaskModalProps {
  agentId: string
  agentName: string
  onClose: () => void
}

export function InjectTaskModal({ agentId, agentName, onClose }: InjectTaskModalProps) {
  const queryClient = useQueryClient()
  const [task, setTask] = useState<TaskToInject>({
    title: '',
    description: '',
    priority: 'high',
  })

  const injectTaskMutation = useMutation({
    mutationFn: async (payload: TaskToInject) => {
      const res = await fetch(`/api/agents/${agentId}/inject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      onClose()
    },
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-slate-900 rounded-lg p-6 w-full max-w-md border border-white/[0.06]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Inject Task</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <p className="text-slate-400 text-sm mb-4">
          Inject a task directly to: <strong className="text-white">{agentName}</strong>
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Title</label>
            <input
              type="text"
              value={task.title}
              onChange={(e) => setTask(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-800 border border-white/[0.06] rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white"
              placeholder="Task title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Description</label>
            <textarea
              value={task.description}
              onChange={(e) => setTask(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-800 border border-white/[0.06] rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-24 text-white"
              placeholder="Task description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Priority</label>
            <select
              value={task.priority}
              onChange={(e) => setTask(prev => ({ ...prev, priority: e.target.value as TaskToInject['priority'] }))}
              className="w-full px-3 py-2 bg-slate-800 border border-white/[0.06] rounded focus:border-blue-500 text-white"
            >
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => injectTaskMutation.mutate(task)}
            disabled={!task.title || injectTaskMutation.isPending}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            <Send size={16} />
            {injectTaskMutation.isPending ? 'Injecting...' : 'Inject'}
          </button>
        </div>
      </div>
    </div>
  )
}
