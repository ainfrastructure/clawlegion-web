/**
 * SwissGrid — Mathematical grid layout component
 *
 * Swiss Design principles:
 * - Based on 8px modular grid
 * - Systematic column ratios
 * - Asymmetrical balance
 * - Responsive breakpoints that maintain proportion
 */
'use client'

import { ReactNode } from 'react'
import { clsx } from 'clsx'

export type SwissGridColumns = 1 | 2 | 3 | 4 | 6 | 12
export type SwissGridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface SwissGridProps {
  children: ReactNode
  /** Number of columns */
  columns?: SwissGridColumns
  /** Responsive columns: { sm?, md?, lg?, xl? } */
  responsive?: Partial<Record<'sm' | 'md' | 'lg' | 'xl', SwissGridColumns>>
  /** Grid gap */
  gap?: SwissGridGap
  /** Custom className */
  className?: string
}

const gapStyles: Record<SwissGridGap, string> = {
  none: 'gap-0',
  xs: 'gap-swiss-1',   // 4px
  sm: 'gap-swiss-2',   // 8px
  md: 'gap-swiss-4',   // 16px
  lg: 'gap-swiss-6',   // 24px
  xl: 'gap-swiss-8',   // 32px
}

const columnStyles: Record<SwissGridColumns, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
}

const responsiveColumnStyles: Record<string, Record<SwissGridColumns, string>> = {
  sm: {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
    6: 'sm:grid-cols-6',
    12: 'sm:grid-cols-12',
  },
  md: {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    6: 'md:grid-cols-6',
    12: 'md:grid-cols-12',
  },
  lg: {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    6: 'lg:grid-cols-6',
    12: 'lg:grid-cols-12',
  },
  xl: {
    1: 'xl:grid-cols-1',
    2: 'xl:grid-cols-2',
    3: 'xl:grid-cols-3',
    4: 'xl:grid-cols-4',
    6: 'xl:grid-cols-6',
    12: 'xl:grid-cols-12',
  },
}

export function SwissGrid({
  children,
  columns = 1,
  responsive,
  gap = 'md',
  className,
}: SwissGridProps) {
  const responsiveClasses = responsive
    ? Object.entries(responsive)
        .map(([bp, cols]) => responsiveColumnStyles[bp]?.[cols] ?? '')
        .filter(Boolean)
        .join(' ')
    : ''

  return (
    <div
      className={clsx(
        'grid',
        columnStyles[columns],
        responsiveClasses,
        gapStyles[gap],
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * SwissGridItem — Grid item with span control
 */
export interface SwissGridItemProps {
  children: ReactNode
  /** Column span */
  span?: 1 | 2 | 3 | 4 | 6 | 12
  /** Responsive spans */
  responsiveSpan?: Partial<Record<'sm' | 'md' | 'lg' | 'xl', 1 | 2 | 3 | 4 | 6 | 12>>
  /** Custom className */
  className?: string
}

const spanStyles: Record<number, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  6: 'col-span-6',
  12: 'col-span-12',
}

const responsiveSpanStyles: Record<string, Record<number, string>> = {
  sm: { 1: 'sm:col-span-1', 2: 'sm:col-span-2', 3: 'sm:col-span-3', 4: 'sm:col-span-4', 6: 'sm:col-span-6', 12: 'sm:col-span-12' },
  md: { 1: 'md:col-span-1', 2: 'md:col-span-2', 3: 'md:col-span-3', 4: 'md:col-span-4', 6: 'md:col-span-6', 12: 'md:col-span-12' },
  lg: { 1: 'lg:col-span-1', 2: 'lg:col-span-2', 3: 'lg:col-span-3', 4: 'lg:col-span-4', 6: 'lg:col-span-6', 12: 'lg:col-span-12' },
  xl: { 1: 'xl:col-span-1', 2: 'xl:col-span-2', 3: 'xl:col-span-3', 4: 'xl:col-span-4', 6: 'xl:col-span-6', 12: 'xl:col-span-12' },
}

export function SwissGridItem({
  children,
  span = 1,
  responsiveSpan,
  className,
}: SwissGridItemProps) {
  const responsiveClasses = responsiveSpan
    ? Object.entries(responsiveSpan)
        .map(([bp, s]) => responsiveSpanStyles[bp]?.[s] ?? '')
        .filter(Boolean)
        .join(' ')
    : ''

  return (
    <div className={clsx(spanStyles[span], responsiveClasses, className)}>
      {children}
    </div>
  )
}
