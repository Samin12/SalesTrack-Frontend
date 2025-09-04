/**
 * Dashboard overview page
 */
import React from 'react';
import useSWR from 'swr';
import Layout from '@/components/Layout/Layout';
import MetricCard from '@/components/custom/MetricCard';
import GrowthChart from '@/components/Charts/GrowthChart';
import {
  UsersIcon,
  VideoCameraIcon,
  EyeIcon,
  GlobeAltIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import apiClient from '@/services/api';
import { AnalyticsOverviewResponse, ChartDataPoint } from '@/types';

export default function Dashboard() {
  const { data: overview, error, isLoading } = useSWR<AnalyticsOverviewResponse>(
    '/api/v1/analytics/overview',
    () => apiClient.getAnalyticsOverview()
  );

  const { data: growthData, isLoading: growthLoading } = useSWR(
    '/api/v1/analytics/channel/growth?days=30',
    () => apiClient.getChannelGrowth({ days: 30 })
  );

  // Transform growth data for chart
  const chartData: ChartDataPoint[] = growthData?.historical_data?.map(item => ({
    date: item.date,
    value: item.subscriber_count,
    label: 'subscribers'
  })) || [];

  const viewsChartData: ChartDataPoint[] = growthData?.historical_data?.map(item => ({
    date: item.date,
    value: item.view_count,
    label: 'views'
  })) || [];

  if (error) {
    return (
      <Layout title="Dashboard">
        <div className="container-app section-padding">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <ChartBarIcon className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Unable to load analytics data
            </h2>
            <p className="text-gray-600 mb-6">
              {error.message || 'Please check your connection and try again.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="container-app section-padding">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Analytics Overview
          </h1>
          <p className="text-gray-600">
            Track your YouTube channel performance and growth metrics
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Subscribers"
            value={overview?.channel_overview?.subscriber_count || 0}
            change={overview?.recent_growth?.subscriber_growth_rate}
            changeLabel="total"
            icon={UsersIcon}
            loading={isLoading}
          />

          <MetricCard
            title="Total Views"
            value={overview?.channel_overview?.view_count || 0}
            change={overview?.recent_growth?.view_growth_rate}
            changeLabel="lifetime"
            icon={EyeIcon}
            loading={isLoading}
          />
          
          <MetricCard
            title="Videos"
            value={overview?.channel_overview?.video_count || 0}
            icon={VideoCameraIcon}
            loading={isLoading}
          />
          
          <MetricCard
            title="Website Clicks"
            value={overview?.traffic_summary?.total_clicks_last_30_days || 0}
            changeLabel="last 30 days"
            icon={GlobeAltIcon}
            loading={isLoading}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <GrowthChart
            data={chartData}
            title="Subscriber Growth (30 days)"
            color="#f054ff"
            loading={growthLoading}
          />
          
          <GrowthChart
            data={viewsChartData}
            title="View Count Growth (30 days)"
            color="#22c55e"
            loading={growthLoading}
          />
        </div>

        {/* Top Videos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Performing Videos */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2 text-primary-600" />
              Top Performing Videos
            </h3>
            
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="loading-pulse w-16 h-12 rounded"></div>
                    <div className="flex-1">
                      <div className="loading-pulse h-4 w-full rounded mb-2"></div>
                      <div className="loading-pulse h-3 w-24 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {overview?.top_videos?.slice(0, 3).map((video, index) => (
                  <div key={video.video_id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-600 rounded-lg text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {video.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {video.view_count.toLocaleString()} views
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Key Insights */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2 text-primary-600" />
              Key Insights
            </h3>
            
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="loading-pulse h-4 w-full rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {overview?.key_insights?.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => apiClient.syncAnalyticsData()}
              className="btn-primary btn-sm"
            >
              Sync Data
            </button>
            <a
              href="https://www.youtube.com/@SaminYasar_"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline btn-sm"
            >
              View Channel
            </a>
            <button className="btn-ghost btn-sm">
              Export Data
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
