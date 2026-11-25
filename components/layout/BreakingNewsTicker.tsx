"use client";

import React from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { BreakingNewsItem } from "@/types/news";
import { useLanguage } from "@/context/LanguageContext";

interface TickerProps {
  items: BreakingNewsItem[];
}

export default function BreakingNewsTicker({ items }: TickerProps) {
  const { isBn } = useLanguage();
  if (!items || items.length === 0) return null;

  // Duplicate items twice to ensure an infinite seamless loop
  const tickerItems = [...items, ...items];

  return (
    <div
      className="breaking-ticker bg-[#D62828] text-white shadow-xs w-full overflow-hidden border-b border-red-800/40 select-none"
      role="region"
      aria-label={isBn ? "ব্রেকিং নিউজ স্ক্রলিং" : "Breaking News Ticker"}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center text-sm py-1.5 w-full">
        {/* Fixed Left Badge */}
        <div className="flex items-center gap-1.5 bg-[#8b1010] px-3 py-1 rounded-sm text-[14px] sm:text-[15px] font-extrabold shrink-0 tracking-wide shadow-md z-10 mr-4 leading-none">
          <Zap className="w-4 h-4 fill-current animate-pulse text-yellow-300 shrink-0" />
          <span className="whitespace-nowrap font-extrabold leading-none">
            {isBn ? "ব্রেকিং নিউজ" : "Breaking News"}
          </span>
        </div>

        {/* Continuous Right-to-Left Infinite Scrolling Track */}
        <div className="relative flex-1 overflow-hidden">
          <div className="animate-marquee flex items-center">
            {tickerItems.map((item, index) => {
              const displayHeadline = !isBn && item.headlineEn ? item.headlineEn : item.headline;

              return (
                <div key={`${item.id}-${index}`} className="inline-flex items-center shrink-0">
                  <Link
                    href={`/news/${item.slug}`}
                    className="hover:underline hover:text-yellow-100 transition-colors font-medium text-white text-sm flex items-center py-0.5"
                  >
                    <span>{displayHeadline}</span>
                  </Link>
                  {/* Visual Separator between headlines */}
                  <span className="mx-6 text-red-300/80 font-bold select-none">•</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
