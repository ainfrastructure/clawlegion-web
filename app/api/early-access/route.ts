import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  source: z.string().optional(),
})

const API_URL = process.env.BACKEND_URL || 'https://clawlegion-backend-production.up.railway.app'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, source } = result.data

    const backendRes = await fetch(`${API_URL}/api/early-access/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source }),
    })

    if (!backendRes.ok) {
      const err = await backendRes.json().catch(() => ({ error: 'Backend error' }))
      return NextResponse.json(
        { error: err.error || 'Failed to process signup.' },
        { status: backendRes.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Early access signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    )
  }
}
