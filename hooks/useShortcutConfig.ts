'use client'

import { useState, useEffect, useCallback } from 'react'

// ── Types ──────────────────────────────────────────────────────────

export type ShortcutCategory = 'Navigation' | 'Actions' | 'General'

export type ShortcutId =
  | 'go-dashboard'
  | 'go-tasks'
  | 'go-agents'
  | 'go-sessions'
  | 'go-board'
  | 'go-repositories'
  | 'go-home'
  | 'command-palette'
  | 'new-task'
  | 'quick-task'
  | 'edit'
  | 'chat'
  | 'show-help'
  | 'focus-search'
  | 'settings'

export type ShortcutDefinition = {
  id: ShortcutId
  description: string
  category: ShortcutCategory
  defaultKey: string       // the raw key value (e.g. 'k', 'd', 'n')
  display: string          // human-friendly display (e.g. '⌘ K', 'G D')
  isGoSequence: boolean    // true for "g + X" combos
  requiresMeta: boolean    // true for Cmd/Ctrl combos
}

export type ShortcutBinding = ShortcutDefinition & {
  key: string              // current active key (default or overridden)
  currentDisplay: string   // display string reflecting current key
  isCustom: boolean        // true if user has overridden this binding
}

export type ShortcutOverride = {
  key: string
  display: string
}

type ShortcutOverrides = Partial<Record<ShortcutId, ShortcutOverride>>

// ── Defaults ───────────────────────────────────────────────────────

export const DEFAULT_SHORTCUTS: ShortcutDefinition[] = [
  // Navigation
  { id: 'command-palette', description: 'Open command palette / search', category: 'Navigation', defaultKey: 'k', display: '⌘ K', isGoSequence: false, requiresMeta: true },
  { id: 'go-dashboard',   description: 'Go to Dashboard',              category: 'Navigation', defaultKey: 'd', display: 'G D', isGoSequence: true,  requiresMeta: false },
  { id: 'go-tasks',       description: 'Go to Tasks',                  category: 'Navigation', defaultKey: 't', display: 'G T', isGoSequence: true,  requiresMeta: false },
  { id: 'go-agents',      description: 'Go to Agents',                 category: 'Navigation', defaultKey: 'a', display: 'G A', isGoSequence: true,  requiresMeta: false },
  { id: 'go-sessions',    description: 'Go to Sessions',               category: 'Navigation', defaultKey: 's', display: 'G S', isGoSequence: true,  requiresMeta: false },
  { id: 'go-board',       description: 'Go to Board (Kanban)',         category: 'Navigation', defaultKey: 'b', display: 'G B', isGoSequence: true,  requiresMeta: false },
  { id: 'go-repositories', description: 'Go to Repositories',          category: 'Navigation', defaultKey: 'r', display: 'G R', isGoSequence: true,  requiresMeta: false },
  { id: 'go-home',        description: 'Go to Home',                   category: 'Navigation', defaultKey: 'h', display: 'G H', isGoSequence: true,  requiresMeta: false },

  // Actions
  { id: 'new-task',     description: 'Create new task',          category: 'Actions', defaultKey: 'n', display: 'N', isGoSequence: false, requiresMeta: false },
  { id: 'quick-task',   description: 'Create quick task (inline)', category: 'Actions', defaultKey: 't', display: 'T', isGoSequence: false, requiresMeta: false },
  { id: 'edit',         description: 'Edit selected item',       category: 'Actions', defaultKey: 'e', display: 'E', isGoSequence: false, requiresMeta: false },
  { id: 'chat',         description: 'Open chat panel',          category: 'Actions', defaultKey: 'c', display: 'C', isGoSequence: false, requiresMeta: false },
  { id: 'show-help',    description: 'Show keyboard shortcuts',  category: 'Actions', defaultKey: '?', display: '?', isGoSequence: false, requiresMeta: false },
  { id: 'settings',     description: 'Open settings',            category: 'Actions', defaultKey: ',', display: '⌘ ,', isGoSequence: false, requiresMeta: true },

  // General
  { id: 'focus-search', description: 'Focus search',             category: 'General', defaultKey: '/', display: '/', isGoSequence: false, requiresMeta: false },
]

// ── Storage ────────────────────────────────────────────────────────

const STORAGE_KEY = 'keyboard-shortcuts'
const ENABLED_KEY = 'keyboard-shortcuts-enabled'

function loadOverrides(): ShortcutOverrides {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveOverrides(overrides: ShortcutOverrides) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
}

function loadEnabled(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const raw = localStorage.getItem(ENABLED_KEY)
    return raw === null ? true : JSON.parse(raw)
  } catch {
    return true
  }
}

function saveEnabled(enabled: boolean) {
  localStorage.setItem(ENABLED_KEY, JSON.stringify(enabled))
}

// ── Display helpers ────────────────────────────────────────────────

function buildDisplay(def: ShortcutDefinition, key: string): string {
  if (def.requiresMeta) return `⌘ ${key.toUpperCase()}`
  if (def.isGoSequence) return `G ${key.toUpperCase()}`
  return key === '?' ? '?' : key === '/' ? '/' : key.toUpperCase()
}

// ── Hook ───────────────────────────────────────────────────────────

export function useShortcutConfig() {
  const [overrides, setOverrides] = useState<ShortcutOverrides>({})
  const [enabled, setEnabled] = useState(true)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setOverrides(loadOverrides())
    setEnabled(loadEnabled())
    setLoaded(true)
  }, [])

  const getAllBindings = useCallback((): ShortcutBinding[] => {
    return DEFAULT_SHORTCUTS.map((def) => {
      const override = overrides[def.id]
      const key = override?.key ?? def.defaultKey
      const currentDisplay = override?.display ?? buildDisplay(def, key)
      return {
        ...def,
        key,
        currentDisplay,
        isCustom: !!override,
      }
    })
  }, [overrides])

  const getBinding = useCallback((id: ShortcutId): ShortcutBinding => {
    const def = DEFAULT_SHORTCUTS.find((d) => d.id === id)!
    const override = overrides[id]
    const key = override?.key ?? def.defaultKey
    const currentDisplay = override?.display ?? buildDisplay(def, key)
    return { ...def, key, currentDisplay, isCustom: !!override }
  }, [overrides])

  const updateBinding = useCallback((id: ShortcutId, override: ShortcutOverride) => {
    setOverrides((prev) => {
      const next = { ...prev, [id]: override }
      saveOverrides(next)
      return next
    })
  }, [])

  const resetBinding = useCallback((id: ShortcutId) => {
    setOverrides((prev) => {
      const next = { ...prev }
      delete next[id]
      saveOverrides(next)
      return next
    })
  }, [])

  const resetAll = useCallback(() => {
    setOverrides({})
    saveOverrides({})
  }, [])

  const setShortcutsEnabled = useCallback((value: boolean) => {
    setEnabled(value)
    saveEnabled(value)
  }, [])

  return {
    getAllBindings,
    getBinding,
    updateBinding,
    resetBinding,
    resetAll,
    overrides,
    loaded,
    enabled,
    setShortcutsEnabled,
  }
}
