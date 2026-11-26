"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Article } from "@/types/news";
import { ChevronRight, Clock, User, Newspaper } from "lucide-react";
import { useLanguage, CATEGORY_NAME_EN } from "@/context/LanguageContext";

const getImg = (img: any): string => {
  let url = "";
  if (typeof img === "string" && img) url = img;
  else if (img && typeof img === "object" && img.url) url = img.url;
  if (!url || url.includes("unsplash.com")) {
    return "/images/news-placeholder.svg";
  }
  return url;
};

export interface CategoryBlockProps {
  title: string;
  slug: string;
  articles: Article[];
}

export function CategoryColumn({ title, slug, articles }: CategoryBlockProps) {
  const { isBn } = useLanguage();

  const displayTitle = !isBn
    ? CATEGORY_NAME_EN[slug] ||
      (title === "আন্তর্জাতিক সংবাদ"
        ? "International News"
        : title === "রাজনীতি ও নির্বাচন"
        ? "Politics & Elections"
        : title === "সারাদেশ"
        ? "Countrywide"
        : title === "অপরাধ ও দুর্নীতি"
        ? "Crime & Corruption"
        : title === "শিক্ষা সংবাদ" || title === "শিক্ষা"
        ? "Education"
        : title === "দুর্ঘটনা"
        ? "Accidents"
        : title === "খেলাধুলা"
        ? "Sports"
        : title)
    : title;

  if (!articles || articles.length === 0) {
    return (
      <div className="flex flex-col h-full bg-white border border-[#E2E6EB] p-4 sm:p-5 shadow-xs rounded-sm">
        <div className="flex items-center justify-between border-b-2 border-[#0B7A43] pb-2 mb-3.5">
          <h3 className="text-lg font-bold text-[#0B7A43] flex items-center gap-2">
            <span className="w-2 h-4 bg-[#087A43] inline-block rounded-xs"></span>
            <span>{displayTitle}</span>
          </h3>
          <Link
            href={`/category/${slug}`}
            className="text-xs font-semibold text-[#0B7A43] hover:text-[#045A30] hover:underline flex items-center gap-0.5"
          >
            <span>{isBn ? "আরও" : "More"}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center rounded border border-dashed border-[#CBD5E1] bg-[#F8FAFC]">
          <Newspaper className="w-8 h-8 text-[#0B7A43]/40 mb-2" />
          <p className="text-sm font-semibold text-[#202124]">
            {isBn ? "এই বিভাগে এখনও কোনো সংবাদ প্রকাশিত হয়নি" : "No news published in this category yet"}
          </p>
          <p className="text-xs text-[#626B75] mt-1">
            {isBn ? "নতুন সংবাদ প্রকাশিত হলে এখানে দেখতে পাবেন।" : "Articles published from admin panel will appear here."}
          </p>
        </div>
      </div>
    );
  }

  const lead = articles[0];
  const rest = articles.slice(1, 4);

  const leadTitle = !isBn && lead.titleEn ? lead.titleEn : lead.title;
  const leadSummary = !isBn && lead.summaryEn ? lead.summaryEn : lead.summary;
  const leadCategory = !isBn
    ? CATEGORY_NAME_EN[lead.category?.slug] || lead.category?.name
    : lead.category?.name;
  const leadDate = !isBn ? (lead.publishedAtEnglish || "Today") : (lead.publishedAtBengali ? lead.publishedAtBengali.split(",")[0] : "");

  return (
    <div className="flex flex-col h-full bg-white border border-[#E2E6EB] p-4 sm:p-5 shadow-xs rounded-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-[#0B7A43] pb-2 mb-3.5">
        <h3 className="text-lg font-bold text-[#0B7A43] flex items-center gap-2">
          <span className="w-2 h-4 bg-[#087A43] inline-block rounded-xs"></span>
          <span>{displayTitle}</span>
        </h3>
        <Link
          href={`/category/${slug}`}
          className="text-xs font-semibold text-[#0B7A43] hover:text-[#045A30] hover:underline flex items-center gap-0.5"
        >
          <span>{isBn ? "আরও" : "More"}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Primary Lead Story on top */}
      {lead && (
        <article className="group mb-3 pb-3 border-b border-[#E2E6EB]">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xs bg-gray-100 mb-2.5">
            <Link href={`/news/${lead.slug}`} className="block w-full h-full">
              <Image
                src={getImg(lead.featuredImage)}
                alt={lead.featuredImage?.alt || lead.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
            {leadCategory && (
              <div className="absolute top-2.5 left-2.5">
                <Link
                  href={`/category/${lead.category?.slug || slug}`}
                  className="bg-[#0B7A43] hover:bg-[#045A30] text-white text-[11px] font-semibold px-2 py-0.5 rounded shadow transition-colors"
                >
                  {leadCategory}
                </Link>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-base sm:text-[17px] font-bold text-[#202124] group-hover:text-[#0B7A43] transition-colors leading-snug tracking-tight mb-1.5">
              <Link href={`/news/${lead.slug}`}>
                {leadTitle}
              </Link>
            </h4>

            {leadSummary && (
              <p className="text-xs text-[#626B75] line-clamp-2 mb-2 leading-relaxed">
                {leadSummary}
              </p>
            )}

            <div className="pt-2 border-t border-[#f0f2f5] flex items-center justify-between text-[11.5px] text-[#626B75]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-medium text-[#202124]">
                  <User className="w-3.5 h-3.5 text-[#087A43]" />
                  {lead.author?.name === "প্রতিবেদক" || !lead.author?.name ? "নিজস্ব প্রতিবেদক" : lead.author.name}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>{leadDate}</span>
                </span>
              </div>
            </div>
          </div>
        </article>
      )}

      {/* Sub News Below: 3 news items stacked */}
      {rest.length > 0 && (
        <div className="space-y-3 divide-y divide-[#E2E6EB] mt-auto">
          {rest.map((art) => {
            const artTitle = !isBn && art.titleEn ? art.titleEn : art.title;
            const artCat = !isBn ? (CATEGORY_NAME_EN[art.category?.slug] || art.category?.name) : art.category?.name;
            const artDate = !isBn ? (art.publishedAtEnglish || "Today") : (art.publishedAtBengali ? art.publishedAtBengali.split(",")[0] : "");

            return (
              <article key={art.id} className="group flex items-start gap-3 pt-3 first:pt-0">
                <Link
                  href={`/news/${art.slug}`}
                  className="block relative w-24 sm:w-28 shrink-0 aspect-[16/10] overflow-hidden rounded-xs bg-gray-100 border border-gray-100"
                >
                  <Image
                    src={getImg(art.featuredImage)}
                    alt={art.title}
                    fill
                    sizes="112px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {artCat && (
                    <span className="absolute bottom-1 left-1 bg-[#087A43] text-white text-[8.5px] font-bold px-1.5 py-0.5 rounded-xs leading-none">
                      {artCat}
                    </span>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/news/${art.slug}`}>
                    <h5 className="font-bold text-[13.5px] sm:text-[14px] leading-snug text-[#202124] group-hover:text-[#0B7A43] transition-colors line-clamp-2 mb-1">
                      {artTitle}
                    </h5>
                  </Link>
                  <div className="flex items-center gap-1 text-[11px] text-[#626B75]">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span>{artDate}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface DualCategorySectionProps {
  firstCategory: { title: string; slug: string; articles: Article[] };
  secondCategory: { title: string; slug: string; articles: Article[] };
}

export default function DualCategorySection({
  firstCategory,
  secondCategory,
}: DualCategorySectionProps) {
  if (!firstCategory && !secondCategory) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-6 items-stretch">
      <CategoryColumn
        title={firstCategory.title}
        slug={firstCategory.slug}
        articles={firstCategory.articles}
      />
      <CategoryColumn
        title={secondCategory.title}
        slug={secondCategory.slug}
        articles={secondCategory.articles}
      />
    </div>
  );
}
