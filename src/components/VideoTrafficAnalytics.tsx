import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, ExternalLink, Eye, MousePointer, Percent } from 'lucide-react';

interface VideoTrafficData {
  video_id: string;
  video_title: string;
  video_views: number;
  link_count: number;
  total_clicks: number;
  click_through_rate: number;
  views_to_clicks_ratio: string;
}

interface VideoTrafficAnalyticsProps {
  refreshTrigger?: number;
}

export const VideoTrafficAnalytics: React.FC<VideoTrafficAnalyticsProps> = ({
  refreshTrigger = 0
}) => {
  const [trafficData, setTrafficData] = useState<VideoTrafficData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [sortBy, setSortBy] = useState<'views' | 'clicks' | 'ctr'>('clicks');
  const [dateRange, setDateRange] = useState<number>(30);

  useEffect(() => {
    fetchTrafficData();
  }, [refreshTrigger, dateRange]);

  const fetchTrafficData = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/v1/analytics/video-traffic-correlation?days_back=${dateRange}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch traffic correlation data');
      }

      const data = await response.json();
      setTrafficData(data.correlation_data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load traffic data');
    } finally {
      setLoading(false);
    }
  };

  const sortedData = [...trafficData].sort((a, b) => {
    switch (sortBy) {
      case 'views':
        return b.video_views - a.video_views;
      case 'clicks':
        return b.total_clicks - a.total_clicks;
      case 'ctr':
        return b.click_through_rate - a.click_through_rate;
      default:
        return 0;
    }
  });

  const chartData = sortedData.slice(0, 10).map(item => ({
    name: item.video_title.length > 30 
      ? item.video_title.substring(0, 30) + '...' 
      : item.video_title,
    views: item.video_views,
    clicks: item.total_clicks,
    ctr: item.click_through_rate,
  }));

  const totalViews = trafficData.reduce((sum, item) => sum + item.video_views, 0);
  const totalClicks = trafficData.reduce((sum, item) => sum + item.total_clicks, 0);
  const averageCTR = trafficData.length > 0 
    ? trafficData.reduce((sum, item) => sum + item.click_through_rate, 0) / trafficData.length 
    : 0;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchTrafficData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Video Traffic Analytics</h2>
          </div>
          
          <div className="flex gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'views' | 'clicks' | 'ctr')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="clicks">Sort by Clicks</option>
              <option value="ctr">Sort by CTR</option>
              <option value="views">Sort by Views</option>
            </select>
          </div>
        </div>

        {/* Summary Stats - Click-Focused */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <MousePointer className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Total Clicks</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {totalClicks.toLocaleString()}
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Total Views</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {totalViews.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Average CTR</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              {averageCTR.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Click Performance by Video
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === 'views') return [value.toLocaleString(), 'Views'];
                    if (name === 'clicks') return [value.toLocaleString(), 'Clicks'];
                    if (name === 'ctr') return [`${value}%`, 'CTR'];
                    return [value, name];
                  }}
                />
                <Bar yAxisId="left" dataKey="clicks" fill="#10B981" name="clicks" />
                <Bar yAxisId="left" dataKey="views" fill="#E5E7EB" name="views" opacity={0.3} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detailed Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Video Performance Details</h3>
        </div>
        
        {sortedData.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No video traffic data available.</p>
            <p className="text-sm mt-2">Create some UTM tracking links to start seeing data here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Video
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Links
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CTR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ratio
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedData.map((item) => (
                  <tr key={item.video_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {item.video_title}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {item.video_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold text-green-600">
                      {item.total_clicks.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.link_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.video_views.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.click_through_rate >= 1.0 
                          ? 'bg-green-100 text-green-800'
                          : item.click_through_rate >= 0.5
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.click_through_rate.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.views_to_clicks_ratio}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
