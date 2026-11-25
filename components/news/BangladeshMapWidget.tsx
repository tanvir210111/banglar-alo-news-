"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search, RotateCcw } from "lucide-react";
import { BANGLADESH_DIVISIONS, DistrictItem } from "@/lib/bangladeshGeoData";
import { useLanguage } from "@/context/LanguageContext";
import BangladeshExactSvgMap from "./BangladeshExactSvgMap";

const DIV_NAME_TO_ID: Record<string, string> = {
  "রংপুর": "rangpur",
  "রাজশাহী": "rajshahi",
  "ময়মনসিংহ": "mymensingh",
  "সিলেট": "sylhet",
  "ঢাকা": "dhaka",
  "খুলনা": "khulna",
  "বরিশাল": "barishal",
  "চট্টগ্রাম": "chattogram",
};

export default function BangladeshMapWidget() {
  const router = useRouter();
  const { isBn } = useLanguage();

  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedUpazila, setSelectedUpazila] = useState<string>("");

  // Available districts based on selected division
  const availableDistricts = useMemo<DistrictItem[]>(() => {
    if (!selectedDivision) {
      return BANGLADESH_DIVISIONS.flatMap((div) => div.districts);
    }
    const div = BANGLADESH_DIVISIONS.find((d) => d.id === selectedDivision);
    return div ? div.districts : [];
  }, [selectedDivision]);

  // Available upazilas based on selected district
  const availableUpazilas = useMemo<string[]>(() => {
    if (!selectedDistrict) return [];
    const dist = availableDistricts.find(
      (d) => d.name === selectedDistrict || d.id === selectedDistrict
    );
    return dist ? dist.upazilas : [];
  }, [selectedDistrict, availableDistricts]);

  // Handle Division Selection from Map click or Dropdown
  const handleDivisionSelect = (divIdOrName: string) => {
    const id = DIV_NAME_TO_ID[divIdOrName] || divIdOrName;
    if (selectedDivision === id) {
      setSelectedDivision("");
      setSelectedDistrict("");
      setSelectedUpazila("");
    } else {
      setSelectedDivision(id);
      setSelectedDistrict("");
      setSelectedUpazila("");
    }
  };

  // Handle District Selection
  const handleDistrictChange = (distName: string) => {
    setSelectedDistrict(distName);
    setSelectedUpazila("");
    if (!selectedDivision && distName) {
      const parentDiv = BANGLADESH_DIVISIONS.find((div) =>
        div.districts.some((d) => d.name === distName || d.id === distName)
      );
      if (parentDiv) setSelectedDivision(parentDiv.id);
    }
  };

  // Search Action
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParts: string[] = [];
    if (selectedUpazila) queryParts.push(selectedUpazila);
    if (selectedDistrict) queryParts.push(selectedDistrict);
    if (!selectedDistrict && selectedDivision) {
      const divObj = BANGLADESH_DIVISIONS.find((d) => d.id === selectedDivision);
      if (divObj) queryParts.push(divObj.name);
    }

    if (queryParts.length > 0) {
      router.push(`/search?q=${encodeURIComponent(queryParts.join(" "))}`);
    } else {
      router.push("/category/countrywide");
    }
  };

  const currentDivObj = BANGLADESH_DIVISIONS.find((d) => d.id === selectedDivision);

  return (
    <div className="bg-[#eff3f4] rounded-lg border border-[#D5DDE5] shadow-xs p-3 sm:p-4 my-4">
      {/* 1. Header: এক নজরে বাংলাদেশ + ডাবল গ্রে বার (হুবহু রেফারেন্স ইমেজের মতো) */}
      <div className="flex items-center justify-between pb-2 mb-1 border-b border-gray-200/80">
        <h3 className="text-lg sm:text-[21px] font-extrabold text-[#111827] tracking-tight shrink-0 flex items-center gap-1.5">
          <MapPin className="w-5 h-5 text-[#bd0202]" />
          <span>{isBn ? "এক নজরে বাংলাদেশ" : "Bangladesh at a Glance"}</span>
        </h3>
        <div className="flex-1 max-w-[120px] sm:max-w-[160px] ml-3 flex flex-col gap-1">
          <div className="h-[3px] bg-[#CBD5E1] rounded-full w-full"></div>
          <div className="h-[3px] bg-[#CBD5E1] rounded-full w-3/4 ml-auto"></div>
        </div>
      </div>

      {/* 2. Bangladesh Exact SVG Vector Map with Divisions & 64 Districts */}
      <div className="w-full overflow-hidden bg-[#eff3f4] select-none py-1">
        <BangladeshExactSvgMap
          onSelectDivision={handleDivisionSelect}
          onSelectDistrict={handleDistrictChange}
          selectedDivision={selectedDivision}
          selectedDistrict={selectedDistrict}
        />
      </div>

      {/* 3. Selected District/Division Active Indicator */}
      {(selectedDistrict || selectedDivision) && (
        <div className="bg-white/95 rounded px-2.5 py-1.5 my-2 border border-gray-200 flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center gap-1.5 font-bold text-[#0B7A43]">
            <MapPin className="w-3.5 h-3.5 text-[#bd0202]" />
            <span>
              {selectedDistrict ? (
                <>
                  <span className="text-[#bd0202]">{selectedDistrict}</span> জেলা
                  {currentDivObj ? ` (${currentDivObj.name} বিভাগ)` : ""}
                </>
              ) : (
                <>{currentDivObj?.name} বিভাগ নির্বাচিত ({currentDivObj?.districts.length}টি জেলা)</>
              )}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedDistrict("");
              setSelectedUpazila("");
              if (!selectedDistrict) setSelectedDivision("");
            }}
            className="flex items-center gap-1 text-[11px] text-red-600 hover:text-red-800 font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{isBn ? "মুছুন" : "Reset"}</span>
          </button>
        </div>
      )}

      {/* 4. Cascading Selectors: বিভাগ | জেলা | উপজেলা (side-by-side as in original repo) */}
      <form onSubmit={handleSearch} className="mt-2 pt-2 border-t border-gray-200/80">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-2.5">
          {/* বিভাগ (Division) */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-0.5">
              {isBn ? "বিভাগ" : "Division"}
            </label>
            <select
              value={selectedDivision}
              onChange={(e) => handleDivisionSelect(e.target.value)}
              className="w-full text-xs py-1.5 px-1 sm:px-2 bg-white border border-[#CBD5E1] rounded text-[#202124] focus:outline-none focus:ring-1 focus:ring-[#0B7A43]"
            >
              <option value="">{isBn ? "-- বিভাগ --" : "-- Division --"}</option>
              {BANGLADESH_DIVISIONS.map((div) => (
                <option key={div.id} value={div.id}>
                  {div.name}
                </option>
              ))}
            </select>
          </div>

          {/* জেলা (District) */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-0.5">
              {isBn ? "জেলা" : "District"}
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full text-xs py-1.5 px-1 sm:px-2 bg-white border border-[#CBD5E1] rounded text-[#202124] focus:outline-none focus:ring-1 focus:ring-[#0B7A43]"
            >
              <option value="">{isBn ? "-- জেলা --" : "-- District --"}</option>
              {availableDistricts.map((dist) => (
                <option key={dist.id} value={dist.name}>
                  {dist.name}
                </option>
              ))}
            </select>
          </div>

          {/* উপজেলা (Upazila) */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-0.5">
              {isBn ? "উপজেলা" : "Upazila"}
            </label>
            <select
              value={selectedUpazila}
              onChange={(e) => setSelectedUpazila(e.target.value)}
              disabled={!selectedDistrict || availableUpazilas.length === 0}
              className="w-full text-xs py-1.5 px-1 sm:px-2 bg-white border border-[#CBD5E1] rounded text-[#202124] focus:outline-none focus:ring-1 focus:ring-[#0B7A43] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">
                {!selectedDistrict
                  ? isBn
                    ? "-- উপজেলা --"
                    : "-- Upazila --"
                  : isBn
                  ? "-- উপজেলা --"
                  : "-- Upazila --"}
              </option>
              {availableUpazilas.map((upazila) => (
                <option key={upazila} value={upazila}>
                  {upazila}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Submit Button - matching red style #bd0202 from user repository */}
        <button
          type="submit"
          className="w-full bg-[#bd0202] hover:bg-[#a10202] active:bg-[#850101] text-white text-xs sm:text-sm font-bold py-2 px-3 rounded transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span>
            {selectedDistrict
              ? `${selectedDistrict}${selectedUpazila ? ` (${selectedUpazila})` : ""}-এর খবর খুঁজুন`
              : isBn
              ? "খুঁজুন"
              : "Search"}
          </span>
        </button>
      </form>
    </div>
  );
}
