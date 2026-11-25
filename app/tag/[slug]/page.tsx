import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { getArticlesByTag } from "@/services/newsService";
import HorizontalNewsCard from "@/components/news/HorizontalNewsCard";
import AdvertisementPlaceholder from "@/components/news/AdvertisementPlaceholder";
import { Tag as TagIcon, ChevronRight } from "lucide-react";

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);

  return {
    title: `#${decoded} বিষয়ক সংবাদ | অর্থনীতি সংবাদ`,
    description: `${decoded} সম্পর্কিত প্রকাশিত সকল সংবাদ ও বিশ্লেষণ।`,
  };
}

export const dynamicParams = true;
export const revalidate = 60;

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);

  const articles = await getArticlesByTag(slug);

  return (
    <div className="space-y-6">
      <nav aria-label="ব্রেডক্রাম্ব" className="text-xs text-[#626B75] flex items-center gap-1.5">
        <Link href="/" className="hover:text-[#0756A4] transition-colors">
          প্রচ্ছদ
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="text-[#0756A4] font-semibold">ট্যাগ: #{decoded}</span>
      </nav>

      <div className="bg-white border-b-2 border-[#0756A4] rounded-lg p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TagIcon className="w-6 h-6 text-[#0756A4]" />
          <div>
            <h1 className="text-2xl font-extrabold text-[#0756A4]">
              #{decoded}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              এই ট্যাগ সংক্রান্ত প্রকাশিত সকল সংবাদ ({articles.length}টি প্রতিবেদন)
            </p>
          </div>
        </div>
      </div>

      <AdvertisementPlaceholder size="banner" />

      {articles.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#E2E6EB] p-8 text-center text-gray-500 shadow-xs">
          <p className="text-sm font-semibold mb-1">
            #{decoded} সম্পর্কিত কোনো সংবাদ পাওয়া যায়নি।
          </p>
          <Link href="/" className="text-xs text-[#0756A4] hover:underline">
            প্রচ্ছদে ফিরে যান &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((art) => (
            <HorizontalNewsCard key={art.id} article={art} />
          ))}
        </div>
      )}
    </div>
  );
}
