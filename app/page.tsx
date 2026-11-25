import React from "react";
import {
  getHomepageLayout,
  getLeadArticle,
  getFeaturedArticles,
  getLatestArticles,
  getAllArticles,
  getPopularArticles,
  getArticlesByCategory,
  getGalleryItems,
  getVideoItems,
  mapBackendNewsToArticle,
} from "@/services/newsService";
import { Article } from "@/types/news";
import HomePageClient from "@/components/home/HomePageClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function stripForHome(a: Article | null | undefined): Article {
  if (!a) return a as any;
  return {
    ...a,
    content: "", // Strip out heavy body text from listing card payload to make initial load instantaneous
  };
}

function stripListForHome(list: Article[]): Article[] {
  return (list || []).map(stripForHome);
}

export default async function HomePage() {
  // Ultra-fast parallel fetch: Only core requests including all latest and economy articles
  const [
    homeData,
    featuredArticles,
    freshAllNews,
    additionalLatest,
    freshEconomyArticles,
    galleryItemsRaw,
    videoItemsRaw,
  ] = await Promise.all([
    getHomepageLayout(),
    getFeaturedArticles(10),
    getAllArticles(50),
    getLatestArticles(30),
    getArticlesByCategory("economy"),
    getGalleryItems(),
    getVideoItems(),
  ]);

  // Extract from aggregated /news/home response
  const leadArticle: Article = homeData?.leadNews
    ? mapBackendNewsToArticle(homeData.leadNews)
    : (freshAllNews[0] || additionalLatest[0]);

  const homeDataLatest =
    homeData?.latestNews && Array.isArray(homeData.latestNews) && homeData.latestNews.length > 0
      ? homeData.latestNews.map(mapBackendNewsToArticle)
      : [];
  const latestMap = new Map<string, Article>();

  // 1. Add fresh news from GET /news?limit=50
  for (const a of freshAllNews) {
    if (a && a.id) latestMap.set(a.id, a);
  }
  // 2. Add news from freshEconomyArticles
  for (const a of freshEconomyArticles) {
    if (a && a.id && !latestMap.has(a.id)) {
      latestMap.set(a.id, a);
    }
  }
  // 3. Add news from GET /news/recent
  for (const a of additionalLatest) {
    if (a && a.id && !latestMap.has(a.id)) {
      latestMap.set(a.id, a);
    }
  }
  // 4. Add news from homeData
  for (const a of homeDataLatest) {
    if (a && a.id && !latestMap.has(a.id)) {
      latestMap.set(a.id, a);
    }
  }
  // 5. Add news from homeData.economyArticles
  if (Array.isArray(homeData?.economyArticles)) {
    for (const raw of homeData.economyArticles) {
      const a = mapBackendNewsToArticle(raw);
      if (a && a.id && !latestMap.has(a.id)) {
        latestMap.set(a.id, a);
      }
    }
  }

  const latestArticles: Article[] = Array.from(latestMap.values()).sort(
    (a, b) => new Date(b.publishedAt || b.createdAt || 0).getTime() - new Date(a.publishedAt || a.createdAt || 0).getTime()
  );

  const popularArticles: Article[] =
    homeData?.mostReadNews && Array.isArray(homeData.mostReadNews) && homeData.mostReadNews.length > 0
      ? homeData.mostReadNews.map(mapBackendNewsToArticle)
      : latestArticles.slice(0, 8);

  // Filter videoItems to strictly genuine videos (no ABCDE or dummy items)
  const apiHomeVideos =
    homeData?.videoNews && Array.isArray(homeData.videoNews) && homeData.videoNews.length > 0
      ? homeData.videoNews
          .filter(
            (v: any) =>
              v.youtubeLink &&
              !v.youtubeLink.includes("ABCDE") &&
              v.youtubeLink.trim().length > 10
          )
          .map((v: any) => ({
            id: String(v.id || v._id),
            title: v.title,
            titleEn: v.titleEn || v.title,
            slug: v.slug,
            videoUrl: v.youtubeLink,
            thumbnail:
              typeof v.featuredImage === "string"
                ? v.featuredImage
                : v.featuredImage?.url || "",
            duration: "ভিডিও",
            category: v.category?.name || "ভিডিও",
            views: v.viewsCount || 0,
            date: "আজ",
            summary: v.summary || v.title,
          }))
      : [];

  const videoItems: any[] = [...apiHomeVideos];
  for (const v of videoItemsRaw) {
    if (
      v.videoUrl &&
      !v.videoUrl.includes("ABCDE") &&
      !videoItems.some((item) => item.title === v.title || item.id === v.id)
    ) {
      videoItems.push(v);
    }
  }

  // Extract category articles from /news/home categoryBlocks & dedicated arrays
  const catBlocks = homeData?.categoryBlocks || homeData?.categorySections || [];
  const getCatArticles = (slug: string): Article[] => {
    const target = slug.toLowerCase();

    // 1. Dedicated arrays from backend /news/home & fresh pre-fetches
    if (target === "economy") {
      const fromHome =
        homeData?.economyArticles && Array.isArray(homeData.economyArticles) && homeData.economyArticles.length > 0
          ? homeData.economyArticles.map(mapBackendNewsToArticle)
          : [];
      if (fromHome.length > 0) return fromHome;
      if (freshEconomyArticles && freshEconomyArticles.length > 0) return freshEconomyArticles;
    }
    if (target === "national" && homeData?.nationalArticles && Array.isArray(homeData.nationalArticles) && homeData.nationalArticles.length > 0) {
      return homeData.nationalArticles.map(mapBackendNewsToArticle);
    }
    if (target === "international" && homeData?.internationalArticles && Array.isArray(homeData.internationalArticles) && homeData.internationalArticles.length > 0) {
      return homeData.internationalArticles.map(mapBackendNewsToArticle);
    }
    if (target === "politics" && homeData?.politicsArticles && Array.isArray(homeData.politicsArticles) && homeData.politicsArticles.length > 0) {
      return homeData.politicsArticles.map(mapBackendNewsToArticle);
    }

    // 2. Check categoryBlocks in homeData
    const foundBlock = catBlocks.find((b: any) => {
      const bSlug = (b.category?.slug || b.slug || "").toLowerCase();
      const bName = (b.category?.name || b.name || "").toLowerCase();
      if (bSlug === target || bName === target) return true;
      if (target === "economy") {
        return (
          bSlug === "economy" ||
          bSlug === "business" ||
          bSlug === "banglaralo" ||
          bName.includes("অর্থনীতি") ||
          bName.includes("বাণিজ্য")
        );
      }
      if (target === "women-and-children") {
        return (
          bSlug === "women-and-children" ||
          bSlug === "nari-o-shishu" ||
          bName.includes("নারী") ||
          bName.includes("শিশু")
        );
      }
      if (target === "accident") {
        return (
          bSlug === "accident" ||
          bSlug === "gram-gonjo" ||
          bSlug === "gramgonj" ||
          bSlug === "durghotona" ||
          bName === "দুর্ঘটনা" ||
          bName === "গ্রামগঞ্জ"
        );
      }
      return false;
    });
    const rawList =
      foundBlock?.allArticles ||
      (foundBlock?.leadArticle ? [foundBlock.leadArticle, ...(foundBlock.subArticles || [])] : null) ||
      foundBlock?.news;

    if (Array.isArray(rawList) && rawList.length > 0) {
      return rawList.map(mapBackendNewsToArticle);
    }

    return latestArticles.filter((a: Article) => {
      const s = a.category?.slug?.toLowerCase();
      const n = a.category?.name?.toLowerCase();
      if (s === target || n === target) return true;
      if (target === "economy") {
        return (
          s === "economy" ||
          s === "business" ||
          s === "banglaralo" ||
          n?.includes("অর্থনীতি") ||
          n?.includes("বাণিজ্য")
        );
      }
      if (target === "women-and-children") {
        return (
          s === "women-and-children" ||
          s === "nari-o-shishu" ||
          n?.includes("নারী") ||
          n?.includes("শিশু")
        );
      }
      if (target === "accident") {
        return (
          s === "accident" ||
          n === "দুর্ঘটনা" ||
          a.title?.toLowerCase()?.includes("দুর্ঘটনা") ||
          a.tags?.some((t: any) => {
            const tagName = typeof t === "string" ? t : (t?.name || t?.slug || "");
            return tagName.toLowerCase().includes("দুর্ঘটনা") || tagName.toLowerCase().includes("accident");
          })
        );
      }
      if (target === "sports") {
        return (
          s === "sports" ||
          n?.includes("খেলা") ||
          a.title?.toLowerCase()?.includes("খেলা") ||
          a.tags?.some((t: any) => {
            const tagName = typeof t === "string" ? t : (t?.name || t?.slug || "");
            return tagName.toLowerCase().includes("sports") || tagName.includes("খেলা");
          })
        );
      }
      if (target === "entertainment") {
        return (
          s === "entertainment" ||
          n?.includes("বিনোদন") ||
          a.title?.toLowerCase()?.includes("বিনোদন") ||
          a.tags?.some((t: any) => {
            const tagName = typeof t === "string" ? t : (t?.name || t?.slug || "");
            return tagName.toLowerCase().includes("entertainment") || tagName.includes("বিনোদন");
          })
        );
      }
      if (target === "countrywide") {
        return (
          s === "countrywide" ||
          n === "সারাদেশ" ||
          n === "সারা দেশ" ||
          Boolean(a.district) ||
          a.title?.toLowerCase()?.includes("সারাদেশ")
        );
      }
      if (target === "business") {
        return (
          s === "business" ||
          s === "economy" ||
          n?.includes("ব্যবসা") ||
          n?.includes("বাণিজ্য") ||
          n?.includes("অর্থনীতি")
        );
      }
      if (target === "religion") {
        return (
          s === "religion" ||
          s === "dhormo" ||
          s === "islam" ||
          n?.includes("ধর্ম") ||
          n?.includes("ইসলাম")
        );
      }
      if (target === "literature-culture" || target === "literature" || target === "education-culture") {
        return (
          s === "literature-culture" ||
          s === "education-culture" ||
          s === "sahitto" ||
          s === "literature" ||
          n?.includes("সাহিত্য") ||
          n?.includes("সংস্কৃতি")
        );
      }
      return false;
    });
  };

  const nationalArticles = getCatArticles("national");
  const politicsArticles = getCatArticles("politics");
  const economyArticles = getCatArticles("economy");
  const businessArticles = getCatArticles("business");
  const internationalArticles = getCatArticles("international");
  const saradeshArticles = getCatArticles("countrywide");
  const crimeArticles = getCatArticles("crime-corruption");
  const educationArticles = getCatArticles("education");
  const sportsArticles = getCatArticles("sports");
  const entertainmentArticles = getCatArticles("entertainment");
  const religionArticles = getCatArticles("religion");
  const accidentArticles = getCatArticles("accident");
  const womenArticles = getCatArticles("women-and-children");
  const literatureArticles = getCatArticles("literature-culture");

  return (
    <HomePageClient
      leadArticle={stripForHome(leadArticle)}
      featuredArticles={stripListForHome(featuredArticles)}
      latestArticles={stripListForHome(latestArticles)}
      popularArticles={stripListForHome(popularArticles)}
      nationalArticles={stripListForHome(nationalArticles)}
      politicsArticles={stripListForHome(politicsArticles)}
      economyArticles={stripListForHome(economyArticles)}
      businessArticles={stripListForHome(businessArticles)}
      internationalArticles={stripListForHome(internationalArticles)}
      saradeshArticles={stripListForHome(saradeshArticles)}
      crimeArticles={stripListForHome(crimeArticles)}
      educationArticles={stripListForHome(educationArticles)}
      sportsArticles={stripListForHome(sportsArticles)}
      entertainmentArticles={stripListForHome(entertainmentArticles)}
      religionArticles={stripListForHome(religionArticles)}
      accidentArticles={stripListForHome(accidentArticles)}
      womenArticles={stripListForHome(womenArticles)}
      literatureArticles={stripListForHome(literatureArticles)}
      videoItems={videoItems}
    />
  );
}
