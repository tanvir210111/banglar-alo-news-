"use client";

import React from "react";
import { Printer, ZoomIn, ZoomOut, RotateCcw, Camera } from "lucide-react";
import ShareButtons from "../news/ShareButtons";

interface ToolbarProps {
  fontSizeLevel: number; // -1 (small), 0 (normal), 1 (large), 2 (xlarge)
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  onResetFontSize: () => void;
  title: string;
  url?: string;
  onOpenPhotoCard?: () => void;
  onOpenPrint?: () => void;
}

export default function ArticleToolbar({
  fontSizeLevel,
  onIncreaseFontSize,
  onDecreaseFontSize,
  onResetFontSize,
  title,
  url,
  onOpenPhotoCard,
  onOpenPrint,
}: ToolbarProps) {
  const handlePrint = () => {
    if (onOpenPrint) {
      onOpenPrint();
    } else if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="bg-[#f8f9fa] border border-[#E2E6EB] rounded-lg p-2 sm:px-3 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar flex-nowrap whitespace-nowrap no-print my-4">
      {/* Font Size Controls, Print & Photo Card (All in one line) */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        <span className="text-xs font-semibold text-[#626B75] mr-0.5 hidden xl:inline">
          হরফের আকার:
        </span>

        <button
          onClick={onDecreaseFontSize}
          disabled={fontSizeLevel <= -1}
          aria-label="হরফ ছোট করুন"
          title="হরফ ছোট করুন"
          className="p-1 sm:p-1.5 rounded bg-white border border-[#E2E6EB] hover:bg-gray-100 disabled:opacity-40 text-xs font-bold text-[#202124] transition-colors flex items-center gap-0.5 cursor-pointer shrink-0"
        >
          <ZoomOut className="w-3.5 h-3.5" />
          <span className="text-[11px]">A-</span>
        </button>

        <button
          onClick={onResetFontSize}
          disabled={fontSizeLevel === 0}
          aria-label="স্বাভাবিক হরফ"
          title="স্বাভাবিক হরফ"
          className="p-1 sm:p-1.5 rounded bg-white border border-[#E2E6EB] hover:bg-gray-100 disabled:opacity-40 text-xs font-bold text-[#202124] transition-colors flex items-center gap-0.5 cursor-pointer shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="text-[11px]">A</span>
        </button>

        <button
          onClick={onIncreaseFontSize}
          disabled={fontSizeLevel >= 2}
          aria-label="হরফ বড় করুন"
          title="হরফ বড় করুন"
          className="p-1 sm:p-1.5 rounded bg-white border border-[#E2E6EB] hover:bg-gray-100 disabled:opacity-40 text-xs font-bold text-[#202124] transition-colors flex items-center gap-0.5 cursor-pointer shrink-0"
        >
          <ZoomIn className="w-3.5 h-3.5" />
          <span className="text-[11px]">A+</span>
        </button>

        <span className="text-gray-300 mx-0.5">|</span>

        {/* Print Button */}
        <button
          onClick={handlePrint}
          aria-label="সংবাদটি প্রিন্ট করুন"
          title="প্রিন্ট করুন"
          className="flex items-center gap-1 px-2 py-1.5 rounded bg-white border border-[#E2E6EB] hover:bg-gray-100 text-xs font-medium text-[#202124] transition-colors cursor-pointer shrink-0"
        >
          <Printer className="w-3.5 h-3.5 text-[#0B7A43]" />
          <span className="text-xs hidden sm:inline">প্রিন্ট</span>
        </button>

        {/* Photo Card Button */}
        {onOpenPhotoCard && (
          <button
            type="button"
            onClick={onOpenPhotoCard}
            aria-label="ফটোকার্ড ডাউনলোড করুন"
            title="সোশ্যাল মিডিয়া ফটোকার্ড তৈরি ও ডাউনলোড করুন"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#087A43] hover:bg-[#066336] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0 ml-0.5"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>ফটোকার্ড</span>
          </button>
        )}
      </div>

      {/* Share toolbar (One single line) */}
      <div className="shrink-0">
        <ShareButtons title={title} url={url} />
      </div>
    </div>
  );
}
