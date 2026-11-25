"use client";

import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Printer, X } from "lucide-react";
import QRCode from "qrcode";
import { BRAND_LOGO_BASE64, LOGO_ICON_BASE64 } from "@/lib/brandAssets";

interface EpaperPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  contentHtml: string;
  featuredImage?: {
    url: string;
    caption?: string;
    credit?: string;
  };
  dateBengali?: string;
  timeBengali?: string;
  categoryName?: string;
  authorName?: string;
  slug?: string;
}

export default function EpaperPrintModal({
  isOpen,
  onClose,
  title,
  subtitle,
  contentHtml,
  featuredImage,
  dateBengali,
  timeBengali,
  categoryName,
  authorName = "নিজস্ব প্রতিবেদক",
  slug,
}: EpaperPrintModalProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  const fullUrl = `https://www.banglaralonews.com/news/${slug || ""}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(fullUrl, {
        width: 140,
        margin: 1,
        color: { dark: "#000000", light: "#ffffff" },
      })
        .then((url) => setQrDataUrl(url))
        .catch(() => {});
    }
  }, [isOpen, fullUrl]);

  if (!isOpen || !mounted) return null;

  const handlePrint = () => {
    window.print();
  };

  // Convert HTML content into clean paragraphs
  const cleanParagraphs = () => {
    if (!contentHtml) return [];
    if (typeof window === "undefined") return [];

    const div = document.createElement("div");
    div.innerHTML = contentHtml;
    // remove images from text content since featured image is shown
    const imgs = div.querySelectorAll("img, figure");
    imgs.forEach((el) => el.remove());

    let paragraphs = Array.from(div.querySelectorAll("p"))
      .map((p) => p.innerText.trim())
      .filter((t) => t.length > 0);

    if (paragraphs.length === 0 && div.innerText.trim()) {
      paragraphs = div.innerText.split("\n\n").filter((t) => t.trim().length > 0);
    }

    // Strip duplicate reporter byline if it's already in the first paragraph of content
    if (paragraphs.length > 0) {
      const first = paragraphs[0];
      const bylinePattern = /^(?:নিজস্ব প্রতিবেদক|প্রতিবেদক|বিশেষ প্রতিবেদক|ডেস্ক রিপোর্ট|বার্তা কক্ষ)[\s:।-]*$/i;
      if (bylinePattern.test(first)) {
        paragraphs = paragraphs.slice(1);
      } else {
        // Or if it starts with "নিজস্ব প্রতিবেদক : " at the start of the first sentence
        paragraphs[0] = first.replace(/^(?:নিজস্ব প্রতিবেদক|প্রতিবেদক|বিশেষ প্রতিবেদক|ডেস্ক রিপোর্ট)[\s:।-]+/i, "").trim();
      }
    }

    return paragraphs;
  };

  const paragraphs = cleanParagraphs();
  const dateFormatted = `${dateBengali || "আজ"}${timeBengali ? `, ${timeBengali}` : ""}`;

  // Clean author name so it never shows "Newsroom"
  const cleanAuthor =
    !authorName || authorName.toLowerCase().includes("newsroom") || authorName === "প্রতিবেদক"
      ? "নিজস্ব প্রতিবেদক"
      : authorName;

  // Split paragraphs equally (50%-50%) between left and right columns
  const halfLength = Math.ceil(paragraphs.length / 2);
  const leftParagraphs = paragraphs.slice(0, halfLength);
  const rightParagraphs = paragraphs.slice(halfLength);

  // Split right paragraphs into two parts to insert the sponsor ad in the middle
  const rightMid = Math.max(1, Math.floor(rightParagraphs.length / 2));
  const rightTopParagraphs = rightParagraphs.slice(0, rightMid);
  const rightBottomParagraphs = rightParagraphs.slice(rightMid);

  const modalContent = (
    <div
      id="epaper-print-container-portal"
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto"
    >
      {/* Top Floating Control Bar (Hidden when printing) */}
      <div className="fixed top-3 right-4 z-[100000] flex items-center gap-2 no-print">
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs sm:text-sm font-bold rounded-lg shadow-lg transition-transform active:scale-95 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>প্রিন্ট করুন</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="p-2 bg-gray-900/90 hover:bg-black text-white rounded-lg transition-colors cursor-pointer"
          title="বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Modal Card / Print Sheet */}
      <div
        ref={printAreaRef}
        id="epaper-print-container"
        className="w-full max-w-[800px] bg-white rounded-sm shadow-2xl overflow-hidden my-auto border border-gray-300"
      >
        {/* ===================== EPAPER HEADER ===================== */}
        <div className="relative bg-white border-b-2 border-red-600 px-4 sm:px-6 pt-3.5 pb-2 overflow-hidden">
          {/* Top Row: Just Logo on Left, Everything Else on Right */}
          <div className="flex items-center justify-between gap-4">
            {/* Left: Prominent Big Brand Logo */}
            <div className="flex items-center gap-3">
              <img
                src={LOGO_ICON_BASE64}
                alt="বাংলার আলো নিউজ"
                className="w-13 h-13 sm:w-16 sm:h-16 object-contain shrink-0"
              />
              <div className="flex flex-col justify-center">
                <span className="text-xl sm:text-2xl font-black text-[#0B7A43] tracking-tight">
                  বাংলার আলো <span className="text-[#D97706]">নিউজ</span>
                </span>
                <span className="text-xs sm:text-[13px] text-[#64748B] font-bold tracking-wide -mt-0.5">
                  সত্য ও ন্যায়ের দীপ্ত কণ্ঠস্বর
                </span>
              </div>
            </div>

            {/* Right: Tagline, Website, Date & Category */}
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5 text-[#0B7A43] font-extrabold text-sm sm:text-base border-b border-emerald-200 pb-0.5">
                <span className="w-2 h-2 rounded-full bg-[#0B7A43] inline-block" />
                <span>সত্য ও ন্যায়ের দীপ্ত কণ্ঠস্বর</span>
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-[#0B7A43] tracking-wider">
                www.banglaralonews.com
              </span>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-700 font-medium">
                <span>📅 {dateFormatted}</span>
                <span className="bg-red-600 text-white px-2 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider">
                  {categoryName || "জাতীয়"}
                </span>
              </div>
            </div>
          </div>

          {/* Green & Gold Header Ribbon */}
          <div className="mt-2.5 rounded-xs overflow-hidden flex flex-wrap items-center justify-between text-xs font-semibold text-white bg-linear-to-r from-[#0B7A43] via-[#045A30] to-[#0B7A43] px-3 py-1 shadow-2xs">
            <div className="flex items-center gap-3">
              <span>★ বাংলার আলো নিউজ — সত্য ও ন্যায়ের দীপ্ত কণ্ঠস্বর</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span>অনলাইন সংস্করণ</span>
            </div>
          </div>
        </div>

        {/* ===================== EPAPER ARTICLE BODY ===================== */}
        <div className="px-4 sm:px-6 py-3.5 bg-white">
          {/* Subtitle if available */}
          {subtitle && (
            <div className="text-red-600 font-bold text-sm sm:text-base mb-1 tracking-tight">
              {subtitle}
            </div>
          )}

          {/* Bigger, Bolder Headline */}
          <h1 className="text-xl sm:text-2xl md:text-[25px] font-extrabold text-[#111827] leading-snug mb-3 tracking-tight border-b border-gray-200 pb-2">
            {title}
          </h1>

          {/* Perfectly Balanced 50% - 50% Two-Column Layout */}
          <div className="grid grid-cols-2 gap-4 sm:gap-5 items-start">
            {/* Left Column (50% Width): Image + Left Half of News */}
            <div className="flex flex-col gap-2.5">
              {featuredImage?.url && (
                <div className="border border-gray-300 p-1 bg-gray-50 rounded-xs shadow-2xs">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-200">
                    <img
                      src={featuredImage.url}
                      alt={title}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                  {featuredImage.caption && (
                    <p className="text-[11px] text-gray-600 italic mt-0.5 px-1 leading-snug">
                      {featuredImage.caption}
                    </p>
                  )}
                </div>
              )}

              {/* Correspondent byline */}
              <div className="text-xs sm:text-[13px] font-bold text-gray-900 border-b border-gray-300 pb-0.5">
                {cleanAuthor}:
              </div>

              {/* Left Column Paragraphs */}
              {leftParagraphs.map((para, idx) => (
                <p
                  key={idx}
                  className="text-xs sm:text-[13px] text-gray-800 leading-relaxed text-justify"
                >
                  {para}
                </p>
              ))}
            </div>

            {/* Right Column (50% Width): Right Half of News + Middle Sponsor Ad */}
            <div className="flex flex-col gap-2.5">
              {/* Top half of right column paragraphs */}
              {rightTopParagraphs.map((para, idx) => (
                <p
                  key={idx}
                  className="text-xs sm:text-[13px] text-gray-800 leading-relaxed text-justify"
                >
                  {para}
                </p>
              ))}

              {/* Bottom half of right column paragraphs */}
              {rightBottomParagraphs.map((para, idx) => (
                <p
                  key={idx}
                  className="text-xs sm:text-[13px] text-gray-800 leading-relaxed text-justify"
                >
                  {para}
                </p>
              ))}

              {paragraphs.length <= 1 && paragraphs.length > 0 && (
                <p className="text-xs text-gray-500 italic">
                  (বিস্তারিত প্রতিবেদনের জন্য আমাদের অনলাইন পোর্টালে ভিজিট করুন)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ===================== EPAPER FOOTER ===================== */}
        <div className="border-t-2 border-red-600 bg-white">
          {/* Footer Top Ribbon: Logo Image & Tagline */}
          <div className="flex items-center justify-between bg-gradient-to-r from-white via-red-50 to-red-600 px-4 sm:px-6 py-1.5">
            <div className="flex items-center gap-2">
              <img
                src={LOGO_ICON_BASE64}
                alt="অর্থনীতি সংবাদ"
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0"
              />
              <img
                src={BRAND_LOGO_BASE64}
                alt="অর্থনীতি সংবাদ"
                className="h-6 sm:h-7 w-auto object-contain block"
              />
            </div>

            <div className="text-white font-bold text-[11px] sm:text-xs tracking-wide px-2.5 py-0.5 bg-red-600 rounded-xs shadow-2xs">
              সত্যের পথে মুক্তি
            </div>
          </div>

          {/* Footer Editorial Info Grid */}
          <div className="bg-[#f8fafc] border-t border-gray-200 px-4 sm:px-6 py-2 text-[10.5px] sm:text-[11px] text-gray-700 leading-normal text-center">
            <p className="text-gray-600">
              <strong>প্রকাশক ও সম্পাদক:</strong> মোঃ গোলাম মাওলা শাওন | <strong>মোবাইল:</strong> ০১৭১১-০০৬২১৪, ০১৯৯৯-৯৫৩৯৭০ | <strong>ই-মেইল:</strong> banglaralonewsbd@gmail.com
            </p>
            <p className="text-gray-500 text-[10px] mt-0.5">
              <strong>প্রধান কার্যালয়:</strong> ৩১/১ শরীফ কমপ্লেক্স (৬ষ্ঠ তলা), পুরানা পল্টন, ঢাকা-১০০০ | <strong>ওয়েব:</strong> www.banglaralonews.com
            </p>

            {/* Bottom mini row: QR Code & Copyright */}
            <div className="mt-1.5 pt-1.5 border-t border-gray-300 flex flex-wrap items-center justify-between gap-2 text-[9.5px] text-gray-500">
              <div className="flex items-center gap-2">
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="Article QR Code"
                    className="w-8 h-8 border border-gray-300 rounded-xs p-0.5 bg-white shrink-0"
                  />
                )}
                <div className="text-left leading-tight">
                  <span className="font-semibold text-gray-800 block">স্মার্টফোনে স্ক্যান করুন</span>
                  <span>অনলাইনে সম্পূর্ণ নিউজটি পড়তে</span>
                </div>
              </div>

              <div className="text-right">
                <p>© ২০২৬ বাংলার আলো নিউজ। সর্বস্বত্ব সংরক্ষিত।</p>
                <p className="text-[8.5px] text-gray-400">কারিগরি সহযোগিতায়: Banglar Alo IT</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Control Bar in Modal (Hidden when printing) */}
        <div className="p-2.5 bg-gray-100 border-t border-gray-200 flex items-center justify-end gap-2.5 no-print">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-200 border border-gray-300 transition-colors cursor-pointer"
          >
            বাতিল
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>প্রিন্ট করুন</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
