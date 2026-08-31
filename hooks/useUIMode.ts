/**
 * useUIMode — Wrapper hook around useSidebar().uiMode
 *
 * Provides cleaner imports for Easy/Power mode detection.
 *
 * Usage:
 *   const { isEasy, isPower, mode, toggle } = useUIMode()
 */

import { useSidebar } from '@/components/layout/SidebarContext'
import { useMemo } from 'react'

export interface UseUIModeReturn {
  /** Current mode: 'easy' | 'power' */
  mode: 'easy' | 'power'
  /** True when in Easy (Swiss) mode */
  isEasy: boolean
  /** True when in Power mode */
  isPower: boolean
  /** Toggle between Easy and Power mode */
  toggle: () => void
  /** Set mode explicitly */
  setMode: (mode: 'easy' | 'power') => void
}

export function useUIMode(): UseUIModeReturn {
  const { uiMode, toggleUIMode, setUIMode } = useSidebar()

  return useMemo(
    () => ({
      mode: uiMode,
      isEasy: uiMode === 'easy',
      isPower: uiMode === 'power',
      toggle: toggleUIMode,
      setMode: setUIMode,
    }),
    [uiMode, toggleUIMode, setUIMode]
  )
}
