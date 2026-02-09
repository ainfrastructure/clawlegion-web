import { NextResponse } from 'next/server'

const API_URL = process.env.BACKEND_URL || 'http://localhost:5001'
const startTime = Date.now()

export async function GET() {
  const now = Date.now()
  const uptime = Math.floor((now - startTime) / 1000)

  // Check API server
  let apiServerOk = false
  try {
    const res = await fetch(`${API_URL}/health`, {
      signal: AbortSignal.timeout(2000),
    })
    apiServerOk = res.ok
  } catch {}

  // Memory usage
  const memoryUsage = process.memoryUsage()
  const memoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024)

  const status = apiServerOk ? 'healthy' : 'degraded'

  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    uptime: `${uptime}s`,
    checks: {
      apiServer: apiServerOk,
    },
    memory: {
      heapUsed: `${memoryMB}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
    },
    version: '1.0.0',
  })
}
