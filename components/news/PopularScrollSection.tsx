"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Article } from "@/types/news";
import { Clock, ChevronRight, ChevronLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface PopularScrollSectionProps {
  articles: Article[];
  times?: Record<string, string>;
}

export default function PopularScrollSection({
  articles,
  times = {},
}: PopularScrollSectionProps) {
  const { isBn } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  if (!articles || articles.length === 0) return null;

  // Mouse drag-to-scroll variables
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);
  const isDragging = useRef(false);

  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = containerRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [articles]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    isDown.current = true;
    isDragging.current = false;
    startX.current = e.pageX - containerRef.current.offsetLeft;
    scrollLeftPos.current = containerRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
  };

  const handleMouseUp = () => {
    isDown.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    if (Math.abs(walk) > 5) {
      isDragging.current = true;
    }
    containerRef.current.scrollLeft = scrollLeftPos.current - walk;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging.current) {
      e.preventDefault();
    }
  };

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: -320,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: 320,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="bg-white rounded-lg border border-[#E2E6EB] border-b-4 border-b-[#087A43] shadow-xs p-4 sm:p-5">
      {/* Header: Title on Left, 'সব দেখুন' on Right */}
      <div className="border-b border-[#E2E6EB] flex items-center justify-between mb-4">
        <div className="border-b-2 border-[#D62828] pb-1.5 -mb-[1px]">
          <h2 className="text-xl sm:text-2xl font-bold text-[#202124]">
            {isBn ? "সর্বাধিক পঠিত" : "Most Read"}
          </h2>
        </div>
        <Link
          href="/popular"
          className="text-xs sm:text-sm text-[#626B75] hover:text-[#0B7A43] font-medium flex items-center gap-0.5 transition-colors pb-1"
        >
          <span>{isBn ? "সব দেখুন" : "See All"}</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Horizontal Scroll Track */}
      <div className="relative">
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="flex items-stretch gap-3.5 overflow-x-auto no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing select-none py-1 px-0.5"
          style={{ scrollSnapType: "x proximity" }}
        >
          {articles.map((art) => {
            const displayTitle = !isBn && art.titleEn ? art.titleEn : art.title;
            const displayTime = !isBn ? (art.publishedAtEnglish || "Today") : (times[art.id] || art.publishedAtBengali);

            return (
              <Link
                key={art.id}
                href={`/news/${art.slug}`}
                onClick={handleClick}
                className="group w-[265px] sm:w-[295px] shrink-0 bg-white border border-[#E2E6EB] rounded-xs p-3.5 flex flex-col justify-between hover:border-[#0B7A43] hover:shadow-xs transition-all block snap-start"
              >
                <div className="flex items-start gap-2.5 mb-3">
                  <span className="w-2.5 h-2.5 bg-[#D62828] shrink-0 mt-1.5 rounded-2xs" />
                  <h3 className="text-[15.5px] sm:text-[16.5px] font-bold text-[#202124] group-hover:text-[#0B7A43] line-clamp-2 leading-snug transition-colors">
                    {displayTitle}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#626B75] pl-5 mt-auto">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>{displayTime}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Scroll Left Button */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={scrollLeft}
            aria-label={isBn ? "বামে স্ক্রল করুন" : "Scroll left"}
            className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3.5 w-8 h-8 rounded-full bg-white/95 border border-[#CBD5E1] shadow-md flex items-center justify-center text-[#123B5D] hover:bg-[#F1F5F9] transition-all cursor-pointer z-10"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Scroll Right Button */}
        {canScrollRight && (
          <button
            type="button"
            onClick={scrollRight}
            aria-label={isBn ? "ডানে স্ক্রল করুন" : "Scroll right"}
            className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3.5 w-8 h-8 rounded-full bg-white/95 border border-[#CBD5E1] shadow-md flex items-center justify-center text-[#123B5D] hover:bg-[#F1F5F9] transition-all cursor-pointer z-10"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </section>
  );
}
