'use client';

import { useState } from 'react';
import TaskGraphView from '@/components/TaskGraphView';

export default function TaskGraphPage() {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [taskDetails, setTaskDetails] = useState<any>(null);

  const handleNodeClick = async (taskId: string) => {
    setSelectedTask(taskId);
    try {
      const res = await fetch(`/api/tasks/queue?taskId=${taskId}`);
      const data = await res.json();
      const task = data.tasks?.find((t: any) => t.id === taskId);
      setTaskDetails(task);
    } catch (err) {
      console.error('Failed to fetch task details:', err);
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      {/* Main graph area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>Task Graph</h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '14px' }}>
            Visual dependency graph of all tasks. Click a node to see details.
          </p>
        </div>
        
        <div style={{ flex: 1 }}>
          <TaskGraphView
            onNodeClick={handleNodeClick}
            refreshInterval={5000}
            showMiniMap={true}
            showControls={true}
          />
        </div>
      </div>

      {/* Task details sidebar */}
      {selectedTask && (
        <div
          style={{
            width: '350px',
            borderLeft: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb',
            overflowY: 'auto',
          }}
        >
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Task Details</h2>
              <button
                onClick={() => { setSelectedTask(null); setTaskDetails(null); }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#6b7280',
                }}
              >
                ×
              </button>
            </div>

            {taskDetails ? (
              <div style={{ fontSize: '14px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Title</label>
                  <div style={{ fontWeight: 500 }}>{taskDetails.title}</div>
                </div>

                {taskDetails.description && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Description</label>
                    <div style={{ color: '#374151' }}>{taskDetails.description}</div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Status</label>
                    <div>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          backgroundColor: getStatusColor(taskDetails.status),
                          color: 'white',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {taskDetails.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label style={{ color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Priority</label>
                    <div style={{ fontWeight: 500 }}>{taskDetails.priority}</div>
                  </div>
                </div>

                {(taskDetails.assignee || taskDetails.assignedTo) && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Assigned To</label>
                    <div>@{taskDetails.assignee || taskDetails.assignedTo}</div>
                  </div>
                )}

                {taskDetails.progress !== undefined && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Progress</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          flex: 1,
                          height: '8px',
                          backgroundColor: '#e5e7eb',
                          borderRadius: '4px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${taskDetails.progress}%`,
                            backgroundColor: '#10b981',
                          }}
                        />
                      </div>
                      <span>{taskDetails.progress}%</span>
                    </div>
                  </div>
                )}

                {taskDetails.dependencies && taskDetails.dependencies.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Dependencies</label>
                    <div>
                      {taskDetails.dependencies.map((dep: any, i: number) => (
                        <div key={i} style={{ fontSize: '12px', color: '#6b7280' }}>
                          • {dep.taskId} ({dep.type})
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {taskDetails.subtasks && taskDetails.subtasks.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Subtasks ({taskDetails.subtasks.length})</label>
                    <div>
                      {taskDetails.subtasks.map((id: string, i: number) => (
                        <div
                          key={i}
                          style={{ fontSize: '12px', color: '#3b82f6', cursor: 'pointer' }}
                          onClick={() => handleNodeClick(id)}
                        >
                          • {id}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {taskDetails.tags && taskDetails.tags.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Tags</label>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {taskDetails.tags.map((tag: string, i: number) => (
                        <span
                          key={i}
                          style={{
                            padding: '2px 8px',
                            backgroundColor: '#e5e7eb',
                            borderRadius: '4px',
                            fontSize: '12px',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '24px', display: 'flex', gap: '8px' }}>
                  <button
                    onClick={async () => {
                      await fetch('/api/tasks/graph', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ taskId: selectedTask, action: 'complete' }),
                      });
                      handleNodeClick(selectedTask);
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 16px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                    disabled={taskDetails.status === 'completed'}
                  >
                    ✓ Complete
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Open decompose modal
                      alert('Decompose feature coming soon!');
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 16px',
                      backgroundColor: '#6366f1',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    ↳ Decompose
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ color: '#6b7280', textAlign: 'center', padding: '24px' }}>
                Loading...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusColor(status: string): string {
  // High contrast status colors matching TaskGraphView
  const colors: Record<string, string> = {
    queued: '#1f2937',      // Dark gray
    assigned: '#1e3a8a',    // Deep blue
    'in-progress': '#b45309', // Orange
    completed: '#047857',   // Green
    failed: '#b91c1c',      // Red
    'pending-review': '#4338ca', // Indigo
  };
  return colors[status] || '#1f2937';
}
