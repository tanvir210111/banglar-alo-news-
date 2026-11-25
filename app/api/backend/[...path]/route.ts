import { NextRequest, NextResponse } from "next/server";

const TARGET_API = (process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "https://api.banglaralonews.com/api/v1").replace(/\/+$/, "");

interface ProxyCacheItem {
  body: ArrayBuffer;
  status: number;
  statusText: string;
  headers: [string, string][];
  expiresAt: number;
}

// Ultra-fast in-memory cache for public GET endpoints (1ms responses)
const PROXY_GET_CACHE = new Map<string, ProxyCacheItem>();

function isCacheable(method: string, subPath: string, req: NextRequest): boolean {
  if (method !== "GET") return false;
  // If request has Authorization header or admin token, NEVER CACHE!
  if (req.headers.get("authorization") || req.headers.get("x-admin-token")) {
    return false;
  }
  const lower = subPath.toLowerCase();
  // Never cache user-specific, auth, draft, auto-news, settings, admin, or dynamic endpoints
  if (
    lower.includes("auth") ||
    lower.includes("draft") ||
    lower.includes("users") ||
    lower.includes("profile") ||
    lower.includes("logout") ||
    lower.includes("fetch-external") ||
    lower.includes("auto-news") ||
    lower.includes("analytics") ||
    lower.includes("settings") ||
    lower.includes("admin")
  ) {
    return false;
  }
  return true;
}

function getCacheTtlMs(subPath: string): number {
  const lower = subPath.toLowerCase();
  if (
    lower.includes("categories") ||
    lower.includes("advertisements")
  ) {
    return 30 * 1000; // 30s for static categories
  }
  return 10 * 1000; // 10 seconds for public news
}

async function proxyHandler(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    if (!TARGET_API) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 503,
          message: "Backend API URL is not configured yet. Set NEXT_PUBLIC_API_URL in .env",
          data: null,
        },
        { status: 503 }
      );
    }

    const { path } = await context.params;
    const subPath = (path || []).join("/");
    const search = req.nextUrl.search || "";
    const targetUrl = `${TARGET_API}/${subPath}${search}`;
    const cacheKey = `${subPath}?${search}`;

    // Fast-path: clear cache on write/mutation requests so updates are immediate
    if (req.method !== "GET" && req.method !== "HEAD") {
      PROXY_GET_CACHE.clear();
    } else if (isCacheable(req.method, subPath, req)) {
      const cached = PROXY_GET_CACHE.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        const cachedHeaders = new Headers();
        cached.headers.forEach(([k, v]) => cachedHeaders.set(k, v));
        cachedHeaders.set("X-Proxy-Cache", "HIT");
        return new NextResponse(cached.body.slice(0), {
          status: cached.status,
          statusText: cached.statusText,
          headers: cachedHeaders,
        });
      }
    }

    const headers = new Headers();
    req.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      // Drop headers that could cause issues with upstream server
      if (
        lower !== "host" &&
        lower !== "connection" &&
        lower !== "content-length" &&
        lower !== "origin" &&
        lower !== "referer"
      ) {
        headers.set(key, value);
      }
    });

    // Upstream needs application/json if sending JSON
    const contentType = req.headers.get("content-type");
    if (contentType) {
      headers.set("content-type", contentType);
    }

    // Keep connection alive for fast socket reuse
    headers.set("connection", "keep-alive");

    const hasBody = req.method !== "GET" && req.method !== "HEAD";
    const body = hasBody ? await req.arrayBuffer() : undefined;

    const upstreamRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      // @ts-ignore
      duplex: hasBody ? "half" : undefined,
    });

    const responseBody = await upstreamRes.arrayBuffer();
    const responseHeaders = new Headers();
    upstreamRes.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (
        lower !== "content-encoding" &&
        lower !== "transfer-encoding" &&
        lower !== "content-length"
      ) {
        responseHeaders.set(key, value);
      }
    });

    const lowerSub = subPath.toLowerCase();
    const shouldNeverCacheInBrowser =
      req.method !== "GET" ||
      Boolean(req.headers.get("authorization")) ||
      Boolean(req.headers.get("x-admin-token")) ||
      lowerSub.includes("settings") ||
      lowerSub.includes("auto-news") ||
      lowerSub.includes("admin") ||
      lowerSub.includes("auth") ||
      lowerSub.includes("users") ||
      lowerSub.includes("draft") ||
      lowerSub.includes("profile") ||
      req.nextUrl.searchParams.has("_t");

    if (shouldNeverCacheInBrowser) {
      responseHeaders.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
      responseHeaders.set("Pragma", "no-cache");
      responseHeaders.set("Expires", "0");
      responseHeaders.set("X-Proxy-Cache", "BYPASS");
    } else if (req.method === "GET" && upstreamRes.status === 200) {
      // Only public unauthenticated news GETs get micro-caching
      responseHeaders.set("Cache-Control", "public, max-age=5, stale-while-revalidate=10");
      responseHeaders.set("X-Proxy-Cache", "MISS");

      // Save into ultra-fast in-memory cache
      if (isCacheable(req.method, subPath, req)) {
        const headerEntries: [string, string][] = [];
        responseHeaders.forEach((val, key) => headerEntries.push([key, val]));
        PROXY_GET_CACHE.set(cacheKey, {
          body: responseBody.slice(0),
          status: upstreamRes.status,
          statusText: upstreamRes.statusText,
          headers: headerEntries,
          expiresAt: Date.now() + getCacheTtlMs(subPath),
        });
      }
    }

    return new NextResponse(responseBody, {
      status: upstreamRes.status,
      statusText: upstreamRes.statusText,
      headers: responseHeaders,
    });
  } catch (err: any) {
    console.error("Backend Proxy Error:", err);
    return NextResponse.json(
      {
        success: false,
        statusCode: 502,
        message: "Proxy failed to reach backend API: " + (err.message || String(err)),
      },
      { status: 502 }
    );
  }
}

export const GET = proxyHandler;
export const POST = proxyHandler;
export const PUT = proxyHandler;
export const PATCH = proxyHandler;
export const DELETE = proxyHandler;

