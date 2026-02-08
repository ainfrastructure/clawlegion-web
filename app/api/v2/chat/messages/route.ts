import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

// GET /api/v2/chat/messages?roomId=xxx&limit=50&before=timestamp
// Proxy to Express backend
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()

    const response = await fetch(
      `${API_URL}/api/v2/chat/messages${queryString ? '?' + queryString : ''}`,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    )

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[v2/chat/messages] Proxy error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
