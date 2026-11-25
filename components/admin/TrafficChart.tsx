"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  AnalyticsTimeframe,
  AnalyticsChartPoint,
  NewsViewsAnalyticsResponse,
} from "@/types/analytics";
import {
  getNewsViewsAnalytics,
  recordWebsiteVisit,
} from "@/services/analyticsService";
import { RefreshCw, TrendingUp, Calendar, Eye, Award } from "lucide-react";

export interface DataPoint {
  date: string;
  value: number;
}

// Backward compatibility export
export function recordTrafficView() {
  recordWebsiteVisit();
}

const TIMEFRAME_OPTIONS: { label: string; value: AnalyticsTimeframe; daysBengali: string }[] = [
  { label: "৭ দিন", value: "7d", daysBengali: "৭ দিন" },
  { label: "১৫ দিন", value: "15d", daysBengali: "১৫ দিন" },
  { label: "৩০ দিন", value: "30d", daysBengali: "৩০ দিন" },
  { label: "৩ মাস", value: "3m", daysBengali: "৩ মাস" },
  { label: "৬ মাস", value: "6m", daysBengali: "৬ মাস" },
  { label: "১ বছর", value: "1y", daysBengali: "১ বছর" },
];

const BENGALI_MONTHS = [
  "জানু", "ফেব্রু", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টে", "অক্টো", "নভে", "ডিসে"
];

const BENGALI_FULL_MONTHS = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

const BENGALI_DIGITS: Record<string, string> = {
  "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
  "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯"
};

export function toBengaliNumber(val: number | string): string {
  return String(val).replace(/\d/g, (d) => BENGALI_DIGITS[d] || d);
}

// Formats "2026-11-09" into Date, Month, and Year components in Bengali
export function formatChartDate(dateStr: string): {
  dayMonth: string;
  year: string;
  fullDate: string;
  englishDate: string;
} {
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parts[2];
      const shortMonth = BENGALI_MONTHS[monthIdx] || parts[1];
      const fullMonth = BENGALI_FULL_MONTHS[monthIdx] || parts[1];
      const bnDay = toBengaliNumber(day);
      const bnYear = toBengaliNumber(year);

      return {
        dayMonth: `${bnDay} ${shortMonth}`,
        year: bnYear,
        fullDate: `${bnDay} ${fullMonth}, ${bnYear}`,
        englishDate: `${day} ${parts[1]}, ${year}`,
      };
    }
  } catch {}
  return {
    dayMonth: dateStr,
    year: "",
    fullDate: dateStr,
    englishDate: dateStr,
  };
}

interface TrafficChartProps {
  articles?: any[];
}

