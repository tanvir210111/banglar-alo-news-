import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Users, Mail, Phone, MapPin, Award, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "আমাদের পরিবার | বাংলার আলো নিউজ",
  description: "বাংলার আলো নিউজ পরিবার — সত্য ও ন্যায়ের দীপ্ত কণ্ঠস্বর। আমাদের সম্পাদকীয় পর্ষদ, সাংবাদিক ও ব্যবস্থাপনা দল।",
};

export default function OurFamilyPage() {
  const editorialBoard = [
    { role: "প্রকাশক ও সম্পাদক", name: "মোঃ গোলাম মাওলা শাওন", email: "banglaralonewsbd@gmail.com" },
    { role: "বার্তা সম্পাদক", name: "মাহমুদুর রহমান", email: "banglaralonewsbd@gmail.com" },
    { role: "সহকারী বার্তা সম্পাদক", name: "সৈয়দ রফিকুল হাসান", email: "banglaralonewsbd@gmail.com" },
  ];

  const desks = [
    { title: "জাতীয় ও রাজনীতি ডেস্ক", lead: "মো. কামরুল হাসান", members: "রিপন মিয়া, আরিফুল ইসলাম" },
    { title: "অর্থনীতি ও বাণিজ্য ডেস্ক", lead: "তানজিলা আক্তার", members: "তাহমিদ জামান, সাদিয়া সুলতানা" },
    { title: "আন্তর্জাতিক ডেস্ক", lead: "ফারহান সাজিদ", members: "নুসরাত জাহান, ফাহিম মোর্শেদ" },
    { title: "সারাদেশ ও অনুসন্ধান ডেস্ক", lead: "রফিকুল আলম", members: "সবুজ সরকার, জহিরুল ইসলাম" },
    { title: "খেলাধুলা ও বিনোদন ডেস্ক", lead: "ইমরান খান", members: "সুমন রহমান, ফারিয়া মেহজাবিন" },
    { title: "অনলাইন ও সোশ্যাল মিডিয়া", lead: "শাকিল আহমেদ", members: "তাহসিন করিম, নওরিন আক্তার" },
  ];

  return (
    <div className="bg-[#F8FAFC] py-6 sm:py-10 min-h-[75vh]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-[#64748B] mb-5">
          <Link href="/" className="hover:text-[#0B7A43] transition-colors">
            প্রচ্ছদ
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">আমাদের পরিবার</span>
        </nav>

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-[#0B7A43] via-[#065F34] to-[#044424] text-white rounded-xl p-6 sm:p-8 shadow-md mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 rounded-lg bg-white/10 text-white">
              <Users className="w-6 h-6" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              Banglar Alo News Family
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
            আমাদের পরিবার — বাংলার আলো নিউজ
          </h1>
          <p className="text-sm sm:text-base text-emerald-100 max-w-2xl leading-relaxed">
            সত্য ও ন্যায়ের দীপ্ত কণ্ঠস্বর। বস্তুনিষ্ঠ সংবাদ পরিবেশন এবং দায়িত্বশীল সাংবাদিকতায় প্রতিশ্রুতিবদ্ধ একঝাঁক অভিজ্ঞ ও তরুণ সংবাদকর্মীর সমন্বয়ে গঠিত আমাদের এই পরিবার।
          </p>
        </div>

        {/* Editorial Board */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-6 mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-[#0B7A43] pb-3 border-b-2 border-[#0B7A43] mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-[#DC2626]" />
            <span>সম্পাদকীয় ও পরিচালনা পর্ষদ</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {editorialBoard.map((member, i) => (
              <div key={i} className="p-4 rounded-lg border border-gray-100 bg-[#F8FAFC] hover:border-emerald-300 transition-colors">
                <span className="text-xs font-bold text-[#DC2626] uppercase block mb-1">
                  {member.role}
                </span>
                <h3 className="text-base font-bold text-[#202124] mb-2">{member.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                  <Mail className="w-3.5 h-3.5 text-[#0B7A43]" />
                  <span className="truncate">{member.email}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* News Desks */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-6 mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-[#0B7A43] pb-3 border-b-2 border-[#0B7A43] mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#0B7A43]" />
            <span>বার্তা বিভাগ ও সম্পাদকীয় ডেস্ক</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {desks.map((desk, i) => (
              <div key={i} className="p-4 rounded-lg border border-gray-100 bg-[#F8FAFC]">
                <h3 className="text-sm font-bold text-[#0B7A43] mb-1">{desk.title}</h3>
                <p className="text-xs font-semibold text-[#202124] mb-1">
                  প্রধান: <span className="text-gray-700 font-normal">{desk.lead}</span>
                </p>
                <p className="text-xs text-[#64748B]">
                  সহযোগী: {desk.members}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact info card */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-6">
          <h2 className="text-base font-bold text-[#202124] mb-3">যোগাযোগ ও কার্যালয়</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#475569]">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#0B7A43]" />
              <span>ফোন: 01721539025</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#DC2626]" />
              <span>ইমেইল: support.shikkhasangbad@gmail.com</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#0B7A43]" />
              <span>ঢাকা, বাংলাদেশ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
