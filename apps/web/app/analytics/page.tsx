'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AnalyticsPage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('authToken')) {
      router.push('/auth/login');
      return;
    }
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, [router]);

  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [65000, 78000, 90000, 81000, 95000, 110000],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const leadSourceData = {
    labels: ['Direct Mail', 'Cold Call', 'Online Ads', 'Referrals', 'Open House'],
    datasets: [
      {
        data: [30, 25, 20, 15, 10],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ]
      }
    ]
  };

  const conversionData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Leads',
        data: [45, 52, 38, 65],
        backgroundColor: 'rgba(59, 130, 246, 0.8)'
      },
      {
        label: 'Conversions',
        data: [12, 19, 15, 25],
        backgroundColor: 'rgba(34, 197, 94, 0.8)'
      }
    ]
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">Track your business performance and insights</p>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">$519,000</p>
            <p className="text-sm text-green-600 mt-2">+12.5% from last period</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">28.4%</p>
            <p className="text-sm text-green-600 mt-2">+3.2% from last period</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Avg Deal Size</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">$18,500</p>
            <p className="text-sm text-red-600 mt-2">-2.1% from last period</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Active Deals</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">47</p>
            <p className="text-sm text-green-600 mt-2">+8 from last week</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
            <div style={{ height: '300px' }}>
              <Line data={revenueData} options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Sources</h3>
            <div style={{ height: '300px' }}>
              <Doughnut data={leadSourceData} options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Conversion</h3>
            <div style={{ height: '300px' }}>
              <Bar data={conversionData} options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}