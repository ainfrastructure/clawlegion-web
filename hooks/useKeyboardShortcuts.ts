'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface ShortcutOptions {
  enabled?: boolean
  onNewTask?: () => void
  onQuickTask?: () => void
  onEdit?: () => void
  onChat?: () => void
}

export function useKeyboardShortcuts(options: ShortcutOptions = {}) {
  const router = useRouter()
  const { enabled = true, onNewTask, onQuickTask, onEdit, onChat } = options
  
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
    // Skip if user is typing in an input - check both target and activeElement
    // for maximum reliability (some events may have unexpected targets)
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

    // Skip if modifier keys are pressed (except for Cmd+K)
    if (e.altKey) return

    const key = e.key.toLowerCase()

    // Handle Cmd/Ctrl + K for search/command palette
    if ((e.metaKey || e.ctrlKey) && key === 'k') {
      // Let CommandPalette handle this
      return
    }

    // Skip other shortcuts if Cmd/Ctrl is pressed
    if (e.metaKey || e.ctrlKey) return

    // Handle "go" navigation (g + letter)
    if (key === 'g' && !goPressed.current) {
      goPressed.current = true
      // Reset after 1.5 seconds if no follow-up
      goTimeout.current = setTimeout(resetGoState, 1500)
      return
    }

    if (goPressed.current) {
      e.preventDefault()
      resetGoState()
      
      switch (key) {
        case 'd':
          router.push('/dashboard')
          break
        case 't':
          router.push('/tasks')
          break
        case 'a':
          router.push('/agents')
          break
        case 's':
          router.push('/sessions')
          break
        case 'b':
          router.push('/tasks')
          break
        case 'r':
          router.push('/repositories')
          break
        case 'h':
          router.push('/')
          break
      }
      return
    }

    // Single-key shortcuts
    switch (key) {
      case 'n':
        e.preventDefault()
        onNewTask?.()
        break
      case 't':
        e.preventDefault()
        onQuickTask?.()
        break
      case 'e':
        e.preventDefault()
        onEdit?.()
        break
      case 'c':
        e.preventDefault()
        onChat?.()
        break
      case '/':
        e.preventDefault()
        // Focus search input if it exists
        const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]')
        if (searchInput) {
          searchInput.focus()
        }
        break
    }
  }, [router, resetGoState, onNewTask, onQuickTask, onEdit, onChat])

  useEffect(() => {
    if (!enabled) return

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      resetGoState()
    }
  }, [enabled, handleKeyDown, resetGoState])

  return {
    goPressed: goPressed.current,
  }
}

export default useKeyboardShortcuts
