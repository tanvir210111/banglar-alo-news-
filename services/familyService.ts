import { FamilyMember, DEFAULT_FAMILY_MEMBERS } from "@/types/family";
import { api } from "@/services/apiClient";

const STORAGE_KEY = "banglar_alo_our_family";

export async function getFamilyMembers(): Promise<FamilyMember[]> {
  try {
    // 1. Try backend API
    const res = await api.get<any[]>("/our-family");
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map((m: any, idx: number) => ({
        id: String(m.id || m._id || `fam-${idx}`),
        name: m.name,
        role: m.role || m.designation || "",
        category: m.category || "editorial",
        categoryTitle: m.categoryTitle || "",
        email: m.email || "",
        phone: m.phone || "",
        photo: m.photo || m.image || "",
        bio: m.bio || "",
        subMembers: m.subMembers || "",
        order: typeof m.order === "number" ? m.order : idx + 1,
        isActive: m.isActive !== false,
      }));
    }
  } catch {
    // Backend API not ready yet or offline
  }

  // 2. Client-side localStorage fallback
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.sort((a, b) => (a.order || 0) - (b.order || 0));
        }
      }
    } catch {}
  }

  return DEFAULT_FAMILY_MEMBERS;
}

export async function saveFamilyMembers(members: FamilyMember[]): Promise<boolean> {
  const sorted = [...members].sort((a, b) => (a.order || 0) - (b.order || 0));

  // Save to localStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
      localStorage.setItem("banglar_alo_family_updated", String(Date.now()));
      // Broadcast across tabs
      if ("BroadcastChannel" in window) {
        const ch = new BroadcastChannel("banglar_alo_news_channel");
        ch.postMessage({ type: "FAMILY_UPDATED" });
      }
    } catch {}
  }

  // Also attempt sending to backend
  try {
    await api.post("/our-family/sync", { members: sorted });
  } catch {}

  return true;
}
