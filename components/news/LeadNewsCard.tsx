"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Article } from "@/types/news";
import { Clock, User, Flame } from "lucide-react";
import ShareButtons from "./ShareButtons";

interface LeadCardProps {
  article: Article;
  priority?: boolean;
}

const DEFAULT_FALLBACK_IMAGE = "/images/news-placeholder.svg";

export default function LeadNewsCard({ article, priority = true }: LeadCardProps) {
  if (!article) return null;

  // 1. Safe image URL extraction
  const rawImg =
    typeof article.featuredImage === "string"
      ? article.featuredImage
      : article.featuredImage?.url;
  
  const [imgSrc, setImgSrc] = useState<string>(
    rawImg && rawImg.trim() !== "" && !rawImg.includes("unsplash.com") ? rawImg : DEFAULT_FALLBACK_IMAGE
  );

  // 2. Safe Category resolution
  const categoryName = article.category?.name || "জাতীয়";
  const categorySlug = article.category?.slug || "national";

  // 3. Safe Author resolution
  const authorName = article.author?.name || "স্টাফ রিপোর্টার";

  // 4. Safe Date resolution
  const publishedDate = article.publishedAtBengali || "আজ";

  // 5. Clean summary text without HTML tags
  const cleanSummary = article.summary
    ? article.summary.replace(/<[^>]*>/g, "").trim()
    : "";

  // 6. Safe Slug resolution
  const articleSlug = article.slug || String(article.id || "news");
  const articleUrl = `/news/${articleSlug}`;

  return (
    <article className="bg-white rounded-xl border border-[#E2E6EB] shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full group">
      {/* Featured Image Container with strict relative positioning */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
        <Link
          href={articleUrl}
          className="relative block w-full h-full group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7A43]"
          aria-label={article.title}
          tabIndex={-1}
        >
          <Image
            src={imgSrc}
            alt={article.featuredImage?.alt || article.title || "প্রধান সংবাদ ছবি"}
            fill
            unoptimized={!imgSrc.startsWith("/")}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 65vw, 55vw"
            priority={priority}
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={() => setImgSrc(DEFAULT_FALLBACK_IMAGE)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Link>

        {/* Category Badge */}
        <div className="absolute top-3 left-3 z-10">
          <Link
            href={`/category/${categorySlug}`}
            className="inline-flex items-center gap-1 bg-[#0B7A43] hover:bg-[#087A43] text-white text-xs font-bold px-3 py-1 rounded-md shadow-md transition-colors duration-200"
          >
            <span>{categoryName}</span>
          </Link>
        </div>

        {/* Breaking / Featured Indicator */}
        {(article.isBreaking || article.isLead) && (
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center gap-1 bg-[#C62828] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md animate-pulse">
              <Flame className="w-3 h-3 fill-current" />
              <span>প্রধান সংবাদ</span>
            </span>
          </div>
        )}
      </div>

      {/* Article Content */}
      <div className="p-4 sm:p-5 lg:p-6 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Subtitle / Topic if available */}
          {article.subtitle && (
            <span className="block text-xs sm:text-sm font-semibold text-[#087A43] mb-1.5">
              {article.subtitle}
            </span>
          )}

          {/* Lead Headline */}
          <h2 className="text-xl sm:text-2xl lg:text-[28px] font-extrabold text-[#1E293B] group-hover:text-[#0B7A43] transition-colors leading-[1.3] tracking-tight mb-3">
            <Link href={articleUrl} className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7A43] rounded">
              {article.title}
            </Link>
          </h2>

          {/* Summary / Excerpt */}
          {cleanSummary && (
            <p className="text-sm sm:text-base text-[#475569] line-clamp-3 mb-4 leading-relaxed font-normal">
              {cleanSummary}
            </p>
          )}
        </div>

        {/* Metadata Footer & Social Share */}
        <div className="pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 gap-2 flex-wrap">
          <div className="flex items-center gap-3.5 flex-wrap">
            <span className="flex items-center gap-1.5 font-medium text-gray-800">
              <User className="w-3.5 h-3.5 text-[#087A43]" />
              <span>{authorName}</span>
            </span>
            <span className="flex items-center gap-1.5 text-gray-500">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>{publishedDate}</span>
            </span>
          </div>

          <div className="shrink-0">
            <ShareButtons title={article.title} url={articleUrl} compact newsId={article.id} />
          </div>
        </div>
      </div>
    </article>
  );
}
