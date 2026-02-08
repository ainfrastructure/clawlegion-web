/**
 * Error Handling Strategy for ClawLegion
 * 
 * PRINCIPLES:
 * 1. Never silently swallow errors - always log and optionally notify
 * 2. Provide user-friendly error messages (never expose stack traces)
 * 3. Categorize errors for appropriate handling (retryable vs fatal)
 * 4. Centralize error formatting for consistency
 * 
 * USAGE:
 * - Import { handleApiError, ApiError, isRetryable } from '@/lib/errors'
 * - Wrap API calls with try/catch using handleApiError
 * - Use useApiError hook for React components
 */

// Error Categories
export type ErrorCategory = 
  | 'network'        // Connection failures, timeouts
  | 'auth'           // 401/403 errors
  | 'validation'     // 400 bad request, invalid input
  | 'not_found'      // 404 errors
  | 'rate_limit'     // 429 too many requests
  | 'server'         // 500+ server errors
  | 'client'         // Client-side errors
  | 'unknown'        // Uncategorized

// Structured API Error
export class ApiError extends Error {
  public readonly category: ErrorCategory
  public readonly statusCode: number | null
  public readonly isRetryable: boolean
  public readonly userMessage: string
  public readonly originalError: unknown

  constructor(
    message: string,
    category: ErrorCategory,
    statusCode: number | null = null,
    originalError: unknown = null
  ) {
    super(message)
    this.name = 'ApiError'
    this.category = category
    this.statusCode = statusCode
    this.originalError = originalError
    this.isRetryable = ['network', 'rate_limit', 'server'].includes(category)
    this.userMessage = getUserMessage(category, statusCode)
  }
}

// User-friendly messages by category
function getUserMessage(category: ErrorCategory, statusCode: number | null): string {
  const messages: Record<ErrorCategory, string> = {
    network: 'Unable to connect to the server. Please check your internet connection.',
    auth: 'You are not authorized to perform this action. Please sign in again.',
    validation: 'Invalid input. Please check your data and try again.',
    not_found: 'The requested resource was not found.',
    rate_limit: 'Too many requests. Please wait a moment and try again.',
    server: 'Something went wrong on our end. Please try again later.',
    client: 'An error occurred. Please refresh the page and try again.',
    unknown: 'An unexpected error occurred. Please try again.',
  }
  return messages[category]
}

// Categorize error from HTTP status code
function categorizeByStatus(status: number): ErrorCategory {
  if (status === 400) return 'validation'
  if (status === 401 || status === 403) return 'auth'
  if (status === 404) return 'not_found'
  if (status === 429) return 'rate_limit'
  if (status >= 500) return 'server'
  return 'client'
}

// Main error handler - converts any error to ApiError
export function handleApiError(error: unknown): ApiError {
  // Already an ApiError
  if (error instanceof ApiError) {
    return error
  }

  // Axios error
  if (isAxiosError(error)) {
    const status = error.response?.status ?? null
    const message = error.response?.data?.message || error.response?.data?.error || error.message
    
    // Network error (no response)
    if (!error.response) {
      return new ApiError(message, 'network', null, error)
    }
    
    const category = categorizeByStatus(status!)
    return new ApiError(message, category, status, error)
  }

  // Standard Error
  if (error instanceof Error) {
    // Check for network-like errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return new ApiError(error.message, 'network', null, error)
    }
    return new ApiError(error.message, 'unknown', null, error)
  }

  // Unknown error type
  return new ApiError(String(error), 'unknown', null, error)
}

// Type guard for axios errors
function isAxiosError(error: unknown): error is {
  response?: { status: number; data?: { message?: string; error?: string } }
  message: string
} {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    ('response' in error || 'isAxiosError' in error)
  )
}

// Check if error is retryable
export function isRetryable(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.isRetryable
  }
  const apiError = handleApiError(error)
  return apiError.isRetryable
}

// Get retry delay with exponential backoff
export function getRetryDelay(attempt: number, baseDelayMs = 1000): number {
  const maxDelay = 30000 // 30 seconds max
  const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelay)
  // Add jitter (±25%)
  return delay * (0.75 + Math.random() * 0.5)
}

// Retry wrapper for API calls
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 1000
): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (!isRetryable(error) || attempt === maxAttempts - 1) {
        throw handleApiError(error)
      }

      const delay = getRetryDelay(attempt, baseDelayMs)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw handleApiError(lastError)
}

// Log error to console with context
export function logError(error: unknown, context?: string): void {
  const apiError = error instanceof ApiError ? error : handleApiError(error)
  const prefix = context ? `[${context}]` : '[Error]'
  
  console.error(
    `${prefix} ${apiError.category.toUpperCase()}: ${apiError.message}`,
    {
      statusCode: apiError.statusCode,
      isRetryable: apiError.isRetryable,
      originalError: apiError.originalError,
    }
  )
}
