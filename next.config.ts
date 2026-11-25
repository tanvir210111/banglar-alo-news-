import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentUpgrade: "security",
  } as any,
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/category/gram-gonjo",
        destination: "/category/accident",
        permanent: true,
      },
      {
        source: "/category/gramgonj",
        destination: "/category/accident",
        permanent: true,
      },
      {
        source: "/category/durghotona",
        destination: "/category/accident",
        permanent: true,
      },
      {
        source: "/category/durghatona",
        destination: "/category/accident",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
