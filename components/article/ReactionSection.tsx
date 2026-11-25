"use client";

import React, { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Share2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toBengaliNumerals } from "@/lib/bangladeshTime";
import ShareButtons from "@/components/news/ShareButtons";
import { api } from "@/services/apiClient";

interface ReactionSectionProps {
  articleId: string;
  articleTitle: string;
  initialLikes?: number;
  initialDislikes?: number;
}

export default function ReactionSection({
  articleId,
  articleTitle,
  initialLikes = 0,
  initialDislikes = 0,
}: ReactionSectionProps) {
  const { user, isAuthenticated, openLoginModal } = useAuth();

  const [likesCount, setLikesCount] = useState(initialLikes);
  const [dislikesCount, setDislikesCount] = useState(initialDislikes);
  const [userReaction, setUserReaction] = useState<"LIKE" | "DISLIKE" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync with real counts
  useEffect(() => {
    setLikesCount(initialLikes);
    setDislikesCount(initialDislikes);
  }, [initialLikes, initialDislikes]);

  // Load reaction state from localStorage for guest / user
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`news_react_${articleId}`);
      if (stored === "LIKE" || stored === "DISLIKE") {
        setUserReaction(stored);
      }
    } catch {
      // Ignore
    }
  }, [articleId]);

  const handleReaction = async (type: "LIKE" | "DISLIKE") => {
    // 1. Strict Auth Guard: User MUST be logged in
    if (!isAuthenticated || !user) {
      openLoginModal("মতামত জানাতে অনুগ্রহ করে প্রথমে লগইন করুন।");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await api.post<any>(`/news/${articleId}/react`, { reactionType: type });
      if (res?.success && res.data) {
        setUserReaction(res.data.userReaction);
        if (typeof res.data.likesCount === "number") setLikesCount(res.data.likesCount);
        if (typeof res.data.dislikesCount === "number") setDislikesCount(res.data.dislikesCount);
        if (res.data.userReaction) {
          localStorage.setItem(`news_react_${articleId}`, res.data.userReaction);
        } else {
          localStorage.removeItem(`news_react_${articleId}`);
        }
      } else {
        // Optimistic toggle fallback
        let newReaction: "LIKE" | "DISLIKE" | null = type;
        let newLikes = likesCount;
        let newDislikes = dislikesCount;

        if (userReaction === type) {
          newReaction = null;
          if (type === "LIKE") newLikes = Math.max(0, newLikes - 1);
          if (type === "DISLIKE") newDislikes = Math.max(0, newDislikes - 1);
        } else {
          if (userReaction === "LIKE") newLikes = Math.max(0, newLikes - 1);
          if (userReaction === "DISLIKE") newDislikes = Math.max(0, newDislikes - 1);
          if (type === "LIKE") newLikes += 1;
          if (type === "DISLIKE") newDislikes += 1;
        }

        setUserReaction(newReaction);
        setLikesCount(newLikes);
        setDislikesCount(newDislikes);
      }
    } catch {
      // Local fallback
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="my-6 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Left: Like & Dislike only */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-gray-700 hidden sm:inline">
          আপনার প্রতিক্রিয়া:
        </span>

        {/* Like Button */}
        <button
          type="button"
          onClick={() => handleReaction("LIKE")}
          disabled={isSubmitting}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
            userReaction === "LIKE"
              ? "bg-[#087A43] text-white border-[#087A43] shadow-xs"
              : "bg-white text-gray-700 border-gray-300 hover:border-[#087A43] hover:text-[#087A43]"
          }`}
          title={isAuthenticated ? "লাইক দিন" : "লাইক দিতে লগইন করুন"}
        >
          <ThumbsUp className={`w-4 h-4 ${userReaction === "LIKE" ? "fill-white" : ""}`} />
          <span>লাইক</span>
          <span className="px-1.5 py-0.5 rounded-full text-[11px] bg-black/5 font-semibold">
            {toBengaliNumerals(likesCount)}
          </span>
        </button>

        {/* Dislike Button */}
        <button
          type="button"
          onClick={() => handleReaction("DISLIKE")}
          disabled={isSubmitting}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
            userReaction === "DISLIKE"
              ? "bg-[#C62828] text-white border-[#C62828] shadow-xs"
              : "bg-white text-gray-700 border-gray-300 hover:border-[#C62828] hover:text-[#C62828]"
          }`}
          title={isAuthenticated ? "ডিজলাইক দিন" : "ডিজলাইক দিতে লগইন করুন"}
        >
          <ThumbsDown className={`w-4 h-4 ${userReaction === "DISLIKE" ? "fill-white" : ""}`} />
          <span>ডিজলাইক</span>
          <span className="px-1.5 py-0.5 rounded-full text-[11px] bg-black/5 font-semibold">
            {toBengaliNumerals(dislikesCount)}
          </span>
        </button>
      </div>

      {/* Right: Public Social Share Buttons (Accessible without login) */}
      <div className="flex items-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-200">
        <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
          <Share2 className="w-3.5 h-3.5 text-[#0B7A43]" />
          <span>শেয়ার:</span>
        </span>
        <ShareButtons title={articleTitle} compact={true} newsId={articleId} />
      </div>
    </div>
  );
}

