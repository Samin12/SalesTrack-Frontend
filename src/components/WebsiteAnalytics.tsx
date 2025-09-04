import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Globe, 
  Users, 
  Eye, 
  TrendingUp, 
  Calendar,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { useWebsiteAnalytics, useCombinedMetrics } from '../hooks/useWebsiteAnalytics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface WebsiteAnalyticsProps {
  days?: number;
}

export function WebsiteAnalytics({ days = 7 }: WebsiteAnalyticsProps) {
  const { data: websiteData, error: websiteError, isLoading: websiteLoading, mutate: refreshWebsite } = useWebsiteAnalytics(days);
  const { data: combinedData, error: combinedError, isLoading: combinedLoading, mutate: refreshCombined } = useCombinedMetrics(days);

  const handleRefresh = () => {
    refreshWebsite();
    refreshCombined();
  };

  if (websiteLoading || combinedLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Website Analytics</h2>
          <Button variant="outline" disabled>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (websiteError || combinedError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Website Analytics</h2>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <Globe className="h-5 w-5" />
              <span className="font-medium">Unable to load website analytics</span>
            </div>
            <p className="text-red-600 mt-2 text-sm">
              {websiteData?.error || combinedData?.note || 'Please check your PostHog configuration'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Website Analytics</h2>
          <p className="text-gray-600">PostHog website traffic for the last {days} days</p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Website Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Visits</p>
                <p className="text-2xl font-bold">{websiteData?.total_visits?.toLocaleString() || 0}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Last {days} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Visitors</p>
                <p className="text-2xl font-bold">{websiteData?.unique_visitors?.toLocaleString() || 0}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Unique users</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Page Views</p>
                <p className="text-2xl font-bold">{websiteData?.page_views?.toLocaleString() || 0}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Total page views</p>
          </CardContent>
        </Card>
      </div>

      {/* Combined YouTube vs Website Chart */}
      {combinedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>YouTube Views vs Website Visits</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={combinedData.daily_comparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value, name) => [
                      value.toLocaleString(),
                      name === 'youtube_views' ? 'YouTube Views' : 'Website Visits'
                    ]}
                  />
                  <Bar dataKey="website_visits" fill="#3b82f6" name="website_visits" />
                  <Bar dataKey="youtube_views" fill="#ef4444" name="youtube_views" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>{combinedData.note}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Pages */}
      {websiteData?.top_pages && websiteData.top_pages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Top Pages</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {websiteData.top_pages.slice(0, 10).map((page, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm truncate max-w-md">
                        {page.url.replace(/^https?:\/\//, '')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{page.views.toLocaleString()} views</span>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={page.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
