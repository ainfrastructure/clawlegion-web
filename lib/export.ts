/**
 * @fileoverview Export utilities for converting data to CSV and JSON formats
 * @module lib/export
 * 
 * This module provides utilities for exporting data from the dashboard:
 * - CSV export with proper escaping and column selection
 * - JSON export with pretty printing
 * - Automatic file download triggering
 * - Nested object flattening for CSV compatibility
 * 
 * @example
 * // Basic CSV export
 * import { exportData } from '@/lib/export'
 * exportData(tasks, 'tasks', 'csv')
 * 
 * @example
 * // Export with specific columns
 * exportData(tasks, 'tasks', 'csv', ['id', 'title', 'status'])
 * 
 * @example
 * // Flatten nested objects before export
 * import { flattenForExport, exportData } from '@/lib/export'
 * const flatData = flattenForExport(agents, ['stats', 'recentActivity'])
 * exportData(flatData, 'agents', 'csv')
 */

/** Supported export formats */
export type ExportFormat = 'csv' | 'json'

/**
 * Convert an array of objects to CSV string
 * 
 * Handles proper CSV escaping including:
 * - Values containing commas are quoted
 * - Values containing quotes have quotes doubled
 * - Values containing newlines are quoted
 * - Null/undefined values become empty strings
 * - Objects are JSON stringified
 * 
 * @template T - Type of objects in the array (must be Record<string, unknown>)
 * @param data - Array of objects to convert
 * @param columns - Optional array of column names to include (defaults to all keys from first object)
 * @returns CSV formatted string with header row and data rows
 * 
 * @example
 * const csv = toCSV([
 *   { name: 'Alice', age: 30 },
 *   { name: 'Bob', age: 25 }
 * ])
 * // Returns: "name,age\nAlice,30\nBob,25"
 * 
 * @example
 * // With specific columns
 * const csv = toCSV(data, ['name'])
 * // Returns only the 'name' column
 */
export function toCSV<T extends Record<string, unknown>>(data: T[], columns?: string[]): string {
  if (data.length === 0) return ''
  
  // Get columns from first object if not provided
  const cols = columns ?? Object.keys(data[0])
  
  // Header row
  const header = cols.join(',')
  
  // Data rows
  const rows = data.map(item => {
    return cols.map(col => {
      const value = item[col]
      if (value === null || value === undefined) return ''
      if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return String(value)
    }).join(',')
  })
  
  return [header, ...rows].join('\n')
}

/**
 * Download content as a file in the browser
 * 
 * Creates a temporary blob URL and triggers a download via a hidden anchor element.
 * Automatically cleans up the blob URL after download.
 * 
 * @param content - String content to download
 * @param filename - Name for the downloaded file
 * @param mimeType - MIME type of the content (e.g., 'text/csv', 'application/json')
 * 
 * @example
 * downloadFile('{"key": "value"}', 'data.json', 'application/json')
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export data to the specified format and trigger download
 * 
 * Automatically appends current date to filename (YYYY-MM-DD format).
 * 
 * @template T - Type of objects in the array
 * @param data - Array of objects to export
 * @param filename - Base filename (without extension or date)
 * @param format - Export format: 'csv' or 'json'
 * @param columns - Optional array of columns (for CSV only)
 * 
 * @example
 * // Export as JSON
 * exportData(tasks, 'tasks', 'json')
 * // Downloads: tasks_2026-01-31.json
 * 
 * @example
 * // Export as CSV with specific columns
 * exportData(tasks, 'tasks', 'csv', ['id', 'title', 'status'])
 * // Downloads: tasks_2026-01-31.csv
 */
export function exportData<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  format: ExportFormat,
  columns?: string[]
): void {
  const timestamp = new Date().toISOString().split('T')[0]
  const fullFilename = `${filename}_${timestamp}.${format}`
  
  if (format === 'json') {
    const content = JSON.stringify(data, null, 2)
    downloadFile(content, fullFilename, 'application/json')
  } else {
    const content = toCSV(data, columns)
    downloadFile(content, fullFilename, 'text/csv')
  }
}

/**
 * Flatten nested objects for CSV export
 * 
 * CSV format doesn't support nested structures, so this function:
 * - Flattens nested objects: `{stats: {count: 5}}` → `{stats_count: 5}`
 * - Converts arrays to semicolon-separated strings: `{tags: ['a','b']}` → `{tags: 'a; b'}`
 * 
 * @template T - Type of objects in the array
 * @param data - Array of objects to flatten
 * @param nestedKeys - Array of keys that contain nested objects/arrays to flatten
 * @returns Array of flattened objects
 * 
 * @example
 * const data = [{ name: 'Agent', stats: { completed: 5, failed: 1 } }]
 * const flat = flattenForExport(data, ['stats'])
 * // Returns: [{ name: 'Agent', stats_completed: 5, stats_failed: 1 }]
 * 
 * @example
 * // Flatten arrays
 * const data = [{ name: 'Task', tags: ['urgent', 'bug'] }]
 * const flat = flattenForExport(data, ['tags'])
 * // Returns: [{ name: 'Task', tags: 'urgent; bug' }]
 */
export function flattenForExport<T extends Record<string, unknown>>(
  data: T[],
  nestedKeys: string[] = []
): Record<string, unknown>[] {
  return data.map(item => {
    const flat: Record<string, unknown> = { ...item }
    
    nestedKeys.forEach(key => {
      const nested = item[key]
      if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
        Object.entries(nested as Record<string, unknown>).forEach(([k, v]) => {
          flat[`${key}_${k}`] = v
        })
        delete flat[key]
      } else if (Array.isArray(nested)) {
        flat[key] = nested.join('; ')
      }
    })
    
    return flat
  })
}
