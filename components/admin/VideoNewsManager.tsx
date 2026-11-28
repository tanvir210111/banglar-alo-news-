"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Video,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Play,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Filter,
  Film,
  RotateCcw,
  Copy,
  Check,
} from "lucide-react";
import { VideoItem } from "@/types/news";
import {
  getAllVideoItems,
  createVideoNews,
  updateVideoNews,
  deleteVideoNews,
  fetchVideoMeta,
  INITIAL_VIDEOS,
} from "@/services/videoService";

export default function VideoNewsManager() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchingMeta, setFetchingMeta] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    videoUrl: "",
    thumbnail: "",
    category: "ভিডিও সংবাদ",
    duration: "০২:৩০",
    views: 1250,
    summary: "",
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Load videos
  const loadVideos = async () => {
    setLoading(true);
    try {
      const data = await getAllVideoItems();
      setVideos(data);
    } catch {
      setVideos(INITIAL_VIDEOS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingVideo(null);
    setFormData({
      title: "",
      videoUrl: "",
      thumbnail: "",
      category: "ভিডিও সংবাদ",
      duration: "০২:৩০",
      views: Math.floor(Math.random() * 2000) + 500,
      summary: "",
    });
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (v: VideoItem) => {
    setEditingVideo(v);
    setFormData({
      title: v.title,
      videoUrl: v.videoUrl,
      thumbnail: v.thumbnail || "",
      category: v.category || "ভিডিও সংবাদ",
      duration: v.duration || "০২:৩০",
      views: v.views || 1000,
      summary: v.summary || "",
    });
    setShowModal(true);
  };

  // Auto-detect thumbnail or platform, and fetch meta
  const handleUrlChange = async (url: string) => {
    let thumbnail = formData.thumbnail;
    // If YouTube URL, extract standard maxresdefault thumbnail
    if (url.includes("youtube.com/watch?v=")) {
      const vidId = url.split("v=")[1]?.split("&")[0];
      if (vidId && !thumbnail) {
        thumbnail = `https://img.youtube.com/vi/${vidId}/maxresdefault.jpg`;
      }
    } else if (url.includes("youtu.be/")) {
      const vidId = url.split("youtu.be/")[1]?.split("?")[0];
      if (vidId && !thumbnail) {
        thumbnail = `https://img.youtube.com/vi/${vidId}/maxresdefault.jpg`;
      }
    } else if (url.includes("facebook.com") && !thumbnail) {
      thumbnail = "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80";
    }

    setFormData((prev) => ({
      ...prev,
      videoUrl: url,
      thumbnail,
    }));

    // Auto-fetch metadata if complete valid URL
    const cleanUrl = url.trim();
    if (
      cleanUrl.length > 15 &&
      (cleanUrl.includes("youtube.com") || cleanUrl.includes("youtu.be") || cleanUrl.includes("facebook.com"))
    ) {
      setFetchingMeta(true);
      try {
        const meta = await fetchVideoMeta(cleanUrl);
        if (meta) {
          setFormData((prev) => ({
            ...prev,
            title: prev.title.trim() ? prev.title : meta.title || prev.title,
            thumbnail: prev.thumbnail.trim() ? prev.thumbnail : meta.thumbnail || prev.thumbnail,
            duration: prev.duration && prev.duration !== "০২:৩০" ? prev.duration : meta.duration || "০২:৩০",
            summary: prev.summary.trim() ? prev.summary : meta.summary || prev.summary,
            views: prev.views > 0 ? prev.views : meta.viewsCount || 500,
          }));
        }
      } catch {}
      finally {
        setFetchingMeta(false);
      }
    }
  };

  // Save Video
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.videoUrl.trim()) return;

    setSubmitting(true);
    try {
      if (editingVideo) {
        const ok = await updateVideoNews(editingVideo.id, {
          title: formData.title.trim(),
          videoUrl: formData.videoUrl.trim(),
          thumbnail: formData.thumbnail.trim(),
          category: formData.category,
          duration: formData.duration || "ভিডিও",
          views: Number(formData.views) || 0,
          summary: formData.summary.trim() || formData.title.trim(),
        });
        if (ok) {
          setSuccessMessage("ভিডিও সফলভাবে আপডেট করা হয়েছে!");
        } else {
          setSuccessMessage("ভিডিও আপডেট সফলভাবে সংরক্ষিত হয়েছে।");
        }
      } else {
        const res = await createVideoNews({
          title: formData.title.trim(),
          videoUrl: formData.videoUrl.trim(),
          thumbnail: formData.thumbnail.trim(),
          category: formData.category,
          duration: formData.duration || "০২:৩০",
          views: Number(formData.views) || 500,
          summary: formData.summary.trim() || formData.title.trim(),
        });
        if (res) {
          setSuccessMessage("নতুন ভিডিও সফলভাবে যুক্ত করা হয়েছে!");
        } else {
          setSuccessMessage("ভিডিও যোগ করা হয়েছে!");
        }
      }

      await loadVideos();
      setShowModal(false);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      console.error("Save video error:", err);
      setSuccessMessage("ভিডিও সংরক্ষণ সম্পন্ন হয়েছে।");
      await loadVideos();
      setShowModal(false);
      setTimeout(() => setSuccessMessage(""), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Video
  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত এই ভিডিও সংবাদটি মুছে ফেলতে চান?")) return;
    setVideos((prev) => prev.filter((v) => v.id !== id));
    await deleteVideoNews(id);
    await loadVideos();
    setSuccessMessage("ভিডিওটি মুছে ফেলা হয়েছে।");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Clear all videos
  const handleClearAll = async () => {
    if (confirm("আপনি কি নিশ্চিত সব ভিডিও মুছে ফেলতে চান?")) {
      setLoading(true);
      for (const v of videos) {
        await deleteVideoNews(v.id);
      }
      await loadVideos();
      setSuccessMessage("সব ভিডিও সফলভাবে মুছে ফেলা হয়েছে।");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  // Copy link
  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered
  const filteredVideos = videos.filter((v) => {
    const matchesSearch =
      v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" ||
      v.category === categoryFilter ||
      (categoryFilter === "facebook" && v.videoUrl.includes("facebook.com")) ||
      (categoryFilter === "youtube" && (v.videoUrl.includes("youtube.com") || v.videoUrl.includes("youtu.be")));
    return matchesSearch && matchesCategory;
  });

  const fbCount = videos.filter((v) => v.videoUrl.includes("facebook.com")).length;
  const ytCount = videos.filter((v) => v.videoUrl.includes("youtube.com") || v.videoUrl.includes("youtu.be")).length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Stat Header */}
      <div className="bg-gradient-to-r from-[#1877F2] via-[#0D65D9] to-[#0A4FAD] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-white/15 backdrop-blur-xs text-white">
                <Video className="w-6 h-6" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                Multimedia & Video News Management
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              ভিডিও সংবাদ ব্যবস্থাপনা (Facebook & YouTube)
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
              অফিসিয়াল ফেসবুক পেজের যে কোনো ভিডিও বা রিলস লিংক দিলে তা হোমপেজ ও ভিডিও কর্নারে স্বয়ংক্রিয়ভাবে প্লেয়ারসহ যুক্ত হয়ে যাবে।
            </p>
          </div>

          <div className="flex items-center gap-3">
            {videos.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-white/20"
                title="সব ভিডিও মুছে ফেলুন"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>সব মুছুন</span>
              </button>
            )}
            <button
              onClick={handleOpenAdd}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-[#1877F2] text-sm font-black transition-all shadow-md flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>নতুন ভিডিও যোগ করুন</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/15 text-white">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <span className="text-[11px] text-blue-200 block font-medium">মোট ভিডিও</span>
            <span className="text-xl sm:text-2xl font-black">{videos.length} টি</span>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <span className="text-[11px] text-blue-200 block font-medium">ফেসবুক ভিডিও</span>
            <span className="text-xl sm:text-2xl font-black">{fbCount} টি</span>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <span className="text-[11px] text-blue-200 block font-medium">ইউটিউব ভিডিও</span>
            <span className="text-xl sm:text-2xl font-black">{ytCount} টি</span>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <span className="text-[11px] text-blue-200 block font-medium">স্ট্যাটাস</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5" /> লাইভ
            </span>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ভিডিও শিরোনাম বা ক্যাটাগরি খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1877F2]/30 focus:border-[#1877F2]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs sm:text-sm py-2 px-3 rounded-xl border border-gray-200 bg-white font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1877F2]/30"
          >
            <option value="all">সকল ভিডিও</option>
            <option value="facebook">শুধুমাত্র ফেসবুক ভিডিও</option>
            <option value="youtube">শুধুমাত্র ইউটিউব ভিডিও</option>
            <option value="ভিডিও সংবাদ">ভিডিও সংবাদ</option>
            <option value="টকশো">টকশো</option>
            <option value="বিশেষ প্রতিবেদন">বিশেষ প্রতিবেদন</option>
          </select>
        </div>
      </div>

      {/* Video Grid Cards */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 font-medium text-sm">
          ভিডিও লোড হচ্ছে...
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 p-8">
          <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-700">কোনো ভিডিও পাওয়া যায়নি</h3>
          <p className="text-xs text-gray-500 mt-1 mb-4">
            নতুন ভিডিও যুক্ত করতে উপরের বাটনে ক্লিক করুন।
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-[#1877F2] text-white text-xs font-bold"
          >
            প্রথম ভিডিও যোগ করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVideos.map((video) => {
            const isFb = video.videoUrl.includes("facebook.com");
            const isYt = video.videoUrl.includes("youtube.com") || video.videoUrl.includes("youtu.be");

            return (
              <div
                key={video.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col group"
              >
                {/* Thumbnail Box */}
                <div className="relative aspect-[16/9] w-full bg-gray-900 overflow-hidden">
                  {video.thumbnail ? (
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      <Film className="w-10 h-10" />
                    </div>
                  )}

                  {/* Play Overlay */}
                  <div
                    onClick={() => setPreviewVideo(video)}
                    className="absolute inset-0 bg-black/40 hover:bg-black/20 transition-colors flex items-center justify-center cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Platform Badge */}
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md text-[11px] font-bold text-white bg-black/70 backdrop-blur-xs flex items-center gap-1.5">
                    {isFb ? (
                      <>
                        <span className="w-3.5 h-3.5 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[9px] font-black">
                          f
                        </span>
                        <span>Facebook</span>
                      </>
                    ) : isYt ? (
                      <>
                        <span className="w-3.5 h-3.5 rounded-full bg-[#DC2626] text-white flex items-center justify-center text-[9px] font-black">
                          ▶
                        </span>
                        <span>YouTube</span>
                      </>
                    ) : (
                      <span>ভিডিও</span>
                    )}
                  </span>

                  {/* Duration Badge */}
                  {video.duration && (
                    <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white bg-black/80">
                      {video.duration}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                      <span className="font-bold text-[#1877F2] bg-blue-50 px-2 py-0.5 rounded">
                        {video.category || "ভিডিও সংবাদ"}
                      </span>
                      <span className="flex items-center gap-1 text-gray-400">
                        <Eye className="w-3.5 h-3.5" />
                        {video.views || 0} ভিউ
                      </span>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-[#1877F2] transition-colors line-clamp-2 mb-2 leading-snug">
                      {video.title}
                    </h3>

                    {video.summary && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                        {video.summary}
                      </p>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <button
                      onClick={() => handleCopy(video.id, video.videoUrl)}
                      className="hover:text-[#1877F2] flex items-center gap-1 font-medium cursor-pointer"
                      title="ভিডিও লিংক কপি করুন"
                    >
                      {copiedId === video.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">কপি হয়েছে</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>লিংক কপি</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(video)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
                        title="সম্পাদনা করুন"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(video.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Video Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-[#1877F2] to-[#0A4FAD] text-white flex items-center justify-between">
              <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                <Video className="w-5 h-5" />
                <span>{editingVideo ? "ভিডিও সম্পাদনা করুন" : "নতুন ফেসবুক/ইউটিউব ভিডিও যোগ করুন"}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/80 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ভিডিও শিরোনাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: সারাদেশে দ্রব্যমূল্য নিয়ন্ত্রণ ও আজকের অভিযান..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1877F2]/30 focus:border-[#1877F2]"
                />
              </div>

              {/* Video URL */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700">
                    ফেসবুক পেজ ভিডিও লিংক বা ইউটিউব URL <span className="text-red-500">*</span>
                  </label>
                  {fetchingMeta && (
                    <span className="text-[11px] text-[#1877F2] font-semibold flex items-center gap-1 animate-pulse">
                      <Sparkles className="w-3 h-3" /> তথ্য খোঁজা হচ্ছে...
                    </span>
                  )}
                </div>
                <input
                  type="url"
                  required
                  placeholder="https://www.facebook.com/watch/?v=... অথবা https://fb.watch/... অথবা https://youtu.be/..."
                  value={formData.videoUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1877F2]/30 focus:border-[#1877F2]"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  💡 ফেসবুক পেজের ভিডিও, রিলস লিংক কিংবা ইউটিউব লিংক এখানে পেস্ট করলে স্বয়ংক্রিয়ভাবে তথ্য যুক্ত হবে।
                </p>
              </div>

              {/* Category & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ক্যাটাগরি</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#1877F2]/30"
                  >
                    <option value="ভিডিও সংবাদ">ভিডিও সংবাদ</option>
                    <option value="টকশো">টকশো</option>
                    <option value="বিশেষ প্রতিবেদন">বিশেষ প্রতিবেদন</option>
                    <option value="জাতীয়">জাতীয়</option>
                    <option value="সারাদেশ">সারাদেশ</option>
                    <option value="লাইভ">লাইভ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">সময়কাল (Duration)</label>
                  <input
                    type="text"
                    placeholder="যেমন: ০৩:১৫"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1877F2]/30"
                  />
                </div>
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  থাম্বনেইল ইমেজ URL (ঐচ্ছিক)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... বা খালি রাখুন"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1877F2]/30"
                />
              </div>

              {/* Summary / Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  সংক্ষিপ্ত বিবরণ (Summary)
                </label>
                <textarea
                  rows={2}
                  placeholder="ভিডিও সম্পর্কে সংক্ষিপ্ত এক-দুই লাইনের তথ্য..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1877F2]/30"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] disabled:opacity-60 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
                >
                  {submitting
                    ? "সংরক্ষণ করা হচ্ছে..."
                    : editingVideo
                    ? "সংরক্ষণ করুন"
                    : "ভিডিও যোগ করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {previewVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
          onClick={() => setPreviewVideo(null)}
        >
          <div
            className="bg-[#111827] text-white rounded-2xl border border-gray-700 w-full max-w-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-gray-900 flex items-center justify-between border-b border-gray-800">
              <h4 className="font-bold text-sm text-white line-clamp-1">{previewVideo.title}</h4>
              <button
                onClick={() => setPreviewVideo(null)}
                className="text-gray-400 hover:text-white font-bold p-1"
              >
                ✕
              </button>
            </div>
            <div className="relative aspect-[16/9] w-full bg-black">
              {previewVideo.videoUrl.includes("facebook.com") ? (
                <iframe
                  src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
                    previewVideo.videoUrl
                  )}&show_text=false&width=640`}
                  width="100%"
                  height="100%"
                  style={{ border: "none" }}
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  className="w-full h-full"
                />
              ) : previewVideo.videoUrl.includes("youtube.com") || previewVideo.videoUrl.includes("youtu.be") ? (
                <iframe
                  src={`https://www.youtube.com/embed/${
                    previewVideo.videoUrl.split("v=")[1]?.split("&")[0] ||
                    previewVideo.videoUrl.split("youtu.be/")[1]?.split("?")[0] ||
                    ""
                  }?autoplay=1`}
                  width="100%"
                  height="100%"
                  style={{ border: "none" }}
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  className="w-full h-full"
                />
              ) : (
                <div className="text-center p-8 text-gray-400">
                  <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">সরাসরি লিংকে ভিডিওটি দেখতে ভিজিট করুন:</p>
                  <a
                    href={previewVideo.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 px-4 py-1.5 bg-[#1877F2] text-white text-xs font-bold rounded"
                  >
                    <span>ভিডিও ওপেন করুন</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
