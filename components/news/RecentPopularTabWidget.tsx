"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Flame, Sparkles } from "lucide-react";
import { Article } from "@/types/news";
import { useLanguage } from "@/context/LanguageContext";
import { cleanNewsImageUrl } from "@/services/newsService";

interface RecentPopularTabWidgetProps {
  specialArticles?: Article[];
  popularArticles?: Article[];
}

const BN_NUMBERS = ["১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯", "১০"];

export default function RecentPopularTabWidget({
  specialArticles = [],
  popularArticles = [],
}: RecentPopularTabWidgetProps) {
  const { isBn } = useLanguage();
  const [activeTab, setActiveTab] = useState<"special" | "popular">("special");

  const getImg = (img: any): string => {
    if (!img) return "/images/placeholder.svg";
    let url = "";
    if (typeof img === "string") url = img.trim();
    else if (img.url) url = img.url.trim();
    if (!url || url.includes("unsplash.com")) return "/images/placeholder.svg";
    return cleanNewsImageUrl(url);
  };

  const getArtTitle = (art: Article) => (isBn ? art.title : art.titleEn || art.title);
  const getArtDate = (art: Article) => (isBn ? art.date : art.dateEn || art.date);

  const displayArticles = (
    activeTab === "special" ? specialArticles : popularArticles
  ).slice(0, 7);

  return (
    <div className="bg-white rounded-lg border border-[#E2E6EB] shadow-xs p-3.5 sm:p-4">
      {/* Tab Headers - বাংলার আলো স্পেশাল ও আলোচিত সংবাদ */}
      <div className="flex items-center border-b-2 border-[#0B7A43] mb-3">
        <button
          type="button"
          onClick={() => setActiveTab("special")}
          className={`flex-1 py-2 px-3 text-center text-sm sm:text-[15px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === "special"
            ? "bg-[#0B7A43] text-white shadow-xs"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>{isBn ? "বাংলার আলো স্পেশাল" : "Banglar Alo Special"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("popular")}
          className={`flex-1 py-2 px-3 text-center text-sm sm:text-[15px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === "popular"
            ? "bg-[#bd0202] text-white shadow-xs"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
        >
          <Flame className="w-4 h-4 text-orange-200" />
          <span>{isBn ? "আলোচিত সংবাদ" : "Featured News"}</span>
        </button>
      </div>

      {/* Tab Content List - হুবহু রিপোজিটরির tab-item + conut + tab-image + tab_hadding */}
      <div className="divide-y divide-gray-100">
        {displayArticles.map((art, idx) => (
          <article key={art.id || idx} className="py-2.5 first:pt-1 last:pb-1">
            <Link
              href={`/news/${art.slug}`}
              className="group relative flex items-start gap-2.5 transition-colors"
            >
              {/* Circular Numbering Badge (.conut) */}
              <div
                className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs mt-0.5 ${idx === 0
                  ? "bg-[#bd0202]"
                  : idx === 1
                    ? "bg-[#0B7A43]"
                    : "bg-gray-700"
                  }`}
              >
                {isBn ? BN_NUMBERS[idx] || idx + 1 : idx + 1}
              </div>

              {/* News Thumbnail (.tab-image) */}
              <div className="relative w-20 sm:w-22 aspect-[16/10] shrink-0 rounded overflow-hidden bg-gray-100 border border-gray-100">
                <Image
                  src={getImg(art.featuredImage)}
                  alt={getArtTitle(art)}
                  fill
                  unoptimized={!getImg(art.featuredImage).startsWith("/")}
                  sizes="88px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Headline (.tab_hadding) */}
              <div className="flex-1 min-w-0">
                <h4 className="text-[14px] sm:text-[15px] font-bold text-[#1f2937] group-hover:text-[#bd0202] line-clamp-2 leading-[1.35] transition-colors mb-1">
                  {getArtTitle(art)}
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-[#6b7280]">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span>{getArtDate(art)}</span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
