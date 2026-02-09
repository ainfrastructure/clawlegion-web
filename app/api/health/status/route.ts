import { NextResponse } from 'next/server';

const API_URL = process.env.BACKEND_URL || 'http://localhost:5001';

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/api/health/status`, {
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    });
    
    if (!res.ok) {
      return NextResponse.json(
        { status: 'unhealthy', error: 'API server returned error' },
        { status: res.status }
      );
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: 0,
        checks: [],
        summary: { total: 0, healthy: 0, degraded: 0, unhealthy: 0 },
        error: error instanceof Error ? error.message : 'Failed to reach API server',
      },
      { status: 503 }
    );
  }
}
