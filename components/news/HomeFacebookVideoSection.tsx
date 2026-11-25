"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Play, Eye, ExternalLink, X, Clock } from "lucide-react";
import { VideoItem } from "@/types/news";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  videos: VideoItem[];
  facebookPageUrl?: string;
}

export default function HomeFacebookVideoSection({
  videos,
  facebookPageUrl = "https://www.facebook.com/BanglarAloNewsBD/videos",
}: Props) {
  const { isBn } = useLanguage();
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  // Format views
  const formatViews = (views?: number) => {
    if (!views) return isBn ? "১.২ হাজার ভিউ" : "1.2K views";
    if (views >= 1000) {
      const k = (views / 1000).toFixed(1);
      if (!isBn) return `${k}K views`;
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
    return isBn ? `${views} ভিউ` : `${views} views`;
  };

  return (
    <div className="space-y-4 w-full">
      {/* Facebook Video Cards or Clean Empty State */}
      {videos.length === 0 ? (
        <div className="py-12 px-4 text-center rounded border border-dashed border-gray-700 bg-gray-900/40 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-red-600/20 text-[#D62828] flex items-center justify-center mb-3">
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </div>
          <p className="text-sm sm:text-base font-semibold text-gray-200">
            {isBn ? "বর্তমানে কোনো ভিডিও সংবাদ উপলব্ধ নেই" : "No video news available at the moment"}
          </p>
          <p className="text-xs text-gray-400 mt-1 mb-4">
            {isBn
              ? "আমাদের অফিসিয়াল ফেসবুক পেজে সব ভিডিও সরাসরি দেখতে পারেন"
              : "Watch all video reports directly on our official Facebook page"}
          </p>
          <a
            href={facebookPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-bold transition-all shadow-sm"
          >
            <span className="w-4 h-4 rounded-full bg-white text-[#1877F2] flex items-center justify-center text-[10px] font-black leading-none">
              f
            </span>
            <span>{isBn ? "ফেসবুক ভিডিও পেজ ভিজিট করুন" : "Visit Facebook Video Page"}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.slice(0, 6).map((vid) => (
            <div
              key={vid.id}
              onClick={() => setActiveVideo(vid)}
              className="bg-gray-800/70 hover:bg-gray-800 p-3 rounded border border-gray-700/70 hover:border-[#1877F2]/60 transition-all cursor-pointer group flex flex-col justify-between"
            >
              {/* Thumbnail with Facebook Play Overlay */}
              <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded bg-black mb-2.5">
                {vid.thumbnail ? (
                  <Image
                    src={vid.thumbnail}
                    alt={vid.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center text-gray-500">
                    <Play className="w-8 h-8 opacity-40" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#166FE5] transition-all">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
                {vid.duration && (
                  <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                    {vid.duration}
                  </span>
                )}
              </div>

              {/* Video Details */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#1877F2] bg-[#1877F2]/15 px-1.5 py-0.5 rounded">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[9px] font-black leading-none">
                        f
                      </span>
                      <span>ফেসবুক ভিডিও</span>
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-300 line-clamp-2 leading-snug transition-colors mb-2">
                    {vid.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-auto pt-2 border-t border-gray-700/50">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-gray-400" />
                    {formatViews(vid.views)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    {vid.date || "আজ"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Official Facebook Video Page CTA Banner (Shown when videos are present) */}
      {videos.length > 0 && (
        <a
          href={facebookPageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-3 rounded bg-[#1877F2]/15 hover:bg-[#1877F2]/25 border border-[#1877F2]/40 text-blue-200 hover:text-white text-xs font-bold transition-all flex items-center justify-between group"
        >
          <span className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-xs font-black">
              f
            </span>
            <span>ফেসবুক পেজে আরও ভিডিও ও লাইভ সম্প্রচার দেখুন</span>
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-blue-300 group-hover:translate-x-0.5 transition-transform" />
        </a>
      )}

      {/* Interactive Video Player Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="bg-[#1a2332] text-white rounded-lg border border-gray-700 w-full max-w-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 bg-[#111827] flex items-center justify-between border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-xs font-black">
                  f
                </div>
                <h4 className="font-bold text-sm sm:text-base text-white line-clamp-1">
                  {activeVideo.title}
                </h4>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="p-1.5 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                aria-label="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Box */}
            <div className="relative aspect-[16/9] w-full bg-black flex items-center justify-center">
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
                  title={activeVideo.title}
                  className="w-full h-full"
                />
              ) : activeVideo.videoUrl && (activeVideo.videoUrl.includes("youtube.com") || activeVideo.videoUrl.includes("youtu.be")) ? (
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideo.videoUrl.split("v=")[1]?.split("&")[0] || ""}?autoplay=1`}
                  width="100%"
                  height="100%"
                  style={{ border: "none" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={activeVideo.title}
                  className="w-full h-full"
                />
              ) : (
                <div className="text-center p-6 text-gray-400">
                  <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">ভিডিওটি ফেসবুকে সরাসরি দেখতে নিচের লিংকে ক্লিক করুন:</p>
                  <a
                    href={facebookPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 px-4 py-1.5 bg-[#1877F2] text-white text-xs font-bold rounded"
                  >
                    <span>ফেসবুকে দেখুন</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#111827] flex items-center justify-between text-xs text-gray-400">
              <span className="font-semibold text-white">বাংলার আলো নিউজ</span>
              <a
                href={activeVideo.videoUrl || facebookPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1877F2] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>মূল ফেসবুক পোস্টে যান</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
