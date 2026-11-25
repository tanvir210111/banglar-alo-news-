import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Award, ShieldCheck, HeartHandshake, Globe2 } from "lucide-react";

export const metadata: Metadata = {
  title: "আমাদের সম্পর্কে | বাংলার আলো নিউজ",
  description: "বাংলার আলো নিউজ - সত্য ও ন্যায়ের দীপ্ত কণ্ঠস্বর। নিরপেক্ষ ও দায়িত্বশীল সাংবাদিকতায় প্রতিশ্রুতিবদ্ধ অনলাইন সংবাদপত্র।",
};

export default function AboutPage() {
  return (
    <div className="bg-[#F8FAFC] py-6 sm:py-8 min-h-[70vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-[#64748B] mb-5">
          <Link href="/" className="hover:text-[#0B7A43] transition-colors">
            প্রচ্ছদ
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">আমাদের সম্পর্কে</span>
        </nav>

        {/* Content Box */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-2xs p-5 sm:p-8">
          <h1 className="text-xl sm:text-2xl font-bold text-[#202124] mb-4 pb-3 border-b-2 border-[#0B7A43]">
            আমাদের সম্পর্কে — বাংলার আলো নিউজ
          </h1>

          <div className="prose prose-sm max-w-none text-[#334155] leading-relaxed space-y-4">
            <p className="text-base font-semibold text-[#0B7A43] leading-relaxed">
              সত্য ও ন্যায়ের দীপ্ত কণ্ঠস্বর — এই মূলমন্ত্রকে ধারণ করে যাত্রা শুরু করে ‘বাংলার আলো নিউজ’ (Banglar Alo News)। বস্তুনিষ্ঠ তথ্য পরিবেশন, নিরপেক্ষ দৃষ্টিভঙ্গি এবং নির্ভীক সাংবাদিকতাই আমাদের মূল ভিত্তি।
            </p>

            <p>
              একটি দ্রুত পরিবর্তনশীল বিশ্বে নির্ভুল ও সময়োপযোগী সংবাদের গুরুত্ব অপরিসীম। বাংলার আলো নিউজ ২৪ ঘণ্টা সার্বক্ষণিক জাতীয়, রাজনীতি, আন্তর্জাতিক, অর্থনীতি, সারাদেশ, খেলাধুলা, শিক্ষা, বিজ্ঞান-প্রযুক্তি এবং বিনোদনের সর্বশেষ তথ্য পাঠকদের কাছে পৌঁছে দিতে অঙ্গীকারবদ্ধ।
            </p>

            <h2 className="text-lg font-bold text-[#202124] pt-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#0B7A43]" />
              আমাদের লক্ষ্য ও দৃষ্টিভঙ্গি
            </h2>
            <p>
              আমাদের প্রধান লক্ষ্য হলো সংবাদের বস্তুনিষ্ঠতা রক্ষা করা এবং বিভ্রান্তিকর বা চটকদার খবরের ভিড়ে প্রকৃত সত্য উন্মোচন করা। কোনো ধরনের পক্ষপাতহীনভাবে ঘটনার গভীরে গিয়ে সঠিক চিত্র তুলে ধরাই আমাদের সম্পাদকীয় নীতি।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 pb-3">
              <div className="bg-[#F8FAFC] p-4 rounded-md border border-[#E2E8F0] text-center">
                <ShieldCheck className="w-8 h-8 text-[#0B7A43] mx-auto mb-2" />
                <h3 className="font-bold text-sm text-[#202124] mb-1">নির্ভুল তথ্য</h3>
                <p className="text-xs text-[#64748B]">যাচাই-বাছাইকৃত ও প্রামাণ্য তথ্যের ভিত্তিতে সংবাদ পরিবেশন।</p>
              </div>

              <div className="bg-[#F8FAFC] p-4 rounded-md border border-[#E2E8F0] text-center">
                <HeartHandshake className="w-8 h-8 text-[#0B7A43] mx-auto mb-2" />
                <h3 className="font-bold text-sm text-[#202124] mb-1">নিরপেক্ষতা</h3>
                <p className="text-xs text-[#64748B]">কোনো ব্যক্তি বা দলের প্রভাবমুক্ত স্বাধীন ও দায়িত্বশীল সাংবাদিকতা।</p>
              </div>

              <div className="bg-[#F8FAFC] p-4 rounded-md border border-[#E2E8F0] text-center">
                <Globe2 className="w-8 h-8 text-[#0B7A43] mx-auto mb-2" />
                <h3 className="font-bold text-sm text-[#202124] mb-1">সর্বব্যাপী কাভারেজ</h3>
                <p className="text-xs text-[#64748B]">দেশের প্রত্যন্ত অঞ্চল থেকে বিশ্বমঞ্চ—সব খবরের দ্রুততম আপডেট।</p>
              </div>
            </div>

            <h2 className="text-lg font-bold text-[#202124] pt-2">সম্পাদকের বার্তা</h2>
            <p>
              বাংলার আলো নিউজ কোনো রাজনৈতিক দল, করপোরেট গোষ্ঠী বা স্বার্থান্বেষী মহলের পক্ষপাতিত্ব করে না। আমাদের একমাত্র দায়বদ্ধতা দেশের জনগণ ও সত্যের প্রতি।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
