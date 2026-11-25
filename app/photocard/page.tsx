import React from "react";
import { Metadata } from "next";
import {
  getArticleBySlug,
  getLatestArticles,
  formatToBengaliDate,
  cleanNewsImageUrl,
} from "@/services/newsService";
import PhotoCardStudioClient from "./PhotoCardStudioClient";

interface PhotoCardPageProps {
  searchParams: Promise<{
    slug?: string;
    id?: string;
    title?: string;
    image?: string;
    date?: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: PhotoCardPageProps): Promise<Metadata> {
  const { slug, id, title: queryTitle } = await searchParams;
  const targetSlug = slug || id;

  if (targetSlug) {
    try {
      const article = await getArticleBySlug(targetSlug);
      if (article) {
        return {
          title: `ফটো কার্ড স্টুডিও - ${article.title} | বাংলার আলো নিউজ`,
          description: `খবরের সোশ্যাল মিডিয়া ফটোকার্ড তৈরি ও ডাউনলোড করুন: ${article.title}`,
        };
      }
    } catch {}
  }

  return {
    title: "ফটো কার্ড কাস্টমাইজেশন স্টুডিও | বাংলার আলো নিউজ",
    description: "খবরের জন্য আকর্ষণীয় সোশ্যাল মিডিয়া ফটোকার্ড তৈরি ও ডাউনলোড করুন।",
  };
}

export default async function PhotoCardPage({
  searchParams,
}: PhotoCardPageProps) {
  const { slug, id, title: queryTitle, image: queryImage, date: queryDate } =
    await searchParams;

  let initialData = {
    title: queryTitle || "দ্রুতই শ্রমিকদের নতুন মজুরি নির্ধারণ করা হবে: স্বরাষ্ট্রমন্ত্রী",
    imageUrl: queryImage || "/images/news-placeholder.svg",
    dateBengali: queryDate || "০৪ নভেম্বর ২০২৬",
    slug: slug || id || "",
    articleUrl: slug ? `https://www.banglaralonews.com/news/${slug}` : "https://www.banglaralonews.com",
  };

  const targetSlug = slug || id;

  if (targetSlug) {
    try {
      const article = await getArticleBySlug(targetSlug);
      if (article) {
        const rawImg = article.featuredImage?.url || "";
        const cleanImg = cleanNewsImageUrl(rawImg);

        initialData = {
          title: article.title,
          imageUrl:
            cleanImg && !cleanImg.includes("unsplash.com")
              ? cleanImg
              : "/images/news-placeholder.svg",
          dateBengali: formatToBengaliDate(article.publishedAt),
          slug: article.slug,
          articleUrl: `https://www.banglaralonews.com/news/${article.slug}`,
        };
      }
    } catch (err) {
      console.warn("Could not load article for photocard studio:", err);
    }
  } else {
    // If no slug is specified, pick the latest news article
    try {
      const latest = await getLatestArticles(1);
      if (latest && latest.length > 0) {
        const article = latest[0];
        const rawImg = article.featuredImage?.url || "";
        const cleanImg = cleanNewsImageUrl(rawImg);

        initialData = {
          title: article.title,
          imageUrl:
            cleanImg && !cleanImg.includes("unsplash.com")
              ? cleanImg
              : "/images/news-placeholder.svg",
          dateBengali: formatToBengaliDate(article.publishedAt),
          slug: article.slug,
          articleUrl: `https://www.banglaralonews.com/news/${article.slug}`,
        };
      }
    } catch {}
  }

  return <PhotoCardStudioClient initialData={initialData} />;
}

