import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout/Layout';
import { VideoTrafficAnalytics } from '../components/VideoTrafficAnalytics';
import UTMLinksManagement from '../components/UTMLinksManagement';
import GA4Settings from '../components/GA4/GA4Settings';
import GA4Analytics from '../components/GA4/GA4Analytics';
import { Link2, TrendingUp, BarChart3, Database } from 'lucide-react';

interface Video {
  video_id: string;
  title: string;
  view_count: number;
  published_at: string;
}

interface UTMLink {
  id: number;
  video_id: string;
  destination_url: string;
  tracking_url: string;
  utm_campaign: string;
  utm_content?: string;
  utm_term?: string;
  created_at: string;
  utm_source: string;
  utm_medium: string;
  is_active: boolean;
  ga4_enabled: boolean;
  ga4_clicks: number;
  ga4_users: number;
  ga4_sessions: number;
  ga4_last_sync?: string;
  click_count: number;
}

// GA4 Analytics Tab Component
const GA4AnalyticsTab: React.FC<{ refreshTrigger: number }> = ({ refreshTrigger }) => {
  const [utmLinks, setUtmLinks] = useState<UTMLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUTMLinks();
  }, [refreshTrigger]);

  const fetchUTMLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/utm-links');
      const data = await response.json();

      if (data.status === 'success') {
        setUtmLinks(data.links || []);
      } else {
        setError('Failed to fetch UTM links');
      }
    } catch (err) {
      setError('Error fetching UTM links');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={fetchUTMLinks}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <GA4Analytics utmLinks={utmLinks} />;
};

const TrafficPage: React.FC = () => {
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'utm-links' | 'analytics' | 'ga4-settings' | 'ga4-analytics'>('utm-links');

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    // Handle tab query parameter for redirects from /utm-links
    if (router.query.tab === 'management') {
      setActiveTab('utm-links');
    }
  }, [router.query.tab]);

  const fetchVideos = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/analytics/videos');

      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();
      setVideos(data.videos || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkCreated = (link: UTMLink) => {
    // Trigger refresh of analytics data
    setRefreshTrigger(prev => prev + 1);

    // Don't automatically switch tabs - let user see the success message first
    // setActiveTab('analytics');
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <Head>
            <title>Video Traffic Tracking - YouTube Analytics</title>
            <meta name="description" content="Track video-driven traffic and link performance" />
          </Head>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <Head>
            <title>Video Traffic Tracking - YouTube Analytics</title>
            <meta name="description" content="Track video-driven traffic and link performance" />
          </Head>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchVideos}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>Video Traffic Tracking - YouTube Analytics</title>
          <meta name="description" content="Track video-driven traffic and link performance with UTM parameters" />
        </Head>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Link2 className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Video Traffic Tracking</h1>
            </div>
            <p className="text-gray-600 max-w-3xl">
              Generate UTM tracking links for your YouTube videos and analyze how your content drives traffic to external destinations.
              Track click-through rates, conversion metrics, and identify your most effective videos for driving traffic.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('utm-links')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'utm-links'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    UTM Links
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'analytics'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Traffic Analytics
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('ga4-settings')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'ga4-settings'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    GA4 Settings
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('ga4-analytics')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'ga4-analytics'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    GA4 Analytics
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'utm-links' && (
            <UTMLinksManagement
              refreshTrigger={refreshTrigger}
              videos={videos}
            />
          )}

          {activeTab === 'analytics' && (
            <VideoTrafficAnalytics refreshTrigger={refreshTrigger} />
          )}

          {activeTab === 'ga4-settings' && (
            <GA4Settings />
          )}

          {activeTab === 'ga4-analytics' && (
            <GA4AnalyticsTab refreshTrigger={refreshTrigger} />
          )}

          {/* Footer Info */}
          <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <TrendingUp className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">About Video Traffic Tracking</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  This feature helps you understand how your YouTube content drives traffic to external destinations.
                  By using UTM parameters, you can track which videos are most effective at converting viewers into website visitors,
                  customers, or subscribers. The analytics show correlation between video performance (views, engagement) and
                  click-through rates to help you optimize your content strategy.
                </p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong className="text-gray-900">Metrics Tracked:</strong>
                    <ul className="text-gray-600 mt-1 space-y-1">
                      <li>• Click-through rates (CTR)</li>
                      <li>• Views-to-clicks ratio</li>
                      <li>• Daily click trends</li>
                      <li>• Link performance by video</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-gray-900">Use Cases:</strong>
                    <ul className="text-gray-600 mt-1 space-y-1">
                      <li>• Product launches and promotions</li>
                      <li>• Blog post and content marketing</li>
                      <li>• Lead generation campaigns</li>
                      <li>• Affiliate marketing tracking</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TrafficPage;
