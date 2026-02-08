'use client'

import { useState } from 'react'
import { X, Plus, Loader2 } from 'lucide-react'
import api from '@/lib/api'

interface AddAgentModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

const AGENT_TYPES = [
  { value: 'worker', label: 'Worker' },
  { value: 'orchestrator', label: 'Orchestrator' },
  { value: 'tester', label: 'Tester' },
  { value: 'security', label: 'Security' },
  { value: 'devops', label: 'DevOps' },
]

const EMOJI_OPTIONS = ['🤖', '🧠', '🔧', '🛡️', '🧪', '🚀', '📊', '🎯', '⚡', '🔍', '🏗️', '💡']

const COLOR_OPTIONS = [
  { value: 'blue', label: 'Blue', className: 'bg-blue-500' },
  { value: 'purple', label: 'Purple', className: 'bg-purple-500' },
  { value: 'green', label: 'Green', className: 'bg-green-500' },
  { value: 'amber', label: 'Amber', className: 'bg-amber-500' },
  { value: 'cyan', label: 'Cyan', className: 'bg-cyan-500' },
  { value: 'pink', label: 'Pink', className: 'bg-pink-500' },
  { value: 'red', label: 'Red', className: 'bg-red-500' },
]

export function AddAgentModal({ open, onClose, onCreated }: AddAgentModalProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState('worker')
  const [emoji, setEmoji] = useState('🤖')
  const [description, setDescription] = useState('')
  const [healthEndpoint, setHealthEndpoint] = useState('')
  const [color, setColor] = useState('blue')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Name is required')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/agents', {
        name: name.trim(),
        type,
        emoji,
        description: description.trim() || undefined,
        healthEndpoint: healthEndpoint.trim() || undefined,
        color,
      })
      // Reset form
      setName('')
      setType('worker')
      setEmoji('🤖')
      setDescription('')
      setHealthEndpoint('')
      setColor('blue')
      onCreated()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create agent')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative glass-2 rounded-2xl w-full max-w-lg p-6 border border-white/[0.08] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Plus size={20} className="text-blue-400" /> Add Agent
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Scout, Builder-2"
              className="w-full px-3 py-2 bg-slate-800/80 border border-white/[0.08] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm"
              autoFocus
            />
          </div>

          {/* Type / Role */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Role *</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/80 border border-white/[0.08] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm"
            >
              {AGENT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Emoji Picker */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Avatar Emoji</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                    emoji === e
                      ? 'bg-blue-500/30 ring-2 ring-blue-400 scale-110'
                      : 'bg-slate-800/50 hover:bg-slate-700/50'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Theme Color</label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full ${c.className} transition-all ${
                    color === c.value
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What does this agent do?"
              rows={2}
              className="w-full px-3 py-2 bg-slate-800/80 border border-white/[0.08] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm resize-none"
            />
          </div>

          {/* Health Endpoint */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Health Endpoint</label>
            <input
              type="text"
              value={healthEndpoint}
              onChange={e => setHealthEndpoint(e.target.value)}
              placeholder="https://agent.example.com/health"
              className="w-full px-3 py-2 bg-slate-800/80 border border-white/[0.08] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <Plus size={16} /> Add Agent
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
