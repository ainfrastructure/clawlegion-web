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
import dagre from '@dagrejs/dagre';

// Types
interface SubtaskData {
  id: string;
  title: string;
  shortId?: string;
  status: string;
  priority: string;
  assignee?: string;
}

interface TaskNode {
  id: string;
  title: string;
  shortId?: string;
  status: string;
  priority: string;
  progress: number;
  assignedTo?: string;
  parentId?: string | null;
  isLeaf: boolean;
  canStart: boolean;
  subtaskCount: number;
  subtasksDone: number;
  subtasks: SubtaskData[];
  level: number;
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
    subtasks: number;
    byStatus: Record<string, number>;
  };
}

// Status colors
const statusColors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  backlog:      { bg: '#1e293b', border: '#475569', text: '#f1f5f9', dot: '#64748b' },
  todo:         { bg: '#1e3a5f', border: '#3b82f6', text: '#ffffff', dot: '#3b82f6' },
  in_progress:  { bg: '#422006', border: '#f59e0b', text: '#ffffff', dot: '#f59e0b' },
  building:     { bg: '#422006', border: '#f59e0b', text: '#ffffff', dot: '#f59e0b' },
  researching:  { bg: '#3b0764', border: '#a855f7', text: '#ffffff', dot: '#a855f7' },
  planning:     { bg: '#3b0764', border: '#a855f7', text: '#ffffff', dot: '#a855f7' },
  verifying:    { bg: '#312e81', border: '#818cf8', text: '#ffffff', dot: '#818cf8' },
  done:         { bg: '#052e16', border: '#22c55e', text: '#ffffff', dot: '#22c55e' },
  completed:    { bg: '#052e16', border: '#22c55e', text: '#ffffff', dot: '#22c55e' },
  failed:       { bg: '#450a0a', border: '#ef4444', text: '#ffffff', dot: '#ef4444' },
};

// Priority colors
const priorityDots: Record<string, string> = {
  P0: '#ef4444',
  P1: '#f97316',
  P2: '#f59e0b',
  P3: '#3b82f6',
};

// ============================
// Node type: taskGroup (parent with subtasks)
// ============================
function TaskGroupComponent({ data, selected }: NodeProps) {
  const d = data as unknown as {
    title: string; shortId: string; status: string; priority: string;
    assignedTo: string; progress: number; subtaskCount: number; subtasksDone: number;
    subtasks: SubtaskData[]; expanded: boolean;
  };
  const colors = statusColors[d.status] || statusColors.backlog;
  const [expanded, setExpanded] = useState(d.expanded !== false);
  const prioDot = priorityDots[d.priority] || priorityDots.P2;

  return (
    <div
      style={{
        minWidth: '260px',
        maxWidth: '320px',
        borderRadius: '12px',
        backgroundColor: '#0f172a',
        border: `2px solid ${selected ? '#6366f1' : colors.border}`,
        boxShadow: selected
          ? '0 0 0 3px rgba(99, 102, 241, 0.3)'
          : '0 2px 8px rgba(0,0,0,0.3)',
        overflow: 'hidden',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: colors.border }} />

      {/* Header bar */}
      <div
        style={{
          padding: '10px 14px',
          backgroundColor: colors.bg,
          borderBottom: `1px solid ${colors.border}40`,
          borderLeft: `4px solid ${colors.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          {d.shortId && (
            <span style={{
              fontSize: '10px', fontFamily: 'monospace', fontWeight: 700,
              padding: '1px 6px', borderRadius: '4px',
              backgroundColor: 'rgba(168,85,247,0.2)', color: '#c084fc',
            }}>
              {d.shortId}
            </span>
          )}
          <span style={{
            width: '8px', height: '8px', borderRadius: '50%',
            backgroundColor: prioDot, flexShrink: 0,
          }} title={d.priority} />
          <span style={{
            fontSize: '10px', padding: '1px 6px', borderRadius: '9999px',
            backgroundColor: colors.border + '40', color: colors.text,
            textTransform: 'uppercase', fontWeight: 500,
          }}>
            {d.status.replace('_', ' ')}
          </span>
          {d.assignedTo && (
            <span style={{ fontSize: '10px', color: '#94a3b8', marginLeft: 'auto' }}>
              @{d.assignedTo}
            </span>
          )}
        </div>
        <div style={{ fontWeight: 600, color: colors.text, fontSize: '13px' }}>
          {d.title}
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            flex: 1, height: '4px', backgroundColor: '#334155',
            borderRadius: '2px', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${d.progress}%`,
              backgroundColor: '#22c55e', transition: 'width 0.3s ease',
            }} />
          </div>
          <span style={{ fontSize: '10px', color: '#94a3b8' }}>
            {d.subtasksDone}/{d.subtaskCount}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#94a3b8', fontSize: '14px', padding: '0 2px',
            }}
          >
            {expanded ? '▾' : '▸'}
          </button>
        </div>
      </div>

      {/* Subtask rows (expandable) */}
      {expanded && d.subtasks && d.subtasks.length > 0 && (
        <div style={{ padding: '4px 0' }}>
          {d.subtasks.map((sub) => {
            const subColors = statusColors[sub.status] || statusColors.backlog;
            const subPrioDot = priorityDots[sub.priority] || priorityDots.P2;
            const isDone = sub.status === 'done' || sub.status === 'completed';
            return (
              <div
                key={sub.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '5px 14px', fontSize: '11px',
                  borderLeft: `3px solid ${subColors.dot}`,
                  opacity: isDone ? 0.6 : 1,
                }}
              >
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  backgroundColor: subColors.dot, flexShrink: 0,
                }} />
                <span style={{
                  flex: 1, color: '#cbd5e1',
                  textDecoration: isDone ? 'line-through' : 'none',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {sub.title}
                </span>
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  backgroundColor: subPrioDot, flexShrink: 0,
                }} title={sub.priority} />
              </div>
            );
          })}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ background: colors.border }} />
    </div>
  );
}

