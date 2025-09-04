/**
 * Header component with navigation and user menu
 */
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ChartBarIcon,
  VideoCameraIcon,
  GlobeAltIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  PresentationChartLineIcon,
} from '@heroicons/react/24/outline';
import { PlayIcon } from '@heroicons/react/24/solid';
import apiClient from '@/services/api';

interface HeaderProps {
  className?: string;
}

const navigation = [
  { name: 'Overview', href: '/', icon: ChartBarIcon },
  { name: 'Analytics', href: '/analytics', icon: PresentationChartLineIcon },
  { name: 'Videos', href: '/videos', icon: VideoCameraIcon },
  { name: 'Traffic', href: '/traffic', icon: GlobeAltIcon },
];

export default function Header({ className = '' }: HeaderProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Check authentication status after component mounts to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
    setIsAuthenticated(apiClient.isAuthenticated());
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      router.push('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleAuth = () => {
    router.push('/auth');
  };

  return (
    <header className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="container-app">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg group-hover:shadow-glow transition-all duration-200">
                <PlayIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900">
                  YouTube Analytics
                </span>
                <span className="text-xs text-gray-500 -mt-1">
                  @SaminYasar_
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'text-primary-600 bg-primary-50 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Sync Button */}
            <button
              onClick={() => apiClient.syncAnalyticsData()}
              className="btn-ghost btn-sm hidden sm:flex"
              title="Sync Analytics Data"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Sync
            </button>

            {/* Authentication Status */}
            {isClient && isAuthenticated && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <UserCircleIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Authenticated</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-ghost btn-sm text-gray-500 hover:text-gray-700"
                  title="Logout"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200">
          <nav className="flex space-x-1 px-2 py-2 overflow-x-auto scrollbar-thin">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-200
                    ${isActive 
                      ? 'text-primary-600 bg-primary-50' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
