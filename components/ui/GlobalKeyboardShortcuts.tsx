'use client'

import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useState } from 'react'
import { EnhancedTaskModal } from '@/components/tasks/EnhancedTaskModal'

/**
 * Global keyboard shortcuts handler component.
 * All shortcut bindings are now managed by useShortcutConfig and
 * dispatched through useKeyboardShortcuts dynamically.
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
      {showNewTaskModal && (
        <EnhancedTaskModal
          isOpen={showNewTaskModal}
          onClose={() => setShowNewTaskModal(false)}
          onTaskCreated={() => {
            setShowNewTaskModal(false)
          }}
          repositories={[]}
        />
      )}
    </>
  )
}

export default GlobalKeyboardShortcuts
