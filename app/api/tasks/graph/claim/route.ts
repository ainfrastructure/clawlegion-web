import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.BACKEND_URL || 'http://localhost:5001'

// POST: Claim next available task — proxy to Express
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId } = body

    if (!agentId) {
      return NextResponse.json({ error: 'agentId required' }, { status: 400 })
    }

    // Get all tasks from Prisma
    const res = await fetch(`${API_URL}/api/task-tracking/tasks`, { cache: 'no-store' })
    if (!res.ok) {
      return NextResponse.json({ success: false, message: 'Could not reach task service' })
    }

    const data = await res.json()
    const tasks = data.tasks || []

    // Find claimable tasks (todo/backlog status)
    const candidates = tasks.filter((t: any) =>
      (t.status === 'todo' || t.status === 'backlog') &&
      !t.assignee
    )

    if (candidates.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No claimable tasks available',
        stats: {
          total: tasks.length,
          todo: tasks.filter((t: any) => t.status === 'todo' || t.status === 'backlog').length,
          building: tasks.filter((t: any) => t.status === 'building').length,
        },
      })
    }

    // Pick the first candidate and assign it
    const best = candidates[0]
    const patchRes = await fetch(`${API_URL}/api/task-tracking/tasks/${best.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignee: agentId, status: 'building' }),
    })

    if (!patchRes.ok) {
      const err = await patchRes.text()
      return NextResponse.json({ error: err }, { status: patchRes.status })
    }

    const updated = await patchRes.json()
    return NextResponse.json({
      success: true,
      task: updated.task || updated,
      remainingClaimable: candidates.length - 1,
    })
  } catch (error: any) {
    console.error('[tasks/graph/claim] Proxy error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET: Preview claimable tasks — proxy to Express
export async function GET(request: NextRequest) {
  try {
    const res = await fetch(`${API_URL}/api/task-tracking/tasks`, { cache: 'no-store' })
    if (!res.ok) {
      return NextResponse.json({ claimable: [], count: 0 })
    }

    const data = await res.json()
    const tasks = data.tasks || []

    const candidates = tasks.filter((t: any) =>
      (t.status === 'todo' || t.status === 'backlog') &&
      !t.assignee
    )

    return NextResponse.json({
      claimable: candidates.map((t: any) => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        isLeaf: true,
        parentId: t.parentId,
      })),
      count: candidates.length,
      stats: {
        total: tasks.length,
        todo: tasks.filter((t: any) => t.status === 'todo' || t.status === 'backlog').length,
        building: tasks.filter((t: any) => t.status === 'building').length,
      },
    })
  } catch (error: any) {
    console.error('[tasks/graph/claim] GET proxy error:', error.message)
    return NextResponse.json({ claimable: [], count: 0 })
  }
}
