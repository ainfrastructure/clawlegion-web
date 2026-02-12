'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Save, Loader2, Check, AlertCircle, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSoul, useUpdateSoul } from '@/hooks/useAgentConfig'

interface SoulEditorModalProps {
  agentId: string
  agentName: string
  onClose: () => void
}

export function SoulEditorModal({ agentId, agentName, onClose }: SoulEditorModalProps) {
  const { data: soulData, isLoading } = useSoul(agentId)
  const updateSoul = useUpdateSoul()

  const [content, setContent] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Initialize content from fetched data
  useEffect(() => {
    if (soulData?.content) {
      setContent(soulData.content)
      setHasChanges(false)
    }
  }, [soulData])

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    setHasChanges(newContent !== soulData?.content)
    setSaveStatus('idle')
  }

  const handleSave = useCallback(async () => {
    if (!hasChanges) return

    setSaveStatus('saving')
    try {
      await updateSoul.mutateAsync({
        agentId,
        content,
      })
      setSaveStatus('saved')
      setHasChanges(false)
      
      // Auto-close after save or reset status
      setTimeout(() => {
        setSaveStatus('idle')
      }, 2000)
    } catch (error) {
      console.error('Failed to save SOUL.md:', error)
      setSaveStatus('error')
    }
  }, [hasChanges, agentId, content, updateSoul])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (hasChanges) {
          handleSave()
        }
      }
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasChanges, onClose, handleSave])

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-10 bg-slate-900 rounded-xl border border-white/[0.06] z-50 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-slate-800/50">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-purple-400" />
            <div>
              <h2 className="font-semibold text-white">Edit SOUL.md</h2>
              <p className="text-xs text-slate-400">{agentName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Save status indicator */}
            {saveStatus === 'saving' && (
              <span className="text-sm text-slate-400 flex items-center gap-1">
                <Loader2 size={14} className="animate-spin" /> Saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-sm text-green-400 flex items-center gap-1">
                <Check size={14} /> Saved!
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle size={14} /> Error
              </span>
            )}

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={!hasChanges || saveStatus === 'saving'}
              className={cn(
                "px-4 py-1.5 rounded-lg flex items-center gap-2 transition-colors text-sm",
                hasChanges 
                  ? "bg-red-600 hover:bg-red-700 text-white" 
                  : "bg-slate-700 text-slate-500 cursor-not-allowed"
              )}
            >
              <Save size={14} />
              Save
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full h-full bg-slate-950 text-slate-100 font-mono text-sm p-4 resize-none focus:outline-none"
              placeholder="# SOUL.md - Who You Are..."
              spellCheck={false}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-white/[0.06] bg-slate-800/50 flex items-center justify-between text-xs text-slate-500">
          <div>
            {soulData?.path && (
              <span className="font-mono">{soulData.path}</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span>⌘S to save</span>
            <span>ESC to close</span>
            {soulData?.lastModified && (
              <span>
                Last saved: {new Date(soulData.lastModified).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
