'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSidebar } from '@/components/layout/SidebarContext'

/**
 * Hook to apply URL-based mode override (?mode=easy or ?mode=power).
 * Must be used inside a Suspense boundary (required by useSearchParams in Next.js 15).
 * Overrides the current mode without persisting to localStorage.
 */
export function useModeOverride() {
  const searchParams = useSearchParams()
  const { setUIModeOverride } = useSidebar()

  useEffect(() => {
    const modeParam = searchParams.get('mode')
    if (modeParam === 'easy' || modeParam === 'power') {
      setUIModeOverride(modeParam)
    }
  }, [searchParams, setUIModeOverride])
}
