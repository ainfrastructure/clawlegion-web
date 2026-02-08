'use client'

import { cn } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'
import NextLink from 'next/link'
import { AnchorHTMLAttributes, forwardRef } from 'react'

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  external?: boolean
  showExternalIcon?: boolean
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, external, showExternalIcon = true, className, children, ...props }, ref) => {
    const isExternal = external ?? href.startsWith('http')
    
    const linkClasses = cn(
      'inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors underline-offset-4 hover:underline',
      className
    )
    
    if (isExternal) {
      return (
        <a
          ref={ref}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClasses}
          {...props}
        >
          {children}
          {showExternalIcon && (
            <ExternalLink className="w-3 h-3" />
          )}
        </a>
      )
    }
    
    return (
      <NextLink
        ref={ref}
        href={href}
        className={linkClasses}
        {...props}
      >
        {children}
      </NextLink>
    )
  }
)

Link.displayName = 'Link'

export default Link
