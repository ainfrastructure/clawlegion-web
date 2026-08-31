/**
 * Swiss Design System — Component Library
 *
 * 11 components following Swiss/International Typographic Style:
 * - Mathematical 4px/8px grid
 * - AAA-accessible contrast ratios
 * - Flush-left alignment
 * - Hierarchy through weight and color
 * - White space as active design element
 *
 * Usage:
 *   import { SwissCard, SwissButton, SwissStatusDot } from '@/components/swiss'
 *
 * Design tokens in:
 *   - tailwind.config.ts (colors, spacing, typography)
 *   - app/globals.css (CSS custom properties)
 *
 * Mode hooks:
 *   import { useUIMode } from '@/hooks/useUIMode'
 *   import { useModeComponent } from '@/hooks/useModeComponent'
 */

// ─── Container Components ───
export { SwissCard } from './SwissCard'
export type { SwissCardProps, SwissCardAccent } from './SwissCard'

export { SwissSection } from './SwissSection'
export type { SwissSectionProps } from './SwissSection'

export { SwissModal } from './SwissModal'
export type { SwissModalProps } from './SwissModal'

// ─── Data Display ───
export { SwissMetricCard } from './SwissMetricCard'
export type { SwissMetricCardProps, SwissMetricTrend } from './SwissMetricCard'

export { SwissTaskCard } from './SwissTaskCard'
export type { SwissTaskCardProps, SwissTaskPriority, SwissTaskStatus } from './SwissTaskCard'

export { SwissAgentCard } from './SwissAgentCard'
export type { SwissAgentCardProps, SwissAgentStatus } from './SwissAgentCard'

export { SwissTimeline } from './SwissTimeline'
export type { SwissTimelineProps, SwissTimelineEntry, SwissTimelineGroup } from './SwissTimeline'

export { SwissStatusDot } from './SwissStatusDot'
export type { SwissStatusDotProps, SwissStatusDotColor } from './SwissStatusDot'

export { SwissEmptyState } from './SwissEmptyState'
export type { SwissEmptyStateProps } from './SwissEmptyState'

// ─── Navigation ───
export { SwissTabBar } from './SwissTabBar'
export type { SwissTabBarProps, SwissTab } from './SwissTabBar'

// ─── Interactive ───
export { SwissButton } from './SwissButton'
export type { SwissButtonProps, SwissButtonVariant } from './SwissButton'
