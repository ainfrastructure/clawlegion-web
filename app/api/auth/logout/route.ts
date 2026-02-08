import { NextResponse } from 'next/server'

/**
 * Explicit logout endpoint
 * 
 * For programmatic logout (APIs, scripts)
 * For UI logout, use signOut() from next-auth/react
 */
export async function POST() {
  // Create response with cleared session cookie
  const response = NextResponse.json({ 
    success: true, 
    message: 'Logged out successfully',
    redirect: '/login'
  })
  
  // Clear the NextAuth session token cookie
  response.cookies.set('next-auth.session-token', '', { 
    expires: new Date(0),
    path: '/' 
  })
  response.cookies.set('__Secure-next-auth.session-token', '', { 
    expires: new Date(0),
    path: '/' 
  })
  
  return response
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to logout, or use /api/auth/signout for NextAuth signout'
  })
}
