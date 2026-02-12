/**
 * Utils Tests
 *
 * Tests for utility functions in lib/utils.ts
 *
 * Run with: npx vitest run __tests__/lib/utils.test.ts
 */

import { describe, it, expect } from 'vitest'
import { cn, formatDuration, formatDate, getStatusColor } from '@/lib/utils'

// ---------------------------------------------------------------------------
// cn (class name merger)
// ---------------------------------------------------------------------------
describe('cn', () => {
  it('merges basic class strings', () => {
    const result = cn('foo', 'bar')
    expect(result).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    const result = cn('base', true && 'included', false && 'excluded')
    expect(result).toBe('base included')
  })

  it('merges tailwind classes correctly', () => {
    const result = cn('p-4', 'p-2')
    expect(result).toBe('p-2')
  })

  it('handles array inputs', () => {
    const result = cn(['foo', 'bar'], 'baz')
    expect(result).toBe('foo bar baz')
  })

  it('handles object inputs', () => {
    const result = cn({ foo: true, bar: false, baz: true })
    expect(result).toBe('foo baz')
  })

  it('returns empty string for no inputs', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('handles null and undefined', () => {
    const result = cn('foo', null, undefined, 'bar')
    expect(result).toBe('foo bar')
  })

  it('handles conflicting tailwind utilities', () => {
    const result = cn('text-red-500', 'text-blue-500')
    expect(result).toBe('text-blue-500')
  })

  it('preserves non-conflicting utilities', () => {
    const result = cn('text-red-500', 'bg-blue-500', 'p-4')
    expect(result).toBe('text-red-500 bg-blue-500 p-4')
  })
})

// ---------------------------------------------------------------------------
// formatDuration
// ---------------------------------------------------------------------------
describe('formatDuration', () => {
  describe('seconds only', () => {
    it('formats 0 seconds', () => {
      expect(formatDuration(0)).toBe('0s')
    })

    it('formats single digit seconds', () => {
      expect(formatDuration(5)).toBe('5s')
    })

    it('formats 59 seconds', () => {
      expect(formatDuration(59)).toBe('59s')
    })
  })

  describe('minutes and seconds', () => {
    it('formats exactly 1 minute', () => {
      expect(formatDuration(60)).toBe('1m 0s')
    })

    it('formats minutes with seconds', () => {
      expect(formatDuration(90)).toBe('1m 30s')
    })

    it('formats multiple minutes', () => {
      expect(formatDuration(125)).toBe('2m 5s')
    })

    it('formats 59 minutes 59 seconds', () => {
      expect(formatDuration(3599)).toBe('59m 59s')
    })
  })

  describe('hours and minutes', () => {
    it('formats exactly 1 hour', () => {
      expect(formatDuration(3600)).toBe('1h 0m')
    })

    it('formats hours with minutes', () => {
      expect(formatDuration(3660)).toBe('1h 1m')
    })

    it('formats multiple hours', () => {
      expect(formatDuration(7200)).toBe('2h 0m')
    })

    it('formats hours with multiple minutes', () => {
      expect(formatDuration(7320)).toBe('2h 2m')
    })

    it('ignores remaining seconds when hours present', () => {
      expect(formatDuration(3661)).toBe('1h 1m')
    })

    it('formats large durations', () => {
      expect(formatDuration(86400)).toBe('24h 0m')
    })
  })
})

// ---------------------------------------------------------------------------
// formatDate
// ---------------------------------------------------------------------------
describe('formatDate', () => {
  it('formats Date object', () => {
    const date = new Date('2026-02-12T12:00:00Z')
    const result = formatDate(date)
    // Result depends on locale, but should be a non-empty string
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('formats ISO date string', () => {
    const result = formatDate('2026-02-12T12:00:00Z')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('formats date-only string', () => {
    const result = formatDate('2026-02-12')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('handles timestamp numbers as strings', () => {
    // Unix timestamp as string (not ideal but should work)
    const date = new Date(1770854400000) // 2026-02-12
    const result = formatDate(date)
    expect(typeof result).toBe('string')
  })
})

// ---------------------------------------------------------------------------
// getStatusColor
// ---------------------------------------------------------------------------
describe('getStatusColor', () => {
  describe('running status', () => {
    it('returns blue for RUNNING', () => {
      expect(getStatusColor('RUNNING')).toBe('bg-blue-500')
    })

    it('is case insensitive - running', () => {
      expect(getStatusColor('running')).toBe('bg-blue-500')
    })

    it('is case insensitive - Running', () => {
      expect(getStatusColor('Running')).toBe('bg-blue-500')
    })
  })

  describe('completed status', () => {
    it('returns green for COMPLETED', () => {
      expect(getStatusColor('COMPLETED')).toBe('bg-green-500')
    })

    it('is case insensitive', () => {
      expect(getStatusColor('completed')).toBe('bg-green-500')
    })
  })

  describe('failed status', () => {
    it('returns red for FAILED', () => {
      expect(getStatusColor('FAILED')).toBe('bg-red-500')
    })

    it('is case insensitive', () => {
      expect(getStatusColor('failed')).toBe('bg-red-500')
    })
  })

  describe('pending status', () => {
    it('returns yellow for PENDING', () => {
      expect(getStatusColor('PENDING')).toBe('bg-yellow-500')
    })

    it('is case insensitive', () => {
      expect(getStatusColor('pending')).toBe('bg-yellow-500')
    })
  })

  describe('stopped status', () => {
    it('returns gray for STOPPED', () => {
      expect(getStatusColor('STOPPED')).toBe('bg-gray-500')
    })

    it('is case insensitive', () => {
      expect(getStatusColor('stopped')).toBe('bg-gray-500')
    })
  })

  describe('paused status', () => {
    it('returns dark yellow for PAUSED', () => {
      expect(getStatusColor('PAUSED')).toBe('bg-yellow-600')
    })

    it('is case insensitive', () => {
      expect(getStatusColor('paused')).toBe('bg-yellow-600')
    })
  })

  describe('unknown status', () => {
    it('returns light gray for unknown status', () => {
      expect(getStatusColor('UNKNOWN')).toBe('bg-gray-400')
    })

    it('returns light gray for random string', () => {
      expect(getStatusColor('random')).toBe('bg-gray-400')
    })

    it('returns light gray for empty string', () => {
      expect(getStatusColor('')).toBe('bg-gray-400')
    })
  })
})
