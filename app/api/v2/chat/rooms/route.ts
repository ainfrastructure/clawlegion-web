import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.BACKEND_URL || 'http://localhost:5001'

// GET /api/v2/chat/rooms - Proxy to backend
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${API_URL}/api/v2/chat/rooms`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`)
    }
    
    const allRooms = await response.json()
    // Backend returns array, frontend expects { rooms: [...] }
    // Filter to only show 'general' type rooms (exclude DMs which are shown separately)
    const rooms = Array.isArray(allRooms) 
      ? allRooms.filter((r: any) => r.type === 'general')
      : []
    return NextResponse.json({ rooms })
  } catch (error: any) {
    console.error('[v2/chat/rooms] Proxy error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/v2/chat/rooms - Proxy to backend
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${API_URL}/api/v2/chat/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`)
    }
    
    const room = await response.json()
    return NextResponse.json(room, { status: 201 })
  } catch (error: any) {
    console.error('[v2/chat/rooms] POST Proxy error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
