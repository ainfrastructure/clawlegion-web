import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Please enter a valid email address.'),
  message: z.string().min(10, 'Message must be at least 10 characters.').max(2000, 'Message must be under 2000 characters.'),
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

    const { name, email, message } = result.data

    const backendRes = await fetch(`${API_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    })

    if (!backendRes.ok) {
      const err = await backendRes.json().catch(() => ({ error: 'Backend error' }))
      return NextResponse.json(
        { error: err.error || 'Failed to send message.' },
        { status: backendRes.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    )
  }
}
