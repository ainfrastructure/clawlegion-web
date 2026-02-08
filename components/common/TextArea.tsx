'use client'

import { cn } from '@/lib/utils'
import { TextareaHTMLAttributes, forwardRef, useState } from 'react'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  maxLength?: number
  showCount?: boolean
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, maxLength, showCount = false, id, onChange, ...props }, ref) => {
    const [charCount, setCharCount] = useState(0)
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')
    
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length)
      onChange?.(e)
    }
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={textareaId}
            className="block text-sm font-medium text-slate-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          maxLength={maxLength}
          onChange={handleChange}
          className={cn(
            'w-full px-3 py-2 rounded-lg min-h-[100px] resize-y',
            'bg-slate-800 border border-slate-600',
            'text-white placeholder-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        <div className="flex justify-between mt-1">
          {error && <p className="text-xs text-red-400">{error}</p>}
          {showCount && maxLength && (
            <p className={cn(
              'text-xs ml-auto',
              charCount >= maxLength ? 'text-red-400' : 'text-slate-400'
            )}>
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'

export default TextArea
