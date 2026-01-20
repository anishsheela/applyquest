import React, { useState, useMemo } from 'react';
import { JobApplication, ApplicationStatus } from '../types';
import { mockApplications } from '../utils/mockData';
import {
  Calendar,
  MapPin,
  Filter,
  Download
} from 'lucide-react';
import KeyMetricsCards from '../components/analytics/KeyMetricsCards';
import StatusDistributionChart from '../components/analytics/StatusDistributionChart';
import ApplicationsTimelineChart from '../components/analytics/ApplicationsTimelineChart';
import TopCompaniesAnalysis from '../components/analytics/TopCompaniesAnalysis';
import ApplicationFunnelChart from '../components/analytics/ApplicationFunnelChart';
import TechStackAnalysis from '../components/analytics/TechStackAnalysis';


const Analytics: React.FC = () => {
  const [applications] = useState<JobApplication[]>(mockApplications);
  const [dateRange, setDateRange] = useState<'30d' | '90d' | '6m' | 'all'>('all');

  // Filter applications by date range
  const filteredApplications = useMemo(() => {
    if (dateRange === 'all') return applications;

    const now = new Date();
    const cutoffDate = new Date();

    switch (dateRange) {
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case '6m':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
    }

    return applications.filter(app => new Date(app.createdAt) >= cutoffDate);
  }, [applications, dateRange]);

  // Calculate key metrics
  const metrics = useMemo(() => {
    const total = filteredApplications.length;
    const responded = filteredApplications.filter(app =>
      !['Applied', 'Ghosted'].includes(app.status)
    ).length;
    const interviewed = filteredApplications.filter(app =>
      ['Phone Screen', 'Technical Round 1', 'Technical Round 2', 'Final Round'].includes(app.status)
    ).length;
    const offers = filteredApplications.filter(app => app.status === 'Offer').length;
    const rejected = filteredApplications.filter(app => app.status === 'Rejected').length;
    const ghosted = filteredApplications.filter(app => app.status === 'Ghosted').length;

    return {
      total,
      responded,
      interviewed,
      offers,
      rejected,
      ghosted,
      responseRate: total > 0 ? Math.round((responded / total) * 100) : 0,
      interviewRate: total > 0 ? Math.round((interviewed / total) * 100) : 0,
      offerRate: total > 0 ? Math.round((offers / total) * 100) : 0,
    };
  }, [filteredApplications]);

  // Status distribution data for pie chart
  const statusData = useMemo(() => {
    const statusCounts = filteredApplications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<ApplicationStatus, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
      percentage: Math.round((count / filteredApplications.length) * 100)
    }));
  }, [filteredApplications]);


  // Applications over time data
  const timelineData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    return last30Days.map(date => {
      const dayApps = filteredApplications.filter(app =>
        app.createdAt.startsWith(date)
      );
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        applications: dayApps.length,
        responded: dayApps.filter(app => !['Applied', 'Ghosted'].includes(app.status)).length
      };
    });
  }, [filteredApplications]);

  // Company analysis
  const companyData = useMemo(() => {
    const companyStats = filteredApplications.reduce((acc, app) => {
      if (!acc[app.companyName]) {
        acc[app.companyName] = { total: 0, offers: 0 };
      }
      acc[app.companyName].total++;
      if (app.status === 'Offer') {
        acc[app.companyName].offers++;
      }
      return acc;
    }, {} as Record<string, { total: number; offers: number }>);

    return Object.entries(companyStats)
      .map(([company, stats]) => ({
        company: company.length > 15 ? company.substring(0, 15) + '...' : company,
        applications: stats.total,
        offers: stats.offers,
        successRate: stats.total > 0 ? Math.round((stats.offers / stats.total) * 100) : 0
      }))
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 10);
  }, [filteredApplications]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Insights into your job search performance and trends</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Date Range Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="6m">Last 6 Months</option>
                <option value="all">All Time</option>
              </select>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <KeyMetricsCards metrics={metrics} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <StatusDistributionChart statusData={statusData} />

        {/* Applications Timeline */}
        <ApplicationsTimelineChart timelineData={timelineData} />

        {/* Top Companies */}
        <TopCompaniesAnalysis companyData={companyData} />

        {/* Application Funnel */}
        <ApplicationFunnelChart applications={filteredApplications} />
      </div>

      {/* Tech Stack Analysis & Germany Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tech Stack Analysis */}
        <TechStackAnalysis applications={filteredApplications} />

        {/* Germany Map Placeholder */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full p-3">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Germany Map Visualization</h2>
          </div>

          <div className="h-80 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Interactive Germany Map</h3>
              <p className="text-gray-600 text-sm max-w-sm">
                Coming soon! Interactive map showing your applications across German cities and states,
                with color-coded pins for different application statuses.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;