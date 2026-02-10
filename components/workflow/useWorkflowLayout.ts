'use client';

import { useMemo } from 'react';
import dagre from '@dagrejs/dagre';
import type { Node, Edge } from '@xyflow/react';
import type { AgentNodeData, AgentStatus } from './types';

const AGENT_STEPS = [
  { id: 'athena', name: 'Athena', role: 'Plan', avatar: '/agents/athena.png', primaryColor: '#06B6D4', secondaryColor: '#67E8F9' },
  { id: 'vulcan', name: 'Vulcan', role: 'Build', avatar: '/agents/vulcan.png', primaryColor: '#EA580C', secondaryColor: '#FCD34D' },
  { id: 'sentinel', name: 'Sentinel', role: 'Scan', avatar: '/agents/minerva.png', primaryColor: '#3B82F6', secondaryColor: '#93C5FD' },
  { id: 'critic', name: 'Critic', role: 'Review', avatar: '/agents/athena.png', primaryColor: '#991B1B', secondaryColor: '#FCA5A5' },
  { id: 'janus', name: 'Janus', role: 'Verify', avatar: '/agents/janus.png', primaryColor: '#10B981', secondaryColor: '#6EE7B7' },
  { id: 'deploy', name: 'Deploy', role: 'Deploy', avatar: '/agents/minerva.png', primaryColor: '#EA580C', secondaryColor: '#FDBA74' },
  { id: 'scribe', name: 'Scribe', role: 'Docs', avatar: '/agents/athena.png', primaryColor: '#78350F', secondaryColor: '#D6BCAB' },
];

interface UseWorkflowLayoutProps {
  statuses?: Record<string, AgentStatus>;
}

export function useWorkflowLayout({ statuses = {} }: UseWorkflowLayoutProps = {}) {
  return useMemo(() => {
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: 'LR', nodesep: 80, ranksep: 80 });
    g.setDefaultEdgeLabel(() => ({}));

    // Add nodes to dagre
    AGENT_STEPS.forEach((step) => {
      g.setNode(step.id, { width: 120, height: 140 });
    });

    // Add edges
    AGENT_STEPS.forEach((step, i) => {
      if (i > 0) {
        g.setEdge(AGENT_STEPS[i - 1].id, step.id);
      }
    });

    dagre.layout(g);

    // Convert to React Flow nodes
    const nodes: Node<AgentNodeData>[] = AGENT_STEPS.map((step) => {
      const pos = g.node(step.id);
      return {
        id: step.id,
        type: 'agent',
        position: { x: pos.x - 60, y: pos.y - 70 },
        data: {
          agent: step.name,
          role: step.role,
          avatar: step.avatar,
          status: statuses[step.id] || 'pending',
          primaryColor: step.primaryColor,
          secondaryColor: step.secondaryColor,
        },
      };
    });

    // Convert to React Flow edges
    const edges: Edge[] = AGENT_STEPS.slice(1).map((step, i) => {
      const source = AGENT_STEPS[i];
      const sourceStatus = statuses[source.id] || 'pending';
      
      return {
        id: `e-${source.id}-${step.id}`,
        source: source.id,
        target: step.id,
        type: 'workflow',
        animated: sourceStatus === 'in-progress' || sourceStatus === 'success',
        markerEnd: { type: 'arrowclosed' as const },
      };
    });

    return { nodes, edges };
  }, [statuses]);
}
