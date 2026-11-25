"use client";

import React, { useEffect } from "react";
import { trackAdImpression, trackAdClick } from "@/services/newsService";
import { Globe, ArrowRight, Zap, CheckCircle2, PhoneCall } from "lucide-react";

interface AdProps {
  adId?: string;
  position?: string;
  size?: "leaderboard" | "medium-rectangle" | "banner" | "sidebar" | "square" | "video";
  className?: string;
  imageUrl?: string;
  videoUrl?: string;
  aspectRatio?: string;
  href?: string;
  altText?: string;
}

// WhatsApp Direct Contact Configuration (Matches Footer Phone Number: +880 1711-006214)
const WHATSAPP_PHONE = "8801711006214";
const WHATSAPP_DISPLAY = "+880 1711-006214";
const DEFAULT_WHATSAPP_MESSAGE =
  "আসসালামু আলাইকুম, আমি বাংলা'র আলো আইটি-র আধুনিক নিউজ পোর্টাল / ওয়েবসাইটের ডেমো বুকিং এবং বিস্তারিত তথ্যের জন্য যোগাযোগ করছি।";
const DEFAULT_WHATSAPP_URL = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
  DEFAULT_WHATSAPP_MESSAGE
)}`;

// WhatsApp SVG Icon
function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.074-2.001-.466-1.572-.649-2.584-2.247-2.664-2.353-.078-.106-.635-.844-.635-1.611 0-.767.4-1.144.542-1.3.144-.155.313-.194.417-.194.104 0 .208.002.299.006.096.004.224-.037.35.267.13.313.447 1.09.486 1.17.04.079.066.173.013.28-.053.107-.08.173-.16.267-.079.093-.167.208-.238.28-.08.08-.163.167-.07.327.093.16.413.682.887 1.103.61.542 1.124.71 1.284.79.16.079.254.066.347-.04.094-.107.4-.467.507-.627.107-.16.214-.133.36-.08.147.054.934.44 1.094.52.16.08.267.12.307.186.04.067.04.387-.104.793z" />
      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.176L2 22l4.954-1.396A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2a8.163 8.163 0 01-4.32-1.229l-.31-.188-2.94.829.84-2.855-.205-.327A8.166 8.166 0 1112 20.2z" />
    </svg>
  );
}

export default function AdvertisementPlaceholder({
  adId,
  size = "leaderboard",
  className = "",
  imageUrl,
  videoUrl,
  aspectRatio,
  href,
  altText = "বিজ্ঞাপন",
}: AdProps) {
  useEffect(() => {
    if (adId) {
      trackAdImpression(adId);
    }
  }, [adId]);

  const handleClick = () => {
    if (adId) {
      trackAdClick(adId);
    }
  };

  const targetUrl = href || DEFAULT_WHATSAPP_URL;

  // 1. Custom video ad
  if (videoUrl) {
    const videoAspect =
      aspectRatio || "aspect-[4/3] min-h-[260px] sm:min-h-[290px] lg:min-h-[310px]";
    const adBody = (
      <div className="w-full overflow-hidden rounded-md border border-[#E2E6EB] shadow-xs bg-black relative group">
        <div className={`relative ${videoAspect} w-full bg-black`}>
          <video
            src={videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover block"
          />
          <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-0.5 rounded pointer-events-none">
            {altText}
          </div>
        </div>
      </div>
    );

    return (
      <div
        className={`w-full flex justify-center items-center ${className}`}
        aria-label="ভিডিও বিজ্ঞাপন"
      >
        <a
          href={targetUrl}
          onClick={handleClick}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block w-full"
        >
          {adBody}
        </a>
      </div>
    );
  }

  // 2. Custom image banner
  if (imageUrl) {
    let maxWidthClass = "";
    let heightClass = "";
    if (size === "square") {
      maxWidthClass = "max-w-[280px]";
      heightClass = "max-h-[190px] sm:max-h-[200px]";
    }
    if (size === "medium-rectangle") maxWidthClass = "max-w-[300px]";
    if (size === "sidebar") maxWidthClass = "max-w-[300px]";
    if (size === "banner") maxWidthClass = "max-w-[728px]";

    const adBody = (
      <div className={`w-full ${maxWidthClass} mx-auto`}>
        <div
          className={`w-full overflow-hidden rounded-md border border-[#E2E6EB] shadow-xs bg-white ${
            heightClass ? "flex items-center justify-center" : ""
          }`}
        >
          <img
            src={imageUrl}
            alt={altText}
            className={`w-full ${
              heightClass ? `${heightClass} object-cover` : "h-auto object-cover"
            } block hover:opacity-95 transition-opacity`}
            loading="lazy"
          />
        </div>
      </div>
    );

    return (
      <div
        className={`my-3 w-full flex justify-center items-center ${className}`}
        aria-label="বিজ্ঞাপন"
      >
        <a
          href={targetUrl}
          onClick={handleClick}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block w-full"
        >
          {adBody}
        </a>
      </div>
    );
  }

  // 3. LIVE ADS FOR "Banglar Alo IT" (Direct WhatsApp & Demo Booking)

  // 3A. Vertical / Sidebar / Medium Rectangle / Square Card Ads
  if (size === "sidebar" || size === "medium-rectangle" || size === "square") {
    return (
      <div className={`w-full flex justify-center items-center ${className}`}>
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleClick}
          className="group block w-full overflow-hidden rounded-xl border border-[#1E3A5F] shadow-md hover:shadow-xl hover:border-emerald-400/60 transition-all duration-300 relative bg-gradient-to-b from-[#0B1528] via-[#10223D] to-[#0A1B30] text-white select-none"
          aria-label="Banglar Alo IT যোগাযোগ ও ডেমো বুকিং বিজ্ঞাপন"
        >
          {/* Animated decorative gradient radial lights */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/25 transition-all duration-500" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/25 transition-all duration-500" />

          {/* Top Status Bar */}
          <div
            className="px-3 py-1.5 border-b border-white/10 flex items-center justify-between backdrop-blur-xs"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
          >
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase shadow-xs"
              style={{ backgroundColor: "#DC2626", color: "#ffffff" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-ping inline-block" />
              LIVE AD
            </span>
            <span className="text-[10.5px] font-semibold text-emerald-400 flex items-center gap-1">
              <Zap className="w-3 h-3 fill-current text-yellow-400" /> ২৪/৭ সাপোর্ট
            </span>
          </div>

          {/* Card Body */}
          <div className="p-3.5 text-center relative z-10">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white shadow-md shadow-cyan-950/60 group-hover:scale-110 transition-transform"
                style={{
                  background: "linear-gradient(135deg, #087A43, #0D9488, #06B6D4)",
                }}
              >
                <Globe className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-base sm:text-[17px] font-black tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                Banglar Alo IT
              </h3>
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                style={{
                  backgroundColor: "rgba(245, 158, 11, 0.2)",
                  borderColor: "rgba(251, 191, 36, 0.4)",
                  color: "#FCD34D",
                }}
              >
                ৫০% ছাড়
              </span>
            </div>

            <p className="text-[11.5px] font-bold text-yellow-300" style={{ color: "#FDE047" }}>
              আধুনিক ওয়েবসাইট, নিউজ পোর্টাল ও মোবাইল অ্যাপ
            </p>

            {/* Feature Checklist */}
            <div className="mt-2 pt-2 border-t border-white/10 text-left space-y-1 text-[11px] text-gray-200">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>নিউজ পোর্টাল ও ডায়নামিক ওয়েবসাইট</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>অ্যান্ড্রয়েড ও আইওএস মোবাইল অ্যাপ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>সুপারফাস্ট NVMe ক্লাউড হোস্টিং</span>
              </div>
            </div>

            {/* Footer Phone Number Display */}
            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-center gap-1.5 text-emerald-300 text-xs font-bold">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>{WHATSAPP_DISPLAY}</span>
            </div>

            {/* Direct WhatsApp / Demo Booking Button */}
            <div className="mt-2">
              <span
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold shadow-md group-hover:scale-102 transition-all"
                style={{
                  background: "linear-gradient(90deg, #25D366 0%, #1EBE5D 50%, #128C7E 100%)",
                  backgroundColor: "#25D366",
                  color: "#ffffff",
                }}
              >
                <WhatsAppIcon className="w-4 h-4 fill-white" />
                <span>ডেমো বুকিং / যোগাযোগ করুন</span>
              </span>
              <span className="block text-[10px] text-emerald-400/90 mt-1.5 font-medium">
                সরাসরি হোয়াটসঅ্যাপে কথা বলুন • ইনস্ট্যান্ট রেসপন্স
              </span>
            </div>
          </div>
        </a>
      </div>
    );
  }

  // 3B. Horizontal Leaderboard & Content Banner Ads (Leaderboard / Banner)
  return (
    <div className={`my-3 w-full flex justify-center items-center ${className}`}>
      <a
        href={targetUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={handleClick}
        className="group block w-full overflow-hidden rounded-xl border border-[#1E3A5F] shadow-md hover:shadow-2xl hover:border-emerald-400/60 transition-all duration-300 relative bg-gradient-to-r from-[#071324] via-[#0B2545] to-[#0A1B30] text-white select-none"
        style={{
          background: "linear-gradient(90deg, #071324 0%, #0B2545 50%, #0A1B30 100%)",
          backgroundColor: "#0B2545",
          color: "#ffffff",
        }}
        aria-label="Banglar Alo IT ডেমো বুকিং ব্যানার বিজ্ঞাপন"
      >
        {/* Animated glowing decorative ambient lights */}
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/25 transition-all duration-500" />
        <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/25 transition-all duration-500" />

        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="relative z-10 px-4 sm:px-6 py-3 sm:py-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Left: Brand Badge + Headline + Subtext */}
          <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
            {/* Live Badge */}
            <div className="shrink-0 flex flex-col items-center justify-center">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider shadow-sm border border-red-400/40"
                style={{
                  backgroundColor: "#DC2626",
                  color: "#ffffff",
                }}
              >
                <span className="w-2 h-2 rounded-full bg-yellow-300 animate-ping inline-block" />
                LIVE
              </span>
              <span className="text-[9.5px] mt-1 uppercase font-semibold" style={{ color: "#9CA3AF" }}>
                বিজ্ঞাপন
              </span>
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-emerald-300 transition-colors" style={{ color: "#ffffff" }}>
                  Banglar Alo IT
                </span>
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded border"
                  style={{
                    backgroundColor: "rgba(16, 185, 129, 0.2)",
                    borderColor: "rgba(16, 185, 129, 0.4)",
                    color: "#6EE7B7",
                  }}
                >
                  ৫০% বিশেষ ছাড়
                </span>
              </div>
              <p className="text-xs sm:text-[13.5px] font-bold line-clamp-1 mt-0.5" style={{ color: "#FDE047" }}>
                আধুনিক নিউজ পোর্টাল, ওয়েবসাইট ও মোবাইল অ্যাপ ডেভেলপমেন্ট
              </p>
              <p className="text-[11px] hidden sm:block mt-0.5" style={{ color: "#D1D5DB" }}>
                লাইভ ডেমো দেখতে এবং সেরা অফারে বুকিং করতে সরাসরি হোয়াটসঅ্যাপে যোগাযোগ করুন
              </p>
            </div>
          </div>

          {/* Right: Phone Number & WhatsApp Demo Booking Button */}
          <div className="shrink-0 flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-[10.5px] font-medium" style={{ color: "#D1D5DB" }}>কল বা হোয়াটসঅ্যাপ</span>
              <span className="text-xs font-bold flex items-center gap-1 justify-end" style={{ color: "#6EE7B7" }}>
                <PhoneCall className="w-3 h-3 text-emerald-400" />
                {WHATSAPP_DISPLAY}
              </span>
            </div>
            <span
              className="inline-flex items-center justify-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold shadow-lg shadow-emerald-950/50 group-hover:scale-105 group-hover:brightness-110 transition-all duration-200"
              style={{
                background: "linear-gradient(90deg, #25D366 0%, #1EBE5D 50%, #128C7E 100%)",
                backgroundColor: "#25D366",
                color: "#ffffff",
              }}
            >
              <WhatsAppIcon className="w-4.5 h-4.5 fill-white shrink-0" />
              <span>ডেমো বুকিং / যোগাযোগ করুন</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </a>
    </div>
  );
}
