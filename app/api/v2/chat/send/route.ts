import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.BACKEND_URL || 'http://localhost:5001'

// POST /api/v2/chat/send
// Proxy to Express backend for reliable message sending with webhooks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${API_URL}/api/v2/chat/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Backend returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()

    // Ensure response format matches what useChatMessages hook expects (data.message)
    return NextResponse.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[v2/chat/send] Proxy error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
