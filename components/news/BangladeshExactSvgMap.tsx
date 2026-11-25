'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BANGLADESH_DISTRICTS_SVG, DIVISION_CENTERS, DistrictSvgItem } from '@/lib/bangladeshDistrictsSvgData';

interface BangladeshExactSvgMapProps {
  onSelectDivision?: (divisionId: string) => void;
  onSelectDistrict?: (districtName: string) => void;
  selectedDivision?: string;
  selectedDistrict?: string;
}

export default function BangladeshExactSvgMap({
  onSelectDivision,
  onSelectDistrict,
  selectedDivision,
  selectedDistrict,
}: BangladeshExactSvgMapProps) {
  const router = useRouter();
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictSvgItem | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  const handleDistrictClick = (d: DistrictSvgItem) => {
    if (onSelectDistrict) {
      onSelectDistrict(d.nameBn);
    }
    if (onSelectDivision && d.divisionId) {
      onSelectDivision(d.divisionId);
    }
    // Navigate directly to that district's all news page
    router.push(`/district/${d.id}`);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div className="w-full relative flex flex-col justify-center items-center py-1 select-none">
      <svg
        viewBox="0 0 500 650"
        className="w-full h-auto max-h-[520px] drop-shadow-md select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          setHoveredDistrict(null);
          setHoverPos(null);
        }}
      >
        <defs>
          <filter id="map-drop-shadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
          </filter>
          <filter id="selected-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#F59E0B" floodOpacity="0.9" />
          </filter>
        </defs>

        {/* 64 District Polygons with clean white borders and distinct colors */}
        <g id="districts" filter="url(#map-drop-shadow)">
          {BANGLADESH_DISTRICTS_SVG.map((d) => {
            const isSelected = selectedDistrict === d.nameBn || selectedDistrict === d.name;
            const isDivSelected = selectedDivision === d.divisionId;
            const isHovered = hoveredDistrict?.id === d.id;

            // Determine Fill Color
            let fill = d.color;
            if (isSelected) {
              fill = "#F59E0B"; // Bright Golden Amber
            } else if (isHovered) {
              fill = "#FBBF24"; // Warm Amber
            } else if (selectedDivision && !isDivSelected) {
              // Mute other divisions slightly if a specific division is selected
              fill = d.color + "99";
            }

            return (
              <path
                key={d.id}
                id={`district-${d.id}`}
                d={d.pathData}
                fill={fill}
                stroke="#FFFFFF"
                strokeWidth={isSelected ? 2 : 0.85}
                strokeLinejoin="round"
                strokeLinecap="round"
                className="cursor-pointer transition-all duration-150"
                onClick={() => handleDistrictClick(d)}
                onMouseEnter={() => setHoveredDistrict(d)}
                filter={isSelected ? "url(#selected-glow)" : undefined}
              >
                <title>{`${d.nameBn} জেলা (${d.divisionBn} বিভাগ) — সকল সংবাদ দেখতে ক্লিক করুন`}</title>
              </path>
            );
          })}
        </g>

        {/* Division Pin Markers (Matching reference image with white pin + Bengali text) */}
        <g id="division-pins" className="pointer-events-none">
          {Object.entries(DIVISION_CENTERS).map(([divId, div]) => {
            const isSelected = selectedDivision === divId;
            const [cx, cy] = div.center;

            return (
              <g
                key={divId}
                transform={`translate(${cx}, ${cy})`}
                className="pointer-events-auto cursor-pointer"
                onClick={() => onSelectDivision && onSelectDivision(divId)}
              >
                {/* Pin Shadow */}
                <ellipse cx="0" cy="5" rx="10" ry="3.5" fill="#000000" opacity="0.25" />

                {/* White Location Pin Icon */}
                <path
                  d="M0,-16 C-5,-16 -9,-12 -9,-7 C-9,-2 -3,2 0,6 C3,2 9,-2 9,-7 C9,-12 5,-16 0,-16 Z"
                  fill="#FFFFFF"
                  stroke={isSelected ? "#F59E0B" : "#1F2937"}
                  strokeWidth="1.2"
                />
                <circle cx="0" cy="-7" r="2.8" fill={div.color === "green" ? "#0B7A43" : "#DC2626"} />

                {/* Division Label Badge */}
                <rect
                  x="-28"
                  y="7"
                  width="56"
                  height="16"
                  rx="4"
                  fill="rgba(0,0,0,0.65)"
                  stroke="#FFFFFF"
                  strokeWidth="0.8"
                />
                <text
                  x="0"
                  y="19"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="system-ui, sans-serif"
                >
                  {div.nameBn}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Floating Hover Tooltip */}
      {hoveredDistrict && hoverPos && (
        <div
          className="absolute pointer-events-none z-30 bg-[#111827] text-white px-2.5 py-1 rounded shadow-lg text-xs font-bold border border-white/20 whitespace-nowrap transform -translate-x-1/2 -translate-y-full mb-2"
          style={{
            left: `${hoverPos.x}px`,
            top: `${hoverPos.y - 8}px`,
          }}
        >
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block border border-white/50"
              style={{ backgroundColor: hoveredDistrict.color }}
            />
            <span>{hoveredDistrict.nameBn} জেলা</span>
            <span className="text-gray-300 text-[10px]">({hoveredDistrict.divisionBn})</span>
          </div>
        </div>
      )}
    </div>
  );
}
