import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { getLatestArticles, getPopularArticles, mapBackendNewsToArticle } from "@/services/newsService";
import { api } from "@/services/apiClient";
import { Article } from "@/types/news";
import HorizontalNewsCard from "@/components/news/HorizontalNewsCard";
import PopularNewsItem from "@/components/news/PopularNewsItem";
import AdvertisementPlaceholder from "@/components/news/AdvertisementPlaceholder";
import CategoryPagination from "@/components/news/CategoryPagination";
import { Clock, ChevronRight, Flame } from "lucide-react";

export const metadata: Metadata = {
  title: "সর্বশেষ সংবাদ | বাংলার আলো নিউজ",
  description: "মুহূর্তের তাজা খবর, ব্রেকিং আপডেট ও সাম্প্রতিক ঘটনাবলী সবার আগে জানুন।",
};

export const revalidate = 30;

interface LatestPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function LatestNewsPage({ searchParams }: LatestPageProps) {
  const { page: rawPage } = (await searchParams) || {};
  const currentPage = Math.max(1, parseInt(rawPage || "1", 10) || 1);
  const limit = 12;

  let articles: Article[] = [];
  let totalItems = 0;
  let totalPages = 1;

  try {
    const res = await api.get<any[]>(`/news?page=${currentPage}&limit=${limit}`);
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      articles = res.data.map(mapBackendNewsToArticle);
      totalItems =
        typeof res.meta?.total === "number"
          ? res.meta.total
          : typeof res.meta?.totalItems === "number"
          ? res.meta.totalItems
          : articles.length;
      totalPages = Math.max(1, Math.ceil(totalItems / limit));
    }
  } catch {}

  if (articles.length === 0) {
    const all = await getLatestArticles(100);
    totalItems = all.length;
    totalPages = Math.max(1, Math.ceil(totalItems / limit));
    articles = all.slice((currentPage - 1) * limit, currentPage * limit);
  }

  const popularArticles = await getPopularArticles(5);

  return (
    <div className="space-y-6">
      <nav aria-label="ব্রেডক্রাম্ব" className="text-xs text-[#626B75] flex items-center gap-1.5">
        <Link href="/" className="hover:text-[#0B7A43] transition-colors">
          প্রচ্ছদ
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="text-[#0B7A43] font-semibold">সর্বশেষ সংবাদ</span>
      </nav>

      <div className="bg-white border-b-2 border-[#0B7A43] rounded-lg p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-6 h-6 text-[#0B7A43]" />
          <div>
            <h1 className="text-2xl font-extrabold text-[#0B7A43]">
              সর্বশেষ খবর
            </h1>
            <p className="text-xs sm:text-sm text-[#626B75]">
              ২৪ ঘণ্টা দেশ-বিদেশের ঘটে যাওয়া সব ঘটনার তাৎক্ষণিক খবর ও নির্ভরযোগ্য প্রতিবেদন।
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <div className="space-y-3">
            {articles.map((art) => (
              <HorizontalNewsCard key={art.id} article={art} />
            ))}
          </div>

          {/* Dynamic 12 Items per Page Pagination */}
          <CategoryPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            basePath="/latest"
          />
        </div>

        <aside className="lg:col-span-4 space-y-6">
          <AdvertisementPlaceholder size="sidebar" />

          <div className="bg-white rounded-lg border border-[#E2E6EB] p-4 shadow-xs">
            <h3 className="font-bold text-base text-[#D62828] border-b-2 border-[#D62828] pb-2 mb-3 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#D62828]" />
              সর্বাধিক পঠিত
            </h3>
            <div>
              {popularArticles.map((art, idx) => (
                <PopularNewsItem key={art.id} article={art} rank={idx + 1} />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
