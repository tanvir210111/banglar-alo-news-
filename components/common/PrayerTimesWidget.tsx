"use client";

import React, { useEffect, useState } from "react";
import { getApiBaseUrl } from "@/services/apiClient";

export default function PrayerTimesWidget() {
  const [prayerData, setPrayerData] = useState<any>(null);

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        const isClient = typeof window !== "undefined";
        const isLive = isClient && window.location.hostname.includes("banglaralonews.com");
        const url = isLive
          ? "https://api.banglaralonews.com/api/v1/prayer-times"
          : `${getApiBaseUrl()}/prayer-times`;

        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setPrayerData(json.data);
          }
        }
      } catch (err) {
        // Silent fallback - prayer times widget is optional
      }
    };

    fetchPrayerTimes();
    // Refresh prayer times every 60 seconds
    const interval = setInterval(fetchPrayerTimes, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!prayerData || !prayerData.currentWaqt || !prayerData.nextWaqt) return null;

  const { currentWaqt, nextWaqt } = prayerData;

  return (
    <div
      className="hidden md:inline-flex items-center gap-2 bg-[#EAF5EE] text-[#087A43] border border-[#C6E6D2] px-2.5 py-0.5 rounded-full text-[11px] font-semibold shadow-2xs hover:bg-[#DDF0E4] transition-all cursor-default"
      title={`ঢাকা ও বাংলাদেশ সময় অনুযায়ী নামাজের ওয়াক্ত: ${currentWaqt.nameBn} | পরবর্তী: ${nextWaqt.nameBn} (${nextWaqt.startTime?.timeBn || ""})`}
    >
      <span className="flex h-1.5 w-1.5 rounded-full bg-[#087A43] animate-pulse"></span>
      <span className="truncate">
        এখন <strong className="font-bold">{currentWaqt.nameBn}</strong> ওয়াক্ত
        {currentWaqt.remaining?.formattedBn && (
          <span className="text-gray-500 font-normal ml-1">
            (বাকি {currentWaqt.remaining.formattedBn})
          </span>
        )}
      </span>
      <span className="text-gray-300">|</span>
      <span className="text-gray-600 hidden lg:inline">
        পরবর্তী: <strong className="text-[#087A43] font-bold">{nextWaqt.nameBn}</strong>{" "}
        ({nextWaqt.startTime?.timeBn || ""})
      </span>
    </div>
  );
}
