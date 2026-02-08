'use client';

import { SimplePipelineView } from '@/components/workflow/SimplePipelineView';
import type { AgentStatus } from '@/components/workflow';

export default function WorkflowPage() {
  // Demo with mixed statuses showing pipeline progress
  const demoStatuses: Record<string, AgentStatus> = {
    archie: 'success',
    mason: 'success',
    sentinel: 'in-progress',
    critic: 'pending',
    vex: 'pending',
    deploy: 'pending',
    scribe: 'pending',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Workflow Pipeline</h1>
          <p className="text-slate-400">Agent orchestration visualization — Task ID: cml3wupwn00034acid35dff6s</p>
        </div>
        
        {/* Pipeline Card */}
        <div className="bg-white rounded-xl shadow-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Current Pipeline</h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-gray-600">Success</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
                <span className="text-gray-600">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-300"></span>
                <span className="text-gray-600">Pending</span>
              </div>
            </div>
          </div>
          
          <SimplePipelineView statuses={demoStatuses} />
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-7 gap-4">
          {Object.entries(demoStatuses).map(([agent, status]) => (
            <div 
              key={agent}
              className={`
                rounded-lg p-4 text-center
                ${status === 'success' ? 'bg-green-500/20 border border-green-500/30' : ''}
                ${status === 'in-progress' ? 'bg-blue-500/20 border border-blue-500/30' : ''}
                ${status === 'pending' ? 'bg-slate-700/50 border border-slate-600/30' : ''}
              `}
            >
              <div className="text-white font-medium capitalize">{agent}</div>
              <div className={`
                text-sm capitalize
                ${status === 'success' ? 'text-green-400' : ''}
                ${status === 'in-progress' ? 'text-blue-400' : ''}
                ${status === 'pending' ? 'text-slate-400' : ''}
              `}>
                {status === 'in-progress' ? 'Running' : status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
