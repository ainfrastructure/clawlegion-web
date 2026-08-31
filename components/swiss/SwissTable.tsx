/**
 * SwissTable — Clean data table component
 *
 * Swiss Design principles:
 * - Objective data presentation
 * - Clear column alignment (left text, right numbers)
 * - Subtle row separation (single-pixel borders)
 * - Tabular numerics for data columns
 * - No zebra striping — use borders for separation
 */
'use client'

import { ReactNode } from 'react'
import { clsx } from 'clsx'

export interface SwissTableColumn<T> {
  /** Column key */
  key: string
  /** Header label */
  label: string
  /** Column width (CSS value) */
  width?: string
  /** Alignment */
  align?: 'left' | 'center' | 'right'
  /** Use monospace/tabular numerics */
  mono?: boolean
  /** Custom render function */
  render?: (item: T, index: number) => ReactNode
  /** Sortable */
  sortable?: boolean
}

export interface SwissTableProps<T> {
  /** Column definitions */
  columns: SwissTableColumn<T>[]
  /** Data rows */
  data: T[]
  /** Row key extractor */
  getRowKey: (item: T, index: number) => string
  /** Row click handler */
  onRowClick?: (item: T, index: number) => void
  /** Size variant */
  size?: 'sm' | 'md'
  /** Empty state content */
  emptyContent?: ReactNode
  /** Loading state */
  loading?: boolean
  /** Custom className */
  className?: string
}

export function SwissTable<T>({
  columns,
  data,
  getRowKey,
  onRowClick,
  size = 'md',
  emptyContent,
  loading = false,
  className,
}: SwissTableProps<T>) {
  const cellPadding = size === 'sm' ? 'px-swiss-3 py-swiss-2' : 'px-swiss-4 py-swiss-3'

  return (
    <div
      className={clsx(
        'bg-[var(--swiss-surface)] border border-[var(--swiss-border)] rounded-swiss-md overflow-hidden',
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--swiss-border)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={clsx(
                    cellPadding,
                    'swiss-label text-left font-medium whitespace-nowrap',
                    'bg-[var(--swiss-surface-raised)]',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right'
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Loading skeleton rows
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="border-b border-[var(--swiss-border-subtle)]">
                  {columns.map((col) => (
                    <td key={col.key} className={cellPadding}>
                      <div className="h-4 bg-[var(--swiss-surface-raised)] rounded-swiss-sm animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={clsx(cellPadding, 'text-center')}>
                  {emptyContent ?? (
                    <p className="py-swiss-8 text-swiss-sm text-[var(--swiss-text-muted)]">
                      No data
                    </p>
                  )}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={getRowKey(item, index)}
                  onClick={onRowClick ? () => onRowClick(item, index) : undefined}
                  className={clsx(
                    'border-b border-[var(--swiss-border-subtle)] last:border-b-0',
                    'transition-colors duration-swiss',
                    onRowClick && 'cursor-pointer hover:bg-[var(--swiss-surface-raised)]'
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={clsx(
                        cellPadding,
                        'text-swiss-sm text-[var(--swiss-text-secondary)]',
                        col.mono && 'swiss-mono',
                        col.align === 'center' && 'text-center',
                        col.align === 'right' && 'text-right'
                      )}
                    >
                      {col.render
                        ? col.render(item, index)
                        : String((item as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
