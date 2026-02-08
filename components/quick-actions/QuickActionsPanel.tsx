'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Plus, Pause, Play, Square, Zap, 
  RefreshCw, AlertTriangle, CheckCircle,
  Send, X
} from 'lucide-react'

interface QuickAction {
  id: string
  label: string
  icon: typeof Plus
  color: string
  action: () => void | Promise<void>
  loading?: boolean
  disabled?: boolean
}

export function QuickActionsPanel() {
  const [showInjectModal, setShowInjectModal] = useState(false)
  const [injectTitle, setInjectTitle] = useState('')
  const [injectAgent, setInjectAgent] = useState('socialchefai')
  const queryClient = useQueryClient()

  const pauseAll = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/agents/emergency-stop', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Quick Actions - Pause All' })
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
    },
  })

  const refreshData = () => {
    queryClient.invalidateQueries()
  }

  const injectTask = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/agents/${injectAgent}/inject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: injectTitle,
          priority: 'high',
        }),
      })
      return res.json()
    },
    onSuccess: () => {
      setShowInjectModal(false)
      setInjectTitle('')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const actions: QuickAction[] = [
    {
      id: 'new-task',
      label: 'New Task',
      icon: Plus,
      color: 'bg-blue-600 hover:bg-blue-500',
      action: () => document.dispatchEvent(new CustomEvent('create-task')),
    },
    {
      id: 'inject-task',
      label: 'Inject Task',
      icon: Zap,
      color: 'bg-purple-600 hover:bg-purple-500',
      action: () => setShowInjectModal(true),
    },
    {
      id: 'refresh',
      label: 'Refresh',
      icon: RefreshCw,
      color: 'bg-slate-700 hover:bg-slate-600',
      action: refreshData,
    },
    {
      id: 'pause-all',
      label: 'Stop All',
      icon: Square,
      color: 'bg-red-600 hover:bg-red-500',
      action: () => pauseAll.mutate(),
      loading: pauseAll.isPending,
    },
  ]

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.id}
              onClick={action.action}
              disabled={action.disabled || action.loading}
              className={`px-3 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2 transition-colors ${action.color} disabled:opacity-50`}
            >
              <Icon className={`w-4 h-4 ${action.loading ? 'animate-spin' : ''}`} />
              {action.label}
            </button>
          )
        })}
      </div>

      {/* Inject Task Modal */}
      {showInjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-white/[0.06] shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                Quick Inject Task
              </h2>
              <button 
                onClick={() => setShowInjectModal(false)}
                className="p-1 hover:bg-slate-800 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Task Title</label>
                <input
                  type="text"
                  value={injectTitle}
                  onChange={(e) => setInjectTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-white/[0.06] rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="What needs to be done?"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Target Agent</label>
                <select
                  value={injectAgent}
                  onChange={(e) => setInjectAgent(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-white/[0.06] rounded-lg focus:border-purple-500"
                >
                  <option value="socialchefai">🍳 SocialChefAI</option>
                  <option value="souschef">🥄 SousChef</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInjectModal(false)}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => injectTask.mutate()}
                disabled={!injectTitle.trim() || injectTask.isPending}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {injectTask.isPending ? 'Injecting...' : 'Inject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function QuickActionsBar() {
  return (
    <div className="bg-slate-900/50 backdrop-blur border-b border-slate-800 px-6 py-3 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">Quick Actions</span>
        <QuickActionsPanel />
      </div>
    </div>
  )
}
