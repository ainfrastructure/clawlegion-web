import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { taskId, agentId } = await request.json();
    
    console.log(`Reassigning task ${taskId} from agent ${agentId}`);
    
    return NextResponse.json({
      success: true,
      message: `Task ${taskId || 'current'} reassigned successfully`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to reassign task',
    }, { status: 500 });
  }
}
