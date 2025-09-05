import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  PlayIcon, 
  EyeIcon,
  ArrowTrendingUpIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface Video {
  video_id: string;
  video_title: string;
  video_views: number;
  publication_date: string;
  total_clicks?: number;
  click_through_rate?: number;
}

interface VideoTrafficData {
  correlation_data: Video[];
  total_videos: number;
  total_utm_clicks: number;
  average_ctr: number;
}

export function VideoTrafficAnalytics() {
  const [data, setData] = useState<VideoTrafficData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [daysBack, setDaysBack] = useState(30);

  useEffect(() => {
    fetchVideoTrafficData();
  }, [daysBack]);

  const fetchVideoTrafficData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/analytics/video-traffic-correlation?days_back=${daysBack}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching video traffic data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch video traffic data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Video Traffic Analytics</h2>
          <div className="animate-pulse bg-gray-200 h-10 w-32 rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="bg-gray-200 h-4 w-24 rounded mb-2"></div>
              <div className="bg-gray-200 h-8 w-16 rounded mb-1"></div>
              <div className="bg-gray-200 h-3 w-20 rounded"></div>
            </div>
          ))}
        </div>
        
        <div className="card p-6 animate-pulse">
          <div className="bg-gray-200 h-6 w-48 rounded mb-4"></div>
          <div className="bg-gray-200 h-64 w-full rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Video Traffic Analytics</h2>
        <div className="card p-6 text-center">
          <ChartBarIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load analytics</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchVideoTrafficData}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const chartData = data?.correlation_data?.map(video => ({
    title: video.video_title && video.video_title.length > 30 ? video.video_title.substring(0, 30) + '...' : (video.video_title || 'Untitled'),
    views: video.video_views || 0,
    clicks: video.total_clicks || 0,
    ctr: video.click_through_rate || 0
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Video Traffic Analytics</h2>
        <select 
          value={daysBack} 
          onChange={(e) => setDaysBack(Number(e.target.value))}
          className="input-field"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <PlayIcon className="w-8 h-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Videos</p>
              <p className="text-2xl font-bold text-gray-900">{data?.total_videos || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <EyeIcon className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total UTM Clicks</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(data?.total_utm_clicks || 0)}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <ArrowTrendingUpIcon className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Average CTR</p>
              <p className="text-2xl font-bold text-gray-900">{(data?.average_ctr || 0).toFixed(2)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Video Performance Correlation</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="title" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis yAxisId="views" orientation="left" />
              <YAxis yAxisId="clicks" orientation="right" />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'views' ? formatNumber(Number(value)) : value,
                  name === 'views' ? 'Views' : name === 'clicks' ? 'UTM Clicks' : 'CTR (%)'
                ]}
              />
              <Bar yAxisId="views" dataKey="views" fill="#3b82f6" name="views" />
              <Bar yAxisId="clicks" dataKey="clicks" fill="#10b981" name="clicks" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Video List */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Video Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Video
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Published
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  UTM Clicks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CTR
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.correlation_data?.map((video) => (
                <tr key={video.video_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                      {video.video_title || 'Untitled'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(video.publication_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(video.video_views)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {video.total_clicks || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(video.click_through_rate || 0).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
