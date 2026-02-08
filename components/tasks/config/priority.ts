/**
 * Shared priority configuration for task modals
 * Unified superset supporting both P0-P3 and text-based priorities
 */

export interface PriorityConfig {
  label: string
  color: string
  bg: string
}

/**
 * Priority configuration with dark-mode optimized colors
 * Supports: P0, P1, P2, P3, high, medium, low
 */
export const priorityConfig: Record<string, PriorityConfig> = {
  // Numeric priorities (P0-P3)
  P0: { label: 'Critical', color: 'text-red-400', bg: 'bg-red-500/20' },
  P1: { label: 'High', color: 'text-orange-400', bg: 'bg-orange-500/20' },
  P2: { label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  P3: { label: 'Low', color: 'text-slate-400', bg: 'bg-slate-500/20' },
  // Text-based priorities (for compatibility)
  high: { label: 'High', color: 'text-red-400', bg: 'bg-red-500/20' },
  medium: { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  low: { label: 'Low', color: 'text-blue-400', bg: 'bg-blue-500/20' },
}

/**
 * Get priority config with fallback to P2/medium
 */
export function getPriorityConfig(priority: string | undefined | null): PriorityConfig {
  if (!priority) return priorityConfig.P2
  return priorityConfig[priority] || priorityConfig.P2
}

/**
 * Priority options for dropdowns/selectors
 */
export const priorityOptions = [
  { value: 'P0', label: 'P0 - Critical (Urgent)' },
  { value: 'P1', label: 'P1 - High' },
  { value: 'P2', label: 'P2 - Medium' },
  { value: 'P3', label: 'P3 - Low' },
] as const

export type PriorityLevel = 'P0' | 'P1' | 'P2' | 'P3'