// ============================
// Node type: standaloneTask (root task with no subtasks)
// ============================
function StandaloneTaskComponent({ data, selected }: NodeProps) {
  const d = data as unknown as {
    title: string; shortId: string; status: string; priority: string;
    assignedTo: string; isLeaf: boolean;
  };
  const colors = statusColors[d.status] || statusColors.backlog;
  const prioDot = priorityDots[d.priority] || priorityDots.P2;

  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: '10px',
        backgroundColor: colors.bg,
        border: `2px solid ${selected ? '#6366f1' : colors.border}`,
        borderLeft: `5px solid ${colors.border}`,
        boxShadow: selected
          ? '0 0 0 3px rgba(99, 102, 241, 0.3)'
          : '0 1px 4px rgba(0,0,0,0.2)',
        minWidth: '200px',
        maxWidth: '260px',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: colors.border }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
        {d.shortId && (
          <span style={{
            fontSize: '10px', fontFamily: 'monospace', fontWeight: 700,
            padding: '1px 6px', borderRadius: '4px',
            backgroundColor: 'rgba(168,85,247,0.2)', color: '#c084fc',
          }}>
            {d.shortId}
          </span>
        )}
        <span style={{
          width: '8px', height: '8px', borderRadius: '50%',
          backgroundColor: prioDot, flexShrink: 0,
        }} title={d.priority} />
        <span style={{
          fontSize: '10px', padding: '1px 6px', borderRadius: '9999px',
          backgroundColor: colors.border + '40', color: colors.text,
          textTransform: 'uppercase', fontWeight: 500,
        }}>
          {d.status.replace('_', ' ')}
        </span>
      </div>

      <div style={{ fontWeight: 600, color: colors.text, fontSize: '13px', marginBottom: '4px' }}>
        {d.title}
      </div>

      {d.assignedTo && (
        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
          @{d.assignedTo}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ background: colors.border }} />
    </div>
  );
}

// ============================
// Node type: subtask (compact row - only used if rendering subtasks as separate nodes)
// ============================
function SubtaskNodeComponent({ data, selected }: NodeProps) {
  const d = data as unknown as {
    title: string; shortId: string; status: string; priority: string;
    assignedTo: string;
  };
  const colors = statusColors[d.status] || statusColors.backlog;
  const prioDot = priorityDots[d.priority] || priorityDots.P2;

  return (
    <div
      style={{
        padding: '6px 12px',
        borderRadius: '6px',
        backgroundColor: '#1e293b',
        border: `1px solid ${selected ? '#6366f1' : colors.border}50`,
        borderLeft: `3px solid ${colors.dot}`,
        minWidth: '160px',
        maxWidth: '220px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: colors.border, width: 6, height: 6 }} />
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%',
        backgroundColor: colors.dot, flexShrink: 0,
      }} />
      <span style={{
        flex: 1, fontSize: '11px', color: '#cbd5e1',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {d.title}
      </span>
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%',
        backgroundColor: prioDot, flexShrink: 0,
      }} />
      <Handle type="source" position={Position.Bottom} style={{ background: colors.border, width: 6, height: 6 }} />
    </div>
  );
}