export default function TrafficChart({ articles }: TrafficChartProps) {
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>("15d");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewsData, setViewsData] = useState<NewsViewsAnalyticsResponse | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Fetch real news views analytics from backend
  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await getNewsViewsAnalytics(timeframe);
      if (res) setViewsData(res);
    } catch (err) {
      console.warn("TrafficChart fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  // Active chart points
  const activeChartData: AnalyticsChartPoint[] = useMemo(() => {
    return viewsData?.chartData || [];
  }, [viewsData]);

  // Dimensions
  const width = 1000;
  const height = 390;
  const paddingLeft = 60;
  const paddingRight = 36;
  const paddingTop = 32;
  const paddingBottom = 54; // Extra breathing room for Date, Month, and Year on X-axis

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const bottomY = paddingTop + chartHeight;
  const baselineY = bottomY - 4;

  // Calculate dynamic max Y for clean ticks
  const maxDataVal = useMemo(() => {
    if (activeChartData.length === 0) return 100;
    const maxVal = Math.max(...activeChartData.map((d) => d.count), 0);
    if (maxVal <= 10) return 20;
    if (maxVal <= 50) return 60;
    if (maxVal <= 100) return 120;
    if (maxVal <= 500) return 600;
    if (maxVal <= 1000) return 1200;
    if (maxVal <= 2500) return 2500;
    return Math.ceil((maxVal * 1.25) / 500) * 500;
  }, [activeChartData]);

  const yTicks = useMemo(() => {
    const step = maxDataVal / 4;
    return [maxDataVal, Math.round(step * 3), Math.round(step * 2), Math.round(step), 0];
  }, [maxDataVal]);

  const getPointY = (val: number) => {
    const clamped = Math.min(Math.max(val, 0), maxDataVal);
    return baselineY - (clamped / (maxDataVal || 1)) * (chartHeight - 24);
  };

  const points = useMemo(() => {
    if (activeChartData.length === 0) return [];
    return activeChartData.map((d, index) => {
      const x = paddingLeft + (index / Math.max(activeChartData.length - 1, 1)) * chartWidth;
      const y = getPointY(d.count);
      return { x, y, date: d.date, value: d.count };
    });
  }, [activeChartData, chartWidth, maxDataVal, baselineY, chartHeight]);

  // Find peak point
  const peakPoint = useMemo(() => {
    if (points.length === 0) return null;
    return points.reduce((prev, curr) => (curr.value > prev.value ? curr : prev), points[0]);
  }, [points]);

  // Monotone Spline algorithm for ultra-smooth organic curve
  const getMonotoneSplinePath = () => {
    const n = points.length;
    if (n === 0) return "";
    if (n === 1) return `M ${points[0].x} ${points[0].y}`;

    const dx: number[] = [];
    const dy: number[] = [];
    const slope: number[] = [];
    for (let i = 0; i < n - 1; i++) {
      dx.push(points[i + 1].x - points[i].x);
      dy.push(points[i + 1].y - points[i].y);
      slope.push(dy[i] / (dx[i] || 1));
    }

    const m: number[] = [];
    m.push(slope[0]);

    for (let i = 1; i < n - 1; i++) {
      if (slope[i - 1] * slope[i] <= 0) {
        m.push(0);
      } else {
        m.push((2 * slope[i - 1] * slope[i]) / (slope[i - 1] + slope[i]));
      }
    }
    m.push(slope[n - 2] || 0);

    let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
    for (let i = 0; i < n - 1; i++) {
      const cp1x = points[i].x + dx[i] / 3;
      const cp1y = points[i].y + (m[i] * dx[i]) / 3;
      const cp2x = points[i + 1].x - dx[i] / 3;
      const cp2y = points[i + 1].y - (m[i + 1] * dx[i]) / 3;

      path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${points[i + 1].x.toFixed(2)} ${points[i + 1].y.toFixed(2)}`;
    }
    return path;
  };

  const linePath = points.length > 0 ? getMonotoneSplinePath() : "";
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${baselineY} L ${points[0].x.toFixed(2)} ${baselineY} Z`
      : "";

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  // Metric summaries
  const todayVal = viewsData?.todayNewsViews ?? 0;

  const yesterdayVal = useMemo(() => {
    if (activeChartData.length >= 2) {
      return activeChartData[activeChartData.length - 2].count;
    }
    return 0;
  }, [activeChartData]);

  const periodTotal =
    viewsData?.totalInPeriod ?? activeChartData.reduce((acc, c) => acc + c.count, 0);

  const currentTfLabel =
    TIMEFRAME_OPTIONS.find((t) => t.value === timeframe)?.daysBengali || "১৫ দিন";

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Top Header Row matching modern analytics look */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1 pb-2 border-b border-[#F1F5F9]">
        {/* Left: Quick KPI Badges (Today, Yesterday, Peak) */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-[13px] font-medium text-[#0A2540]">
          {/* Today Views */}
          <div className="flex items-center gap-2 bg-[#F0F5FF] px-3 py-1.5 rounded-xl border border-[#D6E4FF]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3858F6] animate-pulse shrink-0" />
            <span>
              আজকের ভিউ:{" "}
              <strong className="text-sm sm:text-[15px] font-extrabold text-[#1D4ED8]">
                {toBengaliNumber(todayVal.toLocaleString())}
              </strong>
            </span>
          </div>

          {/* Yesterday Views */}
          <div className="flex items-center gap-2 bg-[#F0FDF4] px-3 py-1.5 rounded-xl border border-[#DCFCE7]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
            <span>
              গতকালের ভিউ:{" "}
              <strong className="text-sm sm:text-[15px] font-extrabold text-[#059669]">
                {toBengaliNumber(yesterdayVal.toLocaleString())}
              </strong>
            </span>
          </div>

          {/* Peak Views in period */}
          {peakPoint && peakPoint.value > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 text-[#64748B] text-xs">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>
                সর্বোচ্চ:{" "}
                <strong className="text-[#0A2540] font-bold">
                  {toBengaliNumber(peakPoint.value.toLocaleString())}
                </strong>
              </span>
            </div>
          )}
        </div>

        {/* Right: Period total headline + Timeframe filter pills */}
        <div className="flex flex-wrap items-center gap-3 lg:justify-end">
          <div className="text-xs sm:text-[13.5px] font-bold text-[#0A2540]">
            সর্বশেষ {currentTfLabel}ের মোট ভিউ:{" "}
            <span className="text-[#2563EB] font-extrabold">
              {toBengaliNumber(periodTotal.toLocaleString())} বার
            </span>
          </div>

          {/* Timeframe Selector & Refresh */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-0.5 text-[11px] font-semibold text-[#64748B] shadow-2xs">
              {TIMEFRAME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTimeframe(opt.value)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    timeframe === opt.value
                      ? "bg-[#3858F6] text-white font-bold shadow-xs"
                      : "hover:text-[#0A2540] hover:bg-white/60"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={fetchAnalytics}
              title="লাইভ ডেটা রিফ্রেশ করুন"
              disabled={isLoading}
              className="p-1.5 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0A2540] transition disabled:opacity-50 shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#3858F6]" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Modern Area Spline Chart with Date, Month, and Year on X-axis */}
      <div className="w-full overflow-x-auto no-scrollbar pt-2">
        <div className="min-w-[700px] select-none">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible font-sans"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <defs>
              {/* Multi-stop smooth glow gradient under curve */}
              <linearGradient id="realViewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3858F6" stopOpacity="0.28" />
                <stop offset="35%" stopColor="#3858F6" stopOpacity="0.12" />
                <stop offset="75%" stopColor="#3858F6" stopOpacity="0.03" />
                <stop offset="100%" stopColor="#3858F6" stopOpacity="0.0" />
              </linearGradient>

              {/* Badge gradient */}
              <linearGradient id="badgeGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3858F6" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>

              {/* Active Badge gradient */}
              <linearGradient id="activeBadgeGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#1E40AF" />
              </linearGradient>

              {/* Drop Shadow for value pills */}
              <filter id="pillShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#1D4ED8" floodOpacity="0.25" />
              </filter>

              {/* Tooltip drop shadow */}
              <filter id="tooltipShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0F172A" floodOpacity="0.2" />
              </filter>
            </defs>

            {/* Horizontal Grid lines and Y-axis labels */}
            {yTicks.map((tickVal, i) => {
              const y = getPointY(tickVal);
              return (
                <g key={`y-grid-${i}`}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeWidth="1"
                    strokeDasharray={tickVal === 0 ? "none" : "3 3"}
                  />
                  <text
                    x={paddingLeft - 12}
                    y={y + 4}
                    textAnchor="end"
                    fill="#94A3B8"
                    fontSize="11"
                    fontWeight="600"
                  >
                    {toBengaliNumber(tickVal.toLocaleString())}
                  </text>
                </g>
              );
            })}

            {/* Area Path */}
            {areaPath && <path d={areaPath} fill="url(#realViewsGradient)" />}

            {/* Ambient Line Glow */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="#3858F6"
                strokeWidth="6"
                strokeOpacity="0.16"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Sharp Spline Stroke Line */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Vertical Guide Crosshair Line on hover */}
            {hoveredPoint && (
              <line
                x1={hoveredPoint.x}
                y1={paddingTop}
                x2={hoveredPoint.x}
                y2={baselineY}
                stroke="#3858F6"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                strokeOpacity="0.45"
              />
            )}

            {/* X-axis date labels: Date, Month, and Year */}
            {points.map((p, idx) => {
              // Smart density display: show every label for <= 16 points; else sample evenly
              const shouldShow =
                points.length <= 16 ||
                idx === 0 ||
                idx === points.length - 1 ||
                idx % Math.ceil(points.length / 8) === 0;

              if (!shouldShow) return null;

              const isHovered = hoveredIndex === idx;
              const { dayMonth, year } = formatChartDate(p.date);

              return (
                <g
                  key={`date-${p.date}-${idx}`}
                  className="transition-all duration-150"
                >
                  {/* Subtle vertical tick marker */}
                  <line
                    x1={p.x}
                    y1={baselineY}
                    x2={p.x}
                    y2={baselineY + 4}
                    stroke={isHovered ? "#3858F6" : "#CBD5E1"}
                    strokeWidth="1"
                  />

                  {/* Line 1: Day & Month (e.g. "০৯ নভে") */}
                  <text
                    x={p.x}
                    y={bottomY + 16}
                    textAnchor="middle"
                    fill={isHovered ? "#1D4ED8" : "#334155"}
                    fontSize="11"
                    fontWeight={isHovered ? "700" : "600"}
                    className="select-none pointer-events-none tracking-tight"
                  >
                    {dayMonth}
                  </text>

                  {/* Line 2: Year (e.g. "২০২৬") */}
                  <text
                    x={p.x}
                    y={bottomY + 30}
                    textAnchor="middle"
                    fill={isHovered ? "#3858F6" : "#94A3B8"}
                    fontSize="9.5"
                    fontWeight="500"
                    className="select-none pointer-events-none"
                  >
                    {year}
                  </text>
                </g>
              );
            })}

            {/* Data point dot and Dynamic Value badges centered on curve points */}
            {points.map((p, idx) => {
              const isHovered = hoveredIndex === idx;
              const isPeak = peakPoint && p.date === peakPoint.date && p.value > 0;
              const isToday = idx === points.length - 1;
              const valText = toBengaliNumber(p.value.toLocaleString());
              const badgeWidth = Math.max(36, valText.length * 9.5 + 14);

              return (
                <g
                  key={`badge-${p.date}-${idx}`}
                  transform={`translate(${p.x}, ${p.y})`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                >
                  {/* Point Halo Circle on Today / Peak */}
                  {(isToday || isPeak) && (
                    <circle
                      r="12"
                      fill="#3858F6"
                      fillOpacity={isHovered ? "0.3" : "0.15"}
                      className={isToday ? "animate-pulse" : ""}
                    />
                  )}

                  {/* Center Dot */}
                  <circle
                    r={isHovered ? "5" : "3.5"}
                    fill="#FFFFFF"
                    stroke={isPeak ? "#F59E0B" : "#2563EB"}
                    strokeWidth="2.5"
                    className="transition-all duration-150"
                  />

                  {/* Value Badge Pill */}
                  <g transform="translate(0, -18)">
                    <rect
                      x={-badgeWidth / 2}
                      y="-10"
                      width={badgeWidth}
                      height="20"
                      rx="5"
                      fill={isHovered ? "url(#activeBadgeGradient)" : "url(#badgeGradient)"}
                      stroke={isPeak ? "#FCD34D" : "rgba(255, 255, 255, 0.4)"}
                      strokeWidth={isPeak ? "1.5" : "1"}
                      filter="url(#pillShadow)"
                      className={`transition-all duration-150 ${
                        isHovered ? "scale-110 filter drop-shadow-md" : ""
                      }`}
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="10.5"
                      fontWeight="700"
                      className="select-none tracking-tight pointer-events-none"
                    >
                      {valText}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Invisible hover slice targets for buttery smooth mouse interaction */}
            {points.map((p, idx) => {
              const sliceWidth = chartWidth / Math.max(points.length - 1, 1);
              return (
                <rect
                  key={`hit-${p.date}-${idx}`}
                  x={p.x - sliceWidth / 2}
                  y={paddingTop}
                  width={sliceWidth}
                  height={chartHeight + 40}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                />
              );
            })}

            {/* Interactive Floating Glassmorphism Tooltip */}
            {hoveredPoint && (
              <g
                transform={`translate(${
                  hoveredPoint.x > width - 180 ? hoveredPoint.x - 170 : hoveredPoint.x + 14
                }, ${Math.max(paddingTop, hoveredPoint.y - 65)})`}
                filter="url(#tooltipShadow)"
                className="pointer-events-none transition-all duration-150"
              >
                {/* Tooltip Card Body */}
                <rect
                  x="0"
                  y="0"
                  width="160"
                  height="58"
                  rx="10"
                  fill="#0F172A"
                  fillOpacity="0.96"
                  stroke="#334155"
                  strokeWidth="1"
                />

                {/* Calendar Icon + Date */}
                <text x="12" y="21" fill="#94A3B8" fontSize="10.5" fontWeight="500">
                  📅 {formatChartDate(hoveredPoint.date).fullDate}
                </text>

                {/* Views Count */}
                <text x="12" y="44" fill="#FFFFFF" fontSize="15" fontWeight="800">
                  {toBengaliNumber(hoveredPoint.value.toLocaleString())}{" "}
                  <tspan fill="#60A5FA" fontSize="11" fontWeight="600">
                    বার ভিউ
                  </tspan>
                </text>
              </g>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
