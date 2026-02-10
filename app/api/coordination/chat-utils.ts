import { randomUUID } from 'crypto'
import {
  ALL_AGENTS,
  getAgentNames,
  getAgentWebhookUrl,
} from '@/components/chat-v2/agentConfig'

export const WEBHOOK_TOKEN = process.env.OPENCLAW_WEBHOOK_TOKEN || ''
export const MAX_TURNS = 10

export interface ChatMessage {
  id: string
  roomId: string
  author: string
  authorType: 'human' | 'agent' | 'system' | 'user'
  content: string
  timestamp: string
  page?: string
  attachments?: unknown[]
  conversationId?: string
  turnCount?: number
}

export interface ChatRoom {
  id: string
  name: string
  description?: string
  type?: 'dm' | 'room' | 'group'
  participants?: string[]
  createdAt?: string
}

// Derived from agentConfig — maps agent ID to webhook base URL
// Env var overrides: AGENT_WEBHOOK_<UPPERCASE_ID> (e.g. AGENT_WEBHOOK_CAESAR=http://host:18789)
export const AGENT_WEBHOOKS: Record<string, string> = Object.fromEntries(
  ALL_AGENTS
    .filter(a => a.port)
    .map(a => [
      a.id,
      process.env[`AGENT_WEBHOOK_${a.id.toUpperCase()}`] || `http://localhost:${a.port}`,
    ])
)

// Derived from agentConfig — canonical names + legacy aliases
export const AGENT_NAMES: Record<string, string> = getAgentNames()

// Dynamically built regex pattern for @mention detection
const MENTION_PATTERN = new RegExp(
  `@(${Object.keys(AGENT_NAMES).join('|')}|all)`,
  'gi'
)

// Post a system message to a room via the Express backend
export async function postSystemMessage(roomId: string, content: string, conversationId?: string) {
  const API_URL = process.env.BACKEND_URL || 'http://localhost:5001'
  try {
    const message: ChatMessage = {
      id: randomUUID(),
      roomId,
      author: 'System',
      authorType: 'system',
      content,
      timestamp: new Date().toISOString(),
      conversationId
    }

    // Post to backend - it will broadcast via WebSocket
    await fetch(`${API_URL}/api/coordination/room-messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })

    console.log(`[System] Posted to #${roomId}: ${content}`)
  } catch (err) {
    console.error(`[System] Failed to post message:`, err)
  }
}

// Core function: Notify mentioned agents with turn tracking
export async function notifyMentionedAgents(
  message: ChatMessage,
  options: {
    conversationId?: string
    turnCount?: number
    fromAgent?: string
  } = {}
) {
  const mentions = message.content.match(MENTION_PATTERN)
  if (!mentions || mentions.length === 0) return

  const uniqueAgents = Array.from(new Set(mentions.map(m => m.substring(1).toLowerCase())))

  const fromAgentCanonical = options.fromAgent ? AGENT_NAMES[options.fromAgent.toLowerCase()] : null
  const targetAgents = uniqueAgents
    .map(a => AGENT_NAMES[a] || a)
    .filter(a => a !== fromAgentCanonical)
    .filter((v, i, arr) => arr.indexOf(v) === i)

  if (targetAgents.length === 0) {
    console.log(`[Notify] No valid targets after filtering self-mentions`)
    return
  }

  const conversationId = options.conversationId || message.id
  const turnCount = options.turnCount || 1

  console.log(`[Notify] Detected @mentions: ${targetAgents.join(', ')} (turn ${turnCount}/${MAX_TURNS}, convo: ${conversationId.slice(0, 8)}...)`)

  if (turnCount > MAX_TURNS) {
    console.log(`[Notify] Turn limit reached (${turnCount} > ${MAX_TURNS}), stopping conversation`)
    await postSystemMessage(
      message.roomId,
      `Warning: Turn limit reached (${MAX_TURNS} turns). Conversation paused to prevent infinite loops.`,
      conversationId
    )
    return
  }

  for (const agent of targetAgents) {
    try {
      const baseUrl = AGENT_WEBHOOKS[agent]
      if (!baseUrl) {
        console.log(`[Notify] Unknown agent: ${agent}`)
        continue
      }

      const webhookUrl = `${baseUrl}/hooks/agent`

      console.log(`[Notify] Calling ${agent} webhook at ${webhookUrl} (turn ${turnCount})`)

      const agentMessage = `[Dashboard Chat - #${message.roomId}] (Turn ${turnCount}/${MAX_TURNS})
From: ${message.author}
Message: ${message.content}

To respond to this message, call this API:
POST http://localhost:3000/api/coordination/room-messages
Content-Type: application/json
{
  "roomId": "${message.roomId}",
  "author": "${agent.charAt(0).toUpperCase() + agent.slice(1)}",
  "authorType": "agent",
  "content": "Your response here"
}

If you @mention another agent in your response, they will be notified (up to ${MAX_TURNS} turns per conversation).`

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${WEBHOOK_TOKEN}`
        },
        body: JSON.stringify({
          message: agentMessage,
          name: `Dashboard #${message.roomId}`,
          sessionKey: `dashboard:room:${message.roomId}:${conversationId}`,
          deliver: false,
          timeoutSeconds: 120,
          metadata: {
            roomId: message.roomId,
            conversationId,
            turnCount,
            fromAgent: message.author,
          }
        }),
      })

      if (response.ok) {
        const result = await response.json().catch(() => ({}))
        console.log(`[Notify] Webhook success for ${agent}:`, result.ok ? 'accepted' : result)
      } else {
        const errorText = await response.text()
        console.error(`[Notify] Webhook failed for ${agent}: ${response.status} - ${errorText}`)
      }
    } catch (err) {
      console.error(`[Notify] Failed to notify ${agent}:`, err)
    }
  }
}
