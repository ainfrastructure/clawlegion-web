import axios, { AxiosError } from 'axios'
import { isRetryable, getRetryDelay, DEFAULT_RETRY_CONFIG } from '@/lib/errors'

// Use relative URL for API calls (proxied through Next.js rewrites)
const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

/** Safe HTTP methods that can be retried without side-effect risk */
const IDEMPOTENT_METHODS = new Set(['get', 'head', 'options', 'put', 'delete'])

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Retry interceptor — retries transient failures (5xx, network errors)
 * with configurable exponential backoff (default: 1s / 2s / 4s).
 *
 * Only retries idempotent methods (GET, HEAD, OPTIONS, PUT, DELETE) by default.
 * POST requests are NOT retried automatically to avoid duplicate side-effects.
 *
 * Opt-out per request: pass `{ __disableRetry: true }` in the Axios config.
 * Opt-in POST retry: pass `{ __forceRetry: true }` in the Axios config.
 *
 * Does NOT retry 4xx client errors (400, 401, 403, 404, 422, etc.).
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as typeof error.config & {
      __retryCount?: number
      __disableRetry?: boolean
      __forceRetry?: boolean
    }

    // Determine if this method is safe to retry
    const method = (config?.method ?? '').toLowerCase()
    const isSafeMethod = IDEMPOTENT_METHODS.has(method) || config?.__forceRetry

    // Skip retry if disabled, no config, non-retryable error, or unsafe method
    if (!config || config.__disableRetry || !isSafeMethod || !isRetryable(error)) {
      // Don't log 404s — they're expected for optional resources
      if (error.response?.status !== 404) {
        console.error('API Error:', error.response?.data || error.message)
      }
      return Promise.reject(error)
    }

    const retryCount = config.__retryCount ?? 0
    const maxRetries = DEFAULT_RETRY_CONFIG.maxAttempts

    if (retryCount >= maxRetries) {
      console.error('API Error (retries exhausted):', error.response?.data || error.message)
      return Promise.reject(error)
    }

    config.__retryCount = retryCount + 1

    const delay = getRetryDelay(retryCount, DEFAULT_RETRY_CONFIG.baseDelayMs, {
      fixedDelays: DEFAULT_RETRY_CONFIG.fixedDelays,
      jitter: DEFAULT_RETRY_CONFIG.jitter,
    })

    await new Promise(resolve => setTimeout(resolve, delay))

    return api.request(config)
  }
)

export default api
