export const API_BASE_URL =
  (process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5009/api/v1").replace(/\/+$/, "");

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    // In browser, proxy route eliminates CORS & domain mismatch issues completely
    return "/api/backend";
  }
  return API_BASE_URL;
}

export interface ApiResponse<T = any> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta?: any;
}


export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    const local =
      localStorage.getItem("banglaralo_token") ||
      localStorage.getItem("banglar_alo_news_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("jwt_token") ||
      localStorage.getItem("auth_token");
    if (local) return local;
  }
  return null; // Auto-login off: strictly require real login
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  const token =
    localStorage.getItem("banglaralo_token") ||
    localStorage.getItem("banglar_alo_news_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("jwt_token") ||
    localStorage.getItem("auth_token");
  const adminUser =
    localStorage.getItem("banglaralo_user") ||
    localStorage.getItem("banglar_alo_news_user") ||
    localStorage.getItem("admin_user");
  return Boolean(token && adminUser);
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("banglaralo_token", token);
  localStorage.setItem("banglar_alo_news_token", token);
  localStorage.setItem("token", token);
  localStorage.setItem("jwt_token", token);
  localStorage.setItem("auth_token", token);
  try {
    document.cookie = `auth_token=${token}; path=/; max-age=2592000; SameSite=Lax`;
  } catch { }
}

export function saveAdminUser(user: any): void {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(user);
    localStorage.setItem("banglaralo_user", serialized);
    localStorage.setItem("banglar_alo_news_user", serialized);
    localStorage.setItem("admin_user", serialized);
  } catch { }
}

export function getAdminUser(): any | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      localStorage.getItem("banglaralo_user") ||
      localStorage.getItem("banglar_alo_news_user") ||
      localStorage.getItem("admin_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email || typeof email !== "string") return false;
  const normalized = email.toLowerCase().trim();
  return (
    normalized === "super.admin@gmail.com" ||
    normalized === "superadmin@banglaralo.com" ||
    normalized === "admin@banglaralo.com" ||
    normalized.includes("admin")
  );
}

export function canDelete(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const user = getAdminUser();
    const role = (user?.role || "").toUpperCase();
    if (role === "SUPER_ADMIN" || role === "ADMIN") return true;
    const email = user?.email || "";
    if (isSuperAdminEmail(email)) return true;
    const token = getAuthToken();
    if (token) return true;
    return false;
  } catch {
    return true;
  }
}

export function removeAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("banglaralo_token");
  localStorage.removeItem("banglar_alo_news_token");
  localStorage.removeItem("token");
  localStorage.removeItem("jwt_token");
  localStorage.removeItem("auth_token");
  localStorage.removeItem("banglaralo_user");
  localStorage.removeItem("banglar_alo_news_user");
  localStorage.removeItem("admin_user");
  try {
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  } catch { }
}

// ----------------- Performance Cache & Request Deduplication -----------------
interface CacheEntry<T> {
  data: ApiResponse<T>;
  expiresAt: number;
}

const GET_CACHE = new Map<string, CacheEntry<any>>();
const IN_FLIGHT_REQUESTS = new Map<string, Promise<ApiResponse<any> | null>>();
const DEFAULT_TTL_MS = 60 * 1000; // 60 seconds in-memory cache
const STATIC_TTL_MS = 5 * 60 * 1000; // 5 minutes for settings and categories

