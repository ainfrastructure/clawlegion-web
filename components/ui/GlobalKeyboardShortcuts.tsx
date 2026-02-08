'use client'

import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { NewTaskModal } from '@/components/tasks/NewTaskModal'

/**
 * Global keyboard shortcuts handler component.
 * This component provides app-wide keyboard navigation and actions.
 * 
 * Shortcuts:
 * - g + d: Go to Dashboard
 * - g + t: Go to Tasks
 * - g + a: Go to Agents
 * - g + s: Go to Sessions
 * - g + b: Go to Board
 * - g + r: Go to Repositories
 * - n: Open new task modal
 * - /: Focus search
 * - ?: Show keyboard shortcuts help (handled by KeyboardShortcutsHelp)
 */
export function GlobalKeyboardShortcuts() {
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)
  const router = useRouter()

  // Cmd+, → navigate to settings appearance tab
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ',' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        router.push('/settings?tab=appearance')
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [router])

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
        <NewTaskModal
          isOpen={showNewTaskModal}
          onClose={() => setShowNewTaskModal(false)}
          onTaskCreated={() => {
            setShowNewTaskModal(false)
            // Optionally trigger a refresh of task data
          }}
          repositories={[]}
        />
      )}
    </>
  )
}

export default GlobalKeyboardShortcuts
