/**
 * PostHog Analytics Display Component
 * Shows comparison between direct tracking and PostHog data
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
  posthog_enabled: boolean;
  posthog_events: number;
  posthog_users: number;
  posthog_sessions: number;
  posthog_last_sync?: string;
  click_count: number; // Direct tracking clicks
  tracking_type: 'server_redirect' | 'direct_ga4' | 'direct_posthog';
}

interface PostHogAnalyticsProps {
  utmLinks: UTMLink[];
  className?: string;
}

const PostHogAnalytics: React.FC<PostHogAnalyticsProps> = ({ utmLinks, className = '' }) => {
  // Calculate totals
  const totals = utmLinks.reduce((acc, link) => ({
    directClicks: acc.directClicks + link.click_count,
    posthogEvents: acc.posthogEvents + link.posthog_events,
    posthogUsers: acc.posthogUsers + link.posthog_users,
    posthogSessions: acc.posthogSessions + link.posthog_sessions,
    posthogEnabledLinks: acc.posthogEnabledLinks + (link.posthog_enabled ? 1 : 0)
  }), {
    directClicks: 0,
    posthogEvents: 0,
    posthogUsers: 0,
    posthogSessions: 0,
    posthogEnabledLinks: 0
  });

  // Metric Card Component
  const MetricCard: React.FC<{
    title: string;
    directValue: number;
    posthogValue?: number;
    icon: React.ComponentType<any>;
    color: string;
  }> = ({ title, directValue, posthogValue, icon: Icon, color }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${color}`} />
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        </div>
      </div>
      
      <div className="space-y-2">
        {/* Direct Tracking */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Direct:</span>
          <span className="text-lg font-bold text-gray-900">{directValue.toLocaleString()}</span>
        </div>
        
        {/* PostHog Tracking */}
        {posthogValue !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-purple-500">PostHog:</span>
            <span className="text-lg font-bold text-purple-600">{posthogValue.toLocaleString()}</span>
          </div>
        )}
        
        {/* Variance */}
        {posthogValue !== undefined && directValue > 0 && (
          <div className="text-xs text-center pt-1 border-t border-gray-100">
            <span className={
              Math.abs(directValue - posthogValue) / directValue < 0.1 
                ? "text-green-600" 
                : "text-yellow-600"
            }>
              {directValue === posthogValue 
                ? "✓ Perfect match" 
                : `${Math.abs(((posthogValue - directValue) / directValue) * 100).toFixed(1)}% ${posthogValue > directValue ? 'higher' : 'lower'}`
              }
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">📊 PostHog Analytics (Primary)</h2>
            <p className="text-gray-600 mb-4">
              Your primary analytics platform with privacy-first tracking, advanced user journey analysis, and real-time insights.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <h4 className="font-bold text-purple-800 mb-1">🎯 PostHog Direct Links</h4>
                <p className="text-gray-600">Clean destination URLs with UTM parameters. Data flows directly to PostHog for immediate insights and user journey tracking.</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <h4 className="font-bold text-blue-800 mb-1">🔄 Server + PostHog Links</h4>
                <p className="text-gray-600">Links route through your server first, then redirect to destination. Provides both server analytics AND PostHog data for comprehensive tracking.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-purple-100 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-800">
            <strong>💡 Pro Tip:</strong> PostHog is now your primary analytics platform! Use this dashboard to monitor user journeys, track conversions, and gain privacy-first insights.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Clicks"
          directValue={totals.directClicks}
          posthogValue={totals.posthogEvents}
          icon={CursorArrowRaysIcon}
          color="text-purple-500"
        />
        <MetricCard
          title="Unique Users"
          directValue={totals.directClicks} // Approximation
          posthogValue={totals.posthogUsers}
          icon={UsersIcon}
          color="text-blue-500"
        />
        <MetricCard
          title="Sessions"
          directValue={totals.directClicks} // Approximation
          posthogValue={totals.posthogSessions}
          icon={EyeIcon}
          color="text-green-500"
        />
      </div>

      {/* Coverage Stats */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">PostHog Integration Coverage</h3>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-600">PostHog Enabled Links</p>
            <p className="text-2xl font-bold text-purple-600">
              {totals.posthogEnabledLinks} / {utmLinks.length}
            </p>
            <p className="text-xs text-gray-500">
              {((totals.posthogEnabledLinks / utmLinks.length) * 100).toFixed(0)}% coverage
            </p>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Direct Clicks
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PostHog Events
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PostHog Users
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PostHog Sessions
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {utmLinks.slice(0, 10).map((link) => (
                <tr key={link.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {link.utm_campaign}
                    </div>
                    <div className="text-xs text-gray-500">
                      {link.video_id}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {link.click_count}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-purple-600">
                    {link.posthog_enabled ? link.posthog_events : 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-purple-600">
                    {link.posthog_enabled ? link.posthog_users : 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-purple-600">
                    {link.posthog_enabled ? link.posthog_sessions : 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      link.posthog_enabled 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {link.posthog_enabled ? 'PostHog Enabled' : 'Direct Only'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {totals.posthogEnabledLinks > 0 
              ? Math.abs(((totals.posthogEvents - totals.directClicks) / totals.directClicks) * 100).toFixed(1)
              : 0}%
          </div>
          <div className="text-sm text-gray-500">Data Variance</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {((totals.posthogEnabledLinks / utmLinks.length) * 100).toFixed(0)}%
          </div>
          <div className="text-sm text-gray-500">PostHog Coverage</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {totals.posthogSessions > 0 ? (totals.posthogEvents / totals.posthogSessions).toFixed(1) : 0}
          </div>
          <div className="text-sm text-gray-500">Events per Session</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {totals.posthogUsers > 0 ? (totals.posthogEvents / totals.posthogUsers).toFixed(1) : 0}
          </div>
          <div className="text-sm text-gray-500">Events per User</div>
        </div>
      </div>
    </div>
  );
};

export default PostHogAnalytics;
