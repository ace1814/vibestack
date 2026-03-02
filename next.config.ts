import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow external images from any domain (OG images come from arbitrary URLs)
  images: {
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
};

export default nextConfig;
