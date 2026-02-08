import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
let connected = false;

async function getRedis() {
  if (!connected) {
    await redis.connect();
    connected = true;
  }
  return redis;
}

// POST: Claim a message (returns true if claimed, false if already claimed)
export async function POST(request: NextRequest) {
  try {
    const { messageId, agentId, ttlSeconds = 60 } = await request.json();
    
    if (!messageId || !agentId) {
      return NextResponse.json({ error: 'messageId and agentId required' }, { status: 400 });
    }
    
    const client = await getRedis();
    const key = `msg:claimed:${messageId}`;
    
    // Try to set with NX (only if not exists)
    const claimed = await client.set(key, agentId, { NX: true, EX: ttlSeconds });
    
    if (claimed) {
      return NextResponse.json({ claimed: true, by: agentId });
    } else {
      // Already claimed - get who claimed it
      const claimedBy = await client.get(key);
      return NextResponse.json({ claimed: false, by: claimedBy });
    }
  } catch (error) {
    console.error('Claim error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// GET: Check if message is claimed
export async function GET(request: NextRequest) {
  try {
    const messageId = request.nextUrl.searchParams.get('messageId');
    if (!messageId) {
      return NextResponse.json({ error: 'messageId required' }, { status: 400 });
    }
    
    const client = await getRedis();
    const claimedBy = await client.get(`msg:claimed:${messageId}`);
    
    return NextResponse.json({ 
      claimed: !!claimedBy, 
      by: claimedBy 
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
