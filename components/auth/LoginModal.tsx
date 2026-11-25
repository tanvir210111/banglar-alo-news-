"use client";

import React, { useState } from "react";
import {
  X,
  Lock,
  Mail,
  User,
  UserPlus,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/apiClient";

export default function LoginModal() {
  const { isLoginModalOpen, loginModalMessage, closeLoginModal, login } = useAuth();
  
  // Tab mode: "login" or "register"
  const [mode, setMode] = useState<"login" | "register">("login");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isLoginModalOpen) return null;

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSwitchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // 1. Reader Login Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage("অনুগ্রহ করে ইমেইল ও পাসওয়ার্ড প্রদান করুন।");
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post<any>("/auth/login", {
        email: cleanEmail,
        password: cleanPassword,
      });

      if (res?.success && res?.data?.token) {
        const role = res.data.role || res.data.user?.role || "READER";
        if (["SUPER_ADMIN", "ADMIN", "EDITOR", "PUBLISHER", "REPORTER", "Super_Admin"].includes(role)) {
          setErrorMessage("এটি সাধারণ পাঠকদের লগইন ফর্ম। অ্যাডমিন প্যানেলে যেতে /admin/login পেজ ব্যবহার করুন।");
          setIsLoading(false);
          return;
        }

        const u = res.data.user || {
          id: res.data.id || res.data.user?.id || "usr-" + Date.now(),
          name: res.data.user?.name || res.data.name || cleanEmail.split("@")[0],
          email: cleanEmail,
          role: "READER",
        };
        setSuccessMessage("লগইন সফল হয়েছে! স্বাগতম।");
        setTimeout(() => {
          login(res.data.token, u);
          resetForm();
        }, 500);
      } else {
        setErrorMessage(
          res?.message || "ভুল ইমেইল বা পাসওয়ার্ড। অনুগ্রহ করে সঠিক তথ্য দিয়ে পুনরায় চেষ্টা করুন।"
        );
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || "সার্ভারের সাথে সংযোগ করা যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Reader Registration Handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanName || cleanName.length < 2) {
      setErrorMessage("অনুগ্রহ করে আপনার পুরো নাম সঠিকভাবে লিখুন।");
      return;
    }

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMessage("অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা প্রদান করুন।");
      return;
    }

    if (cleanPassword.length < 6) {
      setErrorMessage("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
      return;
    }

    if (cleanPassword !== cleanConfirm) {
      setErrorMessage("পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না!");
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post<any>("/auth/register", {
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        role: "READER",
      });

      if (res?.success && res?.data?.token) {
        const u = res.data.user || {
          id: res.data.id || "usr-" + Date.now(),
          name: cleanName,
          email: cleanEmail,
          role: "READER",
        };
        setSuccessMessage(`অভিনন্দন ${cleanName}, আপনার পাঠক একাউন্ট সফলভাবে তৈরি হয়েছে!`);
        setTimeout(() => {
          login(res.data.token, u);
          resetForm();
        }, 600);
      } else {
        setErrorMessage(
          res?.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে। এই ইমেইল ইতিমধ্যে ব্যবহৃত হতে পারে।"
        );
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || "সার্ভারে রেজিস্ট্রেশন প্রক্রিয়ায় সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={closeLoginModal}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title and Close Button */}
        <div className="bg-[#123B5D] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
              {mode === "login" ? (
                <LogIn className="w-5 h-5 text-white" />
              ) : (
                <UserPlus className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {mode === "login" ? "পাঠক লগইন" : "নতুন পাঠক একাউন্ট"}
              </h3>
              <p className="text-xs text-white/80">অর্থনীতি সংবাদ — সত্যের পথে মুক্তি</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeLoginModal}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: [ লগইন করুন ] vs [ নতুন একাউন্ট ] */}
        <div className="grid grid-cols-2 bg-gray-100 border-b border-gray-200 text-sm font-bold">
          <button
            type="button"
            onClick={() => handleSwitchMode("login")}
            className={`py-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              mode === "login"
                ? "bg-white text-[#123B5D] border-b-2 border-[#123B5D] shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>লগইন করুন</span>
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode("register")}
            className={`py-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              mode === "register"
                ? "bg-white text-[#087A43] border-b-2 border-[#087A43] shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>নতুন একাউন্ট</span>
          </button>
        </div>

        {/* Context Message Banner (e.g. login to react or comment) */}
        {loginModalMessage && (
          <div className="bg-amber-50 border-b border-amber-200 p-3 text-xs text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{loginModalMessage}</span>
          </div>
        )}

        <div className="p-6">
          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* MODE 1: LOGIN FORM */}
          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  ইমেইল ঠিকানা
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123B5D] focus:bg-white transition-all text-[#1E293B]"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  পাসওয়ার্ড
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123B5D] focus:bg-white transition-all text-[#1E293B]"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-[#123B5D] hover:bg-[#0D2A42] text-white font-bold py-2.5 px-4 rounded-lg text-sm shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>যাচাই করা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>লগইন করুন</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-gray-600">
                নতুন পাঠক?{" "}
                <button
                  type="button"
                  onClick={() => handleSwitchMode("register")}
                  className="font-bold text-[#087A43] hover:underline cursor-pointer"
                >
                  এখানে নতুন একাউন্ট তৈরি করুন
                </button>
              </div>
            </form>
          ) : (
            /* MODE 2: REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  আপনার পুরো নাম
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="উদাঃ কাজী তানভীর"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#087A43] focus:bg-white transition-all text-[#1E293B]"
                  />
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  ইমেইল ঠিকানা
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#087A43] focus:bg-white transition-all text-[#1E293B]"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="কমপক্ষে ৬ অক্ষর..."
                    required
                    minLength={6}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#087A43] focus:bg-white transition-all text-[#1E293B]"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  পাসওয়ার্ড নিশ্চিত করুন
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="পুনরায় পাসওয়ার্ড লিখুন"
                    required
                    minLength={6}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#087A43] focus:bg-white transition-all text-[#1E293B]"
                  />
                  <ShieldCheck className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-[#087A43] hover:bg-[#066235] text-white font-bold py-2.5 px-4 rounded-lg text-sm shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>একাউন্ট তৈরি করা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>একাউন্ট তৈরি করুন</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-gray-600">
                ইতিমধ্যে একাউন্ট আছে?{" "}
                <button
                  type="button"
                  onClick={() => handleSwitchMode("login")}
                  className="font-bold text-[#123B5D] hover:underline cursor-pointer"
                >
                  এখানে লগইন করুন
                </button>
              </div>
            </form>
          )}

          <p className="mt-4 text-center text-[11px] text-gray-400 leading-relaxed border-t border-gray-100 pt-3">
            অর্থনীতি সংবাদ — সত্যের পথে মুক্তি। পাঠক একাউন্টের মাধ্যমে আপনি সংবাদে লাইক, কমেন্ট ও মতামত জানাতে পারবেন।
          </p>
        </div>
      </div>
    </div>
  );
}
