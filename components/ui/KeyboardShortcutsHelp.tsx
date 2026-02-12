'use client'

import { useState, useEffect } from 'react'
import { X, Keyboard, Command } from 'lucide-react'
import { useShortcutConfig } from '@/hooks/useShortcutConfig'

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false)
  const { getAllBindings, enabled } = useShortcutConfig()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!enabled) return
      if (e.key === '?' && !e.metaKey && !e.ctrlKey &&
          !(e.target instanceof HTMLInputElement) &&
          !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, enabled])

  if (!isOpen) return null

  const bindings = getAllBindings()
  const categories = [...new Set(bindings.map(b => b.category))]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/[0.06] rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-slate-400" />
            <h2 className="font-semibold">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {categories.map(category => (
            <div key={category} className="mb-4 last:mb-0">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {category}
              </h3>
              <div className="space-y-1">
                {bindings
                  .filter(b => b.category === category)
                  .map(binding => (
                    <div
                      key={binding.id}
                      className="flex items-center justify-between py-1.5"
                    >
                      <span className="text-sm text-slate-300">{binding.description}</span>
                      <kbd className={`px-2 py-1 bg-slate-800 border border-white/[0.06] rounded text-xs font-mono ${binding.isCustom ? 'text-red-400 border-red-500/30' : ''}`}>
                        {binding.currentDisplay}
                      </kbd>
                    </div>
                  ))
                }
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/[0.06] text-center">
          <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
            <Command className="w-3 h-3" /> = Cmd on Mac, Ctrl on Windows
          </p>
        </div>
      </div>
    </div>
  )
}

export default KeyboardShortcutsHelp
