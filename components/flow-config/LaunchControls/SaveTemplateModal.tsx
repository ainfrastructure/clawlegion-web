'use client'

import { X, Save, Loader2 } from 'lucide-react'
import { useState } from 'react'
import type { SaveTemplateModalProps } from '../types'

export function SaveTemplateModal({ isOpen, onClose, onSave }: SaveTemplateModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Template name is required')
      return
    }

    if (name.length < 3) {
      setError('Template name must be at least 3 characters')
      return
    }

    setIsSaving(true)
    try {
      await onSave(name.trim(), description.trim())
      // Reset form on success
      setName('')
      setDescription('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    if (!isSaving) {
      setName('')
      setDescription('')
      setError(null)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-slate-900 border border-white/[0.06] rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-lg font-semibold text-white">Save as Template</h2>
            <p className="text-sm text-slate-400">Save this configuration for future use</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Name Input */}
          <div className="space-y-2">
            <label htmlFor="template-name" className="block text-sm font-medium text-slate-300">
              Template Name <span className="text-red-400">*</span>
            </label>
            <input
              id="template-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My API Integration Flow"
              disabled={isSaving}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg
                text-slate-200 placeholder-slate-500
                focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed"
              autoFocus
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label htmlFor="template-description" className="block text-sm font-medium text-slate-300">
              Description <span className="text-slate-500">(optional)</span>
            </label>
            <textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this template best used for?"
              disabled={isSaving}
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg
                text-slate-200 placeholder-slate-500 resize-none
                focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Info */}
          <div className="p-3 glass-2 rounded-lg">
            <p className="text-xs text-slate-400">
              💡 <span className="text-slate-300">Tip:</span> Saved templates appear in the preset dropdown 
              under &quot;My Templates&quot; and can be selected for future sessions.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white 
                bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold
                bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg
                transition-colors shadow-lg shadow-emerald-500/20
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Template
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SaveTemplateModal
