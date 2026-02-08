'use client';

import { useState, useCallback } from 'react';

interface Action {
  id: string;
  label: string;
  icon: string;
  color: 'red' | 'yellow' | 'green' | 'blue' | 'purple';
  description: string;
  dangerous?: boolean;
}

const ACTIONS: Action[] = [
  {
    id: 'pause',
    label: 'Pause Agent',
    icon: '⏸',
    color: 'yellow',
    description: 'Temporarily pause the selected agent. Tasks will be reassigned.',
  },
  {
    id: 'resume',
    label: 'Resume Agent',
    icon: '▶',
    color: 'green',
    description: 'Resume a paused agent. It will start picking up tasks again.',
  },
  {
    id: 'reassign',
    label: 'Reassign Task',
    icon: '🔄',
    color: 'blue',
    description: 'Reassign the current task to another available agent.',
  },
  {
    id: 'verify',
    label: 'Force Verify',
    icon: '✓',
    color: 'purple',
    description: 'Force verification of a task, bypassing normal checks.',
  },
  {
    id: 'stop',
    label: 'Emergency Stop',
    icon: '⚡',
    color: 'red',
    description: 'Immediately stop all agent activity. Use with caution!',
    dangerous: true,
  },
];

interface ConfirmModalProps {
  action: Action;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

function ConfirmModal({ action, onConfirm, onCancel, loading }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl border border-white/[0.06] max-w-md w-full p-6 shadow-2xl">
        <div className="text-center mb-4">
          <span className="text-4xl">{action.icon}</span>
        </div>
        <h3 className="text-lg font-semibold text-white text-center mb-2">
          {action.label}
        </h3>
        <p className="text-slate-400 text-center text-sm mb-6">
          {action.description}
        </p>
        {action.dangerous && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm text-center">
              ⚠️ This is a dangerous action and cannot be undone!
            </p>
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
              action.dangerous
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface QuickActionsBarProps {
  agentId?: string;
  taskId?: string;
  compact?: boolean;
}

export function QuickActionsBar({ agentId, taskId, compact = false }: QuickActionsBarProps) {
  const [confirmAction, setConfirmAction] = useState<Action | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const colorClasses = {
    red: 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20',
    yellow: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20',
    green: 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20',
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20',
  };

  const executeAction = useCallback(async (action: Action) => {
    setLoading(true);
    try {
      const endpoint = `/api/agents/actions/${action.id}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, taskId }),
      });
      const data = await res.json();
      setResult({
        success: data.success ?? res.ok,
        message: data.message || (res.ok ? 'Action completed' : 'Action failed'),
      });
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Action failed',
      });
    } finally {
      setLoading(false);
      setConfirmAction(null);
      // Clear result after 3 seconds
      setTimeout(() => setResult(null), 3000);
    }
  }, [agentId, taskId]);

  const handleActionClick = (action: Action) => {
    setConfirmAction(action);
  };

  return (
    <>
      <div className={`flex ${compact ? 'gap-1' : 'gap-2 flex-wrap'}`}>
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action)}
            className={`
              ${colorClasses[action.color]}
              border rounded-lg transition-colors
              ${compact ? 'p-2' : 'px-3 py-2'}
              flex items-center gap-2
            `}
            title={action.description}
          >
            <span>{action.icon}</span>
            {!compact && <span className="text-sm font-medium">{action.label}</span>}
          </button>
        ))}

        {result && (
          <div
            className={`
              px-3 py-2 rounded-lg text-sm
              ${result.success
                ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }
            `}
          >
            {result.success ? '✓' : '✕'} {result.message}
          </div>
        )}
      </div>

      {confirmAction && (
        <ConfirmModal
          action={confirmAction}
          onConfirm={() => executeAction(confirmAction)}
          onCancel={() => setConfirmAction(null)}
          loading={loading}
        />
      )}
    </>
  );
}

export default QuickActionsBar;
