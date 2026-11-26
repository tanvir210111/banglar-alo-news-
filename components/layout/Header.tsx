"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Menu,
  X,
  ChevronDown,
  Archive,
  Globe,
  User,
  LogOut,
} from "lucide-react";
import TopUtilityBar from "./TopUtilityBar";
import BreakingNewsTicker from "./BreakingNewsTicker";
import SocialMediaIcons from "@/components/common/SocialMediaIcons";
import { getCategories, getBreakingNews } from "@/services/newsService";
import { Category, BreakingNewsItem } from "@/types/news";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

const DEFAULT_BREAKING_ITEMS: BreakingNewsItem[] = [
  {
    id: "welcome-1",
    headline: "বাংলার আলো নিউজে আপনাকে স্বাগতম • সর্বশেষ জাতীয়, সারাদেশ ও আন্তর্জাতিক সংবাদ জানতে চোখ রাখুন",
    headlineEn: "Welcome to Banglar Alo News • Stay updated with latest national, regional and international news",
    slug: "latest",
    categoryName: "জাতীয়",
    categoryNameEn: "National",
    publishedTime: "আজ",
  },
  {
    id: "welcome-2",
    headline: "সত্য ও নির্ভুল সংবাদের নির্ভরযোগ্য অনলাইন মাধ্যম — বাংলার আলো নিউজ",
    headlineEn: "The reliable source of objective journalism — Banglar Alo News",
    slug: "latest",
    categoryName: "ব্রেকিং",
    categoryNameEn: "Breaking",
    publishedTime: "আজ",
  },
  {
    id: "welcome-3",
    headline: "রাজনীতি, অর্থনীতি, সারাদেশ, খেলাধুলা ও বিনোদনের তাজা সব খবর জানতে আমাদের সাথেই থাকুন",
    headlineEn: "Stay with us for instant updates on politics, economy, nationwide news, sports and entertainment",
    slug: "latest",
    categoryName: "সারাদেশ",
    categoryNameEn: "Countrywide",
    publishedTime: "আজ",
  },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, toggleLang, isBn } = useLanguage();
  const { user, isAuthenticated, logout, openLoginModal } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [drawerCategories, setDrawerCategories] = useState<Category[]>([]);
  const [breakingItems, setBreakingItems] = useState<BreakingNewsItem[]>(DEFAULT_BREAKING_ITEMS);

  const moreMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Clear any leftover old site cache from browser
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("site_breaking_items");
        localStorage.removeItem("site_drawer_categories");
        const rawReader = localStorage.getItem("banglaralo_reader_user");
        if (rawReader) {
          const parsed = JSON.parse(rawReader);
          if (["SUPER_ADMIN", "ADMIN", "EDITOR", "PUBLISHER", "REPORTER"].includes(String(parsed?.role || "").toUpperCase())) {
            localStorage.removeItem("banglaralo_reader_user");
            localStorage.removeItem("banglaralo_reader_token");
          }
        }
      } catch { }
    }

    getCategories().then((cats) => {
      if (cats && cats.length > 0) {
        setDrawerCategories(cats);
      } else {
        setDrawerCategories([]);
      }
    });

    getBreakingNews().then((news) => {
      if (news && news.length > 0) {
        setBreakingItems(news);
      } else {
        setBreakingItems(DEFAULT_BREAKING_ITEMS);
      }
    });
  }, []);

  // Handle outside click for "More" dropdown & User menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent background scrolling when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Focus search input when search is opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      window.location.reload();
    }
  };

  // Dynamic Nav links as specified:
  // Order: সর্বশেষ -> সারাদেশ -> জাতীয় -> রাজনীতি -> আন্তর্জাতিক -> ব্যবসা ও বাণিজ্য -> অপরাধ ও দুর্নীতি -> শিক্ষা -> খেলাধুলা -> বিনোদন -> ধর্ম
  const navLinks = React.useMemo(() => {
    return [
      { name: isBn ? "সর্বশেষ" : "Latest", href: "/latest" },
      { name: isBn ? "সারাদেশ" : "Countrywide", href: "/category/countrywide" },
      { name: isBn ? "জাতীয়" : "National", href: "/category/national" },
      { name: isBn ? "রাজনীতি" : "Politics", href: "/category/politics" },
      { name: isBn ? "আন্তর্জাতিক" : "International", href: "/category/international" },
      { name: isBn ? "ব্যবসা ও বাণিজ্য" : "Business & Commerce", href: "/category/business" },
      { name: isBn ? "অপরাধ ও দুর্নীতি" : "Crime", href: "/category/crime-corruption" },
      { name: isBn ? "শিক্ষা" : "Education", href: "/category/education" },
      { name: isBn ? "খেলাধুলা" : "Sports", href: "/category/sports" },
      { name: isBn ? "বিনোদন" : "Entertainment", href: "/category/entertainment" },
      { name: isBn ? "ধর্ম" : "Religion", href: "/category/religion" },
    ];
  }, [isBn]);

  // Remaining Items under 'আরও' (More) dropdown - বাকি সব ক্যাটাগরি 'আরও' এর ভিতর
  const moreCategories = React.useMemo(() => {
    const mainSlugs = new Set([
      "countrywide",
      "national",
      "politics",
      "international",
      "business",
      "crime-corruption",
      "education",
      "sports",
      "entertainment",
      "religion",
    ]);

    const defaultMore = [
      { name: isBn ? "অর্থনীতি" : "Economy", href: "/category/economy", slug: "economy" },
      { name: isBn ? "আমাদের পরিবার" : "Our Family", href: "/our-family", slug: "our-family" },
      { name: isBn ? "দুর্ঘটনা" : "Accidents", href: "/category/accident", slug: "accident" },
      { name: isBn ? "চাকুরী" : "Jobs", href: "/category/jobs", slug: "jobs" },
      { name: isBn ? "কৃষি" : "Agriculture", href: "/category/agriculture", slug: "agriculture" },
      { name: isBn ? "ফিচার" : "Features", href: "/category/features", slug: "features" },
      { name: isBn ? "লাইফস্টাইল" : "Lifestyle", href: "/category/lifestyle", slug: "lifestyle" },
      { name: isBn ? "ভ্রমণ" : "Travel", href: "/category/travel", slug: "travel" },
      { name: isBn ? "সম্পাদকীয়" : "Editorial", href: "/category/editorial", slug: "editorial" },
      { name: isBn ? "স্বাস্থ্য" : "Health", href: "/category/health", slug: "health" },
      { name: isBn ? "আইন আদালত" : "Law & Court", href: "/category/law-and-court", slug: "law-and-court" },
      { name: isBn ? "মতামত" : "Opinion", href: "/category/opinion", slug: "opinion" },
      { name: isBn ? "সাহিত্য ও সংস্কৃতি" : "Literature & Culture", href: "/category/literature-culture", slug: "literature-culture" },
      { name: isBn ? "শেয়ার বাজার" : "Share Market", href: "/category/share-market", slug: "share-market" },
      { name: isBn ? "প্রবাসে বাংলাদেশ" : "Expatriate Bangladesh", href: "/category/expatriate", slug: "expatriate" },
      { name: isBn ? "রাজধানী" : "Capital", href: "/category/capital", slug: "capital" },
      { name: isBn ? "শোক" : "Obituary", href: "/category/shok", slug: "shok" },
      { name: isBn ? "প্রযুক্তি" : "Technology", href: "/category/technology", slug: "technology" },
    ];

    if (drawerCategories && drawerCategories.length > 0) {
      const existingSlugs = new Set(defaultMore.map((d) => d.slug).concat([...mainSlugs]));
      const extraCats = drawerCategories.filter(
        (c) =>
          !existingSlugs.has(c.slug) &&
          c.slug !== "latest" &&
          c.slug !== "sorbosesh" &&
          c.slug !== "women-and-children" &&
          c.name !== "সর্বশেষ" &&
          c.name !== "নারী ও শিশু" &&
          c.slug !== "education-culture" &&
          c.name !== "শিক্ষা ও সংস্কৃতি"
      );
      if (extraCats.length > 0) {
        return [
          ...defaultMore,
          ...extraCats.map((c) => ({
            name: c.name === "শিক্ষা ও সংস্কৃতি" ? (isBn ? "সাহিত্য ও সংস্কৃতি" : "Literature & Culture") : c.name,
            href: `/category/${c.slug === "education-culture" ? "literature-culture" : c.slug}`
          })),
        ];
      }
    }
    return defaultMore;
  }, [drawerCategories, isBn]);

  return (
    <header className="w-full bg-white border-b border-[#E2E8F0] sticky top-0 z-40">
      {/* 1. Main Masthead: Brand Logo on Left & Real-Time Utility (Date, Clock, Weather, Socials) on Right */}
      <div className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-0 sm:py-0.5 flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-4">

          {/* Left: Brand Logo & Tagline */}
          <div className="flex items-center justify-between md:justify-start gap-3 py-0">
            <Link
              href="/"
              onClick={handleLogoClick}
              className="inline-block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7A43] rounded-xs cursor-pointer py-0 my-0"
              aria-label="বাংলার আলো নিউজ - প্রচ্ছদে যান"
            >
              <Image
                src="/images/banglar-alo-full-logo.png"
                alt="বাংলার আলো নিউজ"
                width={300}
                height={80}
                priority
                className="block w-[190px] sm:w-[230px] md:w-[270px] lg:w-[290px] h-auto object-contain shrink-0"
              />
            </Link>

            {/* Mobile hamburger on small screens for quick menu */}
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(true);
              }}
              className="lg:hidden p-2 text-[#222222] hover:bg-emerald-50 hover:text-[#0B7A43] rounded transition-colors duration-200 cursor-pointer"
              aria-label="সকল বিভাগ মেনু খুলুন"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Right: Real-time Date, Clock, Weather & Social Media */}
          <TopUtilityBar />
        </div>
      </div>

      {/* 2. Vibrant Green Navigation Bar (User Specified: মেনু বার এর কালার হবে সবুজ) */}
      <nav
        aria-label="প্রধান নেভিগেশন"
        className="w-full bg-[#0B7A43] border-b border-[#065F34] relative z-30 shadow-xs"
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 flex items-center justify-between gap-1 sm:gap-2 py-1">
          {/* Main Navigation Section with Far-Left [☰] and All Category Links + 'আরও' */}
          <div className="flex-1 min-w-0 flex items-center">
            {/* [☰] All Categories Menu Button placed on far left */}
            <button
              type="button"
              onClick={() => {
                setIsMoreMenuOpen(false);
                setIsUserMenuOpen(false);
                setIsMobileMenuOpen(true);
              }}
              className="px-2.5 py-1.5 mr-1.5 text-white bg-white/15 hover:bg-white hover:text-[#0B7A43] rounded-xs transition-colors duration-200 ease-in-out cursor-pointer flex items-center gap-1 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              title="সকল বিভাগ মেনু"
              aria-label="সকল বিভাগ মেনু খুলুন"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Scrollable category links */}
            <div className="flex-1 min-w-0 overflow-x-auto no-scrollbar py-0.5">
              <ul className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <li key={link.name} className="shrink-0">
                      <Link
                        href={link.href}
                        className={`relative inline-flex items-center px-1.5 sm:px-2 xl:px-2.5 py-1.5 text-[14px] sm:text-[15px] xl:text-[16px] font-bold transition-colors duration-200 ease-in-out whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${isActive
                          ? "text-white after:absolute after:bottom-0 after:left-1 after:right-1 after:h-[3px] after:bg-white after:rounded-full"
                          : "text-white/90 hover:text-white hover:bg-white/10 rounded-xs"
                          }`}
                      >
                        {link.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* আরও (More) Dropdown Menu placed OUTSIDE overflow container */}
            <div ref={moreMenuRef} className="relative shrink-0 ml-0 mr-0">
              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  setIsMoreMenuOpen((prev) => !prev);
                }}
                className={`relative inline-flex items-center gap-0.5 pl-2 sm:pl-2.5 pr-0.5 sm:pr-1 py-1.5 text-[14px] sm:text-[15px] xl:text-[16px] font-bold transition-colors duration-200 ease-in-out cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${isMoreMenuOpen ? "text-white bg-white/20 rounded-xs" : "text-white/90 hover:text-white hover:bg-white/10 rounded-xs"
                  }`}
                aria-expanded={isMoreMenuOpen}
              >
                <span>{isBn ? "আরও" : "More"}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMoreMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown panel containing remaining categories - User specified: Green color theme */}
              {isMoreMenuOpen && (
                <div
                  className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-72 sm:w-80 bg-[#0B7A43] rounded-xl shadow-2xl border border-[#065F34] py-2.5 z-[100] animate-in fade-in slide-in-from-top-1 duration-150 text-white"
                >
                  <div className="px-3.5 py-1.5 border-b border-white/20 text-[11px] font-bold uppercase tracking-wider text-emerald-100 flex items-center justify-between">
                    <span>{isBn ? "অন্যান্য বিভাগসমূহ" : "Other Categories"}</span>
                    <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
                  </div>
                  <div className="grid grid-cols-2 gap-1 p-2 max-h-[70vh] overflow-y-auto">
                    {moreCategories.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMoreMenuOpen(false)}
                        className="px-2.5 py-2 text-[13.5px] font-semibold text-white/95 hover:text-white hover:bg-white/20 rounded-md transition-colors flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side Tools: Search | Language (ENG ⇄ BAN) | Login */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 pl-1.5 sm:pl-2 border-l border-white/20 ml-1">
            {/* 1. খুঁজুন (Search Trigger) */}
            <button
              type="button"
              onClick={() => {
                setIsMoreMenuOpen(false);
                setIsUserMenuOpen(false);
                setIsSearchOpen((prev) => !prev);
              }}
              className="flex items-center gap-1 px-1.5 sm:px-2 py-1.5 text-[13px] sm:text-[14px] font-semibold text-white bg-transparent hover:bg-white hover:text-[#0B7A43] rounded-xs transition-colors duration-200 ease-in-out cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              title={isBn ? "সংবাদ অনুসন্ধান করুন" : "Search news"}
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">{isBn ? "খুঁজুন" : "Search"}</span>
            </button>

            {/* 2. Bilingual Switcher: ENG ⇄ BAN */}
            <button
              type="button"
              onClick={() => {
                setIsMoreMenuOpen(false);
                setIsUserMenuOpen(false);
                toggleLang();
              }}
              className="flex items-center gap-1 px-2 py-1 text-[12px] sm:text-[13px] font-bold text-white bg-white/15 hover:bg-white hover:text-[#0B7A43] rounded transition-colors duration-200 ease-in-out cursor-pointer border border-white/25"
              title={isBn ? "Switch to English edition" : "বাংলা সংস্করণে পরিবর্তন করুন"}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{isBn ? "Eng" : "বাং"}</span>
            </button>

            {/* 3. আর্কাইভ (Archive) Link */}
            <Link
              href="/archive"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[13px] sm:text-[14px] font-semibold text-white bg-transparent hover:bg-white hover:text-[#0B7A43] rounded-xs transition-colors duration-200 ease-in-out cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              title={isBn ? "সংবাদ আর্কাইভ" : "News Archive"}
            >
              <Archive className="w-4 h-4" />
              <span>{isBn ? "আর্কাইভ" : "Archive"}</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Search Input Bar (Dropdown) */}
      {isSearchOpen && (
        <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] py-2.5 animate-in fade-in duration-200 relative z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <form
              onSubmit={handleSearchSubmit}
              className="max-w-2xl mx-auto flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isBn ? "খবর, বিষয় বা লেখকের নাম লিখে অনুসন্ধান করুন..." : "Search news, topics, authors..."}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-[#CBD5E1] rounded-xs focus:outline-none focus:ring-2 focus:ring-[#0B7A43] text-[#222222]"
                />
                <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="submit"
                className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-4 py-2 rounded-xs text-sm font-semibold transition-colors duration-200 cursor-pointer"
              >
                {isBn ? "অনুসন্ধান" : "Search"}
              </button>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-2 text-[#64748B] hover:text-[#222222] rounded-xs cursor-pointer transition-colors duration-200"
                aria-label="অনুসন্ধান বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Breaking News Ticker directly below Nav */}
      <BreakingNewsTicker items={breakingItems} />

      {/* Mobile / Full Categories Drawer Modal (z-[9999]) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[9999] flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 bg-[#0B7A43] text-white flex items-center justify-between">
              <Link
                href="/"
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                  handleLogoClick(e);
                }}
                className="cursor-pointer group flex items-center gap-2.5"
              >
                <div className="w-10 h-10 rounded-full bg-white p-1 flex items-center justify-center shrink-0 shadow-xs">
                  <Image
                    src="/images/logo-icon.png"
                    alt="বাংলার আলো নিউজ"
                    width={36}
                    height={36}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-lg font-bold group-hover:text-emerald-200 transition-colors block leading-tight">
                    {isBn ? "বাংলার আলো নিউজ" : "Banglar Alo News"}
                  </span>
                  <span className="block text-xs text-white/80">স্বাধীনতা ও মানবতার কথা বলে</span>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded hover:bg-white/10 text-white cursor-pointer transition-colors duration-200"
                aria-label="বন্ধ করুন"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Drawer Search */}
            <div className="p-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="সংবাদ অনুসন্ধান করুন..."
                  className="w-full px-3 py-1.5 text-sm bg-white border border-[#CBD5E1] rounded-xs focus:outline-none focus:ring-1 focus:ring-[#0B7A43] text-[#222222]"
                />
                <button
                  type="submit"
                  className="bg-[#0B7A43] hover:bg-[#065F34] text-white p-2 rounded-xs shrink-0 cursor-pointer transition-colors duration-200"
                  aria-label="অনুসন্ধান"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* All Category Links in Drawer */}
            <nav className="flex-1 py-3 px-3 overflow-y-auto">
              {/* Primary links */}
              <div className="mb-3">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2 px-1">
                  প্রধান বিভাগসমূহ
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2 text-sm font-semibold text-[#222222] hover:bg-emerald-50 hover:text-[#0B7A43] rounded-xs transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Other categories under 'আরও' */}
              <div className="border-t border-[#E2E8F0] pt-3 mb-3">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2 px-1">
                  অন্যান্য বিভাগসমূহ
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {moreCategories.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2 text-sm font-semibold text-[#475569] hover:bg-emerald-50 hover:text-[#0B7A43] rounded-xs transition-colors duration-200"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Utilities */}
              <div className="border-t border-[#E2E8F0] pt-3 space-y-1">
                <Link
                  href="/archive"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xs text-sm font-semibold text-[#222222] hover:bg-emerald-50 hover:text-[#0B7A43] transition-colors duration-200"
                >
                  <Archive className="w-4 h-4 text-[#0B7A43]" />
                  <span>পুরাতন নিউজ আর্কাইভ</span>
                </Link>
              </div>
            </nav>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[#E2E8F0] bg-gray-50 text-xs text-[#64748B]">
              <p className="font-semibold text-[#222222]">{isBn ? "বাংলার আলো নিউজ" : "Banglar Alo News"}</p>
              <p className="mt-1 mb-3">{isBn ? "সত্য ও ন্যায়ের দীপ্ত কণ্ঠস্বর।" : "The Radiant Voice of Truth and Justice."}</p>
              <SocialMediaIcons variant="drawer" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
