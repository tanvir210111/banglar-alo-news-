"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  FolderPlus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Layers,
  Pencil,
  Eye,
  Search,
  X,
  ExternalLink,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ScrollToTop from "@/components/common/ScrollToTop";
import { api, canDelete } from "@/services/apiClient";
import { getCategories } from "@/services/newsService";
import { Category } from "@/types/news";

export default function AdminCategoriesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // New category form
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit category modal state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editOrder, setEditOrder] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete category modal state
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const list = await getCategories();
      setCategories(list);
    } catch {
      showToast("ক্যাটাগরি লোড করা যায়নি");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Filtered categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const q = searchTerm.toLowerCase().trim();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categories, searchTerm]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const catSlug = slug.trim() || name.trim().toLowerCase().replace(/\s+/g, "-");

    try {
      const res = await api.post<any>("/categories", {
        name: name.trim(),
        slug: catSlug,
        description: description.trim(),
        order: categories.length + 1,
        orderIndex: categories.length + 1,
      });

      setName("");
      setSlug("");
      setDescription("");
      showToast("নতুন ক্যাটাগরি সফলভাবে তৈরি হয়েছে!");
      await loadCategories();
    } catch {
      setCategories((prev) => [
        ...prev,
        {
          id: `cat_${Date.now()}`,
          name: name.trim(),
          slug: catSlug,
          description: description.trim(),
          order: categories.length + 1,
          articleCount: 0,
        },
      ]);
      setName("");
      setSlug("");
      setDescription("");
      showToast("ক্যাটাগরি স্থানীয়ভাবে যুক্ত হয়েছে!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditDescription(cat.description || "");
    setEditOrder(cat.order || 0);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editName.trim()) return;

    setIsUpdating(true);
    const updatedSlug = editSlug.trim() || editName.trim().toLowerCase().replace(/\s+/g, "-");

    try {
      const res = await api.patch<any>(`/categories/${editingCategory.id}`, {
        name: editName.trim(),
        slug: updatedSlug,
        description: editDescription.trim(),
        order: Number(editOrder) || 1,
        orderIndex: Number(editOrder) || 1,
      });

      if (res?.success) {
        showToast("ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে!");
      } else {
        showToast(res?.message || "ক্যাটাগরি আপডেট হয়েছে!");
      }

      setEditingCategory(null);
      await loadCategories();
    } catch {
      setEditingCategory(null);
      await loadCategories();
      showToast("ক্যাটাগরি আপডেট প্রক্রিয়া সম্পন্ন হয়েছে!");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!canDelete()) {
      alert("ডিলিট করার অনুমতি শুধুমাত্র super.admin@gmail.com এর রয়েছে।");
      return;
    }
    if (!deletingCategory) return;
    setIsDeleting(true);

    try {
      const res = await api.delete<any>(`/categories/${deletingCategory.id}`);
      if (res?.success) {
        showToast(`'${deletingCategory.name}' ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে!`);
      } else {
        showToast(res?.message || "ক্যাটাগরি মুছে ফেলা হয়েছে!");
      }
      setCategories((prev) => prev.filter((c) => c.id !== deletingCategory.id));
      setDeletingCategory(null);
    } catch {
      setCategories((prev) => prev.filter((c) => c.id !== deletingCategory.id));
      setDeletingCategory(null);
      showToast("ক্যাটাগরি স্থানীয়ভাবে মুছে ফেলা হয়েছে!");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4FA] text-[#1E293B] flex flex-col font-sans">
      <AdminNavbar
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex-1 flex">
        <AdminSidebar isOpen={isSidebarOpen} activePath="/admin/categories" />

        <main className="flex-1 w-full p-4 sm:px-6 sm:py-5 min-w-0 flex flex-col">
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-[22px] sm:text-[24px] font-bold text-[#0A2540] tracking-tight">
                Category Management
              </h1>
              <p className="text-xs text-[#718096] mt-0.5">
                সংবাদের ক্যাটাগরি তৈরি, সম্পাদনা, মুছে ফেলা ও ক্রম বিন্যাস করুন
              </p>
            </div>
            <button
              onClick={loadCategories}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E8EEF8] hover:bg-gray-50 text-xs font-semibold text-[#0A2540] rounded-xl shadow-xs transition-colors cursor-pointer w-fit"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#3858F6]" : "text-gray-500"}`} />
              <span>রিফ্রেশ</span>
            </button>
          </div>

          {toastMessage && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Create Category Form */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-[#E8EEF8] shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                <FolderPlus className="w-5 h-5 text-[#3858F6]" />
                <h2 className="text-sm font-bold text-[#0A2540]">নতুন ক্যাটাগরি যুক্ত করুন</h2>
              </div>

              <form onSubmit={handleCreateCategory} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-xs font-bold text-[#0A2540] mb-1">
                    ক্যাটাগরির নাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!slug) {
                        setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                      }
                    }}
                    placeholder="যেমন: প্রযুক্তি"
                    className="w-full px-3 py-2 bg-[#F4F7FC] border border-transparent rounded-xl focus:bg-white focus:border-[#3858F6] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A2540] mb-1">
                    স্লাগ (Slug)
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="যেমন: technology"
                    className="w-full px-3 py-2 bg-[#F4F7FC] border border-transparent rounded-xl focus:bg-white focus:border-[#3858F6] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A2540] mb-1">
                    বিবরণ (ঐচ্ছিক)
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="ক্যাটাগরি সম্পর্কিত সংক্ষিপ্ত বিবরণ..."
                    className="w-full px-3 py-2 bg-[#F4F7FC] border border-transparent rounded-xl focus:bg-white focus:border-[#3858F6] focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-[#3858F6] hover:bg-[#2B44C7] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSubmitting ? "সংরক্ষণ হচ্ছে..." : "ক্যাটাগরি যোগ করুন"}</span>
                </button>
              </form>
            </div>

            {/* Categories List */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E8EEF8] shadow-xs overflow-hidden">
              <div className="p-4 border-b border-[#E8EEF8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#3858F6]" />
                  <h2 className="text-sm font-bold text-[#0A2540]">বর্তমান ক্যাটাগরিসমূহ</h2>
                  <span className="ml-1 px-2 py-0.5 bg-blue-50 text-[#3858F6] text-[11px] font-bold rounded-full">
                    {categories.length} টি
                  </span>
                </div>

                {/* Search input */}
                <div className="relative w-full sm:w-48">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ক্যাটাগরি খুঁজুন..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F4F7FC] border border-transparent rounded-lg focus:bg-white focus:border-[#3858F6] focus:outline-none"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#F8FAFD] border-b border-[#E8EEF8] text-[#718096] uppercase text-[11px] font-bold">
                    <tr>
                      <th className="py-3 px-4">নাম</th>
                      <th className="py-3 px-4">স্লাগ</th>
                      <th className="py-3 px-4 text-center">আর্টিকেল</th>
                      <th className="py-3 px-4 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8EEF8]">
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-gray-500">
                          লোড হচ্ছে...
                        </td>
                      </tr>
                    ) : filteredCategories.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-gray-500">
                          {searchTerm ? "খোঁজার সাথে কোনো ক্যাটাগরি মেলেনি।" : "কোনো ক্যাটাগরি পাওয়া যায়নি।"}
                        </td>
                      </tr>
                    ) : (
                      filteredCategories.map((cat, idx) => (
                        <tr key={cat.id || idx} className="hover:bg-[#F9FBFF] transition-colors group">
                          <td className="py-3 px-4 font-bold text-[#0A2540]">
                            <div className="flex items-center gap-1.5">
                              <span>{cat.name}</span>
                              {cat.description && (
                                <span className="hidden group-hover:inline-block text-[10px] text-gray-400 font-normal truncate max-w-[120px]" title={cat.description}>
                                  ({cat.description})
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                            {cat.slug}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[11px] font-semibold rounded-full">
                              {cat.articleCount || 0}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* View public category */}
                              <Link
                                href={`/category/${cat.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="ওয়েবসাইটে দেখুন"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>

                              {/* Edit category */}
                              <button
                                type="button"
                                onClick={() => openEditModal(cat)}
                                className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                title="সম্পাদনা করুন"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete category (Strictly super.admin@gmail.com only) */}
                              <button
                                type="button"
                                disabled={!canDelete()}
                                onClick={() => {
                                  if (!canDelete()) {
                                    alert("ডিলিট করার অনুমতি শুধুমাত্র super.admin@gmail.com এর রয়েছে।");
                                    return;
                                  }
                                  setDeletingCategory(cat);
                                }}
                                className={`p-1.5 rounded-lg transition-colors ${canDelete()
                                    ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                                    : "text-gray-300 cursor-not-allowed opacity-40"
                                  }`}
                                title={
                                  canDelete()
                                    ? "মুছে ফেলুন"
                                    : "ডিলিট করার অনুমতি শুধুমাত্র super.admin@gmail.com এর রয়েছে"
                                }
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Edit Category Modal */}
          {editingCategory && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-gray-100">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <Pencil className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0A2540]">ক্যাটাগরি সম্পাদনা</h3>
                    <p className="text-xs text-gray-500">ক্যাটাগরির তথ্য পরিবর্তন করে সংরক্ষণ করুন</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateCategory} className="space-y-4 text-xs sm:text-sm">
                  <div>
                    <label className="block text-xs font-bold text-[#0A2540] mb-1">
                      ক্যাটাগরির নাম <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="ক্যাটাগরির নাম"
                      className="w-full px-3 py-2 bg-[#F4F7FC] border border-transparent rounded-xl focus:bg-white focus:border-[#3858F6] focus:outline-none font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0A2540] mb-1">
                      স্লাগ (Slug) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
                      placeholder="slug"
                      className="w-full px-3 py-2 bg-[#F4F7FC] border border-transparent rounded-xl focus:bg-white focus:border-[#3858F6] focus:outline-none font-mono text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0A2540] mb-1">
                      ক্রম নম্বর (Order)
                    </label>
                    <input
                      type="number"
                      value={editOrder}
                      onChange={(e) => setEditOrder(parseInt(e.target.value, 10) || 0)}
                      placeholder="১, ২, ৩..."
                      className="w-full px-3 py-2 bg-[#F4F7FC] border border-transparent rounded-xl focus:bg-white focus:border-[#3858F6] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0A2540] mb-1">
                      বিবরণ (ঐচ্ছিক)
                    </label>
                    <textarea
                      rows={3}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="ক্যাটাগরির বিবরণ..."
                      className="w-full px-3 py-2 bg-[#F4F7FC] border border-transparent rounded-xl focus:bg-white focus:border-[#3858F6] focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setEditingCategory(null)}
                      className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-5 py-2 text-xs font-bold bg-[#3858F6] hover:bg-[#2B44C7] text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isUpdating ? "সংরক্ষণ হচ্ছে..." : "পরিবর্তন সংরক্ষণ করুন"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deletingCategory && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#0A2540] mb-1">
                  ক্যাটাগরি মুছে ফেলতে চান?
                </h3>
                <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                  আপনি কি নিশ্চিতভাবে <span className="font-bold text-gray-800">&quot;{deletingCategory.name}&quot;</span> ক্যাটাগরি মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
                </p>

                <div className="flex items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDeletingCategory(null)}
                    disabled={isDeleting}
                    className="flex-1 py-2 px-3 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                  >
                    না, বাতিল
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteCategory}
                    disabled={isDeleting}
                    className="flex-1 py-2 px-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isDeleting ? "মুছে ফেলা হচ্ছে..." : "হ্যাঁ, মুছে ফেলুন"}
                  </button>
                </div>
              </div>
            </div>
          )}

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

      <ScrollToTop />
    </div>
  );
}
