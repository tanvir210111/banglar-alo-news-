"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Article } from "@/types/news";
import { useLanguage, CATEGORY_NAME_EN } from "@/context/LanguageContext";
import PopularScrollSection from "@/components/news/PopularScrollSection";
import DualCategorySection from "@/components/news/DualCategorySection";
import AdvertisementPlaceholder from "@/components/news/AdvertisementPlaceholder";
import HomeFacebookVideoSection from "@/components/news/HomeFacebookVideoSection";
import FacebookPageWidget from "@/components/common/FacebookPageWidget";
import BangladeshMapWidget from "@/components/news/BangladeshMapWidget";
import RecentPopularTabWidget from "@/components/news/RecentPopularTabWidget";
import NewsletterForm from "@/components/news/NewsletterForm";
import { ChevronRight, Play, Clock, Newspaper, Sparkles, Flag, MapPin } from "lucide-react";
import { cleanNewsImageUrl, mapBackendNewsToArticle } from "@/services/newsService";
import { api } from "@/services/apiClient";

const getImg = (img: any): string => {
  let url = "";
  if (typeof img === "string" && img) url = img;
  else if (img && typeof img === "object" && img.url) url = img.url;
  if (
    !url ||
    url.includes("unsplash.com") ||
    url.includes("/null") ||
    url.includes("undefined") ||
    url.trim() === ""
  ) {
    return "/images/news-placeholder.svg";
  }
  return cleanNewsImageUrl(url);
};

interface HomePageClientProps {
  leadArticle: Article;
  featuredArticles: Article[];
  latestArticles: Article[];
  popularArticles: Article[];
  nationalArticles: Article[];
  politicsArticles: Article[];
  economyArticles?: Article[];
  businessArticles?: Article[];
  internationalArticles: Article[];
  saradeshArticles: Article[];
  crimeArticles: Article[];
  educationArticles: Article[];
  sportsArticles?: Article[];
  entertainmentArticles?: Article[];
  religionArticles?: Article[];
  accidentArticles: Article[];
  womenArticles?: Article[];
  literatureArticles?: Article[];
  videoItems: any[];
}

