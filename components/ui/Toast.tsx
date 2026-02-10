'use client'

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Volume2, VolumeX } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastAction {
  label: string
  onClick: () => void
}

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: ToastAction
  sound?: boolean
}

interface ToastOptions {
  message?: string
  duration?: number
  action?: ToastAction
  sound?: boolean
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  // Backward compatible: accepts (title) or (title, message) or (title, options)
  success: (title: string, messageOrOptions?: string | ToastOptions) => string
  error: (title: string, messageOrOptions?: string | ToastOptions) => string
  info: (title: string, messageOrOptions?: string | ToastOptions) => string
  warning: (title: string, messageOrOptions?: string | ToastOptions) => string
  soundEnabled: boolean
  toggleSound: () => void
  // Specialized toast types for common actions
  taskAssigned: (taskTitle: string, assignee?: string, onView?: () => void) => string
  taskCompleted: (taskTitle: string, onUndo?: () => void) => string
  mention: (from: string, context?: string, onView?: () => void) => string
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

function playNotificationSound(type: ToastType) {
  // Create a simple beep using Web Audio API
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Different frequencies for different types
    const frequencies: Record<ToastType, number> = {
      success: 880,   // A5 - pleasant high
      error: 220,     // A3 - low warning
      info: 440,      // A4 - neutral
      warning: 330,   // E4 - attention
    }
    
    oscillator.frequency.value = frequencies[type]
    oscillator.type = type === 'error' ? 'square' : 'sine'
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  } catch (e) {
    // Audio not supported, silently fail
    console.debug('Toast sound not available:', e)
  }
}

// Helper to parse the second argument which can be string or options object
function parseMessageOrOptions(arg?: string | ToastOptions): ToastOptions {
  if (!arg) return {}
  if (typeof arg === 'string') return { message: arg }
  return arg
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  
  // Load sound preference from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('toast-sound-enabled')
    if (stored !== null) {
      setSoundEnabled(stored === 'true')
    }
  }, [])

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const newValue = !prev
      localStorage.setItem('toast-sound-enabled', String(newValue))
      return newValue
    })
  }, [])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).slice(2)
    
    setToasts(prev => {
      // Limit to 5 toasts max, remove oldest if needed
      const newToasts = prev.length >= 5 ? prev.slice(1) : prev
      return [...newToasts, { ...toast, id }]
    })
    
    // Play sound if enabled and toast wants sound
    if (soundEnabled && toast.sound !== false) {
      playNotificationSound(toast.type)
    }
    
    // Auto-remove after duration (default 5000ms)
    const duration = toast.duration ?? 5000
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    }
    
    return id
  }, [soundEnabled])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const success = useCallback((title: string, messageOrOptions?: string | ToastOptions) => {
    const options = parseMessageOrOptions(messageOrOptions)
    return addToast({ type: 'success', title, ...options })
  }, [addToast])

  const error = useCallback((title: string, messageOrOptions?: string | ToastOptions) => {
    const options = parseMessageOrOptions(messageOrOptions)
    return addToast({ type: 'error', title, duration: 8000, ...options }) // Errors stay longer
  }, [addToast])

  const info = useCallback((title: string, messageOrOptions?: string | ToastOptions) => {
    const options = parseMessageOrOptions(messageOrOptions)
    return addToast({ type: 'info', title, ...options })
  }, [addToast])

  const warning = useCallback((title: string, messageOrOptions?: string | ToastOptions) => {
    const options = parseMessageOrOptions(messageOrOptions)
    return addToast({ type: 'warning', title, duration: 6000, ...options })
  }, [addToast])

  // Specialized toast for task assignment
  const taskAssigned = useCallback((taskTitle: string, assignee?: string, onView?: () => void) => {
    return addToast({
      type: 'info',
      title: 'Task Assigned',
      message: assignee ? '"' + taskTitle + '" assigned to ' + assignee : '"' + taskTitle + '" assigned to you',
      action: onView ? { label: 'View', onClick: onView } : undefined,
    })
  }, [addToast])

  // Specialized toast for task completion
  const taskCompleted = useCallback((taskTitle: string, onUndo?: () => void) => {
    return addToast({
      type: 'success',
      title: 'Task Completed',
      message: '"' + taskTitle + '" marked as done',
      action: onUndo ? { label: 'Undo', onClick: onUndo } : undefined,
    })
  }, [addToast])

  // Specialized toast for mentions
  const mention = useCallback((from: string, context?: string, onView?: () => void) => {
    return addToast({
      type: 'info',
      title: from + ' mentioned you',
      message: context,
      action: onView ? { label: 'View', onClick: onView } : undefined,
    })
  }, [addToast])

  return (
    <ToastContext.Provider value={{ 
      toasts, 
      addToast, 
      removeToast, 
      success, 
      error, 
      info, 
      warning,
      soundEnabled,
      toggleSound,
      taskAssigned,
      taskCompleted,
      mention,
    }}>
      {children}
      <ToastContainer 
        toasts={toasts} 
        removeToast={removeToast} 
        soundEnabled={soundEnabled}
        toggleSound={toggleSound}
      />
    </ToastContext.Provider>
  )
}

