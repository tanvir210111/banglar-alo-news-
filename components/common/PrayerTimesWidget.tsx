"use client";

import React, { useEffect, useState } from "react";
import { Clock, MapPin, Sparkles, Sun, Moon, Sunrise, Sunset, ChevronDown } from "lucide-react";
import { getApiBaseUrl } from "@/services/apiClient";

interface PrayerTimesWidgetProps {
  className?: string;
}

const CITIES = [
  { id: "dhaka", nameBn: "ঢাকা", nameEn: "Dhaka" },
  { id: "chittagong", nameBn: "চট্টগ্রাম", nameEn: "Chittagong" },
  { id: "sylhet", nameBn: "সিলেট", nameEn: "Sylhet" },
  { id: "rajshahi", nameBn: "রাজশাহী", nameEn: "Rajshahi" },
  { id: "khulna", nameBn: "খুলনা", nameEn: "Khulna" },
  { id: "barishal", nameBn: "বরিশাল", nameEn: "Barishal" },
  { id: "rangpur", nameBn: "রংপুর", nameEn: "Rangpur" },
  { id: "mymensingh", nameBn: "ময়মনসিংহ", nameEn: "Mymensingh" },
];

export default function PrayerTimesWidget({ className = "" }: PrayerTimesWidgetProps) {
  const [selectedCity, setSelectedCity] = useState("dhaka");
  const [prayerData, setPrayerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const fetchPrayerTimes = async () => {
      try {
        const isClient = typeof window !== "undefined";
        const isLive = isClient && window.location.hostname.includes("banglaralonews.com");
        const base = isLive
          ? "https://api.banglaralonews.com/api/v1"
          : getApiBaseUrl();

        const res = await fetch(`${base}/prayer-times?city=${selectedCity}`);
        if (res.ok) {
          const json = await res.json();
          if (!isCancelled && json.success && json.data) {
            setPrayerData(json.data);
          }
        }
      } catch (err) {
        console.warn("Prayer times fetch error:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchPrayerTimes();
    const interval = setInterval(fetchPrayerTimes, 60000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [selectedCity]);

  if (!prayerData && loading) {
    return (
      <div className={`w-full bg-white rounded-lg border border-[#CBD5E1] p-4 shadow-xs animate-pulse ${className}`}>
        <div className="h-6 bg-emerald-100 rounded-md w-1/2 mb-3" />
        <div className="h-16 bg-gray-100 rounded-lg mb-3" />
        <div className="space-y-2">
          <div className="h-7 bg-gray-50 rounded" />
          <div className="h-7 bg-gray-50 rounded" />
          <div className="h-7 bg-gray-50 rounded" />
          <div className="h-7 bg-gray-50 rounded" />
          <div className="h-7 bg-gray-50 rounded" />
        </div>
      </div>
    );
  }

  if (!prayerData) return null;

  const { location, currentWaqt, nextWaqt, schedule } = prayerData;

  const PRAYER_LIST = [
    {
      key: "fajr",
      nameBn: "ফজর",
      startTime: schedule?.fajr?.startTime?.timeBn || "০৫:০২ পূর্বাহ্ন",
      endTime: schedule?.fajr?.endTime?.timeBn || "০৬:২২ পূর্বাহ্ন",
      icon: Moon,
    },
    {
      key: "dhuhr",
      nameBn: "যোহর",
      startTime: schedule?.dhuhr?.startTime?.timeBn || "১১:৪৭ পূর্বাহ্ন",
      endTime: schedule?.dhuhr?.endTime?.timeBn || "০৩:৩৫ অপরাহ্ন",
      icon: Sun,
    },
    {
      key: "asr",
      nameBn: "আসর",
      startTime: schedule?.asr?.startTime?.timeBn || "০৩:৩৫ অপরাহ্ন",
      endTime: schedule?.asr?.endTime?.timeBn || "০৫:১১ অপরাহ্ন",
      icon: Sun,
    },
    {
      key: "maghrib",
      nameBn: "মাগরিব",
      startTime: schedule?.maghrib?.startTime?.timeBn || "০৫:১১ অপরাহ্ন",
      endTime: schedule?.maghrib?.endTime?.timeBn || "০৬:৩০ অপরাহ্ন",
      icon: Sunset,
    },
    {
      key: "isha",
      nameBn: "এশা",
      startTime: schedule?.isha?.startTime?.timeBn || "০৬:৩০ অপরাহ্ন",
      endTime: schedule?.isha?.endTime?.timeBn || "০৫:০৩ পূর্বাহ্ন",
      icon: Moon,
    },
  ];

  return (
    <div
      className={`w-full bg-white rounded-lg border border-[#CBD5E1] shadow-xs overflow-hidden transition-all hover:shadow-md ${className}`}
    >
      {/* 1. Header with Islamic Green Gradient & City Selector */}
      <div className="bg-gradient-to-r from-[#0B7A43] via-[#065F34] to-[#044424] text-white px-3.5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-white/15 backdrop-blur-xs text-white">
            <Clock className="w-4 h-4 text-white" style={{ color: "#ffffff" }} />
          </span>
          <div>
            <h3
              className="font-extrabold text-sm sm:text-base leading-tight flex items-center gap-1.5 text-white"
              style={{ color: "#ffffff" }}
            >
              <span className="text-white" style={{ color: "#ffffff" }}>
                আজকের নামাজের সময়সূচি
              </span>
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            </h3>
            <span
              className="text-[10.5px] font-medium text-emerald-100 block mt-0.5"
              style={{ color: "#ecfdf5" }}
            >
              ইসলামিক ফাউন্ডেশন বাংলাদেশ অনুযায়ী
            </span>
          </div>
        </div>

        {/* City Selector */}
        <div className="relative">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            style={{ color: "#ffffff" }}
            className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-2 py-1 rounded-md border border-white/30 focus:outline-none appearance-none pr-5 cursor-pointer"
          >
            {CITIES.map((c) => (
              <option key={c.id} value={c.id} className="text-gray-900 bg-white">
                {c.nameBn}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-white absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* 2. Current Active Waqt Banner */}
      {currentWaqt && (
        <div className="p-3 bg-gradient-to-b from-[#EAF5EE] to-white border-b border-[#E2E8F0]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#087A43]"></span>
              </span>
              <div>
                <span className="text-xs text-gray-500 font-medium">বর্তমান ওয়াক্ত</span>
                <h4 className="text-base font-black text-[#0B7A43] leading-none mt-0.5">
                  {currentWaqt.nameBn}
                </h4>
              </div>
            </div>

            {currentWaqt.remaining?.formattedBn && (
              <div className="text-right">
                <span className="text-[11px] text-gray-400 block font-medium">ওয়াক্ত বাকি</span>
                <span className="text-xs font-extrabold text-[#DC2626]">
                  {currentWaqt.remaining.formattedBn}
                </span>
              </div>
            )}
          </div>

          {nextWaqt && (
            <div className="mt-2 pt-2 border-t border-emerald-100 flex items-center justify-between text-[11px] text-gray-600">
              <span>
                পরবর্তী ওয়াক্ত: <strong className="text-[#087A43] font-bold">{nextWaqt.nameBn}</strong>
              </span>
              <span className="font-semibold text-gray-700">
                শুরু: {nextWaqt.startTime?.timeBn}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 3. Five Daily Prayers Schedule Table */}
      <div className="p-3">
        <div className="space-y-1.5">
          {PRAYER_LIST.map((p) => {
            const isCurrent = currentWaqt?.key === p.key;
            const Icon = p.icon;
            return (
              <div
                key={p.key}
                style={isCurrent ? { color: "#ffffff" } : {}}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                  isCurrent
                    ? "bg-[#0B7A43] text-white font-bold shadow-xs scale-[1.01]"
                    : "bg-gray-50/80 hover:bg-gray-100/80 text-gray-700 font-medium"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${isCurrent ? "text-yellow-300" : "text-[#0B7A43]"}`} />
                  <span className="text-xs sm:text-[13px]" style={isCurrent ? { color: "#ffffff" } : {}}>
                    {p.nameBn}
                  </span>
                  {isCurrent && (
                    <span
                      className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-normal"
                      style={{ color: "#ffffff" }}
                    >
                      চলছে
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 font-mono" style={isCurrent ? { color: "#ffffff" } : {}}>
                  <span>{p.startTime}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. Extra Timings: Sehri, Iftar & Sunrise */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100 text-center">
          <div className="p-1.5 rounded-lg bg-emerald-50/80 border border-emerald-100">
            <span className="text-[10px] text-emerald-800 font-semibold block">সেহরি শেষ</span>
            <span className="text-[11px] font-bold text-[#0B7A43]">
              {schedule?.sehriEnds?.time?.timeBn || "০৪:৫৮ পূর্বাহ্ন"}
            </span>
          </div>
          <div className="p-1.5 rounded-lg bg-amber-50/80 border border-amber-100">
            <span className="text-[10px] text-amber-800 font-semibold block flex items-center justify-center gap-0.5">
              <Sunrise className="w-2.5 h-2.5 text-amber-600" />
              সূর্যোদয়
            </span>
            <span className="text-[11px] font-bold text-amber-700">
              {schedule?.sunrise?.time?.timeBn || "০৬:২২ পূর্বাহ্ন"}
            </span>
          </div>
          <div className="p-1.5 rounded-lg bg-rose-50/80 border border-rose-100">
            <span className="text-[10px] text-rose-800 font-semibold block flex items-center justify-center gap-0.5">
              <Sunset className="w-2.5 h-2.5 text-rose-600" />
              ইফতার
            </span>
            <span className="text-[11px] font-bold text-rose-700">
              {schedule?.iftar?.time?.timeBn || "০৫:১১ অপরাহ্ন"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
