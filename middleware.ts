import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes - no auth required
  const publicPaths = [
    '/login',
    '/auth/error',
    '/api/',           // All API routes open (backend proxy + agents need these)
    '/_next',
    '/favicon.ico',
    '/agents/',        // Agent avatar images (public/agents/)
    '/avatars/',       // Avatar images (public/avatars/)
    '/demo-',          // Demo video + poster (public/demo-*)
    '/showcase/',       // Showcase screenshots for landing page
    '/optimized/',      // Pre-optimized WebP images for landing page
  ]

  // Check if path is public
  const isPublicPath = pathname === '/' || publicPaths.some(path => pathname.startsWith(path))
  
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
