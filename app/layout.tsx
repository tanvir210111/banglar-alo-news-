import type { Metadata } from "next";
import { Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";

const notoSansBengali = Noto_Sans_Bengali({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["bengali", "latin"],
  variable: "--font-bengali",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.banglaralonews.com"),
  title: {
    template: "%s | বাংলার আলো নিউজ",
    default: "বাংলার আলো নিউজ (Banglar Alo News) | সত্য ও ন্যায়ের দীপ্ত কণ্ঠস্বর",
  },
  description: "বাংলার আলো নিউজ - বাংলাদেশের শীর্ষস্থানীয় নির্ভরযোগ্য জাতীয়, সারাদেশ ও আন্তর্জাতিক অনলাইন সংবাদমাধ্যম। বস্তুনিষ্ঠ ও নির্ভীক সাংবাদিকতার অঙ্গীকার।",
  keywords: ["বাংলার আলো নিউজ", "Banglar Alo News", "banglaralonews", "Bangla News", "Bengali Newspaper", "Bangladesh News", "অনলাইন সংবাদপত্র", "তাজা খবর"],
  authors: [{ name: "বাংলার আলো নিউজ সম্পাদকীয় দল" }],
  openGraph: {
    title: "বাংলার আলো নিউজ | সত্য ও ন্যায়ের দীপ্ত কণ্ঠস্বর",
    description: "বিশ্বস্ত ও বস্তুনিষ্ঠ সংবাদের নির্ভরযোগ্য ঠিকানা — বাংলার আলো নিউজ।",
    type: "website",
    locale: "bn_BD",
    siteName: "বাংলার আলো নিউজ",
  },
};

import SiteLayoutWrapper from "@/components/layout/SiteLayoutWrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className={`${notoSansBengali.variable} font-sans`} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="preload" href="/fonts/solaimanlipi-bold-v1.0.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/solaimanlipi-normal-v1.0.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <SiteLayoutWrapper>{children}</SiteLayoutWrapper>
      </body>
    </html>
  );
}
