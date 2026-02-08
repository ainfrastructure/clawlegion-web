import { NextRequest, NextResponse } from 'next/server';
import { audit } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const { agentId, reason } = await request.json();
    
    console.log(`Pausing agent: ${agentId || 'all'}`);
    
    // Audit log: agent paused
    audit.agentPaused(agentId || 'all', 'dashboard', { reason });
    
    return NextResponse.json({
      success: true,
      message: `Agent ${agentId || 'all'} paused successfully`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to pause agent',
    }, { status: 500 });
  }
}
