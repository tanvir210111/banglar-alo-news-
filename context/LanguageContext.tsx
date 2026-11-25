"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "bn" | "en";

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  isBn: boolean;
}

export const CATEGORY_NAME_EN: Record<string, string> = {
  national: "National",
  international: "International",
  politics: "Politics",
  "crime-corruption": "Crime & Corruption",
  education: "Education",
  sports: "Sports",
  accident: "Accident",
  entertainment: "Entertainment",
  countrywide: "Countrywide",
  campus: "Campus",
  islam: "Islam",
  economy: "Economy",
  technology: "Technology",
  health: "Health",
  opinion: "Opinion",
  agriculture: "Agriculture",
  jobs: "Jobs",
  business: "Business",
  capital: "Capital",
  "law-and-court": "Law & Court",
  "women-and-children": "Women & Children",
  greetings: "Greetings",
};

const DICTIONARY: Record<Language, Record<string, string>> = {
  bn: {
    siteName: "বাংলার আলো নিউজ",
    tagline: "সত্য ও ন্যায়ের দীপ্ত কণ্ঠস্বর",
    home: "হোম",
    latest: "সর্বশেষ",
    latestNews: "সর্বশেষ সংবাদ",
    national: "জাতীয়",
    politics: "রাজনীতি",
    politicsElections: "রাজনীতি ও নির্বাচন",
    international: "আন্তর্জাতিক",
    internationalNews: "আন্তর্জাতিক সংবাদ",
    durghotona: "দুর্ঘটনা",
    crimeCorruption: "অপরাধ ও দুর্নীতি",
    education: "শিক্ষা",
    countrywide: "সারাদেশ",
    campus: "ক্যাম্পাস",
    more: "আরও",
    allNews: "সব খবর",
    seeAll: "সব দেখুন",
    mostRead: "সর্বাধিক পঠিত",
    search: "খুঁজুন",
    login: "লগইন",
    logout: "লগআউট",
    profile: "প্রোফাইল",
    bookmarks: "সংরক্ষিত খবর",
    adminPanel: "অ্যাডমিন প্যানেল",
    liveTime: "বাংলাদেশ সময়",
    weatherLoading: "আবহাওয়া লোড হচ্ছে...",
    weatherUnavailable: "আবহাওয়া অনুপলব্ধ",
    breakingNews: "ব্রেকিং নিউজ",
    newsletterTitle: "সরাসরি ইনবক্সে প্রতিদিনের তাজা খবর পেতে সাবস্ক্রাইব করুন",
    subscribe: "সাবস্ক্রাইব",
    enterEmail: "আপনার ইমেইল ঠিকানা লিখুন",
    allCategories: "সকল বিভাগ",
    comments: "পাঠকের মন্তব্য",
    leaveComment: "আপনার মন্তব্য লিখুন",
    submitComment: "মন্তব্য প্রকাশ করুন",
    shareNews: "শেয়ার করুন",
    copyLink: "লিংক কপি",
    linkCopied: "লিংক কপি করা হয়েছে!",
    like: "লাইক",
    dislike: "ডিজলাইক",
    loginToReact: "মতামত জানাতে অনুগ্রহ করে লগইন করুন",
    loginToComment: "মন্তব্য করতে অনুগ্রহ করে লগইন করুন",
    ourFamily: "আমাদের পরিবার",
    archive: "পুরাতন আর্কাইভ",
    photoGallery: "ছবি গ্যালারি",
    videoGallery: "ভিডিও সংবাদ",
    videos: "ভিডিও",
    allVideos: "সব ভিডিও",
    readMore: "বিস্তারিত পড়ুন",
    views: "বার পঠিত",
    shares: "শেয়ার",
    relatedNews: "সম্পর্কিত খবর",
    popularNews: "জনপ্রিয় খবর",
    followOnFb: "ফেসবুকে আমরা",
    joinUs: "যুক্ত থাকুন",
    fbPagePrompt: "ফেসবুকে অর্থনীতি, বাণিজ্য ও দেশের তাজা সব খবর জানতে ফলো করুন",
    noNewsInCategory: "এই বিভাগে এখনও কোনো সংবাদ প্রকাশিত হয়নি।",
    noNewsAvailable: "কোনো সংবাদ পাওয়া যায়নি",
    noVideosAvailable: "বর্তমানে কোনো ভিডিও সংবাদ উপলব্ধ নেই",
    watchOnFbVideos: "আমাদের অফিসিয়াল ফেসবুক পেজে সব ভিডিও সরাসরি দেখতে পারেন",
    visitFbVideos: "ফেসবুক ভিডিও পেজ ভিজিট করুন",
    aboutUs: "আমাদের সম্পর্কে",
    contact: "যোগাযোগ",
    editorialPolicy: "সম্পাদকীয় নীতিমালা",
    privacyPolicy: "গোপনীয়তা নীতি",
    terms: "শর্তাবলী",
    advertise: "বিজ্ঞাপন",
    quickLinks: "প্রয়োজনীয় লিংক",
    editorAndPublisher: "সম্পাদক ও প্রকাশক",
    executiveEditor: "নির্বাহী সম্পাদক",
    copyright: "সর্বস্বত্ব সংরক্ষিত",
  },
  en: {
    siteName: "Banglar Alo News",
    tagline: "The Radiant Voice of Truth and Justice",
    home: "Home",
    latest: "Latest",
    latestNews: "Latest News",
    national: "National",
    politics: "Politics",
    politicsElections: "Politics & Elections",
    international: "International",
    internationalNews: "International News",
    durghotona: "Accidents",
    crimeCorruption: "Crime & Corruption",
    education: "Education",
    countrywide: "Countrywide",
    campus: "Campus",
    more: "More",
    allNews: "All News",
    seeAll: "See All",
    mostRead: "Most Read",
    search: "Search",
    login: "Login",
    logout: "Logout",
    profile: "Profile",
    bookmarks: "Bookmarks",
    adminPanel: "Admin Panel",
    liveTime: "Bangladesh Time",
    weatherLoading: "Loading weather...",
    weatherUnavailable: "Weather unavailable",
    breakingNews: "Breaking News",
    newsletterTitle: "Subscribe to receive daily top news directly in your inbox",
    subscribe: "Subscribe",
    enterEmail: "Enter your email address",
    allCategories: "All Categories",
    comments: "Reader Comments",
    leaveComment: "Write your comment",
    submitComment: "Post Comment",
    shareNews: "Share",
    copyLink: "Copy Link",
    linkCopied: "Link copied to clipboard!",
    like: "Like",
    dislike: "Dislike",
    loginToReact: "Please log in to share your reaction",
    loginToComment: "Please log in to post a comment",
    ourFamily: "Our Family",
    archive: "Old News Archive",
    photoGallery: "Photo Gallery",
    videoGallery: "Video News",
    videos: "Videos",
    allVideos: "All Videos",
    readMore: "Read More",
    views: "views",
    shares: "shares",
    relatedNews: "Related News",
    popularNews: "Popular News",
    followOnFb: "Follow Us on Facebook",
    joinUs: "Join Us",
    fbPagePrompt: "Follow on Facebook for latest updates and news",
    noNewsInCategory: "No news published in this category yet.",
    noNewsAvailable: "No news available",
    noVideosAvailable: "No video news available at the moment",
    watchOnFbVideos: "Watch all video reports directly on our official Facebook page",
    visitFbVideos: "Visit Facebook Video Page",
    aboutUs: "About Us",
    contact: "Contact",
    editorialPolicy: "Editorial Policy",
    privacyPolicy: "Privacy Policy",
    terms: "Terms & Conditions",
    advertise: "Advertise",
    quickLinks: "Quick Links",
    editorAndPublisher: "Editor & Publisher",
    executiveEditor: "Executive Editor",
    copyright: "All rights reserved",
  },
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "bn",
  toggleLang: () => { },
  setLang: () => { },
  t: (key: string) => key,
  isBn: true,
});

const STORAGE_KEY = "banglar_alo_news_lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("bn");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (saved === "bn" || saved === "en") {
        setLangState(saved);
        document.documentElement.lang = saved;
      }
    } catch {
      // Ignore
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;
    } catch {
      // Ignore
    }
  };

  const toggleLang = () => {
    setLangState((prev) => {
      const next: Language = prev === "bn" ? "en" : "bn";
      try {
        localStorage.setItem(STORAGE_KEY, next);
        document.documentElement.lang = next;
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const t = (key: string): string => {
    return DICTIONARY[lang]?.[key] || DICTIONARY.bn[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        toggleLang,
        setLang,
        t,
        isBn: lang === "bn",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
