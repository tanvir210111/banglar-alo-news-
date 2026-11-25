import { cache } from "react";
import {
  Article,
  Category,
  Author,
  Tag,
  Comment,
  GalleryItem,
  VideoItem,
  BreakingNewsItem,
  SiteSettings,
} from "@/types/news";
export { clearApiCache } from "@/services/apiClient";
import { api, clearApiCache } from "@/services/apiClient";


// Convert backend Bengali date or ISO string to standard formatted Bengali date string
export function formatToBengaliDate(isoDateString?: string): string {
  if (!isoDateString) return "আজ";
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return isoDateString;
    const formatted = date.toLocaleDateString("bn-BD", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Dhaka",
    });
    return formatted;
  } catch {
    return isoDateString;
  }
}

export function formatToEnglishDate(isoDateString?: string): string {
  if (!isoDateString) return "Today";
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return isoDateString;
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Dhaka",
    });
  } catch {
    return isoDateString;
  }
}

// Remove watermarks, external logos, overlays (e.g. Prothom Alo / Quintype / Imgix watermarks)
export function cleanNewsImageUrl(url: string): string {
  if (!url || typeof url !== "string") return url;
  try {
    let raw = url.replace(/&amp;/g, "&").trim();
    // Normalize encoded slashes in pathname (e.g. media.prothomalo.com/prothomalo-bangla%2F...)
    if (raw.includes("%2F") || raw.includes("%2f")) {
      try {
        const temp = new URL(raw);
        temp.pathname = decodeURIComponent(temp.pathname);
        raw = temp.toString();
      } catch {
        raw = raw.replace(/%2F/gi, "/");
      }
    }
    if (
      raw.includes("overlay=") ||
      raw.includes("ogImage=") ||
      raw.includes("watermark=") ||
      raw.includes("wm=") ||
      raw.includes("logo=")
    ) {
      const u = new URL(raw);
      u.searchParams.delete("overlay");
      u.searchParams.delete("overlay_position");
      u.searchParams.delete("overlay_width_pct");
      u.searchParams.delete("overlay_height_pct");
      u.searchParams.delete("ogImage");
      u.searchParams.delete("watermark");
      u.searchParams.delete("wm");
      u.searchParams.delete("logo");
      raw = u.toString();
    }
    return raw;
  } catch {
    return url
      .replace(/%2F/gi, "/")
      .replace(/[?&]overlay=[^&]+/gi, "")
      .replace(/[?&]overlay_position=[^&]+/gi, "")
      .replace(/[?&]overlay_width_pct=[^&]+/gi, "")
      .replace(/[?&]ogImage=[^&]+/gi, "")
      .replace(/[?&]watermark=[^&]+/gi, "")
      .replace(/[?&]wm=[^&]+/gi, "");
  }
}

// Known extracted images cache (maps article id / slug to real image URL)
const KNOWN_ARTICLE_IMAGES: Record<string, string> = {
  "6ae5ad3319ca7e66db97a270": "https://res.cloudinary.com/pbtmxc9w/image/upload/v1793436884/files/file_huykhh.jpg",
  "ফরহাদ-ভাইয়ের-বিয়েতে-গ্যাংস্টার-সাইদ-ভাইয়ের-আগমন": "https://res.cloudinary.com/pbtmxc9w/image/upload/v1793436884/files/file_huykhh.jpg",
  "6ae72fda99d97ab28310b449": "https://media.prothomalo.com/prothomalo-bangla/2026-11-01/7x2qj13s/RamlilaCongress.jpg?rect=0%2C15%2C1296%2C680&w=1200&ar=40%3A21&auto=format%2Ccompress&mode=crop",
  "মোদিবিরোধী-জোটের-বিক্ষোভে-লাখো-মানুষ-রামলীলা-ময়দানের-ভেতরে-যত-জন-বাইরে-তার-দ্বিগুণ": "https://media.prothomalo.com/prothomalo-bangla/2026-11-01/7x2qj13s/RamlilaCongress.jpg?rect=0%2C15%2C1296%2C680&w=1200&ar=40%3A21&auto=format%2Ccompress&mode=crop",
};