export default function HomePageClient({
  leadArticle,
  featuredArticles,
  latestArticles,
  popularArticles,
  nationalArticles,
  politicsArticles,
  economyArticles = [],
  businessArticles = [],
  internationalArticles,
  saradeshArticles,
  crimeArticles,
  educationArticles,
  sportsArticles = [],
  entertainmentArticles = [],
  religionArticles = [],
  accidentArticles,
  womenArticles = [],
  literatureArticles = [],
  videoItems,
}: HomePageClientProps) {
  const { isBn } = useLanguage();

  // Reactive state for real-time live article insertion without page refresh
  const [liveLatest, setLiveLatest] = useState<Article[]>(latestArticles);
  const [liveFeatured, setLiveFeatured] = useState<Article[]>(featuredArticles);

  useEffect(() => {
    setLiveLatest(latestArticles);
  }, [latestArticles]);

  useEffect(() => {
    setLiveFeatured(featuredArticles);
  }, [featuredArticles]);

  // Real-time live update: auto-add new articles without requiring full page refresh
  useEffect(() => {
    let isMounted = true;

    const syncLatestArticles = async () => {
      try {
        const [newsRes, featRes] = await Promise.allSettled([
          api.get<any[]>(`/news?limit=30&_t=${Date.now()}`, { cache: "no-store" }),
          api.get<any[]>(`/news?isFeatured=true&limit=10&_t=${Date.now()}`, { cache: "no-store" }),
        ]);
        if (!isMounted) return;

        if (newsRes.status === "fulfilled" && newsRes.value?.success && Array.isArray(newsRes.value.data)) {
          const fresh = newsRes.value.data.map(mapBackendNewsToArticle);
          setLiveLatest((prev) => {
            const seen = new Set<string>();
            const merged = [...fresh, ...prev];
            const deduped = merged.filter((a) => {
              if (!a?.id || seen.has(a.id)) return false;
              seen.add(a.id);
              return true;
            });
            return deduped.sort(
              (a, b) =>
                new Date(b.publishedAt || b.createdAt || 0).getTime() -
                new Date(a.publishedAt || a.createdAt || 0).getTime()
            ).slice(0, 40);
          });
        }

        if (featRes.status === "fulfilled" && featRes.value?.success && Array.isArray(featRes.value.data)) {
          const freshFeat = featRes.value.data.map(mapBackendNewsToArticle);
          setLiveFeatured(freshFeat);
        }
      } catch {}
    };

    // Run initial sync shortly after hydration
    syncLatestArticles();

    // 1. Cross-tab Broadcast Channel listener (instant 0ms update when article published from admin)
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        channel = new BroadcastChannel("banglar_alo_news_channel");
        channel.onmessage = (event) => {
          if (event.data?.type === "ARTICLE_PUBLISHED") {
            syncLatestArticles();
          }
        };
      }
    } catch {}

    // 2. Storage event listener (fallback across browser tabs)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "site_last_article_published") {
        syncLatestArticles();
      }
    };
    window.addEventListener("storage", handleStorage);

    // 3. Tab visibility listener (when user switches back to website tab, refresh seamlessly)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        syncLatestArticles();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // 4. Background lightweight heartbeat poll every 10 seconds
    const interval = setInterval(syncLatestArticles, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (channel) channel.close();
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // Economy section articles (1 Big Lead on Left + 3 Horizontal Cards on Right)
  const isEconomyArticle = (a: Article) => {
    if (!a) return false;
    const s = a.category?.slug?.toLowerCase();
    const n = a.category?.name?.toLowerCase();
    const id = a.category?.id;
    return (
      s === "economy" ||
      s === "business" ||
      s === "banglaralo" ||
      n?.includes("অর্থনীতি") ||
      n?.includes("বাণিজ্য") ||
      id === "6adf06fbedbce197278ace71"
    );
  };

  const resolvedEconomyArticles =
    economyArticles.length > 0
      ? economyArticles
      : liveLatest.filter(isEconomyArticle);

  const economyLeadArticle = resolvedEconomyArticles[0] || null;
  const economySideArticles = resolvedEconomyArticles
    .slice(1, 4)
    .filter(
      (art) =>
        art &&
        art.id !== economyLeadArticle?.id &&
        art.slug !== economyLeadArticle?.slug &&
        art.title !== economyLeadArticle?.title
    );

  // Sports & Entertainment resolvers
  const isSportsArticle = (a: Article) => {
    if (!a) return false;
    const s = a.category?.slug?.toLowerCase();
    const n = a.category?.name?.toLowerCase();
    return s === "sports" || n?.includes("খেলা");
  };
  const isEntertainmentArticle = (a: Article) => {
    if (!a) return false;
    const s = a.category?.slug?.toLowerCase();
    const n = a.category?.name?.toLowerCase();
    return s === "entertainment" || n?.includes("বিনোদন");
  };

  const resolvedSportsArticles =
    sportsArticles.length > 0
      ? sportsArticles
      : liveLatest.filter(isSportsArticle);

  const resolvedEntertainmentArticles =
    entertainmentArticles.length > 0
      ? entertainmentArticles
      : liveLatest.filter(isEntertainmentArticle);

  const isBusinessArticle = (a: Article) => {
    if (!a) return false;
    const s = a.category?.slug?.toLowerCase();
    const n = a.category?.name?.toLowerCase();
    return (
      s === "business" ||
      s === "economy" ||
      n?.includes("ব্যবসা") ||
      n?.includes("বাণিজ্য") ||
      n?.includes("অর্থনীতি")
    );
  };

  const resolvedBusinessArticles =
    businessArticles && businessArticles.length > 0
      ? businessArticles
      : resolvedEconomyArticles;

  const isReligionArticle = (a: Article) => {
    if (!a) return false;
    const s = a.category?.slug?.toLowerCase();
    const n = a.category?.name?.toLowerCase();
    return (
      s === "religion" ||
      s === "dhormo" ||
      s === "islam" ||
      n?.includes("ধর্ম") ||
      n?.includes("ইসলাম")
    );
  };

  const resolvedReligionArticles =
    religionArticles && religionArticles.length > 0
      ? religionArticles
      : liveLatest.filter(isReligionArticle);

  // Women & Children resolvers
  const isWomenArticle = (a: Article) => {
    if (!a) return false;
    const s = a.category?.slug?.toLowerCase();
    const n = a.category?.name?.toLowerCase();
    return s === "women-and-children" || s === "nari-o-shishu" || n?.includes("নারী") || n?.includes("শিশু");
  };
  const resolvedWomenArticles =
    womenArticles && womenArticles.length > 0
      ? womenArticles
      : liveLatest.filter(isWomenArticle).length > 0
      ? liveLatest.filter(isWomenArticle)
      : liveLatest.slice(0, 5);

  // Literature & Culture resolvers
  const isLiteratureArticle = (a: Article) => {
    if (!a) return false;
    const s = a.category?.slug?.toLowerCase();
    const n = a.category?.name?.toLowerCase();
    return (
      s === "literature-culture" ||
      s === "education-culture" ||
      s === "sahitto" ||
      n?.includes("সাহিত্য") ||
      n?.includes("সংস্কৃতি")
    );
  };
  const resolvedLiteratureArticles =
    literatureArticles && literatureArticles.length > 0
      ? literatureArticles
      : liveLatest.filter(isLiteratureArticle).length > 0
      ? liveLatest.filter(isLiteratureArticle)
      : liveLatest.slice(1, 6);

  // Popular articles for marquee
  const popularList = popularArticles.length > 0 ? popularArticles : liveLatest.slice(0, 8);

  // National & Politics resolvers
  const isNationalArticle = (a: Article) => {
    if (!a) return false;
    const s = a.category?.slug?.toLowerCase();
    const n = a.category?.name?.toLowerCase();
    return s === "national" || n?.includes("জাতীয়");
  };
  const isSaradeshArticle = (a: Article) => {
    if (!a) return false;
    const s = a.category?.slug?.toLowerCase();
    const n = a.category?.name?.toLowerCase();
    return s === "countrywide" || s === "saradesh" || n?.includes("সারাদেশ");
  };
  const isPoliticsArticle = (a: Article) => {
    if (!a) return false;
    const s = a.category?.slug?.toLowerCase();
    const n = a.category?.name?.toLowerCase();
    return s === "politics" || n?.includes("রাজনীতি");
  };

  const resolvedSaradeshArticles = React.useMemo(() => {
    const seen = new Set<string>();
    const list: Article[] = [];

    // 1. Gather all actual saradesh articles
    if (saradeshArticles && saradeshArticles.length > 0) {
      for (const a of saradeshArticles) {
        if (a && a.id && !seen.has(a.id)) {
          seen.add(a.id);
          list.push(a);
        }
      }
    }

    // 2. Add from liveLatest if they are saradesh
    for (const a of liveLatest) {
      if (a && a.id && !seen.has(a.id) && isSaradeshArticle(a)) {
        seen.add(a.id);
        list.push(a);
      }
    }

    // 3. If still less than 6, backfill from latest news (latest gula)
    if (list.length < 6) {
      for (const a of liveLatest) {
        if (a && a.id && !seen.has(a.id)) {
          seen.add(a.id);
          list.push(a);
          if (list.length >= 6) break;
        }
      }
    }

    // Sort strictly by latest published date and take top 6
    return list
      .sort((a, b) => new Date(b.publishedAt || b.createdAt || 0).getTime() - new Date(a.publishedAt || a.createdAt || 0).getTime())
      .slice(0, 6);
  }, [saradeshArticles, liveLatest]);

  const resolvedNationalArticles =
    nationalArticles.length > 0
      ? nationalArticles
      : liveLatest.filter(isNationalArticle).length > 0
      ? liveLatest.filter(isNationalArticle)
      : liveLatest.slice(0, 5);

  const resolvedPoliticsArticles =
    politicsArticles.length > 0
      ? politicsArticles
      : liveLatest.filter(isPoliticsArticle).length > 0
      ? liveLatest.filter(isPoliticsArticle)
      : liveLatest.slice(2, 7);

  // Helper to detect if an article is marked for "Banglar Alo Special"
  const isSpecial = (a: Article) => {
    if (!a) return false;
    if (a.isFeatured) return true;
    if (
      Array.isArray(a.tags) &&
      a.tags.some((t: any) => {
        const tagStr = typeof t === "string" ? t : t?.name || t?.slug || "";
        return tagStr.includes("স্পেশাল") || tagStr.toLowerCase().includes("special");
      })
    ) {
      return true;
    }
    return false;
  };

  // 1. Compute Special articles FIRST so they NEVER get dropped or overridden!
  const specialArticles = (() => {
    const seenIds = new Set<string>();
    const seenSlugs = new Set<string>();
    const result: Article[] = [];

    const addSpecial = (a: Article) => {
      if (!a || !a.id || seenIds.has(a.id) || (a.slug && seenSlugs.has(a.slug))) {
        return false;
      }
      seenIds.add(a.id);
      if (a.slug) seenSlugs.add(a.slug);
      result.push(a);
      return result.length >= 6;
    };

    // Priority 1: Articles explicitly marked as Featured / Special in liveFeatured
    for (const a of liveFeatured) {
      if (isSpecial(a) && addSpecial(a)) return result;
    }

    // Priority 2: Articles marked as Special in liveLatest
    for (const a of liveLatest) {
      if (isSpecial(a) && addSpecial(a)) return result;
    }

    // Priority 3: Remaining liveFeatured articles
    for (const a of liveFeatured) {
      if (addSpecial(a)) return result;
    }

    // Priority 4: Popular articles
    for (const a of popularArticles) {
      if (addSpecial(a)) return result;
    }

    // Priority 5: Latest articles pool
    for (const a of liveLatest) {
      if (addSpecial(a)) return result;
    }

    return result.slice(0, 6);
  })();

  // 2. Latest News mapping for left column (shows full latest stream without skipping any article)
  const leftLatestArticles = (() => {
    const seenIds = new Set<string>();
    const seenSlugs = new Set<string>();
    const list: Article[] = [];

    // Strictly prioritize genuine latest articles in real-time chronological order
    for (const a of liveLatest) {
      if (a && a.id && !seenIds.has(a.id) && (!a.slug || !seenSlugs.has(a.slug))) {
        seenIds.add(a.id);
        if (a.slug) seenSlugs.add(a.slug);
        list.push(a);
        if (list.length >= 12) break;
      }
    }

    if (list.length < 12) {
      const candidates = [
        ...liveLatest,
        ...popularArticles,
        leadArticle,
        ...economyArticles,
        ...nationalArticles,
        ...internationalArticles,
        ...politicsArticles,
        ...saradeshArticles,
        ...crimeArticles,
        ...educationArticles,
        ...accidentArticles,
        ...womenArticles,
      ].filter((a): a is Article => Boolean(a && a.id && !seenIds.has(a.id)));

      for (const a of candidates) {
        if (!seenIds.has(a.id)) {
          seenIds.add(a.id);
          list.push(a);
          if (list.length >= 12) break;
        }
      }
    }
    return list;
  })();

  const getArtTitle = (art: Article) => (!isBn && art.titleEn ? art.titleEn : art.title);
  const getArtDate = (art: Article) => (!isBn ? (art.publishedAtEnglish || "Today") : art.publishedAtBengali);

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Main Latest News Section (সর্বশেষ) */}
      <section className="bg-white rounded-lg border border-[#E2E6EB] shadow-xs p-4 sm:p-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch">
          {/* Left Part: Header + 9 cards in 3-column grid */}
          <div className="lg:col-span-8 lg:border-r lg:border-[#E2E6EB] lg:pr-4 xl:pr-5">
            {/* Header: শুধুমাত্র সর্বশেষ খবরের কলামের উপরে 'সব খবর' */}
            <div className="border-b-2 border-[#DC2626] pb-2 flex items-center justify-between mb-4">
              <span className="text-base sm:text-lg font-bold text-[#DC2626] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#DC2626]" />
                <span>{isBn ? "সর্বশেষ" : "Latest"}</span>
              </span>
              <Link
                href="/latest"
                className="text-xs text-[#626B75] hover:text-[#DC2626] font-medium flex items-center gap-1 transition-colors"
              >
                <span>{isBn ? "সব খবর" : "All News"}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {leftLatestArticles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 lg:gap-6">
                {leftLatestArticles.map((art) => (
                  <article key={art.id} className="group flex flex-col justify-between h-full">
                    <div>
                      <Link
                        href={`/news/${art.slug}`}
                        className="block relative aspect-[16/10] w-full overflow-hidden rounded-xs bg-gray-100 mb-2.5"
                      >
                        <Image
                          src={getImg(art.featuredImage)}
                          alt={getArtTitle(art)}
                          fill
                          unoptimized={!getImg(art.featuredImage).startsWith("/")}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
                      <Link href={`/news/${art.slug}`}>
                        <h3 className="font-bold text-[18px] sm:text-[19px] lg:text-[20px] leading-[1.35] text-[#202124] group-hover:text-[#0B7A43] transition-colors line-clamp-3 mb-2">
                          {getArtTitle(art)}
                        </h3>
                      </Link>
                    </div>
                    <div className="flex items-center gap-1.5 text-[12.5px] text-[#626B75] mt-auto pt-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{getArtDate(art)}</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="py-14 text-center text-[#626B75] text-sm flex flex-col items-center justify-center">
                <Newspaper className="w-9 h-9 mb-2 text-[#DC2626] opacity-50" />
                <p className="font-medium text-base text-[#202124] mb-1">
                  {isBn ? "কোনো সংবাদ পাওয়া যায়নি" : "No news found"}
                </p>
                <p className="text-xs text-gray-500">
                  {isBn
                    ? "অ্যাডমিন প্যানেল থেকে সংবাদ পোস্ট করলে এখানে প্রদর্শিত হবে।"
                    : "Articles published from admin panel will appear here."}
                </p>
              </div>
            )}
          </div>

          {/* Right Part: Sidebar Facebook Page + Bangladesh Map Widget */}
          <div className="lg:col-span-4 flex flex-col gap-3.5">
            {/* 1. Official Facebook Page Box (Sidebar) */}
            <div className="w-full">
              <FacebookPageWidget />
            </div>

            {/* 2. Bangladesh Map Widget with Division, District, Upazila Borders & Selectors */}
            <div className="w-full">
              <BangladeshMapWidget />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Most Read Section (সর্বাধিক পঠিত) */}
      <PopularScrollSection articles={popularList} />

      {/* 4. Menubar Serial 2: সারাদেশ (Countrywide) - লেআউট + Right side: সর্বশেষ সংবাদ ও আলোচিত সংবাদ */}
      <section className="bg-white rounded-lg border border-[#E2E6EB] shadow-xs p-4 sm:p-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch">
          {/* Left Part: Header + 6 cards in 3-column grid */}
          <div className="lg:col-span-8 lg:border-r lg:border-[#E2E6EB] lg:pr-4 xl:pr-5">
            {/* Header: শুধুমাত্র সারাদেশ খবরের কলামের উপরে 'সব খবর' */}
            <div className="border-b-2 border-[#0B7A43] pb-2 flex items-center justify-between mb-4">
              <span className="text-base sm:text-lg font-bold text-[#0B7A43] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#0B7A43]" />
                <span>{isBn ? "সারাদেশ" : "Countrywide"}</span>
              </span>
              <Link
                href="/category/countrywide"
                className="text-xs text-[#626B75] hover:text-[#0B7A43] font-medium flex items-center gap-1 transition-colors"
              >
                <span>{isBn ? "সব খবর" : "All News"}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {resolvedSaradeshArticles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 lg:gap-6">
                {resolvedSaradeshArticles.slice(0, 6).map((art) => (
                  <article key={art.id} className="group flex flex-col justify-between h-full">
                    <div>
                      <Link
                        href={`/news/${art.slug}`}
                        className="block relative aspect-[16/10] w-full overflow-hidden rounded-xs bg-gray-100 mb-2.5"
                      >
                        <Image
                          src={getImg(art.featuredImage)}
                          alt={getArtTitle(art)}
                          fill
                          unoptimized={!getImg(art.featuredImage).startsWith("/")}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
                      <Link href={`/news/${art.slug}`}>
                        <h3 className="font-bold text-[18px] sm:text-[19px] lg:text-[20px] leading-[1.35] text-[#202124] group-hover:text-[#0B7A43] transition-colors line-clamp-3 mb-2">
                          {getArtTitle(art)}
                        </h3>
                      </Link>
                    </div>
                    <div className="flex items-center gap-1.5 text-[12.5px] text-[#626B75] mt-auto pt-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{getArtDate(art)}</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="py-14 text-center text-[#626B75] text-sm flex flex-col items-center justify-center">
                <Newspaper className="w-9 h-9 mb-2 text-[#0B7A43] opacity-50" />
                <p className="font-medium text-base text-[#202124] mb-1">
                  {isBn ? "সারাদেশ বিভাগে কোনো সংবাদ পাওয়া যায়নি" : "No countrywide news found"}
                </p>
              </div>
            )}
          </div>

          {/* Right Part: বাংলার আলো স্পেশাল ও আলোচিত সংবাদ ট্যাব উইজেট */}
          <div className="lg:col-span-4">
            <RecentPopularTabWidget
              specialArticles={specialArticles}
              popularArticles={popularList}
            />
          </div>
        </div>
      </section>

      {/* 5. Menubar Serial 3 & 4: জাতীয় (National) & রাজনীতি (Politics) */}
      <section>
        <DualCategorySection
          firstCategory={{
            title: isBn ? "জাতীয়" : "National",
            slug: "national",
            articles: resolvedNationalArticles.slice(0, 5),
          }}
          secondCategory={{
            title: isBn ? "রাজনীতি" : "Politics",
            slug: "politics",
            articles: resolvedPoliticsArticles.slice(0, 5),
          }}
        />
      </section>

      {/* 6. Menubar Serial 5 & 6: আন্তর্জাতিক (International) & ব্যবসা ও বাণিজ্য (Business & Commerce) */}
      <section>
        <DualCategorySection
          firstCategory={{
            title: isBn ? "আন্তর্জাতিক" : "International",
            slug: "international",
            articles: internationalArticles.slice(0, 5),
          }}
          secondCategory={{
            title: isBn ? "ব্যবসা ও বাণিজ্য" : "Business & Commerce",
            slug: "business",
            articles: resolvedBusinessArticles.slice(0, 5),
          }}
        />
      </section>

      {/* 7. Menubar Serial 7 & 8: অপরাধ ও দুর্নীতি (Crime & Corruption) & শিক্ষা (Education) */}
      <section>
        <DualCategorySection
          firstCategory={{
            title: isBn ? "অপরাধ ও দুর্নীতি" : "Crime & Corruption",
            slug: "crime-corruption",
            articles: crimeArticles.slice(0, 5),
          }}
          secondCategory={{
            title: isBn ? "শিক্ষা" : "Education",
            slug: "education",
            articles: educationArticles.slice(0, 5),
          }}
        />
      </section>

      {/* 8. ভিডিও সেকশন */}
      <section className="bg-[#1a2332] text-white p-6 rounded-xs shadow-md">
        {/* Video Header */}
        <div className="flex items-center justify-between border-b border-gray-700 pb-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-sm bg-[#D62828] text-white">
              <Play className="w-5 h-5 text-white fill-current" />
            </div>
            <h2
              className="text-xl font-bold tracking-tight text-white !text-white"
              style={{ color: "#ffffff" }}
            >
              {isBn ? "ভিডিও" : "Videos"}
            </h2>
          </div>
          <a
            href="https://www.facebook.com/BanglarAloNewsBD/videos"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-400 hover:text-white flex items-center gap-1 text-xs font-semibold"
          >
            <span>{isBn ? "সব ভিডিও" : "All Videos"}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Video Content Grid */}
        <div className="w-full">
          <HomeFacebookVideoSection videos={videoItems} />
        </div>
      </section>

      {/* 9. Menubar Serial 9 & 10: খেলাধুলা (Sports) & বিনোদন (Entertainment) */}
      <section>
        <DualCategorySection
          firstCategory={{
            title: isBn ? "খেলাধুলা" : "Sports",
            slug: "sports",
            articles: resolvedSportsArticles.slice(0, 5),
          }}
          secondCategory={{
            title: isBn ? "বিনোদন" : "Entertainment",
            slug: "entertainment",
            articles: resolvedEntertainmentArticles.slice(0, 5),
          }}
        />
      </section>

      {/* 10. Menubar Serial 11: ধর্ম (Religion) & দুর্ঘটনা (Accident) */}
      <section>
        <DualCategorySection
          firstCategory={{
            title: isBn ? "ধর্ম" : "Religion",
            slug: "religion",
            articles: resolvedReligionArticles.slice(0, 5),
          }}
          secondCategory={{
            title: isBn ? "দুর্ঘটনা" : "Accident",
            slug: "accident",
            articles: accidentArticles.slice(0, 5),
          }}
        />
      </section>

      {/* 11. সবার নিচে: নারী ও শিশু (Women & Children) & সাহিত্য ও সংস্কৃতি (Literature & Culture) */}
      <section>
        <DualCategorySection
          firstCategory={{
            title: isBn ? "নারী ও শিশু" : "Women & Children",
            slug: "women-and-children",
            articles: resolvedWomenArticles.slice(0, 5),
          }}
          secondCategory={{
            title: isBn ? "সাহিত্য ও সংস্কৃতি" : "Literature & Culture",
            slug: "literature-culture",
            articles: resolvedLiteratureArticles.slice(0, 5),
          }}
        />
      </section>

      {/* Newsletter Form */}
      <div className="pt-4">
        <NewsletterForm />
      </div>
    </div>
  );
}

