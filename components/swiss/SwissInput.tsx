/**
 * SwissInput — Clean form input component
 *
 * Swiss Design principles:
 * - Simple, geometric borders
 * - Clear label hierarchy above input
 * - Focused accent border (single color)
 * - Error states with purposeful red
 * - No decorative elements
 */
'use client'

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef, ReactNode } from 'react'
import { clsx } from 'clsx'

export type SwissInputSize = 'sm' | 'md' | 'lg'

export interface SwissInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input label */
  label?: string
  /** Helper text below input */
  helperText?: string
  /** Error message (also sets error styling) */
  error?: string
  /** Left icon */
  icon?: ReactNode
  /** Right element (icon or button) */
  suffix?: ReactNode
  /** Size variant */
  inputSize?: SwissInputSize
  /** Full width */
  fullWidth?: boolean
}

const inputSizeStyles: Record<SwissInputSize, string> = {
  sm: 'h-8 px-swiss-3 text-swiss-sm',
  md: 'h-9 px-swiss-3 text-swiss-sm',
  lg: 'h-11 px-swiss-4 text-swiss-base',
}

export const SwissInput = forwardRef<HTMLInputElement, SwissInputProps>(
  function SwissInput(
    {
      label,
      helperText,
      error,
      icon,
      suffix,
      inputSize = 'md',
      fullWidth = true,
      className,
      id,
      ...props
    },
    ref
  ) {
    const inputId = id ?? `swiss-input-${label?.toLowerCase().replace(/\s+/g, '-') ?? 'field'}`
    const hasError = !!error

    return (
      <div className={clsx(fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="block swiss-label mb-swiss-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-swiss-3 top-1/2 -translate-y-1/2 text-[var(--swiss-text-muted)] [&>svg]:w-4 [&>svg]:h-4">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              // Base
              'w-full rounded-swiss-sm',
              'bg-[var(--swiss-surface)] border',
              'text-[var(--swiss-text-primary)] placeholder:text-[var(--swiss-text-muted)]',
              'transition-all duration-swiss ease-swiss',
              // Focus
              'focus:outline-none focus:ring-2 focus:ring-[var(--swiss-accent)] focus:border-[var(--swiss-accent)]',
              // Size
              inputSizeStyles[inputSize],
              // Icon padding
              icon && 'pl-10',
              suffix && 'pr-10',
              // Error or default border
              hasError
                ? 'border-swiss-error focus:ring-swiss-error focus:border-swiss-error'
                : 'border-[var(--swiss-border)]',
              // Disabled
              'disabled:opacity-40 disabled:cursor-not-allowed',
              className
            )}
            {...props}
          />
          {suffix && (
            <div className="absolute right-swiss-3 top-1/2 -translate-y-1/2 text-[var(--swiss-text-muted)] [&>svg]:w-4 [&>svg]:h-4">
              {suffix}
            </div>
          )}
        </div>
        {(helperText || error) && (
          <p
            className={clsx(
              'mt-swiss-1 text-swiss-xs',
              hasError ? 'text-swiss-error' : 'text-[var(--swiss-text-muted)]'
            )}
          >
            {error ?? helperText}
          </p>
        )}
      </div>
    )
  }
)

/**
 * SwissTextarea — Multiline text input
 */
export interface SwissTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string
  helperText?: string
  error?: string
  inputSize?: SwissInputSize
  fullWidth?: boolean
}

export const SwissTextarea = forwardRef<HTMLTextAreaElement, SwissTextareaProps>(
  function SwissTextarea(
    {
      label,
      helperText,
      error,
      inputSize = 'md',
      fullWidth = true,
      className,
      id,
      ...props
    },
    ref
  ) {
    const inputId = id ?? `swiss-textarea-${label?.toLowerCase().replace(/\s+/g, '-') ?? 'field'}`
    const hasError = !!error

    return (
      <div className={clsx(fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={inputId} className="block swiss-label mb-swiss-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full rounded-swiss-sm resize-y min-h-[80px]',
            'bg-[var(--swiss-surface)] border',
            'text-[var(--swiss-text-primary)] placeholder:text-[var(--swiss-text-muted)]',
            'transition-all duration-swiss ease-swiss',
            'focus:outline-none focus:ring-2 focus:ring-[var(--swiss-accent)] focus:border-[var(--swiss-accent)]',
            inputSize === 'sm' ? 'px-swiss-3 py-swiss-2 text-swiss-sm' :
              inputSize === 'lg' ? 'px-swiss-4 py-swiss-3 text-swiss-base' :
              'px-swiss-3 py-swiss-2 text-swiss-sm',
            hasError
              ? 'border-swiss-error focus:ring-swiss-error focus:border-swiss-error'
              : 'border-[var(--swiss-border)]',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />
        {(helperText || error) && (
          <p
            className={clsx(
              'mt-swiss-1 text-swiss-xs',
              hasError ? 'text-swiss-error' : 'text-[var(--swiss-text-muted)]'
            )}
          >
            {error ?? helperText}
          </p>
        )}
      </div>
    )
  }
)