function ToastContainer({ 
  toasts, 
  removeToast,
  soundEnabled,
  toggleSound,
}: { 
  toasts: Toast[]
  removeToast: (id: string) => void
  soundEnabled: boolean
  toggleSound: () => void
}) {
  return (
    <div data-toast-container className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {/* Sound toggle button - always visible when there are toasts */}
      {toasts.length > 0 && (
        <button
          onClick={toggleSound}
          className="self-end p-1.5 rounded-md bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 
                     text-slate-400 hover:text-white hover:bg-slate-700/80 transition-colors pointer-events-auto"
          title={soundEnabled ? 'Mute notifications' : 'Enable notification sounds'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>
      )}
      
      {/* Toast stack */}
      {toasts.map((toast, index) => (
        <ToastItem 
          key={toast.id} 
          toast={toast} 
          onClose={() => removeToast(toast.id)}
          index={index}
        />
      ))}
    </div>
  )
}

function ToastItem({ 
  toast, 
  onClose,
  index,
}: { 
  toast: Toast
  onClose: () => void
  index: number
}) {
  const [isExiting, setIsExiting] = useState(false)

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(onClose, 150) // Wait for exit animation
  }

  const handleAction = () => {
    toast.action?.onClick()
    handleClose()
  }

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
  }

  const colors: Record<ToastType, string> = {
    success: 'border-green-500/30 bg-green-500/10',
    error: 'border-red-500/30 bg-red-500/10',
    info: 'border-blue-500/30 bg-blue-500/10',
    warning: 'border-yellow-500/30 bg-yellow-500/10'
  }

  const actionColors: Record<ToastType, string> = {
    success: 'text-green-400 hover:text-green-300 hover:bg-green-500/20',
    error: 'text-red-400 hover:text-red-300 hover:bg-red-500/20',
    info: 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/20',
    warning: 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20'
  }

  return (
    <div 
      className={
        'flex items-start gap-3 p-4 rounded-lg border ' + colors[toast.type] + 
        ' backdrop-blur-sm shadow-lg pointer-events-auto ' +
        (isExiting ? 'animate-slide-out' : 'animate-slide-in')
      }
      style={{ animationDelay: (index * 50) + 'ms' }}
      role="alert"
      aria-live="polite"
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white text-sm">{toast.title}</p>
        {toast.message && (
          <p className="text-sm text-slate-300 mt-0.5 line-clamp-2">{toast.message}</p>
        )}
        {toast.action && (
          <button
            onClick={handleAction}
            className={'mt-2 text-sm font-medium px-2 py-1 rounded transition-colors ' + actionColors[toast.type]}
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button 
        onClick={handleClose} 
        className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export type { Toast, ToastAction, ToastType, ToastOptions }
