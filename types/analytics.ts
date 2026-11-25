// types/analytics.ts

export type AnalyticsTimeframe = "7d" | "15d" | "30d" | "3m" | "6m" | "1y";

export interface AnalyticsChartPoint {
  date: string; // "YYYY-MM-DD" e.g. "2026-11-09"
  count: number;
}

export interface WebsiteVisitorsResponse {
  todayVisitors: number;
  totalVisitors: number;
  timeframe: AnalyticsTimeframe;
  totalInPeriod: number;
  chartData: AnalyticsChartPoint[];
}

export interface TopArticleView {
  id: string;
  title: string;
  slug: string;
  viewsCount: number;
  periodViews?: number;
  featuredImage: string;
  categoryName?: string;
}

export interface NewsViewsAnalyticsResponse {
  todayNewsViews: number;
  totalNewsViews: number;
  timeframe: AnalyticsTimeframe;
  totalInPeriod: number;
  chartData: AnalyticsChartPoint[];
  topArticles: TopArticleView[];
}

export interface DashboardSummaryResponse {
  todayNewsViews: number;
  todayWebsiteVisitors: number;
  totalNewsViews: number;
  totalWebsiteVisitors: number;
  timeframe: AnalyticsTimeframe;
  newsViewsChart: AnalyticsChartPoint[];
  websiteVisitorsChart: AnalyticsChartPoint[];
  topArticles: TopArticleView[];
}

