import React from "react";
import DOMPurify from "isomorphic-dompurify";
import { cleanNewsImageUrl } from "@/services/newsService";

interface Props {
  contentHtml: string;
  className?: string;
}

export default function WYSIWYGArticleContent({ contentHtml, className = "" }: Props) {
  let cleaned = contentHtml || "";
  cleaned = cleaned.replace(
    /(<img[^>]+src=["'])(?:https?:\/\/[^/"'\s]+)?\/?old_news_images\/([^"'\s]+)(["'][^>]*>)/gi,
    (_match, p1, filename, p3) => `${p1}${cleanNewsImageUrl(`old_news_images/${filename}`)}${p3}`
  );
  const sanitized = DOMPurify.sanitize(cleaned);

  return (
    <article
      className={`prose prose-lg max-w-none text-gray-800 leading-relaxed my-6 ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}

