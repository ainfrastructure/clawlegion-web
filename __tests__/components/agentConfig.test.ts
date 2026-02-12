/**
 * Agent Config Tests
 *
 * Tests for utility functions in components/chat-v2/agentConfig.ts
 *
 * Run with: npx vitest run __tests__/components/agentConfig.test.ts
 */

import { describe, it, expect } from 'vitest'
import {
  ALL_AGENTS,
  COUNCIL_AGENTS,
  ARMY_AGENTS,
  AGENT_ID_SET,
  getAgentById,
  getAgentByName,
  getAgentColor,
  getAgentEmoji,
  getAgentAvatar,
  getOpenclawAgentMap,
  getAllAgentIds,
  getAgentWebhookUrl,
  getAgentNames,
  resolveAgentId,
} from '@/components/chat-v2/agentConfig'

// ---------------------------------------------------------------------------
// Agent Collections
// ---------------------------------------------------------------------------
describe('Agent Collections', () => {
  it('ALL_AGENTS includes both COUNCIL_AGENTS and ARMY_AGENTS', () => {
    expect(ALL_AGENTS.length).toBe(COUNCIL_AGENTS.length + ARMY_AGENTS.length)
  })

  it('COUNCIL_AGENTS all have tier = council', () => {
    for (const agent of COUNCIL_AGENTS) {
      expect(agent.tier).toBe('council')
    }
  })

  it('ARMY_AGENTS all have tier = army', () => {
    for (const agent of ARMY_AGENTS) {
      expect(agent.tier).toBe('army')
    }
  })

  it('AGENT_ID_SET contains all agent IDs', () => {
    for (const agent of ALL_AGENTS) {
      expect(AGENT_ID_SET.has(agent.id)).toBe(true)
    }
  })

  it('all agents have required fields', () => {
    for (const agent of ALL_AGENTS) {
      expect(agent.id).toBeTruthy()
      expect(agent.name).toBeTruthy()
      expect(agent.role).toBeTruthy()
      expect(agent.emoji).toBeTruthy()
      expect(agent.color).toBeTruthy()
      expect(agent.avatar).toBeTruthy()
      expect(agent.description).toBeTruthy()
    }
  })
})

// ---------------------------------------------------------------------------
// getAgentById
// ---------------------------------------------------------------------------
describe('getAgentById', () => {
  it('returns agent for valid ID', () => {
    const agent = getAgentById('caesar')
    expect(agent).toBeDefined()
    expect(agent?.name).toBe('Caesar')
  })

  it('returns undefined for invalid ID', () => {
    const agent = getAgentById('nonexistent')
    expect(agent).toBeUndefined()
  })

  it('is case sensitive', () => {
    const agent = getAgentById('Caesar')
    expect(agent).toBeUndefined()
  })

  it('works for army agents', () => {
    const agent = getAgentById('vulcan')
    expect(agent).toBeDefined()
    expect(agent?.role).toBe('Builder')
  })
})

// ---------------------------------------------------------------------------
// getAgentByName
// ---------------------------------------------------------------------------
describe('getAgentByName', () => {
  it('returns agent for valid name', () => {
    const agent = getAgentByName('Caesar')
    expect(agent).toBeDefined()
    expect(agent?.id).toBe('caesar')
  })

  it('is case insensitive', () => {
    const lower = getAgentByName('caesar')
    const upper = getAgentByName('CAESAR')
    const mixed = getAgentByName('CaEsAr')
    expect(lower?.id).toBe('caesar')
    expect(upper?.id).toBe('caesar')
    expect(mixed?.id).toBe('caesar')
  })

  it('returns undefined for invalid name', () => {
    const agent = getAgentByName('Nonexistent')
    expect(agent).toBeUndefined()
  })

  it('works for army agents', () => {
    const agent = getAgentByName('Athena')
    expect(agent).toBeDefined()
    expect(agent?.role).toBe('Planner')
  })
})

// ---------------------------------------------------------------------------
// getAgentColor
// ---------------------------------------------------------------------------
describe('getAgentColor', () => {
  it('returns color for valid agent', () => {
    const color = getAgentColor('caesar')
    expect(color).toBe('#DC2626')
  })

  it('returns fallback for invalid agent', () => {
    const color = getAgentColor('nonexistent')
    expect(color).toBe('#71717a')
  })

  it('returns different colors for different agents', () => {
    const caesar = getAgentColor('caesar')
    const athena = getAgentColor('athena')
    expect(caesar).not.toBe(athena)
  })
})

// ---------------------------------------------------------------------------
// getAgentEmoji
// ---------------------------------------------------------------------------
describe('getAgentEmoji', () => {
  it('returns emoji for valid agent', () => {
    const emoji = getAgentEmoji('caesar')
    expect(emoji).toBeTruthy()
  })

  it('returns robot emoji fallback for invalid agent', () => {
    const emoji = getAgentEmoji('nonexistent')
    expect(emoji).toBe('\u{1F916}')
  })
})

