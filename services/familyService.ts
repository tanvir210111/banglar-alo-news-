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

  // Also attempt sending to backend sync endpoint
  try {
    await api.post("/our-family/sync", { members: sorted });
  } catch (err) {
    console.warn("Failed to sync family members with backend:", err);
  }

  return true;
}

export async function createFamilyMember(member: Partial<FamilyMember>): Promise<any> {
  let createdData: any = null;
  try {
    const res = await api.post("/our-family", member);
    if (res?.success) {
      createdData = res.data;
    }
  } catch (err) {
    console.warn("Failed to create family member on backend:", err);
  }

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed: FamilyMember[] = stored ? JSON.parse(stored) : [];
      const newM: FamilyMember = {
        id: createdData?.id || createdData?._id || `fam-${Date.now()}`,
        name: member.name || "",
        role: member.role || "",
        category: (member.category as any) || "editorial",
        categoryTitle: member.categoryTitle || "",
        email: member.email || "",
        phone: member.phone || "",
        photo: member.photo || "",
        bio: member.bio || "",
        subMembers: member.subMembers || "",
        order: member.order || parsed.length + 1,
        isActive: member.isActive !== false,
      };
      const updated = [...parsed, newM].sort((a, b) => (a.order || 0) - (b.order || 0));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      localStorage.setItem("banglar_alo_family_updated", String(Date.now()));
      if ("BroadcastChannel" in window) {
        const ch = new BroadcastChannel("banglar_alo_news_channel");
        ch.postMessage({ type: "FAMILY_UPDATED" });
      }
    } catch {}
  }

  return createdData;
}

export async function updateFamilyMember(id: string, updates: Partial<FamilyMember>): Promise<boolean> {
  let success = false;
  try {
    const res = await api.put(`/our-family/${id}`, updates);
    if (res?.success) {
      success = true;
    }
  } catch (err) {
    console.warn("Failed to update family member on backend:", err);
  }

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: FamilyMember[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const updated = parsed.map((m) => (m.id === id ? { ...m, ...updates } : m));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          localStorage.setItem("banglar_alo_family_updated", String(Date.now()));
          if ("BroadcastChannel" in window) {
            const ch = new BroadcastChannel("banglar_alo_news_channel");
            ch.postMessage({ type: "FAMILY_UPDATED" });
          }
        }
      }
    } catch {}
  }

  return success;
}

export async function deleteFamilyMember(id: string): Promise<boolean> {
  let backendSuccess = false;
  try {
    const res = await api.delete(`/our-family/${id}`);
    if (res?.success) {
      backendSuccess = true;
    }
  } catch (err) {
    console.warn("Failed to delete family member from backend:", err);
  }

  // Always update localStorage and broadcast immediately
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: FamilyMember[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((m) => m.id !== id);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
          localStorage.setItem("banglar_alo_family_updated", String(Date.now()));
          if ("BroadcastChannel" in window) {
            const ch = new BroadcastChannel("banglar_alo_news_channel");
            ch.postMessage({ type: "FAMILY_UPDATED" });
          }
        }
      }
    } catch {}
  }

  return backendSuccess;
}
