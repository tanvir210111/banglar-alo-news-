"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import TrafficChart from "@/components/admin/TrafficChart";
import ScrollToTop from "@/components/common/ScrollToTop";
import { api } from "@/services/apiClient";
import { formatToBengaliDate } from "@/services/newsService";
import { getDashboardSummary } from "@/services/analyticsService";
import { DashboardSummaryResponse } from "@/types/analytics";

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummaryResponse | null>(null);

  // Instant 0ms cache hydration from localStorage
  const [articles, setArticles] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("admin_dashboard_cache");
        if (cached) return JSON.parse(cached).articles || [];
      } catch { }
    }
    return [];
  });
  const [allNewsList, setAllNewsList] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("admin_dashboard_cache");
        if (cached) return JSON.parse(cached).allNewsList || [];
      } catch { }
    }
    return [];
  });
  const [totalCount, setTotalCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("admin_dashboard_cache");
        if (cached) return JSON.parse(cached).totalCount || 0;
      } catch { }
    }
    return 0;
  });
  const [publishedCount, setPublishedCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("admin_dashboard_cache");
        if (cached) return JSON.parse(cached).publishedCount || 0;
      } catch { }
    }
    return 0;
  });
  const [pendingCount, setPendingCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("admin_dashboard_cache");
        if (cached) return JSON.parse(cached).pendingCount || 0;
      } catch { }
    }
    return 0;
  });

  const refreshDashboardData = async () => {
    try {
      const [liveRes, draftRes, summaryRes] = await Promise.allSettled([
        api.get<any[]>("/news?limit=20"),
        api.get<any[]>("/news/drafts?limit=20"),
        getDashboardSummary("30d"),
      ]);

      if (summaryRes.status === "fulfilled" && summaryRes.value) {
        setDashboardSummary(summaryRes.value);
      }

      let liveList =
        liveRes.status === "fulfilled" && liveRes.value?.success && Array.isArray(liveRes.value.data)
          ? liveRes.value.data
          : [];
      const draftList =
        draftRes.status === "fulfilled" && draftRes.value?.success && Array.isArray(draftRes.value.data)
          ? draftRes.value.data
          : [];

      let totalLive =
        liveRes.status === "fulfilled" && typeof liveRes.value?.meta?.total === "number"
          ? Math.max(liveRes.value.meta.total, liveList.length)
          : liveList.length;

      const totalDraft =
        draftRes.status === "fulfilled" && typeof draftRes.value?.meta?.total === "number"
          ? Math.max(draftRes.value.meta.total, draftList.length)
          : draftList.length;

      // Fallback if direct fetch had issues
      if (liveList.length === 0) {
        try {
          const fallback = await api.get<any[]>("/news?limit=10");
          if (fallback?.success && Array.isArray(fallback.data)) {
            liveList = fallback.data;
            totalLive = fallback.meta?.total || fallback.data.length;
          }
        } catch { }
      }

      const newArticles = liveList.slice(0, 15);
      const newTotal = totalLive + totalDraft;

      setArticles(newArticles);
      setAllNewsList(liveList);
      setTotalCount(newTotal);
      setPublishedCount(totalLive);
      setPendingCount(totalDraft);

      // Persist to cache for instantaneous subsequent visits
      try {
        localStorage.setItem(
          "admin_dashboard_cache",
          JSON.stringify({
            articles: newArticles,
            allNewsList: liveList,
            totalCount: newTotal,
            publishedCount: totalLive,
            pendingCount: totalDraft,
          })
        );
      } catch { }
    } catch { }
  };

  // Real-time synchronization & automatic refresh
  useEffect(() => {
    refreshDashboardData();

    // 1. Cross-tab BroadcastChannel listener (instant 0ms auto-refresh when article published)
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        channel = new BroadcastChannel("banglar_alo_news_channel");
        channel.onmessage = (event) => {
          if (event.data?.type === "ARTICLE_PUBLISHED") {
            refreshDashboardData();
          }
        };
      }
    } catch { }

    // 2. Storage event listener (cross-tab fallback)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "site_last_article_published") {
        refreshDashboardData();
      }
    };
    window.addEventListener("storage", handleStorage);

    // 3. Visibility change listener (auto-refresh immediately when user switches to tab)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshDashboardData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // 4. Background lightweight heartbeat poll every 10 seconds
    const interval = setInterval(refreshDashboardData, 10000);

    return () => {
      clearInterval(interval);
      if (channel) channel.close();
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F4FA] text-[#1E293B] flex flex-col font-sans">
      {/* Top Navbar */}
      <AdminNavbar
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main Container: Sidebar + Dashboard */}
      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <AdminSidebar isOpen={isSidebarOpen} activePath="/admin" />

        {/* Dashboard Content matching screenshot 100% */}
        <main className="flex-1 w-full p-4 sm:px-5 sm:py-3.5 lg:px-6 lg:py-4 min-w-0 flex flex-col justify-between">
          <div>
            {/* Title: Dashboard */}
            <div className="mb-3">
              <h1 className="text-[22px] sm:text-[24px] font-bold text-[#0A2540] tracking-tight">
                Dashboard
              </h1>
            </div>

            {/* Dashboard 2-Column Grid (Left: Stat cards + Traffic, Right: Recent Articles) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* LEFT COLUMN (8 cols): 3 Stat Cards on Top + Website Traffic on Bottom */}
              <div className="lg:col-span-8 flex flex-col gap-5">
                {/* 3 Stat Cards Row matching reference screenshot */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5">
                  {/* Card 1: All Article (Soft blue transparent gradient) */}
                  <div className="bg-gradient-to-br from-[#EEF4FF] via-[#F6F9FF] to-white rounded-2xl p-5 sm:p-5.5 border border-[#DDE7FB] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all min-h-[138px] flex flex-col justify-between">
                    <span className="block text-[17px] font-bold text-[#0A2540] mb-4">
                      All Article
                    </span>
                    <div className="flex items-center gap-4">
                      {/* Circular soft blue badge */}
                      <div className="w-[54px] h-[54px] rounded-full bg-[#EBF1FF] flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#2563EB]" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <rect x="6" y="6" width="5" height="5" fill="currentColor" fillOpacity="0.25" stroke="none" />
                          <path d="M14 6h4M14 9h4M6 14h12M6 17h8" strokeLinecap="round" />
                        </svg>
                      </div>
                      {/* Stat text block */}
                      <div>
                        <div className="text-[30px] sm:text-[32px] font-extrabold text-[#0A2540] leading-none mb-1">
                          {totalCount}
                        </div>
                        <Link
                          href="/admin/articles"
                          className="text-[12.5px] font-medium text-[#718096] hover:text-[#2563EB] transition-colors"
                        >
                          Show Articles
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Published Articles (Soft mint green transparent gradient) */}
                  <div className="bg-gradient-to-br from-[#ECFBF2] via-[#F5FCF7] to-white rounded-2xl p-5 sm:p-5.5 border border-[#D1F2DD] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all min-h-[138px] flex flex-col justify-between">
                    <span className="block text-[17px] font-bold text-[#0A2540] mb-4">
                      Published Articles
                    </span>
                    <div className="flex items-center gap-4">
                      {/* Circular soft mint green badge */}
                      <div className="w-[54px] h-[54px] rounded-full bg-[#E4F8EC] flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </div>
                      {/* Stat text block */}
                      <div>
                        <div className="text-[30px] sm:text-[32px] font-extrabold text-[#0A2540] leading-none mb-1">
                          {publishedCount}
                        </div>
                        <Link
                          href="/admin/articles?status=PUBLISHED"
                          className="text-[12.5px] font-medium text-[#718096] hover:text-[#10B981] transition-colors"
                        >
                          Show Articles
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Pending Articles (Soft lavender/pink transparent gradient) */}
                  <div className="bg-gradient-to-br from-[#FAF0FF] via-[#FDF5FF] to-white rounded-2xl p-5 sm:p-5.5 border border-[#EED7FC] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all min-h-[138px] flex flex-col justify-between">
                    <span className="block text-[17px] font-bold text-[#0A2540] mb-4">
                      Pending Articles
                    </span>
                    <div className="flex items-center gap-4">
                      {/* Circular soft peach badge with orange info icon */}
                      <div className="w-[54px] h-[54px] rounded-full bg-[#FFF0E0] flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#F97316]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="16" x2="12" y2="12" />
                          <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                      </div>
                      {/* Stat text block */}
                      <div>
                        <div className="text-[30px] sm:text-[32px] font-extrabold text-[#0A2540] leading-none mb-1">
                          {pendingCount}
                        </div>
                        <Link
                          href="/admin/articles?status=DRAFT"
                          className="text-[12.5px] font-medium text-[#718096] hover:text-[#F97316] transition-colors"
                        >
                          Show Articles
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Website Traffic Card */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <h2 className="text-[18px] font-bold text-[#0A2540] mb-3">
                    Website Traffic
                  </h2>
                  <TrafficChart articles={allNewsList} />
                </div>
              </div>

              {/* RIGHT COLUMN (4 cols): Recent Articles */}
              <div className="lg:col-span-4 bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-[18px] font-bold text-[#0A2540]">
                      Recent Articles
                    </h2>
                    <Link
                      href="/admin/new-article"
                      className="text-xs font-semibold text-[#1677FF] hover:underline"
                    >
                      + New
                    </Link>
                  </div>

                  {/* Connected Vertical Timeline matching user reference */}
                  <div className="relative">
                    {articles.length > 0 ? (
                      articles.slice(0, 12).map((item, idx) => {
                        const isLast = idx === Math.min(articles.length, 12) - 1;
                        return (
                          <div key={item.id || idx} className="relative flex items-start gap-3 group">
                            {/* Time */}
                            <span className="text-[11.5px] sm:text-[12px] font-normal text-[#64748B] w-14 shrink-0 pt-0.5 select-none truncate">
                              {formatToBengaliDate(item.publishedDate || item.createdAt)}
                            </span>

                            {/* Timeline column: Vertical Line + Green Dot */}
                            <div className="relative flex flex-col items-center shrink-0 self-stretch">
                              {!isLast && (
                                <span className="absolute top-2.5 bottom-0 w-[2px] bg-[#EEF2F6] -translate-x-1/2 left-1/2" />
                              )}
                              <span className="relative z-10 w-2.5 h-2.5 rounded-full bg-[#10B981] ring-2 ring-white shrink-0 mt-1.5 shadow-xs" />
                            </div>

                            {/* Bengali Headline */}
                            <Link
                              href={`/article/${item.slug || item.id}`}
                              className="text-[13px] sm:text-[13.5px] font-medium text-[#1E293B] group-hover:text-[#2F54EB] transition-colors leading-[1.45] cursor-pointer line-clamp-2 pb-4"
                            >
                              {item.title}
                            </Link>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-10 px-3">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#F0F4FA] flex items-center justify-center text-[#94A3B8]">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                          </svg>
                        </div>
                        <p className="text-[13.5px] font-semibold text-[#334155] mb-1">কোনো সাম্প্রতিক আর্টিকেল নেই</p>
                        <p className="text-xs text-[#94A3B8] mb-4">অ্যাডমিন প্যানেল থেকে পোস্ট করলে এখানে প্রদর্শিত হবে</p>
                        <Link
                          href="/admin/new-article"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1677FF] hover:bg-blue-600 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
                        >
                          + নতুন পোস্ট তৈরি করুন
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer: Design and Developed by banglaraloit.com */}
          <div className="mt-10 sm:mt-12 mb-4 pb-2 text-center text-xs font-semibold text-[#8A99AD]">
            Design and Developed by{" "}
            <a
              href="https://banglaraloit.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3858F6] hover:underline"
            >
              Banglar Alo IT
            </a>
          </div>
        </main>
      </div>

      {/* Floating Scroll-To-Top Button (Reliably appears when scrolling down or at bottom) */}
      <ScrollToTop threshold={60} />
    </div>
  );
}
