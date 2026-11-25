"use client";

import React, { useState } from "react";
import { X, Trash2, ArrowRight, Check, Link as LinkIcon } from "lucide-react";
import { canDelete } from "@/services/apiClient";

export interface MediaItem {
  id: string;
  title: string;
  fileName: string;
  uploadedOn: string;
  uploadedBy: string;
  fileType: string;
  fileSize: string;
  dimensions: string;
  url: string;
  thumbnailUrl?: string;
  isPlaceholder?: boolean;
}

interface MediaDetailsModalProps {
  media: MediaItem | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export default function MediaDetailsModal({
  media,
  onClose,
  onDelete,
}: MediaDetailsModalProps) {
  const [copied, setCopied] = useState(false);

  if (!media) return null;

  const handleCopyLink = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(media.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden border border-[#CBD5E1] flex flex-col max-h-[90vh]">
        {/* Modal Top Header matching Screenshot 3 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-white">
          <h2 className="text-base font-bold text-[#1E293B]">Media details</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-[#64748B] hover:text-[#1E293B] hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Grid: 2 Columns (Left: Image Preview, Right: Metadata Sidebar) */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Columns: Media Preview Frame */}
            <div className="lg:col-span-7 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 flex items-center justify-center min-h-[360px] max-h-[460px] overflow-hidden">
              <img
                src={media.url}
                alt={media.title}
                className="max-h-[420px] max-w-full object-contain rounded shadow-2xs"
              />
            </div>

            {/* Right 5 Columns: Metadata Attributes matching Screenshot 3 */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4 text-xs text-[#334155]">
              <div className="space-y-3 divide-y divide-gray-100">
                <div className="pt-1">
                  <span className="block font-semibold text-gray-500 mb-0.5">Uploaded on:</span>
                  <span className="font-medium text-[#0F172A]">{media.uploadedOn}</span>
                </div>

                <div className="pt-2">
                  <span className="block font-semibold text-gray-500 mb-0.5">Uploaded by:</span>
                  <span className="font-medium text-[#0F172A]">{media.uploadedBy}</span>
                </div>

                <div className="pt-2">
                  <span className="block font-semibold text-gray-500 mb-0.5">Uploaded to:</span>
                  <span className="font-medium text-[#0F172A]">{media.title}</span>
                </div>

                <div className="pt-2">
                  <span className="block font-semibold text-gray-500 mb-0.5">File name:</span>
                  <span className="font-medium text-[#0F172A] break-all">{media.fileName}</span>
                </div>

                <div className="pt-2">
                  <span className="block font-semibold text-gray-500 mb-0.5">File type:</span>
                  <span className="font-medium text-[#0F172A]">{media.fileType}</span>
                </div>

                <div className="pt-2">
                  <span className="block font-semibold text-gray-500 mb-0.5">File size:</span>
                  <span className="font-medium text-[#0F172A]">{media.fileSize}</span>
                </div>

                <div className="pt-2">
                  <span className="block font-semibold text-gray-500 mb-0.5">Dimensions:</span>
                  <span className="font-medium text-[#0F172A]">{media.dimensions}</span>
                </div>

                {/* File URL with Copy functionality */}
                <div className="pt-2">
                  <span className="block font-semibold text-gray-500 mb-1">File URL:</span>
                  <div className="bg-gray-50 border border-gray-200 rounded p-2 break-all text-[11px] text-gray-600 font-mono select-all">
                    {media.url}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-[#1677FF] hover:underline font-semibold cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons: Delete Media (Red) & View Media (Blue) */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={!canDelete()}
                  onClick={() => {
                    if (!canDelete()) {
                      alert("ডিলিট করার অনুমতি শুধুমাত্র super.admin@gmail.com এর রয়েছে।");
                      return;
                    }
                    if (onDelete) onDelete(media.id);
                    onClose();
                  }}
                  title={
                    canDelete()
                      ? "Delete Media"
                      : "ডিলিট করার অনুমতি শুধুমাত্র super.admin@gmail.com এর রয়েছে"
                  }
                  className={`font-semibold text-xs py-2.5 px-4 rounded-md flex items-center justify-center gap-2 transition-colors shadow-xs ${
                    canDelete()
                      ? "bg-[#DC2626] hover:bg-red-700 text-white cursor-pointer"
                      : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-50"
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Media</span>
                </button>

                <a
                  href={media.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#1677FF] hover:bg-blue-600 text-white font-semibold text-xs py-2.5 px-4 rounded-md flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs text-center"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>View Media</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
