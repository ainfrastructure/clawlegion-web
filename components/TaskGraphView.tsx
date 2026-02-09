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
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

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

// Status colors — exported for reuse in page.tsx sidebar
export const statusColors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
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
      className="min-w-[260px] max-w-[320px] rounded-xl bg-slate-900 overflow-hidden"
      style={{
        border: `2px solid ${selected ? '#6366f1' : colors.border}`,
        boxShadow: selected
          ? '0 0 0 3px rgba(99, 102, 241, 0.3)'
          : '0 2px 8px rgba(0,0,0,0.3)',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: colors.border }} />

      {/* Header bar */}
      <div
        className="px-3.5 py-2.5"
        style={{
          backgroundColor: colors.bg,
          borderBottom: `1px solid ${colors.border}40`,
          borderLeft: `4px solid ${colors.border}`,
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          {d.shortId && (
            <span className="text-[10px] font-mono font-bold px-1.5 py-px rounded bg-purple-500/20 text-purple-400">
              {d.shortId}
            </span>
          )}
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: prioDot }}
            title={d.priority}
          />
          <span
            className="text-[10px] px-1.5 py-px rounded-full uppercase font-medium"
            style={{ backgroundColor: colors.border + '40', color: colors.text }}
          >
            {d.status.replace('_', ' ')}
          </span>
          {d.assignedTo && (
            <span className="text-[10px] text-slate-400 ml-auto">
              @{d.assignedTo}
            </span>
          )}
        </div>
        <div className="font-semibold text-[13px]" style={{ color: colors.text }}>
          {d.title}
        </div>

        {/* Progress bar */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${d.progress}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400">
            {d.subtasksDone}/{d.subtaskCount}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="bg-transparent border-none cursor-pointer text-slate-400 text-sm px-0.5 hover:text-slate-200"
          >
            {expanded ? '▾' : '▸'}
          </button>
        </div>
      </div>

      {/* Subtask rows (expandable) */}
      {expanded && d.subtasks && d.subtasks.length > 0 && (
        <div className="py-1">
          {d.subtasks.map((sub) => {
            const subColors = statusColors[sub.status] || statusColors.backlog;
            const subPrioDot = priorityDots[sub.priority] || priorityDots.P2;
            const isDone = sub.status === 'done' || sub.status === 'completed';
            return (
              <div
                key={sub.id}
                className="flex items-center gap-1.5 py-1 px-3.5 text-[11px]"
                style={{
                  borderLeft: `3px solid ${subColors.dot}`,
                  opacity: isDone ? 0.6 : 1,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: subColors.dot }}
                />
                <span
                  className="flex-1 text-slate-300 overflow-hidden text-ellipsis whitespace-nowrap"
                  style={{ textDecoration: isDone ? 'line-through' : 'none' }}
                >
                  {sub.title}
                </span>
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: subPrioDot }}
                  title={sub.priority}
                />
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
      className="py-3 px-4 rounded-[10px] min-w-[200px] max-w-[260px]"
      style={{
        backgroundColor: colors.bg,
        border: `2px solid ${selected ? '#6366f1' : colors.border}`,
        borderLeft: `5px solid ${colors.border}`,
        boxShadow: selected
          ? '0 0 0 3px rgba(99, 102, 241, 0.3)'
          : '0 1px 4px rgba(0,0,0,0.2)',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: colors.border }} />

      <div className="flex items-center gap-1.5 mb-1.5">
        {d.shortId && (
          <span className="text-[10px] font-mono font-bold px-1.5 py-px rounded bg-purple-500/20 text-purple-400">
            {d.shortId}
          </span>
        )}
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: prioDot }}
          title={d.priority}
        />
        <span
          className="text-[10px] px-1.5 py-px rounded-full uppercase font-medium"
          style={{ backgroundColor: colors.border + '40', color: colors.text }}
        >
          {d.status.replace('_', ' ')}
        </span>
      </div>

      <div className="font-semibold text-[13px] mb-1" style={{ color: colors.text }}>
        {d.title}
      </div>

      {d.assignedTo && (
        <div className="text-[11px] text-slate-400">
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
      className="py-1.5 px-3 rounded-md bg-slate-800 min-w-[160px] max-w-[220px] flex items-center gap-1.5"
      style={{
        border: `1px solid ${selected ? '#6366f1' : colors.border}50`,
        borderLeft: `3px solid ${colors.dot}`,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: colors.border, width: 6, height: 6 }} />
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: colors.dot }}
      />
      <span className="flex-1 text-[11px] text-slate-300 overflow-hidden text-ellipsis whitespace-nowrap">
        {d.title}
      </span>
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: prioDot }}
      />
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
      .filter((edge) => edge.type !== 'parent-child')
      .filter((edge) => filteredIds.has(edge.from) && filteredIds.has(edge.to))
      .filter((edge) => {
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
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-slate-400 text-sm">Loading task graph...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <div className="text-red-400 font-medium mb-1">Failed to load graph</div>
          <div className="text-slate-500 text-sm mb-4">{error}</div>
          <button
            onClick={fetchGraph}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-white/[0.06] rounded-lg text-sm text-slate-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (graphData && graphData.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <EmptyState type="no-tasks" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Summary stats bar */}
      {summary && (
        <div className="flex gap-3 px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs flex-wrap items-center text-slate-200">
          <span><strong>{summary.total}</strong> tasks</span>
          <span><strong>{summary.roots}</strong> root</span>
          {summary.subtasks > 0 && <span><strong>{summary.subtasks}</strong> subtasks</span>}
          <span className="ml-2 flex gap-2 items-center">
            {Object.entries(summary.byStatus).map(([status, count]) => {
              if (count === 0) return null;
              const c = statusColors[status] || statusColors.backlog;
              return (
                <span key={status} className="flex items-center gap-1" style={{ color: c.border }}>
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: c.dot }}
                  />
                  <strong>{count}</strong> {status.replace('_', ' ')}
                </span>
              );
            })}
          </span>
          <button
            onClick={() => { fetchGraph(); onRefresh?.(); }}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-[11px] transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>
      )}

      {/* Graph view */}
      <div className="flex-1 min-h-0 bg-slate-950">
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
      <div className="flex gap-4 px-4 py-1.5 bg-slate-900 border-t border-slate-800 text-[10px] text-slate-500 flex-wrap items-center">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" /> P0
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-500" /> P1
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" /> P2
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500" /> P3
        </span>
        <span className="text-red-500">━━▶ blocks</span>
        <span className="text-slate-600">┄┄┄ parent-child</span>
        <span className="text-green-400">╌╌╌ soft dep</span>
      </div>
    </div>
  );
}
