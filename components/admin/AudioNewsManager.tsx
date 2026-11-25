"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Headphones,
  Sparkles,
  Play,
  Pause,
  Download,
  Loader2,
  Volume2,
  FileAudio,
  Radio,
  ExternalLink,
  RotateCcw,
  RefreshCw,
} from "lucide-react";
import { api } from "@/services/apiClient";
import { formatToBengaliDate } from "@/services/newsService";

export default function AudioNewsManager() {
  const [activeTab, setActiveTab] = useState<"tts" | "articles">("tts");
  const [textInput, setTextInput] = useState<string>(
    "বাংলার আলো নিউজ অনলাইন সংবাদ পোর্টালে আপনাকে স্বাগতম। আজকের প্রধান প্রধান সংবাদ ও সার্বিক পরিস্থিতি নিয়ে সাথেই থাকুন।"
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeAudioSrc, setActiveAudioSrc] = useState<string | null>(null);
  const [playingArticleId, setPlayingArticleId] = useState<string | null>(null);

  // Articles list for Audio Hub
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = () => {
    setIsLoadingArticles(true);
    api
      .get<any[]>("/news?limit=20&status=PUBLISHED")
      .then((res: any) => {
        if (res?.success && Array.isArray(res.data)) {
          setArticles(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingArticles(false));
  };

  const handleGenerateTTS = () => {
    if (!textInput.trim()) return;
    setIsGenerating(true);
    const streamUrl = `${apiBase}/news/tts?text=${encodeURIComponent(
      textInput.trim()
    )}`;
    setActiveAudioSrc(streamUrl);
    setPlayingArticleId(null);
    setIsGenerating(false);

    // Auto-play
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.load();
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }, 150);
  };

  const handlePlayArticleAudio = (article: any) => {
    const streamUrl = `${apiBase}/news/slug/${encodeURIComponent(
      article.slug
    )}/audio`;
    setActiveAudioSrc(streamUrl);
    setPlayingArticleId(article.id);

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.load();
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }, 150);
  };

  const toggleMasterPlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-[#18181B] via-[#27272A] to-[#09090B] rounded-2xl p-6 sm:p-7 text-white shadow-lg border border-[#3F3F46]/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30 mb-2.5">
              <Radio className="w-3.5 h-3.5" />
              <span>নিউজ অডিও ও এআই ভয়েস স্টুডিও v2.0</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              স্বয়ংক্রিয় টেক্সট-টু-স্পিচ (TTS) ও অডিও বুলেটিন
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl leading-relaxed">
              বাংলা সংবাদের জন্য রিয়েল-টাইম লাইভ ভয়েস স্ট্রিমিং। পাঠকরা যেকোনো নিউজ আর্টিকেলের ফুল অডিও শুনতে পারবেন এক ক্লিকেই।
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-6 flex items-center gap-2 border-b border-white/10 pb-0">
          <button
            type="button"
            onClick={() => setActiveTab("tts")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "tts"
                ? "border-orange-400 text-orange-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>লাইভ টেক্সট-টু-স্পিচ টেস্ট (TTS)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("articles")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "articles"
                ? "border-orange-400 text-orange-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <FileAudio className="w-3.5 h-3.5" />
            <span>নিউজ আর্টিকেল অডিও হাব ({articles.length})</span>
          </button>
        </div>
      </div>

      {/* Floating Global Audio Player Bar (When Audio Is Active) */}
      {activeAudioSrc && (
        <div className="sticky top-20 z-20 bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white p-3.5 sm:p-4 rounded-xl shadow-xl border border-blue-500/30 flex items-center justify-between gap-4 animate-slideDown">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={toggleMasterPlay}
              className="w-10 h-10 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white flex items-center justify-center shrink-0 shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>
            <div className="min-w-0">
              <span className="text-xs font-bold block truncate text-white">
                {playingArticleId
                  ? "আর্টিকেল অডিও প্লে হচ্ছে..."
                  : "কাস্টম টিটিএস ভয়েস প্লে হচ্ছে..."}
              </span>
              <span className="text-[11px] text-gray-300 block truncate">
                {activeAudioSrc}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={activeAudioSrc}
              download="banglar-alo-news-audio.mp3"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="এমপি৩ ডাউনলোড করুন"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>

          <audio
            ref={audioRef}
            src={activeAudioSrc}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        </div>
      )}

      {/* TAB 1: Live TTS Studio */}
      {activeTab === "tts" && (
        <div className="bg-white rounded-2xl border border-[#D5E1F5] shadow-xs p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0A2540]">
                বাংলা ভয়েস জেনারেটর (Google Neural Speech Engine)
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                নিচের বক্সে যেকোনো লেখা পেস্ট করে সরাসরি ভয়েস তৈরি করে শুনুন।
              </p>
            </div>
          </div>

          <div>
            <textarea
              rows={5}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="এখানে যেকোনো বাংলা টেক্সট লিখুন..."
              className="w-full p-4 rounded-xl border border-[#CBD5E1] text-sm text-[#1E293B] focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 focus:outline-none transition-all leading-relaxed"
            />
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-[#64748B]">নমুনা টেক্সট:</span>
            <button
              type="button"
              onClick={() =>
                setTextInput(
                  "বাংলার আলো নিউজ অনলাইন সংবাদ পোর্টালে আপনাকে স্বাগতম। আজকের প্রধান সংবাদ ও সার্বিক পরিস্থিতি নিয়ে বিস্তারিত শুনুন।"
                )
              }
              className="text-xs px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-[#334155] transition-colors"
            >
              ওয়েলকাম বার্তা
            </button>
            <button
              type="button"
              onClick={() =>
                setTextInput(
                  "আজকের আবহাওয়া বার্তা: সারাদেশে আবহাওয়া প্রধানত শুষ্ক থাকতে পারে। তবে কোথাও কোথাও আকাশ আংশিক মেঘলা থাকতে পারে।"
                )
              }
              className="text-xs px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-[#334155] transition-colors"
            >
              আবহাওয়া বুলেটিন
            </button>
          </div>

          <div className="pt-2 flex items-center justify-end">
            <button
              type="button"
              disabled={isGenerating || !textInput.trim()}
              onClick={handleGenerateTTS}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold bg-[#EA580C] hover:bg-[#C2410C] text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>ভয়েস তৈরি হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>ভয়েস শুনুন (Live TTS)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: News Articles Audio Hub */}
      {activeTab === "articles" && (
        <div className="bg-white rounded-2xl border border-[#D5E1F5] shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0A2540]">
                সকল প্রকাশিত খবরের অডিও রিডার
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                যেকোনো খবরের পাশে "▶ শুনুন" বাটনে চাপ দিলে ব্যাকএন্ড স্বয়ংক্রিয়ভাবে অডিও পড়ে শোনাবে।
              </p>
            </div>
            <button
              type="button"
              onClick={fetchArticles}
              disabled={isLoadingArticles}
              className="p-2 rounded-lg border border-[#CBD5E1] text-[#64748B] hover:text-[#0A2540] hover:bg-gray-50 transition-colors"
              title="রিলোড করুন"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoadingArticles ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          {isLoadingArticles ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#EA580C]" />
              <span className="text-xs">খবরের তালিকা লোড হচ্ছে...</span>
            </div>
          ) : articles.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {articles.map((item) => {
                const isItemPlaying =
                  playingArticleId === item.id && isPlaying;
                return (
                  <div
                    key={item.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/60 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-orange-50 text-[#EA580C] flex items-center justify-center shrink-0 mt-0.5">
                        <Headphones className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[#0A2540] hover:text-[#3858F6] line-clamp-1 block">
                          {item.title}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-[#64748B] mt-0.5">
                          <span>{item.category?.name || "জাতীয়"}</span>
                          <span>•</span>
                          <span>{formatToBengaliDate(item.publishedDate || item.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handlePlayArticleAudio(item)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isItemPlaying
                            ? "bg-[#EA580C] text-white shadow-sm"
                            : "bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5] hover:bg-[#FFEDD5]"
                        }`}
                      >
                        {isItemPlaying ? (
                          <>
                            <Pause className="w-3.5 h-3.5 fill-current" />
                            <span>প্লে হচ্ছে</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>অডিও শুনুন</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`/news/${item.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                        title="সাইটে দেখুন"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-gray-400">
              কোনো প্রকাশিত আর্টিকেল পাওয়া যায়নি
            </div>
          )}
        </div>
      )}
    </div>
  );
}

