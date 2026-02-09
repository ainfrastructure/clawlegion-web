import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.BACKEND_URL || 'http://localhost:5001'

// GET /api/v2/chat/dms?userId=xxx - List all DMs for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'default-user'

    const res = await fetch(`${API_URL}/api/v2/chat/dms?userId=${userId}`)
    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: res.status })
    }
    const data = await res.json()

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[v2/chat/dms] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
