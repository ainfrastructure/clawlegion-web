import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

// Adapt Prisma task data to the legacy response shape that 12+ consumers expect
function buildSummary(tasks: any[]) {
  const statuses = tasks.map((t: any) => t.status)
  return {
    queued: statuses.filter((s: string) => s === 'backlog' || s === 'todo').length,
    assigned: statuses.filter((s: string) => s === 'researching' || s === 'planning' || s === 'building').length,
    inProgress: statuses.filter((s: string) => s === 'building' || s === 'verifying').length,
    completed: statuses.filter((s: string) => s === 'done').length,
    failed: statuses.filter((s: string) => s === 'blocked' || s === 'cancelled').length,
  }
}

// GET: Get tasks with filters — proxy to Express
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()

    const res = await fetch(
      `${API_URL}/api/task-tracking/tasks${queryString ? '?' + queryString : ''}`,
      { cache: 'no-store' }
    )
    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: res.status })
    }

    const data = await res.json()
    const tasks = data.tasks || []

    return NextResponse.json({
      tasks,
      count: tasks.length,
      summary: buildSummary(tasks),
      lastUpdated: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('[tasks/queue] Proxy error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: Create new task — proxy to Express
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const res = await fetch(`${API_URL}/api/task-tracking/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json({ success: true, task: data.task || data })
  } catch (error: any) {
    console.error('[tasks/queue] POST proxy error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH: Update task — proxy to Express
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId, ...updates } = body

    if (!taskId) {
      return NextResponse.json({ error: 'taskId required' }, { status: 400 })
    }

    const res = await fetch(`${API_URL}/api/task-tracking/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json({ success: true, task: data.task || data })
  } catch (error: any) {
    console.error('[tasks/queue] PATCH proxy error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE: Remove task — proxy to Express
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId } = body

    if (!taskId) {
      return NextResponse.json({ error: 'taskId required' }, { status: 400 })
    }

    const res = await fetch(`${API_URL}/api/task-tracking/tasks/${taskId}`, {
      method: 'DELETE',
    })
    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: res.status })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[tasks/queue] DELETE proxy error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
