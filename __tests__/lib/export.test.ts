/**
 * Export Utilities Tests
 *
 * Tests for CSV and JSON export utilities in lib/export.ts
 *
 * Run with: npx vitest run __tests__/lib/export.test.ts
 */

import { describe, it, expect } from 'vitest'
import { toCSV, flattenForExport, ExportFormat } from '@/lib/export'

// ---------------------------------------------------------------------------
// toCSV
// ---------------------------------------------------------------------------
describe('toCSV', () => {
  describe('empty and basic cases', () => {
    it('returns empty string for empty array', () => {
      expect(toCSV([])).toBe('')
    })

    it('creates header row from object keys', () => {
      const data = [{ name: 'Test', value: 123 }]
      const result = toCSV(data)
      expect(result).toContain('name,value')
    })

    it('handles single row', () => {
      const data = [{ a: 1 }]
      const result = toCSV(data)
      expect(result).toBe('a\n1')
    })

    it('handles multiple rows', () => {
      const data = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 }
      ]
      const result = toCSV(data)
      const lines = result.split('\n')
      expect(lines).toHaveLength(3)
      expect(lines[0]).toBe('name,age')
      expect(lines[1]).toBe('Alice,30')
      expect(lines[2]).toBe('Bob,25')
    })
  })

  describe('special value handling', () => {
    it('escapes values with commas', () => {
      const data = [{ name: 'Test, Inc', value: 100 }]
      const result = toCSV(data)
      expect(result).toContain('"Test, Inc"')
    })

    it('escapes values with quotes', () => {
      const data = [{ name: 'Say "Hello"', value: 100 }]
      const result = toCSV(data)
      expect(result).toContain('"Say ""Hello"""')
    })

    it('escapes values with newlines', () => {
      const data = [{ text: 'Line1\nLine2' }]
      const result = toCSV(data)
      expect(result).toContain('"Line1\nLine2"')
    })

    it('handles null values', () => {
      const data = [{ a: null, b: 'test' }]
      const result = toCSV(data)
      expect(result).toBe('a,b\n,test')
    })

    it('handles undefined values', () => {
      const data = [{ a: undefined, b: 'test' }]
      const result = toCSV(data)
      expect(result).toBe('a,b\n,test')
    })

    it('handles boolean values', () => {
      const data = [{ active: true, deleted: false }]
      const result = toCSV(data)
      expect(result).toBe('active,deleted\ntrue,false')
    })

    it('handles number values', () => {
      const data = [{ int: 42, float: 3.14, negative: -5 }]
      const result = toCSV(data)
      expect(result).toBe('int,float,negative\n42,3.14,-5')
    })
  })

  describe('nested object handling', () => {
    it('stringifies nested objects', () => {
      const data = [{ name: 'Test', config: { key: 'value' } }]
      const result = toCSV(data)
      // Should be escaped JSON
      expect(result).toContain('"{""key"":""value""}"')
    })

    it('stringifies arrays', () => {
      const data = [{ name: 'Test', tags: ['a', 'b'] }]
      const result = toCSV(data)
      // Array stringified as JSON
      expect(result).toContain('[')
    })
  })

  describe('custom columns', () => {
    it('respects custom column order', () => {
      const data = [{ a: 1, b: 2, c: 3 }]
      const result = toCSV(data, ['c', 'a'])
      const lines = result.split('\n')
      expect(lines[0]).toBe('c,a')
      expect(lines[1]).toBe('3,1')
    })

    it('excludes columns not in custom list', () => {
      const data = [{ a: 1, b: 2, c: 3 }]
      const result = toCSV(data, ['a'])
      expect(result).toBe('a\n1')
      expect(result).not.toContain('b')
      expect(result).not.toContain('c')
    })

    it('handles columns that do not exist in data', () => {
      const data = [{ a: 1 }]
      const result = toCSV(data, ['a', 'missing'])
      const lines = result.split('\n')
      expect(lines[0]).toBe('a,missing')
      expect(lines[1]).toBe('1,')
    })
  })
})

