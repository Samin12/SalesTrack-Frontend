import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Layout from '../components/Layout/Layout';
import MetricCard from '../components/custom/MetricCard';
import {
  CombinedVideoAnalytics,
  VideoOverview,
  UTMLink,
  GrowthTrend,
  LoadingState
} from '../types';
import {
  ChartBarIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  status: string;
  youtube_data: {
    channel_title: string;
    total_subscribers: number;
    total_views: number;
    total_videos: number;
    youtube_views_this_week: number;
    youtube_growth_percentage: number;
    videos_published_this_week: number;
    average_views_per_video: number;
  };
  growth_data: {
    estimated_growth_percentage: number;
    recent_average_views: number;
    older_average_views: number;
  };
  videos: CombinedVideoAnalytics[];
  utm_data: {
    total_clicks: number;
    total_links: number;
    average_ctr: number;
  };
}

const Analytics: NextPage = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: true });
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    setLoading({ isLoading: true });
    try {
      // Fetch combined analytics data
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/analytics/combined?period=${selectedPeriod}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        setLoading({ isLoading: false, error: 'Failed to fetch analytics data' });
      }
    } catch (error) {
      setLoading({ isLoading: false, error: 'Network error' });
    } finally {
      setLoading({ isLoading: false });
    }
  };

  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined || isNaN(num)) {
      return '0';
    }
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercentage = (num: number | null | undefined): string => {
    if (num === null || num === undefined || isNaN(num)) {
      return '0.0%';
    }
    return `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  const GrowthIndicator: React.FC<{ value: number | null | undefined; className?: string }> = ({ value, className = '' }) => {
    // Handle null/undefined values
    const safeValue = value ?? 0;
    const isPositive = safeValue >= 0;
    const Icon = isPositive ? ArrowUpIcon : ArrowDownIcon;
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';

    return (
      <div className={`flex items-center ${colorClass} ${className}`}>
        <Icon className="h-4 w-4 mr-1" />
        <span className="text-sm font-medium">{formatPercentage(safeValue)}</span>
      </div>
    );
  };



  const VideoAnalyticsRow: React.FC<{ video: CombinedVideoAnalytics }> = ({ video }) => (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
          {video.video_info.title}
        </div>
        <div className="text-sm text-gray-500">
          {new Date(video.video_info.published_at).toLocaleDateString()}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatNumber(video.video_info.view_count)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {video.utm_links.length}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatNumber(video.total_utm_clicks)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {((video.click_through_rate || 0) * 100).toFixed(2)}%
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex space-x-2">
          <GrowthIndicator value={video.weekly_growth.views_growth} />
          <span className="text-gray-400">|</span>
          <GrowthIndicator value={video.weekly_growth.clicks_growth} />
        </div>
      </td>
    </tr>
  );

  if (loading.isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (loading.error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-600">{loading.error}</p>
          <button 
            onClick={fetchAnalyticsData}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Combined Analytics</h1>
            <p className="text-gray-600">Video performance and UTM tracking insights</p>
          </div>
          <div className="flex space-x-2">
            {(['7d', '30d', '90d'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  selectedPeriod === period
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Key Insights */}
        {analyticsData && (
          <>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Key Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {analyticsData.videos.filter(v => v.total_utm_clicks > 0).length}
                  </p>
                  <p className="text-sm text-gray-600">Videos with UTM Links</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {analyticsData.videos.reduce((sum, v) => sum + v.utm_links.length, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total UTM Links</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {analyticsData.videos.length > 0 ?
                      Math.max(...analyticsData.videos.map(v => (v.click_through_rate || 0) * 100)).toFixed(2) : 0}%
                  </p>
                  <p className="text-sm text-gray-600">Best CTR</p>
                </div>
              </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <MetricCard
                title="Total Views"
                value={formatNumber(analyticsData.youtube_data.total_views)}
                change={analyticsData.growth_data.estimated_growth_percentage}
                changeLabel="growth estimate"
                icon={EyeIcon}
              />
              <MetricCard
                title="Total Clicks"
                value={formatNumber(analyticsData.utm_data.total_clicks)}
                changeLabel="from UTM links"
                icon={CursorArrowRaysIcon}
              />
              <MetricCard
                title="Subscribers"
                value={formatNumber(analyticsData.youtube_data.total_subscribers)}
                changeLabel="total"
                icon={ChartBarIcon}
              />
              <MetricCard
                title="Videos"
                value={analyticsData.youtube_data.total_videos.toString()}
                changeLabel="published"
                icon={ArrowTrendingUpIcon}
              />
            </div>

            {/* Top Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Videos by CTR */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Top Videos by CTR</h2>
                  <p className="text-sm text-gray-600">Videos with highest click-through rates</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {analyticsData.videos
                      .filter(video => video.total_utm_clicks > 0)
                      .sort((a, b) => (b.click_through_rate || 0) - (a.click_through_rate || 0))
                      .slice(0, 5)
                      .map((video, index) => (
                        <div key={video.video_info.video_id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              index === 0 ? 'bg-yellow-100 text-yellow-800' :
                              index === 1 ? 'bg-gray-100 text-gray-800' :
                              index === 2 ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                {video.video_info.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatNumber(video.video_info.view_count)} views • {video.total_utm_clicks} clicks
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {((video.click_through_rate || 0) * 100).toFixed(2)}%
                            </p>
                            <GrowthIndicator value={video.weekly_growth.clicks_growth} className="justify-end" />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
                  <p className="text-sm text-gray-600">Latest UTM link performance</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {analyticsData.videos
                      .flatMap(video =>
                        video.utm_links.map(link => ({
                          ...link,
                          video_title: video.video_info.title
                        }))
                      )
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .slice(0, 5)
                      .map((link) => (
                        <div key={link.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {link.pretty_slug}
                            </p>
                            <p className="text-xs text-gray-500 max-w-xs truncate">
                              {link.video_title}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {link.click_count} clicks
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(link.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Video Performance Table */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">All Videos Performance</h2>
                <p className="text-sm text-gray-600">Complete video views and UTM click performance</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Video
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        UTM Links
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Clicks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CTR
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Growth (Views | Clicks)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analyticsData.videos.map((video) => (
                      <VideoAnalyticsRow key={video.video_info.video_id} video={video} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Analytics;
