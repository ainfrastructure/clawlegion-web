'use client'

import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useState } from 'react'
import { TaskCreateModal } from '@/components/mode-aware'

/**
 * Global keyboard shortcuts handler component.
 * All shortcut bindings are now managed by useShortcutConfig and
 * dispatched through useKeyboardShortcuts dynamically.
 *
 * The new-task shortcut (N key / Cmd+N) now opens the mode-aware
 * TaskCreateModal which renders Easy or Power form based on user preference.
 */
export function GlobalKeyboardShortcuts() {
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)

  useKeyboardShortcuts({
    onNewTask: () => setShowNewTaskModal(true),
    onQuickTask: () => {
      // Focus the quick task input if it exists
      const quickTaskInput = document.querySelector<HTMLInputElement>('[data-quick-task]')
      if (quickTaskInput) {
        quickTaskInput.focus()
      }
    },
    onChat: () => {
      // Toggle chat panel visibility
      const chatToggle = document.querySelector<HTMLButtonElement>('[data-chat-toggle]')
      if (chatToggle) {
        chatToggle.click()
      }
    },
  })

  return (
    <>
      <TaskCreateModal
        isOpen={showNewTaskModal}
        onClose={() => setShowNewTaskModal(false)}
        onTaskCreated={() => setShowNewTaskModal(false)}
      />
    </>
  )
}

export default GlobalKeyboardShortcuts
