import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import {
  getArticleBySlug,
  getAllArticles,
  getArticlesByCategory,
  getLatestArticles,
  getPopularArticles,
  mapBackendNewsToArticle,
} from "@/services/newsService";
import { Article } from "@/types/news";
import ArticleToolbarContainer from "./ArticleToolbarContainer";
import NewsAudioPlayer from "@/components/article/NewsAudioPlayer";
import PopularNewsItem from "@/components/news/PopularNewsItem";
import LatestNewsItem from "@/components/news/LatestNewsItem";
import HorizontalNewsCard from "@/components/news/HorizontalNewsCard";
import AdvertisementPlaceholder from "@/components/news/AdvertisementPlaceholder";
import FacebookPageWidget from "@/components/common/FacebookPageWidget";
import {
  Clock,
  User,
  Calendar,
  ChevronRight,
  Eye,
  ArrowLeft,
  ArrowRight,
  Tag as TagIcon,
  BookOpen,
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: "সংবাদটি পাওয়া যায়নি | অর্থনীতি সংবাদ",
    };
  }

  const hasRealImage = Boolean(
    article.featuredImage?.url &&
    article.featuredImage.url.trim() !== "" &&
    !article.featuredImage.url.includes("placeholder") &&
    !article.featuredImage.url.includes("logo.svg")
  );

  const ogImageUrl = hasRealImage
    ? article.featuredImage.url
    : "/images/brand-logo.png";

  return {
    title: article.title,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: "article",
      locale: "bn_BD",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
  };
}

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  // Fast concurrent fetching for sidebar & related news
  const [catArticles, latestRaw, popularArticles] = await Promise.all([
    getArticlesByCategory(article.category?.slug || "national"),
    getLatestArticles(6),
    getPopularArticles(5),
  ]);

  const latestArticles = latestRaw.filter((a) => a.id !== article.id);
  const prevArticle = latestArticles[0] || null;
  const nextArticle = latestArticles[1] || (latestArticles.length > 1 ? latestArticles[latestArticles.length - 1] : null);

  const relatedArticles =
    Array.isArray(article.relatedNews) && article.relatedNews.length > 0
      ? article.relatedNews.map(mapBackendNewsToArticle).filter((a) => a.id !== article.id).slice(0, 3)
      : catArticles.filter((a) => a.id !== article.id).slice(0, 3);

  const getThumb = (art: any): string => {
    if (!art) return "/images/news-placeholder.svg";
    let url = "";
    if (typeof art.featuredImage === "string") url = art.featuredImage;
    else if (art.featuredImage?.url) url = art.featuredImage.url;
    else if (typeof art.image === "string") url = art.image;
    if (!url || url.includes("unsplash.com")) return "/images/news-placeholder.svg";
    return url;
  };

  const articleSubtitle =
    (article.subtitle && article.subtitle.trim()) ||
    (article.summary &&
      article.summary.trim() !== "" &&
      article.summary.trim() !== article.title.trim() &&
      article.summary.trim().toLowerCase() !== article.title.trim().toLowerCase()
      ? article.summary.trim()
      : "");

  return (
    <div className="py-2">
      {/* Breadcrumb Navigation - Clean path without repeating headline */}
      <nav aria-label="ব্রেডক্রাম্ব" className="text-xs text-[#626B75] mb-4 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-[#0756A4] transition-colors">
          প্রচ্ছদ
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <Link href={`/category/${article.category.slug}`} className="hover:text-[#0756A4] transition-colors font-medium">
          {article.category.name}
        </Link>
      </nav>

      {/* Main Grid: Article Column (8) + Sidebar (4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <article className="lg:col-span-8 bg-white rounded-lg border border-[#E2E6EB] p-4 sm:p-7 shadow-xs">
          {/* Category Tag */}
          <div className="mb-3">
            <Link
              href={`/category/${article.category.slug}`}
              className="inline-block bg-[#0756A4] text-white text-xs font-semibold px-3 py-1 rounded"
            >
              {article.category.name}
            </Link>
          </div>

          {/* Subtitle placed ABOVE the title in RED color */}
          {articleSubtitle && (
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#DC2626] leading-snug mb-2.5 tracking-tight">
              {articleSubtitle}
            </h2>
          )}

          {/* Bengali Headline */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#202124] leading-tight mb-5 tracking-tight">
            {article.title}
          </h1>

          {/* Metadata Row: Author, Date, Reading Time */}
          <div className="flex flex-wrap items-center justify-between text-xs text-[#626B75] gap-3 mb-5">
            <div className="flex items-center gap-3">
              <Link
                href={`/author/${article.author.slug}`}
                className="flex items-center gap-2 group hover:text-[#0756A4]"
              >
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                  <Image
                    src={article.author.avatar}
                    alt={article.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <span className="font-bold text-[#202124] group-hover:text-[#0756A4] block text-sm">
                    {article.author.name === "প্রতিবেদক" ? "নিজস্ব প্রতিবেদক" : article.author.name}
                  </span>
                  <span className="text-[11px] text-gray-500 font-normal">
                    {article.author.role === "প্রতিবেদক" || !article.author.role ? "নিজস্ব প্রতিবেদক" : article.author.role}
                  </span>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#0756A4]" />
                {article.publishedAtBengali}
              </span>
              {article.updatedAt && (
                <span className="text-[11px] text-gray-400 hidden sm:inline">
                  (আপডেট: {article.updatedAt})
                </span>
              )}
              <span className="flex items-center gap-1 bg-[#EAF2FB] text-[#0756A4] px-2 py-0.5 rounded-full font-medium">
                <BookOpen className="w-3 h-3" />
                পড়ার সময়: {article.readingTimeMinutes} মিনিট
              </span>
            </div>
          </div>

          {/* AI Voice Audio Reader Widget */}
          <NewsAudioPlayer
            slug={article.slug}
            articleId={article.id}
            title={article.title}
            audioUrl={(article as any).audioUrl}
          />

          {/* Client-side Article Toolbar (Font Sizing, Print, Sharing, and Body Content) */}
          <ArticleToolbarContainer
            title={article.title}
            subtitle={articleSubtitle}
            contentBlocks={article.content}
            featuredImage={article.featuredImage}
            slug={article.slug}
            dateBengali={article.publishedAtBengali}
            timeBengali={(() => {
              if (!article.publishedAt) return "";
              try {
                const d = new Date(article.publishedAt);
                return d.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit", hour12: true });
              } catch {
                return "";
              }
            })()}
            categoryName={article.category?.name}
            authorName={article.author?.name === "প্রতিবেদক" ? "নিজস্ব প্রতিবেদক" : article.author?.name}
          />

          {/* Tags Section */}
          {article.tags && article.tags.length > 0 && (
            <div className="my-6 pt-4 border-t border-[#E2E6EB] flex items-center gap-2 flex-wrap">
              <TagIcon className="w-4 h-4 text-[#0756A4]" />
              <span className="text-xs font-bold text-[#202124]">ট্যাগ:</span>
              {article.tags.map((tag) => (
                <Link
                  key={tag.slug}
                  href={`/tag/${tag.slug}`}
                  className="text-xs bg-[#f0f3f6] hover:bg-[#EAF2FB] hover:text-[#0756A4] text-[#626B75] px-2.5 py-1 rounded transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Author Card Box */}
          <div className="my-6 p-4 bg-[#f8f9fa] border border-[#E2E6EB] rounded-lg flex items-start gap-4">
            <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-gray-300">
              <Image
                src={article.author.avatar}
                alt={article.author.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/author/${article.author.slug}`}
                  className="font-bold text-sm text-[#0756A4] hover:underline"
                >
                  {article.author.name === "প্রতিবেদক" ? "নিজস্ব প্রতিবেদক" : article.author.name}
                </Link>
                <span className="text-xs text-gray-500">({article.author.role === "প্রতিবেদক" || !article.author.role ? "নিজস্ব প্রতিবেদক" : article.author.role})</span>
              </div>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                {article.author.bio}
              </p>
              <Link
                href={`/author/${article.author.slug}`}
                className="inline-block text-xs font-semibold text-[#087A43] hover:underline mt-2"
              >
                এই লেখকের সব সংবাদ &rarr;
              </Link>
            </div>
          </div>

          {/* Previous / Next Article Navigation (Real-time with small picture thumbnails, above ads) */}
          <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 border-t border-[#E2E6EB]">
            {prevArticle ? (
              <Link
                href={`/news/${prevArticle.slug}`}
                className="p-3 rounded-lg border border-[#E2E6EB] hover:border-[#0756A4] hover:bg-[#EAF2FB]/30 transition-all flex items-center gap-3 group bg-white shadow-2xs"
              >
                <div className="relative w-16 sm:w-20 aspect-[16/11] shrink-0 rounded overflow-hidden bg-gray-100 border border-gray-100">
                  <Image
                    src={getThumb(prevArticle)}
                    alt={prevArticle.title}
                    fill
                    sizes="(max-width: 640px) 64px, 80px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-semibold text-[#626B75] flex items-center gap-1 group-hover:text-[#0756A4] transition-colors mb-0.5">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    পূর্ববর্তী সংবাদ
                  </span>
                  <p className="text-xs sm:text-[13px] font-bold text-[#202124] line-clamp-2 leading-snug group-hover:text-[#0756A4] transition-colors">
                    {prevArticle.title}
                  </p>
                </div>
              </Link>
            ) : <div />}

            {nextArticle ? (
              <Link
                href={`/news/${nextArticle.slug}`}
                className="p-3 rounded-lg border border-[#E2E6EB] hover:border-[#0756A4] hover:bg-[#EAF2FB]/30 transition-all flex items-center justify-between gap-3 group bg-white shadow-2xs text-right sm:col-start-2"
              >
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-semibold text-[#626B75] flex items-center justify-end gap-1 group-hover:text-[#0756A4] transition-colors mb-0.5">
                    পরবর্তী সংবাদ
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  <p className="text-xs sm:text-[13px] font-bold text-[#202124] line-clamp-2 leading-snug group-hover:text-[#0756A4] transition-colors">
                    {nextArticle.title}
                  </p>
                </div>
                <div className="relative w-16 sm:w-20 aspect-[16/11] shrink-0 rounded overflow-hidden bg-gray-100 border border-gray-100">
                  <Image
                    src={getThumb(nextArticle)}
                    alt={nextArticle.title}
                    fill
                    sizes="(max-width: 640px) 64px, 80px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
            ) : null}
          </div>

          {/* Related News Section (Above Ads) */}
          {relatedArticles.length > 0 && (
            <div className="my-8 pt-4 border-t border-[#E2E6EB]">
              <h3 className="text-lg font-bold text-[#0756A4] mb-4 flex items-center gap-2">
                <span className="w-2 h-4 bg-[#087A43] inline-block rounded-xs" />
                সম্পর্কিত সংবাদ
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedArticles.map((rel) => (
                  <div key={rel.id} className="group">
                    <div className="relative aspect-[16/10] w-full rounded overflow-hidden mb-2 bg-gray-100">
                      <Image
                        src={getThumb(rel)}
                        alt={rel.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <Link
                      href={`/news/${rel.slug}`}
                      className="text-xs font-bold text-[#202124] group-hover:text-[#0756A4] line-clamp-2 leading-snug"
                    >
                      {rel.title}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* In-Article Advertisement Banner (Placed after all news, reactions, nav, and related items) */}
          <AdvertisementPlaceholder size="banner" className="my-8" />
        </article>

        {/* Sidebar Column */}
        <aside className="lg:col-span-4 space-y-6 article-sidebar">
          {/* Sidebar Ad */}
          <AdvertisementPlaceholder size="sidebar" />

          {/* Official Facebook Page Widget */}
          <FacebookPageWidget />

          {/* Latest News */}
          <div className="bg-white rounded-lg border border-[#E2E6EB] p-4 shadow-xs">
            <h3 className="font-bold text-base text-[#0756A4] border-b-2 border-[#0756A4] pb-2 mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#0756A4]" />
              সর্বশেষ খবর
            </h3>
            <div className="divide-y divide-[#E2E6EB]">
              {latestArticles.map((art) => (
                <LatestNewsItem key={art.id} article={art} />
              ))}
            </div>
          </div>

          {/* Popular News */}
          <div className="bg-white rounded-lg border border-[#E2E6EB] p-4 shadow-xs">
            <h3 className="font-bold text-base text-[#D62828] border-b-2 border-[#D62828] pb-2 mb-3 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-[#D62828]" />
              সর্বাধিক পঠিত
            </h3>
            <div>
              {popularArticles.map((art, idx) => (
                <PopularNewsItem key={art.id} article={art} rank={idx + 1} />
              ))}
            </div>
          </div>

          {/* Sticky Rectangle Ad */}
          <AdvertisementPlaceholder size="medium-rectangle" />
        </aside>
      </div>
    </div>
  );
}
