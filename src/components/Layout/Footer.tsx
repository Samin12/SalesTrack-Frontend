/**
 * Footer component
 */
import React from 'react';
import Link from 'next/link';
import { HeartIcon } from '@heroicons/react/24/solid';

interface FooterProps {
  className?: string;
}

export default function Footer({ className = '' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-white border-t border-gray-200 ${className}`}>
      <div className="container-app py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900">
                YouTube Analytics
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4 max-w-md">
              Track and analyze your YouTube channel performance with comprehensive 
              analytics, growth metrics, and traffic insights.
            </p>
            <div className="flex items-center space-x-4">
              <Link
                href="https://www.youtube.com/@SaminYasar_"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-600 transition-colors duration-200"
              >
                <span className="sr-only">YouTube Channel</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Analytics
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200">
                  Overview
                </Link>
              </li>
              <li>
                <Link href="/videos" className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200">
                  Videos
                </Link>
              </li>
              <li>
                <Link href="/traffic" className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200">
                  Traffic
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/docs" className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200">
                  API Docs
                </Link>
              </li>
              <li>
                <Link href="/auth" className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200">
                  Authentication
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <span>© {currentYear} YouTube Analytics. Made with</span>
              <HeartIcon className="w-4 h-4 text-red-500" />
              <span>for content creators.</span>
            </div>
            
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="text-xs text-gray-500">
                Powered by FastAPI & Next.js
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">API Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
