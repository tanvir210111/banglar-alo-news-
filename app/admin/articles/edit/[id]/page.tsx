"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ArticleEditRedirectPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    if (params?.id) {
      router.replace(`/admin/new-article?edit=${params.id}`);
    } else {
      router.replace("/admin/articles");
    }
  }, [params, router]);

  return (
    <div className="min-h-screen bg-[#F0F4FA] flex items-center justify-center text-gray-500 font-sans text-sm">
      এডিটর লোড হচ্ছে...
    </div>
  );
}

