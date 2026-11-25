import { VideoItem } from "@/types/news";
import { api } from "@/services/apiClient";
import { formatToBengaliDate } from "@/services/newsService";

const STORAGE_KEY = "banglar_alo_videos";

// Initial demo video for immediate rich appearance if completely empty
export const INITIAL_VIDEOS: VideoItem[] = [
  {
    id: "vid-1",
    title: "সারাদেশের আজকের গুরুত্বপূর্ণ সংবাদ ও বিশেষ ভিডিও বুলেটিন",
    slug: "saradesher-ajker-video-bulletin",
    videoUrl: "https://www.facebook.com/BanglarAloNewsBD/videos",
    thumbnail: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80",
    duration: "০৩:৪৫",
    category: "ভিডিও সংবাদ",
    views: 2450,
    date: "আজ",
    summary: "বাংলার আলো নিউজ অফিসিয়াল ভিডিও বুলেটিন। দেশ ও বিদেশের তাজা খবর।",
  },
  {
    id: "vid-2",
    title: "রাজনীতি ও অর্থনীতির সর্বশেষ পরিস্থিতি নিয়ে বিশেষ আলোচনা",
    slug: "rajniti-o-orthoniti-bishesh-alochona",
    videoUrl: "https://www.facebook.com/BanglarAloNewsBD/videos",
    thumbnail: "https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=800&q=80",
    duration: "০৫:২০",
    category: "টকশো",
    views: 3120,
    date: "আজ",
    summary: "সমসাময়িক জাতীয় রাজনীতি ও অর্থনীতির ভবিষ্যৎ গতিপথ নিয়ে বিশ্লেষণ।",
  },
  {
    id: "vid-3",
    title: "মাঠপর্যায়ের সার্বিক উন্নয়ন ও স্থানীয় জনপদের সরাসরি ভিডিও প্রতিবেদন",
    slug: "mathe-saradik-unnayan-video-report",
    videoUrl: "https://www.facebook.com/BanglarAloNewsBD/videos",
    thumbnail: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80",
    duration: "০২:১৫",
    category: "বিশেষ প্রতিবেদন",
    views: 1890,
    date: "আজ",
    summary: "জেলা ও উপজেলার মানুষের জীবনযাত্রা ও চলমান উন্নয়ন কাজের সরজমিন চিত্র।",
  },
];

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
