/**
 * PostHog Settings Component
 * Manage PostHog integration configuration and sync
 */
import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface PostHogStatus {
  posthog_configured: boolean;
  api_key_valid: boolean;
  last_sync?: string;
  total_events?: number;
}

interface PostHogStatusResponse {
  posthog_status: PostHogStatus;
}

interface PostHogSyncResponse {
  synced: number;
  errors: number;
  message?: string;
}

const PostHogSettings: React.FC = () => {
  const [status, setStatus] = useState<PostHogStatus | null>(null);
  const [lastSync, setLastSync] = useState<PostHogSyncResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchPostHogStatus = async () => {
    try {
      const response = await fetch('/api/v1/posthog/status');
      const data: PostHogStatusResponse = await response.json();
      
      if (response.ok) {
        setStatus(data.posthog_status);
      } else {
        console.error('Failed to fetch PostHog status');
      }
    } catch (error) {
      console.error('Failed to fetch PostHog status:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerPostHogSync = async (daysBack: number = 7) => {
    setSyncing(true);
    try {
      const response = await fetch(`/api/v1/posthog/sync?days_back=${daysBack}`, {
        method: 'POST',
      });
      const data: PostHogSyncResponse = await response.json();
      
      if (response.ok) {
        setLastSync(data);
        // Refresh status after sync
        await fetchPostHogStatus();
      } else {
        console.error('PostHog sync failed:', data);
      }
    } catch (error) {
      console.error('Failed to trigger PostHog sync:', error);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchPostHogStatus();
  }, []);

  const StatusIndicator: React.FC<{ enabled: boolean; label: string }> = ({ enabled, label }) => (
    <div className="flex items-center gap-2">
      {enabled ? (
        <CheckCircleIcon className="h-5 w-5 text-green-500" />
      ) : (
        <XCircleIcon className="h-5 w-5 text-red-500" />
      )}
      <span className={`text-sm ${enabled ? 'text-green-700' : 'text-red-700'}`}>
        {label}
      </span>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
        <h2 className="text-xl font-bold text-gray-900 mb-2">⚙️ PostHog Integration Settings</h2>
        <p className="text-gray-600">
          Configure and manage your PostHog analytics integration for enhanced UTM tracking and user journey analysis.
        </p>
      </div>

      {/* Status Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Status</h3>
        
        {status && (
          <div className="space-y-3">
            <StatusIndicator 
              enabled={status.posthog_configured} 
              label="PostHog API Configured" 
            />
            <StatusIndicator 
              enabled={status.api_key_valid} 
              label="API Key Valid" 
            />
            
            {status.last_sync && (
              <div className="text-sm text-gray-600">
                <strong>Last Sync:</strong> {new Date(status.last_sync).toLocaleString()}
              </div>
            )}
            
            {status.total_events && (
              <div className="text-sm text-gray-600">
                <strong>Total Events Tracked:</strong> {status.total_events.toLocaleString()}
              </div>
            )}
          </div>
        )}

        {/* Configuration Instructions */}
        {status && !status.posthog_configured && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">Configuration Required</h4>
            <p>To enable PostHog integration, configure these environment variables:</p>
            <ul className="mt-2 space-y-1 text-sm text-yellow-700">
              <li><code className="bg-yellow-100 px-1 rounded">POSTHOG_API_KEY</code> - Your PostHog API key</li>
              <li><code className="bg-yellow-100 px-1 rounded">POSTHOG_HOST</code> - PostHog instance URL (default: https://us.posthog.com)</li>
              <li><code className="bg-yellow-100 px-1 rounded">POSTHOG_PROJECT_ID</code> - Your PostHog project ID (optional)</li>
            </ul>
          </div>
        )}
      </div>

      {/* Sync Section */}
      {status && status.posthog_configured && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Synchronization</h3>
          
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => triggerPostHogSync(7)}
              disabled={syncing}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {syncing ? 'Syncing...' : 'Sync Last 7 Days'}
            </button>
            
            <button
              onClick={() => triggerPostHogSync(30)}
              disabled={syncing}
              className="bg-purple-100 hover:bg-purple-200 disabled:bg-purple-50 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {syncing ? 'Syncing...' : 'Sync Last 30 Days'}
            </button>
          </div>

          {lastSync && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Last Sync Result:</strong> {lastSync.synced} records synced, {lastSync.errors} errors
                {lastSync.message && ` - ${lastSync.message}`}
              </p>
            </div>
          )}

          <p className="text-sm text-gray-600 mt-3">
            PostHog data is automatically synced every 4 hours. Manual sync pulls data from the specified time period.
          </p>
        </div>
      )}

      {/* Benefits Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">PostHog Integration Benefits</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Enhanced user journey tracking and funnel analysis</li>
          <li>• Real-time event tracking with custom properties</li>
          <li>• Advanced cohort analysis and user segmentation</li>
          <li>• Built-in A/B testing and feature flag capabilities</li>
          <li>• Privacy-first analytics with GDPR compliance</li>
          <li>• Dual tracking validation (direct + PostHog)</li>
          <li>• Session replay and heatmap capabilities</li>
          <li>• Custom dashboard creation and insights</li>
        </ul>
      </div>

      {/* Migration Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">🔄 Migration from GA4</h4>
        <p className="text-sm text-blue-700">
          PostHog provides enhanced analytics capabilities compared to GA4, including better user privacy controls, 
          real-time data processing, and more flexible event tracking. Your existing UTM links will continue to work 
          while new links will use PostHog by default.
        </p>
      </div>

      {/* API Integration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">API Integration</h4>
        <p className="text-sm text-gray-600 mb-3">
          PostHog integration provides additional API endpoints for conversion tracking and advanced analytics:
        </p>
        <ul className="space-y-1 text-sm text-gray-600">
          <li>• <code className="bg-gray-100 px-1 rounded">POST /api/v1/conversions</code> - Track conversion events</li>
          <li>• <code className="bg-gray-100 px-1 rounded">GET /api/v1/conversions/analytics</code> - Get conversion analytics</li>
          <li>• <code className="bg-gray-100 px-1 rounded">POST /api/v1/posthog/sync</code> - Trigger data sync</li>
          <li>• <code className="bg-gray-100 px-1 rounded">GET /api/v1/posthog/status</code> - Check integration status</li>
        </ul>
      </div>
    </div>
  );
};

export default PostHogSettings;
