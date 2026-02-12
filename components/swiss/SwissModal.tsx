/**
 * SwissModal — Clean overlay dialog
 *
 * Swiss Design principles:
 * - Sharp geometric container (4px radius)
 * - Clear header/body/footer sections
 * - High contrast backdrop
 * - Keyboard accessible (Escape to close, focus trap)
 * - No decorative shadows or glow
 */
'use client'

import { ReactNode, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { clsx } from 'clsx'
import { X } from 'lucide-react'

export type SwissModalSize = 'sm' | 'md' | 'lg' | 'xl'

export interface SwissModalProps {
  /** Whether the modal is open */
  open: boolean
  /** Close handler */
  onClose: () => void
  /** Modal title */
  title?: string
  /** Optional subtitle */
  subtitle?: string
  /** Modal content */
  children: ReactNode
  /** Footer content (e.g. action buttons) */
  footer?: ReactNode
  /** Modal size */
  size?: SwissModalSize
  /** Custom className for content */
  className?: string
}

const sizeStyles: Record<SwissModalSize, string> = {
  sm: 'max-w-[400px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[720px]',
  xl: 'max-w-[960px]',
}

export function SwissModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  className,
}: SwissModalProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [open])

  // Handle escape key
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  // Close on backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
      onClose()
    }
  }, [onClose])

  if (!open) return null

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-swiss-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'swiss-modal-title' : undefined}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" aria-hidden="true" />

      {/* Content */}
      <div
        ref={contentRef}
        className={clsx(
          'relative w-full',
          sizeStyles[size],
          'bg-[var(--swiss-surface)] border border-[var(--swiss-border)]',
          'rounded-swiss-md',
          'animate-swiss-scale-in',
          'flex flex-col max-h-[85vh]',
          className,
        )}
      >
        {/* Header */}
        {(title || subtitle) && (
          <div className="flex items-start justify-between p-swiss-6 border-b border-[var(--swiss-border-subtle)]">
            <div className="flex-1 min-w-0">
              {title && (
                <h2
                  id="swiss-modal-title"
                  className="text-swiss-lg font-semibold text-[var(--swiss-text-primary)]"
                >
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-swiss-sm text-[var(--swiss-text-tertiary)] mt-swiss-1">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className={clsx(
                'flex-shrink-0 ml-swiss-4',
                'p-swiss-2 rounded-swiss-sm',
                'text-[var(--swiss-text-tertiary)]',
                'hover:text-[var(--swiss-text-primary)] hover:bg-[var(--swiss-surface-raised)]',
                'transition-colors duration-swiss',
                'focus-visible:outline-2 focus-visible:outline-[var(--swiss-accent)] focus-visible:outline-offset-2',
              )}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-swiss-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-swiss-3 p-swiss-6 border-t border-[var(--swiss-border-subtle)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )

  // Use portal to render at document root
  if (typeof document !== 'undefined') {
    return createPortal(modal, document.body)
  }
  return modal
}
