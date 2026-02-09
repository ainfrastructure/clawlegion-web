'use client';

import { useState, useCallback } from 'react';
import TaskGraphView from '@/components/TaskGraphView';
import { DecomposeModal } from '@/components/tasks/DecomposeModal';

const STATUS_CHIPS = [
  { key: 'backlog', label: 'Backlog', color: '#64748b' },
  { key: 'todo', label: 'Todo', color: '#3b82f6' },
  { key: 'in_progress', label: 'In Progress', color: '#f59e0b' },
  { key: 'verifying', label: 'Verifying', color: '#818cf8' },
  { key: 'done', label: 'Done', color: '#22c55e' },
];

const PRIORITY_CHIPS = [
  { key: 'P0', label: 'P0', color: '#ef4444' },
  { key: 'P1', label: 'P1', color: '#f97316' },
  { key: 'P2', label: 'P2', color: '#f59e0b' },
  { key: 'P3', label: 'P3', color: '#3b82f6' },
];

export default function TaskGraphPage() {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [taskDetails, setTaskDetails] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDecompose, setShowDecompose] = useState(false);

  const handleNodeClick = useCallback(async (taskId: string) => {
    setSelectedTask(taskId);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${API_URL}/api/task-tracking/tasks/${taskId}?includeActivities=false`);
      const data = await res.json();
      setTaskDetails(data.task);
    } catch (err) {
      console.error('Failed to fetch task details:', err);
    }
  }, []);

  const toggleStatus = (status: string) => {
    setStatusFilter(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', backgroundColor: '#020617' }}>
      {/* Main graph area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{
          padding: '12px 20px',
          borderBottom: '1px solid #1e293b',
          backgroundColor: '#0f172a',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#f1f5f9' }}>Task Graph</h1>
              <p style={{ color: '#64748b', margin: '2px 0 0', fontSize: '13px' }}>
                Visual hierarchy of all tasks. Parent tasks show their subtasks inline.
              </p>
            </div>
          </div>

          {/* Filter toolbar */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              style={{
                padding: '5px 12px', fontSize: '12px',
                backgroundColor: '#1e293b', border: '1px solid #334155',
                borderRadius: '6px', color: '#e2e8f0', outline: 'none',
                width: '200px',
              }}
            />

            {/* Status chips */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {STATUS_CHIPS.map(({ key, label, color }) => {
                const active = statusFilter.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleStatus(key)}
                    style={{
                      padding: '3px 10px', fontSize: '11px', fontWeight: 500,
                      borderRadius: '9999px', cursor: 'pointer',
                      border: `1px solid ${active ? color : '#334155'}`,
                      backgroundColor: active ? color + '20' : 'transparent',
                      color: active ? color : '#94a3b8',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Clear filters */}
            {(statusFilter.length > 0 || searchQuery) && (
              <button
                onClick={() => { setStatusFilter([]); setSearchQuery(''); }}
                style={{
                  padding: '3px 10px', fontSize: '11px',
                  borderRadius: '6px', cursor: 'pointer',
                  border: '1px solid #334155', backgroundColor: 'transparent',
                  color: '#94a3b8',
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Graph */}
        <div style={{ flex: 1 }}>
          <TaskGraphView
            onNodeClick={handleNodeClick}
            refreshInterval={5000}
            showMiniMap={true}
            showControls={true}
            statusFilter={statusFilter.length > 0 ? statusFilter : undefined}
            searchQuery={searchQuery || undefined}
          />
        </div>
      </div>

      {/* Task details sidebar */}
      {selectedTask && (
        <div
          style={{
            width: '360px',
            borderLeft: '1px solid #1e293b',
            backgroundColor: '#0f172a',
            overflowY: 'auto',
          }}
        >
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: '#f1f5f9' }}>Task Details</h2>
              <button
                onClick={() => { setSelectedTask(null); setTaskDetails(null); }}
                style={{
                  background: 'none', border: 'none',
                  fontSize: '18px', cursor: 'pointer', color: '#64748b',
                  padding: '4px',
                }}
              >
                ×
              </button>
            </div>

            {taskDetails ? (
              <div style={{ fontSize: '13px', color: '#cbd5e1' }}>
                {/* Parent breadcrumb */}
                {taskDetails.parent && (
                  <div style={{
                    marginBottom: '12px', padding: '6px 10px',
                    backgroundColor: '#1e293b', borderRadius: '6px',
                    fontSize: '11px', color: '#94a3b8',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    <span style={{
                      fontFamily: 'monospace', fontSize: '10px',
                      padding: '1px 5px', borderRadius: '3px',
                      backgroundColor: 'rgba(168,85,247,0.15)', color: '#c084fc',
                    }}>
                      {taskDetails.parent.shortId || taskDetails.parent.id?.slice(0, 8)}
                    </span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {taskDetails.parent.title}
                    </span>
                    <span style={{ color: '#475569' }}>→</span>
                    <span style={{ color: '#818cf8' }}>subtask</span>
                  </div>
                )}

                {/* ShortId + Title */}
                <div style={{ marginBottom: '12px' }}>
                  {taskDetails.shortId && (
                    <span style={{
                      display: 'inline-block', marginBottom: '4px',
                      fontFamily: 'monospace', fontSize: '11px', fontWeight: 700,
                      padding: '2px 8px', borderRadius: '4px',
                      backgroundColor: 'rgba(168,85,247,0.2)', color: '#c084fc',
                    }}>
                      {taskDetails.shortId}
                    </span>
                  )}
                  <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '14px' }}>{taskDetails.title}</div>
                </div>

                {/* Description */}
                {taskDetails.description && (
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
                    <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px', lineHeight: '1.5' }}>
                      {taskDetails.description.length > 200
                        ? taskDetails.description.slice(0, 200) + '...'
                        : taskDetails.description
                      }
                    </div>
                  </div>
                )}

                {/* Status / Priority / Assignee */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</label>
                    <div style={{ marginTop: '4px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '9999px', fontSize: '11px',
                        backgroundColor: getStatusColor(taskDetails.status) + '30',
                        color: getStatusColor(taskDetails.status),
                        textTransform: 'uppercase', fontWeight: 500,
                      }}>
                        {taskDetails.status?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Priority</label>
                    <div style={{ marginTop: '4px', fontWeight: 600 }}>{taskDetails.priority}</div>
                  </div>
                </div>

                {(taskDetails.assignee || taskDetails.assignedTo) && (
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assigned To</label>
                    <div style={{ marginTop: '4px' }}>@{taskDetails.assignee || taskDetails.assignedTo}</div>
                  </div>
                )}

                {/* Subtasks list */}
                {taskDetails.subtasks && taskDetails.subtasks.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Subtasks ({taskDetails.subtasks.filter((s: any) => s.status === 'done').length}/{taskDetails.subtasks.length})
                    </label>
                    <div style={{ marginTop: '6px' }}>
                      {taskDetails.subtasks.map((sub: any) => {
                        const isDone = sub.status === 'done' || sub.status === 'completed';
                        return (
                          <div
                            key={sub.id}
                            onClick={() => handleNodeClick(sub.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '6px',
                              padding: '4px 8px', borderRadius: '4px', cursor: 'pointer',
                              fontSize: '12px', opacity: isDone ? 0.5 : 1,
                              marginBottom: '2px',
                            }}
                          >
                            <span style={{
                              width: '6px', height: '6px', borderRadius: '50%',
                              backgroundColor: getStatusColor(sub.status), flexShrink: 0,
                            }} />
                            <span style={{
                              flex: 1, textDecoration: isDone ? 'line-through' : 'none',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {sub.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
                  <button
                    onClick={async () => {
                      await fetch('/api/tasks/graph', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ taskId: selectedTask, status: 'done' }),
                      });
                      handleNodeClick(selectedTask);
                    }}
                    style={{
                      flex: 1, padding: '8px 12px',
                      backgroundColor: '#059669', color: 'white',
                      border: 'none', borderRadius: '6px',
                      cursor: 'pointer', fontSize: '12px', fontWeight: 500,
                    }}
                    disabled={taskDetails.status === 'done'}
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => setShowDecompose(true)}
                    style={{
                      flex: 1, padding: '8px 12px',
                      backgroundColor: '#4f46e5', color: 'white',
                      border: 'none', borderRadius: '6px',
                      cursor: 'pointer', fontSize: '12px', fontWeight: 500,
                    }}
                    disabled={!!taskDetails.parentId}
                  >
                    Decompose
                  </button>
                </div>
                {taskDetails.parentId && (
                  <p style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                    Subtasks cannot be further decomposed (single level only).
                  </p>
                )}
              </div>
            ) : (
              <div style={{ color: '#64748b', textAlign: 'center', padding: '24px' }}>
                Loading...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Decompose Modal */}
      {showDecompose && selectedTask && taskDetails && (
        <DecomposeModal
          parentId={selectedTask}
          parentTitle={taskDetails.title}
          parentPriority={taskDetails.priority}
          isOpen={showDecompose}
          onClose={() => setShowDecompose(false)}
        />
      )}
    </div>
  );
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    backlog: '#64748b',
    todo: '#3b82f6',
    in_progress: '#f59e0b',
    building: '#f59e0b',
    researching: '#a855f7',
    planning: '#a855f7',
    verifying: '#818cf8',
    done: '#22c55e',
    completed: '#22c55e',
    failed: '#ef4444',
  };
  return colors[status] || '#64748b';
}
