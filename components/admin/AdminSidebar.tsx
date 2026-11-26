"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Home,
  Image as ImageIcon,
  ChevronDown,
  FileEdit,
  PenTool,
  Zap,
  Bot,
  Radio,
  Headphones,
  BookOpen,
  Film,
  Quote,
  Images,
  Video,
  PieChart,
  Smile,
  FileText,
  Layers,
  CreditCard,
  Users,
  Settings as SettingsIcon,
  Code2,
  ScanFace,
  Shield,
  Layout,
} from "lucide-react";

interface AdminSidebarProps {
  isOpen: boolean;
  activePath?: string;
}

export default function AdminSidebar({
  isOpen,
  activePath = "/admin",
}: AdminSidebarProps) {
  const [userRole, setUserRole] = useState<string>("SUPER_ADMIN");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("banglaralo_user") || localStorage.getItem("banglar_alo_news_user") || localStorage.getItem("admin_user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u.role) setUserRole(u.role);
      }
    } catch { }
  }, []);

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    article: true,
  });

  const toggleSubmenu = (key: string) => {
    setExpandedMenus((prev) => (prev[key] ? {} : { [key]: true }));
  };

  const renderSubMenu = (items: { label: string; href: string }[]) => (
    <div className="pl-9 pr-3 pt-2 pb-2 space-y-2.5">
      {items.map((item, idx) => {
        const isActive = activePath === item.href;
        return (
          <Link
            key={idx}
            href={item.href}
            className={`group flex items-center gap-2.5 py-0.5 text-[13.5px] transition-colors select-none ${isActive
              ? "text-[#0B7A43] font-bold"
              : "text-[#0A2540] font-semibold hover:text-[#0B7A43]"
              }`}
          >
            {isActive ? (
              <span className="w-[6px] h-[6px] rounded-full bg-[#0B7A43] shrink-0 shadow-xs" />
            ) : (
              <span className="w-[6px] h-[6px] rounded-full border border-[#64748B] group-hover:border-[#0B7A43] shrink-0 transition-colors" />
            )}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <aside
      className={`fixed lg:sticky top-[60px] left-0 z-30 h-[calc(100vh-60px)] shrink-0 bg-white border-[#E8EEF8] transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden ${isOpen
        ? "w-[270px] border-r translate-x-0 opacity-100"
        : "w-0 border-r-0 -translate-x-full lg:translate-x-0 lg:w-0 opacity-0 pointer-events-none"
        }`}
      style={{
        scrollbarWidth: isOpen ? "thin" : "none",
        scrollbarColor: "#CBD5E1 transparent",
      }}
    >
      <div className="w-[270px] pt-5.5 pb-4 pl-4 pr-3 space-y-1.5 text-sm select-none">
        {/* 1. Dashboard (Active state: blue-violet icon, text, light blue pill) */}
        <Link
          href="/admin"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-[14px] transition-colors ${activePath === "/admin" || activePath === "/admin"
            ? "bg-[#ECFDF5] text-[#4318FF]"
            : "text-[#2B3674] hover:bg-[#F4F7FC]"
            }`}
        >
          <Home className="w-[19px] h-[19px] text-[#4318FF] stroke-[2.2]" />
          <span>Dashboard</span>
        </Link>

        {/* 2. Media Library matching reference screenshot */}
        <div>
          <button
            type="button"
            onClick={() => toggleSubmenu("mediaLibrary")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-[14px] transition-colors cursor-pointer ${expandedMenus.mediaLibrary
              ? "bg-[#ECFDF5] text-[#0B7A43]"
              : "text-[#2B3674] hover:bg-[#F4F7FC]"
              }`}
          >
            <div className="flex items-center gap-3">
              <ImageIcon className="w-[19px] h-[19px] text-[#B45309] stroke-[2]" />
              <span>Media Library</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${expandedMenus.mediaLibrary ? "rotate-180 text-[#0B7A43]" : "text-[#A3AED0]"
                }`}
            />
          </button>
          {expandedMenus.mediaLibrary &&
            renderSubMenu([
              { label: "Add Media", href: "/admin/add-media" },
              { label: "All Media", href: "/admin/media" },
            ])}
        </div>

        {/* SECTION: CONTENT */}
        <div className="pt-3.5 pb-1 px-3.5">
          <p className="text-[11.5px] font-black uppercase tracking-wider text-[#A3AED0]">
            CONTENT
          </p>
        </div>

        {/* Article */}
        <div>
          <button
            type="button"
            onClick={() => toggleSubmenu("article")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-[14px] transition-colors cursor-pointer ${expandedMenus.article
              ? "bg-[#ECFDF5] text-[#0B7A43]"
              : "text-[#2B3674] hover:bg-[#F4F7FC]"
              }`}
          >
            <div className="flex items-center gap-3">
              <PenTool className="w-[19px] h-[19px] text-[#DC2626] stroke-[2]" />
              <span>Article</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${expandedMenus.article ? "rotate-180 text-[#0B7A43]" : "text-[#A3AED0]"
                }`}
            />
          </button>
          {expandedMenus.article &&
            renderSubMenu([
              { label: "New Article", href: "/admin/new-article" },
              { label: "Article", href: "/admin/articles" },
              { label: "Published Article", href: "/admin/articles?status=PUBLISHED" },
              { label: "Draft Article", href: "/admin/articles?status=DRAFT" },
              { label: "Breaking News", href: "/admin/articles?filter=breaking" },
              { label: "Banglar Alo News Special", href: "/admin/articles?filter=special" },
              { label: "Category", href: "/admin/categories" },
            ])}
        </div>

        {/* Auto News */}
        <Link
          href="/admin/auto-news"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-[14px] transition-colors ${activePath === "/admin/auto-news" || activePath === "/admin/feature/auto-news"
            ? "bg-[#ECFDF5] text-[#10B981]"
            : "text-[#2B3674] hover:bg-[#F4F7FC]"
            }`}
        >
          <Zap className="w-[19px] h-[19px] text-[#10B981] fill-[#10B981]" />
          <span>Auto News</span>
        </Link>

        {/* News Agent */}
        <Link
          href="/admin/auto-news"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-[14px] transition-colors ${activePath === "/admin/feature/news-agent"
            ? "bg-[#ECFDF5] text-[#10B981]"
            : "text-[#2B3674] hover:bg-[#F4F7FC]"
            }`}
        >
          <Bot className="w-[19px] h-[19px] text-[#10B981]" />
          <span>News Agent v4</span>
        </Link>

        {/* Live TV */}
        <Link
          href="/admin/feature/live-tv"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-[14px] transition-colors ${activePath === "/admin/feature/live-tv"
            ? "bg-[#ECFDF5] text-[#10B981]"
            : "text-[#2B3674] hover:bg-[#F4F7FC]"
            }`}
        >
          <Radio className="w-[19px] h-[19px] text-[#10B981]" />
          <span>Live TV</span>
        </Link>

        {/* Audio News */}
        <div>
          <button
            type="button"
            onClick={() => toggleSubmenu("audioNews")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-[14px] transition-colors cursor-pointer ${expandedMenus.audioNews || activePath?.includes("audio-news")
              ? "bg-[#ECFDF5] text-[#0B7A43]"
              : "text-[#2B3674] hover:bg-[#F4F7FC]"
              }`}
          >
            <div className="flex items-center gap-3">
              <Headphones className="w-[19px] h-[19px] text-[#EA580C]" />
              <span>Audio News</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${expandedMenus.audioNews || activePath?.includes("audio-news") ? "rotate-180 text-[#0B7A43]" : "text-[#A3AED0]"
                }`}
            />
          </button>
          {(expandedMenus.audioNews || activePath?.includes("audio-news")) &&
            renderSubMenu([
              { label: "All Audio", href: "/admin/feature/audio-news" },
              { label: "Add Audio", href: "/admin/feature/audio-news" },
            ])}
        </div>

        {/* Photo Story */}
        <div>
          <button
            type="button"
            onClick={() => toggleSubmenu("photoStory")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-[14px] transition-colors cursor-pointer ${expandedMenus.photoStory || activePath?.includes("photo-story")
              ? "bg-[#ECFDF5] text-[#0B7A43]"
              : "text-[#2B3674] hover:bg-[#F4F7FC]"
              }`}
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-[19px] h-[19px] text-[#9333EA]" />
              <span>Photo Story</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${expandedMenus.photoStory || activePath?.includes("photo-story") ? "rotate-180 text-[#0B7A43]" : "text-[#A3AED0]"
                }`}
            />
          </button>
          {(expandedMenus.photoStory || activePath?.includes("photo-story")) &&
            renderSubMenu([
              { label: "All Stories", href: "/admin/feature/photo-story" },
              { label: "Add Story", href: "/admin/feature/photo-story" },
            ])}
        </div>

        {/* Reels Story */}
        <div>
          <button
            type="button"
            onClick={() => toggleSubmenu("reelsStory")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-[14px] transition-colors cursor-pointer ${expandedMenus.reelsStory || activePath?.includes("reels-story")
              ? "bg-[#ECFDF5] text-[#0B7A43]"
              : "text-[#2B3674] hover:bg-[#F4F7FC]"
              }`}
          >
            <div className="flex items-center gap-3">
              <Film className="w-[19px] h-[19px] text-[#EF4444]" />
              <span>Reels Story</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${expandedMenus.reelsStory || activePath?.includes("reels-story") ? "rotate-180 text-[#0B7A43]" : "text-[#A3AED0]"
                }`}
            />
          </button>
          {(expandedMenus.reelsStory || activePath?.includes("reels-story")) &&
            renderSubMenu([
              { label: "All Reels", href: "/admin/feature/reels-story" },
              { label: "Add Reel", href: "/admin/feature/reels-story" },
            ])}
        </div>

        {/* Quotes */}
        <div>
          <button
            type="button"
            onClick={() => toggleSubmenu("quotes")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-[14px] transition-colors cursor-pointer ${expandedMenus.quotes || activePath?.includes("quotes")
              ? "bg-[#ECFDF5] text-[#0B7A43]"
              : "text-[#2B3674] hover:bg-[#F4F7FC]"
              }`}
          >
            <div className="flex items-center gap-3">
              <Quote className="w-[19px] h-[19px] text-[#DC2626]" />
              <span>Quotes</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${expandedMenus.quotes || activePath?.includes("quotes") ? "rotate-180 text-[#0B7A43]" : "text-[#A3AED0]"
                }`}
            />
          </button>
          {(expandedMenus.quotes || activePath?.includes("quotes")) &&
            renderSubMenu([
              { label: "All Quotes", href: "/admin/feature/quotes" },
              { label: "Add Quote", href: "/admin/feature/quotes" },
            ])}
        </div>

        {/* Photo Gallery */}
        <div>
          <button
            type="button"
            onClick={() => toggleSubmenu("photoGallery")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-[14px] transition-colors cursor-pointer ${expandedMenus.photoGallery || activePath?.includes("photo-gallery")
              ? "bg-[#ECFDF5] text-[#0B7A43]"
              : "text-[#2B3674] hover:bg-[#F4F7FC]"
              }`}
          >
            <div className="flex items-center gap-3">
              <Images className="w-[19px] h-[19px] text-[#F97316]" />
              <span>Photo Gallery</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${expandedMenus.photoGallery || activePath?.includes("photo-gallery") ? "rotate-180 text-[#0B7A43]" : "text-[#A3AED0]"
                }`}
            />
          </button>
          {(expandedMenus.photoGallery || activePath?.includes("photo-gallery")) &&
            renderSubMenu([
              { label: "All Galleries", href: "/admin/feature/photo-gallery" },
              { label: "Create Gallery", href: "/admin/feature/photo-gallery" },
            ])}
        </div>

        {/* Video Gallery / Video News */}
        <Link
          href="/admin/videos"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-[14px] transition-colors ${activePath === "/admin/videos" || activePath === "/admin/feature/video-gallery"
            ? "bg-[#ECFDF5] text-[#7C3AED]"
            : "text-[#2B3674] hover:bg-[#F4F7FC]"
            }`}
        >
          <Video className="w-[19px] h-[19px] text-[#7C3AED]" />
          <span>Video News (ভিডিও সংবাদ)</span>
        </Link>

        {/* Our Family (আমাদের পরিবার) */}
        <Link
          href="/admin/our-family"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-[14px] transition-colors ${activePath === "/admin/our-family" || activePath === "/admin/feature/our-family"
            ? "bg-[#ECFDF5] text-[#0B7A43]"
            : "text-[#2B3674] hover:bg-[#F4F7FC]"
            }`}
        >
          <Users className="w-[19px] h-[19px] text-[#0B7A43]" />
          <span>আমাদের পরিবার (Our Family)</span>
        </Link>

        {/* Poll */}
        <div>
          <button
            type="button"
            onClick={() => toggleSubmenu("poll")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-[14px] transition-colors cursor-pointer ${expandedMenus.poll || activePath?.includes("poll")
              ? "bg-[#ECFDF5] text-[#0B7A43]"
              : "text-[#2B3674] hover:bg-[#F4F7FC]"
              }`}
          >
            <div className="flex items-center gap-3">
              <PieChart className="w-[19px] h-[19px] text-[#0B7A43]" />
              <span>Poll</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${expandedMenus.poll || activePath?.includes("poll") ? "rotate-180 text-[#0B7A43]" : "text-[#A3AED0]"
                }`}
            />
          </button>
          {(expandedMenus.poll || activePath?.includes("poll")) &&
            renderSubMenu([
              { label: "All Polls", href: "/admin/feature/poll" },
              { label: "Create Poll", href: "/admin/feature/poll" },
            ])}
        </div>

        {/* Reactions & Ratings */}
        <Link
          href="/admin/feature/reactions"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-[14px] transition-colors ${activePath === "/admin/feature/reactions"
            ? "bg-[#ECFDF5] text-[#9333EA]"
            : "text-[#2B3674] hover:bg-[#F4F7FC]"
            }`}
        >
          <Smile className="w-[19px] h-[19px] text-[#9333EA]" />
          <span>Reactions & Ratings</span>
        </Link>

        {/* Pages */}
        <div>
          <button
            type="button"
            onClick={() => toggleSubmenu("pages")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-[14px] transition-colors cursor-pointer ${expandedMenus.pages || activePath?.includes("pages")
              ? "bg-[#ECFDF5] text-[#0B7A43]"
              : "text-[#2B3674] hover:bg-[#F4F7FC]"
              }`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-[19px] h-[19px] text-[#16A34A] fill-[#16A34A]" />
              <span>Pages</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${expandedMenus.pages || activePath?.includes("pages") ? "rotate-180 text-[#0B7A43]" : "text-[#A3AED0]"
                }`}
            />
          </button>
          {(expandedMenus.pages || activePath?.includes("pages")) &&
            renderSubMenu([
              { label: "All Pages", href: "/admin/feature/pages" },
              { label: "Create Page", href: "/admin/feature/pages" },
            ])}
        </div>

        {/* SECTION: CUSTOMIZATION */}
        <div className="pt-3.5 pb-1 px-3.5">
          <p className="text-[11.5px] font-black uppercase tracking-wider text-[#A3AED0]">
            CUSTOMIZATION
          </p>
        </div>

        {/* Header and Footer */}
        <div>
          <button
            type="button"
            onClick={() => toggleSubmenu("headerFooter")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-[14px] transition-colors cursor-pointer ${expandedMenus.headerFooter || activePath?.includes("header-footer")
              ? "bg-[#ECFDF5] text-[#0B7A43]"
              : "text-[#2B3674] hover:bg-[#F4F7FC]"
              }`}
          >
            <div className="flex items-center gap-3">
              <Layout className="w-[19px] h-[19px] text-[#16A34A] fill-[#16A34A]" />
              <span>Header and Footer</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${expandedMenus.headerFooter || activePath?.includes("header-footer") ? "rotate-180 text-[#0B7A43]" : "text-[#A3AED0]"
                }`}
            />
          </button>
          {(expandedMenus.headerFooter || activePath?.includes("header-footer")) &&
            renderSubMenu([
              { label: "Header Settings", href: "/admin/feature/header-footer" },
              { label: "Footer Settings", href: "/admin/feature/header-footer" },
            ])}
        </div>

        {/* Homepage Settings */}
        <div>
          <button
            type="button"
            onClick={() => toggleSubmenu("homeSettings")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-[14px] transition-colors cursor-pointer ${expandedMenus.homeSettings || activePath?.includes("homepage-settings")
              ? "bg-[#ECFDF5] text-[#0B7A43]"
              : "text-[#2B3674] hover:bg-[#F4F7FC]"
              }`}
          >
            <div className="flex items-center gap-3">
              <Home className="w-[19px] h-[19px] text-[#3B82F6] fill-[#3B82F6]" />
              <span>Homepage Settings</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${expandedMenus.homeSettings || activePath?.includes("homepage-settings") ? "rotate-180 text-[#0B7A43]" : "text-[#A3AED0]"
                }`}
            />
          </button>
          {(expandedMenus.homeSettings || activePath?.includes("homepage-settings")) &&
            renderSubMenu([
              { label: "Layout Sections", href: "/admin/feature/homepage-settings" },
              { label: "Hero & Banners", href: "/admin/feature/homepage-settings" },
            ])}
        </div>

        {/* Post Settings */}
        <div>
          <button
            type="button"
            onClick={() => toggleSubmenu("postSettings")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-[14px] transition-colors cursor-pointer ${expandedMenus.postSettings || activePath?.includes("post-settings")
              ? "bg-[#ECFDF5] text-[#0B7A43]"
              : "text-[#2B3674] hover:bg-[#F4F7FC]"
              }`}
          >
            <div className="flex items-center gap-3">
              <Layers className="w-[19px] h-[19px] text-[#065F34]" />
              <span>Post Settings</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${expandedMenus.postSettings || activePath?.includes("post-settings") ? "rotate-180 text-[#0B7A43]" : "text-[#A3AED0]"
                }`}
            />
          </button>
          {(expandedMenus.postSettings || activePath?.includes("post-settings")) &&
            renderSubMenu([
              { label: "Single Post Layout", href: "/admin/feature/post-settings" },
              { label: "Related Posts", href: "/admin/feature/post-settings" },
            ])}
        </div>

        {/* Advertisement */}
        <div>
          <button
            type="button"
            onClick={() => toggleSubmenu("advertisement")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-[14px] transition-colors cursor-pointer ${expandedMenus.advertisement || activePath?.includes("advertisement")
              ? "bg-[#ECFDF5] text-[#0B7A43]"
              : "text-[#2B3674] hover:bg-[#F4F7FC]"
              }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 bg-[#7C3AED] text-white text-[9.5px] font-black rounded-xs flex items-center justify-center leading-none">
                Ad
              </span>
              <span>Advertisement</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${expandedMenus.advertisement || activePath?.includes("advertisement") ? "rotate-180 text-[#0B7A43]" : "text-[#A3AED0]"
                }`}
            />
          </button>
          {(expandedMenus.advertisement || activePath?.includes("advertisement")) &&
            renderSubMenu([
              { label: "Ad Slots", href: "/admin/feature/advertisement" },
              { label: "Add Ad Banner", href: "/admin/feature/advertisement" },
            ])}
        </div>

        {/* Menu */}
        <div>
          <button
            type="button"
            onClick={() => toggleSubmenu("menu")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-[14px] transition-colors cursor-pointer ${expandedMenus.menu || activePath?.includes("menu")
              ? "bg-[#ECFDF5] text-[#0B7A43]"
              : "text-[#2B3674] hover:bg-[#F4F7FC]"
              }`}
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-[19px] h-[19px] text-[#DC2626]" />
              <span>Menu</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${expandedMenus.menu || activePath?.includes("menu") ? "rotate-180 text-[#0B7A43]" : "text-[#A3AED0]"
                }`}
            />
          </button>
          {(expandedMenus.menu || activePath?.includes("menu")) &&
            renderSubMenu([
              { label: "Primary Menu", href: "/admin/feature/menu" },
              { label: "Footer Menu", href: "/admin/feature/menu" },
            ])}
        </div>

        {/* Photo Card */}
        <div>
          <button
            type="button"
            onClick={() => toggleSubmenu("photoCard")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-[14px] transition-colors cursor-pointer ${expandedMenus.photoCard || activePath?.includes("photo-card")
              ? "bg-[#ECFDF5] text-[#0B7A43]"
              : "text-[#2B3674] hover:bg-[#F4F7FC]"
              }`}
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-[19px] h-[19px] text-[#0B7A43]" />
              <span>Photo Card</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${expandedMenus.photoCard || activePath?.includes("photo-card") ? "rotate-180 text-[#0B7A43]" : "text-[#A3AED0]"
                }`}
            />
          </button>
          {(expandedMenus.photoCard || activePath?.includes("photo-card")) &&
            renderSubMenu([
              { label: "All Cards", href: "/admin/feature/photo-card" },
              { label: "Create Card", href: "/admin/feature/photo-card" },
            ])}
        </div>

        {/* SECTION: ADVANCE */}
        <div className="pt-3.5 pb-1 px-3.5">
          <p className="text-[11.5px] font-black uppercase tracking-wider text-[#A3AED0]">
            ADVANCE
          </p>
        </div>

        {/* Account Management (Renamed from Writers Account) */}
        <div>
          <button
            type="button"
            onClick={() => toggleSubmenu("accountManagement")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-[14px] transition-colors cursor-pointer ${expandedMenus.accountManagement ||
              activePath?.includes("/accounts") ||
              activePath?.includes("writers-account")
              ? "bg-[#ECFDF5] text-[#0B7A43]"
              : "text-[#2B3674] hover:bg-[#F4F7FC]"
              }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-[19px] h-[19px] text-[#16A34A]" />
              <span>Account Management</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${expandedMenus.accountManagement ||
                activePath?.includes("/accounts") ||
                activePath?.includes("writers-account")
                ? "rotate-180 text-[#0B7A43]"
                : "text-[#A3AED0]"
                }`}
            />
          </button>
          {(expandedMenus.accountManagement ||
            activePath?.includes("/accounts") ||
            activePath?.includes("writers-account")) &&
            renderSubMenu([
              { label: "All Accounts", href: "/admin/accounts" },
              { label: "Create Account", href: "/admin/accounts?action=create" },
              { label: "Roles & Permissions", href: "/admin/accounts?tab=roles" },
            ])}
        </div>

        {/* Settings */}
        <div>
          <button
            type="button"
            onClick={() => toggleSubmenu("settings")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-[14px] transition-colors cursor-pointer ${expandedMenus.settings || activePath === "/admin/settings"
              ? "bg-[#ECFDF5] text-[#0B7A43]"
              : "text-[#2B3674] hover:bg-[#F4F7FC]"
              }`}
          >
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-[19px] h-[19px] text-[#0B7A43]" />
              <span>Settings</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${expandedMenus.settings || activePath === "/admin/settings" ? "rotate-180 text-[#0B7A43]" : "text-[#A3AED0]"
                }`}
            />
          </button>
          {(expandedMenus.settings || activePath === "/admin/settings") &&
            renderSubMenu([
              { label: "General Settings", href: "/admin/settings" },
              { label: "SEO & Metadata", href: "/admin/settings" },
            ])}
        </div>

        {/* Developer Zone */}
        <div>
          <button
            type="button"
            onClick={() => toggleSubmenu("developerZone")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-[14px] transition-colors cursor-pointer ${expandedMenus.developerZone || activePath?.includes("developer-zone")
              ? "bg-[#ECFDF5] text-[#0B7A43]"
              : "text-[#2B3674] hover:bg-[#F4F7FC]"
              }`}
          >
            <div className="flex items-center gap-3">
              <Code2 className="w-[19px] h-[19px] text-[#16A34A]" />
              <span>Developer Zone</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${expandedMenus.developerZone || activePath?.includes("developer-zone") ? "rotate-180 text-[#0B7A43]" : "text-[#A3AED0]"
                }`}
            />
          </button>
          {(expandedMenus.developerZone || activePath?.includes("developer-zone")) &&
            renderSubMenu([
              { label: "API Keys", href: "/admin/feature/developer-zone" },
              { label: "Webhooks", href: "/admin/feature/developer-zone" },
            ])}
        </div>

        {/* Web Access */}
        <Link
          href="/admin/feature/web-access"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-[14px] transition-colors ${activePath === "/admin/feature/web-access"
            ? "bg-[#ECFDF5] text-[#DC2626]"
            : "text-[#2B3674] hover:bg-[#F4F7FC]"
            }`}
        >
          <ScanFace className="w-[19px] h-[19px] text-[#DC2626]" />
          <span>Web Access</span>
        </Link>

        {/* Security */}
        <Link
          href="/admin/feature/security"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-[14px] transition-colors mb-6 ${activePath === "/admin/feature/security"
            ? "bg-[#ECFDF5] text-[#DC2626]"
            : "text-[#2B3674] hover:bg-[#F4F7FC]"
            }`}
        >
          <Shield className="w-[19px] h-[19px] text-[#DC2626]" />
          <span>Security</span>
        </Link>
      </div>
    </aside>
  );
}
