'use client'

import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, id, ...props }, ref) => {
    const switchId = id || label?.toLowerCase().replace(/\s+/g, '-')
    
    return (
      <label 
        htmlFor={switchId}
        className="inline-flex items-center gap-3 cursor-pointer select-none"
      >
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            id={switchId}
            className="peer sr-only"
            {...props}
          />
          <div className={cn(
            'w-11 h-6 rounded-full transition-colors',
            'bg-slate-600 peer-checked:bg-purple-600',
            'peer-focus:ring-2 peer-focus:ring-purple-500 peer-focus:ring-offset-2 peer-focus:ring-offset-slate-900',
            'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
            className
          )} />
          <div className={cn(
            'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform',
            'peer-checked:translate-x-5'
          )} />
        </div>
        {label && (
          <span className="text-sm text-slate-300">{label}</span>
        )}
      </label>
    )
  }
)

Switch.displayName = 'Switch'

export default Switch
