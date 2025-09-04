import useSWR from 'swr';
import apiClient from '../services/api';

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${url}`);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};

export interface WebsiteAnalytics {
  total_visits: number;
  unique_visitors: number;
  page_views: number;
  daily_visits: Array<{
    date: string;
    visits: number;
  }>;
  top_pages: Array<{
    url: string;
    views: number;
  }>;
  period_days: number;
  start_date: string;
  end_date: string;
  error?: string;
}

export interface CombinedMetrics {
  summary: {
    total_youtube_views_lifetime: number;
    total_website_visits: number;
    unique_website_visitors: number;
    youtube_videos_count: number;
  };
  daily_comparison: Array<{
    date: string;
    youtube_views: number;
    website_visits: number;
  }>;
  website_top_pages: Array<{
    url: string;
    views: number;
  }>;
  period_days: number;
  start_date: string;
  end_date: string;
  note: string;
}

export function useWebsiteAnalytics(days: number = 7) {
  const { data, error, isLoading, mutate } = useSWR<{
    status: string;
    timestamp: string;
    period_days: number;
    website_analytics: WebsiteAnalytics;
  }>(`/api/v1/analytics/website?days=${days}`, fetcher);

  return {
    data: data?.website_analytics,
    error,
    isLoading,
    mutate
  };
}

export function useCombinedMetrics(days: number = 7) {
  const { data, error, isLoading, mutate } = useSWR<{
    status: string;
    timestamp: string;
  } & CombinedMetrics>(`/api/v1/analytics/combined-metrics?days=${days}`, fetcher);

  return {
    data: data ? {
      summary: data.summary,
      daily_comparison: data.daily_comparison,
      website_top_pages: data.website_top_pages,
      period_days: data.period_days,
      start_date: data.start_date,
      end_date: data.end_date,
      note: data.note
    } : undefined,
    error,
    isLoading,
    mutate
  };
}
