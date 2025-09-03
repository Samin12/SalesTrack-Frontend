// API Response Types
export interface BaseResponse {
  status: string;
  message?: string;
  timestamp: string;
}

// Channel Types
export interface ChannelOverview {
  channel_id: string;
  channel_name: string;
  channel_handle: string;
  subscriber_count: number;
  video_count: number;
  view_count: number;
  last_updated: string;
}

export interface ChannelGrowthMetrics {
  date: string;
  subscriber_count: number;
  subscriber_growth: number;
  subscriber_growth_rate: number;
  view_count: number;
  view_growth: number;
  view_growth_rate: number;
}

export interface ChannelGrowthResponse extends BaseResponse {
  channel_id: string;
  period_start: string;
  period_end: string;
  current_metrics: ChannelGrowthMetrics;
  historical_data: ChannelGrowthMetrics[];
  summary: {
    period_days: number;
    total_subscriber_growth: number;
    total_view_growth: number;
    average_daily_subscriber_growth: number;
    average_daily_view_growth: number;
  };
}

// Video Types
export interface VideoOverview {
  video_id: string;
  title: string;
  published_at: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  duration_seconds: number;
}

export interface VideoMetricsData {
  date: string;
  view_count: number;
  view_growth: number;
  view_growth_rate: number;
  like_count: number;
  comment_count: number;
  engagement_rate: number;
}

export interface VideoPerformanceResponse extends BaseResponse {
  video_id: string;
  video_info: VideoOverview;
  current_metrics: VideoMetricsData;
  historical_data: VideoMetricsData[];
  growth_analysis: {
    total_view_growth: number;
    average_daily_views: number;
    peak_growth_day: string;
    engagement_trend: string;
  };
}

export interface VideosListResponse extends BaseResponse {
  total_videos: number;
  videos: VideoOverview[];
  top_performing: VideoOverview[];
  fastest_growing: VideoOverview[];
}

// Traffic Types
export interface WebsiteTrafficData {
  date: string;
  source: string;
  clicks: number;
  unique_clicks: number;
  click_through_rate: number;
  page_views: number;
  bounce_rate: number;
}

export interface TrafficResponse extends BaseResponse {
  period_start: string;
  period_end: string;
  total_clicks: number;
  total_page_views: number;
  average_ctr: number;
  traffic_data: WebsiteTrafficData[];
  top_sources: Array<{
    source: string;
    clicks: number;
    page_views: number;
    conversion_rate: number;
  }>;
}

// Analytics Overview
export interface AnalyticsOverviewResponse extends BaseResponse {
  channel_overview: ChannelOverview;
  recent_growth: ChannelGrowthMetrics;
  top_videos: VideoOverview[];
  traffic_summary: {
    total_clicks_last_30_days: number;
    total_page_views_last_30_days: number;
    top_traffic_source: string;
  };
  key_insights: string[];
}

// Authentication Types
export interface AuthURLResponse extends BaseResponse {
  authorization_url: string;
  state?: string;
}

export interface TokenResponse extends BaseResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

// Error Types
export interface ErrorResponse {
  status: string;
  message: string;
  error_code?: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Query Parameter Types
export interface DateRangeParams {
  start_date?: string;
  end_date?: string;
  days?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface VideoQueryParams extends DateRangeParams, PaginationParams {
  sort_by?: 'published_at' | 'view_count' | 'growth_rate';
  order?: 'asc' | 'desc';
}

// UI Component Types
export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ComponentType<any>;
  loading?: boolean;
  className?: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface GrowthTrend {
  value: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  period: string;
}

// Navigation Types
export interface NavItem {
  name: string;
  href: string;
  icon?: React.ComponentType<any>;
  current?: boolean;
}

// Theme Types
export type Theme = 'light' | 'dark';

// Loading States
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

// API Client Types
export interface APIClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

// UTM Link Types
export interface UTMLink {
  id: number;
  video_id: string;
  destination_url: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content?: string;
  utm_term?: string;
  tracking_url: string;
  pretty_slug?: string;
  tracking_type: 'server_redirect' | 'direct_ga4';
  direct_url?: string;
  shareable_url: string;
  click_count: number;
  created_at: string;
  updated_at?: string;
  is_active: boolean;
  last_clicked?: string;
}

export interface UTMClickEvent {
  id: number;
  utm_link_id: number;
  clicked_at: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  country?: string;
  city?: string;
}

export interface UTMAnalytics {
  utm_link: UTMLink;
  total_clicks: number;
  unique_clicks: number;
  click_data: Array<{
    date: string;
    clicks: number;
    unique_clicks: number;
  }>;
  top_countries: Array<{
    country: string;
    clicks: number;
  }>;
  referrer_data: Array<{
    referrer: string;
    clicks: number;
  }>;
}

export interface CombinedVideoAnalytics {
  video_info: VideoOverview;
  video_metrics: VideoMetricsData;
  utm_links: UTMLink[];
  total_utm_clicks: number;
  click_through_rate: number;
  weekly_growth: {
    views_growth: number;
    clicks_growth: number;
    engagement_growth: number;
  };
}

// Utility Types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
