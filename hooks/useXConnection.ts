import { useState, useEffect, useCallback } from 'react'

const API_BASE = 'http://localhost:5001/api'

interface XAccount {
  username: string
  displayName: string
  avatarUrl: string
  scopes: string[]
  connectedAt: string
}

interface XConnectionStatus {
  connected: boolean
  configured: boolean
  account?: XAccount
}

export function useXConnection() {
  const [status, setStatus] = useState<XConnectionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`${API_BASE}/connections/x/status?userId=default-user`)
      if (!res.ok) throw new Error('Failed to fetch X connection status')
      const data: XConnectionStatus = await res.json()
      setStatus(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStatus({ connected: false, configured: false })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const connect = useCallback(async () => {
    try {
      setIsConnecting(true)
      const res = await fetch(`${API_BASE}/connections/x/authorize?userId=default-user`)
      if (!res.ok) throw new Error('Failed to get authorization URL')
      const data = await res.json()
      if (data.authUrl || data.url) {
        window.location.href = data.authUrl || data.url
      } else {
        throw new Error('No authorization URL returned')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect')
      setIsConnecting(false)
    }
  }, [])

  const disconnect = useCallback(async () => {
    try {
      setIsDisconnecting(true)
      const res = await fetch(`${API_BASE}/connections/x?userId=default-user`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to disconnect')
      await fetchStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect')
    } finally {
      setIsDisconnecting(false)
    }
  }, [fetchStatus])

  return {
    status,
    isLoading,
    isConnecting,
    isDisconnecting,
    error,
    connect,
    disconnect,
    refresh: fetchStatus,
  }
}
