/**
 * useUIMode — Swiss Design System mode hook
 *
 * Provides Easy/Power mode detection and Swiss Design helpers.
 * Wraps the SidebarContext's uiMode with Swiss-specific utilities.
 *
 * Usage:
 *   const { isEasy, isPower, mode, toggle, swiss } = useUIMode()
 *
 *   // Conditional rendering
 *   if (isEasy) return <SwissCard>...</SwissCard>
 *
 *   // Swiss class helper
 *   <div className={swiss('swiss-surface', 'glass-2')}>
 */

import { useSidebar } from '@/components/layout/SidebarContext'
import { useCallback, useMemo } from 'react'

export type SwissVariant = 'default' | 'outlined' | 'filled' | 'ghost'
export type SwissSize = 'sm' | 'md' | 'lg'

export interface UseUIModeReturn {
  /** Current mode: 'easy' | 'power' */
  mode: 'easy' | 'power'
  /** True when in Easy (Swiss) mode */
  isEasy: boolean
  /** True when in Power (glass/cyberpunk) mode */
  isPower: boolean
  /** Toggle between Easy and Power mode */
  toggle: () => void
  /** Set mode explicitly */
  setMode: (mode: 'easy' | 'power') => void
  /**
   * Swiss class selector — returns easy mode class when in Easy mode,
   * power mode class when in Power mode.
   *
   * @param easyClass - Class(es) for Swiss/Easy mode
   * @param powerClass - Class(es) for Power mode (optional, returns empty string if not provided)
   */
  swiss: (easyClass: string, powerClass?: string) => string
  /**
   * Get Swiss spacing value based on grid multiplier.
   * 1 = 4px, 2 = 8px, 3 = 12px, 4 = 16px, etc.
   */
  gridSpacing: (multiplier: number) => string
}

export function useUIMode(): UseUIModeReturn {
  const { uiMode, toggleUIMode, setUIMode } = useSidebar()

  const isEasy = uiMode === 'easy'
  const isPower = uiMode === 'power'

  const swiss = useCallback(
    (easyClass: string, powerClass?: string): string => {
      if (isEasy) return easyClass
      return powerClass ?? ''
    },
    [isEasy]
  )

  const gridSpacing = useCallback(
    (multiplier: number): string => `${multiplier * 4}px`,
    []
  )

  return useMemo(
    () => ({
      mode: uiMode,
      isEasy,
      isPower,
      toggle: toggleUIMode,
      setMode: setUIMode,
      swiss,
      gridSpacing,
    }),
    [uiMode, isEasy, isPower, toggleUIMode, setUIMode, swiss, gridSpacing]
  )
}

/**
 * Swiss Design spacing constants based on 4px/8px grid.
 * Use these for consistent spacing in Swiss components.
 */
export const SWISS_SPACING = {
  /** 4px */
  xs: 'swiss-1',
  /** 8px */
  sm: 'swiss-2',
  /** 12px */
  md: 'swiss-3',
  /** 16px */
  lg: 'swiss-4',
  /** 24px */
  xl: 'swiss-6',
  /** 32px */
  '2xl': 'swiss-8',
  /** 48px */
  '3xl': 'swiss-12',
  /** 64px */
  '4xl': 'swiss-16',
} as const

/**
 * Swiss Design breakpoints for responsive grid.
 */
export const SWISS_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const
