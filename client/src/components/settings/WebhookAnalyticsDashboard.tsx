import React, { useState, useEffect } from 'react';
import styles from './settings.module.css';

interface WebhookAnalytics {
  totalWebhooks: number;
  activeWebhooks: number;
  totalDeliveries: number;
  successRate: number;
  avgResponseTime: number;
  healthyWebhooks: number;
  failedWebhooks: number;
  deliveriesLast24Hours: number;
  deliveriesLast7Days: number;
  deliveriesLast30Days: number;
  topEvents: Array<{
    eventType: string;
    count: number;
    successRate: number;
  }>;
  recentFailures: Array<{
    webhookName: string;
    eventType: string;
    error: string;
    timestamp: string;
  }>;
  responseTimeHistogram: Array<{
    range: string;
    count: number;
  }>;
}

interface WebhookAnalyticsDashboardProps {
  workspaceId?: string;
}

const WebhookAnalyticsDashboard: React.FC<WebhookAnalyticsDashboardProps> = ({ workspaceId }) => {
  const [analytics, setAnalytics] = useState<WebhookAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [refreshInterval, setRefreshInterval] = useState<number>(30000); // 30 seconds

  useEffect(() => {
    loadAnalytics();
    
    const interval = setInterval(() => {
      loadAnalytics();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [timeRange, refreshInterval]);

  const loadAnalytics = async () => {
    try {
      const params = new URLSearchParams({
        timeRange: timeRange,
        ...(workspaceId && { workspaceId })
      });

      const response = await fetch(`/api/webhooks/analytics?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.data);
      } else {
        console.error('Failed to load analytics:', data.message);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  const formatDuration = (ms: number): string => {
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(1)}s`;
    }
    return `${ms}ms`;
  };

  const getHealthStatusColor = (rate: number): string => {
    if (rate >= 95) return '#10b981'; // Green
    if (rate >= 85) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const getHealthStatusText = (rate: number): string => {
    if (rate >= 95) return 'Healthy';
    if (rate >= 85) return 'Warning';
    return 'Critical';
  };

  if (isLoading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics-error">
        <p>Failed to load analytics data</p>
        <button onClick={loadAnalytics}>Retry</button>
      </div>
    );
  }

  return (
    <div className="webhook-analytics-dashboard">
      {/* Header */}
      <div className="analytics-header">
        <h2>Webhook Analytics</h2>
        <div className="analytics-controls">
          <div className="time-range-selector">
            <label>Time Range:</label>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value as '24h' | '7d' | '30d')}
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
          <div className="refresh-controls">
            <label>Auto-refresh:</label>
            <select 
              value={refreshInterval} 
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
            >
              <option value={10000}>10 seconds</option>
              <option value={30000}>30 seconds</option>
              <option value={60000}>1 minute</option>
              <option value={300000}>5 minutes</option>
              <option value={0}>Off</option>
            </select>
          </div>
          <button className="refresh-btn" onClick={loadAnalytics}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total Webhooks</h3>
          <div className="metric-value">{analytics.totalWebhooks}</div>
          <div className="metric-subtitle">
            {analytics.activeWebhooks} active
          </div>
        </div>

        <div className="metric-card">
          <h3>Success Rate</h3>
          <div 
            className="metric-value"
            style={{ color: getHealthStatusColor(analytics.successRate) }}
          >
            {formatPercentage(analytics.successRate)}
          </div>
          <div className="metric-subtitle">
            {getHealthStatusText(analytics.successRate)}
          </div>
        </div>

        <div className="metric-card">
          <h3>Total Deliveries</h3>
          <div className="metric-value">{formatNumber(analytics.totalDeliveries)}</div>
          <div className="metric-subtitle">
            {formatNumber(analytics.deliveriesLast24Hours)} in 24h
          </div>
        </div>

        <div className="metric-card">
          <h3>Avg Response Time</h3>
          <div className="metric-value">{formatDuration(analytics.avgResponseTime)}</div>
          <div className="metric-subtitle">
            {analytics.healthyWebhooks} healthy endpoints
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        {/* Top Events */}
        <div className="chart-card">
          <h3>Top Events</h3>
          <div className="events-list">
            {analytics.topEvents.map((event, index) => (
              <div key={event.eventType} className="event-item">
                <div className="event-info">
                  <span className="event-type">{event.eventType}</span>
                  <span className="event-count">{formatNumber(event.count)}</span>
                </div>
                <div className="event-success-rate">
                  <div 
                    className="success-bar"
                    style={{ 
                      width: `${event.successRate}%`,
                      backgroundColor: getHealthStatusColor(event.successRate)
                    }}
                  ></div>
                  <span>{formatPercentage(event.successRate)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Response Time Distribution */}
        <div className="chart-card">
          <h3>Response Time Distribution</h3>
          <div className="histogram">
            {analytics.responseTimeHistogram.map((bucket, index) => (
              <div key={bucket.range} className="histogram-bar">
                <div className="histogram-label">{bucket.range}</div>
                <div className="histogram-container">
                  <div 
                    className="histogram-fill"
                    style={{ 
                      height: `${(bucket.count / Math.max(...analytics.responseTimeHistogram.map(b => b.count))) * 100}%` 
                    }}
                  ></div>
                </div>
                <div className="histogram-count">{bucket.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Failures */}
      <div className="failures-section">
        <h3>Recent Failures</h3>
        {analytics.recentFailures.length === 0 ? (
          <div className="no-failures">
            <p>✅ No recent failures - all webhooks are healthy!</p>
          </div>
        ) : (
          <div className="failures-list">
            {analytics.recentFailures.map((failure, index) => (
              <div key={index} className="failure-item">
                <div className="failure-header">
                  <span className="failure-webhook">{failure.webhookName}</span>
                  <span className="failure-event">{failure.eventType}</span>
                  <span className="failure-timestamp">
                    {new Date(failure.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="failure-error">
                  {failure.error}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Health Status */}
      <div className="health-status-section">
        <h3>Health Status</h3>
        <div className="health-indicators">
          <div className="health-indicator">
            <div 
              className="health-circle"
              style={{ backgroundColor: getHealthStatusColor(analytics.successRate) }}
            ></div>
            <span>Overall Health: {getHealthStatusText(analytics.successRate)}</span>
          </div>
          <div className="health-stats">
            <div className="health-stat">
              <span className="health-label">Healthy Endpoints:</span>
              <span className="health-value">{analytics.healthyWebhooks}</span>
            </div>
            <div className="health-stat">
              <span className="health-label">Failed Endpoints:</span>
              <span className="health-value">{analytics.failedWebhooks}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Volume */}
      <div className="delivery-volume-section">
        <h3>Delivery Volume</h3>
        <div className="volume-stats">
          <div className="volume-stat">
            <span className="volume-label">Last 24 Hours:</span>
            <span className="volume-value">{formatNumber(analytics.deliveriesLast24Hours)}</span>
          </div>
          <div className="volume-stat">
            <span className="volume-label">Last 7 Days:</span>
            <span className="volume-value">{formatNumber(analytics.deliveriesLast7Days)}</span>
          </div>
          <div className="volume-stat">
            <span className="volume-label">Last 30 Days:</span>
            <span className="volume-value">{formatNumber(analytics.deliveriesLast30Days)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebhookAnalyticsDashboard;
