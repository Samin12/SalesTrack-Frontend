import useSWR from 'swr';

interface WeeklySummaryData {
  youtube_views_this_week: number;
  youtube_growth_percentage: number;
  utm_clicks_this_week: number;
  utm_growth_percentage: number;
  website_visits_this_week: number;
  website_growth_percentage: number;
  unique_visitors_this_week: number;
  total_videos: number;
  active_utm_links: number;
  top_video_this_week: string;
  top_utm_link_this_week: string;
  top_website_page_this_week: string;
  week_start: string;
  week_end: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useWeeklySummary() {
  const { data: rawData, error, mutate } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/analytics/dashboard-data`,
    fetcher,
    {
      refreshInterval: 300000, // Refresh every 5 minutes
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  // Transform the data to match the expected interface
  const data: WeeklySummaryData | undefined = rawData?.status === 'success' ? {
    youtube_views_this_week: rawData.data.youtube_views_this_week,
    youtube_growth_percentage: rawData.data.youtube_growth_percentage,
    utm_clicks_this_week: 0, // Will be added later when UTM tracking is implemented
    utm_growth_percentage: 0,
    website_visits_this_week: 0, // Will be added later when website analytics is implemented
    website_growth_percentage: 0,
    unique_visitors_this_week: 0,
    total_videos: rawData.data.total_videos,
    active_utm_links: 0,
    top_video_this_week: rawData.data.recent_videos?.[0]?.title || 'N/A',
    top_utm_link_this_week: 'N/A',
    top_website_page_this_week: 'N/A',
    week_start: new Date().toISOString(),
    week_end: new Date().toISOString()
  } : undefined;

  return {
    data,
    error,
    isLoading: !error && !rawData,
    mutate,
  };
}
