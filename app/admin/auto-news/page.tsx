"use client";

import React, { useState } from "react";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AutoNewsManager from "@/components/admin/AutoNewsManager";
import ScrollToTop from "@/components/common/ScrollToTop";

export default function AutoNewsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#F0F4FA] text-[#1E293B] flex flex-col font-sans">
      {/* Top Navbar */}
      <AdminNavbar
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main Container: Sidebar + Feature Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <AdminSidebar isOpen={isSidebarOpen} activePath="/admin/auto-news" />

        {/* Content Area */}
        <main className="flex-1 w-full p-4 sm:px-6 sm:py-5 min-w-0 flex flex-col justify-between">
          <div className="max-w-6xl mx-auto w-full">
            <AutoNewsManager />
          </div>

          {/* Bottom Footer */}
          <div className="mt-10 sm:mt-12 mb-4 pb-2 text-center text-xs font-semibold text-[#8A99AD]">
            ডিজাইন ও ডেভেলপমেন্ট:{" "}
            <a
              href="https://banglaraloit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1677FF] hover:underline"
            >
              Banglar Alo IT
            </a>
          </div>
        </main>
      </div>

      <ScrollToTop threshold={300} />
    </div>
  );
}
