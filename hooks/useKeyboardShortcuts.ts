'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useShortcutConfig } from './useShortcutConfig'
import type { ShortcutId } from './useShortcutConfig'

// Maps shortcut IDs → routes for go-sequences and meta combos
const SHORTCUT_ROUTES: Partial<Record<ShortcutId, string>> = {
  'go-dashboard': '/dashboard',
  'go-tasks': '/tasks',
  'go-agents': '/agents',
  'go-sessions': '/sessions',
  'go-board': '/tasks',
  'go-repositories': '/repositories',
  'go-home': '/',
  'settings': '/settings?tab=appearance',
}

// Maps shortcut IDs → callback names from ShortcutOptions
const SHORTCUT_ACTIONS: Partial<Record<ShortcutId, keyof ShortcutCallbacks>> = {
  'new-task': 'onNewTask',
  'quick-task': 'onQuickTask',
  'edit': 'onEdit',
  'chat': 'onChat',
}

type ShortcutCallbacks = {
  onNewTask?: () => void
  onQuickTask?: () => void
  onEdit?: () => void
  onChat?: () => void
}

export interface ShortcutOptions extends ShortcutCallbacks {
  enabled?: boolean
}

export function useKeyboardShortcuts(options: ShortcutOptions = {}) {
  const router = useRouter()
  const { enabled = true, onNewTask, onQuickTask, onEdit, onChat } = options
  const callbacks: ShortcutCallbacks = { onNewTask, onQuickTask, onEdit, onChat }

  const { getAllBindings, enabled: shortcutsEnabled, loaded } = useShortcutConfig()

  // Track if we're in a "go" sequence (pressed g)
  const goPressed = useRef(false)
  const goTimeout = useRef<NodeJS.Timeout | null>(null)

  const resetGoState = useCallback(() => {
    goPressed.current = false
    if (goTimeout.current) {
      clearTimeout(goTimeout.current)
      goTimeout.current = null
    }
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!shortcutsEnabled) return

    // Skip if user is typing in an input
    const target = e.target as HTMLElement
    const activeEl = document.activeElement as HTMLElement | null

    const isInputActive = (el: HTMLElement | null): boolean => {
      if (!el) return false
      return (
        el.tagName === 'INPUT' ||
        el.tagName === 'TEXTAREA' ||
        el.isContentEditable ||
        el.getAttribute('role') === 'textbox'
      )
    }

    if (isInputActive(target) || isInputActive(activeEl)) {
      return
    }

    if (e.altKey) return

    const key = e.key.toLowerCase()
    const bindings = getAllBindings()

    // Build lookup maps from current bindings
    const goSequences = new Map<string, ShortcutId>()
    const singleKeys = new Map<string, ShortcutId>()
    const metaCombos = new Map<string, ShortcutId>()

    for (const b of bindings) {
      if (b.isGoSequence) {
        goSequences.set(b.key, b.id)
      } else if (b.requiresMeta) {
        metaCombos.set(b.key, b.id)
      } else {
        singleKeys.set(b.key, b.id)
      }
    }

    // Handle Cmd/Ctrl combos (e.g. Cmd+K — let CommandPalette handle its own,
    // but we process other meta combos like Cmd+,)
    if (e.metaKey || e.ctrlKey) {
      // Cmd+N / Ctrl+N → new task (same as 'n' single key)
      if (key === 'n') {
        e.preventDefault()
        callbacks.onNewTask?.()
        return
      }

      const id = metaCombos.get(key)
      if (id) {
        // Let CommandPalette handle Cmd+K itself
        if (id === 'command-palette') return

        e.preventDefault()
        const route = SHORTCUT_ROUTES[id]
        if (route) router.push(route)
      }
      return
    }

    // Handle "go" navigation (g + letter)
    if (key === 'g' && !goPressed.current) {
      goPressed.current = true
      goTimeout.current = setTimeout(resetGoState, 1500)
      return
    }

    if (goPressed.current) {
      e.preventDefault()
      resetGoState()

      const id = goSequences.get(key)
      if (id) {
        const route = SHORTCUT_ROUTES[id]
        if (route) router.push(route)
      }
      return
    }

    // Single-key shortcuts
    const id = singleKeys.get(key)
    if (id) {
      // "show-help" and "focus-search" have special handling
      if (id === 'show-help') return // KeyboardShortcutsHelp handles '?' itself

      e.preventDefault()

      if (id === 'focus-search') {
        const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]')
        if (searchInput) searchInput.focus()
        return
      }

      const callbackName = SHORTCUT_ACTIONS[id]
      if (callbackName) {
        callbacks[callbackName]?.()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, resetGoState, onNewTask, onQuickTask, onEdit, onChat, getAllBindings, shortcutsEnabled])

  useEffect(() => {
    if (!enabled || !loaded) return

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      resetGoState()
    }
  }, [enabled, loaded, handleKeyDown, resetGoState])

  return {
    goPressed: goPressed.current,
  }
}

export default useKeyboardShortcuts
