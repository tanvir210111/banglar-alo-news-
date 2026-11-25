"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Search,
  Filter,
  Trash2,
  Edit3,
  Check,
  X,
  Lock,
  Mail,
  Phone,
  Briefcase,
  Crown,
  KeyRound,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ScrollToTop from "@/components/common/ScrollToTop";
import { api, getAdminUser, canDelete } from "@/services/apiClient";

interface UserDirectoryItem {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: "Super_Admin" | "Admin" | "Editor" | "Reporter" | "Staff" | "Moderator" | "Customer" | string;
  status: "ACTIVE" | "SUSPENDED" | "BLOCKED" | string;
  designation?: string;
  profileImage?: string;
  permissions?: string[];
  createdAt?: string;
}

const ALL_ROLES = [
  { key: "Moderator", label: "Moderator (মডারেটর - ডিফল্ট)", badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { key: "Reporter", label: "Reporter (নিজস্ব প্রতিবেদক)", badgeColor: "bg-orange-100 text-orange-800 border-orange-200" },
  { key: "Editor", label: "Editor (সম্পাদক)", badgeColor: "bg-blue-100 text-blue-800 border-blue-200" },
  { key: "Staff", label: "Staff (স্টাফ)", badgeColor: "bg-teal-100 text-teal-800 border-teal-200" },
  { key: "Admin", label: "Admin (অ্যাডমিন)", badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  { key: "Super_Admin", label: "Super Admin (সুপার অ্যাডমিন)", badgeColor: "bg-purple-100 text-purple-800 border-purple-200" },
  { key: "Customer", label: "Customer (পাঠক)", badgeColor: "bg-gray-100 text-gray-800 border-gray-200" },
];

const PERMISSION_LABELS: Record<string, string> = {
  "news.create": "নিউজ ড্রাফট তৈরি",
  "news.edit": "নিউজ সম্পাদনা",
  "news.publish": "১-ক্লিকে প্রকাশ / আনপাবলিশ",
  "category.manage": "ক্যাটাগরি ম্যানেজমেন্ট",
  "topic.manage": "টপিক ও সাব-ক্যাটাগরি",
  "writer.manage": "লেখক ও প্রতিনিধি ম্যানেজমেন্ট",
  "ad.manage": "বিজ্ঞাপন ক্যাম্পেইন",
  "setting.manage": "সাইট সেটিংস ও তথ্য",
  "user.manage": "ইউজার অ্যাকাউন্ট ম্যানেজমেন্ট",
  "comment.moderate": "কমেন্ট মডারেশন",
};

const DEFAULT_ROLE_PERMS: Record<string, string[]> = {
  Super_Admin: Object.keys(PERMISSION_LABELS),
  Admin: Object.keys(PERMISSION_LABELS),
  Editor: ["news.create", "news.edit", "news.publish", "category.manage", "topic.manage", "writer.manage", "comment.moderate"],
  Reporter: ["news.create", "news.edit"],
  Staff: ["news.create", "news.edit"],
  Moderator: ["comment.moderate", "news.edit"],
  Customer: [],
};

function AccountManagementContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeTabParam = searchParams.get("tab") || (searchParams.get("action") === "create" ? "create" : "all");
  const [activeTab, setActiveTab] = useState<"all" | "create" | "roles">(
    activeTabParam === "create" ? "create" : activeTabParam === "roles" ? "roles" : "all"
  );

  const [users, setUsers] = useState<UserDirectoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Account Form State (DEFAULT ROLE = "Moderator")
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Moderator"); // DEFAULT ROLE MODERATOR
  const [designation, setDesignation] = useState("মডারেটর");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(DEFAULT_ROLE_PERMS.Moderator);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<UserDirectoryItem | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editDesignation, setEditDesignation] = useState("");
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [isUpdatingAccess, setIsUpdatingAccess] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<any[]>("/users/directory?limit=50");
      if (res?.success && Array.isArray(res.data)) {
        setUsers(res.data);
      }
    } catch (err) {
      console.warn("Failed to load users:", err);
      showToast("ইউজার তালিকা লোড করতে সমস্যা হয়েছে");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (activeTabParam === "create" && activeTab !== "create") setActiveTab("create");
    else if (activeTabParam === "roles" && activeTab !== "roles") setActiveTab("roles");
  }, [activeTabParam]);

  // When selected role changes in creation form, update default permissions preset
  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    if (newRole === "Moderator") setDesignation("মডারেটর");
    else if (newRole === "Reporter") setDesignation("নিজস্ব প্রতিবেদক");
    else if (newRole === "Editor") setDesignation("সহকারী বার্তা সম্পাদক");
    else if (newRole === "Admin") setDesignation("সিস্টেম অ্যাডমিন");
    else if (newRole === "Staff") setDesignation("স্টাফ");

    const defaultPerms = DEFAULT_ROLE_PERMS[newRole] || [];
    setSelectedPermissions(defaultPerms);
  };

  const togglePermission = (permKey: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permKey) ? prev.filter((k) => k !== permKey) : [...prev, permKey]
    );
  };

  const toggleEditPermission = (permKey: string) => {
    setEditPermissions((prev) =>
      prev.includes(permKey) ? prev.filter((k) => k !== permKey) : [...prev, permKey]
    );
  };

  // Create New Account (Default Role: Moderator)
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      alert("অনুগ্রহ করে নাম, ইমেইল এবং পাসওয়ার্ড পূরণ করুন।");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        password: password.trim(),
        phone: phone.trim() || undefined,
        role: role || "Moderator",
        designation: designation.trim() || undefined,
        permissions: selectedPermissions,
      };

      const res = await api.post("/users/directory", payload);
      if (res?.success) {
        showToast(`🎉 নতুন ${role} অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!`);
        // Reset form to default (Moderator)
        setFullName("");
        setEmail("");
        setPassword("");
        setPhone("");
        setRole("Moderator");
        setDesignation("মডারেটর");
        setSelectedPermissions(DEFAULT_ROLE_PERMS.Moderator);
        setActiveTab("all");
        loadUsers();
      } else {
        showToast(`❌ ${res?.message || "অ্যাকাউন্ট তৈরি করা যায়নি"}`);
      }
    } catch (err: any) {
      showToast("❌ সার্ভার ত্রুটি, পুনরায় চেষ্টা করুন");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle User Status (ACTIVE / SUSPENDED)
  const handleToggleStatus = async (user: UserDirectoryItem) => {
    const nextStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const res = await api.patch(`/users/directory/${user.id}/status`, { status: nextStatus });
      if (res?.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
        );
        showToast(`ইউজার স্ট্যাটাস পরিবর্তন হয়েছে: ${nextStatus}`);
      } else {
        showToast(res?.message || "স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি");
      }
    } catch {
      showToast("স্ট্যাটাস আপডেট ব্যর্থ হয়েছে");
    }
  };

  // Open Edit Access Modal
  const openEditModal = (u: UserDirectoryItem) => {
    setEditingUser(u);
    setEditRole(u.role);
    setEditDesignation(u.designation || "");
    setEditPermissions(u.permissions || DEFAULT_ROLE_PERMS[u.role] || []);
  };

  // Save Edit Access
  const handleSaveAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsUpdatingAccess(true);
    try {
      const payload = {
        role: editRole,
        designation: editDesignation.trim() || undefined,
        permissions: editPermissions,
      };

      const res = await api.patch(`/users/directory/${editingUser.id}/access`, payload);
      if (res?.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id
              ? { ...u, role: editRole, designation: editDesignation, permissions: editPermissions }
              : u
          )
        );
        showToast("রোল ও পারমিশন সফলভাবে আপডেট করা হয়েছে!");
        setEditingUser(null);
      } else {
        showToast(res?.message || "আপডেট করা সম্ভব হয়নি");
      }
    } catch {
      showToast("আপডেট ব্যর্থ হয়েছে");
    } finally {
      setIsUpdatingAccess(false);
    }
  };

  // Delete User (Strictly super.admin@gmail.com only)
  const handleDeleteUser = async (u: UserDirectoryItem) => {
    if (!canDelete()) {
      alert("ডিলিট করার অনুমতি শুধুমাত্র super.admin@gmail.com এর রয়েছে।");
      return;
    }
    const currentAdmin = getAdminUser();
    const isSelf =
      (currentAdmin?.email && u.email?.toLowerCase() === currentAdmin.email.toLowerCase()) ||
      u.email === "editor@banglaralonews.com";

    if (isSelf) {
      alert("আপনি বর্তমানে লগইন থাকা নিজের প্রধান সুপার অ্যাডমিন অ্যাকাউন্ট ডিলিট করতে পারবেন না!");
      return;
    }

    if (!confirm(`আপনি কি নিশ্চিত যে "${u.fullName}" (${u.role}) অ্যাকাউন্টটি সম্পূর্ণ মুছে ফেলতে চান?`)) {
      return;
    }

    try {
      const res = await api.delete(`/users/directory/${u.id}`);
      if (res?.success) {
        setUsers((prev) => prev.filter((item) => item.id !== u.id));
        showToast("অ্যাকাউন্ট সফলভাবে ডিলিট করা হয়েছে");
      } else {
        showToast(res?.message || "ডিলিট করা সম্ভব হয়নি");
      }
    } catch {
      showToast("ডিলিট ব্যর্থ হয়েছে");
    }
  };

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (selectedRoleFilter !== "all" && u.role !== selectedRoleFilter) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = u.fullName?.toLowerCase().includes(q);
        const matchesEmail = u.email?.toLowerCase().includes(q);
        const matchesPhone = u.phone?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone) return false;
      }
      return true;
    });
  }, [users, searchQuery, selectedRoleFilter]);

  return (
    <div className="min-h-screen bg-[#F0F4FA] text-[#1E293B] flex flex-col font-sans">
      <AdminNavbar
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex-1 flex">
        <AdminSidebar isOpen={isSidebarOpen} activePath="/admin/accounts" />

        <main className="flex-1 w-full p-4 sm:px-6 sm:py-5 min-w-0 flex flex-col">
          {/* Top Banner: Super Admin Identity Notification */}
          <div className="bg-gradient-to-r from-[#1E1B4B] via-[#312E81] to-[#4338CA] text-white rounded-2xl p-4 sm:p-5 shadow-sm mb-5 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
                <Crown className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-extrabold tracking-widest text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-300/20">
                    SUPER ADMIN ACCESS
                  </span>
                  <span className="text-xs text-indigo-200">
                    পূর্ণ নিয়ন্ত্রক কর্তৃত্ব সক্রিয়
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                  Account Management & Role Authority
                </h1>
                <p className="text-xs text-indigo-200 mt-0.5">
                  আপনি সুপার অ্যাডমিন হিসেবে সকল ইউজার ও রোল পরিচালনা করছেন। নতুন যে কোনো অ্যাকাউন্ট তৈরি হলে তা স্বয়ংক্রিয়ভাবে <strong className="text-emerald-300">মডারেটর (Moderator)</strong> হিসেবে অন্তর্ভুক্ত হবে।
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("create")}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>নতুন অ্যাকাউন্ট তৈরি</span>
              </button>
            </div>
          </div>

          {/* Toast Message */}
          {toastMessage && (
            <div className="mb-4 p-3.5 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-xs animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">{toastMessage}</span>
            </div>
          )}

          {/* Tabs Navigation */}
          <div className="flex items-center gap-2 border-b border-[#D5E1F5] pb-3 mb-5">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === "all"
                  ? "bg-[#0B7A43] text-white shadow-xs"
                  : "bg-white text-[#4A5568] hover:bg-[#F4F7FC] border border-[#E2E8F0]"
                }`}
            >
              <Users className="w-4 h-4" />
              <span>সকল অ্যাকাউন্ট ({users.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("create")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === "create"
                  ? "bg-[#0B7A43] text-white shadow-xs"
                  : "bg-white text-[#4A5568] hover:bg-[#F4F7FC] border border-[#E2E8F0]"
                }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>নতুন অ্যাকাউন্ট তৈরি (মডারেটর)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("roles")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === "roles"
                  ? "bg-[#0B7A43] text-white shadow-xs"
                  : "bg-white text-[#4A5568] hover:bg-[#F4F7FC] border border-[#E2E8F0]"
                }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>রোল ও পারমিশন ম্যাট্রিক্স</span>
            </button>
          </div>

          {/* TAB 1: ALL ACCOUNTS LIST */}
          {activeTab === "all" && (
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="bg-white p-3.5 rounded-2xl border border-[#E8EEF8] shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A3AED0]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="নাম, ইমেইল অথবা ফোন নম্বর খুঁজুন..."
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#F4F7FC] border border-transparent rounded-xl focus:bg-white focus:border-[#0B7A43] focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="w-4 h-4 text-[#718096]" />
                  <select
                    value={selectedRoleFilter}
                    onChange={(e) => setSelectedRoleFilter(e.target.value)}
                    className="px-3 py-2 text-xs sm:text-sm bg-[#F4F7FC] rounded-xl border border-transparent focus:bg-white focus:border-[#0B7A43] focus:outline-none cursor-pointer"
                  >
                    <option value="all">সকল রোল (All Roles)</option>
                    {ALL_ROLES.map((r) => (
                      <option key={r.key} value={r.key}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-2xl border border-[#E8EEF8] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-[#F8FAFD] border-b border-[#E8EEF8] text-[#718096] uppercase text-[11px] font-bold tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4">ইউজার / নাম</th>
                        <th className="py-3.5 px-4">রোল (Role)</th>
                        <th className="py-3.5 px-4">পদবী</th>
                        <th className="py-3.5 px-4">অনুমোদিত পারমিশন</th>
                        <th className="py-3.5 px-4">স্ট্যাটাস</th>
                        <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8EEF8]">
                      {isLoading ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-500">
                            ইউজার তালিকা লোড হচ্ছে...
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-500">
                            কোনো অ্যাকাউন্ট পাওয়া যায়নি।
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => {
                          const roleObj = ALL_ROLES.find((r) => r.key === u.role);
                          const isSuper = u.role === "Super_Admin";
                          const currentAdmin = getAdminUser();
                          const isSelf =
                            (currentAdmin?.email && u.email?.toLowerCase() === currentAdmin.email.toLowerCase()) ||
                            u.email === "editor@banglaralonews.com";
                          return (
                            <tr key={u.id} className="hover:bg-[#F9FBFF] transition-colors">
                              {/* User Info */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${isSuper ? "bg-amber-100 text-amber-800" : "bg-indigo-100 text-indigo-700"
                                    }`}>
                                    {u.fullName?.charAt(0) || "U"}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <p className="font-bold text-[#0A2540] truncate text-xs sm:text-sm">
                                        {u.fullName}
                                      </p>
                                      {isSuper && (
                                        <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                      )}
                                    </div>
                                    <p className="text-[11px] text-[#718096] flex items-center gap-1 mt-0.5 truncate">
                                      <Mail className="w-3 h-3" />
                                      {u.email}
                                    </p>
                                    {u.phone && (
                                      <p className="text-[11px] text-[#718096] flex items-center gap-1">
                                        <Phone className="w-3 h-3" />
                                        {u.phone}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Role */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className={`px-2.5 py-1 text-[11px] font-extrabold rounded-full border ${roleObj?.badgeColor || "bg-gray-100 text-gray-800"
                                  }`}>
                                  {u.role === "Super_Admin" ? "Super Admin" : u.role}
                                </span>
                              </td>

                              {/* Designation */}
                              <td className="py-3 px-4 whitespace-nowrap text-[#4A5568]">
                                {u.designation || "-"}
                              </td>

                              {/* Permissions Count */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1 flex-wrap max-w-xs">
                                  {isSuper ? (
                                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10.5px] font-bold rounded border border-amber-200">
                                      সব পারমিশন সক্রিয় (Full Access)
                                    </span>
                                  ) : u.permissions && u.permissions.length > 0 ? (
                                    u.permissions.slice(0, 3).map((p) => (
                                      <span key={p} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium rounded border border-blue-200">
                                        {PERMISSION_LABELS[p] || p}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-[11px] text-gray-400">কোনো পারমিশন নেই</span>
                                  )}
                                  {!isSuper && u.permissions && u.permissions.length > 3 && (
                                    <span className="text-[10.5px] font-bold text-gray-500">
                                      +{u.permissions.length - 3}টি
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Status */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(u)}
                                  disabled={isSuper}
                                  title={isSuper ? "সুপার অ্যাডমিন স্ট্যাটাস অপরিবর্তনীয়" : "ক্লিক করে অ্যাক্টিভ/সাসপেন্ড পরিবর্তন করুন"}
                                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all ${u.status === "ACTIVE"
                                      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                      : "bg-red-100 text-red-800 hover:bg-red-200"
                                    } ${isSuper ? "opacity-90 cursor-default" : "cursor-pointer"}`}
                                >
                                  {u.status === "ACTIVE" ? "Active" : "Suspended"}
                                </button>
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => openEditModal(u)}
                                    title="রোল ও পারমিশন পরিবর্তন করুন"
                                    className="p-1.5 rounded-lg text-[#0B7A43] hover:bg-[#ECFDF5] transition-colors cursor-pointer"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>

                                  {!isSelf && (
                                    <button
                                      type="button"
                                      disabled={!canDelete()}
                                      onClick={() => {
                                        if (!canDelete()) {
                                          alert("ডিলিট করার অনুমতি শুধুমাত্র super.admin@gmail.com এর রয়েছে।");
                                          return;
                                        }
                                        handleDeleteUser(u);
                                      }}
                                      title={
                                        canDelete()
                                          ? "অ্যাকাউন্ট ডিলিট করুন"
                                          : "ডিলিট করার অনুমতি শুধুমাত্র super.admin@gmail.com এর রয়েছে"
                                      }
                                      className={`p-1.5 rounded-lg transition-colors ${canDelete()
                                          ? "text-red-600 hover:bg-red-50 cursor-pointer"
                                          : "text-gray-300 cursor-not-allowed opacity-40"
                                        }`}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CREATE NEW ACCOUNT (DEFAULT ROLE: MODERATOR) */}
          {activeTab === "create" && (
            <div className="bg-white rounded-2xl border border-[#D5E1F5] shadow-xs p-5 sm:p-6 max-w-3xl">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4 mb-5">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#0A2540]">
                    Create New Staff / Moderator Account
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    সুপার অ্যাডমিন ছাড়া নতুন তৈরিকৃত প্রতিটি অ্যাকাউন্টে স্বয়ংক্রিয়ভাবে <strong>Moderator (মডারেটর)</strong> রোল নির্ধারিত থাকবে।
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full border border-emerald-200">
                  Default: Moderator
                </span>
              </div>

              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-[13px] font-semibold text-[#334155] mb-1.5">
                      পূর্ণ নাম (Full Name) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. তানভীর হাসান"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full text-[13.5px] px-3.5 py-2 border border-[#CBD5E1] rounded-xl outline-none focus:border-[#0B7A43] focus:ring-1 focus:ring-[#0B7A43]"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[13px] font-semibold text-[#334155] mb-1.5">
                      ইমেইল (Email) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. moderator@banglaralonews.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-[13.5px] px-3.5 py-2 border border-[#CBD5E1] rounded-xl outline-none focus:border-[#0B7A43] focus:ring-1 focus:ring-[#0B7A43]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Password */}
                  <div>
                    <label className="block text-[13px] font-semibold text-[#334155] mb-1.5">
                      পাসওয়ার্ড (Password) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="মিনিমাম ৬ ডিজিটের পাসওয়ার্ড"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full text-[13.5px] px-3.5 py-2 border border-[#CBD5E1] rounded-xl outline-none focus:border-[#0B7A43] focus:ring-1 focus:ring-[#0B7A43]"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[13px] font-semibold text-[#334155] mb-1.5">
                      মোবাইল নম্বর (Phone)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 01712345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-[13.5px] px-3.5 py-2 border border-[#CBD5E1] rounded-xl outline-none focus:border-[#0B7A43] focus:ring-1 focus:ring-[#0B7A43]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Role Dropdown (Default Moderator) */}
                  <div>
                    <label className="block text-[13px] font-semibold text-[#334155] mb-1.5">
                      অ্যাকাউন্ট রোল (Role) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={role}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      className="w-full text-[13.5px] px-3.5 py-2 border border-[#CBD5E1] rounded-xl bg-white font-bold text-[#16A34A] outline-none focus:border-[#0B7A43] focus:ring-1 focus:ring-[#0B7A43] cursor-pointer"
                    >
                      {ALL_ROLES.map((r) => (
                        <option key={r.key} value={r.key} className="text-[#1E293B] font-normal">
                          {r.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11.5px] text-[#64748B] mt-1">
                      ডিফল্ট হিসেবে <strong className="text-emerald-700">Moderator</strong> নির্বাচিত রয়েছে।
                    </p>
                  </div>

                  {/* Designation */}
                  <div>
                    <label className="block text-[13px] font-semibold text-[#334155] mb-1.5">
                      অফিসিয়াল পদবী (Designation)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. কন্টেন্ট ও কমেন্ট মডারেটর"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full text-[13.5px] px-3.5 py-2 border border-[#CBD5E1] rounded-xl outline-none focus:border-[#0B7A43] focus:ring-1 focus:ring-[#0B7A43]"
                    />
                  </div>
                </div>

                {/* Granular Permissions Checkboxes */}
                <div className="pt-3 border-t border-[#F1F5F9]">
                  <label className="block text-[13px] font-bold text-[#334155] mb-2">
                    অনুমোদিত পারমিশনসমূহ ({selectedPermissions.length} টি নির্বাচিত)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5 bg-[#F8FAFD] rounded-xl border border-[#E8EEF8]">
                    {Object.entries(PERMISSION_LABELS).map(([permKey, label]) => {
                      const isChecked = selectedPermissions.includes(permKey);
                      return (
                        <label
                          key={permKey}
                          className="flex items-center gap-2.5 text-xs text-[#334155] hover:text-[#0B7A43] cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(permKey)}
                            className="rounded border-[#CBD5E1] text-[#0B7A43] focus:ring-[#0B7A43] w-4 h-4 cursor-pointer"
                          />
                          <span className={isChecked ? "font-bold text-[#0A2540]" : "font-normal"}>
                            {label} (<code className="text-[10px] text-gray-500">{permKey}</code>)
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#00875A] hover:bg-[#00704A] disabled:opacity-60 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>অ্যাকাউন্ট তৈরি হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>নতুন {role} অ্যাকাউন্ট যুক্ত করুন</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: ROLES & PERMISSIONS MATRIX */}
          {activeTab === "roles" && (
            <div className="bg-white rounded-2xl border border-[#D5E1F5] shadow-xs p-5 sm:p-6 space-y-6">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#0A2540]">
                  System Role Hierarchy & Authority Presets
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  বাংলার আলো নিউজ পোর্টালের বিভিন্ন রোল ও তাদের স্বাভাবিক অধিকারসমূহ নিচে উল্লেখ করা হলো।
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Super Admin */}
                <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-5 h-5 text-purple-700" />
                    <h3 className="font-bold text-sm text-purple-900">1. Super Admin (আপনি)</h3>
                  </div>
                  <p className="text-xs text-purple-800 leading-relaxed mb-3">
                    সম্পূর্ণ সিস্টেমের সর্বোচ্চ নিয়ন্ত্রক। শুধু সুপার অ্যাডমিনের নিউজ, ক্যাটাগরি, টিম বা যেকোনো ইউজার ডিলিট করার একচ্ছত্র অধিকার রয়েছে।
                  </p>
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                    সকল পারমিশন সক্রিয় + একচ্ছত্র ডিলিট
                  </span>
                </div>

                {/* 2. Moderator (DEFAULT) */}
                <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 relative overflow-hidden">
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded-full uppercase">
                    Default New Account
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-700" />
                    <h3 className="font-bold text-sm text-emerald-900">2. Moderator (মডারেটর)</h3>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed mb-3">
                    নতুন অ্যাকাউন্ট ক্রিয়েট হলে স্বয়ংক্রিয়ভাবে মডারেটর হয়। পাঠকদের কমেন্ট মডারেশন করা এবং নিউজ নিরীক্ষণ করার দায়িত্ব পালন করে।
                  </p>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    comment.moderate, news.edit
                  </span>
                </div>

                {/* 3. Editor */}
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-5 h-5 text-blue-700" />
                    <h3 className="font-bold text-sm text-blue-900">3. Editor (বার্তা সম্পাদক)</h3>
                  </div>
                  <p className="text-xs text-blue-800 leading-relaxed mb-3">
                    নিউজ তৈরি, সম্পাদনা, সরাসরি লাইভ প্রকাশ, আনপাবলিশ, ক্যাটাগরি ও রাইটারদের পরিচালনা করতে পারেন।
                  </p>
                  <span className="text-[11px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                    news.publish, category.manage, writer.manage
                  </span>
                </div>

                {/* 4. Reporter */}
                <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/40">
                  <div className="flex items-center gap-2 mb-2">
                    <Edit3 className="w-5 h-5 text-orange-700" />
                    <h3 className="font-bold text-sm text-orange-900">4. Reporter (সংবাদদাতা)</h3>
                  </div>
                  <p className="text-xs text-orange-800 leading-relaxed mb-3">
                    মাঠ পর্যায়ের সাংবাদিক ও নিজস্ব প্রতিনিধি। নিউজ ড্রাফট তৈরি ও এডিট করতে পারেন; সম্পাদকের অনুমোদনের পর তা লাইভ হয়।
                  </p>
                  <span className="text-[11px] font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded">
                    news.create, news.edit
                  </span>
                </div>

                {/* 5. Admin */}
                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-indigo-700" />
                    <h3 className="font-bold text-sm text-indigo-900">5. Admin (অ্যাডমিন)</h3>
                  </div>
                  <p className="text-xs text-indigo-800 leading-relaxed mb-3">
                    সাইটের দৈনন্দিন ব্যবস্থাপনা ও বিজ্ঞাপন পরিচালনা করেন (কিন্তু কোনো কিছু পার্মানেন্ট ডিলিট করার ক্ষমতা নেই)।
                  </p>
                  <span className="text-[11px] font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">
                    ad.manage, setting.manage, user.manage
                  </span>
                </div>

                {/* 6. Customer */}
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-gray-700" />
                    <h3 className="font-bold text-sm text-gray-900">6. Customer (পাঠক)</h3>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed mb-3">
                    সাধারণ নিবন্ধিত পাঠক। যেকোনো সংবাদে কমেন্ট করা, লাইক/ডিসলাইক দেওয়া এবং বুকমার্ক করার সুবিধা পান।
                  </p>
                  <span className="text-[11px] font-bold text-gray-600 bg-gray-200 px-2 py-0.5 rounded">
                    পাঠক অধিকার
                  </span>
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
              className="text-[#0B7A43] hover:underline"
            >
              Banglar Alo IT
            </a>
          </div>
        </main>
      </div>

      {/* EDIT ROLE & ACCESS MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <div>
                <h3 className="text-base font-bold text-[#0A2540]">
                  ইউজার রোল ও পারমিশন সম্পাদন
                </h3>
                <p className="text-xs text-gray-500">
                  {editingUser.fullName} ({editingUser.email})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccess} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  রোল নির্বাচন (Role)
                </label>
                <select
                  value={editRole}
                  onChange={(e) => {
                    const r = e.target.value;
                    setEditRole(r);
                    setEditPermissions(DEFAULT_ROLE_PERMS[r] || []);
                  }}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-xl outline-none focus:border-blue-500"
                >
                  {ALL_ROLES.map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  পদবী (Designation)
                </label>
                <input
                  type="text"
                  value={editDesignation}
                  onChange={(e) => setEditDesignation(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  অনুমোদিত পারমিশনসমূহ
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 max-h-48 overflow-y-auto">
                  {Object.entries(PERMISSION_LABELS).map(([permKey, label]) => {
                    const isChecked = editPermissions.includes(permKey);
                    return (
                      <label key={permKey} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleEditPermission(permKey)}
                          className="rounded text-blue-600 w-3.5 h-3.5"
                        />
                        <span>{label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingAccess}
                  className="px-5 py-2 text-xs font-bold bg-[#0B7A43] hover:bg-[#2B44C7] text-white rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  {isUpdatingAccess ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ScrollToTop />
    </div>
  );
}

export default function AccountManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F0F4FA] flex items-center justify-center text-gray-500">
          অ্যাকাউন্ট ম্যানেজমেন্ট লোড হচ্ছে...
        </div>
      }
    >
      <AccountManagementContent />
    </Suspense>
  );
}