// Intelligent mapper: transforms backend API news response into frontend Article interface
export function mapBackendNewsToArticle(item: any): Article {
  if (!item) {
    return {
      id: "fallback-id",
      title: "",
      slug: "",
      summary: "",
      content: "",
      category: { id: "1", name: "জাতীয়", slug: "national", order: 1, isMain: true },
      author: { id: "writer-1", name: "নিজস্ব প্রতিবেদক", slug: "staff-reporter", role: "নিজস্ব প্রতিবেদক", bio: "", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" },
      featuredImage: { url: "/images/news-placeholder.svg", caption: "", credit: "", alt: "" },
      tags: [],
      publishedAt: new Date().toISOString(),
      publishedAtBengali: "আজ",
      readingTimeMinutes: 3,
      isLead: false,
      isBreaking: false,
      isFeatured: false,
      viewsCount: 0,
      sharesCount: 0,
    };
  }

  // Already an Article
  if (item.author && item.publishedAtBengali && item.featuredImage?.caption !== undefined) {
    if (
      item.category?.slug === "gram-gonjo" ||
      item.category?.slug === "gramgonj" ||
      item.category?.name === "গ্রামগঞ্জ" ||
      item.category?.id === "6ae1d5cf586845309f505418" ||
      item.category?.slug === "durghotona" ||
      item.category?.slug === "durghatona"
    ) {
      item.category.name = "দুর্ঘটনা";
      item.category.slug = "accident";
      item.category.id = "6ae1d5cf586845309f505418";
    }
    return item as Article;
  }

  let categoryName = item.category?.name || "জাতীয়";
  let categorySlug = item.category?.slug || "national";
  let categoryId = String(item.category?.id || item.category?._id || item.categoryId || "cat-1");

  // Totally eradicate legacy 'gram-gonjo' / 'গ্রামগঞ্জ' -> ALWAYS 'দুর্ঘটনা' / 'accident'
  if (
    categorySlug === "gram-gonjo" ||
    categorySlug === "gramgonj" ||
    categoryName === "গ্রামগঞ্জ" ||
    categoryId === "6ae1d5cf586845309f505418" ||
    categorySlug === "durghotona" ||
    categorySlug === "durghatona"
  ) {
    categoryName = "দুর্ঘটনা";
    categorySlug = "accident";
    categoryId = "6ae1d5cf586845309f505418";
  }

  const category: Category = {
    id: categoryId,
    name: categoryName,
    slug: categorySlug,
    order: 1,
    isMain: true,
  };

  const rawAuthorName = (item.writer?.name || item.guestWriterName || "").trim();
  const isOldDummyWriter =
    !rawAuthorName ||
    rawAuthorName === "Abrar Chowdhury" ||
    rawAuthorName.toLowerCase() === "abrar chowdhury" ||
    rawAuthorName.toLowerCase() === "abrar" ||
    ["ফারহানা করিম", "ড. সৈয়দ আনোয়ারুল হক", "নাসরিন সুলতানা", "রাকিবুল হাসান", "ফারিহা তাসনিম", "স্টাফ রিপোর্টার"].includes(rawAuthorName);
  const authorName = isOldDummyWriter ? "Newsroom" : rawAuthorName;
  const rawAuthorRole = (item.writer?.designationTitle || item.guestWriterDesignation || "").trim();
  const authorRole =
    !rawAuthorRole || rawAuthorRole === "প্রতিবেদক" || rawAuthorRole.toLowerCase() === "reporter"
      ? "নিজস্ব প্রতিবেদক"
      : rawAuthorRole;
  const authorAvatar =
    item.writer?.profileImage && !item.writer.profileImage.includes("unsplash.com")
      ? item.writer.profileImage
      : "/images/logo.svg";

  const authorSlug =
    item.writer?.id && item.writer.id !== "abrar-chowdhury"
      ? item.writer.id
      : "newsroom";

  const author: Author = {
    id: authorSlug,
    name: authorName === "প্রতিবেদক" ? "নিজস্ব প্রতিবেদক" : authorName,
    slug: authorSlug,
    role: authorRole,
    bio: item.writer?.bio || "নিউজ রুম, বাংলার আলো নিউজ",
    avatar: authorAvatar,
  };

  const itemId = String(item.id || item._id || "");
  const itemSlug = String(item.slug || "");

  let featuredImageUrl =
    typeof item.featuredImage === "string"
      ? item.featuredImage.trim()
      : item.featuredImage?.url?.trim() || "";

  if (!featuredImageUrl) {
    featuredImageUrl =
      typeof item.leadImage === "string"
        ? item.leadImage.trim()
        : item.leadImage?.url?.trim() || "";
  }

  // Check known article images cache
  if ((!featuredImageUrl || featuredImageUrl.includes("unsplash.com")) && (KNOWN_ARTICLE_IMAGES[itemId] || KNOWN_ARTICLE_IMAGES[itemSlug])) {
    featuredImageUrl = KNOWN_ARTICLE_IMAGES[itemId] || KNOWN_ARTICLE_IMAGES[itemSlug];
  }

  // If featuredImageUrl is empty or is the default unsplash typewriter image,
  // extract real image from content if available
  if (!featuredImageUrl || featuredImageUrl.includes("unsplash.com")) {
    const contentStr =
      typeof item.content === "string"
        ? item.content
        : typeof item.contentEn === "string"
          ? item.contentEn
          : "";
    const match = contentStr.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match && match[1]) {
      featuredImageUrl = match[1];
      if (itemId) KNOWN_ARTICLE_IMAGES[itemId] = match[1];
      if (itemSlug) KNOWN_ARTICLE_IMAGES[itemSlug] = match[1];
    } else {
      featuredImageUrl = "";
    }
  } else if (featuredImageUrl && !featuredImageUrl.includes("unsplash.com") && !featuredImageUrl.includes("placeholder")) {
    if (itemId) KNOWN_ARTICLE_IMAGES[itemId] = featuredImageUrl;
    if (itemSlug) KNOWN_ARTICLE_IMAGES[itemSlug] = featuredImageUrl;
  }

  const tags: Tag[] = Array.isArray(item.tags)
    ? item.tags.map((t: any, idx: number) => {
      if (typeof t === "string") {
        return { id: `tag-${idx}`, name: t, slug: encodeURIComponent(t) };
      }
      return t;
    })
    : [];

  const rawReadingTime = typeof item.readingTime === "string" ? parseInt(item.readingTime, 10) : item.readingTime;
  const readingTimeMinutes = !isNaN(rawReadingTime) && rawReadingTime > 0 ? rawReadingTime : 3;

  const publishedAt = item.publishedDate || item.createdAt || new Date().toISOString();
  const publishedAtBengali = formatToBengaliDate(publishedAt);

  const rawSummary = item.summary && item.summary.trim() !== (item.title || "").trim() ? item.summary.trim() : "";
  const rawCredit = (item.photoCredit || item.leadImagePhotographer || "").trim();
  const cleanPhotoCredit = rawCredit ? rawCredit.replace(/^ছবি\s*:\s*/i, "").trim() : "";

  return {
    id: String(item.id || item._id),
    title: item.title || "",
    titleEn: item.titleEn || item.title || "",
    subtitle: item.subtitle,
    subtitleEn: item.subtitleEn,
    slug: item.slug || String(item.id),
    summary: rawSummary,
    summaryEn: item.summaryEn || rawSummary,
    content: item.content || [],
    contentEn: item.contentEn || "",
    category,
    author,
    featuredImage: {
      url: featuredImageUrl ? cleanNewsImageUrl(featuredImageUrl) : "",
      caption: item.imageCaption || item.leadImageCaption || "",
      credit: cleanPhotoCredit,
      alt: item.title || "নিউজ ছবি",
    },
    tags,
    publishedAt,
    publishedAtBengali,
    publishedAtEnglish: formatToEnglishDate(publishedAt),
    readingTimeMinutes,
    isLead: Boolean(item.isLead),
    isSubLead: Boolean(item.isSubLead),
    isFeatured: Boolean(item.isFeatured),
    isBreaking: Boolean(item.isBreaking),
    isTrending: Boolean(item.isTrending),
    isSlider: Boolean(item.isSlider),
    viewsCount: item.viewsCount || 0,
    sharesCount: item.sharesCount || 0,
    likesCount: typeof item.likesCount === "number" ? item.likesCount : (item.reactions?.likes || 0),
    dislikesCount: typeof item.dislikesCount === "number" ? item.dislikesCount : (item.reactions?.dislikes || 0),
    publishStatus: item.publishStatus || "PUBLISHED",
    isHidden: Boolean(item.isHidden),
    youtubeLink: item.youtubeLink,
    division: item.division,
    district: item.district,
    upazila: item.upazila,
    navigation: item.navigation,
    relatedNews: item.relatedNews,
  };
}

