"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  Archive,
  Calendar,
  Search,
  Filter,
  RotateCcw,
  ExternalLink,
  FileEdit,
  Camera,
  Clock,
  ChevronRight,
  Eye,
} from "lucide-react";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Article, Category } from "@/types/news";
import {
  getCategories,
  getArchiveArticles,
  cleanNewsImageUrl,
  formatToBengaliDate,
} from "@/services/newsService";

export default function AdminArchivePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [specificDate, setSpecificDate] = useState("");
  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");
  const [category, setCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        setIsLoading(true);
        const [cats, initialList] = await Promise.all([
          getCategories(),
          getArchiveArticles({ limit: 50 } as any),
        ]);
        if (isMounted) {
          setCategories(cats || []);
          setArticles(initialList || []);
        }
      } catch (err) {
        console.warn("Failed to load archive articles:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    startTransition(async () => {
      setIsLoading(true);
      try {
        const res = await getArchiveArticles({
          date: specificDate || undefined,
          year: !specificDate ? year : undefined,
          month: !specificDate ? month : undefined,
          category,
          query: searchQuery,
        });
        setArticles(res || []);
        setCurrentPage(1);
      } catch (err) {
        console.warn("Archive search failed:", err);
      } finally {
        setIsLoading(false);
      }
    });
  };

  const handleReset = () => {
    setSpecificDate("");
    setYear("all");
    setMonth("all");
    setCategory("all");
    setSearchQuery("");
    startTransition(async () => {
      setIsLoading(true);
      const res = await getArchiveArticles({ limit: 50 } as any);
      setArticles(res || []);
      setCurrentPage(1);
      setIsLoading(false);
    });
  };

  const bengaliMonths = [
    { value: "01", label: "জানুয়ারি" },
    { value: "02", label: "ফেব্রুয়ারি" },
    { value: "03", label: "মার্চ" },
    { value: "04", label: "এপ্রিল" },
    { value: "05", label: "মে" },
    { value: "06", label: "জুন" },
    { value: "07", label: "জুলাই" },
    { value: "08", label: "আগস্ট" },
    { value: "09", label: "সেপ্টেম্বর" },
    { value: "10", label: "অক্টোবর" },
    { value: "11", label: "নভেম্বর" },
    { value: "12", label: "ডিসেম্বর" },
  ];

  const years = ["2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018"];

  const totalPages = Math.max(1, Math.ceil(articles.length / pageSize));
  const paginatedArticles = articles.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="min-h-screen bg-[#F0F4FA] text-[#1E293B] flex flex-col font-sans">
      <AdminNavbar
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex-1 flex">
        <AdminSidebar isOpen={isSidebarOpen} activePath="/admin/archive" />

        <main className="flex-1 w-full p-4 sm:px-6 sm:py-5 min-w-0 flex flex-col space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Archive className="w-6 h-6 text-[#0756A4]" />
                <h1 className="text-[22px] sm:text-[24px] font-bold text-[#0A2540] tracking-tight">
                  News Archive (সংবাদ আর্কাইভ)
                </h1>
              </div>
              <p className="text-xs text-[#718096] mt-0.5">
                তারিখ, সাল, মাস ও ক্যাটাগরি অনুযায়ী সকল পুরাতন সংবাদ অনুসন্ধান ও পরিচালনা করুন।
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/archive"
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 border border-[#CCD4DD] text-xs font-semibold text-[#0756A4] rounded-xl shadow-2xs transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>লাইভ আর্কাইভ দেখুন</span>
              </Link>
              <Link
                href="/admin/new-article"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#3858F6] hover:bg-[#2B44C7] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <span>+ New Article</span>
              </Link>
            </div>
          </div>

          {/* Search & Filter Card */}
          <div className="bg-white rounded-2xl border border-[#E8EEF8] p-4 sm:p-5 shadow-xs">
            <form onSubmit={handleSearch} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Specific Date */}
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">
                    নির্দিষ্ট তারিখ:
                  </label>
                  <input
                    type="date"
                    value={specificDate}
                    onChange={(e) => setSpecificDate(e.target.value)}
                    className="w-full bg-[#F8FAFD] border border-[#CBD5E1] rounded-lg px-3 py-1.5 text-xs text-[#1E293B] focus:bg-white focus:outline-hidden focus:border-[#0756A4]"
                  />
                </div>

                {/* Year */}
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">
                    সাল নির্বাচন:
                  </label>
                  <select
                    value={year}
                    disabled={Boolean(specificDate)}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full bg-[#F8FAFD] border border-[#CBD5E1] rounded-lg px-3 py-1.5 text-xs text-[#1E293B] focus:bg-white focus:outline-hidden focus:border-[#0756A4] disabled:opacity-50"
                  >
                    <option value="all">সব সাল</option>
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Month */}
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">
                    মাস নির্বাচন:
                  </label>
                  <select
                    value={month}
                    disabled={Boolean(specificDate)}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full bg-[#F8FAFD] border border-[#CBD5E1] rounded-lg px-3 py-1.5 text-xs text-[#1E293B] focus:bg-white focus:outline-hidden focus:border-[#0756A4] disabled:opacity-50"
                  >
                    <option value="all">সব মাস</option>
                    {bengaliMonths.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">
                    বিভাগ (Category):
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#F8FAFD] border border-[#CBD5E1] rounded-lg px-3 py-1.5 text-xs text-[#1E293B] focus:bg-white focus:outline-hidden focus:border-[#0756A4]"
                  >
                    <option value="all">সকল বিভাগ</option>
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Keyword search */}
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">
                    শিরোনাম অনুসন্ধান:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="খবরের শিরোনাম লিখুন..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#F8FAFD] border border-[#CBD5E1] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#1E293B] focus:bg-white focus:outline-hidden focus:border-[#0756A4]"
                    />
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3.5 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>রিসেট</span>
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-1.5 rounded-lg bg-[#0756A4] hover:bg-[#064785] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors disabled:opacity-50"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{isPending ? "খোঁজা হচ্ছে..." : "অনুসন্ধান করুন"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Archive Articles Table */}
          <div className="bg-white rounded-2xl border border-[#E8EEF8] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#F8FAFD] border-b border-[#E8EEF8] text-[#718096] uppercase text-[11px] font-bold tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">সংবাদ (Article)</th>
                    <th className="py-3.5 px-4">ক্যাটাগরি</th>
                    <th className="py-3.5 px-4">লেখক</th>
                    <th className="py-3.5 px-4">তারিখ</th>
                    <th className="py-3.5 px-4 text-center min-w-[180px]">অ্যাকশন (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8EEF8]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500">
                        আর্কাইভ সংবাদ লোড হচ্ছে...
                      </td>
                    </tr>
                  ) : articles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500">
                        নির্বাচিত ফিল্টারে কোনো আর্কাইভ সংবাদ পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    paginatedArticles.map((article) => {
                      const rawImg =
                        typeof article.featuredImage === "string"
                          ? article.featuredImage
                          : article.featuredImage?.url || "/images/news-placeholder.svg";
                      const img = cleanNewsImageUrl(rawImg);

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
                                {article.summary && (
                                  <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                                    {article.summary}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#0B7A43] border border-emerald-200">
                              {article.category?.name || "জাতীয়"}
                            </span>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap text-xs text-[#4A5568]">
                            {article.author?.name || "নিজস্ব প্রতিবেদক"}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap text-xs text-[#718096]">
                            <span className="flex items-center gap-1 font-medium text-[#1E293B]">
                              <Calendar className="w-3 h-3 text-[#0756A4]" />
                              {article.publishedAtBengali || formatToBengaliDate(article.publishedAt)}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="inline-flex items-center justify-center gap-1.5">
                              <Link
                                href={`/admin/new-article?edit=${article.id}`}
                                title="সম্পাদনা করুন"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors shadow-2xs"
                              >
                                <FileEdit className="w-3.5 h-3.5 text-blue-600" />
                                <span>Edit</span>
                              </Link>

                              <Link
                                href={`/news/${article.slug}`}
                                target="_blank"
                                title="লাইভ সাইটে দেখুন"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors shadow-2xs"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                                <span>View</span>
                              </Link>

                              <Link
                                href={`/photocard?slug=${encodeURIComponent(article.slug || "")}`}
                                target="_blank"
                                title="ফটোকার্ড তৈরি করুন"
                                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-colors shadow-2xs"
                              >
                                <Camera className="w-3.5 h-3.5 text-amber-700" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-[#F8FAFD] border-t border-[#E8EEF8] text-xs text-[#64748B]">
              <div>
                <span>দেখাচ্ছে:</span>{" "}
                <strong>
                  {articles.length === 0
                    ? 0
                    : `${(currentPage - 1) * pageSize + 1} - ${Math.min(
                        currentPage * pageSize,
                        articles.length
                      )}`}
                </strong>{" "}
                <span>/ মোট</span> <strong>{articles.length}</strong> <span>টি সংবাদ</span>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1 rounded-lg border border-[#CBD5E1] bg-white hover:bg-gray-50 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    পূর্ববর্তী
                  </button>

                  <span className="px-2 py-1 text-xs font-bold text-[#0756A4]">
                    পেজ {currentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2.5 py-1 rounded-lg border border-[#CBD5E1] bg-white hover:bg-gray-50 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    পরবর্তী
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
