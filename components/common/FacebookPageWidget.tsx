"use client";

import React from "react";
import Image from "next/image";
import { ExternalLink, Share2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface FacebookPageWidgetProps {
  pageUrl?: string;
  className?: string;
}

export default function FacebookPageWidget({
  pageUrl = "https://www.facebook.com/BanglarAloNewsBD/",
  className = "",
}: FacebookPageWidgetProps) {
  const { isBn } = useLanguage();

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;
    window.open(shareUrl, "_blank", "width=600,height=500");
  };

  return (
    <div
      className={`w-full bg-white rounded-lg border border-[#CBD5E1] shadow-xs overflow-hidden transition-all hover:shadow-md ${className}`}
    >
      {/* 1. Top Header Bar */}
      <div className="bg-[#1877F2] text-white px-3.5 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-white text-[#1877F2] flex items-center justify-center font-black text-xs select-none">
            f
          </div>
          <span className="font-bold text-xs sm:text-sm tracking-tight">
            {isBn ? "ফেসবুকে আমরা" : "Follow Us on Facebook"}
          </span>
        </div>
        <a
          href={pageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] bg-white/20 hover:bg-white/30 text-white font-medium px-2 py-0.5 rounded transition-colors flex items-center gap-1"
        >
          <span>{isBn ? "যুক্ত থাকুন" : "Follow"}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* 2. Facebook Page Profile Area (হুবহু ফেসবুক কার্ড ডিজাইন, কোনো লেখা না কেটে ১০০% ক্লিয়ার) */}
      <div className="p-3 bg-white">
        <div className="flex items-center gap-3">
          {/* Logo with circular border */}
          <a
            href={pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative w-12 h-12 rounded-full border-2 border-[#1877F2]/30 p-0.5 shrink-0 hover:scale-105 transition-transform"
          >
            <div className="relative w-full h-full rounded-full overflow-hidden bg-white">
              <Image
                src="/images/logo-icon.png"
                alt="Banglar Alo News"
                fill
                className="object-contain p-0.5"
              />
            </div>
          </a>

          {/* Page Name and Follower Count */}
          <div className="flex-1 min-w-0">
            <a
              href={pageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[16px] sm:text-[17px] text-[#1877F2] hover:underline truncate block leading-tight"
            >
              Banglar Alo News
            </a>
            <p className="text-xs text-[#606770] font-medium mt-0.5">
              585,200 followers
            </p>
          </div>
        </div>

        {/* 3. Action Buttons: [f Follow Page] and [Share] (পরিপূর্ণ ক্লিয়ার ও নিখুঁত মার্জিন) */}
        <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-[#EBEDF0]">
          <a
            href={pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] font-semibold text-xs py-1.5 px-3 rounded flex items-center justify-center gap-1.5 transition-colors border border-gray-200/80 shadow-2xs"
          >
            <span className="w-4 h-4 rounded bg-[#1877F2] text-white flex items-center justify-center font-bold text-[10px]">
              f
            </span>
            <span>Follow Page</span>
          </a>

          <button
            type="button"
            onClick={handleShare}
            className="bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] font-semibold text-xs py-1.5 px-3 rounded flex items-center justify-center gap-1.5 transition-colors border border-gray-200/80 shadow-2xs cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-[#65676B]" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* 4. Footer link to Facebook */}
      <div className="px-3 py-1.5 bg-gray-50 border-t border-[#F1F5F9] text-center">
        <a
          href={pageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-semibold text-[#1877F2] hover:underline inline-flex items-center gap-1"
        >
          <span>
            {isBn
              ? "ফেসবুকে দেশ-বিদেশের তাজা সব খবর জানতে ফলো করুন"
              : "Follow on Facebook for latest updates & breaking news"}
          </span>
          <span className="text-xs">&rarr;</span>
        </a>
      </div>
    </div>
  );
}
