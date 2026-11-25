"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  Download,
  Share2,
  Check,
  Palette,
  Sparkles,
  QrCode,
  Loader2,
  ExternalLink,
} from "lucide-react";
import {
  generatePhotoCard,
  downloadDataUrl,
  THEME_CONFIG,
  PhotoCardData,
} from "@/lib/photoCardGenerator";

interface PhotoCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  imageUrl: string;
  dateBengali?: string;
  timeBengali?: string;
  articleUrl: string;
  slug?: string;
}

export default function PhotoCardModal({
  isOpen,
  onClose,
  title,
  imageUrl,
  dateBengali,
  timeBengali,
  articleUrl,
  slug,
}: PhotoCardModalProps) {
  const [theme, setTheme] = useState<"red" | "green" | "navy">("red"); // Defaulting to reference red
  const [commentText, setCommentText] = useState("বিস্তারিত কমেন্টে");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Always ensure a canonical, publicly accessible URL for QR scanning
  const fullArticleUrl = (() => {
    let raw = articleUrl || "";
    if (!raw || raw.includes("localhost") || raw.includes("127.0.0.1") || raw.startsWith("/")) {
      if (slug) {
        return `https://www.banglaralonews.com/news/${slug}`;
      }
      return "https://www.banglaralonews.com";
    }
    return raw;
  })();

  const renderCard = async () => {
    setIsGenerating(true);
    try {
      const url = await generatePhotoCard({
        title,
        imageUrl: imageUrl || "/images/news-placeholder.svg",
        dateBengali: dateBengali || "আজ",
        articleUrl: fullArticleUrl,
        commentText,
        theme,
      });
      setDataUrl(url);
    } catch (err) {
      console.error("Failed to generate photocard:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      renderCard();
    }
  }, [isOpen, theme, commentText, title, imageUrl, fullArticleUrl]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!dataUrl) return;
    const safeName = (slug || "banglar-alo-news-photocard").slice(0, 40);
    downloadDataUrl(dataUrl, `${safeName}-photocard.png`);
    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 3000);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullArticleUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#123B5D] to-[#0A2540] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight">
                স্মার্ট ফটোকার্ড জেনারেটর
              </h3>
              <p className="text-xs text-white/75">
                ফেসবুক ও সোশ্যাল মিডিয়ায় পোস্ট করার জন্য অটো-তৈরিকৃত এইচডি ফটোকার্ড
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Controls: Theme & CTA Text */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700">
                <Palette className="w-4 h-4 text-emerald-600" />
                <span>কালার থিম নির্বাচন করুন:</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTheme("red")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${theme === "red"
                    ? "bg-[#8E121B] text-white shadow-xs ring-2 ring-[#8E121B]/30"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                    }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8E121B]"></span>
                  রেফারেন্স লাল
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("green")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${theme === "green"
                    ? "bg-[#006A4E] text-white shadow-xs ring-2 ring-[#006A4E]/30"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                    }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#006A4E]"></span>
                  ওয়েবসাইট সবুজ
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("navy")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${theme === "navy"
                    ? "bg-[#0E2A47] text-white shadow-xs ring-2 ring-[#0E2A47]/30"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                    }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0E2A47]"></span>
                  রয়্যাল নেভি
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-200/80">
              <span className="text-xs sm:text-sm font-semibold text-slate-700">
                কমেন্ট আহ্বান টেক্সট:
              </span>
              <div className="flex items-center gap-2">
                {["নিউজ লিংক কমেন্টে", "বিস্তারিত কমেন্টে"].map((txt) => (
                  <button
                    key={txt}
                    type="button"
                    onClick={() => setCommentText(txt)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${commentText === txt
                      ? "bg-slate-800 text-white"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                      }`}
                  >
                    {txt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Photo Card Preview Frame */}
          <div className="relative aspect-square w-full max-w-[480px] mx-auto bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-300 flex items-center justify-center">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-2 text-white">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                <span className="text-sm font-medium">ফটোকার্ড তৈরি হচ্ছে...</span>
              </div>
            ) : dataUrl ? (
              <img
                src={dataUrl}
                alt="Generated Photo Card"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-slate-400 text-sm">প্রিভিউ লোড করা যায়নি</div>
            )}
          </div>

          {/* QR Code Info Badge */}
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                এই সংবাদের জন্য ইউনিক কিউআর কোড জেনারেট হয়েছে। যেকোনো মোবাইল ক্যামেরা দিয়ে স্ক্যান করলে সরাসরি এই নিউজ পেজ ওপেন হবে।
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <a
              href={`/photocard?slug=${encodeURIComponent(slug || "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              <span>স্টুডিওতে কাস্টমাইজ করুন</span>
            </a>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>লিংক কপি হয়েছে</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-slate-500" />
                  <span>সংবাদ লিংক কপি</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              বন্ধ করুন
            </button>
            <button
              type="button"
              disabled={isGenerating || !dataUrl}
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#006A4E] to-[#087A43] hover:from-[#005C3B] hover:to-[#006A4E] shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloaded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>ডাউনলোড সম্পন্ন!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>ফটোকার্ড ডাউনলোড করুন (HD PNG)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

