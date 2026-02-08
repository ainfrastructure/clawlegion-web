'use client'

import { useState, useCallback } from 'react'
import { ApiError, handleApiError, logError, isRetryable } from '@/lib/errors'

interface UseApiErrorResult {
  error: ApiError | null
  isError: boolean
  userMessage: string | null
  canRetry: boolean
  setError: (error: unknown) => void
  clearError: () => void
  handleError: (error: unknown, context?: string) => ApiError
}

/**
 * Hook for consistent error handling in React components.
 * 
 * Usage:
 * ```tsx
 * const { error, userMessage, handleError, clearError } = useApiError()
 * 
 * const fetchData = async () => {
 *   try {
 *     clearError()
 *     const data = await api.get('/endpoint')
 *     return data
 *   } catch (err) {
 *     handleError(err, 'fetchData')
 *   }
 * }
 * 
 * {error && <Alert variant="error">{userMessage}</Alert>}
 * ```
 */
export function useApiError(): UseApiErrorResult {
  const [error, setErrorState] = useState<ApiError | null>(null)

  const setError = useCallback((err: unknown) => {
    const apiError = err instanceof ApiError ? err : handleApiError(err)
    setErrorState(apiError)
  }, [])

  const clearError = useCallback(() => {
    setErrorState(null)
  }, [])

  const handleError = useCallback((err: unknown, context?: string): ApiError => {
    const apiError = err instanceof ApiError ? err : handleApiError(err)
    logError(apiError, context)
    setErrorState(apiError)
    return apiError
  }, [])

  return {
    error,
    isError: error !== null,
    userMessage: error?.userMessage ?? null,
    canRetry: error ? isRetryable(error) : false,
    setError,
    clearError,
    handleError,
  }
}

export default useApiError
