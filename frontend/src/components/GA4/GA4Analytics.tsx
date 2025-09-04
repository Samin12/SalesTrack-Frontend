/**
 * GA4 Analytics Display Component
 * Shows comparison between direct tracking and GA4 data
 */
import React from 'react';
import { 
  ChartBarIcon, 
  UsersIcon, 
  CursorArrowRaysIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface UTMLink {
  id: number;
  video_id: string;
  destination_url: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content?: string;
  utm_term?: string;
  tracking_url: string;
  created_at: string;
  is_active: boolean;
  ga4_enabled: boolean;
  ga4_clicks: number;
  ga4_users: number;
  ga4_sessions: number;
  ga4_last_sync?: string;
  click_count: number; // Direct tracking clicks
}

interface GA4AnalyticsProps {
  utmLinks: UTMLink[];
  className?: string;
}

const GA4Analytics: React.FC<GA4AnalyticsProps> = ({ utmLinks, className = '' }) => {
  // Calculate totals
  const totals = utmLinks.reduce((acc, link) => ({
    directClicks: acc.directClicks + link.click_count,
    ga4Clicks: acc.ga4Clicks + link.ga4_clicks,
    ga4Users: acc.ga4Users + link.ga4_users,
    ga4Sessions: acc.ga4Sessions + link.ga4_sessions,
    ga4EnabledLinks: acc.ga4EnabledLinks + (link.ga4_enabled ? 1 : 0)
  }), {
    directClicks: 0,
    ga4Clicks: 0,
    ga4Users: 0,
    ga4Sessions: 0,
    ga4EnabledLinks: 0
  });

  const MetricCard: React.FC<{
    title: string;
    directValue: number;
    ga4Value?: number;
    icon: React.ComponentType<any>;
    color: string;
  }> = ({ title, directValue, ga4Value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          
          {/* Direct Tracking */}
          <div className="mt-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Direct:</span>
              <span className="text-lg font-bold text-gray-900">{directValue.toLocaleString()}</span>
            </div>
          </div>
          
          {/* GA4 Tracking */}
          {ga4Value !== undefined && (
            <div className="mt-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-blue-500">GA4:</span>
                <span className="text-lg font-bold text-blue-600">{ga4Value.toLocaleString()}</span>
              </div>
            </div>
          )}
          
          {/* Comparison */}
          {ga4Value !== undefined && directValue > 0 && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Variance:</span>
                <span className={`text-xs font-medium ${
                  Math.abs(directValue - ga4Value) / directValue < 0.1 
                    ? 'text-green-600' 
                    : 'text-yellow-600'
                }`}>
                  {directValue === ga4Value 
                    ? 'Perfect match' 
                    : `${Math.abs(((ga4Value - directValue) / directValue) * 100).toFixed(1)}% ${ga4Value > directValue ? 'higher' : 'lower'}`
                  }
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Explanation Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <ChartBarIcon className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">📊 GA4 Analytics (Legacy)</h2>
            <p className="text-sm text-gray-700 mb-3">
              Legacy Google Analytics 4 integration. PostHog is now the recommended analytics platform for enhanced privacy and insights:
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white p-3 rounded-lg border border-green-200">
                <h4 className="font-bold text-green-800 mb-1">🎯 Direct GA4 Links</h4>
                <p className="text-gray-600">Clean destination URLs with UTM parameters. Data appears directly in GA4 without server involvement.</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-1">🔄 Server Redirect Links</h4>
                <p className="text-gray-600">Links route through your server first, then redirect to destination. Provides both server analytics AND GA4 data.</p>
              </div>
            </div>
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                <strong>💡 Pro Tip:</strong> Use this tab to validate your tracking setup and compare server-side data with GA4 data for accuracy.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Clicks"
          directValue={totals.directClicks}
          ga4Value={totals.ga4Clicks}
          icon={CursorArrowRaysIcon}
          color="bg-blue-500"
        />
        
        <MetricCard
          title="Unique Users"
          directValue={totals.directClicks} // Direct tracking doesn't distinguish users
          ga4Value={totals.ga4Users}
          icon={UsersIcon}
          color="bg-green-500"
        />
        
        <MetricCard
          title="Sessions"
          directValue={totals.directClicks} // Approximate with clicks
          ga4Value={totals.ga4Sessions}
          icon={EyeIcon}
          color="bg-purple-500"
        />
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">GA4 Enabled Links</p>
              <p className="text-2xl font-bold text-gray-900">
                {totals.ga4EnabledLinks} / {utmLinks.length}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {((totals.ga4EnabledLinks / utmLinks.length) * 100).toFixed(0)}% coverage
              </p>
            </div>
            <div className="p-3 rounded-full bg-orange-500">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Link Comparison */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Link Performance Comparison</h3>
          <p className="text-sm text-gray-500 mt-1">Direct tracking vs Google Analytics 4 data</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Link
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Direct Clicks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GA4 Clicks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GA4 Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GA4 Sessions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {utmLinks.map((link) => (
                <tr key={link.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                      {link.utm_campaign}
                    </div>
                    <div className="text-sm text-gray-500">
                      {link.utm_source} / {link.utm_medium}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {link.click_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                    {link.ga4_enabled ? link.ga4_clicks : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                    {link.ga4_enabled ? link.ga4_users : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                    {link.ga4_enabled ? link.ga4_sessions : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      link.ga4_enabled 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {link.ga4_enabled ? 'GA4 Enabled' : 'Direct Only'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Quality Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Data Quality Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {totals.ga4EnabledLinks > 0 
                ? Math.abs(((totals.ga4Clicks - totals.directClicks) / totals.directClicks) * 100).toFixed(1)
                : 0
              }%
            </div>
            <div className="text-sm text-gray-500">Average Variance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {((totals.ga4EnabledLinks / utmLinks.length) * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-500">GA4 Coverage</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {totals.ga4Sessions > 0 ? (totals.ga4Clicks / totals.ga4Sessions).toFixed(1) : 0}
            </div>
            <div className="text-sm text-gray-500">Clicks per Session</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GA4Analytics;
