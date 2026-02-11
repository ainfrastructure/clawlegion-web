'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function ConnectionsRedirect() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const status = searchParams.get('status')
    const error = searchParams.get('error')

    // Redirect to integrations tab with OAuth result params
    const params = new URLSearchParams({ tab: 'integrations' })
    if (status) params.set('oauth_status', status)
    if (error) params.set('oauth_error', error)

    router.replace(`/settings?${params.toString()}`)
  }, [searchParams, router])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-slate-400 text-sm animate-pulse">Redirecting...</div>
    </div>
  )
}

export default function ConnectionsPage() {
  return (
    <Suspense>
      <ConnectionsRedirect />
    </Suspense>
  )
}