// ----------------- Categories -----------------

export const WEBSITE_CATEGORY_SLUGS = [
  "national",
  "international",
  "politics",
  "countrywide",
  "crime-corruption",
  "education",
  "accident",
  "women-and-children",
  "capital",
  "sports",
  "islam",
  "economy",
  "technology",
  "agriculture",
  "health",
  "entertainment",
  "law-and-court",
  "jobs",
  "business",
  "opinion",
  "greetings",
];

export const FALLBACK_CATEGORIES: Category[] = [
  { id: "6adf06b6edbce197278ace6b", name: "জাতীয়", slug: "national", order: 1, isMain: true },
  { id: "6adf06f2edbce197278ace6d", name: "রাজনীতি", slug: "politics", order: 2, isMain: true },
  { id: "6adf06fbedbce197278ace71", name: "অর্থনীতি", slug: "economy", order: 3, isMain: true },
  { id: "6adf06f4edbce197278ace6e", name: "আন্তর্জাতিক", slug: "international", order: 4, isMain: true },
  { id: "6adf0704edbce197278ace75", name: "সারাদেশ", slug: "countrywide", order: 5, isMain: true },
  { id: "6ae1d5cf586845309f505419", name: "অপরাধ ও দুর্নীতি", slug: "crime-corruption", order: 6, isMain: true },
  { id: "6adf06ffedbce197278ace73", name: "শিক্ষা", slug: "education", order: 7, isMain: true },
  { id: "6adf06f7edbce197278ace6f", name: "খেলাধুলা", slug: "sports", order: 8, isMain: true },
  { id: "6adf06f9edbce197278ace70", name: "বিনোদন", slug: "entertainment", order: 9, isMain: true },
  { id: "6ae1d5cf586845309f505418", name: "দুর্ঘটনা", slug: "accident", order: 10, isMain: false },
  { id: "6adf070cedbce197278ace79", name: "রাজধানী", slug: "capital", order: 11, isMain: false },
  { id: "6ae1d5d4586845309f50541e", name: "নারী ও শিশু", slug: "women-and-children", order: 12, isMain: false },
  { id: "6adf0708edbce197278ace77", name: "ইসলাম", slug: "islam", order: 13, isMain: false },
  { id: "6adf06fdedbce197278ace72", name: "প্রযুক্তি", slug: "technology", order: 14, isMain: false },
  { id: "6ae1d5d1586845309f50541a", name: "কৃষি", slug: "agriculture", order: 15, isMain: false },
  { id: "6adf0702edbce197278ace74", name: "স্বাস্থ্য", slug: "health", order: 16, isMain: false },
  { id: "6ae1d5d3586845309f50541b", name: "আইন ও আদালত", slug: "law-and-court", order: 17, isMain: false },
  { id: "6ae1d5d3586845309f50541c", name: "চাকরি", slug: "jobs", order: 18, isMain: false },
  { id: "6ae1d5d4586845309f50541d", name: "ব্যবসা-বাণিজ্য", slug: "business", order: 19, isMain: false },
  { id: "6adf070aedbce197278ace78", name: "মতামত", slug: "opinion", order: 20, isMain: false },
  { id: "6ae1d5d4586845309f50541f", name: "জন্মদিন ও শুভেচ্ছা", slug: "greetings", order: 21, isMain: false },
];

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await api.get<any[]>("/categories");
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      const list: Category[] = [];
      for (let idx = 0; idx < res.data.length; idx++) {
        const c = res.data[idx];
        let name = c.name;
        let slug = c.slug;
        let description = c.description;

        // If backend returns legacy 'গ্রামগঞ্জ' / 'gram-gonjo', rename it to 'দুর্ঘটনা' / 'accident'
        if (
          slug === "gram-gonjo" ||
          slug === "gramgonj" ||
          name === "গ্রামগঞ্জ" ||
          String(c.id || c._id) === "6ae1d5cf586845309f505418"
        ) {
          name = "দুর্ঘটনা";
          slug = "accident";
          description = "দুর্ঘটনা ও উদ্ধার তৎপরতার সর্বশেষ সংবাদ";
        }

        const rawOrder = c.order !== undefined ? c.order : c.orderIndex;
        const parsedOrder = typeof rawOrder === "number" ? rawOrder : parseInt(String(rawOrder), 10);
        const orderNum = isNaN(parsedOrder) ? idx + 1 : parsedOrder;

        list.push({
          id: String(c.id || c._id),
          name,
          slug,
          description: description || "",
          order: orderNum,
          isMain: idx < 10,
          articleCount: c._count?.news ?? c.articleCount ?? 0,
        });
      }

      // Ensure 'accident' is in the categories list if not present
      if (!list.some((c) => c.slug === "accident")) {
        list.push({
          id: "6ae1d5cf586845309f505418",
          name: "দুর্ঘটনা",
          slug: "accident",
          description: "দুর্ঘটনা ও উদ্ধার তৎপরতার সর্বশেষ সংবাদ",
          order: 7,
          isMain: true,
        });
      }

      // Ensure 'countrywide' (সারাদেশ) is in the categories list if not present
      if (!list.some((c) => c.slug === "countrywide")) {
        list.push({
          id: "6adf0704edbce197278ace75",
          name: "সারাদেশ",
          slug: "countrywide",
          description: "সারাদেশের বিভাগ ও জেলা পর্যায়ের সংবাদ",
          order: 4,
          isMain: true,
        });
      }

      // Deduplicate by slug
      const uniqueMap = new Map<string, Category>();
      for (const item of list) {
        if (!uniqueMap.has(item.slug)) {
          uniqueMap.set(item.slug, item);
        }
      }

      // 100% Dynamic: Return all categories ordered by backend order
      const allCategories = Array.from(uniqueMap.values());
      allCategories.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

      return allCategories;
    }
  } catch (err) {
    console.warn("Using fallback categories due to:", err);
  }
  return FALLBACK_CATEGORIES;
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  if (!slug) return undefined;
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug).trim().toLowerCase();
  } catch {}
  const target = decodedSlug;

  // 1. Try finding in loaded categories list
  const cats = await getCategories();
  const found = cats.find(
    (c) =>
      c.slug?.toLowerCase()?.trim() === target ||
      c.id === slug ||
      c.name?.toLowerCase()?.trim() === target
  );
  if (found) return found;

  // 2. Direct live backend API lookup for newly created categories
  try {
    const res = await api.get<any>(`/categories/${encodeURIComponent(slug)}`);
    if (res?.success && res.data) {
      const c = res.data;
      const rawOrder = c.order !== undefined ? c.order : c.orderIndex;
      const parsedOrder = typeof rawOrder === "number" ? rawOrder : parseInt(String(rawOrder), 10);
      return {
        id: String(c.id || c._id),
        name: c.name,
        slug: c.slug,
        description: c.description || "",
        order: isNaN(parsedOrder) ? 999 : parsedOrder,
        isMain: false,
        articleCount: c._count?.news ?? 0,
      };
    }
  } catch (err) {
    console.warn(`Direct category lookup for ${slug} failed:`, err);
  }

  // 3. Known aliases
  if (
    target === "accident" ||
    target === "durghotona" ||
    target === "durghatona" ||
    target === "gram-gonjo" ||
    target === "gramgonj"
  ) {
    return {
      id: "6ae1d5cf586845309f505418",
      name: "দুর্ঘটনা",
      slug: "accident",
      order: 7,
      isMain: true,
      description: "দুর্ঘটনা ও উদ্ধার তৎপরতার সর্বশেষ সংবাদ",
    };
  }
  if (target === "countrywide" || target === "saradesh") {
    return {
      id: "6adf0704edbce197278ace75",
      name: "সারাদেশ",
      slug: "countrywide",
      order: 4,
      isMain: true,
      description: "সারাদেশের বিভাগ ও জেলা পর্যায়ের সংবাদ",
    };
  }

  return FALLBACK_CATEGORIES.find((c) => c.slug?.toLowerCase() === target);
}

