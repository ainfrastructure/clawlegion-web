import { NextRequest, NextResponse } from 'next/server';
import { audit } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    
    console.log('EMERGENCY STOP triggered!', body);
    
    // Audit log: agent stopped (emergency)
    audit.agentStopped('all', 'dashboard', { 
      emergency: true, 
      reason: body.reason || 'Emergency stop triggered from dashboard' 
    });
    
    return NextResponse.json({
      success: true,
      message: 'Emergency stop executed - all agents halted',
      timestamp: new Date().toISOString(),
      warning: 'All agent activity has been stopped. Manual restart required.',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Emergency stop failed',
    }, { status: 500 });
  }
}
