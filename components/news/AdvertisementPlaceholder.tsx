"use client";

import React from "react";

export interface AdProps {
  adId?: string;
  position?: string;
  size?: "leaderboard" | "medium-rectangle" | "banner" | "sidebar" | "square" | "video";
  className?: string;
  imageUrl?: string;
  videoUrl?: string;
  aspectRatio?: string;
  href?: string;
  altText?: string;
}

// Ads removed totally per user request - no placeholder boxes or blank spaces
export default function AdvertisementPlaceholder(_props: AdProps) {
  return null;
}
