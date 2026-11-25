"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Users, Mail, Phone, Award, CheckCircle2, Building, HeartHandshake } from "lucide-react";
import { FamilyMember, DEFAULT_FAMILY_MEMBERS } from "@/types/family";
import { getFamilyMembers } from "@/services/familyService";

export default function OurFamilyPage() {
  const [members, setMembers] = useState<FamilyMember[]>(DEFAULT_FAMILY_MEMBERS);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const data = await getFamilyMembers();
      setMembers(data);
    } catch {
      setMembers(DEFAULT_FAMILY_MEMBERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Cross-tab real-time sync
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "banglar_alo_family_updated") {
        loadData();
      }
    };
    window.addEventListener("storage", handleStorage);

    let channel: BroadcastChannel | null = null;
    try {
      if ("BroadcastChannel" in window) {
        channel = new BroadcastChannel("banglar_alo_news_channel");
        channel.onmessage = (event) => {
          if (event.data?.type === "FAMILY_UPDATED") {
            loadData();
          }
        };
      }
    } catch {}

    return () => {
      window.removeEventListener("storage", handleStorage);
      channel?.close();
    };
  }, []);

  const editorialMembers = members.filter((m) => m.category === "editorial" && m.isActive !== false);
  const deskMembers = members.filter((m) => m.category === "desk" && m.isActive !== false);
  const otherMembers = members.filter(
    (m) => m.category !== "editorial" && m.category !== "desk" && m.isActive !== false
  );

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
        <div className="bg-gradient-to-r from-[#0B7A43] via-[#065F34] to-[#044424] text-white rounded-2xl p-6 sm:p-8 shadow-md mb-8">
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

        {/* Editorial Board (সম্পাদকীয় ও পরিচালনা পর্ষদ) */}
        {editorialMembers.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-6 mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-[#0B7A43] pb-3 border-b-2 border-[#0B7A43] mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#DC2626]" />
                <span>সম্পাদকীয় ও পরিচালনা পর্ষদ</span>
              </span>
              <span className="text-xs font-medium text-gray-500 font-sans">
                {editorialMembers.length} জন সদস্য
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {editorialMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-5 rounded-xl border border-gray-100 bg-[#F8FAFC] hover:border-emerald-300 transition-all flex flex-col justify-between group hover:shadow-xs"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-[#0B7A43] text-white flex items-center justify-center font-bold text-base shrink-0 overflow-hidden shadow-xs">
                      {member.photo ? (
                        <Image
                          src={member.photo}
                          alt={member.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        member.name.slice(0, 2)
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#DC2626] uppercase block mb-1">
                        {member.role}
                      </span>
                      <h3 className="text-base font-extrabold text-[#202124] group-hover:text-[#0B7A43] transition-colors">
                        {member.name}
                      </h3>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200/60 space-y-1.5 text-xs text-[#64748B]">
                    {member.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#0B7A43] shrink-0" />
                        <span className="font-medium text-[#202124]">{member.phone}</span>
                      </div>
                    )}
                    {member.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* News Desks (বার্তা বিভাগ ও সম্পাদকীয় ডেস্ক) */}
        {deskMembers.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-6 mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-[#0B7A43] pb-3 border-b-2 border-[#0B7A43] mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#0B7A43]" />
                <span>বার্তা বিভাগ ও সম্পাদকীয় ডেস্ক</span>
              </span>
              <span className="text-xs font-medium text-gray-500 font-sans">
                {deskMembers.length} টি ডেস্ক
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {deskMembers.map((desk) => (
                <div
                  key={desk.id}
                  className="p-4 rounded-xl border border-gray-100 bg-[#F8FAFC] hover:border-emerald-200 transition-colors"
                >
                  <h3 className="text-sm font-bold text-[#0B7A43] mb-1.5 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#0B7A43]" />
                    <span>{desk.categoryTitle || desk.role}</span>
                  </h3>
                  <p className="text-xs font-semibold text-[#202124] mb-1">
                    {desk.role}: <span className="text-gray-800 font-bold">{desk.name}</span>
                  </p>
                  {desk.subMembers && (
                    <p className="text-xs text-[#64748B] pt-1 border-t border-gray-100">
                      সহযোগী: {desk.subMembers}
                    </p>
                  )}
                  {desk.email && (
                    <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-gray-400" />
                      <span>{desk.email}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Members / Representatives */}
        {otherMembers.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-6 mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-[#0B7A43] pb-3 border-b-2 border-[#0B7A43] mb-6 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-[#1877F2]" />
              <span>প্রতিনিধি ও ব্যবস্থাপনা দল</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {otherMembers.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-xl border border-gray-100 bg-[#F8FAFC] hover:border-blue-200 transition-colors"
                >
                  <span className="text-xs font-bold text-[#1877F2] uppercase block mb-1">
                    {m.role}
                  </span>
                  <h3 className="text-base font-bold text-[#202124] mb-1">{m.name}</h3>
                  {m.phone && <p className="text-xs text-gray-600 mb-1">ফোন: {m.phone}</p>}
                  {m.email && <p className="text-xs text-gray-400">ইমেইল: {m.email}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Official Contact Info Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-6">
          <h2 className="text-base font-bold text-[#202124] mb-3">যোগাযোগের ঠিকানা</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#64748B]">
            <div>
              <p className="font-semibold text-[#202124] mb-1">প্রধান কার্যালয়:</p>
              <p>৩১/১ শরীফ কমপ্লেক্স (৬ষ্ঠ তলা), পুরানা পল্টন, ঢাকা-১০০০</p>
              <p className="mt-1">মোবাইল: ০১৯৯৯-৯৫৩৯৭০, ০১৭১১-০০৬২১৪</p>
              <p>ই-মেইল: banglaralonewsbd@gmail.com</p>
            </div>
            <div>
              <p className="font-semibold text-[#202124] mb-1">আমাদের অঙ্গীকার:</p>
              <p className="leading-relaxed">
                স্বাধীনতা ও মানবতার কথা বলে। সত্য ও ন্যায়ের অঙ্গীকার নিয়ে পরিচালিত বাংলাদেশের শীর্ষস্থানীয় অনলাইন সংবাদমাধ্যম।
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