// ----------------- Homepage Aggregated -----------------

export async function getHomepageLayout(): Promise<any | null> {
  try {
    const res = await api.get<any>("/news/home");
    if (res?.success && res.data) {
      return res.data;
    }
  } catch (err) {
    console.warn("Failed to fetch /news/home:", err);
  }
  return null;
}

// ----------------- Articles -----------------

export async function getAllArticles(limit: number = 50): Promise<Article[]> {
  try {
    const res = await api.get<any[]>(`/news?limit=${limit}`);
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map(mapBackendNewsToArticle);
    }
  } catch (err) {
    console.warn("Using fallback articles due to:", err);
  }
  return [];
}

export async function getLeadArticle(): Promise<Article> {
  try {
    const home = await getHomepageLayout();
    if (home?.leadNews) {
      return mapBackendNewsToArticle(home.leadNews);
    }
    const res = await api.get<any[]>("/news?isLead=true&limit=1");
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      return mapBackendNewsToArticle(res.data[0]);
    }
    const all = await getAllArticles();
    if (all.length > 0) return all[0];
  } catch (err) {
    console.warn("Using fallback lead article");
  }
  return undefined as any;
}

export async function getFeaturedArticles(limit: number = 8): Promise<Article[]> {
  try {
    const res = await api.get<any[]>(`/news?isFeatured=true&limit=${limit}`);
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map(mapBackendNewsToArticle);
    }
  } catch (err) {
    console.warn("Using fallback featured articles from isFeatured query");
  }
  try {
    const home = await getHomepageLayout();
    if (home?.subLeadNews && Array.isArray(home.subLeadNews) && home.subLeadNews.length > 0) {
      return home.subLeadNews.map(mapBackendNewsToArticle).slice(0, limit);
    }
  } catch {}
  const all = await getAllArticles();
  const matched = all.filter((a) => a.isFeatured);
  if (matched.length > 0) return matched.slice(0, limit);
  return all.slice(0, limit);
}

