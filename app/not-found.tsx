import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 404 Badge */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800/50 rounded-2xl mb-6">
          <span className="text-4xl font-bold text-slate-400">404</span>
        </div>
        
        {/* Message */}
        <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-slate-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link 
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link 
            href="/tasks"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
          >
            <Search className="w-4 h-4" />
            Browse Tasks
          </Link>
        </div>
      </div>
    </div>
  )
}
