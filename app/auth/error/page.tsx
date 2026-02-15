'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Suspense } from 'react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: Record<string, string> = {
    Configuration: 'Server configuration error. Please contact admin.',
    AccessDenied: 'Access denied. You do not have permission.',
    Verification: 'Verification failed. Please try again.',
    CredentialsSignin: 'Invalid email or password.',
    Default: 'An authentication error occurred.',
  }

  const message = errorMessages[error || ''] || errorMessages.Default

  return (
    <div className="w-full max-w-md text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-2xl mb-6">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      
      <h1 className="text-2xl font-bold text-white mb-2">Authentication Error</h1>
      <p className="text-slate-400 mb-6">{message}</p>

      <Link 
        href="/login"
        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Login
      </Link>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <Suspense fallback={
        <div className="w-full max-w-md text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl mx-auto mb-6" />
            <div className="h-8 bg-slate-800 rounded w-48 mx-auto mb-2" />
            <div className="h-4 bg-slate-800 rounded w-64 mx-auto" />
          </div>
        </div>
      }>
        <AuthErrorContent />
      </Suspense>
    </div>
  )
}
