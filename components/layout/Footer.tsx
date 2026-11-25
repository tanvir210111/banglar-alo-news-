"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Mail, Phone, MapPin } from "lucide-react";
import SocialMediaIcons from "@/components/common/SocialMediaIcons";
import { getSiteSettings, getCategories } from "@/services/newsService";
import { Category, SiteSettings } from "@/types/news";
import { useLanguage, CATEGORY_NAME_EN } from "@/context/LanguageContext";

// Default Main News Categories (Symmetrically 8 items in 4x2 grid)
const DEFAULT_MAIN_CATEGORIES = [
  { nameBn: "জাতীয়", nameEn: "National", href: "/category/national" },
  { nameBn: "রাজনীতি", nameEn: "Politics", href: "/category/politics" },
  { nameBn: "অর্থনীতি", nameEn: "Economy", href: "/category/economy" },
  { nameBn: "আন্তর্জাতিক", nameEn: "International", href: "/category/international" },
  { nameBn: "সারাদেশ", nameEn: "Countrywide", href: "/category/countrywide" },
  { nameBn: "অপরাধ ও দুর্নীতি", nameEn: "Crime & Corruption", href: "/category/crime-corruption" },
  { nameBn: "শিক্ষা", nameEn: "Education", href: "/category/education" },
  { nameBn: "দুর্ঘটনা", nameEn: "Accidents", href: "/category/accident" },
];

// Default Other Categories (Symmetrically 8 items in 4x2 grid)
const DEFAULT_OTHER_CATEGORIES = [
  { nameBn: "খেলাধুলা", nameEn: "Sports", href: "/category/sports" },
  { nameBn: "বিনোদন", nameEn: "Entertainment", href: "/category/entertainment" },
  { nameBn: "প্রযুক্তি", nameEn: "Technology", href: "/category/technology" },
  { nameBn: "কৃষি", nameEn: "Agriculture", href: "/category/agriculture" },
  { nameBn: "স্বাস্থ্য", nameEn: "Health", href: "/category/health" },
  { nameBn: "ইসলাম ও জীবন", nameEn: "Islam & Life", href: "/category/islam" },
  { nameBn: "আইন ও আদালত", nameEn: "Law & Court", href: "/category/law-and-court" },
  { nameBn: "চাকরি", nameEn: "Jobs", href: "/category/jobs" },
];

