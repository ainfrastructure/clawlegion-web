import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'

// In production, replace with a proper user database
// Configure users via environment variables or a database
const VALID_USERS = [
  { 
    id: '1', 
    name: process.env.ADMIN_NAME || 'Admin', 
    username: process.env.ADMIN_USERNAME || 'admin',
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_PASSWORD || 'changeme',
    role: 'admin'
  },
]

if (!process.env.NEXTAUTH_SECRET) {
  console.warn('⚠️  NEXTAUTH_SECRET is not set. Please set it in your environment variables.')
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'please-set-NEXTAUTH_SECRET'
)

/**
 * POST /api/auth/login
 * 
 * Body: { username: string, password: string }
 * Returns: { token: string, user: { id, name, email, role }, expiresAt: string }
 * 
 * Use this for programmatic API access (agents, CLI tools, scripts)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Find user
    const user = VALID_USERS.find(
      u => u.username === username && u.password === password
    )

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create JWT token (24 hour expiry)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    
    const token = await new SignJWT({ 
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET)

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/auth/login
 * Returns API documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/auth/login',
    method: 'POST',
    description: 'Authenticate and receive a JWT token for API access',
    body: {
      username: 'string (required)',
      password: 'string (required)',
    },
    response: {
      token: 'JWT token for Authorization header',
      user: { id: 'string', name: 'string', email: 'string', role: 'string' },
      expiresAt: 'ISO timestamp when token expires',
    },
    usage: 'Include token in Authorization header: Bearer <token>',
  })
}
