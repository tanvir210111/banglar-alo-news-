import { VideoItem } from "@/types/news";
import { api } from "@/services/apiClient";
import { formatToBengaliDate } from "@/services/newsService";

const STORAGE_KEY = "banglar_alo_videos";

// No hardcoded demo videos - purely dynamic from backend or admin panel
export const INITIAL_VIDEOS: VideoItem[] = [];

function notifyVideoUpdate() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("banglar_alo_videos_updated", String(Date.now()));
      if ("BroadcastChannel" in window) {
        const ch = new BroadcastChannel("banglar_alo_news_channel");
        ch.postMessage({ type: "VIDEOS_UPDATED" });
      }
    } catch {}
  }
}

export async function getAllVideoItems(): Promise<VideoItem[]> {
  // 1. Try backend API first (/videos or /news/videos)
  try {
    const res = await api.get<any[]>("/videos?limit=50&sortBy=createdAt&sortOrder=desc");
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      const valid = res.data.filter((v) => {
        const url = v.videoUrl || v.youtubeLink || v.facebookLink || "";
        return url && !url.includes("ABCDE") && url.trim().length > 5;
      });

      if (valid.length > 0) {
        const mapped: VideoItem[] = valid.map((v) => ({
          id: String(v.id || v._id),
          title: v.title,
          slug: v.slug || `video-${v.id || v._id}`,
          videoUrl: v.videoUrl || v.facebookLink || v.youtubeLink || "",
          thumbnail:
            typeof v.featuredImage === "string"
              ? v.featuredImage
              : v.featuredImage?.url || v.thumbnail || "",
          duration: v.duration || "ভিডিও",
          category: v.category?.name || v.category || "ভিডিও",
          views: v.viewsCount ?? v.views ?? 0,
          date: v.createdAt ? formatToBengaliDate(v.createdAt) : (v.publishedDate ? formatToBengaliDate(v.publishedDate) : "আজ"),
          summary: v.summary || v.title,
        }));

        // Keep localStorage cache in sync with latest backend data
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
          } catch {}
        }

        return mapped;
      }
    }
  } catch (err) {
    console.warn("Failed to fetch videos from backend:", err);
  }

  // 2. Client-side localStorage fallback
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
  }

  return INITIAL_VIDEOS;
}

export async function saveVideoItems(videos: VideoItem[]): Promise<boolean> {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
      notifyVideoUpdate();
    } catch {}
  }

  // Also attempt sync with backend
  try {
    await api.post("/videos/sync", { videos });
  } catch {}

  return true;
}

export async function createVideoNews(video: {
  title: string;
  videoUrl: string;
  thumbnail?: string;
  category?: string;
  duration?: string;
  summary?: string;
  views?: number;
  isFeatured?: boolean;
}): Promise<any> {
  try {
    const payload = {
      title: video.title.trim(),
      videoUrl: video.videoUrl.trim(),
      thumbnail: video.thumbnail?.trim() || "",
      category: video.category || "ভিডিও সংবাদ",
      duration: video.duration || "০২:৩০",
      summary: video.summary?.trim() || "",
      viewsCount: typeof video.views === "number" ? video.views : 0,
      isFeatured: video.isFeatured ?? false,
    };

    const res = await api.post("/videos", payload);
    if (res?.success) {
      notifyVideoUpdate();
      return res.data;
    }
  } catch (err) {
    console.warn("Failed to create video news:", err);
  }
  return null;
}

export async function updateVideoNews(id: string, updates: Partial<VideoItem>): Promise<boolean> {
  try {
    const payload: any = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.videoUrl !== undefined) payload.videoUrl = updates.videoUrl;
    if (updates.thumbnail !== undefined) payload.thumbnail = updates.thumbnail;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.duration !== undefined) payload.duration = updates.duration;
    if (updates.summary !== undefined) payload.summary = updates.summary;
    if (updates.views !== undefined) payload.viewsCount = updates.views;

    const res = await api.put(`/videos/${id}`, payload);
    if (res?.success) {
      notifyVideoUpdate();
      return true;
    }
  } catch (err) {
    console.warn("Failed to update video news:", err);
  }
  return false;
}

export async function deleteVideoNews(id: string): Promise<boolean> {
  // 1. Immediately remove from local storage cache
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const updated = parsed.filter((v: any) => v.id !== id);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
      }
    } catch {}
  }

  // 2. Call backend delete endpoint
  try {
    const res = await api.delete(`/videos/${id}`);
    notifyVideoUpdate();
    if (res?.success) {
      return true;
    }
  } catch (err) {
    console.warn("Failed to delete video news:", err);
  }

  notifyVideoUpdate();
  return true;
}

export async function fetchVideoMeta(url: string): Promise<{
  title?: string;
  thumbnail?: string;
  duration?: string;
  viewsCount?: number;
  summary?: string;
  platform?: string;
} | null> {
  try {
    const res = await api.get<any>(`/videos/fetch-meta?url=${encodeURIComponent(url)}`);
    if (res?.success && res.data) {
      return res.data;
    }
  } catch (err) {
    console.warn("Failed to fetch video meta:", err);
  }
  return null;
}
