"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  PhotoCardConfig,
  DEFAULT_PHOTOCARD_CONFIG,
  renderPhotoCardToCanvas,
  downloadDataUrl,
} from "@/lib/photoCardGenerator";

interface InitialArticleData {
  title: string;
  imageUrl: string;
  dateBengali?: string;
  slug?: string;
  articleUrl?: string;
}

interface PhotoCardStudioClientProps {
  initialData?: InitialArticleData;
}

const COLOR_PRESETS = [
  { name: "লাল", primary: "#8A0B14", secondary: "#580006" },
  { name: "জাতীয় সবুজ", primary: "#006A4E", secondary: "#004D38" },
  { name: "রয়েল নেভি", primary: "#0F2A4A", secondary: "#081729" },
  { name: "ডার্ক মেরুন", primary: "#580006", secondary: "#2B0003" },
  { name: "গাঢ় বেগুনি", primary: "#3B0764", secondary: "#1E0338" },
];

export default function PhotoCardStudioClient({
  initialData,
}: PhotoCardStudioClientProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize config with article data, default to Anand TV template (Reference 1)
  const [config, setConfig] = useState<PhotoCardConfig>(() => ({
    ...DEFAULT_PHOTOCARD_CONFIG,
    template: "anand_tv",
    aspectRatio: "4:5",
    primaryColor: "#8A0B14",
    secondaryColor: "#580006",
    backgroundColor: "#F7F7F8",
    imageRadius: "straight",
    imagePadding: 0,
    imageHeightRatio: 0.65,
    logoWidth: 485,
    logoXOffset: 0,
    logoYOffset: 0,
    logoBadgeBg: true,
    titleFontSize: 69,
    titleYOffset: -12,
    titleColor: "#FFFFFF",
    titleAlign: "center",
    titleHasBg: false,
    titleBgColor: "#000000",
    showQrCode: false,
    qrCodeSize: 110,
    qrXOffset: 0,
    qrYOffset: 0,
    commentYOffset: -18,
    titleText: initialData?.title || DEFAULT_PHOTOCARD_CONFIG.titleText,
    imageUrl: initialData?.imageUrl || DEFAULT_PHOTOCARD_CONFIG.imageUrl,
    dateText: initialData?.dateBengali || DEFAULT_PHOTOCARD_CONFIG.dateText,
    slug: initialData?.slug,
    articleUrl:
      initialData?.articleUrl ||
      (initialData?.slug
        ? `https://www.banglaralonews.com/news/${initialData.slug}`
        : "https://www.banglaralonews.com"),
    commentText: "বিস্তারিত কমেন্টে",
  }));

  const [isRendering, setIsRendering] = useState(false);

  // Render canvas reactively
  const renderCanvas = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      setIsRendering(true);
      await renderPhotoCardToCanvas(canvasRef.current, config);
    } catch (err) {
      console.error("Canvas render error:", err);
    } finally {
      setIsRendering(false);
    }
  }, [config]);

  useEffect(() => {
    const timer = setTimeout(() => {
      renderCanvas();
    }, 40);
    return () => clearTimeout(timer);
  }, [renderCanvas]);

  // Download Handler
  const handleDownload = () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = canvasRef.current.toDataURL("image/png", 1.0);
      const safeSlug = (config.slug || config.titleText)
        .replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, "-")
        .slice(0, 40);
      const filename = `banglaralonews-${safeSlug || "photocard"}-${Date.now()}.png`;
      downloadDataUrl(dataUrl, filename);
    } catch (err) {
      console.error("Download error:", err);
      alert("কার্ড ডাউনলোড করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    }
  };

  const updateConfig = <K extends keyof PhotoCardConfig>(
    key: K,
    value: PhotoCardConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  // Helper for background color change with auto padding if in straight mode
  const handleBgColorChange = (newColor: string) => {
    setConfig((prev) => {
      const updates: Partial<PhotoCardConfig> = { backgroundColor: newColor };
      // If user is choosing a custom bg color in Default style while padding is 0 and straight,
      // auto set padding to 20 so the background color is immediately visible!
      if (prev.template === "anand_tv" && (!prev.imagePadding || prev.imagePadding === 0) && prev.imageRadius === "straight") {
        updates.imagePadding = 20;
        updates.imageRadius = "rounded";
      }
      return { ...prev, ...updates };
    });
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-gray-800 flex items-center justify-center p-3 sm:p-6 font-sans">
      <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-6 items-start justify-center">
        {/* LEFT COLUMN: Controls Sidebar */}
        <aside className="w-full md:w-[340px] lg:w-[360px] bg-white border border-gray-200/90 rounded-2xl shadow-sm overflow-hidden flex flex-col shrink-0">
          <div className="p-4 sm:p-5 overflow-y-auto max-h-[calc(100vh-3rem)] space-y-5">
            {/* Main Header */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h1 className="text-lg font-bold text-[#8B0000] tracking-wide">
                ফটো কার্ড স্টুডিও
              </h1>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-red-50 text-[#8B0000]">
                {config.template === "anand_tv" ? "ডিফল্ট (৪:৫)" : "বক্স (১:১)"}
              </span>
            </div>

            {/* SECTION 1: TEMPLATE */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#8B0000]">
                টেমপ্লেট নির্বাচন
              </label>
              <select
                value={config.template}
                onChange={(e) => {
                  const val = e.target.value as "anand_tv" | "banglar_alo";
                  updateConfig("template", val);
                  if (val === "banglar_alo") {
                    updateConfig("aspectRatio", "1:1");
                    updateConfig("imageRadius", "rounded");
                    updateConfig("showQrCode", true);
                  } else {
                    updateConfig("aspectRatio", "4:5");
                    updateConfig("imageRadius", "straight");
                    updateConfig("showQrCode", false);
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 bg-white focus:outline-none focus:border-[#8B0000]"
              >
                <option value="anand_tv">ডিফল্ট স্টাইল (৪:৫ পোর্ট্রেট)</option>
                <option value="banglar_alo">বক্স স্টাইল (১:১ স্কয়ার)</option>
              </select>
            </div>

            {/* SECTION 2: COLOR & THEMES */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-[#8B0000]">
                কালার ও থিম
              </label>

              {/* Quick Themes */}
              <div className="flex flex-wrap gap-1.5">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      updateConfig("primaryColor", preset.primary);
                      updateConfig("secondaryColor", preset.secondary);
                    }}
                    className="text-[10px] px-2 py-1 rounded-md border border-gray-200 hover:border-gray-400 bg-gray-50 flex items-center gap-1.5 transition"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: preset.primary }}
                    />
                    {preset.name}
                  </button>
                ))}
              </div>

              {/* Primary & Secondary Color */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <span className="text-[11px] text-gray-500 block">প্রধান কালার</span>
                  <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-2 py-1 bg-white">
                    <input
                      type="color"
                      value={config.primaryColor}
                      onInput={(e) => updateConfig("primaryColor", (e.target as HTMLInputElement).value)}
                      onChange={(e) => updateConfig("primaryColor", e.target.value)}
                      className="w-6 h-6 border-0 rounded cursor-pointer p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={config.primaryColor}
                      onChange={(e) => updateConfig("primaryColor", e.target.value)}
                      className="w-full text-xs font-mono text-gray-700 uppercase focus:outline-none bg-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-gray-500 block">সহায়ক কালার</span>
                  <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-2 py-1 bg-white">
                    <input
                      type="color"
                      value={config.secondaryColor}
                      onInput={(e) => updateConfig("secondaryColor", (e.target as HTMLInputElement).value)}
                      onChange={(e) => updateConfig("secondaryColor", e.target.value)}
                      className="w-6 h-6 border-0 rounded cursor-pointer p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={config.secondaryColor}
                      onChange={(e) => updateConfig("secondaryColor", e.target.value)}
                      className="w-full text-xs font-mono text-gray-700 uppercase focus:outline-none bg-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Background Color Behind Picture */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between items-center text-[11px] text-gray-500">
                  <span>ছবির পেছনের ব্যাকগ্রাউন্ড কালার</span>
                  {config.imagePadding === 0 && config.imageRadius === "straight" && (
                    <span className="text-[10px] text-amber-700">(মার্জিন অন হবে)</span>
                  )}
                </div>
                <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-2 py-1 bg-white">
                  <input
                    type="color"
                    value={config.backgroundColor || "#FFFFFF"}
                    onInput={(e) => handleBgColorChange((e.target as HTMLInputElement).value)}
                    onChange={(e) => handleBgColorChange(e.target.value)}
                    className="w-6 h-6 border-0 rounded cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={config.backgroundColor || "#FFFFFF"}
                    onChange={(e) => handleBgColorChange(e.target.value)}
                    className="w-full text-xs font-mono text-gray-700 uppercase focus:outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: IMAGE SIZE / CORNER / PADDING */}
            <div className="space-y-3 pt-1 border-t border-gray-100">
              <label className="block text-xs font-bold text-[#8B0000]">
                ছবির আকার ও অবস্থান
              </label>

              {/* Corner Style */}
              <div className="space-y-1">
                <span className="text-[11px] text-gray-600 block">ছবির কোণা</span>
                <select
                  value={config.imageRadius}
                  onChange={(e) =>
                    updateConfig(
                      "imageRadius",
                      e.target.value as "straight" | "rounded" | "padded"
                    )
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:border-[#8B0000]"
                >
                  <option value="straight">সোজা (ফুল ব্লিড)</option>
                  <option value="rounded">গোল কোণা</option>
                  <option value="padded">মার্জিন ও ব্যাকগ্রাউন্ড সহ</option>
                </select>
              </div>

              {/* Image Padding / Margin Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-gray-600">
                  <span>ছবির মার্জিন (ব্যাকগ্রাউন্ড দেখতে)</span>
                  <span className="font-mono text-gray-500">{config.imagePadding || 0}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="2"
                  value={config.imagePadding || 0}
                  onChange={(e) => updateConfig("imagePadding", parseInt(e.target.value))}
                  className="w-full accent-[#8B0000] h-1.5 bg-gray-200 rounded cursor-pointer"
                />
              </div>

              {/* Image Height Ratio in Default Style */}
              {config.template === "anand_tv" && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-gray-600">
                    <span>ছবির উচ্চতা অনুপাত</span>
                    <span className="font-mono text-gray-500">
                      {Math.round((config.imageHeightRatio || 0.65) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="48"
                    max="74"
                    step="1"
                    value={Math.round((config.imageHeightRatio || 0.65) * 100)}
                    onChange={(e) =>
                      updateConfig("imageHeightRatio", parseInt(e.target.value) / 100)
                    }
                    className="w-full accent-[#8B0000] h-1.5 bg-gray-200 rounded cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* SECTION 4: LOGO */}
            <div className="space-y-3 pt-1 border-t border-gray-100">
              <label className="block text-xs font-bold text-[#8B0000]">
                লোগো কাস্টমাইজেশন
              </label>

              {/* Logo Width */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-gray-600">
                  <span>Logo width</span>
                  <span className="font-mono text-gray-500">{config.logoWidth}px</span>
                </div>
                <input
                  type="range"
                  min="180"
                  max="520"
                  step="5"
                  value={config.logoWidth}
                  onChange={(e) => updateConfig("logoWidth", parseInt(e.target.value))}
                  className="w-full accent-[#8B0000] h-1.5 bg-gray-200 rounded cursor-pointer"
                />
              </div>

              {/* Logo Sliders: left/right & up/down */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-gray-600">
                    <span className="truncate">Logo left/right</span>
                    <span className="font-mono text-[10px] text-gray-400">{config.logoXOffset}</span>
                  </div>
                  <input
                    type="range"
                    min="-250"
                    max="250"
                    step="5"
                    value={config.logoXOffset}
                    onChange={(e) =>
                      updateConfig("logoXOffset", parseInt(e.target.value))
                    }
                    className="w-full accent-[#8B0000] h-1.5 bg-gray-200 rounded cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-gray-600">
                    <span className="truncate">Logo up/down</span>
                    <span className="font-mono text-[10px] text-gray-400">{config.logoYOffset}</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="5"
                    value={config.logoYOffset}
                    onChange={(e) =>
                      updateConfig("logoYOffset", parseInt(e.target.value))
                    }
                    className="w-full accent-[#8B0000] h-1.5 bg-gray-200 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Logo Badge Bg Toggle */}
              {config.template === "anand_tv" && (
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-[11px] text-gray-600">লোগোর সাদা ব্যাকগ্রাউন্ড ব্যাজ</span>
                  <input
                    type="checkbox"
                    checked={config.logoBadgeBg !== false}
                    onChange={(e) => updateConfig("logoBadgeBg", e.target.checked)}
                    className="w-4 h-4 accent-[#8B0000] rounded cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* SECTION 5: TITLE */}
            <div className="space-y-3 pt-1 border-t border-gray-100">
              <label className="block text-xs font-bold text-[#8B0000]">
                টাইটেল (শিরোনাম)
              </label>

              {/* Title Text Area */}
              <div className="space-y-1">
                <span className="text-[11px] text-gray-500 block">টাইটেল টেক্সট</span>
                <textarea
                  rows={3}
                  value={config.titleText}
                  onChange={(e) => updateConfig("titleText", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs text-gray-800 leading-relaxed focus:outline-none focus:border-[#8B0000]"
                />
              </div>

              {/* Title Size */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-gray-600">
                  <span>সাইজ</span>
                  <span className="font-mono text-gray-500">{config.titleFontSize}px</span>
                </div>
                <input
                  type="range"
                  min="28"
                  max="88"
                  step="1"
                  value={config.titleFontSize}
                  onChange={(e) =>
                    updateConfig("titleFontSize", parseInt(e.target.value))
                  }
                  className="w-full accent-[#8B0000] h-1.5 bg-gray-200 rounded cursor-pointer"
                />
              </div>

              {/* Title Up / Down */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-gray-600">
                  <span>Title up/down (উপরে / নিচে)</span>
                  <span className="font-mono text-gray-500">
                    {config.titleYOffset > 0
                      ? `+${config.titleYOffset}px নিচে`
                      : config.titleYOffset < 0
                      ? `${config.titleYOffset}px উপরে`
                      : "মাঝখানে"}
                  </span>
                </div>
                <input
                  type="range"
                  min="-150"
                  max="150"
                  step="2"
                  value={config.titleYOffset || 0}
                  onChange={(e) =>
                    updateConfig("titleYOffset", parseInt(e.target.value))
                  }
                  className="w-full accent-[#8B0000] h-1.5 bg-gray-200 rounded cursor-pointer"
                />
              </div>

              {/* Title Alignment (মাঝে / বামে) */}
              <div className="space-y-1">
                <span className="text-[11px] text-gray-500 block">অবস্থান (মাঝে / বামে)</span>
                <div className="flex rounded-lg border border-gray-300 p-0.5 bg-gray-100 text-xs">
                  <button
                    type="button"
                    onClick={() => updateConfig("titleAlign", "center")}
                    className={`flex-1 py-1 rounded text-center transition ${
                      config.titleAlign === "center"
                        ? "bg-[#8B0000] text-white font-bold"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    মাঝে
                  </button>
                  <button
                    type="button"
                    onClick={() => updateConfig("titleAlign", "left")}
                    className={`flex-1 py-1 rounded text-center transition ${
                      config.titleAlign === "left"
                        ? "bg-[#8B0000] text-white font-bold"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    বামে
                  </button>
                </div>
              </div>

              {/* Title Color & Background */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] text-gray-500 block">রং</span>
                  <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-2 py-1 bg-white">
                    <input
                      type="color"
                      value={config.titleColor}
                      onInput={(e) => updateConfig("titleColor", (e.target as HTMLInputElement).value)}
                      onChange={(e) => updateConfig("titleColor", e.target.value)}
                      className="w-6 h-6 border-0 rounded cursor-pointer p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={config.titleColor}
                      onChange={(e) => updateConfig("titleColor", e.target.value)}
                      className="w-full text-xs font-mono text-gray-700 uppercase focus:outline-none bg-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-gray-500 block">ব্যাকগ্রাউন্ড</span>
                  <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-2 py-1 bg-white">
                    <input
                      type="color"
                      value={
                        config.titleBgColor && config.titleBgColor.startsWith("#")
                          ? config.titleBgColor
                          : "#000000"
                      }
                      onInput={(e) => {
                        updateConfig("titleHasBg", true);
                        updateConfig("titleBgColor", (e.target as HTMLInputElement).value);
                      }}
                      onChange={(e) => {
                        updateConfig("titleHasBg", true);
                        updateConfig("titleBgColor", e.target.value);
                      }}
                      className="w-6 h-6 border-0 rounded cursor-pointer p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={config.titleBgColor}
                      onChange={(e) => {
                        updateConfig("titleHasBg", true);
                        updateConfig("titleBgColor", e.target.value);
                      }}
                      className="w-full text-xs font-mono text-gray-700 uppercase focus:outline-none bg-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Title Background Toggle */}
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-[11px] text-gray-600">টাইটেলে ব্যাকগ্রাউন্ড বক্স অন করুন</span>
                <input
                  type="checkbox"
                  checked={config.titleHasBg}
                  onChange={(e) => updateConfig("titleHasBg", e.target.checked)}
                  className="w-4 h-4 accent-[#8B0000] rounded cursor-pointer"
                />
              </div>
            </div>

            {/* SECTION 6: DATE & COMMENT (তারিখ ও বিস্তারিত কমেন্টে) */}
            <div className="space-y-3 pt-1 border-t border-gray-100">
              <label className="block text-xs font-bold text-[#8B0000]">
                তারিখ ও কমেন্ট
              </label>

              {/* Date Text */}
              <div className="space-y-1">
                <span className="text-[11px] text-gray-500 block">তারিখ</span>
                <input
                  type="text"
                  value={config.dateText}
                  onChange={(e) => updateConfig("dateText", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-[#8B0000]"
                />
              </div>

              {/* Comment Text */}
              <div className="space-y-1">
                <span className="text-[11px] text-gray-500 block">কমেন্ট টেক্সট</span>
                <input
                  type="text"
                  value={config.commentText}
                  onChange={(e) => updateConfig("commentText", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-[#8B0000]"
                />
              </div>

              {/* Comment Button Up / Down */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-gray-600">
                  <span>কমেন্ট / ফুটার up/down</span>
                  <span className="font-mono text-gray-500">
                    {config.commentYOffset || 0}px
                  </span>
                </div>
                <input
                  type="range"
                  min="-80"
                  max="80"
                  step="2"
                  value={config.commentYOffset || 0}
                  onChange={(e) =>
                    updateConfig("commentYOffset", parseInt(e.target.value))
                  }
                  className="w-full accent-[#8B0000] h-1.5 bg-gray-200 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* SECTION 7: VERIFICATION / QR CODE */}
            <div className="space-y-3 pt-1 border-t border-gray-100">
              <label className="block text-xs font-bold text-[#8B0000]">
                ভেরিফিকেশন
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showQrCode}
                  onChange={(e) => updateConfig("showQrCode", e.target.checked)}
                  className="rounded accent-[#8B0000]"
                />
                <span>QR কোড দেখান</span>
              </label>

              {config.showQrCode && (
                <div className="space-y-3 pt-1 border-t border-gray-100">
                  {/* QR Code Size */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-gray-600">
                      <span>QR কোড সাইজ</span>
                      <span className="font-mono text-gray-500">{config.qrCodeSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="70"
                      max="200"
                      step="5"
                      value={config.qrCodeSize || 110}
                      onChange={(e) =>
                        updateConfig("qrCodeSize", parseInt(e.target.value))
                      }
                      className="w-full accent-[#8B0000] h-1.5 bg-gray-200 rounded cursor-pointer"
                    />
                  </div>

                  {/* QR Sliders: left/right & up/down */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-gray-600">
                        <span className="truncate">QR left/right</span>
                        <span className="font-mono text-[10px] text-gray-400">
                          {config.qrXOffset || 0}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-350"
                        max="350"
                        step="5"
                        value={config.qrXOffset || 0}
                        onChange={(e) =>
                          updateConfig("qrXOffset", parseInt(e.target.value))
                        }
                        className="w-full accent-[#8B0000] h-1.5 bg-gray-200 rounded cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-gray-600">
                        <span className="truncate">QR up/down</span>
                        <span className="font-mono text-[10px] text-gray-400">
                          {config.qrYOffset || 0}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-350"
                        max="350"
                        step="5"
                        value={config.qrYOffset || 0}
                        onChange={(e) =>
                          updateConfig("qrYOffset", parseInt(e.target.value))
                        }
                        className="w-full accent-[#8B0000] h-1.5 bg-gray-200 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: Live Card Preview & Bottom Action Buttons */}
        <main className="flex-1 w-full flex flex-col items-center">
          {/* Card Preview Container */}
          <div className="w-full flex justify-center py-2">
            <div
              className="relative rounded-2xl shadow-xl overflow-hidden bg-white border border-gray-200"
              style={{
                maxWidth: config.aspectRatio === "1:1" ? "520px" : "440px",
                width: "100%",
              }}
            >
              <canvas
                ref={canvasRef}
                className="w-full h-auto block select-none"
                style={{
                  aspectRatio: config.aspectRatio === "1:1" ? "1 / 1" : "4 / 5",
                }}
              />

              {isRendering && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center z-10">
                  <div className="w-8 h-8 border-3 border-[#8B0000] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleDownload}
              className="px-6 py-2.5 rounded-lg bg-[#8B0000] hover:bg-[#720000] text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
            >
              কার্ড ডাউনলোড করুন
            </button>

            {config.slug ? (
              <Link
                href={`/news/${config.slug}`}
                className="px-6 py-2.5 rounded-lg bg-[#1E293B] hover:bg-[#0F172A] text-white font-bold text-sm shadow-md transition-colors text-center"
              >
                নিউজে ফিরে যান
              </Link>
            ) : (
              <Link
                href="/"
                className="px-6 py-2.5 rounded-lg bg-[#1E293B] hover:bg-[#0F172A] text-white font-bold text-sm shadow-md transition-colors text-center"
              >
                নিউজে ফিরে যান
              </Link>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
