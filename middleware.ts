import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes - no auth required
  const publicPaths = [
    '/login',
    '/auth/error',
    '/api/auth',
    '/api/tasks',      // Keep API open for agents
    '/api/agents',
    '/api/coordination',
    '/api/sse',
    '/api/notifications',
    '/api/presence',
    '/api/health',
    '/api/bus-status', // Message bus status for agent monitoring
    '/_next',
    '/favicon.ico',
    // Dashboard pages - public for now
    '/',
    '/dashboard',
    '/tasks',
    '/agents',
    '/chat',
    '/sessions',
    '/sprint',
  ]

  // Check if path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  
  if (isPublicPath) {
    return NextResponse.next()
  }

  // Check for auth token
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET
  })

  // Not authenticated - redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
