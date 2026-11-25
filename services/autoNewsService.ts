// services/autoNewsService.ts
import { api } from "./apiClient";
import {
  AutoNewsStats,
  AutoNewsSettings,
  AutoNewsSource,
  AutoNewsLog,
  AutoNewsRecentPost,
} from "@/types/autoNews";

// 1. Get Auto News Agent Stats (Top Banner)
export async function getAutoNewsStats(): Promise<AutoNewsStats | null> {
  try {
    const res = await api.get<AutoNewsStats>("/auto-news/stats");
    if (res?.success && res.data) {
      return res.data;
    }
    return null;
  } catch (err) {
    console.warn("Failed to get auto-news stats:", err);
    return null;
  }
}

// 2. Toggle Autopilot (Turn ON / Turn OFF)
export async function toggleAutoNews(status: "ON" | "OFF"): Promise<boolean> {
  try {
    const res = await api.post("/auto-news/toggle", { status });
    return Boolean(res?.success);
  } catch (err) {
    console.warn("Failed to toggle auto-news:", err);
    return false;
  }
}

// 3. Run Now (Instant Manual Cycle)
export async function runAutoNewsNow(): Promise<{ success: boolean; message?: string; data?: any }> {
  try {
    const res = await api.post("/auto-news/run-now");
    return {
      success: Boolean(res?.success),
      message: res?.message || (res?.success ? "সাইকেল সফলভাবে সম্পন্ন হয়েছে।" : "সাইকেল সম্পন্ন হয়নি।"),
      data: res?.data,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "সাইকেল চালাতে ব্যর্থ হয়েছে।",
    };
  }
}

// 4. Get Agent Settings
export async function getAutoNewsSettings(): Promise<AutoNewsSettings | null> {
  try {
    const res = await api.get<AutoNewsSettings>("/auto-news/settings");
    if (res?.success && res.data) {
      return res.data;
    }
    return null;
  } catch (err) {
    console.warn("Failed to get auto-news settings:", err);
    return null;
  }
}

// 5. Update Agent Settings
export async function updateAutoNewsSettings(
  settings: Partial<AutoNewsSettings>
): Promise<{ success: boolean; message?: string; data?: any }> {
  try {
    // Whitelist only editable fields supported by backend Prisma model
    const payload: Record<string, any> = {};

    if (settings.interval !== undefined) payload.interval = Number(settings.interval);
    if (settings.postsPerRun !== undefined) payload.postsPerRun = Number(settings.postsPerRun);
    if (settings.scanPerSource !== undefined) payload.scanPerSource = Number(settings.scanPerSource);
    if (settings.defaultPostStatus !== undefined) payload.defaultPostStatus = settings.defaultPostStatus;
    if (settings.defaultAdminId !== undefined) payload.defaultAdminId = settings.defaultAdminId;
    if (settings.publishAsWriterId !== undefined) payload.publishAsWriterId = settings.publishAsWriterId;
    if (settings.geminiApiKey !== undefined) payload.geminiApiKey = settings.geminiApiKey;
    if (settings.preferredModel !== undefined) payload.preferredModel = settings.preferredModel;
    if (settings.extraInstruction !== undefined) payload.extraInstruction = settings.extraInstruction;
    if (settings.aiRewrite !== undefined) payload.aiRewrite = Boolean(settings.aiRewrite);
    if (settings.tickerOn !== undefined) payload.tickerOn = Boolean(settings.tickerOn);
    if (settings.isEnabled !== undefined) payload.isEnabled = Boolean(settings.isEnabled);

    // Image crop & resize fields (backend Prisma uses imageCropResize, imageWidth, imageHeight)
    const cropEnabled = (settings as any).imageCropResize ?? (settings as any).cropResizeEnabled;
    if (cropEnabled !== undefined) payload.imageCropResize = Boolean(cropEnabled);

    const width = (settings as any).imageWidth ?? (settings as any).cropWidth;
    if (width !== undefined) payload.imageWidth = Number(width);

    const height = (settings as any).imageHeight ?? (settings as any).cropHeight;
    if (height !== undefined) payload.imageHeight = Number(height);

    // Watermark fields
    if (settings.watermarkEnabled !== undefined) payload.watermarkEnabled = Boolean(settings.watermarkEnabled);
    if ((settings as any).watermarkImage !== undefined) payload.watermarkImage = (settings as any).watermarkImage || "";
    if (settings.watermarkPosition !== undefined) payload.watermarkPosition = settings.watermarkPosition;
    if (settings.watermarkOpacity !== undefined) payload.watermarkOpacity = Number(settings.watermarkOpacity);
    if (settings.watermarkSize !== undefined) payload.watermarkSize = Number(settings.watermarkSize);
    if (settings.watermarkMargin !== undefined) payload.watermarkMargin = Number(settings.watermarkMargin);

    const res = await api.patch("/auto-news/settings", payload);
    if (res?.success) {
      return { success: true, message: res.message || "সেটিংস সফলভাবে সংরক্ষিত হয়েছে।", data: res.data };
    }
    return { success: false, message: res?.message || "সেটিংস সংরক্ষণ করা যায়নি।" };
  } catch (err: any) {
    console.warn("Failed to update auto-news settings:", err);
    return { success: false, message: err?.message || "সার্ভার এরর: সেটিংস সংরক্ষণ ব্যর্থ হয়েছে।" };
  }
}

// 6. Get All 19 News Sources
export async function getAutoNewsSources(): Promise<AutoNewsSource[]> {
  try {
    const res = await api.get<AutoNewsSource[]>("/auto-news/sources");
    if (res?.success && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  } catch (err) {
    console.warn("Failed to get auto-news sources:", err);
    return [];
  }
}

// 7. Add New News Source
export async function addAutoNewsSource(source: Partial<AutoNewsSource>): Promise<boolean> {
  try {
    const res = await api.post("/auto-news/sources", source);
    return Boolean(res?.success);
  } catch (err) {
    console.warn("Failed to add auto-news source:", err);
    return false;
  }
}

// 8. Update Source (e.g. toggle active, change URL)
export async function updateAutoNewsSource(id: string, updates: Partial<AutoNewsSource>): Promise<boolean> {
  try {
    const res = await api.patch(`/auto-news/sources/${id}`, updates);
    return Boolean(res?.success);
  } catch (err) {
    console.warn("Failed to update auto-news source:", err);
    return false;
  }
}

// 9. Delete Source
export async function deleteAutoNewsSource(id: string): Promise<boolean> {
  try {
    const res = await api.delete(`/auto-news/sources/${id}`);
    return Boolean(res?.success);
  } catch (err) {
    console.warn("Failed to delete auto-news source:", err);
    return false;
  }
}

// 10. Get Live Terminal Logs
export async function getAutoNewsLogs(): Promise<AutoNewsLog[]> {
  try {
    const res = await api.get<AutoNewsLog[]>("/auto-news/logs");
    if (res?.success && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  } catch (err) {
    console.warn("Failed to get auto-news logs:", err);
    return [];
  }
}

// 11. Get Recent Auto-Posted Articles
export async function getRecentAutoPostedNews(): Promise<AutoNewsRecentPost[]> {
  try {
    const res = await api.get<AutoNewsRecentPost[]>("/auto-news/recent-posts");
    if (res?.success && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  } catch (err) {
    console.warn("Failed to get recent auto news posts:", err);
    return [];
  }
}

