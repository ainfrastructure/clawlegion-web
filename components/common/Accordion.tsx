'use client'

import { useState, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface AccordionItem {
  id: string
  title: string
  content: ReactNode
}

interface AccordionProps {
  items: AccordionItem[]
  allowMultiple?: boolean
  defaultOpen?: string[]
}

export function Accordion({ items, allowMultiple = false, defaultOpen = [] }: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen)
  
  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenItems(prev => 
        prev.includes(id) 
          ? prev.filter(i => i !== id) 
          : [...prev, id]
      )
    } else {
      setOpenItems(prev => prev.includes(id) ? [] : [id])
    }
  }
  
  return (
    <div className="border border-white/[0.06] rounded-lg divide-y divide-white/[0.06]">
      {items.map(item => {
        const isOpen = openItems.includes(item.id)
        return (
          <div key={item.id}>
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-800/50 transition-colors"
            >
              <span className="font-medium text-white">{item.title}</span>
              <ChevronDown className={cn(
                'w-5 h-5 text-slate-400 transition-transform',
                isOpen && 'rotate-180'
              )} />
            </button>
            {isOpen && (
              <div className="px-4 py-3 bg-slate-800/30 text-sm text-slate-300">
                {item.content}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default Accordion
