'use client';

import { useState, useEffect } from 'react';
import { Alert, Badge } from './index';

interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  lastCheck: string;
}

interface HealthStatusBannerProps {
  className?: string;
  autoHide?: boolean;
}

export function HealthStatusBanner({ 
  className = '',
  autoHide = true 
}: HealthStatusBannerProps) {
  const [health, setHealth] = useState<HealthCheck[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch('/api/health-check');
        if (res.ok) {
          const data = await res.json();
          setHealth(data.checks || []);
        }
      } catch (e) {
        setHealth([{ 
          service: 'System', 
          status: 'unhealthy', 
          message: 'Failed to check health',
          lastCheck: new Date().toISOString()
        }]);
      } finally {
        setLoading(false);
      }
    }
    
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const overallStatus = health.some(h => h.status === 'unhealthy') 
    ? 'unhealthy'
    : health.some(h => h.status === 'degraded')
      ? 'degraded'
      : 'healthy';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'degraded': return 'warning';
      case 'unhealthy': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'degraded': return '⚠️';
      case 'unhealthy': return '❌';
      default: return '❓';
    }
  };

  // Auto-hide when healthy
  if (autoHide && overallStatus === 'healthy' && !expanded) {
    return null;
  }

  if (loading) {
    return null;
  }

  return (
    <div className={className}>
      <div 
        className={`px-4 py-2 cursor-pointer transition-colors ${
          overallStatus === 'unhealthy' 
            ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
            : overallStatus === 'degraded'
              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
              : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>{getStatusIcon(overallStatus)}</span>
            <span className="font-medium">
              System {overallStatus === 'healthy' ? 'Healthy' : 
                     overallStatus === 'degraded' ? 'Degraded' : 'Issues Detected'}
            </span>
            <Badge variant={getStatusColor(overallStatus)}>
              {health.filter(h => h.status !== 'healthy').length} issues
            </Badge>
          </div>
          <span className="text-sm">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
          <div className="space-y-2">
            {health.map((check, i) => (
              <div 
                key={i}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
              >
                <div className="flex items-center gap-2">
                  <span>{getStatusIcon(check.status)}</span>
                  <span className="font-medium">{check.service}</span>
                </div>
                <div className="flex items-center gap-2">
                  {check.message && (
                    <span className="text-sm text-gray-500">{check.message}</span>
                  )}
                  <Badge variant={getStatusColor(check.status)} size="sm">
                    {check.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
