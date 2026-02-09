import { NextRequest, NextResponse } from 'next/server'

// GET: Generate shields.io compatible badge JSON
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'
  
  try {
    const res = await fetch(`${baseUrl}/api/health-check`, {
      signal: AbortSignal.timeout(5000),
      cache: 'no-store'
    })
    
    if (!res.ok) throw new Error('Health check failed')
    
    const health = await res.json()
    
    const color = health.status === 'healthy' ? 'brightgreen' :
                  health.status === 'degraded' ? 'yellow' : 'red'
    
    const message = health.status === 'healthy' 
      ? `${health.summary.healthy}/${health.summary.total} healthy`
      : health.status
    
    return NextResponse.json({
      schemaVersion: 1,
      label: 'status',
      message,
      color,
      cacheSeconds: 60
    })
  } catch (err) {
    return NextResponse.json({
      schemaVersion: 1,
      label: 'status',
      message: 'unknown',
      color: 'lightgrey',
      cacheSeconds: 60
    })
  }
}
