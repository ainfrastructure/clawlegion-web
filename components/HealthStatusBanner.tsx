'use client';

import { useState, useCallback } from 'react';
import { usePollingInterval } from '@/hooks/usePollingInterval';

interface Service {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latencyMs?: number;
  details?: Record<string, unknown>;
}

interface HealthData {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  uptimeFormatted?: string;
  services: Service[];
  summary: {
    healthy: number;
    degraded: number;
    down: number;
  };
  memory?: {
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
  };
}

export function HealthStatusBanner() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health/dashboard');
      const data = await res.json();
      setHealth(data);
      // Auto-show if not healthy
      if (data.status !== 'healthy' && dismissed) {
        setDismissed(false);
      }
    } catch {
      setHealth({ 
        status: 'down', 
        timestamp: new Date().toISOString(),
        services: [], 
        summary: { healthy: 0, degraded: 0, down: 1 } 
      });
    } finally {
      setLoading(false);
    }
  }, [dismissed]);

  usePollingInterval(fetchHealth, 30000);

  if (loading) return null;
  if (!health) return null;
  
  // Auto-hide when healthy and dismissed
  if (health.status === 'healthy' && !expanded) {
    if (dismissed) return null;
    // Show mini healthy indicator only
    return (
      <div 
        className="fixed top-2 right-2 z-50 flex items-center gap-2 bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-green-500/20 transition-colors"
        onClick={() => setExpanded(true)}
      >
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        All systems healthy
      </div>
    );
  }

  const statusColors = {
    healthy: 'bg-green-500/10 border-green-500/30 text-green-400',
    degraded: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    down: 'bg-red-500/10 border-red-500/30 text-red-400',
  };

  const statusIcons = {
    healthy: '✓',
    degraded: '⚠',
    down: '✕',
  };

  const serviceBadgeColors = {
    healthy: 'bg-green-500/20 text-green-400',
    degraded: 'bg-yellow-500/20 text-yellow-400',
    down: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 border-b ${statusColors[health.status]} backdrop-blur-sm`}>
      <div 
        className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{statusIcons[health.status]}</span>
          <span className="font-medium capitalize">
            System Status: {health.status}
          </span>
          <span className="text-sm opacity-75">
            ({health.summary.healthy} healthy, {health.summary.degraded} degraded, {health.summary.down} down)
          </span>
        </div>
        <div className="flex items-center gap-2">
          {health.uptimeFormatted && (
            <span className="text-xs opacity-60">Uptime: {health.uptimeFormatted}</span>
          )}
          <button 
            className="text-xs opacity-60 hover:opacity-100 px-2 py-1 rounded hover:bg-white/10"
            onClick={(e) => {
              e.stopPropagation();
              setDismissed(true);
              setExpanded(false);
            }}
          >
            Dismiss
          </button>
          <span className="text-xs opacity-60">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="max-w-7xl mx-auto px-4 pb-4 border-t border-white/10 mt-2 pt-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {health.services.map((service) => (
              <div 
                key={service.name}
                className={`p-3 rounded-lg ${serviceBadgeColors[service.status]}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium capitalize">
                    {service.name.replace(/-/g, ' ')}
                  </span>
                  <span className="text-lg">{statusIcons[service.status]}</span>
                </div>
                {service.latencyMs !== undefined && (
                  <div className="text-xs opacity-75">
                    Latency: {service.latencyMs}ms
                  </div>
                )}
                {service.details && (
                  <div className="text-xs opacity-75 mt-1">
                    {Object.entries(service.details).map(([key, value]) => (
                      <div key={key}>
                        {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {health.memory && (
            <div className="mt-3 text-xs opacity-60 flex gap-4">
              <span>Heap: {health.memory.heapUsedMB}MB / {health.memory.heapTotalMB}MB</span>
              <span>RSS: {health.memory.rssMB}MB</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HealthStatusBanner;
