"use client";

import React, { useState, useEffect } from "react";
import { Comment } from "@/types/news";
import {
  fetchComments,
  getStoredComments,
  saveComment,
  saveReply,
  toggleCommentLike,
  reportComment,
} from "@/services/newsService";
import {
  MessageSquare,
  ThumbsUp,
  CornerDownRight,
  AlertTriangle,
  Send,
  User,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface CommentSectionProps {
  articleId: string;
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const { user, isAuthenticated, openLoginModal } = useAuth();

  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    let isMounted = true;
    fetchComments(articleId).then((data) => {
      if (isMounted) setComments(data);
    });
    return () => {
      isMounted = false;
    };
  }, [articleId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");

    if (!isAuthenticated || !user) {
      openLoginModal("মন্তব্য প্রকাশ করতে অনুগ্রহ করে প্রথমে লগইন করুন।");
      return;
    }

    if (!content.trim()) {
      setFormError("অনুগ্রহ করে আপনার মন্তব্য লিখুন।");
      return;
    }
    if (content.trim().length < 4) {
      setFormError("মন্তব্য অন্তত ৪ অক্ষরের হতে হবে।");
      return;
    }

    saveComment(articleId, {
      articleId,
      authorName: user.name,
      authorEmail: user.email,
      content: content.trim(),
    }).then((newComment) => {
      setComments((prev) => [newComment, ...prev]);
      setContent("");
      setSuccessMessage("আপনার মন্তব্য সফলভাবে প্রকাশিত হয়েছে।");
      setTimeout(() => setSuccessMessage(""), 4000);
    });
  };

  const handleReplySubmit = (parentId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      openLoginModal("উত্তর দিতে অনুগ্রহ করে প্রথমে লগইন করুন।");
      return;
    }

    if (!replyContent.trim()) {
      alert("অনুগ্রহ করে উত্তরের বিষয়বস্তু লিখুন।");
      return;
    }

    saveReply(articleId, parentId, user.name, replyContent.trim()).then((reply) => {
      if (reply) {
        setComments(getStoredComments(articleId));
        setReplyingToId(null);
        setReplyContent("");
      }
    });
  };

  const handleLike = async (commentId: string) => {
    if (!isAuthenticated) {
      openLoginModal("মন্তব্যে লাইক দিতে অনুগ্রহ করে প্রথমে লগইন করুন।");
      return;
    }
    await toggleCommentLike(articleId, commentId);
    setComments(getStoredComments(articleId));
  };

  const handleReport = (commentId: string) => {
    const confirmReport = window.confirm("আপনি কি নিশ্চিত এই মন্তব্যটির বিরুদ্ধে রিপোর্ট করতে চান?");
    if (confirmReport) {
      reportComment(articleId, commentId);
      setComments(getStoredComments(articleId));
      alert("ধন্যবাদ, মন্তব্যটি পর্যালোচনা দলের নিকট প্রেরণ করা হয়েছে।");
    }
  };

  const maxChars = 500;

  return (
    <section className="comment-section-wrapper bg-white rounded-lg border border-[#E2E6EB] p-4 sm:p-6 my-8 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E2E6EB] pb-3 mb-6">
        <h3 className="text-xl font-bold text-[#0B7A43] flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#087A43]" />
          <span>পাঠকের মন্তব্য</span>
          <span className="text-xs bg-[#ECFDF5] text-[#0B7A43] px-2 py-0.5 rounded-full font-semibold">
            {comments.length}
          </span>
        </h3>
        <span className="text-xs text-[#626B75] hidden sm:inline">
          শালীন ও প্রাসঙ্গিক মন্তব্য প্রত্যাশিত
        </span>
      </div>

      {/* Comment Form (Protected) */}
      {!isAuthenticated ? (
        <div className="mb-8 p-5 bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-xl text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-emerald-50 text-[#0B7A43] flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-[#1E293B] mb-1">
            মন্তব্য করতে লগইন আবশ্যক
          </h4>
          <p className="text-xs text-gray-500 mb-4 max-w-sm mx-auto">
            সংবাদে আপনার মূল্যবান মতামত ও প্রাসঙ্গিক মন্তব্য জানাতে অনুগ্রহ করে আপনার একাউন্টে লগইন করুন।
          </p>
          <button
            type="button"
            onClick={() => openLoginModal("মন্তব্য লিখতে অনুগ্রহ করে লগইন করুন।")}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#0B7A43] hover:bg-[#087A43] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <User className="w-3.5 h-3.5" />
            <span>লগইন করুন</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mb-8 p-4 bg-[#F8FAFC] border border-[#E2E6EB] rounded-xl">
          <div className="flex items-center gap-2 mb-3 text-xs text-gray-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>মন্তব্য করছেন:</span>
            <strong className="text-[#0B7A43]">{user?.name}</strong>
            <span className="text-gray-400">({user?.email})</span>
          </div>

          <div className="relative mb-3">
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={maxChars}
              placeholder="সংবাদ সম্পর্কে আপনার গঠনমূলক মতামত লিখুন..."
              className="w-full text-sm p-3 bg-white border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7A43] text-[#1E293B]"
            />
            <div className="absolute right-2 bottom-2 text-[10px] text-gray-400">
              {content.length}/{maxChars}
            </div>
          </div>

          {formError && (
            <p className="text-xs text-red-600 mb-2 font-medium">{formError}</p>
          )}

          {successMessage && (
            <p className="text-xs text-emerald-600 mb-2 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMessage}</span>
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B7A43] hover:bg-[#087A43] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>মন্তব্য প্রকাশ করুন</span>
            </button>
          </div>
        </form>
      )}

      {/* Public Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">
            এখনও কোনো মন্তব্য করা হয়নি। আপনার মতামত দিয়ে প্রথম মন্তব্যকারী হোন।
          </p>
        ) : (
          comments.slice(0, visibleCount).map((comm) => (
            <div key={comm.id} className="p-3.5 bg-white border border-gray-100 rounded-lg shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-[#0B7A43] flex items-center justify-center font-bold text-xs">
                    {comm.authorName.charAt(0)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">
                      {comm.authorName}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {comm.createdAt}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLike(comm.id)}
                    className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-[#087A43] cursor-pointer"
                    title="লাইক"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{comm.likes}</span>
                  </button>
                  <button
                    onClick={() => handleReport(comm.id)}
                    className="text-[11px] text-gray-400 hover:text-red-500 cursor-pointer"
                    title="রিপোর্ট করুন"
                  >
                    <AlertTriangle className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-700 leading-relaxed pl-9 mb-2">
                {comm.content}
              </p>

              {/* Reply trigger */}
              <div className="pl-9 flex items-center gap-3">
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      openLoginModal("রিপ্লাই দিতে অনুগ্রহ করে প্রথমে লগইন করুন।");
                    } else {
                      setReplyingToId(replyingToId === comm.id ? null : comm.id);
                    }
                  }}
                  className="text-[11px] font-semibold text-[#0B7A43] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <CornerDownRight className="w-3 h-3" />
                  <span>উত্তর দিন</span>
                </button>
              </div>

              {/* Nested Replies */}
              {comm.replies && comm.replies.length > 0 && (
                <div className="mt-3 pl-9 space-y-2 border-l-2 border-gray-100 ml-4">
                  {comm.replies.map((rep) => (
                    <div key={rep.id} className="p-2.5 bg-gray-50 rounded text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-gray-800 text-[11px]">
                          {rep.authorName}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {rep.createdAt}
                        </span>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        {rep.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Input Form */}
              {replyingToId === comm.id && (
                <form
                  onSubmit={(e) => handleReplySubmit(comm.id, e)}
                  className="mt-3 pl-9 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="আপনার উত্তর লিখুন..."
                    className="flex-1 text-xs px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0B7A43]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#0B7A43] text-white text-xs font-bold rounded hover:bg-[#087A43] cursor-pointer"
                  >
                    পাঠান
                  </button>
                </form>
              )}
            </div>
          ))
        )}

        {comments.length > visibleCount && (
          <div className="text-center pt-2">
            <button
              onClick={() => setVisibleCount((prev) => prev + 5)}
              className="text-xs font-bold text-[#0B7A43] hover:underline cursor-pointer"
            >
              আরও মন্তব্য দেখুন ({comments.length - visibleCount}টি বাকি)
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
