'use client'

import { useMemo, useState, useEffect } from 'react'
import type { Node, Edge } from '@xyflow/react'
import type { PipelineStep } from '@/components/flow-config/types'
import { AGENT_METADATA } from '@/lib/flow-presets'
import { getAgentById } from '@/components/chat-v2/agentConfig'
import type { FlowAgentNodeData } from './FlowAgentNode'
import type { FlowEdgeData } from './FlowEdge'

const NODE_WIDTH = 180
const NODE_HEIGHT = 160
const NODE_SEP = 100
const RANK_SEP = 100

let dagreModule: typeof import('dagre') | null = null

export function useFlowLayout(steps: PipelineStep[]) {
  const [dagreReady, setDagreReady] = useState(!!dagreModule)

  useEffect(() => {
    if (!dagreModule) {
      import('@dagrejs/dagre').then((mod) => {
        dagreModule = mod.default || mod
        setDagreReady(true)
      })
    }
  }, [])

  return useMemo(() => {
    const sorted = [...steps].sort((a, b) => a.order - b.order)

    if (sorted.length === 0 || !dagreReady || !dagreModule) {
      return { nodes: [] as Node<FlowAgentNodeData>[], edges: [] as Edge[] }
    }

    const g = new dagreModule.graphlib.Graph()
    g.setGraph({ rankdir: 'LR', nodesep: NODE_SEP, ranksep: RANK_SEP })
    g.setDefaultEdgeLabel(() => ({}))

    sorted.forEach((step: PipelineStep) => {
      g.setNode(step.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
    })

    sorted.forEach((step: PipelineStep, i: number) => {
      if (i > 0) {
        g.setEdge(sorted[i - 1].id, step.id)
      }
    })

    dagreModule.layout(g)

    const nodes: Node<FlowAgentNodeData>[] = sorted.map((step) => {
      const pos = g.node(step.id)
      const meta = AGENT_METADATA[step.role]
      const agent = getAgentById(step.role)

      return {
        id: step.id,
        type: 'flowAgent',
        position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
        data: {
          role: step.role,
          agentName: meta?.name || agent?.name || step.role,
          avatar: agent?.avatar,
          agentColor: agent?.color || '#64748b',
          resourceLevel: step.resourceLevel,
          enabled: step.enabled,
          order: step.order,
          hasContext: !!step.context,
          stepId: step.id,
        },
      }
    })

    const edges: Edge[] = sorted.slice(1).map((step, i) => {
      const source = sorted[i]
      const sourceAgent = getAgentById(source.role)

      return {
        id: `e-${source.id}-${step.id}`,
        source: source.id,
        target: step.id,
        type: 'flow',
        data: {
          sourceColor: sourceAgent?.color || '#64748b',
        } satisfies FlowEdgeData,
      }
    })

    return { nodes, edges }
  }, [steps, dagreReady])
}
