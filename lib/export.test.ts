/**
 * Unit tests for export utilities
 * Run with: npx ts-node --esm lib/export.test.ts
 */

import { toCSV, flattenForExport } from './export'

// Simple test runner
let passed = 0
let failed = 0

function test(name: string, fn: () => void) {
  try {
    fn()
    console.log(`✓ ${name}`)
    passed++
  } catch (error) {
    console.error(`✗ ${name}`)
    console.error(`  ${error}`)
    failed++
  }
}

function expect<T>(actual: T) {
  return {
    toBe(expected: T) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected} but got ${actual}`)
      }
    },
    toEqual(expected: T) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`)
      }
    },
    toContain(substring: string) {
      if (typeof actual !== 'string' || !actual.includes(substring)) {
        throw new Error(`Expected "${actual}" to contain "${substring}"`)
      }
    }
  }
}

// Tests for toCSV
console.log('\n--- toCSV Tests ---')

test('toCSV returns empty string for empty array', () => {
  const result = toCSV([])
  expect(result).toBe('')
})

test('toCSV creates header row from object keys', () => {
  const data = [{ name: 'Test', value: 123 }]
  const result = toCSV(data)
  expect(result).toContain('name,value')
})

test('toCSV handles simple values', () => {
  const data = [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 }
  ]
  const result = toCSV(data)
  expect(result).toContain('Alice,30')
  expect(result).toContain('Bob,25')
})

test('toCSV escapes values with commas', () => {
  const data = [{ name: 'Test, Inc', value: 100 }]
  const result = toCSV(data)
  expect(result).toContain('"Test, Inc"')
})

test('toCSV escapes values with quotes', () => {
  const data = [{ name: 'Say "Hello"', value: 100 }]
  const result = toCSV(data)
  expect(result).toContain('"Say ""Hello"""')
})

test('toCSV handles null and undefined', () => {
  const data = [{ a: null, b: undefined, c: 'test' }]
  const result = toCSV(data)
  expect(result).toContain(',,test')
})

test('toCSV respects custom columns', () => {
  const data = [{ a: 1, b: 2, c: 3 }]
  const result = toCSV(data, ['c', 'a'])
  const lines = result.split('\n')
  expect(lines[0]).toBe('c,a')
  expect(lines[1]).toBe('3,1')
})

// Tests for flattenForExport
console.log('\n--- flattenForExport Tests ---')

test('flattenForExport flattens nested objects', () => {
  const data = [{ name: 'Test', stats: { count: 5, avg: 2.5 } }]
  const result = flattenForExport(data, ['stats'])
  expect(result[0]).toEqual({ name: 'Test', stats_count: 5, stats_avg: 2.5 })
})

test('flattenForExport converts arrays to semicolon-separated strings', () => {
  const data = [{ name: 'Test', tags: ['a', 'b', 'c'] }]
  const result = flattenForExport(data, ['tags'])
  expect(result[0].tags).toBe('a; b; c')
})

test('flattenForExport handles empty nested objects', () => {
  const data = [{ name: 'Test', stats: {} }]
  const result = flattenForExport(data, ['stats'])
  expect(result[0]).toEqual({ name: 'Test' })
})

test('flattenForExport preserves non-nested fields', () => {
  const data = [{ a: 1, b: 2, nested: { c: 3 } }]
  const result = flattenForExport(data, ['nested'])
  expect(result[0].a).toBe(1)
  expect(result[0].b).toBe(2)
})

// Summary
console.log('\n--- Summary ---')
console.log(`Passed: ${passed}`)
console.log(`Failed: ${failed}`)

if (failed > 0) {
  process.exit(1)
}
