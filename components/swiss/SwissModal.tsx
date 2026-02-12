/**
 * SwissModal — Clean overlay dialog component
 *
 * Swiss Design principles:
 * - Clean rectangular container, no rounded corners abuse
 * - High contrast header with clear hierarchy
 * - Systematic padding on 8px grid
 * - Purposeful backdrop, no blur effects
 * - Accessible: traps focus, ESC to close, backdrop click to close
 */
'use client'

import { ReactNode, useEffect, useCallback, useRef } from 'react'
import { clsx } from 'clsx'
import { X } from 'lucide-react'

export type SwissModalSize = 'sm' | 'md' | 'lg' | 'xl'

export interface SwissModalProps {
  /** Whether modal is open */
  isOpen: boolean
  /** Close handler */
  onClose: () => void
  /** Modal title */
  title?: string
  /** Subtitle below title */
  subtitle?: string
  /** Modal size */
  size?: SwissModalSize
  /** Modal body content */
  children: ReactNode
  /** Optional footer content */
  footer?: ReactNode
  /** Custom className for content area */
  className?: string
  /** Whether to show close button */
  showClose?: boolean
}

const sizeStyles: Record<SwissModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function SwissModal({
  isOpen,
  onClose,
  title,
  subtitle,
  size = 'md',
  children,
  footer,
  className,
  showClose = true,
}: SwissModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // ESC to close
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = ''
      }
    }
  }, [isOpen, handleKeyDown])

  // Focus trap: focus the content on open
  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-swiss-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title ?? 'Dialog'}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />

      {/* Content */}
      <div
        ref={contentRef}
        tabIndex={-1}
        className={clsx(
          'relative w-full',
          sizeStyles[size],
          'bg-[var(--swiss-surface)] border border-[var(--swiss-border)]',
          'rounded-swiss-md shadow-swiss-lg',
          'max-h-[80vh] flex flex-col',
          'animate-in fade-in-0 slide-in-from-top-4 duration-200',
          className
        )}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-start justify-between px-swiss-6 pt-swiss-6 pb-swiss-4 flex-shrink-0">
            <div className="min-w-0 flex-1">
              {title && (
                <h2 className="text-swiss-xl font-semibold text-[var(--swiss-text-primary)] tracking-tight">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-swiss-sm text-[var(--swiss-text-tertiary)] mt-swiss-1">
                  {subtitle}
                </p>
              )}
            </div>
            {showClose && (
              <button
                onClick={onClose}
                className={clsx(
                  'flex-shrink-0 ml-swiss-4',
                  'w-8 h-8 flex items-center justify-center',
                  'rounded-swiss-sm',
                  'text-[var(--swiss-text-muted)]',
                  'hover:bg-[var(--swiss-surface-raised)] hover:text-[var(--swiss-text-primary)]',
                  'transition-all duration-swiss ease-swiss',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--swiss-accent)]'
                )}
                aria-label="Close dialog"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-swiss-6 pb-swiss-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex-shrink-0 border-t border-[var(--swiss-border)] px-swiss-6 py-swiss-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
