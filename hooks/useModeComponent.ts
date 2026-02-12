/**
 * useModeComponent — Generic helper to select component based on UI mode
 *
 * Returns EasyComp when in Easy mode, PowerComp when in Power mode.
 *
 * Usage:
 *   const DashboardComponent = useModeComponent(EasyDashboard, PowerDashboard)
 *   return <DashboardComponent />
 */

import { useUIMode } from './useUIMode'
import { ComponentType, useMemo } from 'react'

/**
 * Select the right component based on current UI mode.
 *
 * @param EasyComponent - Component to use in Easy (Swiss) mode
 * @param PowerComponent - Component to use in Power mode
 * @returns The component matching the current mode
 */
export function useModeComponent<P = object>(
  EasyComponent: ComponentType<P>,
  PowerComponent: ComponentType<P>
): ComponentType<P> {
  const { isEasy } = useUIMode()

  return useMemo(
    () => (isEasy ? EasyComponent : PowerComponent),
    [isEasy, EasyComponent, PowerComponent]
  )
}
