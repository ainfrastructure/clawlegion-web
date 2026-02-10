'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Suppresses toast notifications on public/landing pages
 * by hiding the toast container via a style tag.
 */
export function PathnameToastGate() {
  const pathname = usePathname()
  const isPublic = pathname === '/' || pathname === '/login'

  useEffect(() => {
    if (!isPublic) return

    const style = document.createElement('style')
    style.id = 'suppress-toasts'
    style.textContent = '[data-toast-container] { display: none !important; }'
    document.head.appendChild(style)

    return () => {
      style.remove()
    }
  }, [isPublic])

  return null
}
