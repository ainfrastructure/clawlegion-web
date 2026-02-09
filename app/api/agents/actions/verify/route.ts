import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { taskId } = await request.json();
    
    console.log(`Force verifying task: ${taskId}`);
    
    // Call the verification endpoint
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'
    const verifyRes = await fetch(`${baseUrl}/api/tasks/force-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId }),
    });
    
    if (!verifyRes.ok) {
      throw new Error('Verification failed');
    }
    
    return NextResponse.json({
      success: true,
      message: `Task ${taskId || 'current'} verified successfully`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to verify task',
    }, { status: 500 });
  }
}
