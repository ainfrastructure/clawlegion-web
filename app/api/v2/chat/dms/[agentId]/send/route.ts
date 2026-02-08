import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

// POST /api/v2/chat/dms/[agentId]/send - Send message in DM
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params
    const body = await request.json()

    const res = await fetch(`${API_URL}/api/v2/chat/dms/${agentId}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: res.status })
    }
    const data = await res.json()

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[v2/chat/dms/[agentId]/send] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