export default function Footer() {
  const pathname = usePathname();
  const { isBn } = useLanguage();
  const [settings, setSettings] = useState<Partial<SiteSettings>>({
    editorName: "মোঃ গোলাম মাওলা শাওন",
    officeAddress: "৩১/১ শরীফ কমপ্লেক্স (৬ষ্ঠ তলা), পুরানা পল্টন, ঢাকা-১০০০",
    phone: "০১৯৯৯-৯৫৩৯৭০",
    email: "banglaralonewsbd@gmail.com",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const currentYear = 2026;

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      window.location.reload();
    }
  };

  useEffect(() => {
    getCategories().then((cats) => {
      if (cats && cats.length > 0) setCategories(cats);
    });
    getSiteSettings().then((s) => {
      if (s) {
        setSettings({
          ...s,
          editorName: s.editorName || "মোঃ গোলাম মাওলা শাওন",
          officeAddress: s.officeAddress || "৩১/১ শরীফ কমপ্লেক্স (৬ষ্ঠ তলা), পুরানা পল্টন, ঢাকা-১০০০",
          phone: s.phone || "০১৯৯৯-৯৫৩৯৭০",
          email: s.email || "banglaralonewsbd@gmail.com",
        });
      }
    });
  }, []);

  const quickLinks = [
    { name: isBn ? "আমাদের সম্পর্কে" : "About Us", href: "/about" },
    { name: isBn ? "যোগাযোগ" : "Contact", href: "/contact" },
    { name: isBn ? "সম্পাদকীয় নীতিমালা" : "Editorial Policy", href: "/editorial-policy" },
    { name: isBn ? "গোপনীয়তা নীতি" : "Privacy Policy", href: "/privacy-policy" },
    { name: isBn ? "শর্তাবলী" : "Terms & Conditions", href: "/terms" },
    { name: isBn ? "বিজ্ঞাপন" : "Advertise", href: "/advertise" },
    { name: isBn ? "ছবি গ্যালারি" : "Photo Gallery", href: "/gallery" },
    { name: isBn ? "ভিডিও কর্নার" : "Videos", href: "/videos" },
    { name: isBn ? "নিউজ আর্কাইভ" : "News Archive", href: "/archive" },
    { name: isBn ? "সর্বশেষ খবর" : "Latest News", href: "/latest" },
    { name: isBn ? "জনপ্রিয় খবর" : "Popular News", href: "/popular" },
  ];

  // Guaranteed populated categories (8 per column, clean 4x2 grid)
  const mainCategoryList =
    categories.length >= 8
      ? categories.slice(0, 8).map((c) => ({
        name: !isBn ? CATEGORY_NAME_EN[c.slug] || c.name : c.name,
        href: `/category/${c.slug}`,
      }))
      : DEFAULT_MAIN_CATEGORIES.map((c) => ({
        name: isBn ? c.nameBn : c.nameEn,
        href: c.href,
      }));

  const otherCategoryList =
    categories.length >= 16
      ? categories.slice(8, 16).map((c) => ({
        name: !isBn ? CATEGORY_NAME_EN[c.slug] || c.name : c.name,
        href: `/category/${c.slug}`,
      }))
      : DEFAULT_OTHER_CATEGORIES.map((c) => ({
        name: isBn ? c.nameBn : c.nameEn,
        href: c.href,
      }));

  return (
    <footer className="bg-[#121c24] text-gray-300 pt-10 pb-6 border-t-4 border-[#0B7A43]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Grid: 3-Column Balanced Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 pb-8 border-b border-gray-700/60 items-start">
          {/* 1. Left: Brand info & Social Media */}
          <div className="space-y-4">
            <Link
              href="/"
              onClick={handleLogoClick}
              className="inline-block group cursor-pointer"
              aria-label="বাংলার আলো নিউজ - প্রচ্ছদে যান"
            >
              <Image
                src="/images/banglar-alo-full-logo-darkmode.png"
                alt="বাংলার আলো নিউজ"
                width={320}
                height={86}
                className="h-14 sm:h-16 w-auto max-w-[280px] object-contain transition-opacity hover:opacity-90"
              />
            </Link>
            <p className="text-xs sm:text-[13px] text-gray-400 leading-relaxed max-w-sm">
              {isBn
                ? "স্বাধীনতা ও মানবতার কথা বলে। সত্য ও ন্যায়ের অঙ্গীকার নিয়ে পরিচালিত বাংলাদেশের শীর্ষস্থানীয় অনলাইন সংবাদমাধ্যম।"
                : "The Radiant Voice of Freedom and Humanity. Leading online news portal committed to objective and fearless journalism in Bangladesh."}
            </p>

            {/* Social Media Links */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2.5">
                {isBn ? "সামাজিক যোগাযোগে আমরা" : "Follow Us"}
              </span>
              <SocialMediaIcons variant="footer" />
            </div>
          </div>

          {/* 2. Middle: Quick links (প্রয়োজনীয় লিংক) */}
          <div className="space-y-4 lg:px-2">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-l-2 border-[#0B7A43] pl-2.5 flex items-center gap-1.5">
              {isBn ? "প্রয়োজনীয় লিংক" : "Quick Links"}
            </h4>
            <ul className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs sm:text-[13px]">
              {quickLinks.slice(0, 10).map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] group-hover:scale-125 transition-transform shrink-0" />
                    <span className="truncate group-hover:underline underline-offset-2">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Right: Editorial & Head Office Card */}
          <div className="bg-[#18232c] border border-gray-700/70 rounded-xl p-4 sm:p-5 shadow-sm space-y-3.5 text-xs text-gray-300">
            {/* সম্পাদকীয় */}
            <div>
              <h4 className="text-[13px] font-bold text-white uppercase tracking-wider border-l-2 border-[#0B7A43] pl-2 mb-2 flex items-center gap-1.5">
                {isBn ? "সম্পাদকীয়" : "Editorial"}
              </h4>
              <div className="space-y-1.5 pl-2.5">
                <p className="text-gray-300">
                  <span className="text-gray-400">{isBn ? "প্রকাশক ও সম্পাদক:" : "Publisher & Editor:"}</span>{" "}
                  <strong className="text-white font-semibold text-[13px]">মোঃ গোলাম মাওলা শাওন</strong>
                </p>
                <p className="flex items-center gap-2 text-gray-400">
                  <Phone className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
                  <span>{isBn ? "মোবাইল:" : "Mobile:"}</span>
                  <a href="tel:01711006214" className="hover:text-emerald-400 transition-colors text-gray-200 font-medium">
                    ০১৭১১-০০৬২১৪
                  </a>
                </p>
              </div>
            </div>

            {/* অফিস / প্রধান কার্যালয় */}
            <div className="border-t border-gray-700/60 pt-3">
              <h4 className="text-[13px] font-bold text-white uppercase tracking-wider border-l-2 border-[#DC2626] pl-2 mb-2 flex items-center gap-1.5">
                {isBn ? "প্রধান কার্যালয় (অফিস)" : "Head Office"}
              </h4>
              <div className="space-y-1.5 pl-2.5">
                <p className="flex items-start gap-2 text-gray-300 leading-relaxed">
                  <MapPin className="w-3.5 h-3.5 text-[#DC2626] shrink-0 mt-0.5" />
                  <span>৩১/১ শরীফ কমপ্লেক্স (৬ষ্ঠ তলা), পুরানা পল্টন, ঢাকা-১০০০</span>
                </p>
                <p className="flex items-center gap-2 text-gray-400">
                  <Phone className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
                  <span>{isBn ? "মোবাইল:" : "Mobile:"}</span>
                  <a href="tel:01999953970" className="hover:text-emerald-400 transition-colors text-gray-200 font-medium">
                    ০১৯৯৯-৯৫৩৯৭০
                  </a>
                </p>
                <p className="flex items-center gap-2 text-gray-400">
                  <Mail className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                  <span>{isBn ? "ই-মেইল:" : "Email:"}</span>
                  <a href="mailto:banglaralonewsbd@gmail.com" className="hover:text-amber-400 transition-colors text-gray-200">
                    banglaralonewsbd@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Credit */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-3">
          <p className="text-center sm:text-left leading-relaxed">
            © {currentYear} <strong className="text-gray-200">{isBn ? "বাংলার আলো নিউজ" : "Banglar Alo News"}</strong>. {isBn ? "সর্বস্বত্ব সংরক্ষিত। অনুমতি ছাড়া এই ওয়েবসাইটের কোনো লেখা বা ছবি প্রকাশ দণ্ডনীয় অপরাধ।" : "All rights reserved. Reproduction of any content without permission is prohibited."}
          </p>
          <p className="text-center sm:text-right shrink-0">
            {isBn ? "কারিগরি সহযোগিতায়" : "Technical Support by"}:{" "}
            <a
              href="https://banglaraloit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#34D399] hover:text-[#6EE7B7] font-semibold hover:underline inline-flex items-center gap-1 transition-colors"
            >
              Banglar Alo IT
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