// ---------------------------------------------------------------------------
// getAgentAvatar
// ---------------------------------------------------------------------------
describe('getAgentAvatar', () => {
  it('returns avatar path for valid agent', () => {
    const avatar = getAgentAvatar('caesar')
    expect(avatar).toBe('/agents/caesar.png')
  })

  it('returns default avatar for invalid agent', () => {
    const avatar = getAgentAvatar('nonexistent')
    expect(avatar).toBe('/agents/default.png')
  })

  it('all agents have avatar paths starting with /agents/', () => {
    for (const agent of ALL_AGENTS) {
      expect(agent.avatar.startsWith('/agents/')).toBe(true)
    }
  })
})

// ---------------------------------------------------------------------------
// getOpenclawAgentMap
// ---------------------------------------------------------------------------
describe('getOpenclawAgentMap', () => {
  it('returns a map object', () => {
    const map = getOpenclawAgentMap()
    expect(typeof map).toBe('object')
  })

  it('maps agent IDs to openclaw IDs', () => {
    const map = getOpenclawAgentMap()
    expect(map['caesar']).toBe('main')
    expect(map['athena']).toBe('planner')
    expect(map['vulcan']).toBe('builder')
    expect(map['janus']).toBe('verifier')
  })

  it('only includes agents with openclawAgentId', () => {
    const map = getOpenclawAgentMap()
    for (const [agentId, openclawId] of Object.entries(map)) {
      const agent = getAgentById(agentId)
      expect(agent?.openclawAgentId).toBe(openclawId)
    }
  })
})

// ---------------------------------------------------------------------------
// getAllAgentIds
// ---------------------------------------------------------------------------
describe('getAllAgentIds', () => {
  it('returns array of all agent IDs', () => {
    const ids = getAllAgentIds()
    expect(Array.isArray(ids)).toBe(true)
    expect(ids.length).toBe(ALL_AGENTS.length)
  })

  it('includes caesar', () => {
    const ids = getAllAgentIds()
    expect(ids).toContain('caesar')
  })

  it('includes all council and army agents', () => {
    const ids = getAllAgentIds()
    for (const agent of ALL_AGENTS) {
      expect(ids).toContain(agent.id)
    }
  })
})

// ---------------------------------------------------------------------------
// getAgentWebhookUrl
// ---------------------------------------------------------------------------
describe('getAgentWebhookUrl', () => {
  it('returns localhost URL with port for valid agent', () => {
    const url = getAgentWebhookUrl('caesar')
    expect(url).toMatch(/^http:\/\/localhost:\d+$/)
  })

  it('returns undefined for nonexistent agent', () => {
    const url = getAgentWebhookUrl('nonexistent')
    expect(url).toBeUndefined()
  })

  it('uses correct port from agent config', () => {
    const caesarUrl = getAgentWebhookUrl('caesar')
    expect(caesarUrl).toBe('http://localhost:18789')
  })
})

// ---------------------------------------------------------------------------
// getAgentNames
// ---------------------------------------------------------------------------
describe('getAgentNames', () => {
  it('returns a map object', () => {
    const names = getAgentNames()
    expect(typeof names).toBe('object')
  })

  it('includes agent IDs', () => {
    const names = getAgentNames()
    expect(names['caesar']).toBe('caesar')
    expect(names['athena']).toBe('athena')
  })

  it('includes lowercase agent names', () => {
    const names = getAgentNames()
    expect(names['caesar']).toBe('caesar')
  })

  it('includes legacy aliases', () => {
    const names = getAgentNames()
    // jarvis is a legacy alias for caesar
    expect(names['jarvis']).toBe('caesar')
    // vex is a legacy alias for janus
    expect(names['vex']).toBe('janus')
  })

  it('includes openclaw agent IDs', () => {
    const names = getAgentNames()
    expect(names['main']).toBe('caesar')
    expect(names['planner']).toBe('athena')
    expect(names['builder']).toBe('vulcan')
  })
})

// ---------------------------------------------------------------------------
// resolveAgentId
// ---------------------------------------------------------------------------
describe('resolveAgentId', () => {
  it('resolves canonical IDs to themselves', () => {
    expect(resolveAgentId('caesar')).toBe('caesar')
    expect(resolveAgentId('athena')).toBe('athena')
  })

  it('is case insensitive', () => {
    expect(resolveAgentId('CAESAR')).toBe('caesar')
    expect(resolveAgentId('Caesar')).toBe('caesar')
  })

  it('resolves legacy aliases', () => {
    expect(resolveAgentId('jarvis')).toBe('caesar')
    expect(resolveAgentId('vex')).toBe('janus')
    expect(resolveAgentId('archie')).toBe('athena')
    expect(resolveAgentId('mason')).toBe('vulcan')
  })

  it('resolves openclaw agent IDs', () => {
    expect(resolveAgentId('main')).toBe('caesar')
    expect(resolveAgentId('planner')).toBe('athena')
    expect(resolveAgentId('builder')).toBe('vulcan')
    expect(resolveAgentId('verifier')).toBe('janus')
  })

  it('returns undefined for unknown aliases', () => {
    expect(resolveAgentId('unknown')).toBeUndefined()
    expect(resolveAgentId('random')).toBeUndefined()
  })
})
