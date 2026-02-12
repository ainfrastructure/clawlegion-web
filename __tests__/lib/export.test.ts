/**
 * Export Utility Tests
 *
 * Tests for toCSV and flattenForExport functions.
 *
 * Run with: npx vitest run __tests__/lib/export.test.ts
 */

import { describe, it, expect } from 'vitest';
import { toCSV, flattenForExport } from '@/lib/export';

// ---------------------------------------------------------------------------
// toCSV
// ---------------------------------------------------------------------------
describe('toCSV', () => {
  it('returns empty string for empty array', () => {
    expect(toCSV([])).toBe('');
  });

  it('creates header row from object keys', () => {
    const data = [{ name: 'Test', value: 123 }];
    const result = toCSV(data);
    expect(result).toContain('name,value');
  });

  it('formats simple values correctly', () => {
    const data = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ];
    const result = toCSV(data);
    const lines = result.split('\n');
    expect(lines[0]).toBe('name,age');
    expect(lines[1]).toBe('Alice,30');
    expect(lines[2]).toBe('Bob,25');
  });

  it('escapes values containing commas', () => {
    const data = [{ name: 'Test, Inc', value: 100 }];
    const result = toCSV(data);
    expect(result).toContain('"Test, Inc"');
  });

  it('escapes values containing double quotes', () => {
    const data = [{ name: 'Say "Hello"', value: 100 }];
    const result = toCSV(data);
    expect(result).toContain('"Say ""Hello"""');
  });

  it('escapes values containing newlines', () => {
    const data = [{ name: 'Line1\nLine2', value: 100 }];
    const result = toCSV(data);
    expect(result).toContain('"Line1\nLine2"');
  });

  it('converts null and undefined to empty strings', () => {
    const data = [{ a: null, b: undefined, c: 'test' }];
    const result = toCSV(data);
    expect(result).toContain(',,test');
  });

  it('stringifies object values', () => {
    const data = [{ info: { nested: true } }];
    const result = toCSV(data);
    // Objects get JSON stringified and quoted
    expect(result).toContain('info');
  });

  it('respects custom columns parameter', () => {
    const data = [{ a: 1, b: 2, c: 3 }];
    const result = toCSV(data, ['c', 'a']);
    const lines = result.split('\n');
    expect(lines[0]).toBe('c,a');
    expect(lines[1]).toBe('3,1');
  });

  it('handles boolean values', () => {
    const data = [{ active: true, deleted: false }];
    const result = toCSV(data);
    const lines = result.split('\n');
    expect(lines[1]).toBe('true,false');
  });

  it('handles numeric zero', () => {
    const data = [{ count: 0 }];
    const result = toCSV(data);
    const lines = result.split('\n');
    expect(lines[1]).toBe('0');
  });
});

// ---------------------------------------------------------------------------
// flattenForExport
// ---------------------------------------------------------------------------
describe('flattenForExport', () => {
  it('flattens nested objects with prefixed keys', () => {
    const data = [{ name: 'Test', stats: { count: 5, avg: 2.5 } }];
    const result = flattenForExport(data, ['stats']);
    expect(result[0]).toEqual({
      name: 'Test',
      stats_count: 5,
      stats_avg: 2.5,
    });
  });

  it('converts arrays to semicolon-separated strings', () => {
    const data = [{ name: 'Test', tags: ['a', 'b', 'c'] }];
    const result = flattenForExport(data, ['tags']);
    expect(result[0].tags).toBe('a; b; c');
  });

  it('handles empty nested objects', () => {
    const data = [{ name: 'Test', stats: {} }];
    const result = flattenForExport(data, ['stats']);
    expect(result[0]).toEqual({ name: 'Test' });
  });

  it('preserves non-nested fields', () => {
    const data = [{ a: 1, b: 2, nested: { c: 3 } }];
    const result = flattenForExport(data, ['nested']);
    expect(result[0].a).toBe(1);
    expect(result[0].b).toBe(2);
    expect(result[0].nested_c).toBe(3);
  });

  it('handles empty array input', () => {
    const result = flattenForExport([], ['anything']);
    expect(result).toEqual([]);
  });

  it('passes through when nestedKeys is empty', () => {
    const data = [{ name: 'Test', stats: { count: 5 } }];
    const result = flattenForExport(data, []);
    expect(result[0]).toEqual(data[0]);
  });

  it('handles empty arrays in data', () => {
    const data = [{ name: 'Test', tags: [] as string[] }];
    const result = flattenForExport(data, ['tags']);
    expect(result[0].tags).toBe('');
  });

  it('ignores nestedKeys that do not exist in data', () => {
    const data = [{ name: 'Test' }];
    const result = flattenForExport(data, ['nonexistent']);
    expect(result[0]).toEqual({ name: 'Test' });
  });
});
