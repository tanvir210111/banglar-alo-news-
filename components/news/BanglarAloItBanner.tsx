"use client";

import React from "react";
import Image from "next/image";
import { ExternalLink, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  className?: string;
  slotLabel?: string;
}

export default function BanglarAloItBanner({ className = "", slotLabel }: Props) {
  const { isBn } = useLanguage();

  return (
    <div className={`w-full my-4 ${className}`}>
      {/* Subtle Ad Header */}
      <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1.5 px-1">
        <span className="flex items-center gap-1 font-semibold text-gray-600 uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-[#F59E0B]" />
          <span>{isBn ? "বিজ্ঞাপন" : "Advertisement"}</span>
          {slotLabel && <span className="text-gray-400 font-normal">({slotLabel})</span>}
        </span>
        <span className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors">
          Banglar Alo IT Solution
        </span>
      </div>

      {/* Interactive Leaderboard Ad Banner */}
      <a
        href="https://banglaraloit.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Banglar Alo IT - আধুনিক ওয়েবসাইট ও সফটওয়্যার সলিউশন"
        className="group relative block w-full overflow-hidden rounded-lg border border-[#1E3A5F]/30 bg-[#0A192F] shadow-sm hover:shadow-md hover:border-[#38BDF8]/60 transition-all duration-300"
      >
        <div className="relative w-full aspect-[970/120] max-h-[125px]">
          <Image
            src="/images/ads/banglaralo-leaderboard.svg"
            alt="Banglar Alo IT - ডোমেইন হোস্টিং ও ওয়েবসাইট ডেভেলপমেন্ট"
            fill
            priority={false}
            className="object-contain sm:object-cover w-full h-full transition-transform duration-500 group-hover:scale-[1.01]"
          />
        </div>

        {/* Floating click indicator on hover */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
          <span>{isBn ? "ভিজিট করুন" : "Visit"}</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </div>
      </a>
    </div>
  );
}
