import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

// GET: Task statistics — proxy to Express
export async function GET(request: NextRequest) {
  try {
    const res = await fetch(`${API_URL}/api/task-tracking/tasks`, { cache: 'no-store' })
    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: res.status })
    }

    const data = await res.json()
    const tasks: any[] = data.tasks || []

    // Count by status
    const byStatus: Record<string, number> = {}
    for (const task of tasks) {
      byStatus[task.status] = (byStatus[task.status] || 0) + 1
    }

    // Count by assignee (done only)
    const byAssignee: Record<string, number> = {}
    for (const task of tasks.filter((t: any) => t.status === 'done' && t.assignee)) {
      byAssignee[task.assignee] = (byAssignee[task.assignee] || 0) + 1
    }

    // Count by creator
    const byCreator: Record<string, number> = {}
    for (const task of tasks) {
      const creator = task.createdBy || 'system'
      byCreator[creator] = (byCreator[creator] || 0) + 1
    }

    // Count by priority
    const byPriority: Record<string, number> = {}
    for (const task of tasks) {
      const priority = task.priority || 'P2'
      byPriority[priority] = (byPriority[priority] || 0) + 1
    }

    // Recent completions (last 24h)
    const now = Date.now()
    const dayAgo = now - 24 * 60 * 60 * 1000
    const recentCompletions = tasks.filter((t: any) =>
      t.status === 'done' &&
      t.updatedAt &&
      new Date(t.updatedAt).getTime() > dayAgo
    ).length

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      total: tasks.length,
      byStatus,
      byAssignee,
      byCreator,
      byPriority,
      recentCompletions24h: recentCompletions,
      topTags: [],
    })
  } catch (error: any) {
    console.error('[tasks/stats] Proxy error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
