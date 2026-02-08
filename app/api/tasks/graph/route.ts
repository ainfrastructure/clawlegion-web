import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

// Build graph edges from dependencies and parent-child relationships
function buildGraph(tasks: any[]) {
  const nodes = tasks.map((t: any) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    progress: t.progress ?? 0,
    assignedTo: t.assignee,
    parentId: t.parentId,
    isLeaf: !t.subtasks || t.subtasks.length === 0,
    canStart: true,
    level: 0,
    position: undefined,
  }))

  const edges: { from: string; to: string; type: 'dependency' | 'parent-child' | 'soft' }[] = []

  for (const task of tasks) {
    if (task.dependencies && Array.isArray(task.dependencies)) {
      for (const dep of task.dependencies) {
        const depId = typeof dep === 'string' ? dep : dep.taskId
        edges.push({
          from: depId,
          to: task.id,
          type: dep.type === 'soft' ? 'soft' : 'dependency',
        })
      }
    }
    if (task.parentId) {
      edges.push({
        from: task.parentId,
        to: task.id,
        type: 'parent-child',
      })
    }
  }

  return { nodes, edges }
}

// GET: Get task graph — proxy to Express
export async function GET(request: NextRequest) {
  try {
    const res = await fetch(`${API_URL}/api/task-tracking/tasks`, { cache: 'no-store' })
    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: res.status })
    }

    const data = await res.json()
    const tasks = data.tasks || []

    const graph = buildGraph(tasks)

    return NextResponse.json({
      nodes: graph.nodes,
      edges: graph.edges,
      summary: {
        total: tasks.length,
        roots: tasks.filter((t: any) => !t.parentId).length,
        leaves: tasks.filter((t: any) => !t.subtasks || t.subtasks.length === 0).length,
        byStatus: {
          todo: tasks.filter((t: any) => t.status === 'todo' || t.status === 'backlog').length,
          building: tasks.filter((t: any) => t.status === 'building' || t.status === 'researching' || t.status === 'planning').length,
          verifying: tasks.filter((t: any) => t.status === 'verifying').length,
          done: tasks.filter((t: any) => t.status === 'done').length,
          blocked: tasks.filter((t: any) => t.status === 'blocked').length,
          cancelled: tasks.filter((t: any) => t.status === 'cancelled').length,
        },
      },
      lastUpdated: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('[tasks/graph] Proxy error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: Create task with subtasks — proxy to Express
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
    return NextResponse.json({
      success: true,
      task: data.task || data,
      totalCreated: 1,
    })
  } catch (error: any) {
    console.error('[tasks/graph] POST proxy error:', error.message)
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
    console.error('[tasks/graph] PATCH proxy error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