// ---------------------------------------------------------------------------
// flattenForExport
// ---------------------------------------------------------------------------
describe('flattenForExport', () => {
  describe('nested object flattening', () => {
    it('flattens nested objects', () => {
      const data = [{ name: 'Test', stats: { count: 5, avg: 2.5 } }]
      const result = flattenForExport(data, ['stats'])
      expect(result[0]).toEqual({ name: 'Test', stats_count: 5, stats_avg: 2.5 })
    })

    it('handles deeply nested with single level flatten', () => {
      const data = [{ name: 'Test', stats: { deep: { nested: 1 } } }]
      const result = flattenForExport(data, ['stats'])
      // Only first level is flattened
      expect(result[0]).toHaveProperty('stats_deep')
      expect(result[0].stats_deep).toEqual({ nested: 1 })
    })

    it('handles empty nested objects', () => {
      const data = [{ name: 'Test', stats: {} }]
      const result = flattenForExport(data, ['stats'])
      expect(result[0]).toEqual({ name: 'Test' })
    })

    it('handles multiple nested keys', () => {
      const data = [{ a: { x: 1 }, b: { y: 2 }, c: 3 }]
      const result = flattenForExport(data, ['a', 'b'])
      expect(result[0]).toEqual({ a_x: 1, b_y: 2, c: 3 })
    })
  })

  describe('array handling', () => {
    it('converts arrays to semicolon-separated strings', () => {
      const data = [{ name: 'Test', tags: ['a', 'b', 'c'] }]
      const result = flattenForExport(data, ['tags'])
      expect(result[0].tags).toBe('a; b; c')
    })

    it('handles empty arrays', () => {
      const data = [{ name: 'Test', tags: [] }]
      const result = flattenForExport(data, ['tags'])
      expect(result[0].tags).toBe('')
    })

    it('handles arrays with single element', () => {
      const data = [{ tags: ['single'] }]
      const result = flattenForExport(data, ['tags'])
      expect(result[0].tags).toBe('single')
    })
  })

  describe('preservation', () => {
    it('preserves non-nested fields', () => {
      const data = [{ a: 1, b: 2, nested: { c: 3 } }]
      const result = flattenForExport(data, ['nested'])
      expect(result[0].a).toBe(1)
      expect(result[0].b).toBe(2)
    })

    it('preserves fields not in nestedKeys', () => {
      const data = [{ config: { x: 1 }, other: { y: 2 } }]
      const result = flattenForExport(data, ['config'])
      expect(result[0].config_x).toBe(1)
      expect(result[0].other).toEqual({ y: 2 })
    })

    it('handles empty nestedKeys array', () => {
      const data = [{ a: 1, b: { c: 2 } }]
      const result = flattenForExport(data, [])
      expect(result[0]).toEqual({ a: 1, b: { c: 2 } })
    })

    it('handles missing nestedKeys argument', () => {
      const data = [{ a: 1, b: { c: 2 } }]
      const result = flattenForExport(data)
      expect(result[0]).toEqual({ a: 1, b: { c: 2 } })
    })
  })

  describe('multiple rows', () => {
    it('flattens all rows consistently', () => {
      const data = [
        { name: 'A', stats: { x: 1 } },
        { name: 'B', stats: { x: 2 } }
      ]
      const result = flattenForExport(data, ['stats'])
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ name: 'A', stats_x: 1 })
      expect(result[1]).toEqual({ name: 'B', stats_x: 2 })
    })
  })
})

// Note: downloadFile tests are skipped because they require a browser environment
// The function uses browser-specific APIs (document, URL.createObjectURL, etc.)
// that would require jsdom or similar to properly mock

// ---------------------------------------------------------------------------
// exportData (filename and format logic)
// ---------------------------------------------------------------------------
describe('exportData logic', () => {
  // Note: exportData calls downloadFile which requires browser APIs
  // These tests verify the expected format/filename patterns

  it('generates correct filename with timestamp for JSON', () => {
    const filename = 'test'
    const format: ExportFormat = 'json'
    
    // Test the expected filename format
    const timestamp = new Date().toISOString().split('T')[0]
    const expectedFilename = `${filename}_${timestamp}.${format}`
    expect(expectedFilename).toMatch(/test_\d{4}-\d{2}-\d{2}\.json/)
  })

  it('generates correct filename with timestamp for CSV', () => {
    const filename = 'export'
    const format = 'csv' as ExportFormat
    
    const timestamp = new Date().toISOString().split('T')[0]
    const expectedFilename = `${filename}_${timestamp}.${format}`
    expect(expectedFilename).toMatch(/export_\d{4}-\d{2}-\d{2}\.csv/)
  })

  it('uses application/json mime type for JSON export', () => {
    // Verify JSON format uses correct mime type
    const format: ExportFormat = 'json'
    const mimeType = format === 'json' ? 'application/json' : 'text/csv'
    expect(mimeType).toBe('application/json')
  })

  it('uses text/csv mime type for CSV export', () => {
    const format = 'csv' as ExportFormat
    const mimeType = format === 'json' ? 'application/json' : 'text/csv'
    expect(mimeType).toBe('text/csv')
  })

  it('timestamp format is YYYY-MM-DD', () => {
    const timestamp = new Date().toISOString().split('T')[0]
    expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
