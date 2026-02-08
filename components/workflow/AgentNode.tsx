'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Circle, Loader2, CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AgentNodeData } from './types';

const statusIcons = {
  pending: Circle,
  'in-progress': Loader2,
  success: CheckCircle2,
  failed: XCircle,
  skipped: MinusCircle,
};

export const AgentNode = memo(({ data }: NodeProps) => {
  const nodeData = data as AgentNodeData;
  const StatusIcon = statusIcons[nodeData.status];
  
  const borderColor = nodeData.status === 'in-progress' 
    ? nodeData.primaryColor 
    : undefined;

  return (
    <div
      className={cn(
        'w-[120px] h-[140px] rounded-xl border-2 shadow-sm',
        'flex flex-col items-center justify-center gap-2 bg-white',
        nodeData.status === 'pending' && 'border-gray-300 bg-gray-50',
        nodeData.status === 'in-progress' && 'animate-pulse',
        nodeData.status === 'success' && 'border-green-500 bg-green-50',
        nodeData.status === 'failed' && 'border-red-500 bg-red-50',
        nodeData.status === 'skipped' && 'border-gray-400 border-dashed bg-gray-100 opacity-60'
      )}
      style={borderColor ? { borderColor } : undefined}
    >
      <Handle type="target" position={Position.Left} className="opacity-0" />
      
      {/* Avatar */}
      <div 
        className="w-16 h-16 rounded-full overflow-hidden border-4 shadow-md flex items-center justify-center text-white text-2xl font-bold"
        style={{ 
          borderColor: nodeData.primaryColor,
          backgroundColor: nodeData.secondaryColor 
        }}
      >
        {nodeData.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element -- dynamic agent avatar
          <img 
            src={nodeData.avatar} 
            alt={nodeData.agent} 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to initial if image fails
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).parentElement!.textContent = nodeData.agent[0];
            }}
          />
        ) : (
          nodeData.agent[0]
        )}
      </div>
      
      {/* Status Indicator */}
      <StatusIcon 
        className={cn(
          'w-4 h-4',
          nodeData.status === 'pending' && 'text-gray-400',
          nodeData.status === 'in-progress' && 'animate-spin',
          nodeData.status === 'success' && 'text-green-500',
          nodeData.status === 'failed' && 'text-red-500',
          nodeData.status === 'skipped' && 'text-gray-400'
        )}
        style={nodeData.status === 'in-progress' ? { color: nodeData.primaryColor } : undefined}
      />
      
      {/* Labels */}
      <div className="text-center">
        <div className="font-semibold text-sm text-gray-900">{nodeData.agent}</div>
        <div className="text-xs text-gray-500">{nodeData.role}</div>
      </div>
      
      <Handle type="source" position={Position.Right} className="opacity-0" />
    </div>
  );
});

AgentNode.displayName = 'AgentNode';
