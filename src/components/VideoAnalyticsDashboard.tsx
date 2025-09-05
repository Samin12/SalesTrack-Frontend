import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlayIcon,
  EyeIcon,
  CursorArrowRaysIcon
} from '@heroicons/react/24/outline';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format, parseISO } from 'date-fns';
import apiClient from '@/services/api';
import { VideoAnalyticsTableRow, VideoDetailAnalytics, VideoTimeSeriesData } from '@/types';

interface VideoAnalyticsDashboardProps {
  refreshTrigger?: number;
  className?: string;
}

type SortField = 'video_title' | 'publication_date' | 'total_views' | 'total_clicks' | 'click_through_rate';
type SortOrder = 'asc' | 'desc';

const VideoAnalyticsDashboard: React.FC<VideoAnalyticsDashboardProps> = ({ 
  refreshTrigger = 0,
  className = ''
}) => {
  const [videos, setVideos] = useState<VideoAnalyticsTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('total_clicks');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState(30);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, [refreshTrigger, dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiClient.getVideoAnalyticsDashboard({
        days: dateRange,
        sort_by: sortField === 'click_through_rate' ? 'ctr' : sortField.replace('total_', ''),
        sort_order: sortOrder
      });

      // Transform the response data to match our interface
      const transformedVideos: VideoAnalyticsTableRow[] = response.correlation_data?.map((video: any) => ({
        video_id: video.video_id,
        video_title: video.video_title,
        publication_date: video.publication_date || new Date().toISOString(),
        total_views: video.video_views || 0,
        total_clicks: video.total_clicks || 0,
        click_through_rate: video.click_through_rate || 0,
        utm_links_count: video.link_count || 0,
        thumbnail_url: video.thumbnail_url
      })) || [];

      setVideos(transformedVideos);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load video analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort videos
  const filteredAndSortedVideos = useMemo(() => {
    let filtered = videos.filter(video =>
      video.video_title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'publication_date') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      const numA = Number(aValue);
      const numB = Number(bValue);
      return sortOrder === 'asc' ? numA - numB : numB - numA;
    });

    return filtered;
  }, [videos, searchTerm, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const toggleRowExpansion = (videoId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(videoId)) {
      newExpanded.delete(videoId);
    } else {
      newExpanded.add(videoId);
    }
    setExpandedRows(newExpanded);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? 
      <ArrowUpIcon className="w-4 h-4" /> : 
      <ArrowDownIcon className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center space-x-2 text-red-800">
          <span className="font-medium">Error:</span>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header and Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <PlayIcon className="w-8 h-8 text-blue-600" />
              Video Analytics Dashboard
            </h2>
            <p className="text-gray-600 mt-1">
              Track video performance and UTM link engagement across your content
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Videos Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('video_title')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Video</span>
                    <SortIcon field="video_title" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('publication_date')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Published</span>
                    <SortIcon field="publication_date" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('total_views')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <EyeIcon className="w-4 h-4" />
                    <span>Views</span>
                    <SortIcon field="total_views" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('total_clicks')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <CursorArrowRaysIcon className="w-4 h-4" />
                    <span>Clicks</span>
                    <SortIcon field="total_clicks" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('click_through_rate')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>CTR</span>
                    <SortIcon field="click_through_rate" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedVideos.map((video) => (
                <VideoAnalyticsRow
                  key={video.video_id}
                  video={video}
                  isExpanded={expandedRows.has(video.video_id)}
                  onToggleExpansion={() => toggleRowExpansion(video.video_id)}
                  formatNumber={formatNumber}
                  formatDate={formatDate}
                  dateRange={dateRange}
                />
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedVideos.length === 0 && (
          <div className="text-center py-12">
            <PlayIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No videos found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'No video analytics data available.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// VideoAnalyticsRow component will be added in the next part
const VideoAnalyticsRow: React.FC<any> = ({ video, isExpanded, onToggleExpansion, formatNumber, formatDate, dateRange }) => {
  return (
    <>
      <tr 
        className="hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={onToggleExpansion}
      >
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              {video.thumbnail_url ? (
                <img className="h-10 w-10 rounded object-cover" src={video.thumbnail_url} alt="" />
              ) : (
                <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                  <PlayIcon className="h-5 w-5 text-gray-400" />
                </div>
              )}
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                {video.video_title}
              </div>
              <div className="text-sm text-gray-500">
                {video.utm_links_count} UTM link{video.utm_links_count !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {formatDate(video.publication_date)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {formatNumber(video.total_views)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {formatNumber(video.total_clicks)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {video.click_through_rate.toFixed(2)}%
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {isExpanded ? (
            <ChevronUpIcon className="h-5 w-5" />
          ) : (
            <ChevronDownIcon className="h-5 w-5" />
          )}
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={6} className="px-6 py-4 bg-gray-50">
            <VideoDetailChart videoId={video.video_id} dateRange={dateRange} />
          </td>
        </tr>
      )}
    </>
  );
};

// VideoDetailChart component
const VideoDetailChart: React.FC<{ videoId: string; dateRange: number }> = ({ videoId, dateRange }) => {
  const [chartData, setChartData] = useState<VideoTimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [keyMetrics, setKeyMetrics] = useState<any>(null);
  const [selectedDateRange, setSelectedDateRange] = useState(dateRange);

  useEffect(() => {
    fetchDetailedAnalytics();
  }, [videoId, selectedDateRange]);

  const fetchDetailedAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiClient.getVideoDetailAnalytics(videoId, {
        days: selectedDateRange
      });

      // Process the data to create time series
      const videoData = response.video_analytics;
      const linkData = response.link_performance;

      // Create time series data combining views and clicks
      const timeSeriesData: VideoTimeSeriesData[] = [];

      if (videoData?.daily_data) {
        videoData.daily_data.forEach((day: any) => {
          timeSeriesData.push({
            date: day.date,
            views: day.views || 0,
            clicks: 0 // Will be filled from UTM data
          });
        });
      }

      // Add click data from UTM links
      if (linkData?.links) {
        for (const link of linkData.links) {
          try {
            const linkAnalytics = await apiClient.getUTMLinkAnalytics(link.id, selectedDateRange);
            if (linkAnalytics?.daily_clicks) {
              linkAnalytics.daily_clicks.forEach((dayClick: any) => {
                const existingDay = timeSeriesData.find(d => d.date === dayClick.date);
                if (existingDay) {
                  existingDay.clicks += dayClick.clicks || 0;
                }
              });
            }
          } catch (err) {
            console.warn(`Failed to fetch analytics for link ${link.id}:`, err);
          }
        }
      }

      // Sort by date
      timeSeriesData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setChartData(timeSeriesData);

      // Calculate key metrics
      const totalViews = timeSeriesData.reduce((sum, day) => sum + day.views, 0);
      const totalClicks = timeSeriesData.reduce((sum, day) => sum + day.clicks, 0);
      const peakViewsDay = timeSeriesData.reduce((max, day) => day.views > max.views ? day : max, timeSeriesData[0] || { views: 0, date: '' });
      const peakClicksDay = timeSeriesData.reduce((max, day) => day.clicks > max.clicks ? day : max, timeSeriesData[0] || { clicks: 0, date: '' });

      setKeyMetrics({
        peak_views_date: peakViewsDay?.date || '',
        peak_clicks_date: peakClicksDay?.date || '',
        average_daily_views: Math.round(totalViews / Math.max(timeSeriesData.length, 1)),
        average_daily_clicks: Math.round(totalClicks / Math.max(timeSeriesData.length, 1)),
        total_utm_links: linkData?.total_links || 0
      });

    } catch (err) {
      console.error('Failed to fetch detailed analytics:', err);
      setError('Failed to load detailed analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatChartDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM dd');
    } catch {
      return dateStr;
    }
  };

  const formatTooltipDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM dd, yyyy');
    } catch {
      return dateStr;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{formatTooltipDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-900">Performance Over Time</h3>
        <select
          value={selectedDateRange}
          onChange={(e) => setSelectedDateRange(Number(e.target.value))}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
          <option value={60}>Last 60 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Time Series Chart */}
      {chartData.length > 0 ? (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="date"
                tickFormatter={formatChartDate}
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="views"
                orientation="left"
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}K` : value.toString()}
              />
              <YAxis
                yAxisId="clicks"
                orientation="right"
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                yAxisId="views"
                type="monotone"
                dataKey="views"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
                name="Views"
              />
              <Line
                yAxisId="clicks"
                type="monotone"
                dataKey="clicks"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                name="Clicks"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <PlayIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">No data available for the selected period</p>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      {keyMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-800">Avg Daily Views</div>
            <div className="text-2xl font-bold text-blue-900">
              {keyMetrics.average_daily_views.toLocaleString()}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm font-medium text-green-800">Avg Daily Clicks</div>
            <div className="text-2xl font-bold text-green-900">
              {keyMetrics.average_daily_clicks.toLocaleString()}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm font-medium text-purple-800">Peak Views</div>
            <div className="text-lg font-bold text-purple-900">
              {keyMetrics.peak_views_date ? formatChartDate(keyMetrics.peak_views_date) : 'N/A'}
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-sm font-medium text-orange-800">UTM Links</div>
            <div className="text-2xl font-bold text-orange-900">
              {keyMetrics.total_utm_links}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoAnalyticsDashboard;
