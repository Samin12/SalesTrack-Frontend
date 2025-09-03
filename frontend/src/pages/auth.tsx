/**
 * Authentication page
 */
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout/Layout';
import { PlayIcon, ShieldCheckIcon, ChartBarIcon, GlobeAltIcon } from '@heroicons/react/24/solid';
import apiClient from '@/services/api';

export default function AuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle OAuth callback
  useEffect(() => {
    const { code } = router.query;
    
    if (code && typeof code === 'string') {
      handleOAuthCallback(code);
    }
  }, [router.query]);

  const handleOAuthCallback = async (code: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await apiClient.handleOAuthCallback(code);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getGoogleAuthURL();
      window.location.href = response.authorization_url;
    } catch (err: any) {
      setError(err.message || 'Failed to initiate authentication');
      setIsLoading(false);
    }
  };

  // Check if already authenticated
  useEffect(() => {
    if (apiClient.isAuthenticated()) {
      router.push('/');
    }
  }, []);

  const features = [
    {
      icon: ChartBarIcon,
      title: 'Channel Analytics',
      description: 'Track subscriber growth, view counts, and engagement metrics over time.'
    },
    {
      icon: PlayIcon,
      title: 'Video Performance',
      description: 'Analyze individual video performance and identify your top content.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Traffic Insights',
      description: 'Monitor website traffic from YouTube and track conversion rates.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure Access',
      description: 'OAuth 2.0 authentication ensures your data remains private and secure.'
    }
  ];

  return (
    <Layout title="Authentication" description="Sign in to access your YouTube analytics">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left side - Branding and features */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-8">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
                  <PlayIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    YouTube Analytics
                  </h1>
                  <p className="text-sm text-gray-600">
                    @SaminYasar_ Dashboard
                  </p>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Track Your Channel's Growth
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Get comprehensive insights into your YouTube channel performance 
                with detailed analytics and growth tracking.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-lg flex-shrink-0">
                      <feature.icon className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Authentication */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Sign In to Continue
                </h3>
                <p className="text-gray-600">
                  Connect your Google account to access YouTube analytics
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="loading-spinner w-5 h-5 mr-3"></div>
                ) : (
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                {isLoading ? 'Connecting...' : 'Continue with Google'}
              </button>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  By signing in, you agree to our terms of service and privacy policy.
                  We only access your YouTube analytics data.
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <ShieldCheckIcon className="w-4 h-4" />
                  <span>Secure OAuth 2.0 Authentication</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
