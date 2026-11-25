"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated, getAuthToken, getAdminUser, api, saveAdminUser } from "@/services/apiClient";
import { Loader2, ShieldAlert } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      if (pathname === "/admin/login") return true;
      const token = getAuthToken();
      const isAuthed = isAuthenticated();
      const adminUser = getAdminUser();
      return Boolean(token && isAuthed && adminUser);
    }
    return true;
  });

  useEffect(() => {
    // 1. Allow login page without auth check
    if (pathname === "/admin/login") {
      setIsAuthorized(true);
      return;
    }

    // 2. Strict Auth Check (Auto-login is completely OFF: strictly requires real localStorage token)
    const token = getAuthToken();
    const isAuthed = isAuthenticated();
    const adminUser = getAdminUser();

    if (!token || !isAuthed || !adminUser) {
      setIsAuthorized(false);
      router.replace(`/admin/login?returnUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    const staffRoles = ["Super_Admin", "Admin", "Editor", "Publisher", "Reporter"];
    if (adminUser?.role && !staffRoles.includes(adminUser.role)) {
      setIsAuthorized(false);
      router.replace(`/admin/login?error=unauthorized`);
      return;
    }

    // 3. Verify session validity with backend /auth/me
    api.get("/auth/me").then((res) => {
      if (res?.success && res.data) {
        saveAdminUser(res.data);
      }
    }).catch(() => {
      // Network hiccup or offline
    });

    setIsAuthorized(true);
  }, [pathname, router]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-[#F0F4FA] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#0756A4] animate-spin" />
        <span className="text-sm font-semibold text-gray-600">অ্যাডমিন নিরাপত্তা যাচাই করা হচ্ছে...</span>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#F0F4FA] flex flex-col items-center justify-center p-4">
        <div className="p-6 bg-white rounded-xl shadow-lg border border-red-100 text-center max-w-sm">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800 mb-1">অ্যাক্সেস সংরক্ষিত</h3>
          <p className="text-xs text-gray-600 mb-4">
            অ্যাডমিন প্যানেলে প্রবেশ করতে অনুগ্রহ করে অনুমোদিত অ্যাডমিন হিসেবে লগইন করুন।
          </p>
          <button
            onClick={() => router.replace(`/admin/login?returnUrl=${encodeURIComponent(pathname)}`)}
            className="w-full py-2 px-4 rounded-lg bg-[#0756A4] text-white text-xs font-bold hover:bg-[#05407c] transition-colors"
          >
            লগইন পেজে যান
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

