import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.BACKEND_URL || 'http://localhost:5001'

// POST: Force verify a task — proxy to Express
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId, verifiedBy, result, notes } = body

    if (!taskId || !verifiedBy || !result) {
      return NextResponse.json(
        { error: 'taskId, verifiedBy, and result (pass/fail) are required' },
        { status: 400 }
      )
    }

    if (result !== 'pass' && result !== 'fail') {
      return NextResponse.json(
        { error: 'result must be pass or fail' },
        { status: 400 }
      )
    }

    const res = await fetch(`${API_URL}/api/task-tracking/tasks/${taskId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verifiedBy, result, notes }),
    })
    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json({
      success: true,
      task: data.task || data,
      message: `Task verified as ${result}`,
    })
  } catch (error: any) {
    console.error('[tasks/force-verify] Proxy error:', error.message)
    return NextResponse.json({ error: 'Failed to verify task' }, { status: 500 })
  }
}