const nodeTypes = {
  taskGroup: TaskGroupComponent,
  standaloneTask: StandaloneTaskComponent,
  subtask: SubtaskNodeComponent,
};

// Edge styles
const edgeStyles: Record<string, React.CSSProperties> = {
  dependency: { stroke: '#ef4444', strokeWidth: 2 },
  'parent-child': { stroke: '#475569', strokeWidth: 1, strokeDasharray: '5,5' },
  soft: { stroke: '#4ade80', strokeWidth: 1, strokeDasharray: '3,3' },
};

// Dagre layout helper
function getLayoutedElements(nodes: Node[], edges: Edge[], direction = 'TB') {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 60, ranksep: 80 });

  nodes.forEach((node) => {
    // Estimate node dimensions based on type
    const width = node.type === 'taskGroup' ? 300 : node.type === 'subtask' ? 200 : 240;
    const height = node.type === 'taskGroup' ? 160 : node.type === 'subtask' ? 40 : 100;
    g.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);
    const width = node.type === 'taskGroup' ? 300 : node.type === 'subtask' ? 200 : 240;
    const height = node.type === 'taskGroup' ? 160 : node.type === 'subtask' ? 40 : 100;
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

// ============================
// Main component
// ============================
interface TaskGraphViewProps {
  onNodeClick?: (taskId: string) => void;
  onRefresh?: () => void;
  refreshInterval?: number;
  showMiniMap?: boolean;
  showControls?: boolean;
  statusFilter?: string[];
  searchQuery?: string;
}

export default function TaskGraphView({
  onNodeClick,
  onRefresh,
  refreshInterval = 5000,
  showMiniMap = true,
  showControls = true,
  statusFilter,
  searchQuery,
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

  // Convert graph data to React Flow format with dagre layout
  useEffect(() => {
    if (!graphData) return;

    let filteredNodes = graphData.nodes;

    // Apply status filter
    if (statusFilter && statusFilter.length > 0) {
      filteredNodes = filteredNodes.filter(
        (n) => statusFilter.includes(n.status) || (n.parentId && statusFilter.some(s => s === 'subtask'))
      );
    }

    // Apply search filter
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchingIds = new Set(
        filteredNodes
          .filter((n) =>
            n.title.toLowerCase().includes(q) ||
            (n.shortId && n.shortId.toLowerCase().includes(q))
          )
          .map((n) => n.id)
      );
      // Also include parents/children of matching nodes
      filteredNodes.forEach((n) => {
        if (matchingIds.has(n.id) && n.parentId) matchingIds.add(n.parentId);
        if (matchingIds.has(n.id) && n.subtasks) {
          n.subtasks.forEach((s) => matchingIds.add(s.id));
        }
      });
      filteredNodes = filteredNodes.filter((n) => matchingIds.has(n.id));
    }

    const filteredIds = new Set(filteredNodes.map((n) => n.id));

    // Build parent tasks as taskGroup nodes (subtasks rendered inside, not as separate nodes)
    const flowNodes: Node[] = filteredNodes
      .filter((node) => !node.parentId) // Only root-level nodes
      .map((node) => {
        const hasSubtasks = node.subtaskCount > 0;
        return {
          id: node.id,
          type: hasSubtasks ? 'taskGroup' : 'standaloneTask',
          position: { x: 0, y: 0 },
          data: {
            title: node.title,
            shortId: node.shortId || '',
            status: node.status,
            priority: node.priority,
            progress: node.progress,
            assignedTo: node.assignedTo || '',
            isLeaf: node.isLeaf,
            canStart: node.canStart,
            subtaskCount: node.subtaskCount,
            subtasksDone: node.subtasksDone,
            subtasks: node.subtasks || [],
            expanded: true,
          },
        };
      });

    // Build edges (only between root-level nodes, skip parent-child since they're rendered inline)
    const flowEdges: Edge[] = graphData.edges
      .filter((edge) => edge.type !== 'parent-child') // Skip parent-child, rendered inline
      .filter((edge) => filteredIds.has(edge.from) && filteredIds.has(edge.to))
      .filter((edge) => {
        // Only include edges between root-level nodes
        const fromNode = graphData.nodes.find((n) => n.id === edge.from);
        const toNode = graphData.nodes.find((n) => n.id === edge.to);
        return fromNode && toNode && !fromNode.parentId && !toNode.parentId;
      })
      .map((edge, idx) => ({
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
        labelStyle: { fontSize: 10, fill: '#94a3b8' },
        labelBgStyle: { fill: '#0f172a', fillOpacity: 0.8 },
      }));

    // Apply dagre layout
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      flowNodes,
      flowEdges,
      'TB'
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [graphData, statusFilter, searchQuery, setNodes, setEdges]);

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
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>...</div>
          <div style={{ color: '#94a3b8' }}>Loading task graph...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center', color: '#ef4444' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>Error</div>
          <div>{error}</div>
          <button
            onClick={fetchGraph}
            style={{
              marginTop: '12px', padding: '8px 16px',
              backgroundColor: '#3b82f6', color: 'white',
              border: 'none', borderRadius: '6px', cursor: 'pointer',
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
      {/* Summary stats bar */}
      {summary && (
        <div
          style={{
            display: 'flex',
            gap: '12px',
            padding: '10px 16px',
            backgroundColor: '#0f172a',
            borderBottom: '1px solid #1e293b',
            fontSize: '12px',
            flexWrap: 'wrap',
            alignItems: 'center',
            color: '#e2e8f0',
          }}
        >
          <span><strong>{summary.total}</strong> tasks</span>
          <span><strong>{summary.roots}</strong> root</span>
          {summary.subtasks > 0 && <span><strong>{summary.subtasks}</strong> subtasks</span>}
          <span style={{ marginLeft: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Stacked status breakdown */}
            {Object.entries(summary.byStatus).map(([status, count]) => {
              if (count === 0) return null;
              const colors = statusColors[status] || statusColors.backlog;
              return (
                <span key={status} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: colors.border }}>
                  <span style={{
                    display: 'inline-block', width: '8px', height: '8px',
                    borderRadius: '50%', backgroundColor: colors.dot,
                  }} />
                  <strong>{count}</strong> {status.replace('_', ' ')}
                </span>
              );
            })}
          </span>
          <button
            onClick={() => { fetchGraph(); onRefresh?.(); }}
            style={{
              marginLeft: 'auto', padding: '4px 12px',
              backgroundColor: '#1e293b', color: '#e2e8f0',
              border: '1px solid #334155', borderRadius: '4px',
              cursor: 'pointer', fontSize: '11px',
            }}
          >
            Refresh
          </button>
        </div>
      )}

      {/* Graph view */}
      <div style={{ flex: 1, minHeight: '400px', backgroundColor: '#020617' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          defaultEdgeOptions={{ type: 'smoothstep' }}
          proOptions={{ hideAttribution: true }}
        >
          {showControls && <Controls style={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />}
          <Background color="#1e293b" gap={20} />
          {showMiniMap && (
            <MiniMap
              nodeColor={(node) => {
                const status = (node.data as any)?.status as string;
                return statusColors[status]?.dot || '#475569';
              }}
              maskColor="rgba(0,0,0,0.6)"
              style={{ backgroundColor: '#0f172a' }}
            />
          )}
        </ReactFlow>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          padding: '6px 16px',
          backgroundColor: '#0f172a',
          borderTop: '1px solid #1e293b',
          fontSize: '10px',
          color: '#64748b',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} /> P0
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f97316' }} /> P1
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} /> P2
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }} /> P3
        </span>
        <span style={{ color: '#ef4444' }}>━━▶ blocks</span>
        <span style={{ color: '#475569' }}>┄┄┄ parent-child</span>
        <span style={{ color: '#4ade80' }}>╌╌╌ soft dep</span>
      </div>
    </div>
  );
}
