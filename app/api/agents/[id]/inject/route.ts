import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/agents/${agentId}/inject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Inject proxy error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to inject task',
    }, { status: 500 });
  }
}

// GET - Show agent's injected tasks
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;

    // The backend doesn't have a dedicated GET for injected tasks,
    // so we fetch agent activity filtered to injections
    const response = await fetch(`${BACKEND_URL}/api/agents/${agentId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      return NextResponse.json({
        agentId,
        injectedTasks: [],
        count: 0,
      });
    }

    const data = await response.json();
    return NextResponse.json({
      agentId,
      agent: data,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get agent data',
    }, { status: 500 });
  }
}
