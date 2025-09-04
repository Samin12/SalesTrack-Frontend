/**
 * Main layout component
 */
import React from 'react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export default function Layout({
  children,
  title = 'YouTube Analytics',
  description = 'Track and analyze your YouTube channel performance',
  className = '',
}: LayoutProps) {
  const fullTitle = title === 'YouTube Analytics' ? title : `${title} | YouTube Analytics`;

  return (
    <>
      <Head>
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Open Graph */}
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={description} />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        
        <main className={`flex-1 ${className}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
