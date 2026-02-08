'use client'

import { cn } from '@/lib/utils'

interface RadioOption {
  value: string
  label: string
  disabled?: boolean
}

interface RadioGroupProps {
  name: string
  options: RadioOption[]
  value?: string
  onChange?: (value: string) => void
  label?: string
  orientation?: 'horizontal' | 'vertical'
}

export function RadioGroup({ 
  name, 
  options, 
  value, 
  onChange, 
  label,
  orientation = 'vertical' 
}: RadioGroupProps) {
  return (
    <div>
      {label && (
        <p className="text-sm font-medium text-slate-300 mb-2">{label}</p>
      )}
      <div className={cn(
        'flex gap-3',
        orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
      )}>
        {options.map(option => (
          <label
            key={option.value}
            className={cn(
              'inline-flex items-center gap-2 cursor-pointer select-none',
              option.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className="relative">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                disabled={option.disabled}
                onChange={() => onChange?.(option.value)}
                className={cn(
                  'w-5 h-5 rounded-full appearance-none cursor-pointer',
                  'bg-slate-800 border-2 border-slate-600',
                  'checked:border-purple-500',
                  'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900'
                )}
              />
              <div className={cn(
                'absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-purple-500',
                'opacity-0 peer-checked:opacity-100',
                value === option.value ? 'opacity-100' : 'opacity-0'
              )} />
            </div>
            <span className="text-sm text-slate-300">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

export default RadioGroup
