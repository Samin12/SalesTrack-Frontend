import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Play, 
  MousePointer, 
  Globe,
  TrendingUp,
  RefreshCw,
  Eye
} from 'lucide-react';
import { useWeeklySummary } from '../hooks/useWeeklySummary';

export function WeeklySummary() {
  const { data, error, isLoading, mutate } = useWeeklySummary();

  const handleRefresh = () => {
    mutate();
  };

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>This Week's Performance</span>
            </CardTitle>
            <Button variant="outline" disabled size="sm">
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Loading...
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-8 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <Calendar className="h-5 w-5" />
            <span>This Week's Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-red-600">Unable to load weekly summary</p>
            <Button variant="outline" onClick={handleRefresh} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of current week (Sunday)
  const weekEnd = new Date();
  weekEnd.setDate(weekStart.getDate() + 6); // End of current week (Saturday)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>This Week's Performance</span>
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {formatDate(weekStart)} - {formatDate(weekEnd)}
            </p>
          </div>
          <Button variant="outline" onClick={handleRefresh} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* YouTube Views This Week */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Play className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">YouTube Views</span>
              </div>
              <Badge variant="secondary" className="bg-red-200 text-red-800">
                This Week
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-red-900">
                {data?.youtube_views_this_week !== null && data?.youtube_views_this_week !== undefined
                  ? data.youtube_views_this_week.toLocaleString()
                  : 'N/A'}
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Eye className="h-4 w-4 text-red-600" />
                <span className="text-red-700">
                  {data?.youtube_views_this_week !== null && data?.youtube_views_this_week !== undefined
                    ? `Across ${data?.total_videos || 0} videos`
                    : 'Weekly data not available'}
                </span>
              </div>
              {data?.youtube_growth_percentage !== null && data?.youtube_growth_percentage !== undefined && (
                <div className="flex items-center space-x-1 text-sm">
                  <TrendingUp className="h-4 w-4 text-red-600" />
                  <span className={`font-medium ${
                    (data.youtube_growth_percentage || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(data.youtube_growth_percentage || 0) >= 0 ? '+' : ''}
                    {(data.youtube_growth_percentage || 0).toFixed(1)}% vs last week
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* UTM Link Clicks This Week */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <MousePointer className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">Link Clicks</span>
              </div>
              <Badge variant="secondary" className="bg-blue-200 text-blue-800">
                This Week
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-900">
                {data?.utm_clicks_this_week?.toLocaleString() || '0'}
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <MousePointer className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700">
                  From {data?.active_utm_links || 0} active links
                </span>
              </div>
              {data?.utm_growth_percentage !== null && data?.utm_growth_percentage !== undefined && (
                <div className="flex items-center space-x-1 text-sm">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className={`font-medium ${
                    (data.utm_growth_percentage || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(data.utm_growth_percentage || 0) >= 0 ? '+' : ''}
                    {(data.utm_growth_percentage || 0).toFixed(1)}% vs last week
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Website Visits This Week */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Website Visits</span>
              </div>
              <Badge variant="secondary" className="bg-green-200 text-green-800">
                This Week
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-green-900">
                {data?.website_visits_this_week?.toLocaleString() || '0'}
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Globe className="h-4 w-4 text-green-600" />
                <span className="text-green-700">
                  {data?.unique_visitors_this_week || 0} unique visitors
                </span>
              </div>
              {data?.website_growth_percentage !== null && data?.website_growth_percentage !== undefined && (
                <div className="flex items-center space-x-1 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className={`font-medium ${
                    (data.website_growth_percentage || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(data.website_growth_percentage || 0) >= 0 ? '+' : ''}
                    {(data.website_growth_percentage || 0).toFixed(1)}% vs last week
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Week Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Top Video:</span> {data?.top_video_this_week || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Most Clicked Link:</span> {data?.top_utm_link_this_week || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Top Page:</span> {data?.top_website_page_this_week || 'N/A'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
