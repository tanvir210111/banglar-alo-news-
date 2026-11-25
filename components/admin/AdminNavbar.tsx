"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, ChevronDown, User, Settings, Contact, HelpCircle, LogOut, Crown } from "lucide-react";
import { getAdminUser, removeAuthToken } from "@/services/apiClient";

interface AdminNavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function AdminNavbar({
  onToggleSidebar,
  isSidebarOpen,
}: AdminNavbarProps) {
  const router = useRouter();
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setCurrentUser(getAdminUser());
  }, []);

  const handleSignOut = () => {
    setIsAdminDropdownOpen(false);
    removeAuthToken();
    router.push("/admin/login");
    router.refresh();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAdminDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full h-[60px] bg-white border-b border-[#E8EEF8] flex items-center shadow-2xs">
      {/* Left side: Brand Logo aligned perfectly with sidebar column */}
      <div
        className={`flex items-center px-4 sm:px-6 border-r border-[#E8EEF8] h-full shrink-0 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-[270px]" : "w-auto border-r-0 pr-4"
        }`}
      >
        {/* Brand with official logo */}
        <Link href="/admin" className="flex items-center gap-2.5 select-none group">
          <Image
            src="/images/logo-icon.png"
            alt="Banglar Alo News Logo"
            width={32}
            height={32}
            className="w-8 h-8 object-contain rounded-full shrink-0 shadow-xs"
          />
          <span className="text-[17px] font-black tracking-tight text-[#0A2540]">
            বাংলার আলো নিউজ
          </span>
        </Link>
      </div>

      {/* Main Content Header Area: Hamburger + HOME aligned directly above Dashboard Title */}
      <div className="flex-1 flex items-center justify-between px-4 sm:px-5 lg:px-6 h-full min-w-0">
        {/* Hamburger + HOME Link */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle Sidebar"
            className="p-1.5 -ml-1.5 rounded-lg text-[#0B7A43] hover:bg-[#F4F7FC] transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5 stroke-[2.2]" />
          </button>

          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] font-bold text-[#0B7A43] hover:text-[#065F34] tracking-wide uppercase transition-colors"
          >
            HOME
          </Link>
        </div>

        {/* Right side: User profile with orange avatar + Admin dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsAdminDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full hover:bg-[#F4F7FC] transition-colors cursor-pointer select-none"
            aria-expanded={isAdminDropdownOpen}
          >
            {/* Orange circular avatar icon */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF6B4A] to-[#F97316] flex items-center justify-center text-white shadow-2xs shrink-0">
              {currentUser?.role === "Super_Admin" ? (
                <Crown className="w-4 h-4 text-amber-200 fill-amber-200" />
              ) : (
                <User className="w-4 h-4 fill-white" />
              )}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-[#2B3674] leading-tight">
                {currentUser?.fullName || "Super Admin"}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold leading-tight">
                {currentUser?.role === "Super_Admin" ? "Super Admin" : (currentUser?.role || "Admin")}
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#2B3674] transition-transform duration-200 ${
                isAdminDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu matching user screenshot */}
          {isAdminDropdownOpen && (
            <div className="absolute right-0 mt-2.5 w-60 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Little top pointer arrow */}
              <div className="absolute -top-1.5 right-5 w-3 h-3 bg-white border-t border-l border-[#E2E8F0] rotate-45" />

              {/* Header Title: User profile */}
              <div className="px-4 py-2.5 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[13px] font-bold text-[#1E293B] truncate">
                      {currentUser?.name || currentUser?.fullName || "অ্যাডমিন"}
                    </h3>
                    <p className="text-[11px] text-[#64748B] truncate">
                      {currentUser?.email || ""}
                    </p>
                  </div>
                </div>
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{currentUser?.role || "Super_Admin"}</span>
                </div>
              </div>

              {/* Group 1: Account Settings & Developer */}
              <div className="py-1">
                <Link
                  href="/admin/accounts"
                  onClick={() => setIsAdminDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-[13.5px] text-[#1E293B] hover:bg-[#F8FAFC] transition-colors"
                >
                  <Settings className="w-[17px] h-[17px] text-[#6366F1] stroke-[2]" />
                  <span>Account Management</span>
                </Link>

                <Link
                  href="/admin/settings"
                  onClick={() => setIsAdminDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-[13.5px] text-[#1E293B] hover:bg-[#F8FAFC] transition-colors"
                >
                  <Contact className="w-[17px] h-[17px] text-[#4F46E5] stroke-[2]" />
                  <span>Website Settings</span>
                </Link>
              </div>

              {/* Divider */}
              <div className="border-t border-[#F1F5F9]" />

              {/* Group 2: Need Help? */}
              <div className="py-1">
                <a
                  href="#need-help"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsAdminDropdownOpen(false);
                    alert("সহায়তার জন্য সাপোর্ট টিমে যোগাযোগ করুন: support.shikkhasangbad@gmail.com");
                  }}
                  className="flex items-center gap-3 px-4 py-2 text-[13.5px] text-[#1E293B] hover:bg-[#F8FAFC] transition-colors"
                >
                  <HelpCircle className="w-[17px] h-[17px] text-[#0D9488] stroke-[2]" />
                  <span>Need Help?</span>
                </a>
              </div>

              {/* Divider */}
              <div className="border-t border-[#F1F5F9]" />

              {/* Group 3: Sign Out */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-2 text-[13.5px] text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer font-medium"
                >
                  <LogOut className="w-[17px] h-[17px] text-red-600 stroke-[2]" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
