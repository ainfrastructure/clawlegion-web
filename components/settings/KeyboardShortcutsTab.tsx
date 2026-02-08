'use client'

import { useState, useEffect, useCallback } from 'react'
import { Keyboard, RotateCcw } from 'lucide-react'
import { useShortcutConfig } from '@/hooks/useShortcutConfig'
import type { ShortcutId, ShortcutBinding } from '@/hooks/useShortcutConfig'

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-10 h-6 rounded-full transition-colors ${checked ? 'bg-blue-500' : 'bg-slate-700'}`}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full transition-transform mx-1 ${checked ? 'translate-x-4' : 'translate-x-0'}`}
      />
    </button>
  )
}

type RecordingState = {
  id: ShortcutId
  isGoSequence: boolean
  requiresMeta: boolean
  waitingForSecondKey: boolean // for go-sequences: pressed G, waiting for second key
}

function KeyBadge({
  binding,
  onStartRecording,
  isRecording,
  recordingState,
}: {
  binding: ShortcutBinding
  onStartRecording: (id: ShortcutId) => void
  isRecording: boolean
  recordingState: RecordingState | null
}) {
  if (isRecording && recordingState) {
    const label = recordingState.waitingForSecondKey
      ? 'G + ...'
      : recordingState.requiresMeta
        ? '⌘ + ...'
        : 'Press a key...'

    return (
      <kbd className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded text-xs font-mono text-blue-400 animate-pulse cursor-default min-w-[80px] text-center">
        {label}
      </kbd>
    )
  }

  return (
    <button
      onClick={() => onStartRecording(binding.id)}
      className="group relative"
      title="Click to change shortcut"
    >
      <kbd className={`px-3 py-1 bg-slate-800 border rounded text-xs font-mono cursor-pointer transition-colors hover:border-blue-500/50 hover:text-blue-400 min-w-[50px] text-center ${
        binding.isCustom
          ? 'text-blue-400 border-blue-500/30'
          : 'border-white/[0.06]'
      }`}>
        {binding.currentDisplay}
      </kbd>
    </button>
  )
}

export function KeyboardShortcutsTab() {
  const {
    getAllBindings,
    updateBinding,
    resetBinding,
    resetAll,
    enabled,
    setShortcutsEnabled,
    loaded,
  } = useShortcutConfig()

  const [recording, setRecording] = useState<RecordingState | null>(null)

  const startRecording = useCallback((id: ShortcutId) => {
    const bindings = getAllBindings()
    const binding = bindings.find(b => b.id === id)
    if (!binding) return

    setRecording({
      id,
      isGoSequence: binding.isGoSequence,
      requiresMeta: binding.requiresMeta,
      waitingForSecondKey: false,
    })
  }, [getAllBindings])

  const cancelRecording = useCallback(() => {
    setRecording(null)
  }, [])

  // Key recorder listener
  useEffect(() => {
    if (!recording) return

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()

      // Escape cancels recording
      if (e.key === 'Escape') {
        cancelRecording()
        return
      }

      const key = e.key.toLowerCase()

      // For go-sequences
      if (recording.isGoSequence) {
        if (!recording.waitingForSecondKey) {
          // First key should be 'g' — skip it and wait for second key
          if (key === 'g') {
            setRecording(prev => prev ? { ...prev, waitingForSecondKey: true } : null)
            return
          }
          // If they pressed a different key directly, treat it as the go-sequence target
          updateBinding(recording.id, {
            key,
            display: `G ${key.toUpperCase()}`,
          })
          setRecording(null)
          return
        }

        // Second key of go-sequence
        if (key !== 'g') {
          updateBinding(recording.id, {
            key,
            display: `G ${key.toUpperCase()}`,
          })
          setRecording(null)
        }
        return
      }

      // For meta combos
      if (recording.requiresMeta) {
        // Wait for a non-modifier key
        if (['meta', 'control', 'shift', 'alt'].includes(key)) return

        updateBinding(recording.id, {
          key,
          display: `⌘ ${key.toUpperCase()}`,
        })
        setRecording(null)
        return
      }

      // For single keys — ignore modifiers
      if (['meta', 'control', 'shift', 'alt'].includes(key)) return

      const display = e.key === '?' ? '?'
        : e.key === '/' ? '/'
        : key.toUpperCase()

      updateBinding(recording.id, { key: e.key === '?' ? '?' : key, display })
      setRecording(null)
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [recording, updateBinding, cancelRecording])

  // Click outside to cancel recording
  useEffect(() => {
    if (!recording) return

    const handleClick = () => cancelRecording()
    // Small delay so the click that started recording doesn't immediately cancel
    const timeout = setTimeout(() => {
      document.addEventListener('click', handleClick)
    }, 100)

    return () => {
      clearTimeout(timeout)
      document.removeEventListener('click', handleClick)
    }
  }, [recording, cancelRecording])

  if (!loaded) return null

  const bindings = getAllBindings()
  const categories = [...new Set(bindings.map(b => b.category))]
  const hasCustomBindings = bindings.some(b => b.isCustom)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
          <Keyboard className="text-green-400" /> Keyboard Shortcuts
        </h2>
        {hasCustomBindings && (
          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-white/[0.06] rounded-lg transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset All to Defaults
          </button>
        )}
      </div>

      {/* Master toggle */}
      <div className="glass-2 rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Keyboard className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-sm text-white">Enable keyboard shortcuts</span>
              <p className="text-xs text-slate-500">Global shortcuts for navigation and actions</p>
            </div>
          </div>
          <Toggle checked={enabled} onChange={setShortcutsEnabled} />
        </div>
      </div>

      {/* Shortcut list by category */}
      <div className={`transition-opacity ${enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        {categories.map(category => (
          <div key={category} className="glass-2 rounded-xl p-5 mb-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {category}
            </h3>
            <div className="space-y-1">
              {bindings
                .filter(b => b.category === category)
                .map((binding, i, arr) => (
                  <div key={binding.id}>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-slate-300">{binding.description}</span>
                      <div className="flex items-center gap-2">
                        <KeyBadge
                          binding={binding}
                          onStartRecording={startRecording}
                          isRecording={recording?.id === binding.id}
                          recordingState={recording?.id === binding.id ? recording : null}
                        />
                        {binding.isCustom && (
                          <button
                            onClick={() => resetBinding(binding.id)}
                            className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                            title="Reset to default"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="border-b border-white/[0.04]" />
                    )}
                  </div>
                ))
              }
            </div>
          </div>
        ))}
      </div>

      {/* Hint */}
      <p className="text-xs text-slate-500 text-center mt-2">
        Click any key badge to reassign. Press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-white/[0.06] rounded text-[10px] font-mono">Esc</kbd> to cancel.
      </p>
    </div>
  )
}
