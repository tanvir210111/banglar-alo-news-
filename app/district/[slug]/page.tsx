import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import {
  getAllArticles,
  getPopularArticles,
  getLatestArticles,
} from "@/services/newsService";
import { Article } from "@/types/news";
import { BANGLADESH_DISTRICTS_SVG } from "@/lib/bangladeshDistrictsSvgData";
import { BANGLADESH_DIVISIONS } from "@/lib/bangladeshGeoData";
import LeadNewsCard from "@/components/news/LeadNewsCard";
import MediumNewsCard from "@/components/news/MediumNewsCard";
import HorizontalNewsCard from "@/components/news/HorizontalNewsCard";
import PopularNewsItem from "@/components/news/PopularNewsItem";
import FacebookPageWidget from "@/components/common/FacebookPageWidget";
import BangladeshMapWidget from "@/components/news/BangladeshMapWidget";
import { toBengaliNumerals } from "@/lib/bangladeshTime";
import { ChevronRight, MapPin, Building, Flame, Clock, Compass } from "lucide-react";
import { api } from "@/services/apiClient";
import { mapBackendNewsToArticle } from "@/services/newsService";

interface DistrictPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ upazila?: string; page?: string }>;
}

export async function generateMetadata({ params }: DistrictPageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase();

  const dist = BANGLADESH_DISTRICTS_SVG.find(
    (d) =>
      d.id.toLowerCase() === decodedSlug ||
      d.name.toLowerCase() === decodedSlug ||
      d.nameBn === decodeURIComponent(slug)
  );

  const districtName = dist ? dist.nameBn : decodeURIComponent(slug);

  return {
    title: `${districtName} জেলার সকল সংবাদ | বাংলার আলো নিউজ`,
    description: `${districtName} জেলার সর্বশেষ খবর, সারাদেশের তাজা সংবাদ, অপরাধ, রাজনীতি, উন্নয়ন ও বিশেষ প্রতিবেদন।`,
  };
}

export const revalidate = 30;
export const dynamicParams = true;

export async function generateStaticParams() {
  return BANGLADESH_DISTRICTS_SVG.map((d) => ({
    slug: d.id,
  }));
}

