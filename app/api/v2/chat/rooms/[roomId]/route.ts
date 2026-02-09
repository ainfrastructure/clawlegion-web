import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.BACKEND_URL || 'http://localhost:5001'

// GET /api/v2/chat/rooms/[roomId] - Proxy to backend
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    const url = `${API_URL}/api/v2/chat/rooms/${roomId}${queryString ? '?' + queryString : ''}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 })
      }
      throw new Error(`Backend returned ${response.status}`)
    }
    
    const room = await response.json()
    return NextResponse.json(room)
  } catch (error: any) {
    console.error('[v2/chat/rooms/[roomId]] Proxy error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