export const getArticleBySlug = cache(async (slug: string): Promise<Article | undefined> => {
  if (!slug) return undefined;
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch { }

  const slugToFetch = encodeURIComponent(decodedSlug);

  // 1. Direct call to GET /news/:slugOrId
  try {
    const res = await api.get<any>(`/news/${slugToFetch}`);
    if (res?.success && res.data && (res.data.id || res.data._id || res.data.title)) {
      const dataId = String(res.data.id || res.data._id || "");
      const dataSlug = String(res.data.slug || "");
      if (
        dataSlug === slug ||
        dataSlug === decodedSlug ||
        dataId === slug ||
        dataId === decodedSlug ||
        !res.data.slug
      ) {
        return mapBackendNewsToArticle(res.data);
      }
    }
  } catch (err) { }

  // 2. Direct call to GET /news/slug/:slug
  try {
    const slugRes = await api.get<any>(`/news/slug/${slugToFetch}`);
    if (slugRes?.success && slugRes.data && (slugRes.data.id || slugRes.data._id || slugRes.data.title)) {
      const dataId = String(slugRes.data.id || slugRes.data._id || "");
      const dataSlug = String(slugRes.data.slug || "");
      if (
        dataSlug === slug ||
        dataSlug === decodedSlug ||
        dataId === slug ||
        dataId === decodedSlug
      ) {
        return mapBackendNewsToArticle(slugRes.data);
      }
    }
  } catch (err) { }

  // 3. Fallback search in recent articles (limit 30 instead of fetching all 100!)
  try {
    const recent = await getLatestArticles(30);
    const found = recent.find(
      (a) =>
        a.slug === slug ||
        a.slug === decodedSlug ||
        a.id === slug ||
        a.id === decodedSlug ||
        a.title === decodedSlug
    );
    if (found) return found;
  } catch { }

  return undefined;
});

export interface PaginatedArticlesResult {
  articles: Article[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getPaginatedArticlesByCategory(
  categorySlug: string,
  page: number = 1,
  limit: number = 12
): Promise<PaginatedArticlesResult> {
  const safePage = Math.max(1, page || 1);
  const safeLimit = Math.max(1, limit || 12);

  const slugsToTry =
    categorySlug === "accident" || categorySlug === "durghotona" || categorySlug === "gram-gonjo"
      ? ["accident", "gram-gonjo", "6af7facc3c3082da466c7ec9", "6ae1d5cf586845309f505418"]
      : [categorySlug];

  for (const slug of slugsToTry) {
    // 1. Try GET /news?category=:slug&page=:page&limit=:limit
    try {
      const res = await api.get<any[]>(
        `/news?category=${encodeURIComponent(slug)}&page=${safePage}&limit=${safeLimit}`
      );
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        const total = Number(res.meta?.total ?? res.data.length);
        const totalPages = Number(res.meta?.totalPages ?? res.meta?.totalPage ?? Math.ceil(total / safeLimit));
        return {
          articles: res.data.map(mapBackendNewsToArticle),
          pagination: {
            page: Number(res.meta?.page ?? safePage),
            limit: safeLimit,
            total,
            totalPages: Math.max(1, totalPages),
          },
        };
      }
    } catch {}

    // 2. Try GET /categories/:slug/news?page=:page&limit=:limit
    try {
      const res = await api.get<any[]>(
        `/categories/${encodeURIComponent(slug)}/news?page=${safePage}&limit=${safeLimit}`
      );
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        const total = Number(res.meta?.total ?? res.data.length);
        const totalPages = Number(res.meta?.totalPages ?? res.meta?.totalPage ?? Math.ceil(total / safeLimit));
        return {
          articles: res.data.map(mapBackendNewsToArticle),
          pagination: {
            page: Number(res.meta?.page ?? safePage),
            limit: safeLimit,
            total,
            totalPages: Math.max(1, totalPages),
          },
        };
      }
    } catch {}

    // 3. Try GET /news/category/:slug?page=:page&limit=:limit
    try {
      const res = await api.get<any[]>(
        `/news/category/${encodeURIComponent(slug)}?page=${safePage}&limit=${safeLimit}`
      );
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        const total = Number(res.meta?.total ?? res.data.length);
        const totalPages = Number(res.meta?.totalPages ?? res.meta?.totalPage ?? Math.ceil(total / safeLimit));
        return {
          articles: res.data.map(mapBackendNewsToArticle),
          pagination: {
            page: Number(res.meta?.page ?? safePage),
            limit: safeLimit,
            total,
            totalPages: Math.max(1, totalPages),
          },
        };
      }
    } catch {}
  }

  // Fallback: match from getAllArticles
  try {
    const all = await getAllArticles();
    const isMatch = (art: Article) => {
      const s = art.category?.slug?.toLowerCase()?.trim();
      const n = art.category?.name?.toLowerCase()?.trim();
      const target = categorySlug?.toLowerCase()?.trim();
      return s === target || n === target;
    };
    const dbMatched = all.filter(isMatch);
    const total = dbMatched.length;
    const startIndex = (safePage - 1) * safeLimit;
    const sliced = dbMatched.slice(startIndex, startIndex + safeLimit);
    return {
      articles: sliced,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.max(1, Math.ceil(total / safeLimit)),
      },
    };
  } catch {}

  return {
    articles: [],
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: 0,
      totalPages: 1,
    },
  };
}

export async function getArticlesByCategory(categorySlug: string, limit = 24): Promise<Article[]> {
  const result = await getPaginatedArticlesByCategory(categorySlug, 1, limit);
  return result.articles;
}

export async function getArticlesByTag(tagSlug: string): Promise<Article[]> {
  try {
    const res = await api.get<any[]>(`/news?tags=${encodeURIComponent(tagSlug)}&limit=20`);
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map(mapBackendNewsToArticle);
    }
  } catch (err) {
    console.warn(`Failed fetching tag ${tagSlug} from API`);
  }
  return [];
}

export async function getTeamMembers(): Promise<any[]> {
  try {
    const res = await api.get<any[]>("/teams?status=active");
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
  } catch (err) {
    console.warn("Could not fetch team members from /teams:", err);
  }
  return [];
}

export function mapBackendWriterToAuthor(w: any): Author {
  const rawRole = w.designationTitle || w.designation?.name || "";
  const role = !rawRole || rawRole === "প্রতিবেদক" || rawRole.toLowerCase() === "reporter" ? "নিজস্ব প্রতিবেদক" : rawRole;
  return {
    id: String(w.id || w._id),
    name: w.name,
    slug: w.slug || (w.name ? w.name.toLowerCase().replace(/\s+/g, "-") : String(w.id)),
    role,
    bio: w.bio || "বাংলার আলো নিউজ সম্পাদকীয় দল",
    avatar: w.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    email: w.email,
    location: w.location,
  };
}

