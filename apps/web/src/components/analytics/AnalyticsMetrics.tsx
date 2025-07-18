'use client';

import React, { useState, useEffect } from 'react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

interface MetricsData {
  totalRevenue: number;
  totalDeals: number;
  avgDealValue: number;
  conversionRate: number;
  totalLeads: number;
  pipelineValue: number;
  closingRate: number;
  avgCycleTime: number;
  topPerformer: string;
  growthRate: number;
}

interface TrendsData {
  revenueTrend: number;
  dealsTrend: number;
  leadsTrend: number;
  conversionTrend: number;
}

interface AnalyticsMetricsProps {
  data: any;
  period?: string;
}

const AnalyticsMetrics = ({ data, period = '30d' }: AnalyticsMetricsProps) => {
  const [metrics, setMetrics] = useState<MetricsData>({
    totalRevenue: 0,
    totalDeals: 0,
    avgDealValue: 0,
    conversionRate: 0,
    totalLeads: 0,
    pipelineValue: 0,
    closingRate: 0,
    avgCycleTime: 0,
    topPerformer: '',
    growthRate: 0
  });

  const [trends, setTrends] = useState<TrendsData>({
    revenueTrend: 0,
    dealsTrend: 0,
    leadsTrend: 0,
    conversionTrend: 0
  });

  useEffect(() => {
    calculateMetrics();
  }, [data, period]);

  const calculateMetrics = () => {
    // Simulated metrics calculation - in real app, this would use actual data
    const now = new Date();
    const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    
    // Current period metrics
    const currentMetrics: MetricsData = {
      totalRevenue: Math.floor(Math.random() * 150000) + 50000,
      totalDeals: Math.floor(Math.random() * 25) + 10,
      totalLeads: Math.floor(Math.random() * 200) + 100,
      pipelineValue: Math.floor(Math.random() * 300000) + 100000,
      avgCycleTime: Math.floor(Math.random() * 30) + 15,
      closingRate: Math.floor(Math.random() * 30) + 20,
      topPerformer: 'Sarah Johnson',
      avgDealValue: 0,
      conversionRate: 0,
      growthRate: 0
    };

    // Calculate derived metrics
    currentMetrics.avgDealValue = Math.floor(currentMetrics.totalRevenue / currentMetrics.totalDeals);
    currentMetrics.conversionRate = Math.floor((currentMetrics.totalDeals / currentMetrics.totalLeads) * 100);
    currentMetrics.growthRate = Math.floor(Math.random() * 20) + 5;

    // Calculate trends (simulated)
    const trendData: TrendsData = {
      revenueTrend: Math.floor(Math.random() * 30) - 15,
      dealsTrend: Math.floor(Math.random() * 20) - 10,
      leadsTrend: Math.floor(Math.random() * 25) - 12,
      conversionTrend: Math.floor(Math.random() * 15) - 7
    };

    setMetrics(currentMetrics);
    setTrends(trendData);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatTrend = (trend: number): string => {
    const prefix = trend > 0 ? '+' : '';
    return `${prefix}${trend}%`;
  };

  const getTrendColor = (trend: number): string => {
    return trend > 0 ? '#10b981' : trend < 0 ? '#ef4444' : '#6b7280';
  };

  const getTrendIcon = (trend: number): string => {
    return trend > 0 ? '↗️' : trend < 0 ? '↘️' : '➡️';
  };

  const metricsData = [
    {
      title: 'Total Revenue',
      value: formatCurrency(metrics.totalRevenue),
      trend: trends.revenueTrend,
      icon: '💰',
      color: '#3b82f6'
    },
    {
      title: 'Deals Closed',
      value: metrics.totalDeals,
      trend: trends.dealsTrend,
      icon: '🤝',
      color: '#10b981'
    },
    {
      title: 'Average Deal Value',
      value: formatCurrency(metrics.avgDealValue),
      trend: trends.revenueTrend - trends.dealsTrend,
      icon: '📈',
      color: '#f59e0b'
    },
    {
      title: 'Conversion Rate',
      value: `${metrics.conversionRate}%`,
      trend: trends.conversionTrend,
      icon: '🎯',
      color: '#8b5cf6'
    },
    {
      title: 'Total Leads',
      value: metrics.totalLeads,
      trend: trends.leadsTrend,
      icon: '👥',
      color: '#06b6d4'
    },
    {
      title: 'Pipeline Value',
      value: formatCurrency(metrics.pipelineValue),
      trend: Math.floor(Math.random() * 25) - 12,
      icon: '🔄',
      color: '#84cc16'
    },
    {
      title: 'Closing Rate',
      value: `${metrics.closingRate}%`,
      trend: Math.floor(Math.random() * 20) - 10,
      icon: '✅',
      color: '#f97316'
    },
    {
      title: 'Avg Cycle Time',
      value: `${metrics.avgCycleTime} days`,
      trend: -Math.floor(Math.random() * 15) - 2,
      icon: '⏱️',
      color: '#ec4899'
    }
  ];

  return (
    <div>
      {/* Key Performance Indicators */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {metricsData.map((metric, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.875rem', fontWeight: '500' }}>
                  {metric.title}
                </h3>
                <p style={{ margin: '0', fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
                  {metric.value}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem' }}>
                    {getTrendIcon(metric.trend)}
                  </span>
                  <span style={{ color: getTrendColor(metric.trend), fontSize: '0.875rem', fontWeight: '600' }}>
                    {formatTrend(metric.trend)}
                  </span>
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
                    vs last {period}
                  </span>
                </div>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: metric.color + '20',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                {metric.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Summary */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: 'bold', color: '#1e293b' }}>
          Performance Summary
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.875rem', fontWeight: '500' }}>
              Top Performer
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#3b82f6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold'
              }}>
                {metrics.topPerformer.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: '600', color: '#1e293b' }}>
                  {metrics.topPerformer}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  {formatCurrency(Math.floor(metrics.totalRevenue * 0.3))} revenue
                </div>
              </div>
            </div>
          </div>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.875rem', fontWeight: '500' }}>
              Growth Rate
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                +{metrics.growthRate}%
              </span>
              <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                month over month
              </span>
            </div>
          </div>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.875rem', fontWeight: '500' }}>
              Pipeline Health
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#10b981',
                borderRadius: '50%'
              }}></div>
              <span style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: '600' }}>
                Healthy
              </span>
              <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                ({formatCurrency(metrics.pipelineValue)} value)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: 'bold', color: '#1e293b' }}>
          Quick Insights
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            padding: '1rem',
            backgroundColor: '#eff6ff',
            borderRadius: '8px',
            border: '1px solid #bfdbfe'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '16px' }}>💡</span>
              <span style={{ fontWeight: '600', color: '#1e293b' }}>Insight</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              Your conversion rate is {metrics.conversionRate}%, which is {metrics.conversionRate > 15 ? 'above' : 'below'} average. 
              Consider focusing on lead qualification to improve efficiency.
            </p>
          </div>
          <div style={{
            padding: '1rem',
            backgroundColor: '#f0fdf4',
            borderRadius: '8px',
            border: '1px solid #bbf7d0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '16px' }}>🎯</span>
              <span style={{ fontWeight: '600', color: '#1e293b' }}>Recommendation</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              Your average cycle time is {metrics.avgCycleTime} days. Focus on nurturing leads in the pipeline 
              to maintain momentum and reduce time to close.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsMetrics;
