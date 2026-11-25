import { MetadataRoute } from "next";
import { BANGLADESH_DISTRICTS_SVG } from "@/lib/bangladeshDistrictsSvgData";

export const dynamic = "force-dynamic";
export const revalidate = 86400; // 24 hours

const STANDARD_CATEGORIES = [
  "national",
  "politics",
  "countrywide",
  "economy",
  "international",
  "sports",
  "entertainment",
  "technology",
  "lifestyle",
  "education",
  "jobs",
  "opinion",
];

const STATIC_ROUTES = [
  "",
  "/latest",
  "/popular",
  "/archive",
  "/gallery",
  "/videos",
  "/our-family",
  "/about",
  "/contact",
  "/editorial-policy",
  "/privacy-policy",
  "/terms",
  "/advertise",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.banglaralonews.com").replace(/\/+$/, "");

  // 1. Static Core Routes
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? ("always" as const) : ("daily" as const),
    priority: route === "" ? 1.0 : 0.8,
  }));

  // 2. Standard & Dynamic Categories (with fast 2-second timeout to avoid build hangs)
  let categoriesToUse = STANDARD_CATEGORIES;
  try {
    const { getCategories } = await import("@/services/newsService");
    const fastCatPromise = getCategories();
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000));
    const remoteCats = await Promise.race([fastCatPromise, timeoutPromise]);
    if (Array.isArray(remoteCats) && remoteCats.length > 0) {
      categoriesToUse = Array.from(new Set([...STANDARD_CATEGORIES, ...remoteCats.map((c: any) => c.slug)]));
    }
  } catch {}

  const categoryEntries: MetadataRoute.Sitemap = categoriesToUse.map((catSlug) => ({
    url: `${baseUrl}/category/${catSlug}`,
    lastModified: new Date(),
    changeFrequency: "hourly" as const,
    priority: 0.9,
  }));

  // 3. 64 Bangladesh Districts (Instant & Superb for Local News SEO)
  const districtEntries: MetadataRoute.Sitemap = BANGLADESH_DISTRICTS_SVG.map((d) => ({
    url: `${baseUrl}/district/${d.id}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  // 4. Articles (Fast 2-second timeout fallback)
  let articleEntries: MetadataRoute.Sitemap = [];
  try {
    const { getAllArticles } = await import("@/services/newsService");
    const fastArticlePromise = getAllArticles(30);
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000));
    const articles = await Promise.race([fastArticlePromise, timeoutPromise]);

    if (Array.isArray(articles) && articles.length > 0) {
      articleEntries = articles.map((article: any) => ({
        url: `${baseUrl}/news/${article.slug}`,
        lastModified: article.publishedAt ? new Date(article.publishedAt) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch {}

  return [...staticEntries, ...categoryEntries, ...districtEntries, ...articleEntries];
}
