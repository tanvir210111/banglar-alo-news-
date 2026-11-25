"use client";

import React, { useState } from "react";
import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";
import ArticleToolbar from "@/components/article/ArticleToolbar";
import PhotoCardModal from "@/components/news/PhotoCardModal";
import EpaperPrintModal from "@/components/article/EpaperPrintModal";
import AdvertisementPlaceholder from "@/components/news/AdvertisementPlaceholder";
import { ArticleContentBlock } from "@/types/news";
import { cleanNewsImageUrl } from "@/services/newsService";

interface ContainerProps {
  title: string;
  subtitle?: string;
  contentBlocks: ArticleContentBlock[] | string;
  featuredImage: {
    url: string;
    caption: string;
    credit: string;
    alt: string;
  };
  slug?: string;
  dateBengali?: string;
  timeBengali?: string;
  categoryName?: string;
  authorName?: string;
}

// Helper to accurately split HTML at 50% midpoint of paragraphs
function splitHtmlAtMidpoint(html: string): { firstPart: string; secondPart: string } {
  if (!html) return { firstPart: "", secondPart: "" };

  const pCloseRegex = /<\/p>/gi;
  const matches: number[] = [];
  let m;
  while ((m = pCloseRegex.exec(html)) !== null) {
    matches.push(m.index + 4);
  }

  if (matches.length >= 2) {
    const midIndex = Math.ceil(matches.length / 2);
    const splitPoint = matches[midIndex - 1];
    return {
      firstPart: html.slice(0, splitPoint),
      secondPart: html.slice(splitPoint),
    };
  }

  // Fallback for double <br>
  const brRegex = /(?:<br\s*\/?>\s*){2,}/gi;
  const brMatches: number[] = [];
  while ((m = brRegex.exec(html)) !== null) {
    brMatches.push(m.index + m[0].length);
  }
  if (brMatches.length >= 2) {
    const midIndex = Math.ceil(brMatches.length / 2);
    const splitPoint = brMatches[midIndex - 1];
    return {
      firstPart: html.slice(0, splitPoint),
      secondPart: html.slice(splitPoint),
    };
  }

  return { firstPart: html, secondPart: "" };
}

