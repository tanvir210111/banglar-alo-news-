"use client";

import React, { useState } from "react";
import Image from "next/image";
import { VideoItem } from "@/types/news";
import AdvertisementPlaceholder from "@/components/news/AdvertisementPlaceholder";
import { Play, Eye, Calendar, X, ExternalLink } from "lucide-react";

interface VideosClientProps {
  videos: VideoItem[];
}

export default function VideosClient({ videos }: VideosClientProps) {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  // Format views to Bengali
  const formatViews = (views?: number) => {
    if (!views) return "১.২ হাজার ভিউ";
    if (views >= 1000) {
      const k = (views / 1000).toFixed(1);
      const bnK = k
        .replace(/0/g, "০")
        .replace(/1/g, "১")
        .replace(/2/g, "২")
        .replace(/3/g, "৩")
        .replace(/4/g, "৪")
        .replace(/5/g, "৫")
        .replace(/6/g, "৬")
        .replace(/7/g, "৭")
        .replace(/8/g, "৮")
        .replace(/9/g, "৯");
      return `${bnK} হাজার ভিউ`;
    }
    return `${views} ভিউ`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-[#E2E6EB] p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Play className="w-6 h-6 text-[#1877F2] fill-current" />
              <h1 className="text-2xl font-extrabold text-[#202124]">
                ভিডিও সংবাদ ও ফেসবুক লাইভ
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#626B75]">
              বাংলার আলো নিউজ অফিসিয়াল ফেসবুক পেইজের তাজা ভিডিও প্রতিবেদন, সরাসরি মাঠপর্যায়ের বিশ্লেষণ ও লাইভ ফুটেজ।
            </p>
          </div>
          <a
            href="https://www.facebook.com/BanglarAloNewsBD/videos"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded shadow-xs transition-all shrink-0"
          >
            <span className="w-4 h-4 rounded-full bg-white text-[#1877F2] flex items-center justify-center text-[10px] font-black">
              f
            </span>
            <span>ফেসবুক পেজের সব ভিডিও</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Featured Video Player Box if selected */}
      {activeVideo && (
        <div className="bg-[#111827] text-white rounded-lg overflow-hidden shadow-xl p-4 sm:p-6 border border-gray-800 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-xs font-black">
                f
              </span>
              <h3 className="font-bold text-base sm:text-lg text-white">
                {activeVideo.title}
              </h3>
            </div>
            <button
              onClick={() => setActiveVideo(null)}
              className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white"
              aria-label="প্লেয়ার বন্ধ করুন"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="aspect-[16/9] w-full max-w-4xl mx-auto rounded overflow-hidden bg-black flex items-center justify-center">
            {activeVideo.videoUrl && activeVideo.videoUrl.includes("facebook.com") ? (
              <iframe
                src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
                  activeVideo.videoUrl
                )}&show_text=false&width=700`}
                width="100%"
                height="100%"
                style={{ border: "none", overflow: "hidden" }}
                scrolling="no"
                frameBorder="0"
                allowFullScreen={true}
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                className="w-full h-full"
                title={activeVideo.title}
              />
            ) : activeVideo.videoUrl && activeVideo.videoUrl.includes("youtube.com") ? (
              <iframe
                src={activeVideo.videoUrl.replace("watch?v=", "embed/")}
                width="100%"
                height="100%"
                style={{ border: "none" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                title={activeVideo.title}
              />
            ) : (
              <video
                src={activeVideo.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 max-w-4xl mx-auto">
            <p className="text-xs sm:text-sm text-gray-300">
              {activeVideo.summary}
            </p>
            <a
              href={activeVideo.videoUrl || "https://www.facebook.com/BanglarAloNewsBD/videos"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-bold px-3.5 py-2 rounded shrink-0 transition-colors"
            >
              <span>ফেসবুকে দেখুন</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Videos Grid or Clean Empty State */}
      {videos.length === 0 ? (
        <div className="py-16 px-4 text-center rounded-lg border border-dashed border-gray-300 bg-white flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-red-100 text-[#D62828] flex items-center justify-center mb-3">
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </div>
          <p className="text-base font-bold text-[#202124]">
            বর্তমানে কোনো ভিডিও সংবাদ উপলব্ধ নেই
          </p>
          <p className="text-xs text-gray-500 mt-1 mb-4">
            আমাদের অফিসিয়াল ফেসবুক পেজে সব ভিডিও সরাসরি দেখতে পারেন
          </p>
          <a
            href="https://www.facebook.com/BanglarAloNewsBD/videos"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-bold transition-all shadow-sm"
          >
            <span className="w-4 h-4 rounded-full bg-white text-[#1877F2] flex items-center justify-center text-[10px] font-black leading-none">
              f
            </span>
            <span>ফেসবুক ভিডিও পেজ ভিজিট করুন</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {videos.map((vid) => (
            <div
              key={vid.id}
              onClick={() => setActiveVideo(vid)}
              className="group bg-white rounded-lg border border-[#E2E6EB] overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col"
            >
              {/* Thumbnail */}
              <div className="relative aspect-[16/9] w-full bg-gray-900 overflow-hidden">
                <Image
                  src={vid.thumbnail}
                  alt={vid.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                </div>
                {vid.duration && (
                  <span className="absolute bottom-2.5 right-2.5 bg-black/80 text-white text-[10px] font-mono font-medium px-2 py-0.5 rounded">
                    {vid.duration}
                  </span>
                )}
                <span className="absolute top-2.5 left-2.5 bg-[#1877F2] text-white text-[11px] font-semibold px-2 py-0.5 rounded shadow flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-white text-[#1877F2] flex items-center justify-center text-[9px] font-black">
                    f
                  </span>
                  <span>{vid.category || "ফেসবুক ভিডিও"}</span>
                </span>
              </div>

              {/* Details */}
              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#202124] group-hover:text-[#1877F2] transition-colors leading-snug line-clamp-2 mb-1.5">
                    {vid.title}
                  </h3>
                  <p className="text-xs text-[#626B75] line-clamp-2 leading-relaxed">
                    {vid.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-[#626B75] mt-4 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-gray-400" />
                    {formatViews(vid.views)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {vid.date || "আজ"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
