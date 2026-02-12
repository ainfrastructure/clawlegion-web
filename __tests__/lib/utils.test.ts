/**
 * Utility Functions Tests
 *
 * Tests for cn, formatDuration, formatDate, getStatusColor
 *
 * Run with: npx vitest run __tests__/lib/utils.test.ts
 */

import { describe, it, expect } from 'vitest';
import { cn, formatDuration, getStatusColor } from '@/lib/utils';

// ---------------------------------------------------------------------------
// cn (class name merge)
// ---------------------------------------------------------------------------
describe('cn', () => {
  it('merges simple class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('resolves Tailwind conflicts (last wins)', () => {
    const result = cn('px-2', 'px-4');
    expect(result).toBe('px-4');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    const result = cn('base', isActive && 'active');
    expect(result).toContain('active');
  });

  it('filters out falsy values', () => {
    const result = cn('base', false, null, undefined, '', 'extra');
    expect(result).toBe('base extra');
  });

  it('returns empty string for no inputs', () => {
    expect(cn()).toBe('');
  });
});

// ---------------------------------------------------------------------------
// formatDuration
// ---------------------------------------------------------------------------
describe('formatDuration', () => {
  it('formats seconds only', () => {
    expect(formatDuration(45)).toBe('45s');
  });

  it('formats minutes and seconds', () => {
    expect(formatDuration(90)).toBe('1m 30s');
  });

  it('formats hours and minutes', () => {
    expect(formatDuration(3661)).toBe('1h 1m');
  });

  it('handles zero seconds', () => {
    expect(formatDuration(0)).toBe('0s');
  });

  it('handles exact minute boundary', () => {
    expect(formatDuration(60)).toBe('1m 0s');
  });

  it('handles exact hour boundary', () => {
    expect(formatDuration(3600)).toBe('1h 0m');
  });
});

// ---------------------------------------------------------------------------
// getStatusColor
// ---------------------------------------------------------------------------
describe('getStatusColor', () => {
  it('returns blue for RUNNING', () => {
    expect(getStatusColor('RUNNING')).toBe('bg-blue-500');
  });

  it('returns green for COMPLETED', () => {
    expect(getStatusColor('COMPLETED')).toBe('bg-green-500');
  });

  it('returns red for FAILED', () => {
    expect(getStatusColor('FAILED')).toBe('bg-red-500');
  });

  it('returns yellow for PENDING', () => {
    expect(getStatusColor('PENDING')).toBe('bg-yellow-500');
  });

  it('returns gray for STOPPED', () => {
    expect(getStatusColor('STOPPED')).toBe('bg-gray-500');
  });

  it('returns yellow-600 for PAUSED', () => {
    expect(getStatusColor('PAUSED')).toBe('bg-yellow-600');
  });

  it('handles lowercase input', () => {
    expect(getStatusColor('running')).toBe('bg-blue-500');
  });

  it('returns default gray for unknown status', () => {
    expect(getStatusColor('UNKNOWN')).toBe('bg-gray-400');
  });

  it('returns default for empty string', () => {
    expect(getStatusColor('')).toBe('bg-gray-400');
  });
});
