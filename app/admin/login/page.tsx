"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  api,
  setAuthToken,
  saveAdminUser,
  isAuthenticated,
  removeAuthToken,
  clearApiCache,
} from "@/services/apiClient";

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/admin";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    errorParam === "unauthorized"
      ? "আপনার পাঠক অ্যাকাউন্ট দিয়ে অ্যাডমিন প্যানেলে প্রবেশ নিষেধ। অনুগ্রহ করে অ্যাডমিন অ্যাকাউন্ট দিয়ে লগইন করুন।"
      : null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // If already authenticated with active admin session, redirect to returnUrl
  useEffect(() => {
    if (isAuthenticated()) {
      router.replace(returnUrl);
    }
  }, [returnUrl, router]);

  const handleDemoLogin = () => {
    setErrorMessage(null);
    setSuccessMessage("ডেমো মোডে প্রবেশ করা হচ্ছে...");
    setAuthToken("demo-admin-token-" + Date.now());
    saveAdminUser({
      id: "demo-admin-id",
      name: "প্রধান সম্পাদক ও প্রশাসক",
      email: "admin@banglaralonews.com",
      role: "Super_Admin",
      isProfileSetup: true,
    });
    setTimeout(() => {
      router.replace(returnUrl);
      router.refresh();
    }, 400);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage("অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড দুটিই পূরণ করুন।");
      return;
    }

    // Clear any previous stale session or cached tokens before attempting fresh login
    removeAuthToken();
    clearApiCache();

    setIsLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email: cleanEmail,
        password: cleanPassword,
      });

      if (res?.success && res?.data?.token) {
        // Verify role is admin or staff
        const role = res.data.role || res.data.user?.role || "Super_Admin";
        if (role === "READER") {
          setErrorMessage("আপনার অ্যাকাউন্টটি সাধারণ পাঠক ক্যাটাগরির। অ্যাডমিন প্যানেলে প্রবেশের অনুমতি নেই।");
          setIsLoading(false);
          return;
        }

        // Save token and user details to localStorage/cookies
        setAuthToken(res.data.token);
        saveAdminUser({
          id: res.data.user?.id || res.data.id,
          name: res.data.user?.name || res.data.user?.fullName || "Admin",
          email: cleanEmail,
          role: role,
          isProfileSetup: res.data.isProfileSetup,
        });

        setSuccessMessage("লগইন সফল হয়েছে! ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...");

        // Redirect
        setTimeout(() => {
          router.replace(returnUrl);
          router.refresh();
        }, 500);
      } else {
        const backendMsg =
          res?.message ||
          (res as any)?.errorSources?.[0]?.details ||
          (res as any)?.err?.message;
        setErrorMessage(
          backendMsg || "লগইন ব্যর্থ হয়েছে। সঠিক ইমেইল ও পাসওয়ার্ড প্রদান করুন।"
        );
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || "সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FC] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 select-none mb-3 group">
            <div className="relative w-12 h-12 rounded-2xl bg-white shadow-md border border-[#E8EEF8] flex items-center justify-center p-1.5 group-hover:scale-105 transition-transform">
              <Image
                src="/images/logo-icon.png"
                alt="Banglar Alo News Logo"
                width={44}
                height={44}
                className="w-full h-full object-contain rounded-full shadow-2xs"
              />
            </div>
            <div className="text-left">
              <span className="block text-2xl font-black tracking-tight text-[#0A2540]">
                বাংলার আলো নিউজ
              </span>
              <span className="block text-[12px] font-bold text-[#0B7A43] tracking-wider uppercase">
                অ্যাডমিন পোর্টাল
              </span>
            </div>
          </Link>
          <h2 className="text-xl sm:text-2xl font-black text-[#2B3674] tracking-tight">
            অ্যাডমিন প্যানেলে লগইন
          </h2>
          <p className="text-sm text-[#718096] mt-1">
            নিরাপদ অ্যাক্সেসের জন্য আপনার ক্রেডেনশিয়াল প্রদান করুন
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-[#E8EEF8] p-6 sm:p-8">
          {/* Alert messages */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
              <span className="leading-snug font-medium">{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-[#2B3674] uppercase tracking-wider mb-1.5">
                ইমেইল ঠিকানা
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A3AED0]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@banglaralonews.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F4F7FC]/80 border border-[#E0E5F2] rounded-xl text-[#2B3674] placeholder-[#A3AED0] focus:outline-none focus:ring-2 focus:ring-[#0B7A43]/20 focus:border-[#0B7A43] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-[#2B3674] uppercase tracking-wider mb-1.5">
                পাসওয়ার্ড
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A3AED0]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#F4F7FC]/80 border border-[#E0E5F2] rounded-xl text-[#2B3674] placeholder-[#A3AED0] focus:outline-none focus:ring-2 focus:ring-[#0B7A43]/20 focus:border-[#0B7A43] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#A3AED0] hover:text-[#2B3674] transition-colors cursor-pointer border-0 outline-none focus:outline-none bg-transparent"
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#718096]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#0B7A43] rounded border-[#E0E5F2] focus:ring-[#0B7A43]"
                />
                <span>আমাকে মনে রাখুন</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>যাচাই করা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <span>লগইন করুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer note */}
          <div className="mt-5 pt-4 border-t border-[#F1F5F9] text-center">
            <Link
              href="/"
              className="text-xs font-bold text-[#718096] hover:text-[#EA580C] transition-colors inline-flex items-center gap-1.5"
            >
              <span>← মূল ওয়েবসাইটে ফিরে যান</span>
            </Link>
          </div>
        </div>

        {/* Security badge & Developer credit */}
        <div className="mt-6 flex flex-col items-center justify-center gap-2 text-xs text-[#A3AED0]">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>২৫৬-বিট এনক্রিপ্টেড সুরক্ষিত অ্যাডমিন ডিরেক্টরি</span>
          </div>
          <p className="text-[11.5px] text-[#A3AED0]">
            Design and Developed by{" "}
            <a
              href="https://banglaraloit.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0B7A43] font-semibold hover:underline"
            >
              Banglar Alo IT
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F7FC] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#0B7A43] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminLoginContent />
    </Suspense>
  );
}

