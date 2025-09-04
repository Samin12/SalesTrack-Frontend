import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout/Layout';
import { Link2 } from 'lucide-react';

const UTMLinksPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the Traffic page with the management tab active
    router.replace('/traffic?tab=management');
  }, [router]);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>UTM Links - Redirecting... - YouTube Analytics</title>
          <meta name="description" content="Redirecting to UTM Links Management" />
        </Head>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Link2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Redirecting to UTM Links Management</h1>
            <p className="text-gray-600 mb-4">
              UTM Links Management has been moved to the Traffic page for a better user experience.
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UTMLinksPage;
