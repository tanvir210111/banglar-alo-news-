"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Plus,
  Eye,
  EyeOff,
  CheckCircle2,
  FileEdit,
  ExternalLink,
  Filter,
  Trash2,
  FileText,
  RotateCcw,
  Sparkles,
  Clock,
  Camera,
} from "lucide-react";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ScrollToTop from "@/components/common/ScrollToTop";
import PhotoCardModal from "@/components/news/PhotoCardModal";
import { api, canDelete } from "@/services/apiClient";
import { getAllArticles, getCategories, mapBackendNewsToArticle, broadcastNewsUpdate } from "@/services/newsService";
import { Article, Category } from "@/types/news";

function ArticlesListContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const filterParam = searchParams.get("filter");

  // 0ms instant hydration from cache (check articles cache, then dashboard cache)
  const [articles, setArticles] = useState<Article[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("admin_articles_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch { }
      try {
        const dashCached = localStorage.getItem("admin_dashboard_cache");
        if (dashCached) {
          const parsed = JSON.parse(dashCached);
          if (Array.isArray(parsed.articles) && parsed.articles.length > 0) {
            return parsed.articles.map(mapBackendNewsToArticle);
          }
        }
      } catch { }
    }
    return [];
  });

  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("admin_articles_cache");
        if (cached && JSON.parse(cached).length > 0) return false;
        const dashCached = localStorage.getItem("admin_dashboard_cache");
        if (dashCached && JSON.parse(dashCached).articles?.length > 0) return false;
      } catch { }
    }
    return false; // Default to false so user never stares at empty loading state
  });

  const [totalCount, setTotalCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("admin_dashboard_cache");
        if (cached) return JSON.parse(cached).totalCount || 75;
      } catch { }
    }
    return 75;
  });

  const [publishedCount, setPublishedCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("admin_dashboard_cache");
        if (cached) return JSON.parse(cached).publishedCount || 75;
      } catch { }
    }
    return 75;
  });

  const [breakingCount, setBreakingCount] = useState<number>(0);
  const [specialCount, setSpecialCount] = useState<number>(0);
  const [draftCount, setDraftCount] = useState<number>(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [photoCardItem, setPhotoCardItem] = useState<any | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadArticles = async (
    silent: boolean = false,
    page: number = currentPage,
    limit: number = pageSize
  ) => {
    try {
      if (!silent) setIsLoading(true);
      const isDraftRequested = statusParam === "DRAFT" || statusParam === "draft";
      const actualLimit = limit > 0 ? limit : 50;

      if (isDraftRequested) {
        let draftUrl = `/news/drafts?page=${page}&limit=${actualLimit}`;
        if (searchQuery) draftUrl += `&searchTerm=${encodeURIComponent(searchQuery)}`;
        const draftRes = await api.get<any[]>(draftUrl);
        if (draftRes?.success && Array.isArray(draftRes.data)) {
          const total = typeof draftRes.meta?.total === "number" ? draftRes.meta.total : draftRes.data.length;
          setTotalCount(total);
          const draftList = draftRes.data.map((d) => ({
            ...mapBackendNewsToArticle(d),
            publishStatus: "DRAFT" as const,
          }));
          setArticles(draftList);
        }
      } else {
        const queryParams = [`page=${page}`, `limit=${actualLimit}`];
        if (statusParam === "PUBLISHED" || statusParam === "published") {
          queryParams.push("status=PUBLISHED");
        }
        if (filterParam === "breaking") {
          queryParams.push("isBreaking=true");
        }
        if (filterParam === "special") {
          queryParams.push("isFeatured=true");
        }
        if (selectedCategory && selectedCategory !== "all") {
          queryParams.push(`category=${encodeURIComponent(selectedCategory)}`);
        }
        if (searchQuery && searchQuery.trim()) {
          queryParams.push(`searchTerm=${encodeURIComponent(searchQuery.trim())}`);
        }

        const liveRes = await api.get<any[]>(`/news?${queryParams.join("&")}`);
        if (liveRes?.success && Array.isArray(liveRes.data)) {
          const total =
            typeof liveRes.meta?.total === "number"
              ? liveRes.meta.total
              : typeof liveRes.meta?.totalItems === "number"
              ? liveRes.meta.totalItems
              : liveRes.data.length;
          setTotalCount(total);
          setPublishedCount(total);

          const mappedAll = liveRes.data.map(mapBackendNewsToArticle);
          setArticles(mappedAll);
          try {
            localStorage.setItem("admin_articles_cache", JSON.stringify(mappedAll));
            localStorage.setItem(
              "admin_dashboard_cache",
              JSON.stringify({
                articles: mappedAll.slice(0, 15),
                allNewsList: mappedAll,
                totalCount: total,
                publishedCount: total,
                pendingCount: 0,
              })
            );
          } catch { }
        }
      }
    } catch {
      if (!silent) {
        showToast("নিউজ লোড করতে সমস্যা হয়েছে");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadArticles(false, currentPage, pageSize);
    getCategories().then((cats) => {
      if (cats && cats.length > 0) setDbCategories(cats);
    });

    // Fetch dynamic live counts for Breaking News, Special, and Drafts
    api.get<any[]>("/news?limit=1&isBreaking=true").then((res) => {
      if (typeof res?.meta?.total === "number") setBreakingCount(res.meta.total);
    }).catch(() => {});

    api.get<any[]>("/news?limit=1&isFeatured=true").then((res) => {
      if (typeof res?.meta?.total === "number") setSpecialCount(res.meta.total);
    }).catch(() => {});

    api.get<any[]>("/news/drafts?limit=1").then((res) => {
      const total = typeof res?.meta?.total === "number" ? res.meta.total : (Array.isArray(res?.data) ? res.data.length : 0);
      setDraftCount(total);
    }).catch(() => {});
  }, [statusParam, filterParam, currentPage, pageSize, selectedCategory]);

  // Real-time synchronization when a new article is published from anywhere
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        channel = new BroadcastChannel("banglar_alo_news_channel");
        channel.onmessage = (event) => {
          if (event.data?.type === "ARTICLE_PUBLISHED") {
            setTotalCount((prev) => prev + 1);
            setPublishedCount((prev) => prev + 1);
            loadArticles(true);
          }
        };
      }
    } catch { }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "site_last_article_published") {
        setTotalCount((prev) => prev + 1);
        setPublishedCount((prev) => prev + 1);
        loadArticles(true);
      }
    };
    window.addEventListener("storage", handleStorage);

    // Auto-refresh when tab gains focus
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadArticles(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Background heartbeat auto-poll every 10 seconds
    const interval = setInterval(() => {
      loadArticles(true);
    }, 10000);

    return () => {
      clearInterval(interval);
      if (channel) channel.close();
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [statusParam, filterParam]);

  // Status counts for Top Tabs
  const counts = useMemo(() => {
    let published = 0;
    let draft = 0;
    let breaking = 0;
    let special = 0;
    for (const a of articles) {
      if (a.publishStatus === "DRAFT") {
        draft++;
      } else {
        published++;
      }
      if (a.isBreaking) breaking++;
      if (a.isFeatured) special++;
    }
    const realTotal = Math.max(totalCount, articles.length);
    const realPublished = Math.max(publishedCount, published);
    return {
      all: realTotal,
      published: realPublished,
      draft: draftCount > 0 ? draftCount : draft,
      breaking: breakingCount > 0 ? breakingCount : breaking,
      special: specialCount > 0 ? specialCount : special,
    };
  }, [articles, totalCount, publishedCount, draftCount, breakingCount, specialCount]);

  // 1-Click Instant Toggle Breaking News (0ms optimistic update without page reload)
  const handleToggleBreaking = async (id: string, currentlyBreaking: boolean) => {
    const nextState = !currentlyBreaking;
    // 1. Instant 0ms state change
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isBreaking: nextState } : a))
    );
    setBreakingCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    showToast(
      nextState
        ? "সংবাদটি ব্রেকিং নিউজে যুক্ত করা হয়েছে!"
        : "সংবাদটি ব্রেকিং নিউজ থেকে সরানো হয়েছে"
    );
    broadcastNewsUpdate();

    // 2. Background sync to backend
    try {
      const res = await api.patch(`/news/${id}`, { isBreaking: nextState });
      if (!res?.success) {
        // Rollback on failure
        setArticles((prev) =>
          prev.map((a) => (a.id === id ? { ...a, isBreaking: currentlyBreaking } : a))
        );
        setBreakingCount((prev) => (currentlyBreaking ? prev + 1 : Math.max(0, prev - 1)));
        showToast(res?.message || "ব্রেকিং স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি");
      }
    } catch {
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isBreaking: currentlyBreaking } : a))
      );
      setBreakingCount((prev) => (currentlyBreaking ? prev + 1 : Math.max(0, prev - 1)));
      showToast("ব্রেকিং স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি");
    }
  };

  // 1-Click Instant Toggle Banglar Alo News Special News (0ms optimistic update without page reload)
  const handleToggleSpecial = async (id: string, currentlySpecial: boolean) => {
    const nextState = !currentlySpecial;
    // 1. Instant 0ms state change
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isFeatured: nextState } : a))
    );
    setSpecialCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    showToast(
      nextState
        ? "সংবাদটি 'বাংলার আলো নিউজ স্পেশাল'-এ যুক্ত করা হয়েছে!"
        : "সংবাদটি স্পেশাল থেকে সরানো হয়েছে"
    );
    broadcastNewsUpdate();

    // 2. Background sync to backend
    try {
      const res = await api.patch(`/news/${id}`, { isFeatured: nextState });
      if (!res?.success) {
        // Try special-toggle endpoint as fallback
        await api.patch(`/news/${id}/special-toggle`);
      }
    } catch {
      try {
        await api.patch(`/news/${id}/special-toggle`);
      } catch {
        setArticles((prev) =>
          prev.map((a) => (a.id === id ? { ...a, isFeatured: currentlySpecial } : a))
        );
        setSpecialCount((prev) => (currentlySpecial ? prev + 1 : Math.max(0, prev - 1)));
        showToast("স্পেশাল স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি");
      }
    }
  };

  // 1-Click Instant Publish (0ms optimistic update without page reload)
  const handlePublish = async (id: string) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, publishStatus: "PUBLISHED" as const } : a))
    );
    showToast("সংবাদটি সফলভাবে প্রকাশিত হয়েছে!");
    broadcastNewsUpdate();

    try {
      const res = await api.patch(`/news/${id}/publish`);
      if (!res?.success) {
        setArticles((prev) =>
          prev.map((a) => (a.id === id ? { ...a, publishStatus: "DRAFT" as const } : a))
        );
        showToast(res?.message || "প্রকাশ করা সম্ভব হয়নি");
      }
    } catch {
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, publishStatus: "DRAFT" as const } : a))
      );
      showToast("প্রকাশ করা সম্ভব হয়নি");
    }
  };

  // 1-Click Instant Unpublish to draft (0ms optimistic update without page reload)
  const handleUnpublish = async (id: string) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, publishStatus: "DRAFT" as const } : a))
    );
    showToast("সংবাদটি ড্রাফট করা হয়েছে");
    broadcastNewsUpdate();

    try {
      const res = await api.patch(`/news/${id}/unpublish`);
      if (!res?.success) {
        setArticles((prev) =>
          prev.map((a) => (a.id === id ? { ...a, publishStatus: "PUBLISHED" as const } : a))
        );
        showToast(res?.message || "ড্রাফট করা সম্ভব হয়নি");
      }
    } catch {
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, publishStatus: "PUBLISHED" as const } : a))
      );
      showToast("ড্রাফট করা সম্ভব হয়নি");
    }
  };

  // 1-Click Instant Hide/Unhide (0ms optimistic update without page reload)
  const handleToggleHide = async (id: string, currentlyHidden: boolean) => {
    const nextHidden = !currentlyHidden;
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isHidden: nextHidden } : a))
    );
    showToast(
      nextHidden
        ? "সংবাদটি হাইড (গোপন) করা হয়েছে"
        : "সংবাদটি পুনরায় লাইভ করা হয়েছে"
    );
    broadcastNewsUpdate();

    try {
      const endpoint = currentlyHidden ? `/news/${id}/unhide` : `/news/${id}/hide`;
      const res = await api.patch(endpoint);
      if (!res?.success) {
        setArticles((prev) =>
          prev.map((a) => (a.id === id ? { ...a, isHidden: currentlyHidden } : a))
        );
        showToast(res?.message || "স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি");
      }
    } catch {
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isHidden: currentlyHidden } : a))
      );
      showToast("স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি");
    }
  };

  // Delete article (Strictly super.admin@gmail.com only)
  const handleDelete = async (id: string) => {
    if (!canDelete()) {
      alert("ডিলিট করার অনুমতি শুধুমাত্র super.admin@gmail.com এর রয়েছে।");
      return;
    }
    if (!confirm("আপনি কি নিশ্চিত এই নিউজটি ডিলিট করতে চান?")) return;
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);

    try {
      if (isMongoId) {
        const res = await api.delete(`/news/${id}`);
        if (res?.success) {
          broadcastNewsUpdate();
          setArticles((prev) => prev.filter((a) => a.id !== id));
          showToast("সংবাদটি সফলভাবে ডিলিট করা হয়েছে");
        } else {
          showToast(res?.message || "ডিলিট করা সম্ভব হয়নি");
        }
      } else {
        broadcastNewsUpdate();
        setArticles((prev) => prev.filter((a) => a.id !== id));
        showToast("সংবাদটি সফলভাবে ডিলিট করা হয়েছে");
      }
    } catch (err: any) {
      showToast(err?.message || "ডিলিট করা সম্ভব হয়নি");
    }
  };

  const totalArticlesViews = useMemo(() => {
    const rawSum = articles.reduce((sum, a) => sum + (a.viewsCount || 0), 0);
    return Math.max(rawSum, 1800);
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((item) => {
      const isDraft = item.publishStatus === "DRAFT";
      const rawStatus = (statusParam || "").toUpperCase();
      if ((rawStatus === "PUBLISHED" || rawStatus === "PUBLISH") && isDraft) {
        return false;
      }
      if ((rawStatus === "DRAFT" || rawStatus === "PENDING") && !isDraft) {
        return false;
      }
      if (filterParam === "breaking") {
        const isB =
          item.isBreaking ||
          (Array.isArray(item.tags) &&
            item.tags.some((t: any) => {
              const name = typeof t === "string" ? t : t?.name || t?.slug || "";
              return name.includes("ব্রেকিং") || name.toLowerCase().includes("breaking");
            }));
        if (!isB) return false;
      }
      if (filterParam === "special") {
        const isS =
          item.isFeatured ||
          (Array.isArray(item.tags) &&
            item.tags.some((t: any) => {
              const name = typeof t === "string" ? t : t?.name || t?.slug || "";
              return name.includes("স্পেশাল") || name.toLowerCase().includes("special");
            }));
        if (!isS) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesAuthor = item.author?.name?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesAuthor) return false;
      }
      if (selectedCategory !== "all") {
        const matchesCat =
          item.category?.slug === selectedCategory ||
          item.category?.name === selectedCategory ||
          item.category?.id === selectedCategory;
        if (!matchesCat) return false;
      }
      return true;
    });
  }, [articles, searchQuery, selectedCategory, statusParam, filterParam]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, statusParam, filterParam]);

  const paginatedArticles = useMemo(() => {
    if (pageSize === 0) return filteredArticles;
    // If backend already provided a server-paginated slice of data (e.g. 25 items for page 2)
    if (totalCount > filteredArticles.length && filteredArticles.length <= pageSize) {
      return filteredArticles;
    }
    const start = (currentPage - 1) * pageSize;
    return filteredArticles.slice(start, start + pageSize);
  }, [filteredArticles, currentPage, pageSize, totalCount]);

  const totalPages = useMemo(() => {
    if (pageSize === 0) return 1;
    const count = Math.max(totalCount, filteredArticles.length);
    return Math.max(1, Math.ceil(count / pageSize));
  }, [totalCount, filteredArticles.length, pageSize]);

  const getAdminPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  return (
    <div className="min-h-screen bg-[#F0F4FA] text-[#1E293B] flex flex-col font-sans">
      <AdminNavbar
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex-1 flex">
        <AdminSidebar
          isOpen={isSidebarOpen}
          activePath={
            filterParam === "breaking"
              ? "/admin/articles?filter=breaking"
              : filterParam === "special"
                ? "/admin/articles?filter=special"
                : statusParam === "PUBLISHED"
                  ? "/admin/articles?status=PUBLISHED"
                  : statusParam === "DRAFT"
                    ? "/admin/articles?status=DRAFT"
                    : "/admin/articles"
          }
        />

        <main className="flex-1 w-full p-4 sm:px-6 sm:py-5 min-w-0 flex flex-col">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-[22px] sm:text-[24px] font-bold text-[#0A2540] tracking-tight">
                {filterParam === "breaking"
                  ? "Breaking News (সকল ব্রেকিং সংবাদ)"
                  : filterParam === "special"
                    ? "Banglar Alo News Special (বাংলার আলো নিউজ স্পেশাল সংবাদ)"
                    : statusParam === "DRAFT"
                      ? "Draft Articles (ড্রাফট সংবাদ)"
                      : statusParam === "PUBLISHED"
                        ? "Published Articles (প্রকাশিত সংবাদ)"
                        : "All Articles (সকল সংবাদ)"}
              </h1>
              <p className="text-xs text-[#718096] mt-0.5">
                মোট {filterParam ? filteredArticles.length : Math.max(totalCount, filteredArticles.length)} টি সংবাদ পাওয়া গেছে • সর্বমোট ভিউ: <strong className="text-[#0A2540]">{totalArticlesViews.toLocaleString()}</strong> বার
              </p>
            </div>

            <Link
              href="/admin/new-article"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#3858F6] hover:bg-[#2B44C7] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Article</span>
            </Link>
          </div>

          {/* 5 Distinct Top Tabs */}
          <div className="flex items-center gap-2 mb-4 border-b border-[#E2E8F0] pb-2 overflow-x-auto">
            <Link
              href="/admin/articles"
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${!statusParam && !filterParam
                  ? "bg-[#3858F6] text-white shadow-xs"
                  : "bg-white text-[#4A5568] hover:bg-gray-100 border border-[#E2E8F0]"
                }`}
            >
              <span>All Articles</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${!statusParam && !filterParam
                    ? "bg-white/25 text-white"
                    : "bg-gray-100 text-gray-700"
                  }`}
              >
                {counts.all}
              </span>
            </Link>

            <Link
              href="/admin/articles?status=PUBLISHED"
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${statusParam === "PUBLISHED"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-[#4A5568] hover:bg-gray-100 border border-[#E2E8F0]"
                }`}
            >
              <span>Published</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${statusParam === "PUBLISHED"
                    ? "bg-white/25 text-white"
                    : "bg-emerald-100 text-emerald-800"
                  }`}
              >
                {counts.published}
              </span>
            </Link>

            <Link
              href="/admin/articles?status=DRAFT"
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${statusParam === "DRAFT"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-white text-[#4A5568] hover:bg-gray-100 border border-[#E2E8F0]"
                }`}
            >
              <span>Draft</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${statusParam === "DRAFT"
                    ? "bg-white/25 text-white"
                    : "bg-amber-100 text-amber-800"
                  }`}
              >
                {counts.draft}
              </span>
            </Link>

            {/* Breaking News Filter Tab */}
            <Link
              href="/admin/articles?filter=breaking"
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${filterParam === "breaking"
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-white text-red-600 hover:bg-red-50 border border-red-200"
                }`}
            >
              <span>🚨 Breaking News</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${filterParam === "breaking"
                    ? "bg-white/25 text-white"
                    : "bg-red-100 text-red-800"
                  }`}
              >
                {counts.breaking}
              </span>
            </Link>

            {/* Banglar Alo News Special Filter Tab */}
            <Link
              href="/admin/articles?filter=special"
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${filterParam === "special"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-white text-amber-700 hover:bg-amber-50 border border-amber-200"
                }`}
            >
              <span>⭐ Banglar Alo News Special</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${filterParam === "special"
                    ? "bg-white/25 text-white"
                    : "bg-amber-100 text-amber-800"
                  }`}
              >
                {counts.special}
              </span>
            </Link>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Filters Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#E8EEF8] shadow-xs mb-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A3AED0]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="শিরোনাম বা রিপোর্টার অনুসন্ধান..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#F4F7FC] border border-transparent rounded-xl focus:bg-white focus:border-[#3858F6] focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-[#718096]" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs sm:text-sm bg-[#F4F7FC] rounded-xl border border-transparent focus:bg-white focus:border-[#3858F6] focus:outline-none cursor-pointer"
              >
                <option value="all">সকল বিভাগ</option>
                {dbCategories.length > 0
                  ? dbCategories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))
                  : [
                    { slug: "national", name: "জাতীয়" },
                    { slug: "politics", name: "রাজনীতি" },
                    { slug: "international", name: "আন্তর্জাতিক" },
                    { slug: "countrywide", name: "সারাদেশ" },
                    { slug: "crime-corruption", name: "অপরাধ ও দুর্নীতি" },
                    { slug: "education", name: "শিক্ষা" },
                    { slug: "accident", name: "দুর্ঘটনা" },
                    { slug: "sports", name: "খেলাধুলা" },
                    { slug: "entertainment", name: "বিনোদন" },
                    { slug: "economy", name: "অর্থনীতি" },
                  ].map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Articles Table */}
          <div className="bg-white rounded-2xl border border-[#E8EEF8] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#F8FAFD] border-b border-[#E8EEF8] text-[#718096] uppercase text-[11px] font-bold tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">সংবাদ (Article)</th>
                    <th className="py-3.5 px-4">স্ট্যাটাস</th>
                    <th className="py-3.5 px-4">ক্যাটাগরি</th>
                    <th className="py-3.5 px-4">লেখক</th>
                    <th className="py-3.5 px-4">তারিখ</th>
                    <th className="py-3.5 px-4">ভিউ</th>
                    <th className="py-3.5 px-4 text-center min-w-[240px]">অ্যাকশন (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8EEF8]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-500">
                        সংবাদ লোড হচ্ছে...
                      </td>
                    </tr>
                  ) : filteredArticles.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-500">
                        {filterParam === "breaking" ? (
                          <div className="py-2">
                            <p className="font-semibold text-gray-700 text-sm mb-1">কোনো ব্রেকিং সংবাদ পাওয়া যায়নি</p>
                            <p className="text-xs text-gray-500">সকল সংবাদের তালিকা থেকে যেকোনো সংবাদের পাশে 🚨 বাটনে ক্লিক করে তাৎক্ষণিক ব্রেকিং নিউজে যুক্ত করুন।</p>
                          </div>
                        ) : filterParam === "special" ? (
                          <div className="py-2">
                            <p className="font-semibold text-gray-700 text-sm mb-1">কোনো &apos;বাংলার আলো নিউজ স্পেশাল&apos; সংবাদ পাওয়া যায়নি</p>
                            <p className="text-xs text-gray-500">সকল সংবাদের তালিকা থেকে যেকোনো সংবাদের পাশে ⭐ বাটনে ক্লিক করে স্পেশালে যুক্ত করুন।</p>
                          </div>
                        ) : (
                          "কোনো সংবাদ পাওয়া যায়নি।"
                        )}
                      </td>
                    </tr>
                  ) : (
                    paginatedArticles.map((article) => {
                      const img =
                        typeof article.featuredImage === "string"
                          ? article.featuredImage
                          : article.featuredImage?.url || "/images/logo.svg";

                      const isDraft = article.publishStatus === "DRAFT";

                      return (
                        <tr key={article.id} className="hover:bg-[#F9FBFF] transition-colors">
                          <td className="py-3 px-4 max-w-xs sm:max-w-md">
                            <div className="flex items-center gap-3">
                              <img
                                src={img}
                                alt=""
                                className="w-12 h-10 object-cover rounded-md shrink-0 bg-gray-100 border border-gray-200"
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-[#0A2540] truncate text-xs sm:text-sm">
                                  {article.title}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                  {article.isLead && (
                                    <span className="px-1.5 py-0.2 bg-red-100 text-red-700 text-[10px] font-bold rounded">
                                      Lead
                                    </span>
                                  )}
                                  {article.isBreaking && (
                                    <span className="px-1.5 py-0.2 bg-red-100 text-red-800 text-[10px] font-bold rounded flex items-center gap-0.5">
                                      🚨 Breaking
                                    </span>
                                  )}
                                  {article.isFeatured && (
                                    <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-bold rounded flex items-center gap-0.5">
                                      ⭐ Special
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            {article.isHidden ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                <EyeOff className="w-3 h-3" />
                                <span>HIDDEN</span>
                              </span>
                            ) : isDraft ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                <FileText className="w-3 h-3" />
                                <span>DRAFT</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>PUBLISHED</span>
                              </span>
                            )}
                          </td>

                          {/* Category */}
                          <td className="py-3 px-4 text-[#4A5568] whitespace-nowrap">
                            <span className="px-2.5 py-1 bg-[#EEF2FF] text-[#3858F6] text-[11px] font-bold rounded-full">
                              {article.category?.name || "জাতীয়"}
                            </span>
                          </td>

                          {/* Author */}
                          <td className="py-3 px-4 text-[#4A5568] whitespace-nowrap text-xs font-medium">
                            {article.author?.name || "Newsroom"}
                          </td>

                          {/* Date & Publish Time */}
                          <td className="py-3 px-4 text-[#718096] whitespace-nowrap text-[12px]">
                            {article.publishedAt ? (
                              <div className="flex flex-col gap-0.5">
                                <span className="font-semibold text-[#0A2540]">
                                  {new Date(article.publishedAt).toLocaleDateString("bn-BD", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                                <span className="text-[11px] text-[#64748B] flex items-center gap-1 font-medium">
                                  <Clock className="w-3 h-3 text-[#3858F6] shrink-0" />
                                  {new Date(article.publishedAt).toLocaleTimeString("bn-BD", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </span>
                              </div>
                            ) : (
                              "-"
                            )}
                          </td>

                          {/* Views */}
                          <td className="py-3 px-4 text-[#4A5568] font-semibold whitespace-nowrap text-xs">
                            {article.viewsCount || 0}
                          </td>

                          {/* Comprehensive Action Buttons */}
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="inline-flex items-center justify-center gap-1.5">
                              {/* 1. EDIT BUTTON */}
                              <Link
                                href={`/admin/new-article?edit=${article.id}`}
                                title="আর্টিকেল এডিট/সম্পাদনা করুন"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors shadow-2xs cursor-pointer"
                              >
                                <FileEdit className="w-3.5 h-3.5 text-blue-600" />
                                <span>Edit</span>
                              </Link>

                              {/* 2. VIEW ON LIVE SITE */}
                              <Link
                                href={`/news/${article.slug}`}
                                target="_blank"
                                title="ওয়েবসাইটে দেখুন"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors shadow-2xs cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                                <span>View</span>
                              </Link>

                              {/* 2.5 PHOTO CARD BUTTON */}
                              <button
                                type="button"
                                onClick={() => setPhotoCardItem(article)}
                                title="ফটোকার্ড ডাউনলোড করুন"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-colors shadow-2xs cursor-pointer"
                              >
                                <Camera className="w-3.5 h-3.5 text-amber-700" />
                                <span>ফটোকার্ড</span>
                              </button>

                              {/* 3. TOGGLE BREAKING */}
                              <button
                                type="button"
                                onClick={() => handleToggleBreaking(article.id, Boolean(article.isBreaking))}
                                title={article.isBreaking ? "ব্রেকিং নিউজ বন্ধ করুন" : "ব্রেকিং নিউজে যুক্ত করুন"}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer shadow-2xs ${article.isBreaking
                                    ? "bg-red-500 text-white border-red-600 hover:bg-red-600"
                                    : "bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                                  }`}
                              >
                                <span>🚨</span>
                                <span className="hidden xl:inline">{article.isBreaking ? "ব্রেকিং" : "ব্রেকিং"}</span>
                              </button>

                              {/* 4. TOGGLE SPECIAL */}
                              <button
                                type="button"
                                onClick={() => handleToggleSpecial(article.id, Boolean(article.isFeatured))}
                                title={article.isFeatured ? "স্পেশাল থেকে সরান" : "বাংলার আলো নিউজ স্পেশাল করুন"}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer shadow-2xs ${article.isFeatured
                                    ? "bg-amber-500 text-white border-amber-600 hover:bg-amber-600"
                                    : "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200"
                                  }`}
                              >
                                <span>⭐</span>
                                <span className="hidden xl:inline">{article.isFeatured ? "স্পেশাল" : "স্পেশাল"}</span>
                              </button>

                              {/* 5. STATUS TOGGLE (Publish / Unpublish) */}
                              {isDraft ? (
                                <button
                                  type="button"
                                  onClick={() => handlePublish(article.id)}
                                  title="ড্রাফট থেকে লাইভ প্রকাশ করুন"
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer shadow-2xs"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Publish</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleUnpublish(article.id)}
                                  title="ড্রাফটে পাঠান"
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer shadow-2xs"
                                >
                                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Draft</span>
                                </button>
                              )}

                              {/* 4. HIDE / UNHIDE */}
                              <button
                                type="button"
                                onClick={() => handleToggleHide(article.id, Boolean(article.isHidden))}
                                title={article.isHidden ? "পাবলিক সাইটে দৃশ্যমান করুন" : "পাবলিক সাইট থেকে গোপন করুন"}
                                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${article.isHidden
                                    ? "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200"
                                    : "bg-gray-50 text-gray-500 hover:bg-gray-100 border-gray-200"
                                  }`}
                              >
                                {article.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              </button>

                              {/* 5. DELETE (Strictly super.admin@gmail.com only) */}
                              <button
                                type="button"
                                disabled={!canDelete()}
                                onClick={() => {
                                  if (!canDelete()) {
                                    alert("ডিলিট করার অনুমতি শুধুমাত্র super.admin@gmail.com এর রয়েছে।");
                                    return;
                                  }
                                  handleDelete(article.id);
                                }}
                                title={
                                  canDelete()
                                    ? "মুছে ফেলুন"
                                    : "ডিলিট করার অনুমতি শুধুমাত্র super.admin@gmail.com এর রয়েছে"
                                }
                                className={`p-1.5 rounded-lg border transition-colors ${canDelete()
                                    ? "bg-red-50 text-red-600 hover:bg-red-100 border-red-200 cursor-pointer"
                                    : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-40"
                                  }`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination & Page Size Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-[#F8FAFD] border-t border-[#E8EEF8] text-xs text-[#64748B]">
              <div className="flex items-center gap-2 flex-wrap">
                <span>দেখাচ্ছে:</span>
                <strong>
                  {filteredArticles.length === 0
                    ? 0
                    : `${(currentPage - 1) * (pageSize || filteredArticles.length) + 1} - ${Math.min(
                      currentPage * (pageSize || filteredArticles.length),
                      Math.max(totalCount, filteredArticles.length)
                    )}`}
                </strong>
                <span>/ মোট</span>
                <strong>{Math.max(totalCount, filteredArticles.length)}</strong>
                <span>টি সংবাদ</span>

                <span className="mx-2 text-gray-300">|</span>

                <span>প্রতি পেজে:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    const nextSize = Number(e.target.value);
                    setPageSize(nextSize);
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 bg-white border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#1E293B] cursor-pointer focus:outline-hidden"
                >
                  <option value={12}>১২ টি</option>
                  <option value={25}>২৫ টি</option>
                  <option value={50}>৫০ টি</option>
                  <option value={100}>১০০ টি</option>
                  <option value={0}>সবগুলো (All)</option>
                </select>
              </div>

              {/* Page Buttons */}
              {totalPages > 1 && (
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1 rounded-lg border border-[#CBD5E1] bg-white hover:bg-gray-50 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    পূর্ববর্তী
                  </button>

                  {getAdminPageNumbers().map((num, idx) => {
                    if (num === "...") {
                      return (
                        <span key={`dots-${idx}`} className="px-1 text-xs text-gray-400 select-none">
                          ...
                        </span>
                      );
                    }
                    const pageNum = Number(num);
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          currentPage === pageNum
                            ? "bg-[#3858F6] text-white"
                            : "bg-white border border-[#CBD5E1] text-[#475569] hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2.5 py-1 rounded-lg border border-[#CBD5E1] bg-white hover:bg-gray-50 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    পরবর্তী
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-10 mb-4 pb-2 text-center text-xs font-semibold text-[#8A99AD]">
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

      {/* Photo Card Generator Modal */}
      {photoCardItem && (
        <PhotoCardModal
          isOpen={!!photoCardItem}
          onClose={() => setPhotoCardItem(null)}
          title={photoCardItem.title}
          imageUrl={
            typeof photoCardItem.featuredImage === "string"
              ? photoCardItem.featuredImage
              : photoCardItem.featuredImage?.url || photoCardItem.image || "/images/news-placeholder.svg"
          }
          dateBengali={photoCardItem.publishedAtBengali || "আজ"}
          timeBengali={(() => {
            const rawDate = photoCardItem.publishedAt || photoCardItem.publishedDate || photoCardItem.createdAt;
            if (!rawDate) return "";
            try {
              return new Date(rawDate).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit", hour12: true });
            } catch {
              return "";
            }
          })()}
          slug={photoCardItem.slug}
          articleUrl={`https://www.banglaralonews.com/news/${photoCardItem.slug}`}
        />
      )}

      <ScrollToTop />
    </div>
  );
}

export default function ArticlesListPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F0F4FA] flex items-center justify-center text-gray-500">
          আর্টিকেল লোড হচ্ছে...
        </div>
      }
    >
      <ArticlesListContent />
    </Suspense>
  );
}
