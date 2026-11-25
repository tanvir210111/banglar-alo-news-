"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/common/ScrollToTop";
import LoginModal from "@/components/auth/LoginModal";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { recordWebsiteVisit } from "@/services/analyticsService";

export default function SiteLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isStandaloneRoute =
    pathname?.startsWith("/admin") || pathname?.startsWith("/photocard");

  useEffect(() => {
    if (!isStandaloneRoute) {
      recordWebsiteVisit(pathname || undefined);
    }
  }, [pathname, isStandaloneRoute]);

  if (isStandaloneRoute) {
    return (
      <AuthProvider>
        <div className="min-h-screen w-full" suppressHydrationWarning>
          {children}
        </div>
      </AuthProvider>
    );
  }

  return (
    <LanguageProvider>
      <AuthProvider>
        <div
          className="min-h-screen flex flex-col bg-[#F5F7FA] text-[#202124] antialiased"
          suppressHydrationWarning
        >
          <Header />
          <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
            {children}
          </main>
          <Footer />
          <ScrollToTop threshold={250} />
          <LoginModal />
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}
