"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Article, Category } from "@/types/news";
import { ChevronRight, Clock } from "lucide-react";
import { useLanguage, CATEGORY_NAME_EN } from "@/context/LanguageContext";
import { cleanNewsImageUrl } from "@/services/newsService";

const getImg = (img: any): string => {
  let url = "";
  if (typeof img === "string" && img) url = img;
  else if (img && typeof img === "object" && img.url) url = img.url;
  if (!url || url.includes("unsplash.com")) {
    return "/images/news-placeholder.svg";
  }
  return cleanNewsImageUrl(url);
};

interface CategorySectionProps {
  category: Category;
  articles: Article[];
  accentColor?: string;
}

export default function CategoryNewsSection({
  category,
  articles,
  accentColor = "#0B7A43",
}: CategorySectionProps) {
  const { isBn } = useLanguage();

  const displayCategoryName = !isBn
    ? CATEGORY_NAME_EN[category.slug] || category.name
    : category.name;

  if (!articles || articles.length === 0) {
    return (
      <div className="bg-white border border-[#E2E6EB] p-4 sm:p-5 shadow-xs rounded-sm flex flex-col justify-between h-full">
        <div>
          <div
            className="flex items-center justify-between border-b-2 pb-1.5 mb-3"
            style={{ borderColor: accentColor }}
          >
            <h3
              className="text-base sm:text-lg font-bold flex items-center gap-2"
              style={{ color: accentColor }}
            >
              <span className="w-2 h-4 bg-[#087A43] inline-block rounded-xs" />
              <span>{displayCategoryName}</span>
            </h3>
            <Link
              href={`/category/${category.slug}`}
              className="text-xs font-semibold text-[#626B75] hover:text-[#0B7A43] flex items-center gap-0.5 group transition-colors"
            >
              <span>{isBn ? "আরও খবর" : "More"}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="flex flex-col items-center justify-center py-8 text-center text-[#626B75]">
            <p className="text-xs font-medium text-[#202124]">
              {isBn ? "এই বিভাগে এখনও কোনো সংবাদ প্রকাশিত হয়নি" : "No news published in this category yet"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const lead = articles[0];
  const subArticles = articles.slice(1, 3);

  const leadTitle = !isBn && lead.titleEn ? lead.titleEn : lead.title;
  const leadSummary = !isBn && lead.summaryEn ? lead.summaryEn : lead.summary;
  const leadDate = !isBn ? (lead.publishedAtEnglish || "Today") : lead.publishedAtBengali;

  return (
    <div className="bg-white border border-[#E2E6EB] p-4 sm:p-5 shadow-xs rounded-sm flex flex-col justify-between h-full">
      <div>
        {/* Category Header */}
        <div
          className="flex items-center justify-between border-b-2 pb-1.5 mb-3"
          style={{ borderColor: accentColor }}
        >
          <h3
            className="text-base sm:text-lg font-bold flex items-center gap-2"
            style={{ color: accentColor }}
          >
            <span className="w-2 h-4 bg-[#087A43] inline-block rounded-xs" />
            <span>{displayCategoryName}</span>
          </h3>
          <Link
            href={`/category/${category.slug}`}
            className="text-xs font-semibold text-[#626B75] hover:text-[#0B7A43] flex items-center gap-0.5 group transition-colors"
          >
            <span>{isBn ? "আরও খবর" : "More"}</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Lead Article with big image */}
        {lead && (
          <article className="group mb-2.5">
            <Link
              href={`/news/${lead.slug}`}
              className="block relative aspect-[16/10] overflow-hidden mb-2 rounded-xs bg-gray-100"
            >
              <Image
                src={getImg(lead.featuredImage)}
                alt={lead.featuredImage?.alt || lead.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <h4 className="font-bold text-sm sm:text-base text-[#202124] group-hover:text-[#0B7A43] transition-colors line-clamp-2 leading-snug mb-1">
              <Link href={`/news/${lead.slug}`}>
                {leadTitle}
              </Link>
            </h4>
            <p className="text-xs text-[#626B75] line-clamp-2 leading-relaxed mb-2">
              {leadSummary}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-[#626B75]">
              <Clock className="w-3 h-3 text-gray-400" />
              <span>{leadDate}</span>
            </div>
          </article>
        )}
      </div>

      {/* Sub Articles List */}
      {subArticles.length > 0 && (
        <div className="divide-y divide-[#E2E6EB] border-t border-[#E2E6EB] mt-2 pt-1">
          {subArticles.map((art) => {
            const artTitle = !isBn && art.titleEn ? art.titleEn : art.title;
            const artDate = !isBn ? (art.publishedAtEnglish || "Today") : art.publishedAtBengali.split(",")[0];

            return (
              <article key={art.id} className="py-2.5 first:pt-2 last:pb-0">
                <Link
                  href={`/news/${art.slug}`}
                  className="font-semibold text-xs sm:text-[13px] text-[#202124] hover:text-[#0B7A43] transition-colors line-clamp-2 leading-snug block mb-1"
                >
                  {artTitle}
                </Link>
                <div className="flex items-center gap-1 text-[10.5px] text-[#626B75]">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span>{artDate}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
