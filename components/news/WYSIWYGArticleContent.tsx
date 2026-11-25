import React from "react";
import DOMPurify from "isomorphic-dompurify";

interface Props {
  contentHtml: string;
  className?: string;
}

export default function WYSIWYGArticleContent({ contentHtml, className = "" }: Props) {
  const sanitized = DOMPurify.sanitize(contentHtml);

  return (
    <article
      className={`prose prose-lg max-w-none text-gray-800 leading-relaxed my-6 ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}

