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
      className={`w-11 h-6 rounded-full transition-all duration-200 ${checked ? 'bg-blue-500 shadow-lg shadow-blue-500/20' : 'bg-slate-700'}`}
    >
      <div
        className="bg-white rounded-full transition-transform shadow-sm"
        style={{ width: '18px', height: '18px', marginTop: '3px', marginLeft: checked ? '22px' : '3px' }}
      />
    </button>
  )
}

type RecordingState = {
  id: ShortcutId
  isGoSequence: boolean
  requiresMeta: boolean
  waitingForSecondKey: boolean
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
        ? '\u2318 + ...'
        : 'Press a key...'

    return (
      <kbd className="px-3 py-1.5 glass-2 border-2 border-blue-500/50 rounded-xl text-xs font-mono text-blue-400 animate-pulse cursor-default min-w-[80px] text-center shadow-lg shadow-blue-500/10">
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
      <kbd className={`px-3 py-1.5 glass-2 border rounded-xl text-xs font-mono cursor-pointer transition-all min-w-[50px] text-center hover:shadow-md ${
        binding.isCustom
          ? 'text-blue-400 border-blue-500/30 hover:border-blue-500/50 hover:shadow-blue-500/10'
          : 'text-slate-300 border-white/[0.08] hover:border-white/[0.15] hover:shadow-white/[0.03]'
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

      if (e.key === 'Escape') {
        cancelRecording()
        return
      }

      const key = e.key.toLowerCase()

      if (recording.isGoSequence) {
        if (!recording.waitingForSecondKey) {
          if (key === 'g') {
            setRecording(prev => prev ? { ...prev, waitingForSecondKey: true } : null)
            return
          }
          updateBinding(recording.id, {
            key,
            display: `G ${key.toUpperCase()}`,
          })
          setRecording(null)
          return
        }

        if (key !== 'g') {
          updateBinding(recording.id, {
            key,
            display: `G ${key.toUpperCase()}`,
          })
          setRecording(null)
        }
        return
      }

      if (recording.requiresMeta) {
        if (['meta', 'control', 'shift', 'alt'].includes(key)) return

        updateBinding(recording.id, {
          key,
          display: `\u2318 ${key.toUpperCase()}`,
        })
        setRecording(null)
        return
      }

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
      {/* Actions */}
      {hasCustomBindings && (
        <div className="flex justify-end mb-5">
          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs text-slate-400 hover:text-white glass-2 hover:bg-white/[0.06] rounded-xl transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset All to Defaults
          </button>
        </div>
      )}

      {/* Master toggle */}
      <div className="glass-2 rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-white/[0.04]">
              <Keyboard className="w-4 h-4 text-slate-400" />
            </div>
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
        {categories.map(category => {
          const categoryBindings = bindings.filter(b => b.category === category)
          return (
            <div key={category} className="glass-2 rounded-2xl p-5 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {category}
                </h3>
                <span className="px-1.5 py-0.5 text-[10px] font-medium text-slate-500 bg-white/[0.04] rounded-md border border-white/[0.06]">
                  {categoryBindings.length}
                </span>
              </div>
              <div className="space-y-0.5">
                {categoryBindings.map((binding, i, arr) => (
                    <div key={binding.id}>
                      <div className="flex items-center justify-between py-2.5">
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
          )
        })}
      </div>

      {/* Hint */}
      <p className="text-xs text-slate-500 text-center mt-2">
        Click any key badge to reassign. Press <kbd className="px-1.5 py-0.5 glass-2 border border-white/[0.08] rounded-lg text-[10px] font-mono">Esc</kbd> to cancel.
      </p>
    </div>
  )
}