export default async function DistrictNewsPage({ params, searchParams }: DistrictPageProps) {
  const { slug } = await params;
  const { upazila: rawUpazila } = (await searchParams) || {};
  const selectedUpazila = rawUpazila ? decodeURIComponent(rawUpazila) : "";
  const decodedSlug = decodeURIComponent(slug).toLowerCase();

  // Find District Info
  const dist = BANGLADESH_DISTRICTS_SVG.find(
    (d) =>
      d.id.toLowerCase() === decodedSlug ||
      d.name.toLowerCase() === decodedSlug ||
      d.nameBn === decodeURIComponent(slug)
  );

  const districtNameBn = dist ? dist.nameBn : decodeURIComponent(slug);
  const districtNameEn = dist ? dist.name : slug;
  const divisionBn = dist ? dist.divisionBn : "সারাদেশ";

  // Find upazilas for this district
  let districtUpazilas: string[] = [];
  for (const div of BANGLADESH_DIVISIONS) {
    const foundDist = div.districts.find(
      (d) =>
        d.id.toLowerCase() === (dist?.id || decodedSlug) ||
        d.name.toLowerCase() === (dist?.name.toLowerCase() || decodedSlug) ||
        d.name === districtNameBn
    );
    if (foundDist && Array.isArray(foundDist.upazilas)) {
      districtUpazilas = foundDist.upazilas;
      break;
    }
  }

  // 1. Fetch District Specific Articles from API & Local Mock
  let districtArticles: Article[] = [];

  try {
    const [byDistrictRes, bySearchRes] = await Promise.allSettled([
      api.get<any[]>(`/news?district=${encodeURIComponent(districtNameBn)}&limit=30`),
      api.get<any[]>(`/news?searchTerm=${encodeURIComponent(districtNameBn)}&limit=30`),
    ]);

    const seenIds = new Set<string>();

    if (byDistrictRes.status === "fulfilled" && byDistrictRes.value?.success && Array.isArray(byDistrictRes.value.data)) {
      for (const item of byDistrictRes.value.data) {
        const art = mapBackendNewsToArticle(item);
        if (art && !seenIds.has(art.id)) {
          seenIds.add(art.id);
          districtArticles.push(art);
        }
      }
    }

    if (bySearchRes.status === "fulfilled" && bySearchRes.value?.success && Array.isArray(bySearchRes.value.data)) {
      for (const item of bySearchRes.value.data) {
        const art = mapBackendNewsToArticle(item);
        if (art && !seenIds.has(art.id)) {
          seenIds.add(art.id);
          districtArticles.push(art);
        }
      }
    }
  } catch { }

  // 2. Fallback filter from allArticles
  const getContentText = (cnt: unknown): string => {
    if (typeof cnt === "string") return cnt;
    if (Array.isArray(cnt)) {
      return cnt.map((b) => (typeof b === "string" ? b : (b as any).text || (b as any).content || "")).join(" ");
    }
    return "";
  };

  const all = await getAllArticles();
  const fallbackFiltered = all.filter((a) => {
    const dField = (a as any).district;
    if (dField && (dField === districtNameBn || dField.toLowerCase() === districtNameEn.toLowerCase())) {
      return true;
    }
    const t = a.title?.toLowerCase() || "";
    const s = a.summary?.toLowerCase() || "";
    const c = getContentText(a.content).toLowerCase();
    const targetBn = districtNameBn.toLowerCase();
    const targetEn = districtNameEn.toLowerCase();
    return (
      t.includes(targetBn) ||
      t.includes(targetEn) ||
      s.includes(targetBn) ||
      s.includes(targetEn) ||
      c.includes(targetBn) ||
      a.tags?.some((tag) => tag.name.toLowerCase().includes(targetBn))
    );
  });

  // Merge unique
  for (const art of fallbackFiltered) {
    if (!districtArticles.some((existing) => existing.id === art.id || existing.slug === art.slug)) {
      districtArticles.push(art);
    }
  }

  // If Upazila filter is applied
  if (selectedUpazila) {
    districtArticles = districtArticles.filter((a) => {
      const uField = (a as any).upazila;
      if (uField === selectedUpazila) return true;
      const t = a.title || "";
      const s = a.summary || "";
      const c = getContentText(a.content);
      return t.includes(selectedUpazila) || s.includes(selectedUpazila) || c.includes(selectedUpazila);
    });
  }

  // Sidebar Popular & Latest Articles
  const [popularArticles, latestArticles] = await Promise.all([
    getPopularArticles(5),
    getLatestArticles(5),
  ]);

  // If few or no news for this specific district, grab nationwide latest
  const countrywideArticles = all
    .filter((a) => a.category?.slug === "countrywide" || a.category?.slug === "national")
    .slice(0, 8);

  const featured = districtArticles[0];
  const secondary = districtArticles.slice(1, 3);
  const remaining = districtArticles.slice(3);

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumb Navigation */}
      <nav aria-label="ব্রেডক্রাম্ব" className="text-xs text-[#626B75] flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-[#0B7A43] transition-colors">
          প্রচ্ছদ
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <Link href="/category/countrywide" className="hover:text-[#0B7A43] transition-colors">
          সারাদেশ
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="text-[#64748B]">{divisionBn} বিভাগ</span>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="text-[#0B7A43] font-semibold">{districtNameBn} জেলা</span>
        {selectedUpazila && (
          <>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-[#bd0202] font-semibold">{selectedUpazila} উপজেলা</span>
          </>
        )}
      </nav>

      {/* 2. District Header Banner */}
      <div className="bg-white border-b-2 border-[#0B7A43] rounded-lg p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="p-1.5 rounded-sm bg-[#bd0202] text-white">
              <MapPin className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
              {districtNameBn} জেলার সংবাদ
            </h1>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-[#0B7A43] rounded-full border border-emerald-200">
              {divisionBn} বিভাগ
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B]">
            {districtNameBn} জেলা এবং এর সকল উপজেলার তাজা খবর, রাজনীতি, অর্থনীতি, অপরাধ, জনদুর্ভোগ ও উন্নয়নের সর্বশেষ খবর।
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <div className="text-xs text-[#626B75] bg-[#F8FAFC] border border-[#CBD5E1] px-3 py-1.5 rounded-full">
            মোট প্রতিবেদন: <strong className="text-[#0B7A43]">{toBengaliNumerals(districtArticles.length)}টি</strong>
          </div>
          <Link
            href="/category/countrywide"
            className="text-xs font-semibold text-white bg-[#0B7A43] hover:bg-[#065F34] px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>সারাদেশ পাতা</span>
          </Link>
        </div>
      </div>

      {/* 3. Upazila Filter Chips (হরাইজন্টাল স্ক্রল সহ সকল উপজেলা) */}
      {districtUpazilas.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-3 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-2">
            <Building className="w-3.5 h-3.5 text-[#bd0202]" />
            <span>উপজেলা নির্বাচন করুন:</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <Link
              href={`/district/${dist?.id || slug}`}
              className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition-colors font-medium ${!selectedUpazila
                  ? "bg-[#0B7A43] text-white shadow-xs"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              সকল উপজেলা
            </Link>
            {districtUpazilas.map((upz) => {
              const isActive = selectedUpazila === upz;
              return (
                <Link
                  key={upz}
                  href={`/district/${dist?.id || slug}?upazila=${encodeURIComponent(upz)}`}
                  className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition-colors font-medium ${isActive
                      ? "bg-[#bd0202] text-white shadow-xs font-bold"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {upz}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Main Content Layout (Left: District News, Right: Sidebar with Map & Popular) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 of 12): District News Articles */}
        <div className="lg:col-span-8 space-y-6">
          {districtArticles.length > 0 ? (
            <>
              {/* Featured Top Lead News */}
              {featured && (
                <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 shadow-xs">
                  <LeadNewsCard article={featured} />
                </div>
              )}

              {/* Secondary News Cards (2 Columns) */}
              {secondary.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {secondary.map((art) => (
                    <div key={art.id} className="bg-white rounded-lg border border-[#E2E8F0] p-3 shadow-xs">
                      <MediumNewsCard article={art} />
                    </div>
                  ))}
                </div>
              )}

              {/* Remaining Articles List */}
              {remaining.length > 0 && (
                <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 shadow-xs space-y-4">
                  <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
                    {districtNameBn} জেলার আরও সংবাদ
                  </h3>
                  <div className="space-y-4">
                    {remaining.map((art) => (
                      <HorizontalNewsCard key={art.id} article={art} />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Empty State: If no specific news found for this district */
            <div className="bg-white rounded-lg border border-[#E2E8F0] p-8 shadow-xs text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <MapPin className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                {districtNameBn} {selectedUpazila ? `(${selectedUpazila} উপজেলা)` : ""} সম্পর্কিত কোনো তাজা সংবাদ পাওয়া যায়নি
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                এই অঞ্চলে নতুন কোনো সংবাদ প্রকাশিত হলে স্বয়ংক্রিয়ভাবে এখানে যুক্ত হবে। নিচে সারাদেশের সর্বশেষ সংবাদসমূহ দেওয়া হলো:
              </p>

              {/* Show nationwide news as fallback */}
              <div className="pt-4 text-left space-y-3 border-t border-gray-100">
                <h4 className="text-sm font-bold text-[#0B7A43]">সারাদেশের সর্বশেষ সংবাদ:</h4>
                <div className="space-y-3">
                  {countrywideArticles.map((art) => (
                    <HorizontalNewsCard key={art.id} article={art} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 of 12): Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          {/* 1. Miniature Interactive Map Widget */}
          <div className="bg-white rounded-lg border border-[#E2E8F0] p-3 shadow-xs">
            <h4 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-100 pb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#bd0202]" />
              <span>অন্যান্য জেলা নির্বাচন করুন</span>
            </h4>
            <BangladeshMapWidget />
          </div>

          {/* 2. Popular News Widget */}
          <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 shadow-xs">
            <h4 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2 flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#DC2626]" />
              <span>সর্বাধিক পঠিত</span>
            </h4>
            <div className="divide-y divide-gray-100">
              {popularArticles.map((article, idx) => (
                <PopularNewsItem
                  key={article.id}
                  article={article}
                  rank={idx + 1}
                />
              ))}
            </div>
          </div>

          {/* 3. Facebook Page Widget */}
          <FacebookPageWidget />
        </aside>
      </div>
    </div>
  );
}
