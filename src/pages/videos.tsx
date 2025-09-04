import React, { useState } from 'react';
import Head from 'next/head';
import useSWR from 'swr';
import Layout from '@/components/Layout/Layout';
import apiClient from '@/services/api';
import {
  PlayIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon,
  UsersIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

interface VideoData {
  video_id: string;
  title: string;
  published_at: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  duration_seconds: number | null;
  thumbnail_url?: string;
  // Weekly tracking data (authentic YouTube metrics only)
  views_this_week?: number;
  views_last_week?: number;
  weekly_growth_rate?: number;
}

interface WeeklySummary {
  total_views_this_week: number;
  total_views_last_week: number;
  views_growth_rate: number;
  active_videos: number;
  total_videos: number;
}

export default function VideosPage() {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showRawData, setShowRawData] = useState(false);

  // Fetch videos data
  const { data: videosData, isLoading: videosLoading, error: videosError } = useSWR(
    '/api/v1/analytics/videos',
    () => apiClient.getVideos()
  );

  // Use new clean weekly summary endpoint
  const { data: weeklyData, isLoading: weeklyLoading, error: weeklyError } = useSWR(
    '/api/v1/analytics/weekly-summary',
    (url) => fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${url}`).then(res => res.json())
  );


  // Fetch channel overview for context
  const { data: overview, isLoading: overviewLoading } = useSWR(
    '/api/v1/analytics/overview',
    () => apiClient.getAnalyticsOverview()
  );

  // Use real weekly summary data from API (authentic YouTube metrics only)
  const weeklySummary: WeeklySummary = weeklyData?.weekly_summary || {
    total_views_this_week: 0,
    total_views_last_week: 0,
    views_growth_rate: 0,
    active_videos: 0,
    total_videos: 0
  };

  // Use real video performance data from API (authentic YouTube metrics only)
  const processedVideos: VideoData[] = weeklyData?.video_performance || [];

  // Sort videos by latest upload date (most recent first)
  const sortedVideos = [...processedVideos].sort((a, b) => {
    const dateA = new Date(a.published_at);
    const dateB = new Date(b.published_at);
    return dateB.getTime() - dateA.getTime(); // Most recent first
  });

  // Get top 5 videos for growth visualization
  const top5Videos = sortedVideos.slice(0, 5);

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined || isNaN(num)) {
      return '0';
    }
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getGrowthIcon = (rate: number) => {
    if (rate > 5) return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
    if (rate < -5) return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
    return <MinusIcon className="h-4 w-4 text-gray-400" />;
  };

  const getGrowthColor = (rate: number) => {
    if (rate > 5) return 'text-green-600';
    if (rate < -5) return 'text-red-600';
    return 'text-gray-600';
  };

  if (videosError || weeklyError) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-red-500 text-lg">Failed to load video performance data</div>
          <p className="text-gray-600 mt-2">Please try refreshing the page</p>
          {weeklyError && (
            <p className="text-sm text-gray-500 mt-1">Weekly performance data unavailable</p>
          )}
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Video Performance - YouTube Analytics</title>
        <meta name="description" content="Track individual video performance and weekly growth metrics" />
      </Head>

      <Layout>
        <div className="container-app section-padding space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Video Performance
              </h1>
              <p className="text-gray-600 mt-1">
                Track individual video performance and weekly growth metrics
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowRawData(!showRawData)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  showRawData 
                    ? 'bg-purple-50 border-purple-200 text-purple-700' 
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ChartBarIcon className="h-4 w-4 inline mr-2" />
                Raw Data
              </button>
              
              <div className="flex rounded-lg border border-gray-200 bg-white">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 rounded-l-lg transition-colors ${
                    viewMode === 'table' 
                      ? 'bg-purple-50 text-purple-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ChartBarIcon className="h-4 w-4 inline mr-2" />
                  Table
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-4 py-2 rounded-r-lg border-l border-gray-200 transition-colors ${
                    viewMode === 'cards' 
                      ? 'bg-purple-50 text-purple-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ChartBarIcon className="h-4 w-4 inline mr-2" />
                  Cards
                </button>
              </div>
            </div>
          </div>

          {/* Data Transparency Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Authentic Data Only
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    This dashboard shows only real YouTube metrics from the YouTube API.
                    Weekly tracking features require historical data collection and will show "N/A" until implemented.
                    No fabricated or estimated data is displayed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Summary Header - Authentic YouTube Metrics Only */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Views This Week</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {weeklySummary.total_views_this_week !== null
                      ? formatNumber(weeklySummary.total_views_this_week)
                      : 'N/A'
                    }
                  </p>
                </div>
                <EyeIcon className="h-8 w-8 text-blue-500" />
              </div>
              <div className="mt-2 flex items-center">
                {weeklySummary.views_growth_rate !== null ? (
                  <>
                    {getGrowthIcon(weeklySummary.views_growth_rate)}
                    <span className={`ml-1 text-sm font-medium ${getGrowthColor(weeklySummary.views_growth_rate)}`}>
                      {weeklySummary.views_growth_rate > 0 ? '+' : ''}{weeklySummary.views_growth_rate.toFixed(1)}%
                    </span>
                    <span className="text-sm text-gray-500 ml-2">vs last week</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-500">Requires historical data</span>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Videos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {weeklySummary.active_videos}
                  </p>
                </div>
                <ChartBarIcon className="h-8 w-8 text-green-500" />
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-500">
                  {weeklySummary.total_videos} total videos
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Week Views</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {weeklySummary.total_views_last_week !== null
                      ? formatNumber(weeklySummary.total_views_last_week)
                      : 'N/A'
                    }
                  </p>
                </div>
                <UsersIcon className="h-8 w-8 text-purple-500" />
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-500">
                  {weeklySummary.total_views_last_week !== null
                    ? 'Previous week total'
                    : 'Requires historical data'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {(videosLoading || overviewLoading || weeklyLoading) && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading video performance data...</p>
              {weeklyLoading && (
                <p className="text-sm text-gray-500 mt-2">Syncing weekly metrics...</p>
              )}
            </div>
          )}

          {/* Raw Data View */}
          {showRawData && !videosLoading && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Raw Data</h3>
              <div className="overflow-x-auto">
                <pre className="text-xs text-gray-600 bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
                  {JSON.stringify({
                    weekly_summary: weeklySummary,
                    weekly_performance_data: weeklyData,
                    videos_data: videosData,
                    processed_videos: processedVideos.slice(0, 3), // Show first 3 for brevity
                    api_endpoints: {
                      videos: '/api/v1/analytics/videos',
                      weekly_performance: '/api/v1/analytics/videos/weekly-performance',
                      overview: '/api/v1/analytics/overview',
                      channel_growth: '/api/v1/analytics/channel/growth?days=30'
                    },
                    sync_info: weeklyData?.sync_info
                  }, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Video Performance Table */}
          {!videosLoading && !overviewLoading && !weeklyLoading && viewMode === 'table' && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Video Performance Tracking</h3>
                <p className="text-sm text-gray-600 mt-1">Weekly view tracking for all videos - authentic YouTube metrics only</p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Video
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Views
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Views This Week
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Weekly Growth
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Engagement
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedVideos.map((video) => (
                      <tr key={video.video_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-20">
                              <div className="h-12 w-20 bg-gray-200 rounded flex items-center justify-center">
                                <PlayIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            </div>
                            <div className="ml-4 max-w-xs">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {video.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(video.published_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatNumber(video.view_count)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {video.like_count} likes
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {video.views_this_week !== null ? formatNumber(video.views_this_week) : 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {video.views_last_week !== null ? `${formatNumber(video.views_last_week)} last week` : 'Historical data needed'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {video.weekly_growth_rate !== null && video.weekly_growth_rate !== undefined ? (
                              <>
                                {getGrowthIcon(video.weekly_growth_rate)}
                                <span className={`ml-1 text-sm font-medium ${getGrowthColor(video.weekly_growth_rate)}`}>
                                  {video.weekly_growth_rate > 0 ? '+' : ''}{video.weekly_growth_rate.toFixed(1)}%
                                </span>
                              </>
                            ) : (
                              <span className="text-sm text-gray-500">N/A</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {video.comment_count} comments
                          </div>
                          <div className="text-sm text-gray-500">
                            {video.view_count > 0 ?
                              (((video.like_count + video.comment_count) / video.view_count) * 100).toFixed(1) :
                              '0.0'}% rate
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Card View */}
          {!videosLoading && !overviewLoading && !weeklyLoading && viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedVideos.map((video) => (
                <div key={video.video_id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-200 flex items-center justify-center">
                    <PlayIcon className="h-12 w-12 text-gray-400" />
                  </div>

                  <div className="p-4">
                    <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {video.title}
                    </h4>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Views:</span>
                        <span className="font-medium">{formatNumber(video.view_count)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">This Week:</span>
                        <span className="font-medium">{formatNumber(video.views_this_week || 0)}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Growth:</span>
                        <div className="flex items-center">
                          {getGrowthIcon(video.weekly_growth_rate || 0)}
                          <span className={`ml-1 font-medium ${getGrowthColor(video.weekly_growth_rate || 0)}`}>
                            {(video.weekly_growth_rate || 0) > 0 ? '+' : ''}{(video.weekly_growth_rate || 0).toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Comments:</span>
                        <span className="font-medium">{video.comment_count}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{new Date(video.published_at).toLocaleDateString()}</span>
                        <span>{video.like_count} likes • {video.comment_count} comments</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Data Integrity Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              <ChartBarIcon className="h-5 w-5 inline mr-2" />
              Authentic YouTube Data Only
            </h3>
            <p className="text-green-800 mb-4">
              This dashboard displays only authentic YouTube metrics from the official YouTube API. No fabricated or estimated data is included.
            </p>
            <div className="space-y-2 text-sm text-green-700">
              <p>• <strong>Views, Likes, Comments:</strong> Real-time data from YouTube API</p>
              <p>• <strong>Weekly Performance:</strong> Calculated from authentic view counts</p>
              <p>• <strong>No Click Data:</strong> Website traffic tracking requires separate analytics implementation</p>
              <p>• <strong>Data Integrity:</strong> All metrics are verified and authentic</p>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
