"use client";

import React, { useState } from "react";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import OurFamilyManager from "@/components/admin/OurFamilyManager";
import ScrollToTop from "@/components/common/ScrollToTop";

export default function AdminOurFamilyPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#F0F4FA] text-[#1E293B] flex flex-col font-sans">
      <AdminNavbar
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex-1 flex">
        <AdminSidebar isOpen={isSidebarOpen} activePath="/admin/our-family" />

        <main className="flex-1 w-full p-4 sm:px-6 sm:py-6 lg:px-8 lg:py-6 min-w-0">
          <OurFamilyManager />
        </main>
      </div>

      <ScrollToTop />
    </div>
  );
}
