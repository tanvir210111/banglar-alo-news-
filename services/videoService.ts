import { VideoItem } from "@/types/news";
import { api } from "@/services/apiClient";
import { formatToBengaliDate } from "@/services/newsService";

const STORAGE_KEY = "banglar_alo_videos";

// No hardcoded demo videos - purely dynamic from backend or admin panel
export const INITIAL_VIDEOS: VideoItem[] = [];

export async function getAllVideoItems(): Promise<VideoItem[]> {
  // 1. Try backend API first
  try {
    const res = await api.get<any[]>("/news/videos?limit=20");
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      const valid = res.data.filter((v) => {
        const url = v.videoUrl || v.youtubeLink || v.facebookLink || "";
        return url && !url.includes("ABCDE") && url.trim().length > 5;
      });

      if (valid.length > 0) {
        return valid.map((v) => ({
          id: String(v.id || v._id),
          title: v.title,
          slug: v.slug || `video-${v.id}`,
          videoUrl: v.videoUrl || v.facebookLink || v.youtubeLink || "",
          thumbnail:
            typeof v.featuredImage === "string"
              ? v.featuredImage
              : v.featuredImage?.url || v.thumbnail || "",
          duration: v.duration || "ভিডিও",
          category: v.category?.name || v.category || "ভিডিও",
          views: v.viewsCount || v.views || 0,
          date: v.publishedDate ? formatToBengaliDate(v.publishedDate) : "আজ",
          summary: v.summary || v.title,
        }));
      }
    }
  } catch {}

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
      localStorage.setItem("banglar_alo_videos_updated", String(Date.now()));
      if ("BroadcastChannel" in window) {
        const ch = new BroadcastChannel("banglar_alo_news_channel");
        ch.postMessage({ type: "VIDEOS_UPDATED" });
      }
    } catch {}
  }

  // Also attempt sending to backend
  try {
    await api.post("/news/videos/sync", { videos });
  } catch {}

  return true;
}
