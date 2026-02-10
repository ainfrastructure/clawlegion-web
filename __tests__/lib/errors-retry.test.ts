/**
 * Retry Logic Tests
 *
 * Tests for getRetryDelay, withRetry, isRetryable, and the API retry interceptor.
 *
 * Run with: npx vitest run __tests__/lib/errors-retry.test.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getRetryDelay,
  withRetry,
  isRetryable,
  handleApiError,
  ApiError,
  DEFAULT_RETRY_CONFIG,
} from '@/lib/errors'

// ---------------------------------------------------------------------------
// getRetryDelay
// ---------------------------------------------------------------------------
describe('getRetryDelay', () => {
  describe('exponential backoff (no fixedDelays)', () => {
    it('returns ~1s for attempt 0 with default base', () => {
      const delay = getRetryDelay(0, 1000, { jitter: false })
      expect(delay).toBe(1000)
    })

    it('doubles each attempt', () => {
      const d0 = getRetryDelay(0, 1000, { jitter: false })
      const d1 = getRetryDelay(1, 1000, { jitter: false })
      const d2 = getRetryDelay(2, 1000, { jitter: false })
      expect(d0).toBe(1000)
      expect(d1).toBe(2000)
      expect(d2).toBe(4000)
    })

    it('caps at 30s', () => {
      const delay = getRetryDelay(20, 1000, { jitter: false })
      expect(delay).toBe(30000)
    })

    it('applies jitter by default', () => {
      // With jitter, delay for attempt 0 base 1000 should be in [750, 1250]
      const results = new Set<number>()
      for (let i = 0; i < 50; i++) {
        results.add(getRetryDelay(0, 1000))
      }
      // Should have more than 1 unique value due to jitter
      expect(results.size).toBeGreaterThan(1)
      for (const d of results) {
        expect(d).toBeGreaterThanOrEqual(750)
        expect(d).toBeLessThanOrEqual(1250)
      }
    })
  })

  describe('fixed delay schedule', () => {
    it('uses fixedDelays when provided', () => {
      const delays = [1000, 2000, 4000]
      expect(getRetryDelay(0, 1000, { fixedDelays: delays, jitter: false })).toBe(1000)
      expect(getRetryDelay(1, 1000, { fixedDelays: delays, jitter: false })).toBe(2000)
      expect(getRetryDelay(2, 1000, { fixedDelays: delays, jitter: false })).toBe(4000)
    })

    it('falls back to exponential if attempt exceeds fixedDelays length', () => {
      const delays = [1000, 2000]
      // attempt 2 exceeds fixedDelays length, falls back to exponential
      const delay = getRetryDelay(2, 1000, { fixedDelays: delays, jitter: false })
      expect(delay).toBe(4000) // 1000 * 2^2
    })

    it('applies jitter to fixed delays when enabled', () => {
      const results = new Set<number>()
      for (let i = 0; i < 50; i++) {
        results.add(getRetryDelay(0, 1000, { fixedDelays: [1000], jitter: true }))
      }
      expect(results.size).toBeGreaterThan(1)
      for (const d of results) {
        expect(d).toBeGreaterThanOrEqual(750)
        expect(d).toBeLessThanOrEqual(1250)
      }
    })
  })
})

// ---------------------------------------------------------------------------
// DEFAULT_RETRY_CONFIG
// ---------------------------------------------------------------------------
describe('DEFAULT_RETRY_CONFIG', () => {
  it('has 3 max attempts', () => {
    expect(DEFAULT_RETRY_CONFIG.maxAttempts).toBe(3)
  })

  it('uses 1s/2s/4s fixed delays', () => {
    expect(DEFAULT_RETRY_CONFIG.fixedDelays).toEqual([1000, 2000, 4000])
  })

  it('has jitter enabled', () => {
    expect(DEFAULT_RETRY_CONFIG.jitter).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// isRetryable
// ---------------------------------------------------------------------------
describe('isRetryable', () => {
  it('returns true for 5xx server errors', () => {
    const err = new ApiError('Server Error', 'server', 500)
    expect(isRetryable(err)).toBe(true)
  })

  it('returns true for 502 gateway errors', () => {
    const err = new ApiError('Bad Gateway', 'server', 502)
    expect(isRetryable(err)).toBe(true)
  })

  it('returns true for 503 service unavailable', () => {
    const err = new ApiError('Service Unavailable', 'server', 503)
    expect(isRetryable(err)).toBe(true)
  })

  it('returns true for network errors', () => {
    const err = new ApiError('Network failure', 'network', null)
    expect(isRetryable(err)).toBe(true)
  })

  it('returns true for rate limit errors', () => {
    const err = new ApiError('Rate limited', 'rate_limit', 429)
    expect(isRetryable(err)).toBe(true)
  })

  it('returns false for 400 bad request', () => {
    const err = new ApiError('Bad Request', 'validation', 400)
    expect(isRetryable(err)).toBe(false)
  })

  it('returns false for 401 unauthorized', () => {
    const err = new ApiError('Unauthorized', 'auth', 401)
    expect(isRetryable(err)).toBe(false)
  })

  it('returns false for 403 forbidden', () => {
    const err = new ApiError('Forbidden', 'auth', 403)
    expect(isRetryable(err)).toBe(false)
  })

  it('returns false for 404 not found', () => {
    const err = new ApiError('Not Found', 'not_found', 404)
    expect(isRetryable(err)).toBe(false)
  })

  it('returns false for 422 validation error', () => {
    const err = new ApiError('Unprocessable', 'client', 422)
    expect(isRetryable(err)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// withRetry
// ---------------------------------------------------------------------------
describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns result on first attempt success', async () => {
    const fn = vi.fn().mockResolvedValue('ok')
    const result = await withRetry(fn, { maxAttempts: 3, jitter: false })
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('retries on 5xx and succeeds on second attempt', async () => {
    vi.useRealTimers()
    const serverError = { response: { status: 500 }, message: 'Internal Server Error', isAxiosError: true }
    const fn = vi.fn()
      .mockRejectedValueOnce(serverError)
      .mockResolvedValueOnce('recovered')

    const result = await withRetry(fn, { maxAttempts: 3, fixedDelays: [10, 20, 40], jitter: false })

    expect(result).toBe('recovered')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('retries on network error and succeeds on third attempt', async () => {
    vi.useRealTimers()
    const networkError = new Error('fetch failed')
    const fn = vi.fn()
      .mockRejectedValueOnce(networkError)
      .mockRejectedValueOnce(networkError)
      .mockResolvedValueOnce('recovered')

    const result = await withRetry(fn, { maxAttempts: 3, fixedDelays: [10, 20, 40], jitter: false })

    expect(result).toBe('recovered')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('does NOT retry on 4xx errors', async () => {
    const clientError = { response: { status: 400, data: { message: 'Bad Request' } }, message: 'Bad Request', isAxiosError: true }
    const fn = vi.fn().mockRejectedValue(clientError)

    await expect(
      withRetry(fn, { maxAttempts: 3, fixedDelays: [10, 20, 40], jitter: false })
    ).rejects.toThrow()

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('does NOT retry on 401 unauthorized', async () => {
    const authError = { response: { status: 401, data: { message: 'Unauthorized' } }, message: 'Unauthorized', isAxiosError: true }
    const fn = vi.fn().mockRejectedValue(authError)

    await expect(
      withRetry(fn, { maxAttempts: 3, jitter: false })
    ).rejects.toThrow()

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('does NOT retry on 404 not found', async () => {
    const notFound = { response: { status: 404, data: { message: 'Not Found' } }, message: 'Not Found', isAxiosError: true }
    const fn = vi.fn().mockRejectedValue(notFound)

    await expect(
      withRetry(fn, { maxAttempts: 3, jitter: false })
    ).rejects.toThrow()

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('throws after all retries exhausted', async () => {
    vi.useRealTimers()
    const serverError = { response: { status: 503 }, message: 'Service Unavailable', isAxiosError: true }
    const fn = vi.fn().mockRejectedValue(serverError)

    await expect(
      withRetry(fn, { maxAttempts: 3, fixedDelays: [10, 20, 40], jitter: false })
    ).rejects.toThrow()
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('throws ApiError with correct category on exhaustion', async () => {
    const serverError = { response: { status: 502 }, message: 'Bad Gateway', isAxiosError: true }
    const fn = vi.fn().mockRejectedValue(serverError)

    const promise = withRetry(fn, { maxAttempts: 1, jitter: false })

    try {
      await promise
      // Should not reach here
      expect(true).toBe(false)
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      expect((error as ApiError).category).toBe('server')
      expect((error as ApiError).statusCode).toBe(502)
    }
  })

  it('supports legacy signature (maxAttempts, baseDelayMs)', async () => {
    const fn = vi.fn().mockResolvedValue('legacy-ok')
    const result = await withRetry(fn, 3, 1000)
    expect(result).toBe('legacy-ok')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('uses default config when called with no options', async () => {
    const fn = vi.fn().mockResolvedValue('default-ok')
    const result = await withRetry(fn)
    expect(result).toBe('default-ok')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('respects custom maxAttempts', async () => {
    vi.useRealTimers()
    const serverError = { response: { status: 500 }, message: 'ISE', isAxiosError: true }
    const fn = vi.fn().mockRejectedValue(serverError)

    await expect(
      withRetry(fn, { maxAttempts: 2, fixedDelays: [10, 20], jitter: false })
    ).rejects.toThrow()
    expect(fn).toHaveBeenCalledTimes(2)
  })
})

// ---------------------------------------------------------------------------
// handleApiError — error categorization for retry decisions
// ---------------------------------------------------------------------------
describe('handleApiError categorization', () => {
  it('categorizes 500 as server', () => {
    const err = handleApiError({ response: { status: 500 }, message: 'ISE', isAxiosError: true })
    expect(err.category).toBe('server')
    expect(err.isRetryable).toBe(true)
  })

  it('categorizes network error (no response) as network', () => {
    const err = handleApiError({ message: 'Network Error', isAxiosError: true })
    expect(err.category).toBe('network')
    expect(err.isRetryable).toBe(true)
  })

  it('categorizes 429 as rate_limit', () => {
    const err = handleApiError({ response: { status: 429 }, message: 'Rate limited', isAxiosError: true })
    expect(err.category).toBe('rate_limit')
    expect(err.isRetryable).toBe(true)
  })

  it('categorizes 400 as validation (not retryable)', () => {
    const err = handleApiError({ response: { status: 400 }, message: 'Bad', isAxiosError: true })
    expect(err.category).toBe('validation')
    expect(err.isRetryable).toBe(false)
  })

  it('categorizes 401 as auth (not retryable)', () => {
    const err = handleApiError({ response: { status: 401 }, message: 'Unauth', isAxiosError: true })
    expect(err.category).toBe('auth')
    expect(err.isRetryable).toBe(false)
  })

  it('categorizes 404 as not_found (not retryable)', () => {
    const err = handleApiError({ response: { status: 404 }, message: 'NF', isAxiosError: true })
    expect(err.category).toBe('not_found')
    expect(err.isRetryable).toBe(false)
  })
})
