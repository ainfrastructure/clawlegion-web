/**
 * Swiss Design System — Alpine Clarity
 *
 * A design system built on Swiss/International Typographic Style principles:
 * - Mathematical grid systems (4px/8px)
 * - Objective communication
 * - High contrast, limited color palette
 * - Asymmetrical typography
 * - White space as a design element
 * - Function over form
 *
 * Components:
 *   SwissCard         — Primary container
 *   SwissMetricCard   — Metric/stat display
 *   SwissTimeline     — Vertical timeline
 *   SwissButton       — Functional button
 *   SwissGrid         — Mathematical grid layout
 *   SwissGridItem     — Grid item with span control
 *   SwissHeader       — Page/section header
 *   SwissStatusBadge  — Status indicator
 *   SwissNav          — Tab/navigation
 *   SwissTable        — Data table
 *   SwissEmptyState   — Empty/zero state
 *   SwissSection      — Content section wrapper
 *   SwissInput        — Form text input
 *   SwissTextarea     — Form multiline input
 *
 * Usage:
 *   import { SwissCard, SwissButton, SwissGrid } from '@/components/swiss'
 *
 * Design tokens are defined in:
 *   - tailwind.config.ts (spacing, typography, colors)
 *   - app/globals.css (CSS custom properties)
 *
 * Mode hook:
 *   import { useUIMode } from '@/hooks/useUIMode'
 */

// ─── Container Components ───
export { SwissCard } from './SwissCard'
export type { SwissCardProps, SwissCardVariant, SwissCardSize } from './SwissCard'

export { SwissSection } from './SwissSection'
export type { SwissSectionProps } from './SwissSection'

// ─── Data Display ───
export { SwissMetricCard } from './SwissMetricCard'
export type { SwissMetricCardProps } from './SwissMetricCard'

export { SwissTable } from './SwissTable'
export type { SwissTableProps, SwissTableColumn } from './SwissTable'

export { SwissTimeline } from './SwissTimeline'
export type { SwissTimelineProps, SwissTimelineItem, SwissTimelineStatus } from './SwissTimeline'

export { SwissStatusBadge } from './SwissStatusBadge'
export type { SwissStatusBadgeProps, SwissStatusBadgeType, SwissStatusBadgeSize } from './SwissStatusBadge'

export { SwissEmptyState } from './SwissEmptyState'
export type { SwissEmptyStateProps } from './SwissEmptyState'

// ─── Navigation ───
export { SwissNav } from './SwissNav'
export type { SwissNavProps, SwissNavItem } from './SwissNav'

export { SwissHeader } from './SwissHeader'
export type { SwissHeaderProps, SwissHeaderSize } from './SwissHeader'

// ─── Layout ───
export { SwissGrid, SwissGridItem } from './SwissGrid'
export type { SwissGridProps, SwissGridColumns, SwissGridGap, SwissGridItemProps } from './SwissGrid'

// ─── Interactive ───
export { SwissButton } from './SwissButton'
export type { SwissButtonProps, SwissButtonVariant, SwissButtonSize } from './SwissButton'

// ─── Forms ───
export { SwissInput, SwissTextarea } from './SwissInput'
export type { SwissInputProps, SwissTextareaProps, SwissInputSize } from './SwissInput'