export const DEFAULT_AUTHOR: Author = {
  id: "newsroom",
  name: "Newsroom",
  slug: "newsroom",
  role: "নিজস্ব প্রতিবেদক",
  bio: "নিউজ রুম, বাংলার আলো নিউজ",
  avatar: "/images/logo.svg",
};

export async function getAuthors(): Promise<Author[]> {
  try {
    const res = await api.get<any[]>("/writers");
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map(mapBackendWriterToAuthor);
    }
  } catch (err) {
    console.warn("Could not fetch writers from API:", err);
  }
  return [DEFAULT_AUTHOR];
}

export async function getArticlesByAuthor(authorSlugOrId: string): Promise<Article[]> {
  const isMongoId = /^[0-9a-fA-F]{24}$/.test(authorSlugOrId);
  if (isMongoId) {
    try {
      const res = await api.get<any[]>(`/news?writerId=${encodeURIComponent(authorSlugOrId)}&limit=20`);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map(mapBackendNewsToArticle);
      }
    } catch { }
  }
  const all = await getAllArticles();
  return all.filter(
    (a) =>
      a.author.slug === authorSlugOrId ||
      a.author.id === authorSlugOrId ||
      ((authorSlugOrId === "newsroom" || authorSlugOrId === "abrar-chowdhury") &&
        (a.author.slug === "newsroom" || a.author.slug === "abrar-chowdhury" || a.author.name === "Newsroom" || a.author.name === "Abrar Chowdhury"))
  );
}

export async function getAuthorBySlug(slug: string): Promise<Author | undefined> {
  if (slug === "newsroom" || slug === "abrar-chowdhury") {
    return DEFAULT_AUTHOR;
  }
  const isMongoId = /^[0-9a-fA-F]{24}$/.test(slug);
  if (isMongoId) {
    try {
      const res = await api.get<any>(`/writers/${slug}`);
      if (res?.success && res.data) {
        return mapBackendWriterToAuthor(res.data);
      }
    } catch { }
  }
  const authors = await getAuthors();
  const found = authors.find((a) => a.slug === slug || a.id === slug);
  return found || DEFAULT_AUTHOR;
}

export async function getLatestArticles(limit: number = 10): Promise<Article[]> {
  try {
    const res = await api.get<any[]>(`/news/recent?limit=${limit}`);
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map(mapBackendNewsToArticle);
    }
  } catch (err) {
    console.warn("Using fallback latest articles");
  }
  const all = await getAllArticles();
  return all
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}

export async function getPopularArticles(limit: number = 8): Promise<Article[]> {
  try {
    const res = await api.get<any[]>(`/news/trending?limit=${limit}`);
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map(mapBackendNewsToArticle);
    }
  } catch (err) {
    console.warn("Using fallback popular articles");
  }
  const all = await getAllArticles();
  return all.sort((a, b) => b.viewsCount - a.viewsCount).slice(0, limit);
}

export async function getBreakingNews(): Promise<BreakingNewsItem[]> {
  try {
    const res = await api.get<any[]>("/news/breaking?limit=8");
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map((b) => ({
        id: String(b.id || b._id),
        headline: b.title,
        headlineEn: b.titleEn || b.title,
        slug: b.slug,
        categoryName: b.category?.name || "ব্রেকিং",
        categoryNameEn: b.category?.nameEn || b.category?.slug || "Breaking",
        publishedTime: formatToBengaliDate(b.publishedDate || b.createdAt),
      }));
    }
  } catch (err) {
    console.warn("Using fallback breaking news:", err);
  }

  try {
    const all = await getAllArticles();
    const breaking = all.filter((a) => a.isBreaking);
    const source = breaking.length > 0 ? breaking : all.slice(0, 6);
    return source.slice(0, 8).map((b) => ({
      id: b.id,
      headline: b.title,
      headlineEn: b.titleEn || b.title,
      slug: b.slug,
      categoryName: b.category?.name || "ব্রেকিং",
      categoryNameEn: b.category?.slug || "Breaking",
      publishedTime: b.publishedAtBengali,
    }));
  } catch {
    return [];
  }
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    const res = await api.get<any[]>("/news?limit=12");
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map((n) => {
        const img =
          typeof n.featuredImage === "string"
            ? n.featuredImage
            : n.featuredImage?.url || "/images/news-placeholder.svg";
        return {
          id: String(n.id || n._id),
          title: n.title,
          slug: n.slug || String(n.id),
          caption: n.imageCaption || n.title,
          image: img,
          thumbnail: img,
          category: n.category?.name || "ছবি",
          date: formatToBengaliDate(n.publishedDate),
          photographer: n.photoCredit || "বাংলার আলো নিউজ",
        };
      });
    }
  } catch { }
  return [];
}

export async function getGalleryItemBySlug(slug: string): Promise<GalleryItem | undefined> {
  const items = await getGalleryItems();
  return items.find((g) => g.slug === slug || g.id === slug);
}

export const FACEBOOK_PAGE_VIDEOS: VideoItem[] = [];

export async function getVideoItems(): Promise<VideoItem[]> {
  try {
    const res = await api.get<any[]>("/news/videos?limit=10");
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      // Only return real videos with genuine video links (no ABCDE or placeholders)
      const validVideos = res.data.filter(
        (v) => v.youtubeLink && !v.youtubeLink.includes("ABCDE") && v.youtubeLink.trim().length > 10
      );
      return validVideos.map((v) => ({
        id: String(v.id || v._id),
        title: v.title,
        slug: v.slug,
        videoUrl: v.youtubeLink,
        thumbnail:
          typeof v.featuredImage === "string"
            ? v.featuredImage
            : v.featuredImage?.url || "",
        duration: "ভিডিও",
        category: v.category?.name || "ভিডিও",
        views: v.viewsCount || 0,
        date: formatToBengaliDate(v.publishedDate),
        summary: v.summary || v.title,
      }));
    }
  } catch (err) {
    console.warn("No video items found or error", err);
  }
  return [];
}

