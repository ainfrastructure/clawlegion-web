'use client'

import { cn } from '@/lib/utils'
import { LabelHTMLAttributes, forwardRef } from 'react'

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'block text-sm font-medium text-slate-300',
          className
        )}
        {...props}
      >
        {children}
        {required && (
          <span className="text-red-400 ml-1">*</span>
        )}
      </label>
    )
  }
)

Label.displayName = 'Label'

export default Label
