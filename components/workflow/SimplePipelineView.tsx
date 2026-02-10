'use client';

import { CheckCircle2, Loader2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AgentStatus } from './types';

interface Agent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  primaryColor: string;
  status: AgentStatus;
}

const AGENTS: Agent[] = [
  { id: 'athena', name: 'Athena', role: 'Plan', avatar: '/agents/athena.png', primaryColor: '#06B6D4', status: 'pending' },
  { id: 'vulcan', name: 'Vulcan', role: 'Build', avatar: '/agents/vulcan.png', primaryColor: '#F59E0B', status: 'pending' },
  { id: 'sentinel', name: 'Sentinel', role: 'Scan', avatar: '/agents/hermes.png', primaryColor: '#3B82F6', status: 'pending' },
  { id: 'critic', name: 'Critic', role: 'Review', avatar: '/agents/athena.png', primaryColor: '#991B1B', status: 'pending' },
  { id: 'janus', name: 'Janus', role: 'Verify', avatar: '/agents/janus.png', primaryColor: '#10B981', status: 'pending' },
  { id: 'deploy', name: 'Deploy', role: 'Deploy', avatar: '/agents/hermes.png', primaryColor: '#EA580C', status: 'pending' },
  { id: 'scribe', name: 'Scribe', role: 'Docs', avatar: '/agents/athena.png', primaryColor: '#78350F', status: 'pending' },
];

interface SimplePipelineViewProps {
  statuses?: Record<string, AgentStatus>;
}

export function SimplePipelineView({ statuses = {} }: SimplePipelineViewProps) {
  const agents = AGENTS.map(agent => ({
    ...agent,
    status: statuses[agent.id] || 'pending',
  }));

  return (
    <div className="flex items-center justify-center gap-2 py-8 px-4 overflow-x-auto">
      {agents.map((agent, index) => (
        <div key={agent.id} className="flex items-center">
          {/* Agent Node */}
          <div
            className={cn(
              'w-[120px] h-[150px] rounded-xl border-2 shadow-lg',
              'flex flex-col items-center justify-center gap-2 bg-white transition-all',
              agent.status === 'pending' && 'border-gray-300 bg-gray-50',
              agent.status === 'in-progress' && 'ring-2 ring-offset-2',
              agent.status === 'success' && 'border-green-500 bg-green-50',
              agent.status === 'failed' && 'border-red-500 bg-red-50',
            )}
            style={agent.status === 'in-progress' ? { 
              borderColor: agent.primaryColor,
              ['--tw-ring-color' as string]: agent.primaryColor,
            } : undefined}
          >
            {/* Avatar */}
            <div 
              className="w-16 h-16 rounded-full overflow-hidden border-4 shadow-md flex items-center justify-center text-white text-2xl font-bold"
              style={{ borderColor: agent.primaryColor, backgroundColor: `${agent.primaryColor}20` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- dynamic agent avatar */}
              <img 
                src={agent.avatar} 
                alt={agent.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  if ((e.target as HTMLImageElement).parentElement) {
                    (e.target as HTMLImageElement).parentElement!.textContent = agent.name[0];
                  }
                }}
              />
            </div>
            
            {/* Status Indicator */}
            {agent.status === 'pending' && (
              <Circle className="w-5 h-5 text-gray-400" />
            )}
            {agent.status === 'in-progress' && (
              <Loader2 
                className="w-5 h-5 animate-spin" 
                style={{ color: agent.primaryColor }}
              />
            )}
            {agent.status === 'success' && (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            )}
            
            {/* Labels */}
            <div className="text-center">
              <div className="font-semibold text-sm text-gray-900">{agent.name}</div>
              <div className="text-xs text-gray-500">{agent.role}</div>
            </div>
          </div>
          
          {/* Arrow connector */}
          {index < agents.length - 1 && (
            <div className="flex items-center mx-1">
              <div 
                className={cn(
                  "h-0.5 w-8",
                  agent.status === 'success' ? "bg-green-400" : "bg-gray-300"
                )}
              />
              <div 
                className={cn(
                  "w-0 h-0 border-y-4 border-y-transparent border-l-8",
                  agent.status === 'success' ? "border-l-green-400" : "border-l-gray-300"
                )}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