export async function searchArticles(
  query: string = "",
  categorySlug: string = "",
  dateFilter: string = ""
): Promise<Article[]> {
  try {
    let endpoint = `/news/search?q=${encodeURIComponent(query)}`;
    if (categorySlug && categorySlug !== "all") {
      endpoint += `&category=${encodeURIComponent(categorySlug)}`;
    }
    const res = await api.get<any[]>(endpoint);
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map(mapBackendNewsToArticle);
    }
  } catch (err) {
    // Fallback to /news?searchTerm=
    try {
      let endpoint = `/news?searchTerm=${encodeURIComponent(query)}`;
      if (categorySlug && categorySlug !== "all") {
        endpoint += `&category=${encodeURIComponent(categorySlug)}`;
      }
      const res = await api.get<any[]>(endpoint);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map(mapBackendNewsToArticle);
      }
    } catch { }
  }

  const all = await getAllArticles();
  let filtered = [...all];
  const q = query.trim().toLowerCase();

  if (q) {
    filtered = filtered.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.category.name.toLowerCase().includes(q) ||
        a.author.name.toLowerCase().includes(q) ||
        a.tags.some((t) => t.name.toLowerCase().includes(q))
    );
  }

  if (categorySlug && categorySlug !== "all") {
    filtered = filtered.filter((a) => a.category.slug === categorySlug);
  }

  if (dateFilter) {
    const now = new Date().getTime();
    if (dateFilter === "today") {
      filtered = filtered.filter((a) => {
        const diffDays = (now - new Date(a.publishedAt).getTime()) / (1000 * 3600 * 24);
        return diffDays <= 1;
      });
    } else if (dateFilter === "week") {
      filtered = filtered.filter((a) => {
        const diffDays = (now - new Date(a.publishedAt).getTime()) / (1000 * 3600 * 24);
        return diffDays <= 7;
      });
    } else if (dateFilter === "month") {
      filtered = filtered.filter((a) => {
        const diffDays = (now - new Date(a.publishedAt).getTime()) / (1000 * 3600 * 24);
        return diffDays <= 30;
      });
    }
  }

  return filtered;
}

export async function getArchiveArticles(params: {
  year?: string;
  month?: string;
  category?: string;
  query?: string;
}): Promise<Article[]> {
  const all = await getAllArticles();
  let list = [...all];

  if (params.category && params.category !== "all") {
    list = list.filter((a) => a.category.slug === params.category);
  }

  if (params.query && params.query.trim()) {
    const q = params.query.toLowerCase().trim();
    list = list.filter((a) => a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q));
  }

  if (params.year && params.year !== "all") {
    list = list.filter((a) => a.publishedAt.startsWith(params.year!));
  }

  if (params.month && params.month !== "all") {
    const target = `-${params.month.padStart(2, "0")}-`;
    list = list.filter((a) => a.publishedAt.includes(target));
  }

  return list;
}

// ----------------- Site Settings -----------------

export async function getSiteSettings(): Promise<SiteSettings> {
  const defaultSettings: SiteSettings = {
    siteName: "বাংলার আলো নিউজ",
    siteSlogan: "সত্য ও ন্যায়ের দীপ্ত কণ্ঠস্বর",
    editorName: "মোঃ গোলাম মাওলা শাওন",
    publisherName: "মোঃ গোলাম মাওলা শাওন",
    officeAddress: "৩১/১ শরীফ কমপ্লেক্স (৬ষ্ঠ তলা), পুরানা পল্টন, ঢাকা-১০০০",
    phone: "০১৯৯৯-৯৫৩৯৭০",
    email: "banglaralonewsbd@gmail.com",
    facebookUrl: "https://www.facebook.com/BanglarAloNewsBD/",
    youtubeUrl: "https://youtube.com",
  };

  try {
    const res = await api.get<SiteSettings>("/settings");
    if (res?.success && res.data) {
      return {
        ...defaultSettings,
        ...res.data,
        editorName: res.data.editorName || "মোঃ গোলাম মাওলা শাওন",
        publisherName: res.data.publisherName || "মোঃ গোলাম মাওলা শাওন",
        officeAddress: res.data.officeAddress !== undefined ? res.data.officeAddress : defaultSettings.officeAddress,
        phone: res.data.phone || "০১৯৯৯-৯৫৩৯৭০",
        email: res.data.email || "banglaralonewsbd@gmail.com",
      };
    }
  } catch (err) {
    console.warn("Using default settings due to error:", err);
  }
  return defaultSettings;
}

// ----------------- Newsletter -----------------

export async function subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await api.post("/newsletters/subscribe", { email });
    if (res?.success) {
      return { success: true, message: res.message || "ধন্যবাদ! আপনি সফলভাবে সাবস্ক্রাইব করেছেন।" };
    }
    return { success: false, message: res?.message || "সাবস্ক্রিপশন সম্পন্ন করা যায়নি।" };
  } catch (err: any) {
    return { success: false, message: err.message || "নেটওয়ার্ক ত্রুটি।" };
  }
}

// ----------------- Social Share Tracker -----------------

export async function trackShare(newsId: string): Promise<void> {
  try {
    await api.post(`/news/${newsId}/share`);
  } catch { }
}

// ----------------- Comments -----------------

export async function fetchComments(newsId: string): Promise<Comment[]> {
  try {
    const res = await api.get<any[]>(`/comments/news/${newsId}`);
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map((c) => ({
        id: String(c.id || c._id),
        articleId: newsId,
        authorName: c.user?.fullName || c.authorName || "পাঠক",
        content: c.content,
        createdAt: formatToBengaliDate(c.createdAt),
        likes: c.likesCount || c.reactions?.likes || 0,
        replies: Array.isArray(c.replies)
          ? c.replies.map((r: any) => ({
            id: String(r.id || r._id),
            articleId: newsId,
            authorName: r.user?.fullName || r.authorName || "পাঠক",
            content: r.content,
            createdAt: formatToBengaliDate(r.createdAt),
            likes: r.likesCount || 0,
          }))
          : [],
      }));
    }
  } catch (err) {
    console.warn("Falling back to local comments for:", newsId);
  }
  return getStoredComments(newsId);
}

