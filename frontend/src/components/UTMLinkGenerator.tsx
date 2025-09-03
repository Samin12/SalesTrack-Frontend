import React, { useState, useEffect } from 'react';
import { Copy, ExternalLink, Plus, Check, CheckCircle } from 'lucide-react';

interface Video {
  video_id: string;
  title: string;
  view_count: number;
}

interface UTMLink {
  id: number;
  video_id: string;
  destination_url: string;
  tracking_url: string;
  shareable_url: string;
  tracking_type: 'server_redirect' | 'direct_ga4';
  utm_campaign: string;
  utm_content?: string;
  utm_term?: string;
  created_at: string;
}

interface UTMLinkGeneratorProps {
  videos: Video[];
  onLinkCreated: (link: UTMLink) => void;
}

export const UTMLinkGenerator: React.FC<UTMLinkGeneratorProps> = ({
  videos,
  onLinkCreated
}) => {
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [extractedVideoId, setExtractedVideoId] = useState<string>('');
  const [destinationUrl, setDestinationUrl] = useState<string>('');
  const [utmContent, setUtmContent] = useState<string>('');
  const [utmTerm, setUtmTerm] = useState<string>('');
  const [trackingType, setTrackingType] = useState<'direct_ga4' | 'server_redirect'>('direct_ga4');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [generatedLink, setGeneratedLink] = useState<UTMLink | null>(null);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Extract video ID from YouTube URL
  const extractVideoId = (url: string): string | null => {
    if (!url) return null;
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  };

  // Handle YouTube URL input change
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

  const handleGenerateLink = async () => {
    if (!extractedVideoId || !destinationUrl) {
      setError('Please enter a valid YouTube URL and destination URL');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/v1/utm-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_id: extractedVideoId,
          destination_url: destinationUrl,
          tracking_type: trackingType,
          utm_content: utmContent || undefined,
          utm_term: utmTerm || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate UTM link');
      }

      const newLink = await response.json();
      setGeneratedLink(newLink);
      setShowSuccess(true);
      onLinkCreated(newLink);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate UTM link');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!generatedLink) return;

    try {
      await navigator.clipboard.writeText(generatedLink.shareable_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const resetForm = () => {
    setYoutubeUrl('');
    setExtractedVideoId('');
    setDestinationUrl('');
    setUtmContent('');
    setUtmTerm('');
    setTrackingType('direct_ga4');
    setGeneratedLink(null);
    setShowSuccess(false);
    setError('');
    setCopied(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <ExternalLink className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">UTM Link Generator</h2>
      </div>

      <div className="space-y-4">
        {/* YouTube URL Input */}
        <div>
          <label htmlFor="youtube-url" className="block text-sm font-medium text-gray-700 mb-2">
            YouTube Video URL
          </label>
          <input
            id="youtube-url"
            type="text"
            value={youtubeUrl}
            onChange={(e) => handleYoutubeUrlChange(e.target.value)}
            placeholder="https://youtu.be/9XriRGRxsGI or https://youtube.com/watch?v=9XriRGRxsGI"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter any YouTube URL format - the video ID will be automatically extracted
          </p>
          {extractedVideoId && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                ✅ Video ID extracted: <strong>{extractedVideoId}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Destination URL */}
        <div>
          <label htmlFor="destination-url" className="block text-sm font-medium text-gray-700 mb-2">
            Destination URL
          </label>
          <input
            id="destination-url"
            type="url"
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
            placeholder="https://example.com/landing-page"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Optional UTM Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="utm-content" className="block text-sm font-medium text-gray-700 mb-2">
              UTM Content (Optional)
            </label>
            <input
              id="utm-content"
              type="text"
              value={utmContent}
              onChange={(e) => setUtmContent(e.target.value)}
              placeholder="description_link"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="utm-term" className="block text-sm font-medium text-gray-700 mb-2">
              UTM Term (Optional)
            </label>
            <input
              id="utm-term"
              type="text"
              value={utmTerm}
              onChange={(e) => setUtmTerm(e.target.value)}
              placeholder="youtube_traffic"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Tracking Type Selection */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Tracking Method</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <input
                id="direct-ga4"
                type="radio"
                name="tracking-type"
                value="direct_ga4"
                checked={trackingType === 'direct_ga4'}
                onChange={(e) => setTrackingType(e.target.value as 'direct_ga4')}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <div className="flex-1">
                <label htmlFor="direct-ga4" className="text-sm font-medium text-gray-900 cursor-pointer">
                  🎯 Direct GA4 Tracking (Recommended)
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  Links go directly to your destination with UTM parameters. Best user experience.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <input
                id="server-redirect"
                type="radio"
                name="tracking-type"
                value="server_redirect"
                checked={trackingType === 'server_redirect'}
                onChange={(e) => setTrackingType(e.target.value as 'server_redirect')}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <div className="flex-1">
                <label htmlFor="server-redirect" className="text-sm font-medium text-gray-900 cursor-pointer">
                  🔄 Server Redirect Tracking
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  Links route through our server for detailed analytics. Slight redirect delay.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
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
              <ExternalLink className="w-4 h-4" />
              Generate UTM Tracking Link
            </>
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Success Message and Generated Link Display */}
        {showSuccess && generatedLink && (
          <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-semibold text-green-900">🎉 UTM Tracking Link Generated!</h3>
            </div>
            <div className="p-3 bg-gray-50 rounded border break-all text-sm font-mono">
              {generatedLink.shareable_url}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 font-medium"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
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
                onClick={resetForm}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
