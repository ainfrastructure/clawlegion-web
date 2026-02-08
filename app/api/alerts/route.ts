import path from 'path'
import { NextRequest } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const CONFIG_FILE = join(process.cwd(), '..', '..', '..', 'alerts-config.json');
const ALERTS_LOG = join(process.cwd(), '..', '..', '..', 'alerts-log.json');

interface AlertConfig {
  enabled: boolean;
  discordWebhookUrl?: string;
  alertLevels: {
    error: boolean;
    warning: boolean;
    info: boolean;
  };
  cooldownMs: number; // Don't send duplicate alerts within this window
  lastSent: Record<string, number>; // Hash -> timestamp
}

interface Alert {
  id: string;
  level: 'error' | 'warning' | 'info';
  type: 'dashboard_error' | 'agent_error' | 'verification_failure' | 'task_stuck' | 'service_down';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  sent: boolean;
}

function getConfig(): AlertConfig {
  if (existsSync(CONFIG_FILE)) {
    return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
  }
  return {
    enabled: false,
    alertLevels: { error: true, warning: true, info: false },
    cooldownMs: 300000, // 5 minutes default
    lastSent: {},
  };
}

function saveConfig(config: AlertConfig) {
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function getAlertLog(): Alert[] {
  if (existsSync(ALERTS_LOG)) {
    return JSON.parse(readFileSync(ALERTS_LOG, 'utf-8'));
  }
  return [];
}

function saveAlertLog(alerts: Alert[]) {
  // Keep only last 100 alerts
  const trimmed = alerts.slice(-100);
  writeFileSync(ALERTS_LOG, JSON.stringify(trimmed, null, 2));
}

function hashAlert(alert: Partial<Alert>): string {
  return Buffer.from(JSON.stringify({
    type: alert.type,
    title: alert.title,
  })).toString('base64').slice(0, 16);
}

async function sendDiscordWebhook(webhookUrl: string, alert: Alert): Promise<boolean> {
  const colorMap = {
    error: 15158332,   // Red
    warning: 16776960, // Yellow
    info: 3447003,     // Blue
  };

  const iconMap = {
    error: '🚨',
    warning: '⚠️',
    info: 'ℹ️',
  };

  const embed = {
    title: iconMap[alert.level] + ' ' + alert.title,
    description: alert.description,
    color: colorMap[alert.level],
    timestamp: alert.timestamp,
    footer: {
      text: 'ClawLegion Alerts',
    },
    fields: alert.metadata ? Object.entries(alert.metadata).slice(0, 5).map(([key, value]) => ({
      name: key,
      value: String(value).slice(0, 256),
      inline: true,
    })) : undefined,
  };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to send Discord webhook:', e);
    return false;
  }
}

// GET: Get alert config and recent alerts
export async function GET(request: NextRequest) {
  const config = getConfig();
  const alerts = getAlertLog();
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  
  return Response.json({
    config: {
      enabled: config.enabled,
      hasWebhook: !!config.discordWebhookUrl,
      alertLevels: config.alertLevels,
      cooldownMs: config.cooldownMs,
    },
    recentAlerts: alerts.slice(-limit).reverse(),
    stats: {
      total: alerts.length,
      errors: alerts.filter(a => a.level === 'error').length,
      warnings: alerts.filter(a => a.level === 'warning').length,
      lastAlert: alerts[alerts.length - 1]?.timestamp,
    },
  });
}

// POST: Send an alert or update config
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action } = body;

  const config = getConfig();

  // Configure alerts
  if (action === 'configure') {
    const { enabled, discordWebhookUrl, alertLevels, cooldownMs } = body;
    
    if (typeof enabled === 'boolean') config.enabled = enabled;
    if (discordWebhookUrl !== undefined) config.discordWebhookUrl = discordWebhookUrl;
    if (alertLevels) config.alertLevels = { ...config.alertLevels, ...alertLevels };
    if (typeof cooldownMs === 'number') config.cooldownMs = cooldownMs;
    
    saveConfig(config);
    
    return Response.json({ 
      success: true, 
      message: 'Alert configuration updated',
      config: {
        enabled: config.enabled,
        hasWebhook: !!config.discordWebhookUrl,
        alertLevels: config.alertLevels,
        cooldownMs: config.cooldownMs,
      },
    });
  }

  // Test webhook
  if (action === 'test') {
    if (!config.discordWebhookUrl) {
      return Response.json({ error: 'No Discord webhook configured' }, { status: 400 });
    }
    
    const testAlert: Alert = {
      id: 'test-' + Date.now(),
      level: 'info',
      type: 'dashboard_error',
      title: 'Test Alert',
      description: 'This is a test alert from ClawLegion.',
      timestamp: new Date().toISOString(),
      sent: false,
    };
    
    const success = await sendDiscordWebhook(config.discordWebhookUrl, testAlert);
    
    return Response.json({ 
      success, 
      message: success ? 'Test alert sent successfully' : 'Failed to send test alert',
    });
  }

  // Send an actual alert
  if (action === 'alert') {
    const { level = 'error', type, title, description, metadata } = body;
    
    if (!type || !title || !description) {
      return Response.json({ 
        error: 'type, title, and description required' 
      }, { status: 400 });
    }

    const alert: Alert = {
      id: 'alert-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
      level,
      type,
      title,
      description,
      timestamp: new Date().toISOString(),
      metadata,
      sent: false,
    };

    // Log the alert
    const alerts = getAlertLog();
    alerts.push(alert);
    saveAlertLog(alerts);

    // Check if we should send it
    if (!config.enabled) {
      return Response.json({ 
        success: true, 
        alert, 
        sent: false, 
        reason: 'Alerts disabled' 
      });
    }

    if (!config.alertLevels[level as keyof typeof config.alertLevels]) {
      return Response.json({ 
        success: true, 
        alert, 
        sent: false, 
        reason: 'Level ' + level + ' not enabled' 
      });
    }

    if (!config.discordWebhookUrl) {
      return Response.json({ 
        success: true, 
        alert, 
        sent: false, 
        reason: 'No webhook configured' 
      });
    }

    // Check cooldown
    const alertHash = hashAlert(alert);
    const lastSentTime = config.lastSent[alertHash] || 0;
    if (Date.now() - lastSentTime < config.cooldownMs) {
      return Response.json({ 
        success: true, 
        alert, 
        sent: false, 
        reason: 'Cooldown active' 
      });
    }

    // Send the alert
    const sent = await sendDiscordWebhook(config.discordWebhookUrl, alert);
    
    if (sent) {
      alert.sent = true;
      config.lastSent[alertHash] = Date.now();
      saveConfig(config);
      
      // Update alert in log
      const updatedAlerts = getAlertLog();
      const idx = updatedAlerts.findIndex(a => a.id === alert.id);
      if (idx !== -1) {
        updatedAlerts[idx].sent = true;
        saveAlertLog(updatedAlerts);
      }
    }

    return Response.json({ success: true, alert, sent });
  }

  return Response.json({ error: 'Unknown action' }, { status: 400 });
}
