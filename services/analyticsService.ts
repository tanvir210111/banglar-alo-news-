// services/analyticsService.ts
import { api } from "./apiClient";
import {
  AnalyticsTimeframe,
  WebsiteVisitorsResponse,
  NewsViewsAnalyticsResponse,
  DashboardSummaryResponse,
} from "@/types/analytics";

export async function recordWebsiteVisit(path?: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const res = await api.post("/analytics/visit", { path: path || window.location.pathname });
    return Boolean(res?.success);
  } catch (err) {
    // Non-blocking, fails gracefully
    return false;
  }
}

export async function getWebsiteVisitors(
  timeframe: AnalyticsTimeframe = "15d"
): Promise<WebsiteVisitorsResponse | null> {
  try {
    const res = await api.get<WebsiteVisitorsResponse>(
      `/analytics/visitors?timeframe=${timeframe}`
    );
    if (res?.success && res.data) {
      return res.data;
    }
    return null;
  } catch (err) {
    console.warn("Failed to fetch website visitors analytics:", err);
    return null;
  }
}

export async function getNewsViewsAnalytics(
  timeframe: AnalyticsTimeframe = "15d"
): Promise<NewsViewsAnalyticsResponse | null> {
  try {
    const res = await api.get<NewsViewsAnalyticsResponse>(
      `/analytics/news-views?timeframe=${timeframe}`
    );
    if (res?.success && res.data) {
      return res.data;
    }
    return null;
  } catch (err) {
    console.warn("Failed to fetch news views analytics:", err);
    return null;
  }
}

export async function getDashboardSummary(
  timeframe: AnalyticsTimeframe = "30d"
): Promise<DashboardSummaryResponse | null> {
  try {
    const res = await api.get<DashboardSummaryResponse>(
      `/analytics/dashboard?timeframe=${timeframe}`
    );
    if (res?.success && res.data) {
      return res.data;
    }
    return null;
  } catch (err) {
    console.warn("Failed to fetch dashboard summary analytics:", err);
    return null;
  }
}

