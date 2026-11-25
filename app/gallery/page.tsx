import React from "react";
import { Metadata } from "next";
import { getGalleryItems } from "@/services/newsService";
import GalleryClient from "./GalleryClient";

export const metadata: Metadata = {
  title: "ছবি গ্যালারি | অর্থনীতি সংবাদ",
  description: "অর্থনীতি সংবাদের বিশেষ ফটো গ্যালারি - দেখুন বাংলাদেশ ও বিশ্বের সেরা সব ছবি।",
};

export default async function GalleryPage() {
  const items = await getGalleryItems();
  return <GalleryClient items={items} />;
}