export function clearApiCache(): void {
  GET_CACHE.clear();
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T> | null> {
  const method = (options.method || "GET").toUpperCase();
  const isGet = method === "GET";

  const rawToken = getAuthToken();
  const token = rawToken ? rawToken.replace(/^Bearer\s+/i, "").trim() : null;

  const isAdminOrAuth =
    Boolean(token) ||
    Boolean((options.headers as Record<string, string>)?.["Authorization"]) ||
    endpoint.includes("/admin") ||
    endpoint.includes("/auto-news") ||
    endpoint.includes("/settings") ||
    endpoint.includes("/categories") ||
    endpoint.includes("/auth") ||
    endpoint.includes("/users");

  // Admin and sensitive endpoints MUST NEVER be cached
  const noCache =
    isAdminOrAuth ||
    options.cache === "no-store" ||
    (options.headers as Record<string, string>)?.["Cache-Control"] === "no-cache" ||
    endpoint.includes("cache=false") ||
    endpoint.includes("_t=");

  const baseUrl = getApiBaseUrl();
  let url = endpoint.startsWith("http")
    ? endpoint
    : `${baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  // For admin requests or noCache, append cache-buster _t if not already present
  if (isGet && noCache && typeof window !== "undefined") {
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}_t=${Date.now()}`;
  }

  // 1. Check in-memory cache for GET requests
  const now = Date.now();
  if (isGet && !noCache) {
    const cached = GET_CACHE.get(url);
    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    // 2. In-flight request deduplication: return existing pending promise
    const inFlight = IN_FLIGHT_REQUESTS.get(url);
    if (inFlight) {
      return inFlight;
    }
  }

  // 3. Clear cache on mutations (POST, PUT, PATCH, DELETE)
  if (!isGet) {
    clearApiCache();
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (noCache) {
    headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
    headers["Pragma"] = "no-cache";
  }

  if (headers["Authorization"]) {
    headers["Authorization"] = headers["Authorization"].replace(/^Bearer\s+/i, "").trim();
  } else if (token && !endpoint.includes("/auth/login") && !endpoint.includes("/auth/register")) {
    headers["Authorization"] = token;
  }

  // 4. Setup timeout controller (20s for mutations, 15s for GET to prevent network timeouts)
  const isMutation = !["GET", "HEAD"].includes(method);
  const timeoutMs = isMutation ? 20000 : 15000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const isStaticLike = endpoint.includes("/settings") || endpoint.includes("/categories");
  const isNewsQuery = endpoint.includes("/news");
  const cacheTtl = isStaticLike
    ? 30000 // 30s max for public settings
    : isNewsQuery
      ? 5000 // Only 5s for news so newly published articles appear instantly
      : DEFAULT_TTL_MS;

  const fetchPromise = (async () => {
    try {
      const nextFetchOptions: any = {
        ...options,
        headers,
        signal: options.signal || controller.signal,
      };

      // Add Next.js data caching for server components (ONLY for unauthenticated public GETs)
      if (noCache) {
        nextFetchOptions.cache = "no-store";
      } else if (typeof window === "undefined" && isGet) {
        nextFetchOptions.next = { revalidate: isStaticLike ? 30 : (isNewsQuery ? 5 : 15) };
      }

      const res = await fetch(url, nextFetchOptions);

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorJson = await res.json().catch(() => null);
        console.warn(`API [${method}] ${endpoint} failed (${res.status}):`, errorJson || res.statusText);
        return errorJson || { statusCode: res.status, success: false, message: res.statusText, data: null as any };
      }

      const data: ApiResponse<T> = await res.json();

      // Store in memory cache for GET requests
      if (isGet && data && !noCache) {
        GET_CACHE.set(url, {
          data,
          expiresAt: Date.now() + cacheTtl,
        });
      }

      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);
      const isTimeout = error.name === "AbortError";
      console.warn(`API [${method}] ${endpoint} error:`, error.message);
      return {
        statusCode: isTimeout ? 408 : 500,
        success: false,
        message: isTimeout
          ? "সার্ভারের সাড়া পেতে অতিরিক্ত সময় লাগছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।"
          : (error.message || "সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি।"),
        data: null as any,
      };
    } finally {
      if (isGet) {
        IN_FLIGHT_REQUESTS.delete(url);
      }
    }
  })();

  if (isGet) {
    IN_FLIGHT_REQUESTS.set(url, fetchPromise);
  }

  return fetchPromise;
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { method: "GET", next: { revalidate: 30 }, ...options }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) => {
    let payload = body;
    if (
      body &&
      typeof body === "object" &&
      !Array.isArray(body) &&
      !endpoint.includes("/users") &&
      !endpoint.includes("/auth") &&
      !endpoint.includes("/categories") &&
      !endpoint.includes("/auto-news") &&
      !endpoint.includes("/analytics") &&
      !("body" in body)
    ) {
      payload = { ...body, body };
    }
    return apiRequest<T>(endpoint, {
      method: "POST",
      body: payload ? JSON.stringify(payload) : undefined,
      ...options,
    });
  },

  patch: <T = any>(endpoint: string, body?: any, options?: RequestInit) => {
    let payload = body;
    if (
      body &&
      typeof body === "object" &&
      !Array.isArray(body) &&
      !endpoint.includes("/users") &&
      !endpoint.includes("/auth") &&
      !endpoint.includes("/categories") &&
      !endpoint.includes("/auto-news") &&
      !endpoint.includes("/analytics") &&
      !("body" in body)
    ) {
      payload = { ...body, body };
    }
    return apiRequest<T>(endpoint, {
      method: "PATCH",
      body: payload ? JSON.stringify(payload) : undefined,
      ...options,
    });
  },

  put: <T = any>(endpoint: string, body?: any, options?: RequestInit) => {
    return apiRequest<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  },

  delete: <T = any>(endpoint: string, options?: RequestInit) => {
    if (!canDelete()) {
      console.warn("Delete blocked: user is not authorized to delete.");
      return Promise.resolve({
        statusCode: 403,
        success: false,
        message: "ডিলিট করার অনুমতি আপনার নেই।",
        data: null as any,
      });
    }
    return apiRequest<T>(endpoint, { method: "DELETE", ...options });
  },

  upload: async <T = any>(endpoint: string, formData: FormData): Promise<ApiResponse<T> | null> => {
    const baseUrl = getApiBaseUrl();
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const rawToken = getAuthToken();
    const token = rawToken ? rawToken.replace(/^Bearer\s+/i, "").trim() : null;
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = token;
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      });
      return await res.json();
    } catch (err: any) {
      console.warn(`API upload ${endpoint} network error:`, err.message);
      return null;
    }
  },
};
