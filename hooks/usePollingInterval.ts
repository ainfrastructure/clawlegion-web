import { useEffect, useRef } from 'react'

/**
 * Runs a callback on a repeating interval with automatic cleanup.
 * Calls the callback immediately on mount, then every `intervalMs`.
 *
 * @param callback - Function to call on each interval tick
 * @param intervalMs - Interval duration in milliseconds
 * @param enabled - Whether polling is active (default: true)
 */
export function usePollingInterval(
  callback: () => void,
  intervalMs: number,
  enabled = true,
) {
  const savedCallback = useRef(callback)

  // Always keep the latest callback ref
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled || intervalMs <= 0) return

    savedCallback.current()
    const id = setInterval(() => savedCallback.current(), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs, enabled])
}
