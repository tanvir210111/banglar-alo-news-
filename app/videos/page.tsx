import React from "react";
import { Metadata } from "next";
import { getVideoItems } from "@/services/newsService";
import VideosClient from "./VideosClient";

export const metadata: Metadata = {
  title: "ভিডিও সংবাদ | অর্থনীতি সংবাদ",
  description: "অর্থনীতি সংবাদের মাঠপর্যায়ের সংবাদ ও বিশেষ ভিডিও প্রতিবেদন।",
};

export default async function VideosPage() {
  const videos = await getVideoItems();
  return <VideosClient videos={videos} />;
}
