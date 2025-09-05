import React, { useState, useEffect } from 'react';
import { Link2, ExternalLink, Copy, Eye, MousePointer, Calendar, Trash2, CheckCircle, TestTube, Plus, ChevronDown, ChevronUp, Check } from 'lucide-react';

interface UTMLink {
  id: number;
  video_id: string;
  destination_url: string;
  tracking_url: string;
  pretty_slug?: string;
  tracking_type: 'server_redirect' | 'direct_ga4' | 'direct_posthog';
  direct_url?: string;
  shareable_url: string;
  utm_campaign: string;
  utm_content?: string;
  utm_term?: string;
  created_at: string;
  is_active: boolean;
  click_count: number;
  last_clicked?: string;
}

interface UTMLinksManagementProps {
  refreshTrigger?: number;
  videos?: Array<{
    video_id: string;
    title: string;
    view_count: number;
  }>;
}

const UTMLinksManagement: React.FC<UTMLinksManagementProps> = ({ refreshTrigger = 0, videos = [] }) => {
  const [utmLinks, setUtmLinks] = useState<UTMLink[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<number | null>(null);
  const [testing, setTesting] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'created' | 'clicks' | 'video'>('created');
  const [filterBy, setFilterBy] = useState<'all' | 'active' | 'clicked'>('all');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [isBulkGenerating, setIsBulkGenerating] = useState<boolean>(false);
  const [showBulkGenerateForm, setShowBulkGenerateForm] = useState<boolean>(false);
  const [bulkGenerateParams, setBulkGenerateParams] = useState({
    destinationUrl: '',
    trackingType: 'direct_posthog' as 'server_redirect' | 'direct_posthog',
    utmCampaign: '',
    utmSource: 'youtube',
    utmMedium: 'video'
  });

  // UTM Generator state
  const [showGenerator, setShowGenerator] = useState<boolean>(false);
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [extractedVideoId, setExtractedVideoId] = useState<string>('');
  const [destinationUrl, setDestinationUrl] = useState<string>('');
  const [utmContent, setUtmContent] = useState<string>('');
  const [utmTerm, setUtmTerm] = useState<string>('');
  const [trackingType, setTrackingType] = useState<'server_redirect' | 'direct_ga4' | 'direct_posthog'>('direct_posthog');
  const [generatedLink, setGeneratedLink] = useState<UTMLink | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatorCopied, setGeneratorCopied] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  useEffect(() => {
    fetchUTMLinks();
  }, [refreshTrigger]);

  // UTM Generator helper functions
  const extractVideoId = (url: string): string | null => {
    if (!url) return null;

    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  };

  const handleYoutubeUrlChange = (url: string) => {
    setYoutubeUrl(url);
    setError('');

    const videoId = extractVideoId(url);
    if (videoId) {
      setExtractedVideoId(videoId);
    } else if (url) {
      setExtractedVideoId('');
      setError('Please enter a valid YouTube URL (e.g., https://youtu.be/9XriRGRxsGI)');
    } else {
      setExtractedVideoId('');
    }
  };

  const fetchUTMLinks = async () => {
    setLoading(true);
    setError('');

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-ad878.up.railway.app';
      const response = await fetch(`${API_BASE_URL}/api/v1/utm-links`);

      if (!response.ok) {
        throw new Error('Failed to fetch UTM links');
      }

      const data = await response.json();
      setUtmLinks(data.links || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load UTM links');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    if (!extractedVideoId || !destinationUrl) {
      setError('Please enter a valid YouTube URL and destination URL');
      return;
    }

    setIsGenerating(true);
    setError('');
    setShowSuccess(false);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-ad878.up.railway.app';
      const response = await fetch(`${API_BASE_URL}/api/v1/utm-links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_id: extractedVideoId,
          destination_url: destinationUrl,
          utm_content: utmContent || undefined,
          utm_term: utmTerm || undefined,
          tracking_type: trackingType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate UTM link');
      }

      const newLink: UTMLink = await response.json();
      setGeneratedLink(newLink);
      setShowSuccess(true);

      // Refresh the UTM links list
      await fetchUTMLinks();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate UTM link');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratorCopyLink = async () => {
    if (!generatedLink) return;

    try {
      // For direct GA4, use the shareable_url directly (it's now the destination URL with UTM)
      // For server redirect, prepend the origin
      const urlToCopy = generatedLink.tracking_type === 'direct_ga4'
        ? generatedLink.shareable_url
        : `${window.location.origin}${generatedLink.shareable_url}`;
      await navigator.clipboard.writeText(urlToCopy);
      setGeneratorCopied(true);
      setTimeout(() => setGeneratorCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const resetGeneratorForm = () => {
    setYoutubeUrl('');
    setExtractedVideoId('');
    setDestinationUrl('');
    setUtmContent('');
    setUtmTerm('');
    setGeneratedLink(null);
    setShowSuccess(false);
    setError('');
  };

  const handleCopyLink = async (link: UTMLink) => {
    try {
      // For direct GA4, shareable_url is already the full destination URL with UTM
      // For server redirect, prepend origin if it starts with /
      const urlToCopy = link.tracking_type === 'direct_ga4'
        ? link.shareable_url
        : (link.shareable_url.startsWith('/')
            ? `${window.location.origin}${link.shareable_url}`
            : link.shareable_url);
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(link.id);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleTestClick = async (link: UTMLink) => {
    setTesting(link.id);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-ad878.up.railway.app';
      const response = await fetch(`${API_BASE_URL}/api/v1/utm-links/${link.id}/click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          utm_link_id: link.id,
          user_agent: navigator.userAgent,
          referrer: window.location.href
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record test click');
      }

      // Refresh the list to show updated click count
      await fetchUTMLinks();

      // Show success feedback
      alert(`Test click recorded successfully! Click count updated for ${link.video_id}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test click');
    } finally {
      setTesting(null);
    }
  };

  const handleDeleteLink = async (linkId: number) => {
    if (!confirm('Are you sure you want to delete this UTM link? This action cannot be undone.')) {
      return;
    }

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-ad878.up.railway.app';
      const response = await fetch(`${API_BASE_URL}/api/v1/utm-links/${linkId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete UTM link');
      }

      // Refresh the list
      fetchUTMLinks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete UTM link');
    }
  };

  const handleBulkGenerate = async () => {
    if (!bulkGenerateParams.destinationUrl.trim()) {
      setError('Destination URL is required for bulk generation');
      return;
    }

    setIsBulkGenerating(true);
    setError('');

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-ad878.up.railway.app';
      const params = new URLSearchParams({
        destination_url: bulkGenerateParams.destinationUrl,
        tracking_type: bulkGenerateParams.trackingType,
        utm_source: bulkGenerateParams.utmSource,
        utm_medium: bulkGenerateParams.utmMedium,
      });

      if (bulkGenerateParams.utmCampaign.trim()) {
        params.append('utm_campaign', bulkGenerateParams.utmCampaign);
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/utm/bulk-generate?${params}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate UTM links');
      }

      const result = await response.json();

      // Show success message
      setError(''); // Clear any previous errors
      setShowBulkGenerateForm(false);

      // Reset form
      setBulkGenerateParams({
        destinationUrl: '',
        trackingType: 'direct_posthog',
        utmCampaign: '',
        utmSource: 'youtube',
        utmMedium: 'video'
      });

      // Refresh the UTM links list
      await fetchUTMLinks();

      // Show success notification
      alert(`Successfully generated ${result.total_links_generated} UTM links for ${result.total_videos_processed} videos`);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate UTM links');
    } finally {
      setIsBulkGenerating(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-ad878.up.railway.app';
      const response = await fetch(`${API_BASE_URL}/api/v1/utm/bulk-delete?confirm=true`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete UTM links');
      }

      const result = await response.json();

      // Show success message
      setError(''); // Clear any previous errors
      setShowDeleteConfirm(false);

      // Refresh the UTM links list
      await fetchUTMLinks();

      // Show success notification (you could use a toast library here)
      alert(`Successfully deleted ${result.deleted_links} UTM links and ${result.deleted_clicks} click records`);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete UTM links');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Filter and sort links
  const filteredLinks = utmLinks.filter(link => {
    if (filterBy === 'active') return link.is_active;
    if (filterBy === 'clicked') return link.click_count > 0;
    return true;
  });

  const sortedLinks = [...filteredLinks].sort((a, b) => {
    switch (sortBy) {
      case 'clicks':
        return b.click_count - a.click_count;
      case 'video':
        return a.video_id.localeCompare(b.video_id);
      case 'created':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const totalLinks = utmLinks.length;
  const totalClicks = utmLinks.reduce((sum, link) => sum + link.click_count, 0);
  const activeLinks = utmLinks.filter(link => link.is_active).length;
  const clickedLinks = utmLinks.filter(link => link.click_count > 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't return early on error - show the bulk generate section even if fetching existing links fails

  return (
    <div className="space-y-6">


      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Link2 className="w-8 h-8 text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-900">UTM Links</h2>
        </div>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Create new UTM tracking links and manage existing ones. Monitor click performance and track which videos drive the most traffic.
        </p>
      </div>

      {/* UTM Link Generator Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <button
            onClick={() => setShowGenerator(!showGenerator)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Create New UTM Link</h3>
            </div>
            {showGenerator ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>

        {showGenerator && (
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {showSuccess && generatedLink && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium text-green-900">UTM Link Generated Successfully!</h4>
                </div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700">
                      {generatedLink.tracking_type === 'direct_ga4'
                        ? '🎯 Short GA4 URL:'
                        : generatedLink.tracking_type === 'direct_posthog'
                        ? '🚀 PostHog Direct URL:'
                        : '🔄 Short Redirect URL:'}
                    </p>
                    <div className="p-3 bg-white rounded border break-all text-sm font-mono">
                      {generatedLink.tracking_type === 'direct_ga4' || generatedLink.tracking_type === 'direct_posthog'
                        ? generatedLink.shareable_url
                        : `${window.location.origin}${generatedLink.shareable_url}`}
                    </div>
                    <p className="text-xs text-gray-500">
                      {generatedLink.tracking_type === 'direct_ga4'
                        ? '✅ Direct destination URL with UTM parameters - works independently of your server'
                        : generatedLink.tracking_type === 'direct_posthog'
                        ? '✅ Direct destination URL with UTM parameters - tracked by PostHog'
                        : '✅ Short branded URL that routes through your server'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleGeneratorCopyLink}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      {generatorCopied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy Link
                        </>
                      )}
                    </button>
                    <button
                      onClick={resetGeneratorForm}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                    >
                      Create Another
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* YouTube URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube Video URL *
                </label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => handleYoutubeUrlChange(e.target.value)}
                  placeholder="https://youtu.be/9XriRGRxsGI"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {extractedVideoId && (
                  <p className="mt-1 text-sm text-green-600">
                    ✓ Video ID extracted: {extractedVideoId}
                  </p>
                )}
              </div>

              {/* Destination URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination URL *
                </label>
                <input
                  type="url"
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                  placeholder="https://example.com/landing-page"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* UTM Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UTM Content (Optional)
                </label>
                <input
                  type="text"
                  value={utmContent}
                  onChange={(e) => setUtmContent(e.target.value)}
                  placeholder="description_link"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* UTM Term */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UTM Term (Optional)
                </label>
                <input
                  type="text"
                  value={utmTerm}
                  onChange={(e) => setUtmTerm(e.target.value)}
                  placeholder="tutorial"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Tracking Method Selection */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
              <label className="block text-sm font-bold text-gray-900 mb-3">
                🎯 Choose Your Tracking Method
              </label>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border-2 border-purple-200 hover:border-purple-300 transition-colors">
                  <input
                    id="direct-posthog-mgmt"
                    type="radio"
                    name="tracking-type-mgmt"
                    value="direct_posthog"
                    checked={trackingType === 'direct_posthog'}
                    onChange={(e) => setTrackingType(e.target.value as 'direct_posthog' | 'direct_ga4' | 'server_redirect')}
                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                  />
                  <div className="flex-1">
                    <label htmlFor="direct-posthog-mgmt" className="text-sm font-bold text-purple-800 cursor-pointer flex items-center gap-2">
                      🚀 PostHog Analytics <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">RECOMMENDED</span>
                    </label>
                    <p className="text-xs text-purple-700 mt-1 font-medium">
                      ✅ Privacy-first analytics • ✅ Advanced user journeys • ✅ Real-time insights
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Creates: https://yourdestination.com?utm_source=youtube&utm_medium=video...
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border-2 border-green-200 hover:border-green-300 transition-colors">
                  <input
                    id="direct-ga4-mgmt"
                    type="radio"
                    name="tracking-type-mgmt"
                    value="direct_ga4"
                    checked={trackingType === 'direct_ga4'}
                    onChange={(e) => setTrackingType(e.target.value as 'direct_posthog' | 'direct_ga4' | 'server_redirect')}
                    className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <div className="flex-1">
                    <label htmlFor="direct-ga4-mgmt" className="text-sm font-bold text-green-800 cursor-pointer flex items-center gap-2">
                      📊 Google Analytics <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">LEGACY</span>
                    </label>
                    <p className="text-xs text-green-700 mt-1 font-medium">
                      ✅ Traditional GA4 tracking • ✅ Backward compatibility • ✅ Familiar interface
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Creates: https://yourdestination.com?utm_source=youtube&utm_medium=video...
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border-2 border-blue-200 hover:border-blue-300 transition-colors">
                  <input
                    id="server-redirect-mgmt"
                    type="radio"
                    name="tracking-type-mgmt"
                    value="server_redirect"
                    checked={trackingType === 'server_redirect'}
                    onChange={(e) => setTrackingType(e.target.value as 'direct_posthog' | 'direct_ga4' | 'server_redirect')}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="flex-1">
                    <label htmlFor="server-redirect-mgmt" className="text-sm font-bold text-blue-800 cursor-pointer flex items-center gap-2">
                      🔄 Server + PostHog Tracking <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">ADVANCED</span>
                    </label>
                    <p className="text-xs text-blue-700 mt-1 font-medium">
                      ✅ Server analytics + PostHog • ✅ A/B testing • ✅ Complete data control
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Creates: https://yourdomain.com/api/v1/go/your-pretty-link
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="mt-6">
              <button
                onClick={handleGenerateLink}
                disabled={isGenerating || !extractedVideoId || !destinationUrl}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating UTM Link...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Generate UTM Link
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <Link2 className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Links</p>
              <p className="text-2xl font-bold text-gray-900">{totalLinks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <MousePointer className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clicks</p>
              <p className="text-2xl font-bold text-gray-900">{totalClicks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Active Links</p>
              <p className="text-2xl font-bold text-gray-900">{activeLinks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Clicked Links</p>
              <p className="text-2xl font-bold text-gray-900">{clickedLinks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Bulk Actions</h3>
          <p className="text-sm text-gray-600">Generate or manage UTM links for all videos at once</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bulk Generate Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-gray-900">Bulk Generate UTM Links</h4>
            </div>

            {showBulkGenerateForm ? (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination URL *
                  </label>
                  <input
                    type="url"
                    value={bulkGenerateParams.destinationUrl}
                    onChange={(e) => setBulkGenerateParams(prev => ({ ...prev, destinationUrl: e.target.value }))}
                    placeholder="https://example.com/landing-page"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UTM Campaign
                    </label>
                    <input
                      type="text"
                      value={bulkGenerateParams.utmCampaign}
                      onChange={(e) => setBulkGenerateParams(prev => ({ ...prev, utmCampaign: e.target.value }))}
                      placeholder="holiday_2025"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tracking Type
                    </label>
                    <select
                      value={bulkGenerateParams.trackingType}
                      onChange={(e) => setBulkGenerateParams(prev => ({ ...prev, trackingType: e.target.value as 'server_redirect' | 'direct_posthog' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="direct_posthog">PostHog (Recommended)</option>
                      <option value="server_redirect">Server Redirect</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UTM Source
                    </label>
                    <input
                      type="text"
                      value={bulkGenerateParams.utmSource}
                      onChange={(e) => setBulkGenerateParams(prev => ({ ...prev, utmSource: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UTM Medium
                    </label>
                    <input
                      type="text"
                      value={bulkGenerateParams.utmMedium}
                      onChange={(e) => setBulkGenerateParams(prev => ({ ...prev, utmMedium: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleBulkGenerate}
                    disabled={isBulkGenerating || !bulkGenerateParams.destinationUrl.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isBulkGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Generate All Links
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowBulkGenerateForm(false)}
                    disabled={isBulkGenerating}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowBulkGenerateForm(true)}
                className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4" />
                Generate UTM Links for All Videos
              </button>
            )}
          </div>

          {/* Bulk Delete Section */}
          {totalLinks > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Trash2 className="w-5 h-5 text-red-600" />
                <h4 className="font-medium text-gray-900">Bulk Delete UTM Links</h4>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Currently managing {totalLinks} UTM links with {totalClicks} total clicks
              </p>

              <div className="flex items-center gap-3">
                {showDeleteConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-red-600 font-medium">
                      Are you sure? This will delete all {totalLinks} UTM links and {totalClicks} click records.
                    </span>
                    <button
                      onClick={handleBulkDelete}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isDeleting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Yes, Delete All
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleBulkDelete}
                    className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete All UTM Links
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Sort by</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'created' | 'clicks' | 'video')}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="created">Date Created</option>
                <option value="clicks">Click Count</option>
                <option value="video">Video ID</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Filter by</span>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as 'all' | 'active' | 'clicked')}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Links</option>
                <option value="active">Active Only</option>
                <option value="clicked">Clicked Only</option>
              </select>
            </div>
          </div>

          <button
            onClick={fetchUTMLinks}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* UTM Links Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            UTM Tracking Links ({sortedLinks.length})
          </h3>
        </div>

        {sortedLinks.length === 0 ? (
          <div className="text-center py-12">
            <Link2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No UTM links found</p>
            <p className="text-gray-400 text-sm">Create your first UTM tracking link in the UTM Link Generator tab.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Video & Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    UTM Parameters
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-2 rounded-lg text-sm font-bold border-2 ${
                            link.tracking_type === 'direct_ga4'
                              ? 'bg-green-50 text-green-800 border-green-200'
                              : link.tracking_type === 'direct_posthog'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}>
                            {link.tracking_type === 'direct_ga4'
                              ? '🎯 DIRECT GA4 TRACKING'
                              : link.tracking_type === 'direct_posthog'
                              ? '🚀 DIRECT POSTHOG TRACKING'
                              : '🔄 SERVER REDIRECT TRACKING'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            link.tracking_type === 'direct_ga4'
                              ? 'bg-green-100 text-green-700'
                              : link.tracking_type === 'direct_posthog'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {link.tracking_type === 'direct_ga4'
                              ? 'LEGACY'
                              : link.tracking_type === 'direct_posthog'
                              ? 'RECOMMENDED'
                              : 'ADVANCED'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">Video ID: {link.video_id}</p>
                          <a
                            href={`https://youtu.be/${link.video_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View on YouTube
                          </a>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-600">Destination:</p>
                            <a
                              href={link.destination_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 truncate max-w-xs"
                            >
                              {link.destination_url}
                            </a>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg border">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-medium text-gray-700">
                                {link.tracking_type === 'direct_ga4'
                                  ? '🎯 Short GA4 URL:'
                                  : link.tracking_type === 'direct_posthog'
                                  ? '🚀 PostHog Direct URL:'
                                  : '🔄 Short Redirect URL:'}
                              </p>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                SHORT
                              </span>
                            </div>
                            <div className="font-mono text-xs text-gray-800 break-all bg-white p-2 rounded border">
                              {link.tracking_type === 'direct_ga4' || link.tracking_type === 'direct_posthog'
                                ? link.shareable_url
                                : `${window.location.origin}${link.shareable_url}`}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {link.tracking_type === 'direct_ga4'
                                ? '✅ Direct destination URL with UTM parameters - independent of server'
                                : link.tracking_type === 'direct_posthog'
                                ? '✅ Direct destination URL with UTM parameters - tracked by PostHog'
                                : '✅ Short branded URL that routes through your server'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-900">
                          <strong>Campaign:</strong> {link.utm_campaign}
                        </p>
                        {link.utm_content && (
                          <p className="text-sm text-gray-900">
                            <strong>Content:</strong> {link.utm_content}
                          </p>
                        )}
                        {link.utm_term && (
                          <p className="text-sm text-gray-900">
                            <strong>Term:</strong> {link.utm_term}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MousePointer className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-900">
                            {link.click_count} clicks
                          </span>
                        </div>
                        {link.last_clicked && (
                          <p className="text-xs text-gray-500">
                            Last: {formatDate(link.last_clicked)}
                          </p>
                        )}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          link.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {link.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{formatDate(link.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyLink(link)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Copy UTM Link"
                        >
                          {copied === link.id ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleTestClick(link)}
                          disabled={testing === link.id}
                          className="p-2 text-gray-400 hover:text-purple-600 transition-colors disabled:opacity-50"
                          title="Test Click Tracking"
                        >
                          {testing === link.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                          ) : (
                            <TestTube className="w-4 h-4" />
                          )}
                        </button>
                        <a
                          href={link.pretty_slug ? `/api/v1/go/${link.pretty_slug}` : `/api/v1/r/${link.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          title="Visit Link (Tracked)"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDeleteLink(link.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Link"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

export default UTMLinksManagement;
