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
  // Fetch YouTube data
  const { data: youtubeData, error: youtubeError, mutate: mutateYoutube } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/analytics/dashboard-data`,
    fetcher,
    {
      refreshInterval: 300000, // Refresh every 5 minutes
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  // Fetch website analytics for the last 7 days (this week)
  const { data: websiteData, error: websiteError, mutate: mutateWebsite } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/analytics/website?days=7`,
    fetcher,
    {
      refreshInterval: 300000, // Refresh every 5 minutes
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  // Combined mutate function
  const mutate = () => {
    mutateYoutube();
    mutateWebsite();
  };

  // Check for errors
  const error = youtubeError || websiteError;

  // Check loading state
  const isLoading = (!youtubeError && !youtubeData) || (!websiteError && !websiteData);

  // Transform the data to match the expected interface
  const data: WeeklySummaryData | undefined = youtubeData?.status === 'success' ? {
    youtube_views_this_week: youtubeData.data.youtube_views_this_week,
    youtube_growth_percentage: youtubeData.data.youtube_growth_percentage,
    utm_clicks_this_week: 0, // Will be added later when UTM tracking is implemented
    utm_growth_percentage: 0,
    website_visits_this_week: websiteData?.website_analytics?.total_visits || 0,
    website_growth_percentage: 0, // Calculate this later when we have historical data
    unique_visitors_this_week: websiteData?.website_analytics?.unique_visitors || 0,
    total_videos: youtubeData.data.total_videos,
    active_utm_links: 0,
    top_video_this_week: youtubeData.data.recent_videos?.[0]?.title || 'N/A',
    top_utm_link_this_week: 'N/A',
    top_website_page_this_week: websiteData?.website_analytics?.top_pages?.[0]?.url?.replace(/^https?:\/\//, '') || 'N/A',
    week_start: new Date().toISOString(),
    week_end: new Date().toISOString()
  } : undefined;

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}
