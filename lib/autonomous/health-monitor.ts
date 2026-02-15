/**
 * Predictive Health Monitoring System
 * Phase 1 Autonomous Systems - Advanced Health Monitoring
 */

export interface HealthMetrics {
  timestamp: Date
  agentId: string
  responseTime: number
  cpuUsage?: number
  memoryUsage?: number
  networkLatency?: number
  errorRate: number
  taskCompletionRate: number
  queueDepth: number
}

export interface HealthTrend {
  metric: keyof HealthMetrics
  direction: 'improving' | 'degrading' | 'stable'
  confidence: number
  slope: number
  r2: number
}

export interface HealthAlert {
  id: string
  agentId: string
  type: 'warning' | 'critical' | 'info'
  message: string
  timestamp: Date
  resolved: boolean
  metadata?: Record<string, any>
}

export interface HealthPrediction {
  agentId: string
  timeHorizon: number // minutes
  predictedHealth: number // 0-1
  riskFactors: string[]
  recommendations: string[]
  confidence: number
}

export interface AgentHealthStatus {
  agentId: string
  currentHealth: number // 0-1 overall health score
  lastUpdated: Date
  trends: HealthTrend[]
  activeAlerts: HealthAlert[]
  predictions: HealthPrediction[]
  metrics: HealthMetrics
  circuitBreakerState: 'closed' | 'open' | 'half-open'
  recovery: {
    inProgress: boolean
    startTime?: Date
    strategy?: string
    progress?: number
  }
}

/**
 * Health data storage and analysis
 */
export class HealthMonitor {
  private metricsHistory = new Map<string, HealthMetrics[]>()
  private alerts = new Map<string, HealthAlert[]>()
  private maxHistorySize = 1000
  private alertIdCounter = 0

  /**
   * Add health metrics for an agent
   */
  addMetrics(metrics: HealthMetrics): void {
    const agentId = metrics.agentId
    
    if (!this.metricsHistory.has(agentId)) {
      this.metricsHistory.set(agentId, [])
    }
    
    const history = this.metricsHistory.get(agentId)!
    history.push(metrics)
    
    // Keep only recent metrics
    if (history.length > this.maxHistorySize) {
      history.splice(0, history.length - this.maxHistorySize)
    }
    
    // Analyze for trends and alerts
    this.analyzeHealth(agentId)
  }

  /**
   * Get current health status for agent
   */
  getHealthStatus(agentId: string): AgentHealthStatus | null {
    const history = this.metricsHistory.get(agentId)
    if (!history || history.length === 0) return null

    const latestMetrics = history[history.length - 1]
    const currentHealth = this.calculateHealthScore(latestMetrics)
    const trends = this.calculateTrends(agentId)
    const activeAlerts = this.getActiveAlerts(agentId)
    const predictions = this.generatePredictions(agentId)

    return {
      agentId,
      currentHealth,
      lastUpdated: latestMetrics.timestamp,
      trends,
      activeAlerts,
      predictions,
      metrics: latestMetrics,
      circuitBreakerState: 'closed', // Will be updated by circuit breaker
      recovery: {
        inProgress: false
      }
    }
  }

  /**
   * Get all agent health statuses
   */
  getAllHealthStatuses(): AgentHealthStatus[] {
    const agentIds = Array.from(this.metricsHistory.keys())
    return agentIds
      .map(id => this.getHealthStatus(id))
      .filter((status): status is AgentHealthStatus => status !== null)
  }

  /**
   * Calculate overall health score (0-1)
   */
  private calculateHealthScore(metrics: HealthMetrics): number {
    const weights = {
      responseTime: 0.25,     // Lower is better
      errorRate: 0.30,        // Lower is better  
      taskCompletion: 0.25,   // Higher is better
      queueDepth: 0.20        // Lower is better (up to threshold)
    }

    // Normalize metrics to 0-1 scale
    const responseTimeScore = Math.max(0, 1 - (metrics.responseTime / 5000)) // 5s max
    const errorRateScore = Math.max(0, 1 - metrics.errorRate)
    const taskCompletionScore = metrics.taskCompletionRate
    const queueDepthScore = Math.max(0, 1 - (metrics.queueDepth / 10)) // 10 tasks max

    const score = 
      (responseTimeScore * weights.responseTime) +
      (errorRateScore * weights.errorRate) +
      (taskCompletionScore * weights.taskCompletion) +
      (queueDepthScore * weights.queueDepth)

    return Math.max(0, Math.min(1, score))
  }

