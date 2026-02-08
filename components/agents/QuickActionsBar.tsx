'use client';

import { useState } from 'react';
import { Button, Modal, Alert, Spinner } from '../common';

interface QuickActionsBarProps {
  agentId?: string;
  taskId?: string;
  onAction?: (action: string, result: any) => void;
  className?: string;
}

export function QuickActionsBar({ 
  agentId, 
  taskId,
  onAction,
  className = '' 
}: QuickActionsBarProps) {
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const executeAction = async (action: string) => {
    setLoading(action);
    setError(null);
    try {
      const res = await fetch('/api/agents/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, agentId, taskId })
      });
      
      if (!res.ok) throw new Error('Action failed');
      
      const result = await res.json();
      onAction?.(action, result);
      setShowConfirm(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(null);
    }
  };

  const actions = [
    {
      id: 'pause',
      label: '⏸️ Pause',
      description: 'Pause agent processing',
      variant: 'secondary' as const,
      requiresConfirm: true
    },
    {
      id: 'resume',
      label: '▶️ Resume',
      description: 'Resume agent processing',
      variant: 'primary' as const,
      requiresConfirm: false
    },
    {
      id: 'reassign',
      label: '🔄 Reassign',
      description: 'Reassign current task to another agent',
      variant: 'ghost' as const,
      requiresConfirm: true
    },
    {
      id: 'verify',
      label: '✅ Force Verify',
      description: 'Force verification of current task',
      variant: 'secondary' as const,
      requiresConfirm: false
    },
    {
      id: 'stop',
      label: '🛑 Emergency Stop',
      description: 'Immediately stop all agent operations',
      variant: 'danger' as const,
      requiresConfirm: true
    }
  ];

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        {actions.map(action => (
          <Button
            key={action.id}
            variant={action.variant}
            size="sm"
            disabled={loading !== null}
            onClick={() => {
              if (action.requiresConfirm) {
                setShowConfirm(action.id);
              } else {
                executeAction(action.id);
              }
            }}
          >
            {loading === action.id ? <Spinner size="sm" /> : action.label}
          </Button>
        ))}
      </div>

      {error && (
        <Alert variant="error">
          <span className="mt-2">{error}</span>
        </Alert>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirm !== null}
        onClose={() => setShowConfirm(null)}
        title="Confirm Action"
      >
        <div className="p-4">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Are you sure you want to {showConfirm?.replace('-', ' ')} 
            {agentId ? ` for ${agentId}` : ''}?
          </p>
          <div className="flex justify-end gap-2">
            <Button 
              variant="secondary" 
              onClick={() => setShowConfirm(null)}
            >
              Cancel
            </Button>
            <Button 
              variant="danger"
              onClick={() => showConfirm && executeAction(showConfirm)}
              disabled={loading !== null}
            >
              {loading ? <Spinner size="sm" /> : 'Confirm'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
