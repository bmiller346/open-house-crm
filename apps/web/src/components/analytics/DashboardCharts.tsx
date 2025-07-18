'use client';

import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface DashboardChartsProps {
  data: any;
  period?: string;
}

interface ChartDataItem {
  date: string;
  revenue: number;
  deals: number;
}

interface LeadSourceItem {
  source: string;
  count: number;
  color: string;
}

interface PipelineStageItem {
  stage: string;
  count: number;
  color: string;
}

interface ChartData {
  revenue: ChartDataItem[];
  deals: ChartDataItem[];
  leadSources: LeadSourceItem[];
  pipelineStages: PipelineStageItem[];
  monthlyTrends: ChartDataItem[];
}

const DashboardCharts = ({ data, period = '30d' }: DashboardChartsProps) => {
  const [chartData, setChartData] = useState<ChartData>({
    revenue: [],
    deals: [],
    leadSources: [],
    pipelineStages: [],
    monthlyTrends: []
  });

  useEffect(() => {
    generateChartData();
  }, [data, period]);

  const generateChartData = () => {
    const now = new Date();
    const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const dateRange = eachDayOfInterval({
      start: subDays(now, daysBack),
      end: now
    });

    // Generate revenue trend data
    const revenueData = dateRange.map(date => ({
      date: format(date, 'MM/dd'),
      revenue: Math.floor(Math.random() * 15000) + 5000,
      deals: Math.floor(Math.random() * 8) + 2
    }));

    // Generate lead sources data
    const leadSourcesData = [
      { source: 'Online Marketing', count: 45, color: '#3b82f6' },
      { source: 'Referrals', count: 38, color: '#10b981' },
      { source: 'Cold Calling', count: 22, color: '#f59e0b' },
      { source: 'Social Media', count: 18, color: '#8b5cf6' },
      { source: 'Direct Mail', count: 15, color: '#ef4444' },
      { source: 'Networking', count: 12, color: '#06b6d4' }
    ];

    // Generate pipeline stages data
    const pipelineData = [
      { stage: 'Prospecting', count: 25, color: '#64748b' },
      { stage: 'Qualified', count: 18, color: '#3b82f6' },
      { stage: 'Presentation', count: 12, color: '#f59e0b' },
      { stage: 'Negotiation', count: 8, color: '#8b5cf6' },
      { stage: 'Closing', count: 5, color: '#10b981' }
    ];

    setChartData({
      revenue: revenueData,
      deals: revenueData,
      leadSources: leadSourcesData,
      pipelineStages: pipelineData,
      monthlyTrends: revenueData
    });
  };

  // Revenue Trend Chart
  const revenueChartData = {
    labels: chartData.revenue.map(item => item.date),
    datasets: [
      {
        label: 'Revenue',
        data: chartData.revenue.map(item => item.revenue),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ]
  };

  // Deals Count Chart
  const dealsChartData = {
    labels: chartData.revenue.map(item => item.date),
    datasets: [
      {
        label: 'Deals Closed',
        data: chartData.revenue.map(item => item.deals),
        backgroundColor: '#10b981',
        borderColor: '#10b981',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      }
    ]
  };

  // Lead Sources Pie Chart
  const leadSourcesChartData = {
    labels: chartData.leadSources.map(item => item.source),
    datasets: [
      {
        data: chartData.leadSources.map(item => item.count),
        backgroundColor: chartData.leadSources.map(item => item.color),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 4,
      }
    ]
  };

  // Pipeline Stages Doughnut Chart
  const pipelineChartData = {
    labels: chartData.pipelineStages.map(item => item.stage),
    datasets: [
      {
        data: chartData.pipelineStages.map(item => item.count),
        backgroundColor: chartData.pipelineStages.map(item => item.color),
        borderColor: '#ffffff',
        borderWidth: 3,
        cutout: '60%',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 13
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(107, 114, 128, 0.1)'
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11
          },
          callback: function(value: any) {
            return typeof value === 'number' && value >= 1000 
              ? '$' + (value / 1000).toFixed(0) + 'K'
              : '$' + value;
          }
        }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: any, b: any) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
      {/* Revenue Trend Chart */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 'bold', color: '#1e293b' }}>
            Revenue Trend
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['7d', '30d', '90d'].map(p => (
              <button
                key={p}
                onClick={() => {/* Handle period change */}}
                style={{
                  padding: '0.25rem 0.75rem',
                  border: '1px solid #e2e8f0',
                  backgroundColor: period === p ? '#3b82f6' : 'white',
                  color: period === p ? 'white' : '#64748b',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div style={{ height: '300px' }}>
          <Line data={revenueChartData} options={chartOptions} />
        </div>
      </div>

      {/* Deals Count Chart */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: 'bold', color: '#1e293b' }}>
          Deals Closed
        </h3>
        <div style={{ height: '300px' }}>
          <Bar data={dealsChartData} options={{
            ...chartOptions,
            scales: {
              ...chartOptions.scales,
              y: {
                ...chartOptions.scales.y,
                ticks: {
                  ...chartOptions.scales.y.ticks,
                  callback: function(value: any) {
                    return value;
                  }
                }
              }
            }
          }} />
        </div>
      </div>

      {/* Lead Sources Chart */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: 'bold', color: '#1e293b' }}>
          Lead Sources
        </h3>
        <div style={{ height: '300px' }}>
          <Pie data={leadSourcesChartData} options={pieChartOptions} />
        </div>
      </div>

      {/* Pipeline Stages Chart */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: 'bold', color: '#1e293b' }}>
          Pipeline Stages
        </h3>
        <div style={{ height: '300px' }}>
          <Doughnut data={pipelineChartData} options={pieChartOptions} />
        </div>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
            {chartData.pipelineStages.reduce((sum, stage) => sum + stage.count, 0)}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Total Active Deals
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
