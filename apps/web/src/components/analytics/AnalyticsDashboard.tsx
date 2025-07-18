'use client';

import React, { useState, useEffect } from 'react';
import DashboardCharts from './DashboardCharts';
import AnalyticsMetrics from './AnalyticsMetrics';

interface DashboardData {
  contacts: Array<{
    id: number;
    name: string;
    source: string;
    value: number;
    stage: string;
    createdAt: Date;
  }>;
  transactions: Array<{
    id: number;
    amount: number;
    status: string;
    createdAt: Date;
  }>;
  revenue: Array<any>;
  pipeline: Array<any>;
}

const AnalyticsDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    contacts: [],
    transactions: [],
    revenue: [],
    pipeline: []
  });

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API call - in real app, this would fetch actual data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulated data structure
      const data: DashboardData = {
        contacts: Array.from({ length: 50 }, (_, i) => ({
          id: i,
          name: `Contact ${i}`,
          source: ['Online', 'Referral', 'Cold Call', 'Social Media'][Math.floor(Math.random() * 4)],
          value: Math.floor(Math.random() * 50000) + 10000,
          stage: ['Prospect', 'Qualified', 'Proposal', 'Negotiation', 'Closed'][Math.floor(Math.random() * 5)],
          createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
        })),
        transactions: Array.from({ length: 25 }, (_, i) => ({
          id: i,
          amount: Math.floor(Math.random() * 100000) + 20000,
          status: ['Active', 'Pending', 'Closed'][Math.floor(Math.random() * 3)],
          createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)
        })),
        revenue: [],
        pipeline: []
      };

      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'revenue', label: 'Revenue', icon: '💰' },
    { id: 'leads', label: 'Leads', icon: '👥' },
    { id: 'pipeline', label: 'Pipeline', icon: '🔄' }
  ];

  const periodOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' }
  ];

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ margin: 0, color: '#64748b' }}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b' }}>
            Analytics Dashboard
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '1rem' }}>
            Track your business performance and insights
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {periodOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setSelectedPeriod(option.value)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #e2e8f0',
                  backgroundColor: selectedPeriod === option.value ? '#3b82f6' : 'white',
                  color: selectedPeriod === option.value ? 'white' : '#64748b',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (selectedPeriod !== option.value) {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedPeriod !== option.value) {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            onClick={loadDashboardData}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #e2e8f0',
              backgroundColor: 'white',
              color: '#64748b',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>🔄</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '1rem 1.5rem',
                border: 'none',
                backgroundColor: activeTab === tab.id ? '#f8fafc' : 'white',
                color: activeTab === tab.id ? '#3b82f6' : '#64748b',
                borderRadius: activeTab === tab.id ? '12px 12px 0 0' : '0',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
                borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent'
              }}
            >
              <span style={{ fontSize: '16px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: '2rem' }}>
          {activeTab === 'overview' && (
            <div>
              <AnalyticsMetrics data={dashboardData} period={selectedPeriod} />
              <div style={{ marginTop: '2rem' }}>
                <DashboardCharts data={dashboardData} period={selectedPeriod} />
              </div>
            </div>
          )}

          {activeTab === 'revenue' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: 'bold', color: '#1e293b' }}>
                  Revenue Analytics
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
                      $127,500
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      Total Revenue ({selectedPeriod})
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
                      $8,500
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      Average Deal Value
                    </div>
                  </div>
                </div>
              </div>
              <DashboardCharts data={dashboardData} period={selectedPeriod} />
            </div>
          )}

          {activeTab === 'leads' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: 'bold', color: '#1e293b' }}>
                  Lead Analytics
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
                      {dashboardData.contacts.length}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      Total Leads
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
                      18%
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      Conversion Rate
                    </div>
                  </div>
                </div>
              </div>
              <DashboardCharts data={dashboardData} period={selectedPeriod} />
            </div>
          )}

          {activeTab === 'pipeline' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: 'bold', color: '#1e293b' }}>
                  Pipeline Analytics
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
                      $285,000
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      Pipeline Value
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
                      23 days
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      Avg Cycle Time
                    </div>
                  </div>
                </div>
              </div>
              <DashboardCharts data={dashboardData} period={selectedPeriod} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
