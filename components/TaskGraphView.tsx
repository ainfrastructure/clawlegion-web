'use client';

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
  NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Types
interface TaskNode {
  id: string;
  title: string;
  status: string;
  progress: number;
  assignedTo?: string;
  parentId?: string;
  isLeaf: boolean;
  canStart: boolean;
  level: number;
  x?: number;
  y?: number;
}

interface TaskEdge {
  from: string;
  to: string;
  type: 'dependency' | 'parent-child' | 'soft';
}

interface GraphData {
  nodes: TaskNode[];
  edges: TaskEdge[];
  summary: {
    total: number;
    roots: number;
    leaves: number;
    byStatus: Record<string, number>;
  };
}

// Status colors - HIGH CONTRAST for readability
// High-contrast color scheme for dark backgrounds
const statusColors: Record<string, { bg: string; border: string; text: string }> = {
  queued: { bg: '#374151', border: '#9ca3af', text: '#f9fafb' },           // Gray - waiting
  assigned: { bg: '#1e40af', border: '#60a5fa', text: '#ffffff' },         // Blue - claimed
  'in-progress': { bg: '#c2410c', border: '#fb923c', text: '#ffffff' },    // Orange - active
  'pending-review': { bg: '#6d28d9', border: '#a78bfa', text: '#ffffff' }, // Purple - review
  completed: { bg: '#15803d', border: '#4ade80', text: '#ffffff' },        // Green - done
  failed: { bg: '#b91c1c', border: '#f87171', text: '#ffffff' },           // Red - error
  rejected: { bg: '#9f1239', border: '#fb7185', text: '#ffffff' },         // Rose - rejected
};

// Custom Task Node Component
interface TaskNodeData {
  title: string;
  status: string;
  progress: number;
  assignedTo?: string;
  parentId?: string;
  isLeaf: boolean;
  canStart: boolean;
}

function TaskNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as TaskNodeData;
  const colors = statusColors[nodeData.status] || statusColors.queued;
  
  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: '8px',
        backgroundColor: colors.bg,
        border: `2px solid ${selected ? '#2563eb' : colors.border}`,
        boxShadow: selected ? '0 0 0 2px rgba(37, 99, 235, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
        minWidth: '180px',
        maxWidth: '250px',
        transition: 'all 0.2s ease',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: colors.border }} />
      
      {/* Title */}
      <div style={{ fontWeight: 600, color: colors.text, fontSize: '13px', marginBottom: '6px' }}>
        {nodeData.title}
      </div>
      
      {/* Status badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <span
          style={{
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '9999px',
            backgroundColor: colors.border,
            color: 'white',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}
        >
          {nodeData.status}
        </span>
        {nodeData.assignedTo ? (
          <span style={{ fontSize: '11px', color: '#cbd5e1' }}>
            @{nodeData.assignedTo}
          </span>
        ) : null}
      </div>
      
      {/* Progress bar */}
      {nodeData.progress > 0 && (
        <div style={{ marginTop: '8px' }}>
          <div
            style={{
              height: '4px',
              backgroundColor: '#e5e7eb',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${nodeData.progress}%`,
                backgroundColor: colors.border,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <div style={{ fontSize: '10px', color: '#e2e8f0', marginTop: '2px' }}>
            {nodeData.progress}% complete
          </div>
        </div>
      )}
      
      {/* Indicators */}
      <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
        {nodeData.isLeaf && (
          <span title="Leaf task (actionable)" style={{ fontSize: '12px' }}>🍃</span>
        )}
        {!nodeData.canStart && nodeData.status !== 'completed' && (
          <span title="Blocked by dependencies" style={{ fontSize: '12px' }}>🔒</span>
        )}
        {nodeData.parentId && (
          <span title="Subtask" style={{ fontSize: '12px' }}>📎</span>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} style={{ background: colors.border }} />
    </div>
  );
}

const nodeTypes = {
  task: TaskNodeComponent,
};

// Edge styles
// Edge styles - bright colors for dark background
const edgeStyles: Record<string, React.CSSProperties> = {
  dependency: { stroke: '#f87171', strokeWidth: 2 },         // Red - blocking
  'parent-child': { stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '5,5' },  // Gray - hierarchy
  soft: { stroke: '#4ade80', strokeWidth: 1, strokeDasharray: '3,3' },  // Green - soft dep
};

interface TaskGraphViewProps {
  onNodeClick?: (taskId: string) => void;
  onRefresh?: () => void;
  refreshInterval?: number;
  showMiniMap?: boolean;
  showControls?: boolean;
}

export default function TaskGraphView({
  onNodeClick,
  onRefresh,
  refreshInterval = 5000,
  showMiniMap = true,
  showControls = true,
}: TaskGraphViewProps) {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Fetch graph data
  const fetchGraph = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks/graph?all=true');
      if (!res.ok) throw new Error('Failed to fetch graph');
      const data: GraphData = await res.json();
      setGraphData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and polling
  useEffect(() => {
    fetchGraph();
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetchGraph, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchGraph, refreshInterval]);

  // Convert graph data to React Flow format
  useEffect(() => {
    if (!graphData) return;

    const flowNodes: Node[] = graphData.nodes.map((node) => ({
      id: node.id,
      type: 'task',
      position: { x: node.x ?? 0, y: node.y ?? 0 },
      data: {
        title: node.title,
        status: node.status,
        progress: node.progress,
        assignedTo: node.assignedTo,
        parentId: node.parentId,
        isLeaf: node.isLeaf,
        canStart: node.canStart,
      },
    }));

    const flowEdges: Edge[] = graphData.edges.map((edge, idx) => ({
      id: `edge-${idx}`,
      source: edge.from,
      target: edge.to,
      type: 'smoothstep',
      animated: edge.type === 'dependency',
      style: edgeStyles[edge.type] || edgeStyles.dependency,
      markerEnd: edge.type === 'dependency' ? {
        type: MarkerType.ArrowClosed,
        color: '#ef4444',
      } : undefined,
      label: edge.type === 'dependency' ? 'blocks' : edge.type === 'soft' ? 'soft' : undefined,
      labelStyle: { fontSize: 10, fill: '#6b7280' },
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [graphData, setNodes, setEdges]);

  // Handle node click
  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (onNodeClick) {
        onNodeClick(node.id);
      }
    },
    [onNodeClick]
  );

  // Summary stats
  const summary = useMemo(() => {
    if (!graphData) return null;
    return graphData.summary;
  }, [graphData]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
          <div style={{ color: '#6b7280' }}>Loading task graph...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center', color: '#ef4444' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>❌</div>
          <div>Error: {error}</div>
          <button
            onClick={fetchGraph}
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Summary bar */}
      {summary && (
        <div
          style={{
            display: 'flex',
            gap: '16px',
            padding: '12px 16px',
            backgroundColor: '#1e293b',
            borderBottom: '1px solid #334155',
            fontSize: '13px',
            flexWrap: 'wrap',
            alignItems: 'center',
            color: '#e2e8f0',
          }}
        >
          <span><strong>{summary.total}</strong> tasks</span>
          <span style={{ color: '#9ca3af', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: statusColors.queued.border }} />
            {summary.byStatus.queued || 0} queued
          </span>
          <span style={{ color: '#60a5fa', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: statusColors.assigned.border }} />
            {summary.byStatus.assigned || 0} assigned
          </span>
          <span style={{ color: '#fb923c', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: statusColors['in-progress'].border }} />
            {summary.byStatus.inProgress || 0} in progress
          </span>
          {(summary.byStatus.pendingReview || 0) > 0 && (
            <span style={{ color: '#a78bfa', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: statusColors['pending-review'].border }} />
              {summary.byStatus.pendingReview} review
            </span>
          )}
          <span style={{ color: '#4ade80', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: statusColors.completed.border }} />
            {summary.byStatus.completed || 0} done
          </span>
          {(summary.byStatus.rejected || 0) > 0 && (
            <span style={{ color: '#fb7185', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: statusColors.rejected.border }} />
              {summary.byStatus.rejected} rejected
            </span>
          )}
          <button
            onClick={() => { fetchGraph(); onRefresh?.(); }}
            style={{
              marginLeft: 'auto',
              padding: '4px 12px',
              backgroundColor: '#334155',
              color: '#e2e8f0',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            🔄 Refresh
          </button>
        </div>
      )}

      {/* Graph view */}
      <div style={{ flex: 1, minHeight: '400px', backgroundColor: '#0f172a' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          defaultEdgeOptions={{
            type: 'smoothstep',
          }}
        >
          {showControls && <Controls style={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />}
          <Background color="#334155" gap={16} />
          {showMiniMap && (
            <MiniMap
              nodeColor={(node) => {
                const status = node.data?.status as string;
                return statusColors[status]?.border || '#9ca3af';
              }}
              maskColor="rgba(0,0,0,0.5)"
              style={{ backgroundColor: '#1e293b' }}
            />
          )}
        </ReactFlow>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          padding: '8px 16px',
          backgroundColor: '#1e293b',
          borderTop: '1px solid #334155',
          fontSize: '11px',
          color: '#94a3b8',
          flexWrap: 'wrap',
        }}
      >
        <span>🍃 Leaf (actionable)</span>
        <span>🔒 Blocked</span>
        <span>📎 Subtask</span>
        <span style={{ color: '#f87171' }}>━━▶ blocks</span>
        <span style={{ color: '#94a3b8' }}>┄┄┄ parent-child</span>
        <span style={{ color: '#4ade80' }}>╌╌╌ soft dependency</span>
      </div>
    </div>
  );
}