export default function ArticleToolbarContainer({
  title,
  subtitle,
  contentBlocks,
  featuredImage,
  slug,
  dateBengali,
  timeBengali,
  categoryName,
  authorName,
}: ContainerProps) {
  const [fontSizeLevel, setFontSizeLevel] = useState(0); // -1 (sm), 0 (base), 1 (lg), 2 (xl)
  const [isPhotoCardOpen, setIsPhotoCardOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const getFontSizeClass = () => {
    switch (fontSizeLevel) {
      case -1:
        return "text-sm leading-normal";
      case 1:
        return "text-lg leading-relaxed";
      case 2:
        return "text-xl leading-loose";
      default:
        return "text-base leading-relaxed";
    }
  };

  const hasRealImage = Boolean(
    featuredImage?.url &&
    featuredImage.url.trim() !== "" &&
    !featuredImage.url.includes("placeholder") &&
    !featuredImage.url.includes("logo.svg")
  );

  const imgUrl = hasRealImage ? cleanNewsImageUrl(featuredImage.url) : "";

  // Clean body to prevent duplicate image rendering if the featured image was also in the body HTML
  let cleanedBodyHtml = typeof contentBlocks === "string" ? contentBlocks : "";
  if (cleanedBodyHtml) {
    // Strip pasted background-color and background styling so text background remains clean & transparent
    cleanedBodyHtml = cleanedBodyHtml
      .replace(/background-color\s*:\s*[^;"]+;?/gi, "")
      .replace(/background\s*:\s*[^;"]+;?/gi, "");

    if (imgUrl && !imgUrl.includes("placeholder")) {
      const fileIdMatch = imgUrl.match(/([a-zA-Z0-9_-]+)\.(?:webp|jpg|jpeg|png|gif)/i);
      const fileId = fileIdMatch ? fileIdMatch[1] : "";

      if (fileId && fileId.length > 3) {
        const figRegex = new RegExp(
          `<figure[^>]*>(?:(?!<\\/figure>)[\\s\\S])*?${fileId}[\\s\\S]*?<\\/figure>`,
          "gi"
        );
        const imgRegex = new RegExp(
          `<img[^>]+src=["'][^"']*${fileId}[^"']*["'][^>]*\\/?>`,
          "gi"
        );
        cleanedBodyHtml = cleanedBodyHtml.replace(figRegex, "").replace(imgRegex, "");
      }

      const safeUrl = imgUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const figUrlRegex = new RegExp(
        `<figure[^>]*>(?:(?!<\\/figure>)[\\s\\S])*?${safeUrl}[\\s\\S]*?<\\/figure>`,
        "gi"
      );
      const imgUrlRegex = new RegExp(
        `<img[^>]+src=["']${safeUrl}["'][^>]*\\/?>`,
        "gi"
      );
      cleanedBodyHtml = cleanedBodyHtml.replace(figUrlRegex, "").replace(imgUrlRegex, "");
    }
  }

  return (
    <div>
      {/* Interactive Toolbar */}
      <ArticleToolbar
        fontSizeLevel={fontSizeLevel}
        onIncreaseFontSize={() => setFontSizeLevel((prev) => Math.min(prev + 1, 2))}
        onDecreaseFontSize={() => setFontSizeLevel((prev) => Math.max(prev - 1, -1))}
        onResetFontSize={() => setFontSizeLevel(0)}
        title={title}
        onOpenPhotoCard={() => {
          if (typeof window !== "undefined") {
            window.open(`/photocard?slug=${encodeURIComponent(slug || "")}`, "_blank");
          }
        }}
        onOpenPrint={() => setIsPrintModalOpen(true)}
      />

      {/* E-Paper Print Modal */}
      <EpaperPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title={title}
        subtitle={subtitle}
        contentHtml={cleanedBodyHtml}
        featuredImage={{
          url: imgUrl,
          caption: featuredImage.caption,
          credit: featuredImage.credit,
        }}
        dateBengali={dateBengali}
        timeBengali={timeBengali}
        categoryName={categoryName}
        authorName={authorName}
        slug={slug}
      />

      {/* Photo Card Generator Modal */}
      <PhotoCardModal
        isOpen={isPhotoCardOpen}
        onClose={() => setIsPhotoCardOpen(false)}
        title={title}
        imageUrl={hasRealImage && imgUrl ? imgUrl : "/images/brand-logo.png"}
        dateBengali={dateBengali}
        timeBengali={timeBengali}
        slug={slug}
        articleUrl={`https://www.orthonitysngbad.com/news/${slug}`}
      />

      {/* Featured Image - Only rendered if an actual featured image exists for this article */}
      {hasRealImage && imgUrl && (
        <div className="my-5 rounded-lg overflow-hidden bg-gray-100 border border-[#E2E6EB]">
          <div className="relative w-full min-h-[320px] sm:min-h-[420px] flex items-center justify-center bg-gray-50">
            <Image
              src={imgUrl}
              alt={featuredImage.alt || title}
              width={1200}
              height={675}
              priority
              unoptimized={!imgUrl.startsWith("/")}
              sizes="(max-width: 1024px) 100vw, 800px"
              className="w-full h-auto min-h-[320px] sm:min-h-[420px] max-h-[850px] object-cover transition-all"
            />
          </div>
          {(() => {
            const rawCredit = (featuredImage.credit || "").trim();
            const cleanCredit = rawCredit.replace(/^ছবি\s*:\s*/i, "").replace(/^photo\s*:\s*/i, "").trim();
            const hasDistinctCaption =
              featuredImage.caption &&
              featuredImage.caption.trim() !== "" &&
              featuredImage.caption.trim() !== title.trim();

            if (!hasDistinctCaption && !cleanCredit) return null;

            return (
              <div className="p-2.5 bg-gray-50 border-t border-gray-200 text-xs text-[#626B75] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                {hasDistinctCaption ? (
                  <span>{featuredImage.caption}</span>
                ) : <div />}
                {cleanCredit && (
                  <span className="font-semibold text-gray-500 shrink-0">
                    ছবি: {cleanCredit}
                  </span>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Article Body Content with Dynamic Font Scaling & 50% Mid-Article Banner Ad */}
      <div className={`article-body text-[#202124] space-y-4 ${getFontSizeClass()}`}>
        {typeof contentBlocks === "string" ? (
          (() => {
            const { firstPart, secondPart } = splitHtmlAtMidpoint(cleanedBodyHtml);
            return (
              <>
                <div
                  className="prose prose-lg max-w-none text-[#202124] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(firstPart) }}
                />

                {/* Always injected at ~50% midpoint of news paragraphs */}
                <div className="my-6 w-full not-prose">
                  <AdvertisementPlaceholder size="banner" className="my-0 w-full" />
                </div>

                {secondPart && (
                  <div
                    className="prose prose-lg max-w-none text-[#202124] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(secondPart) }}
                  />
                )}
              </>
            );
          })()
        ) : (
          (() => {
            const midIndex = Math.ceil(contentBlocks.length / 2);
            return contentBlocks.map((block, index) => {
              const isMid = index === midIndex - 1;
              let renderedBlock = null;

              if (block.type === "paragraph") {
                renderedBlock = (
                  <p key={index} className="text-[#202124]">
                    {block.text}
                  </p>
                );
              } else if (block.type === "heading") {
                renderedBlock = (
                  <h2
                    key={index}
                    className="text-xl sm:text-2xl font-bold text-[#0756A4] pt-3 pb-1 border-b border-gray-200"
                  >
                    {block.text}
                  </h2>
                );
              } else if (block.type === "quote") {
                renderedBlock = (
                  <blockquote
                    key={index}
                    className="my-4 border-l-4 border-[#087A43] pl-4 py-2 bg-[#EAF5EE] text-[#05407c] font-medium italic rounded-r"
                  >
                    {block.text}
                  </blockquote>
                );
              } else if (block.type === "image" && block.url) {
                if (block.url === imgUrl || (imgUrl && block.url.includes(imgUrl))) return null;
                renderedBlock = (
                  <div key={index} className="my-5 rounded overflow-hidden border border-gray-200 bg-gray-50">
                    <div className="relative aspect-[16/9] w-full">
                      <Image
                        src={block.url}
                        alt={block.caption || "প্রতিবেদন ছবি"}
                        fill
                        sizes="(max-width: 1024px) 100vw, 800px"
                        className="object-cover"
                      />
                    </div>
                    {block.caption && (
                      <p className="p-2 text-xs text-gray-600 italic text-center bg-gray-100">
                        {block.caption} {block.credit && `(ছবি: ${block.credit})`}
                      </p>
                    )}
                  </div>
                );
              } else if (block.type === "list" && block.items) {
                renderedBlock = (
                  <ul key={index} className="list-disc list-inside space-y-1.5 my-3 pl-2 text-gray-800">
                    {block.items.map((item, itemIdx) => (
                      <li key={itemIdx}>{item}</li>
                    ))}
                  </ul>
                );
              }

              return (
                <React.Fragment key={index}>
                  {renderedBlock}
                  {isMid && (
                    <div className="my-6 w-full not-prose">
                      <AdvertisementPlaceholder size="banner" className="my-0 w-full" />
                    </div>
                  )}
                </React.Fragment>
              );
            });
          })()
        )}
      </div>
    </div>
  );
}
