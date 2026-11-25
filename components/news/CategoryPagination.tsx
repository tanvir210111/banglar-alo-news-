import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { toBengaliNumerals } from "@/lib/bangladeshTime";

interface CategoryPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  basePath: string;
}

export default function CategoryPagination({
  currentPage,
  totalPages,
  totalItems,
  basePath,
}: CategoryPaginationProps) {
  if (totalPages <= 1) return null;

  const getPageUrl = (page: number) => {
    return page === 1 ? basePath : `${basePath}?page=${page}`;
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  const pageNumbers = getPageNumbers();
  const startItem = (currentPage - 1) * 12 + 1;
  const endItem = Math.min(currentPage * 12, totalItems);

  return (
    <nav aria-label="সংবাদ পৃষ্ঠা নেভিগেশন" className="mt-8 pt-6 border-t border-[#E2E6EB] space-y-3">
      {/* Page Numbers Control */}
      <div className="flex items-center justify-center flex-wrap gap-1.5 sm:gap-2">
        {/* First Page Button */}
        {currentPage > 1 ? (
          <Link
            href={getPageUrl(1)}
            title="প্রথম পৃষ্ঠা"
            className="p-2 sm:px-3 sm:py-2 text-xs font-medium rounded-md border border-[#E2E6EB] bg-white text-[#202124] hover:bg-[#F0F5FA] hover:text-[#0B7A43] hover:border-[#0B7A43]/30 transition-colors flex items-center gap-1 shadow-2xs"
          >
            <ChevronsLeft className="w-4 h-4" />
            <span className="hidden sm:inline">প্রথম</span>
          </Link>
        ) : (
          <span className="p-2 sm:px-3 sm:py-2 text-xs font-medium rounded-md border border-[#E2E6EB] bg-gray-50 text-gray-300 pointer-events-none flex items-center gap-1 select-none">
            <ChevronsLeft className="w-4 h-4" />
            <span className="hidden sm:inline">প্রথম</span>
          </span>
        )}

        {/* Previous Button */}
        {currentPage > 1 ? (
          <Link
            href={getPageUrl(currentPage - 1)}
            title="পূর্ববর্তী পৃষ্ঠা"
            className="px-2.5 sm:px-3.5 py-2 text-xs font-medium rounded-md border border-[#E2E6EB] bg-white text-[#202124] hover:bg-[#F0F5FA] hover:text-[#0B7A43] hover:border-[#0B7A43]/30 transition-colors flex items-center gap-1 shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>পূর্ববর্তী</span>
          </Link>
        ) : (
          <span className="px-2.5 sm:px-3.5 py-2 text-xs font-medium rounded-md border border-[#E2E6EB] bg-gray-50 text-gray-300 pointer-events-none flex items-center gap-1 select-none">
            <ChevronLeft className="w-4 h-4" />
            <span>পূর্ববর্তী</span>
          </span>
        )}

        {/* Number Buttons */}
        {pageNumbers.map((num, idx) => {
          if (num === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-xs text-gray-400 select-none"
              >
                ...
              </span>
            );
          }

          const pageNum = Number(num);
          const isActive = pageNum === currentPage;

          return isActive ? (
            <span
              key={`page-${pageNum}`}
              aria-current="page"
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-xs sm:text-sm font-bold rounded-md bg-[#0B7A43] text-white border border-[#0B7A43] shadow-xs select-none"
            >
              {toBengaliNumerals(pageNum)}
            </span>
          ) : (
            <Link
              key={`page-${pageNum}`}
              href={getPageUrl(pageNum)}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-xs sm:text-sm font-semibold rounded-md border border-[#E2E6EB] bg-white text-[#202124] hover:bg-[#F0F5FA] hover:text-[#0B7A43] hover:border-[#0B7A43]/30 transition-colors shadow-2xs"
            >
              {toBengaliNumerals(pageNum)}
            </Link>
          );
        })}

        {/* Next Button */}
        {currentPage < totalPages ? (
          <Link
            href={getPageUrl(currentPage + 1)}
            title="পরবর্তী পৃষ্ঠা"
            className="px-2.5 sm:px-3.5 py-2 text-xs font-medium rounded-md border border-[#E2E6EB] bg-white text-[#202124] hover:bg-[#F0F5FA] hover:text-[#0B7A43] hover:border-[#0B7A43]/30 transition-colors flex items-center gap-1 shadow-2xs"
          >
            <span>পরবর্তী</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <span className="px-2.5 sm:px-3.5 py-2 text-xs font-medium rounded-md border border-[#E2E6EB] bg-gray-50 text-gray-300 pointer-events-none flex items-center gap-1 select-none">
            <span>পরবর্তী</span>
            <ChevronRight className="w-4 h-4" />
          </span>
        )}

        {/* Last Page Button */}
        {currentPage < totalPages ? (
          <Link
            href={getPageUrl(totalPages)}
            title="সর্বশেষ পৃষ্ঠা"
            className="p-2 sm:px-3 sm:py-2 text-xs font-medium rounded-md border border-[#E2E6EB] bg-white text-[#202124] hover:bg-[#F0F5FA] hover:text-[#0B7A43] hover:border-[#0B7A43]/30 transition-colors flex items-center gap-1 shadow-2xs"
          >
            <span className="hidden sm:inline">শেষ</span>
            <ChevronsRight className="w-4 h-4" />
          </Link>
        ) : (
          <span className="p-2 sm:px-3 sm:py-2 text-xs font-medium rounded-md border border-[#E2E6EB] bg-gray-50 text-gray-300 pointer-events-none flex items-center gap-1 select-none">
            <span className="hidden sm:inline">শেষ</span>
            <ChevronsRight className="w-4 h-4" />
          </span>
        )}
      </div>

      {/* Range Status Text */}
      <div className="text-center text-xs text-[#626B75]">
        দেখাচ্ছে {toBengaliNumerals(startItem)}–{toBengaliNumerals(endItem)} টি সংবাদ (সর্বমোট {toBengaliNumerals(totalItems)} টির মধ্যে) | পৃষ্ঠা {toBengaliNumerals(currentPage)} এর {toBengaliNumerals(totalPages)}
      </div>
    </nav>
  );
}