  /**
   * Calculate health trends
   */
  private calculateTrends(agentId: string): HealthTrend[] {
    const history = this.metricsHistory.get(agentId)
    if (!history || history.length < 5) return []

    const trends: HealthTrend[] = []
    const recentHistory = history.slice(-20) // Last 20 data points

    const metrics: (keyof HealthMetrics)[] = [
      'responseTime', 'errorRate', 'taskCompletionRate', 'queueDepth'
    ]

    for (const metric of metrics) {
      const trend = this.calculateTrend(recentHistory, metric)
      if (trend) trends.push(trend)
    }

    return trends
  }

  /**
   * Calculate trend for specific metric
   */
  private calculateTrend(history: HealthMetrics[], metric: keyof HealthMetrics): HealthTrend | null {
    const values = history
      .map(h => Number(h[metric]))
      .filter(v => !isNaN(v))

    if (values.length < 3) return null

    // Simple linear regression
    const n = values.length
    const x = Array.from({length: n}, (_, i) => i)
    const y = values

    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    // Calculate R²
    const yMean = sumY / n
    const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0)
    const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - (slope * x[i] + intercept), 2), 0)
    const r2 = 1 - (ssRes / ssTotal)

    // Determine direction
    let direction: 'improving' | 'degrading' | 'stable' = 'stable'
    const slopeThreshold = 0.01

    if (Math.abs(slope) > slopeThreshold) {
      // For error rate and response time, negative slope is improving
      // For task completion rate, positive slope is improving
      if (metric === 'errorRate' || metric === 'responseTime' || metric === 'queueDepth') {
        direction = slope < 0 ? 'improving' : 'degrading'
      } else {
        direction = slope > 0 ? 'improving' : 'degrading'
      }
    }

    return {
      metric,
      direction,
      confidence: Math.max(0, Math.min(1, r2)),
      slope,
      r2
    }
  }

  /**
   * Generate health predictions
   */
  private generatePredictions(agentId: string): HealthPrediction[] {
    const history = this.metricsHistory.get(agentId)
    if (!history || history.length < 10) return []

    const recentHistory = history.slice(-10)
    const currentHealth = this.calculateHealthScore(recentHistory[recentHistory.length - 1])
    
    const predictions: HealthPrediction[] = []

    // 15-minute prediction
    const prediction15min = this.predictHealth(recentHistory, 15)
    if (prediction15min) {
      predictions.push(prediction15min)
    }

    // 60-minute prediction  
    const prediction60min = this.predictHealth(recentHistory, 60)
    if (prediction60min) {
      predictions.push(prediction60min)
    }

    return predictions
  }

  /**
   * Predict health at future time horizon
   */
  private predictHealth(history: HealthMetrics[], horizonMinutes: number): HealthPrediction | null {
    if (history.length < 5) return null

    const agentId = history[0].agentId
    const currentMetrics = history[history.length - 1]
    const trends = history.slice(-5).map(h => this.calculateHealthScore(h))
    
    // Simple linear extrapolation
    const n = trends.length
    const x = Array.from({length: n}, (_, i) => i)
    const y = trends

    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    // Predict future value
    const futureX = n + (horizonMinutes / 5) // Assuming 5-minute intervals
    const predictedHealth = Math.max(0, Math.min(1, slope * futureX + intercept))

    // Calculate confidence based on trend consistency
    const r2 = this.calculateR2(x, y, slope, intercept)
    const confidence = Math.max(0, Math.min(1, r2))

    // Generate risk factors and recommendations
    const riskFactors: string[] = []
    const recommendations: string[] = []

    if (predictedHealth < 0.3) {
      riskFactors.push('Critical health prediction')
      recommendations.push('Consider scaling up resources')
      recommendations.push('Review recent error patterns')
    } else if (predictedHealth < 0.6) {
      riskFactors.push('Declining health trend')
      recommendations.push('Monitor closely')
    }

    if (currentMetrics.errorRate > 0.1) {
      riskFactors.push('High error rate detected')
      recommendations.push('Check error logs and dependencies')
    }

    if (currentMetrics.queueDepth > 5) {
      riskFactors.push('High task queue depth')
      recommendations.push('Consider load balancing')
    }

    return {
      agentId,
      timeHorizon: horizonMinutes,
      predictedHealth,
      riskFactors,
      recommendations,
      confidence
    }
  }

  /**
   * Calculate R² correlation coefficient
   */
  private calculateR2(x: number[], y: number[], slope: number, intercept: number): number {
    const yMean = y.reduce((a, b) => a + b, 0) / y.length
    const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0)
    const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - (slope * x[i] + intercept), 2), 0)
    return 1 - (ssRes / ssTotal)
  }

  /**
   * Analyze health and generate alerts
   */
  private analyzeHealth(agentId: string): void {
    const status = this.getHealthStatus(agentId)
    if (!status) return

    // Clear old resolved alerts
    this.clearOldAlerts(agentId)

    // Check for health degradation
    if (status.currentHealth < 0.3) {
      this.addAlert(agentId, 'critical', 'Agent health critically low')
    } else if (status.currentHealth < 0.6) {
      this.addAlert(agentId, 'warning', 'Agent health declining')
    }

    // Check for high error rate
    if (status.metrics.errorRate > 0.2) {
      this.addAlert(agentId, 'critical', 'High error rate detected')
    } else if (status.metrics.errorRate > 0.1) {
      this.addAlert(agentId, 'warning', 'Elevated error rate')
    }

    // Check for high response time
    if (status.metrics.responseTime > 10000) {
      this.addAlert(agentId, 'critical', 'Very high response time')
    } else if (status.metrics.responseTime > 5000) {
      this.addAlert(agentId, 'warning', 'High response time')
    }

    // Check for queue buildup
    if (status.metrics.queueDepth > 15) {
      this.addAlert(agentId, 'critical', 'Task queue overflow')
    } else if (status.metrics.queueDepth > 8) {
      this.addAlert(agentId, 'warning', 'Task queue building up')
    }
  }

  /**
   * Add health alert
   */
  private addAlert(agentId: string, type: 'warning' | 'critical' | 'info', message: string): void {
    if (!this.alerts.has(agentId)) {
      this.alerts.set(agentId, [])
    }

    // Check if similar alert already exists
    const existingAlerts = this.alerts.get(agentId)!
    const similarAlert = existingAlerts.find(a => 
      !a.resolved && a.type === type && a.message === message
    )

    if (similarAlert) return // Don't duplicate alerts

    const alert: HealthAlert = {
      id: `alert_${this.alertIdCounter++}`,
      agentId,
      type,
      message,
      timestamp: new Date(),
      resolved: false
    }

    existingAlerts.push(alert)
  }

  /**
   * Get active alerts for agent
   */
  private getActiveAlerts(agentId: string): HealthAlert[] {
    const alerts = this.alerts.get(agentId) || []
    return alerts.filter(a => !a.resolved)
  }

  /**
   * Clear old alerts (older than 1 hour)
   */
  private clearOldAlerts(agentId: string): void {
    const alerts = this.alerts.get(agentId)
    if (!alerts) return

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    
    for (const alert of alerts) {
      if (alert.timestamp < oneHourAgo) {
        alert.resolved = true
      }
    }
  }

  /**
   * Resolve alert by ID
   */
  resolveAlert(alertId: string): boolean {
    for (const alerts of this.alerts.values()) {
      const alert = alerts.find(a => a.id === alertId)
      if (alert) {
        alert.resolved = true
        return true
      }
    }
    return false
  }
}

// Global health monitor instance
export const globalHealthMonitor = new HealthMonitor()