export function getStoredComments(articleId: string): Comment[] {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = localStorage.getItem(`comments_${articleId}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  return [];
}

export async function saveComment(
  articleId: string,
  newComment: Omit<Comment, "id" | "createdAt" | "likes">
): Promise<Comment> {
  // If user is logged in, try sending to backend
  try {
    const res = await api.post("/comments", {
      newsId: articleId,
      content: newComment.content,
    });
    if (res?.success && res.data) {
      const c = res.data;
      return {
        id: String(c.id || c._id),
        articleId,
        authorName: c.user?.fullName || newComment.authorName,
        authorEmail: newComment.authorEmail,
        content: c.content,
        createdAt: formatToBengaliDate(c.createdAt),
        likes: 0,
        replies: [],
      };
    }
  } catch (err) {
    console.warn("Backend comment submission fallback to local storage");
  }

  // Local storage fallback
  const current = getStoredComments(articleId);
  const now = new Date();
  const bengaliDate =
    now.toLocaleDateString("bn-BD", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }) +
    ", " +
    now.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" });

  const created: Comment = {
    ...newComment,
    id: `c_${Date.now()}`,
    createdAt: bengaliDate,
    likes: 0,
    replies: [],
  };

  const updated = [created, ...current];
  if (typeof window !== "undefined") {
    localStorage.setItem(`comments_${articleId}`, JSON.stringify(updated));
  }
  return created;
}

export async function saveReply(
  articleId: string,
  parentCommentId: string,
  authorName: string,
  content: string
): Promise<Comment | null> {
  try {
    const res = await api.post(`/comments/${parentCommentId}/reply`, { content });
    if (res?.success && res.data) {
      const r = res.data;
      return {
        id: String(r.id || r._id),
        articleId,
        authorName: r.user?.fullName || authorName,
        content: r.content,
        createdAt: formatToBengaliDate(r.createdAt),
        likes: 0,
      };
    }
  } catch (err) {
    console.warn("Reply fallback to local");
  }

  const current = getStoredComments(articleId);
  const now = new Date();
  const bengaliDate =
    now.toLocaleDateString("bn-BD", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }) +
    ", " +
    now.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" });

  const reply: Comment = {
    id: `reply_${Date.now()}`,
    articleId,
    authorName,
    content,
    createdAt: bengaliDate,
    likes: 0,
  };

  const traverse = (items: Comment[]): boolean => {
    for (const item of items) {
      if (item.id === parentCommentId) {
        item.replies = item.replies ? [...item.replies, reply] : [reply];
        return true;
      }
      if (item.replies && traverse(item.replies)) {
        return true;
      }
    }
    return false;
  };

  if (traverse(current)) {
    if (typeof window !== "undefined") {
      localStorage.setItem(`comments_${articleId}`, JSON.stringify(current));
    }
    return reply;
  }
  return null;
}

export async function toggleCommentLike(articleId: string, commentId: string): Promise<number> {
  try {
    await api.post(`/comments/${commentId}/react`, { type: "LIKE" });
  } catch { }

  const current = getStoredComments(articleId);
  let newLikes = 0;

  const traverse = (items: Comment[]): boolean => {
    for (const item of items) {
      if (item.id === commentId) {
        item.likes = (item.likes || 0) + 1;
        newLikes = item.likes;
        return true;
      }
      if (item.replies && traverse(item.replies)) {
        return true;
      }
    }
    return false;
  };

  if (traverse(current)) {
    if (typeof window !== "undefined") {
      localStorage.setItem(`comments_${articleId}`, JSON.stringify(current));
    }
  }
  return newLikes;
}

export function reportComment(articleId: string, commentId: string): boolean {
  const current = getStoredComments(articleId);

  const traverse = (items: Comment[]): boolean => {
    for (const item of items) {
      if (item.id === commentId) {
        item.isReported = true;
        return true;
      }
      if (item.replies && traverse(item.replies)) {
        return true;
      }
    }
    return false;
  };

  if (traverse(current)) {
    if (typeof window !== "undefined") {
      localStorage.setItem(`comments_${articleId}`, JSON.stringify(current));
    }
    return true;
  }
  return false;
}

// ----------------- Advertisements -----------------

export async function getActiveAds(placement?: string): Promise<any[]> {
  try {
    const url = placement ? `/ads?placement=${placement}` : "/ads";
    const res = await api.get<any[]>(url);
    if (res?.success && Array.isArray(res.data)) {
      return res.data;
    }
  } catch (err) {
    console.warn("Could not fetch active ads");
  }
  return [];
}

export async function trackAdImpression(adId: string): Promise<void> {
  if (!adId) return;
  try {
    await api.post(`/ads/${adId}/impression`);
  } catch { }
}

export async function trackAdClick(adId: string): Promise<string | null> {
  if (!adId) return null;
  try {
    const res = await api.post<any>(`/ads/${adId}/click`);
    if (res?.success && res.data?.targetUrl) {
      return res.data.targetUrl;
    }
  } catch { }
  return null;
}

export function broadcastNewsUpdate() {
  if (typeof window === "undefined") return;
  try {
    clearApiCache();
  } catch {}
  try {
    if ("BroadcastChannel" in window) {
      const ch = new BroadcastChannel("banglar_alo_news_channel");
      ch.postMessage({ type: "ARTICLE_PUBLISHED", timestamp: Date.now() });
      ch.close();
    }
  } catch {}
  try {
    localStorage.setItem("site_last_article_published", String(Date.now()));
  } catch {}
}

