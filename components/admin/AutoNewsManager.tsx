"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Zap,
  Globe,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Edit3,
  Send,
  FileCheck,
  AlertCircle,
  Sparkles,
  Play,
  Pause,
  RefreshCw,
  Terminal,
  Settings as SettingsIcon,
  Sliders,
  Layers,
  Clock,
  Check,
  X,
  Plus,
  Trash2,
  Eye,
  Link2,
} from "lucide-react";
import { api, clearApiCache } from "@/services/apiClient";
import { getCategories, cleanNewsImageUrl, broadcastNewsUpdate } from "@/services/newsService";
import { Category } from "@/types/news";
import {
  AutoNewsStats,
  AutoNewsSettings,
  AutoNewsSource,
  AutoNewsLog,
  AutoNewsRecentPost,
} from "@/types/autoNews";
import {
  getAutoNewsStats,
  toggleAutoNews,
  runAutoNewsNow,
  getAutoNewsSettings,
  updateAutoNewsSettings,
  getAutoNewsSources,
  addAutoNewsSource,
  updateAutoNewsSource,
  deleteAutoNewsSource,
  getAutoNewsLogs,
  getRecentAutoPostedNews,
} from "@/services/autoNewsService";

export default function AutoNewsManager() {
  const router = useRouter();

  // Active Tab
  const [activeTab, setActiveTab] = useState<"sources" | "settings" | "logs" | "recent" | "manual">("sources");

  // Top Stats & Status
  const [stats, setStats] = useState<AutoNewsStats | null>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState<boolean>(false);
  const [isRunningNow, setIsRunningNow] = useState<boolean>(false);
  const [runMessage, setRunMessage] = useState<string | null>(null);

  // Tab 1: Sources Data
  const [sources, setSources] = useState<AutoNewsSource[]>([]);
  const [isSourcesLoading, setIsSourcesLoading] = useState<boolean>(false);
  const [togglingSourceId, setTogglingSourceId] = useState<string | null>(null);

  // Tab 2: Settings Data
  const [settings, setSettings] = useState<AutoNewsSettings | null>(null);
  const [isSettingsLoading, setIsSettingsLoading] = useState<boolean>(false);
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState<string | null>(null);
  const [settingsErrorMessage, setSettingsErrorMessage] = useState<string | null>(null);

  // Tab 3: Logs Data
  const [logs, setLogs] = useState<AutoNewsLog[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState<boolean>(false);

  // Tab 4: Recent Posts
  const [recentPosts, setRecentPosts] = useState<AutoNewsRecentPost[]>([]);
  const [isRecentLoading, setIsRecentLoading] = useState<boolean>(false);

  // Tab 5: Manual Single Link Fetcher (Existing)
  const [url, setUrl] = useState<string>("");
  const [isManualLoading, setIsManualLoading] = useState<boolean>(false);
  const [manualError, setManualError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [manualSuccessMessage, setManualSuccessMessage] = useState<string | null>(null);
  const [isFetchingImage, setIsFetchingImage] = useState<boolean>(false);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [isBreakingNews, setIsBreakingNews] = useState<boolean>(false);
  const [isSpecialNews, setIsSpecialNews] = useState<boolean>(false);

  // Fetch Stats
  const loadStats = useCallback(async () => {
    const s = await getAutoNewsStats();
    if (s) setStats(s);
  }, []);

  // Fetch Sources
  const loadSources = useCallback(async () => {
    setIsSourcesLoading(true);
    const data = await getAutoNewsSources();
    setSources(data);
    setIsSourcesLoading(false);
  }, []);

  // Fetch Settings
  const loadSettings = useCallback(async () => {
    setIsSettingsLoading(true);
    const data = await getAutoNewsSettings();
    if (data) setSettings(data);
    setIsSettingsLoading(false);
  }, []);

  // Fetch Logs
  const loadLogs = useCallback(async () => {
    setIsLogsLoading(true);
    const data = await getAutoNewsLogs();
    setLogs(data);
    setIsLogsLoading(false);
  }, []);

  // Fetch Recent Posts
  const loadRecentPosts = useCallback(async () => {
    setIsRecentLoading(true);
    const data = await getRecentAutoPostedNews();
    setRecentPosts(data);
    setIsRecentLoading(false);
  }, []);

  // Initial Data Fetch
  useEffect(() => {
    loadStats();
    loadSources();
    getCategories().then((cats) => {
      if (cats && cats.length > 0) setCategoriesList(cats);
    });

    // Auto refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [loadStats, loadSources]);

  // Tab switch fetch
  useEffect(() => {
    if (activeTab === "settings") loadSettings();
    if (activeTab === "logs") loadLogs();
    if (activeTab === "recent") loadRecentPosts();
  }, [activeTab, loadSettings, loadLogs, loadRecentPosts]);

  // Toggle ON/OFF Autopilot
  const handleToggleAutopilot = async () => {
    if (!stats) return;
    const nextStatus = stats.status === "ON" ? "OFF" : "ON";
    setIsTogglingStatus(true);
    const ok = await toggleAutoNews(nextStatus);
    if (ok) {
      setStats((prev) => (prev ? { ...prev, status: nextStatus, isEnabled: nextStatus === "ON" } : null));
    }
    setIsTogglingStatus(false);
  };

  // Run Now (Instant Manual Execution Cycle)
  const handleRunNow = async () => {
    setIsRunningNow(true);
    setRunMessage(null);
    try {
      const res = await runAutoNewsNow();
      setRunMessage(res.message || (res.success ? "সাইকেল সফলভাবে এক্সিকিউট হয়েছে।" : "সাইকেল সম্পন্ন হয়নি।"));
      loadStats();
      if (activeTab === "logs") loadLogs();
      if (activeTab === "recent") loadRecentPosts();
    } catch (err: any) {
      setRunMessage(err?.message || "ব্যর্থ হয়েছে।");
    } finally {
      setIsRunningNow(false);
    }
  };

  // Toggle Source Active Status
  const handleToggleSource = async (sourceId: string, currentActive: boolean) => {
    setTogglingSourceId(sourceId);
    const ok = await updateAutoNewsSource(sourceId, { isActive: !currentActive });
    if (ok) {
      setSources((prev) =>
        prev.map((s) => (s.id === sourceId ? { ...s, isActive: !currentActive } : s))
      );
    }
    setTogglingSourceId(null);
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSavingSettings(true);
    setSettingsSavedMessage(null);
    setSettingsErrorMessage(null);
    try {
      const res = await updateAutoNewsSettings(settings);
      if (res.success) {
        clearApiCache();
        const fresh = await getAutoNewsSettings();
        if (fresh) {
          setSettings(fresh);
        } else if (res.data) {
          setSettings(res.data);
        }
        setSettingsSavedMessage("সেটিংস সফলভাবে সংরক্ষিত হয়েছে।");
        // Reload stats so top banner interval updates immediately
        await loadStats();
        setTimeout(() => setSettingsSavedMessage(null), 4000);
      } else {
        setSettingsErrorMessage(res.message || "সেটিংস সংরক্ষণ ব্যর্থ হয়েছে।");
      }
    } catch (err: any) {
      setSettingsErrorMessage("ত্রুটি: " + (err.message || String(err)));
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Manual Fetcher Handler (Existing tool)
  const handleManualFetch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    setIsManualLoading(true);
    setManualError(null);
    setManualSuccessMessage(null);
    setExtractedData(null);

    try {
      const endpoint = `/news/fetch-external?url=${encodeURIComponent(url.trim())}`;
      let data: any = await api.get<any>(endpoint);

      if (!data?.success) {
        try {
          const directUrl = `http://localhost:5001/api/v1/news/fetch-external?url=${encodeURIComponent(url.trim())}`;
          const res = await fetch(directUrl);
          if (res.ok) data = await res.json();
        } catch {}
      }

      if (data?.success && data?.data) {
        const item = data.data;
        let rawImage = cleanNewsImageUrl(
          typeof item.featuredImage === "string" ? item.featuredImage : item.featuredImage?.url || ""
        );

        if (!rawImage || rawImage.includes("/null") || rawImage.includes("undefined")) {
          try {
            const imgRes = await fetch(`/api/extract-image?url=${encodeURIComponent(url.trim())}`);
            const imgData = await imgRes.json();
            if (imgData.success && imgData.imageUrl) {
              rawImage = cleanNewsImageUrl(imgData.imageUrl);
            }
          } catch {}
        }

        item.featuredImage = rawImage;

        const detectedSlug = item.category?.slug?.toLowerCase();
        const detectedName = item.category?.name?.trim();
        const detectedId = item.category?.id;

        const matched = categoriesList.find(
          (c) =>
            (detectedId && c.id === detectedId) ||
            (detectedSlug && c.slug?.toLowerCase() === detectedSlug) ||
            (detectedName && c.name?.trim() === detectedName)
        );

        if (matched) {
          setSelectedCategoryId(matched.id);
        } else if (item.category?.id) {
          setSelectedCategoryId(item.category.id);
        } else if (categoriesList.length > 0) {
          setSelectedCategoryId(categoriesList[0].id);
        }

        setExtractedData(item);
      } else {
        setManualError(data?.message || "সংবাদের তথ্য সংগ্রহ করা যায়নি। লিংকটি সঠিক কিনা যাচাই করুন।");
      }
    } catch (err: any) {
      setManualError("সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।");
    } finally {
      setIsManualLoading(false);
    }
  };

  const handleManualPublish = async (status: "PUBLISHED" | "DRAFT") => {
    if (!extractedData) return;
    setIsSubmitting(true);
    setManualError(null);
    setManualSuccessMessage(null);

    try {
      const payload = {
        title: extractedData.title,
        content: extractedData.content,
        summary: extractedData.summary || extractedData.title,
        featuredImage: extractedData.featuredImage,
        imageCaption: extractedData.imageCaption || "",
        photoCredit: extractedData.photoCredit || "সংগৃহীত",
        categoryId: selectedCategoryId || extractedData.categoryId,
        tags: Array.isArray(extractedData.tags) ? extractedData.tags : [],
        publishStatus: status,
        isBreaking: isBreakingNews,
        isFeatured: isSpecialNews,
      };

      const res: any = await api.post("/news", payload);

      if (res?.success) {
        setManualSuccessMessage(
          status === "PUBLISHED" ? "সংবাদটি সফলভাবে প্রকাশিত হয়েছে!" : "সংবাদটি ড্রাফট হিসেবে সংরক্ষিত হয়েছে।"
        );
        broadcastNewsUpdate();
        setTimeout(() => {
          setUrl("");
          setExtractedData(null);
          setManualSuccessMessage(null);
        }, 2000);
      } else {
        setManualError(res?.message || "সংবাদ পোস্ট করা সম্ভব হয়নি।");
      }
    } catch (err: any) {
      setManualError(err?.message || "পোস্ট করার সময় একটি ত্রুটি ঘটেছে।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAutopilotOn = stats?.status === "ON";

  return (
    <div className="space-y-6">
      {/* 1. TOP HERO BANNER: 24/7 Autopilot Control Center */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0A2540] rounded-2xl p-5 sm:p-6 text-white shadow-lg border border-slate-700/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Title & Status */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    News Agent v4
                  </h2>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    24/7 Autopilot
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  শীর্ষ জাতীয় ও আঞ্চলিক মিডিয়া থেকে স্বয়ংক্রিয় সংবাদ সংগ্রহ, Gemini AI দিয়ে প্রমিত ভাষায় রিরাইট এবং প্রকাশনা ইঞ্জিন
                </p>
              </div>
            </div>

            {/* Sub-info Pill */}
            <div className="inline-flex flex-wrap items-center gap-2 text-[11px] bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1 font-mono text-slate-300">
              <span className="flex items-center gap-1.5 font-bold">
                <span className={`w-2 h-2 rounded-full ${isAutopilotOn ? "bg-emerald-400 animate-pulse" : "bg-gray-500"}`} />
                Status: {stats?.status || "LOADING"}
              </span>
              <span>•</span>
              <span>Interval: {stats?.interval || 5} min</span>
              <span>•</span>
              <span>Sources: {stats?.sourcesCount || (sources.length ? `${sources.length}/${sources.length}` : "24/24")}</span>
              <span>•</span>
              <span>Cursor: {stats?.cursor ?? 0}</span>
              {stats?.nextRun && (
                <>
                  <span>•</span>
                  <span>Next: {new Date(stats.nextRun).toLocaleTimeString("bn-BD")}</span>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons: Toggle ON/OFF & Run Now */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Toggle Autopilot Switch */}
            <button
              type="button"
              onClick={handleToggleAutopilot}
              disabled={isTogglingStatus}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md ${
                isAutopilotOn
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-400/40"
                  : "bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600"
              }`}
            >
              {isTogglingStatus ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isAutopilotOn ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Autopilot: ON (চালু)</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 ml-0.5" />
                  <span>Autopilot: OFF (বন্ধ)</span>
                </>
              )}
            </button>

            {/* Run Now Button */}
            <button
              type="button"
              onClick={handleRunNow}
              disabled={isRunningNow}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs transition-all shadow-md disabled:opacity-50"
            >
              {isRunningNow ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>সাইকেল চলছে...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>⚡ Run Now (এখনই পোস্ট করুন)</span>
                </>
              )}
            </button>

            {/* Refresh Stats */}
            <button
              type="button"
              onClick={loadStats}
              title="রিফ্রেশ"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Run Message Toast Notification */}
        {runMessage && (
          <div className="mt-4 p-2.5 rounded-lg bg-blue-900/60 border border-blue-400/40 text-xs text-blue-200 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {runMessage}
            </span>
            <button onClick={() => setRunMessage(null)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 4 Stats Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-0.5">মোট পোস্ট হয়েছে</span>
            <span className="text-xl sm:text-2xl font-extrabold text-white font-mono">
              {stats?.totalPosted?.toLocaleString() ?? 0}
            </span>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[11px] text-emerald-400 font-semibold block mb-0.5">আজকে পোস্ট হয়েছে</span>
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono">
              {stats?.postedToday?.toLocaleString() ?? 0}
            </span>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-0.5">ডুপ্লিকেট স্কিপড</span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-300 font-mono">
              {stats?.skipping ?? 0}
            </span>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-0.5">ত্রুটি (Errors)</span>
            <span className="text-xl sm:text-2xl font-extrabold text-rose-400 font-mono">
              {stats?.errors ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* 2. TAB NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto no-scrollbar pb-1">
        {[
          { key: "sources", label: `${sources.length || 24}টি নিউজ সোর্স`, icon: Globe, count: sources.length || 24 },
          { key: "settings", label: "এজেন্ট কনফিগারেশন", icon: Sliders },
          { key: "logs", label: "লাইভ টার্মিনাল লগস", icon: Terminal, count: logs.length },
          { key: "recent", label: "সম্প্রতি পোস্ট হওয়া", icon: Layers, count: recentPosts.length },
          { key: "manual", label: "ম্যানুয়াল লিংক ফেচার", icon: Link2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                isActive
                  ? "bg-[#1677FF] text-white shadow-xs"
                  : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {typeof tab.count === "number" && tab.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. TAB 1: SOURCES TABLE */}
      {activeTab === "sources" && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#0A2540]">
                {sources.length || 24}টি সক্রিয় নিউজ সোর্স ম্যানেজমেন্ট
              </h3>
              <p className="text-xs text-gray-500">
                প্রতি {stats?.interval || settings?.interval || 5} মিনিট পর পর ক্রমানুসারে (Cursor) সোর্সগুলো থেকে স্বয়ংক্রিয় সংবাদ সংগৃহীত হয়
              </p>
            </div>
            <button
              type="button"
              onClick={loadSources}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSourcesLoading ? "animate-spin text-[#1677FF]" : ""}`} />
              <span>রিফ্রেশ</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-[#F8FAFC] text-[11px] font-bold text-gray-500 uppercase border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">অর্ডার</th>
                  <th className="py-3 px-4">সোর্সের নাম ও ইউআরএল</th>
                  <th className="py-3 px-4">ক্যাটাগরি</th>
                  <th className="py-3 px-4">স্ট্যাটাস</th>
                  <th className="py-3 px-4">পোস্ট সংখ্যা</th>
                  <th className="py-3 px-4 text-center">সক্রিয়/নিষ্ক্রিয়</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sources.map((s, idx) => (
                  <tr key={s.id || idx} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-400">
                      #{s.order || idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#0A2540]">{s.name}</div>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-600 hover:underline truncate max-w-[280px] inline-flex items-center gap-1"
                      >
                        <span className="truncate">{s.url}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-semibold">
                        {s.categoryHint || "সাধারণ"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.status === "Published"
                            ? "bg-emerald-50 text-emerald-700"
                            : s.status === "Active"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className="text-emerald-600 font-bold">{s.okCount || 0} সফল</span>
                      {s.failCount > 0 && <span className="text-rose-500 ml-1">/ {s.failCount} ব্যর্থ</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleSource(s.id, s.isActive)}
                        disabled={togglingSourceId === s.id}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all shadow-2xs ${
                          s.isActive
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        }`}
                      >
                        {togglingSourceId === s.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" />
                        ) : s.isActive ? (
                          "Active"
                        ) : (
                          "Inactive"
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. TAB 2: SETTINGS FORM */}
      {activeTab === "settings" && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-5 sm:p-6">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-[#0A2540]">
                এজেন্ট কনফিগারেশন ও সেটিংস
              </h3>
              <p className="text-xs text-gray-500">
                Gemini AI রিরাইট, স্ক্র্যাপিং ইন্টারভাল এবং ইমেজ প্রসেসিং নিয়ন্ত্রণ করুন
              </p>
            </div>
            {settingsSavedMessage && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" />
                {settingsSavedMessage}
              </span>
            )}
            {settingsErrorMessage && (
              <span className="text-xs font-bold text-red-600 flex items-center gap-1.5 bg-red-50 px-3 py-1 rounded-lg border border-red-200 animate-fadeIn">
                <AlertCircle className="w-4 h-4" />
                {settingsErrorMessage}
              </span>
            )}
          </div>

          {settings ? (
            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Interval in Minutes */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700">
                    সাইকেল ইন্টারভাল (মিনিট)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.interval}
                    onChange={(e) => setSettings({ ...settings, interval: parseInt(e.target.value) || 5 })}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[11px] text-gray-400">কত মিনিট পর পর নতুন নিউজ স্ক্র্যাপ হবে (ডিফল্ট: ৫ মিনিট)</p>
                </div>

                {/* Preferred Gemini Model */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700">
                    Google Gemini AI মডেল
                  </label>
                  <select
                    value={settings.preferredModel || "auto"}
                    onChange={(e) => setSettings({ ...settings, preferredModel: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="auto">Auto (স্বয়ংক্রিয় দ্রুততম মডেল)</option>
                    <option value="gemini-flash-lite-latest">gemini-flash-lite-latest (সুপার ফাস্ট)</option>
                    <option value="gemini-2.5-flash">gemini-2.5-flash (ব্যালেন্সড)</option>
                    <option value="gemini-2.5-pro">gemini-2.5-pro (হাই কোয়ালিটি)</option>
                  </select>
                  <p className="text-[11px] text-gray-400">নিউজ রিরাইটের জন্য প্রস্তাবিত মডেল</p>
                </div>

                {/* Gemini API Key */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700">
                    Google Gemini API Key
                  </label>
                  <input
                    type="text"
                    value={settings.geminiApiKey || ""}
                    onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                    placeholder="AQ.Ab8RN6I6..."
                    className="w-full font-mono border border-gray-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[11px] text-gray-400">আপনার নিজস্ব Google AI Studio API Key প্রদান করতে পারেন</p>
                </div>

                {/* Extra Instructions Prompt */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700">
                    এআই সাংবাদিক নির্দেশিকা (Custom Prompt)
                  </label>
                  <textarea
                    rows={3}
                    value={settings.extraInstruction || ""}
                    onChange={(e) => setSettings({ ...settings, extraInstruction: e.target.value })}
                    placeholder="বাংলায় আকর্ষণীয় ও নিরপেক্ষ প্রফেশনাল সাংবাদিক সুলভ ভাষায় লিখুন।"
                    className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <input
                    type="checkbox"
                    id="aiRewrite"
                    checked={settings.aiRewrite}
                    onChange={(e) => setSettings({ ...settings, aiRewrite: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                  <label htmlFor="aiRewrite" className="text-xs font-bold text-gray-700 cursor-pointer">
                    AI Rewrite (অন থাকলে সংবাদের ভাষা সম্পূর্ণ রিরাইট হবে)
                  </label>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <input
                    type="checkbox"
                    id="imageCropResize"
                    checked={settings.imageCropResize}
                    onChange={(e) => setSettings({ ...settings, imageCropResize: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                  <label htmlFor="imageCropResize" className="text-xs font-bold text-gray-700 cursor-pointer">
                    অটো ইমেজ ক্রপ ও রিসাইজ (1200x675 HD 16:9)
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1677FF] hover:bg-blue-600 text-white font-bold text-xs transition shadow-md disabled:opacity-50"
                >
                  {isSavingSettings ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>সংরক্ষণ হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>সেটিংস সংরক্ষণ করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="py-10 text-center text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <span>সেটিংস লোড হচ্ছে...</span>
            </div>
          )}
        </div>
      )}

      {/* 5. TAB 3: LIVE TERMINAL LOGS */}
      {activeTab === "logs" && (
        <div className="bg-[#0B0F19] rounded-2xl border border-slate-800 p-4 sm:p-5 text-slate-200 shadow-xl font-mono">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white">Live Execution Terminal Logs</span>
            </div>
            <button
              type="button"
              onClick={loadLogs}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition"
            >
              <RefreshCw className={`w-3 h-3 ${isLogsLoading ? "animate-spin text-emerald-400" : ""}`} />
              <span>লগ রিফ্রেশ</span>
            </button>
          </div>

          <div className="space-y-1.5 max-h-[460px] overflow-y-auto no-scrollbar text-xs leading-relaxed">
            {logs.length > 0 ? (
              logs.map((log) => {
                const color =
                  log.level === "success"
                    ? "text-emerald-400"
                    : log.level === "error"
                    ? "text-rose-400"
                    : "text-blue-300";
                return (
                  <div key={log.id} className="flex items-start gap-2.5 hover:bg-slate-900/60 p-1 rounded">
                    <span className="text-[10px] text-slate-500 shrink-0 pt-0.5">
                      {new Date(log.createdAt).toLocaleTimeString("en-GB")}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded shrink-0 ${
                      log.level === "success" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-blue-950 text-blue-400 border border-blue-800"
                    }`}>
                      {log.level}
                    </span>
                    <span className={`break-all ${color}`}>{log.message}</span>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-slate-500">
                কোনো লগ পাওয়া যায়নি
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. TAB 4: RECENT AUTO-POSTED ARTICLES */}
      {activeTab === "recent" && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0A2540]">
              স্বয়ংক্রিয়ভাবে প্রকাশিত সাম্প্রতিক সংবাদসমূহ
            </h3>
            <button
              type="button"
              onClick={loadRecentPosts}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold hover:bg-gray-50 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRecentLoading ? "animate-spin" : ""}`} />
              <span>রিফ্রেশ</span>
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <div key={post.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 transition">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                        {post.sourceName || post.sourceSite}
                      </span>
                      <span className="text-[11px] text-gray-400 font-mono">
                        {new Date(post.createdAt).toLocaleTimeString("bn-BD")}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 truncate">
                      {post.articleTitle}
                    </h4>
                    <a
                      href={post.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-gray-500 hover:text-blue-600 truncate flex items-center gap-1"
                    >
                      <span className="truncate">{post.sourceUrl}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <Link
                      href={`/admin/new-article?edit=${post.newsId}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                    >
                      এডিট
                    </Link>
                    <Link
                      href={`/news/${post.newsId}`}
                      target="_blank"
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition flex items-center gap-1"
                    >
                      <span>ওয়েবসাইটে দেখুন</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-gray-400 text-xs">
                কোনো সাম্প্রতিক পোস্ট পাওয়া যায়নি
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. TAB 5: MANUAL SINGLE LINK FETCHER */}
      {activeTab === "manual" && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-5 sm:p-6 space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-[#0A2540] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              যেকোনো লিংক থেকে ১-ক্লিকে তাৎক্ষণিক সংবাদ ফেচ করুন
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              প্রথম আলো, যুগান্তর, ইত্তেফাক, ডেইলি স্টার ইত্যাদি যেকোনো পত্রিকার লিংক দিন — ৩ সেকেন্ডে শিরোনাম, ছবি ও বিবরণ চলে আসবে।
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleManualFetch} className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.prothomalo.com/bangladesh/..."
              className="flex-1 px-4 py-2.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={isManualLoading || !url.trim()}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isManualLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>ফেচ হচ্ছে...</span>
                </>
              ) : (
                <span>Fetch News</span>
              )}
            </button>
          </form>

          {manualError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{manualError}</span>
            </div>
          )}

          {manualSuccessMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{manualSuccessMessage}</span>
            </div>
          )}

          {/* Extracted Preview */}
          {extractedData && (
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {extractedData.featuredImage && (
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                    <img
                      src={extractedData.featuredImage}
                      alt={extractedData.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="md:col-span-2 space-y-2">
                  <h4 className="text-base font-bold text-gray-900 leading-snug">
                    {extractedData.title}
                  </h4>
                  <div className="text-xs text-gray-600 line-clamp-3">
                    {extractedData.summary || extractedData.title}
                  </div>
                </div>
              </div>

              {/* Category & Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-700">ক্যাটাগরি:</span>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-blue-500"
                  >
                    {categoriesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleManualPublish("DRAFT")}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition disabled:opacity-50"
                  >
                    ড্রাফট হিসেবে সংরক্ষণ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleManualPublish("PUBLISHED")}
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
                  >
                    সরাসরি প্রকাশ করুন
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
