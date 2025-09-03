/**
 * Google Analytics 4 Integration Settings Component
 */
import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  Cog6ToothIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface GA4Status {
  ga4_configured: boolean;
  measurement_protocol_enabled: boolean;
  data_api_enabled: boolean;
  service_account_exists: boolean;
}

interface GA4StatusResponse {
  success: boolean;
  ga4_status: GA4Status;
  integration_ready: boolean;
}

interface GA4SyncResponse {
  success: boolean;
  message: string;
  synced_records: number;
  errors: number;
  days_synced: number;
}

const GA4Settings: React.FC = () => {
  const [status, setStatus] = useState<GA4Status | null>(null);
  const [integrationReady, setIntegrationReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<GA4SyncResponse | null>(null);

  const fetchGA4Status = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/ga4/status');
      const data: GA4StatusResponse = await response.json();
      
      if (data.success) {
        setStatus(data.ga4_status);
        setIntegrationReady(data.integration_ready);
      }
    } catch (error) {
      console.error('Failed to fetch GA4 status:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerGA4Sync = async (daysBack: number = 7) => {
    try {
      setSyncing(true);
      const response = await fetch(`/api/v1/ga4/sync?days_back=${daysBack}`, {
        method: 'POST'
      });
      const data: GA4SyncResponse = await response.json();
      
      if (data.success) {
        setLastSync(data);
      } else {
        console.error('GA4 sync failed:', data);
      }
    } catch (error) {
      console.error('Failed to trigger GA4 sync:', error);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchGA4Status();
  }, []);

  const StatusIndicator: React.FC<{ enabled: boolean; label: string }> = ({ enabled, label }) => (
    <div className="flex items-center space-x-2">
      {enabled ? (
        <CheckCircleIcon className="h-5 w-5 text-green-500" />
      ) : (
        <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
      )}
      <span className={`text-sm ${enabled ? 'text-green-700' : 'text-red-700'}`}>
        {label}
      </span>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3 mb-4">
          <ChartBarIcon className="h-6 w-6 text-blue-500" />
          <h3 className="text-lg font-medium text-gray-900">Google Analytics 4 Integration</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <ChartBarIcon className="h-6 w-6 text-blue-500" />
          <h3 className="text-lg font-medium text-gray-900">Google Analytics 4 Integration</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          integrationReady 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {integrationReady ? 'Ready' : 'Configuration Required'}
        </div>
      </div>

      {/* Status Overview */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Integration Status</h4>
        <div className="space-y-2">
          {status && (
            <>
              <StatusIndicator 
                enabled={status.ga4_configured} 
                label="GA4 Property Configured" 
              />
              <StatusIndicator 
                enabled={status.measurement_protocol_enabled} 
                label="Event Tracking Enabled" 
              />
              <StatusIndicator 
                enabled={status.data_api_enabled} 
                label="Data API Configured" 
              />
              <StatusIndicator 
                enabled={status.service_account_exists} 
                label="Service Account Available" 
              />
            </>
          )}
        </div>
      </div>

      {/* Configuration Instructions */}
      {!integrationReady && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">Setup Required</h4>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>To enable GA4 integration, configure these environment variables:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><code className="bg-yellow-100 px-1 rounded">GA4_PROPERTY_ID</code> - Your GA4 property ID</li>
              <li><code className="bg-yellow-100 px-1 rounded">GA4_MEASUREMENT_ID</code> - Your GA4 measurement ID</li>
              <li><code className="bg-yellow-100 px-1 rounded">GA4_API_SECRET</code> - Measurement Protocol API secret</li>
              <li><code className="bg-yellow-100 px-1 rounded">GA4_SERVICE_ACCOUNT_PATH</code> - Path to service account JSON</li>
            </ul>
          </div>
        </div>
      )}

      {/* Data Sync Section */}
      {integrationReady && (
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-900">Data Synchronization</h4>
            <button
              onClick={() => triggerGA4Sync(7)}
              disabled={syncing}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {syncing ? (
                <>
                  <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Syncing...
                </>
              ) : (
                <>
                  <ArrowPathIcon className="-ml-1 mr-2 h-4 w-4" />
                  Sync Now
                </>
              )}
            </button>
          </div>

          {lastSync && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Last Sync Results</h5>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Records Synced:</span>
                  <span className="ml-2 font-medium text-green-600">{lastSync.synced_records}</span>
                </div>
                <div>
                  <span className="text-gray-500">Errors:</span>
                  <span className="ml-2 font-medium text-red-600">{lastSync.errors}</span>
                </div>
                <div>
                  <span className="text-gray-500">Days:</span>
                  <span className="ml-2 font-medium text-gray-900">{lastSync.days_synced}</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-600">
            <p>GA4 data is automatically synced every 4 hours. Manual sync pulls data from the last 7 days.</p>
          </div>
        </div>
      )}

      {/* Benefits Section */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="text-sm font-medium text-gray-900 mb-3">GA4 Integration Benefits</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Dual tracking validation (direct + GA4)</li>
          <li>• Advanced audience insights and demographics</li>
          <li>• Cross-platform user journey tracking</li>
          <li>• Enhanced conversion attribution</li>
          <li>• Google's robust analytics infrastructure</li>
        </ul>
      </div>
    </div>
  );
};

export default GA4Settings;
