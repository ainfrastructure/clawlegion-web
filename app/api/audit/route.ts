import { NextRequest } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

// GET: Proxy audit requests to backend
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  try {
    // Forward all query parameters to the backend
    const backendUrl = new URL('/api/audit', BACKEND_URL);
    for (const [key, value] of searchParams.entries()) {
      backendUrl.searchParams.append(key, value);
    }

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return Response.json(data);

  } catch (error) {
    console.error('Failed to fetch audit data from backend:', error);
    return Response.json(
      { 
        error: 'Failed to fetch audit data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST: Proxy audit creation to backend
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/audit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return Response.json(data);

  } catch (error) {
    console.error('Failed to create audit entry:', error);
    return Response.json(
      {
        error: 'Failed to create audit entry',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
