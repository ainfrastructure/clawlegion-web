'use client';

import { ReactFlow, Controls, Background, ReactFlowProvider, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { AgentNode } from './AgentNode';
import { WorkflowEdge } from './WorkflowEdge';
import { useWorkflowLayout } from './useWorkflowLayout';
import type { AgentStatus } from './types';

const nodeTypes = { agent: AgentNode };
const edgeTypes = { workflow: WorkflowEdge };

interface PipelineViewProps {
  statuses?: Record<string, AgentStatus>;
  sessionId?: string;
}

function PipelineViewInner({ statuses }: PipelineViewProps) {
  const { nodes, edges } = useWorkflowLayout({ statuses });

  return (
    <div className="h-[320px] w-full rounded-lg border bg-slate-50 shadow-inner">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        defaultEdgeOptions={{
          type: 'workflow',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#94A3B8',
          },
        }}
      >
        <Background color="#CBD5E1" gap={20} size={1} />
      </ReactFlow>
    </div>
  );
}

export function PipelineView(props: PipelineViewProps) {
  return (
    <ReactFlowProvider>
      <PipelineViewInner {...props} />
    </ReactFlowProvider>
  );
}
